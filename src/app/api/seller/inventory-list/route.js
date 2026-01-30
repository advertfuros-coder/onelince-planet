// app/api/seller/inventory-list/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Product from "@/lib/db/models/Product";
import Warehouse from "@/lib/db/models/Warehouse";
import Seller from "@/lib/db/models/Seller";
import { verifyToken } from "@/lib/utils/auth";

/**
 * Dedicated API for Inventory List Page
 * GET /api/seller/inventory-list
 * Optimized for the inventory management page with warehouse breakdown
 */
export async function GET(request) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // Get seller profile
    const seller = await Seller.findOne({ userId: decoded.userId });
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller profile not found" },
        { status: 404 },
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const warehouseFilter = searchParams.get("warehouse");
    const stockFilter = searchParams.get("stockFilter"); // low, out, all

    // Build product query
    let productQuery = { sellerId: decoded.userId, isDraft: { $ne: true } };

    if (search) {
      productQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { "inventory.sku": { $regex: search, $options: "i" } },
      ];
    }

    // Stock level filters
    if (stockFilter === "low") {
      productQuery.$expr = {
        $lte: ["$inventory.stock", "$inventory.lowStockThreshold"],
      };
    } else if (stockFilter === "out") {
      productQuery["inventory.stock"] = 0;
    }

    // Fetch products with inventory data
    const products = await Product.find(productQuery)
      .select("name sku inventory images category pricing")
      .sort({ "inventory.stock": 1 }) // Show low stock first
      .lean();

    // Fetch all warehouses for this seller
    const warehouses = await Warehouse.find({
      sellerId: decoded.userId,
    })
      .select("name code location inventory")
      .lean();

    // Build inventory data with warehouse breakdown
    const inventoryData = products.map((p) => {
      // Get warehouse breakdown for this product
      const warehouseBreakdown = warehouses.map((wh) => {
        const warehouseItem = wh.inventory?.find(
          (inv) =>
            inv.productId && inv.productId.toString() === p._id.toString(),
        );

        return {
          warehouseId: wh._id,
          warehouseName: wh.name,
          warehouseCode: wh.code,
          quantity: warehouseItem ? warehouseItem.quantity : 0,
          location: wh.location,
        };
      });

      // Calculate total stock from warehouses
      const warehouseTotalStock = warehouseBreakdown.reduce(
        (sum, wh) => sum + wh.quantity,
        0,
      );

      return {
        _id: p._id,
        name: p.name,
        sku: p.sku || p.inventory?.sku || "N/A",
        category: p.category,
        image: p.images?.[0]?.url,
        totalStock: p.inventory?.stock || 0,
        warehouseTotalStock, // Stock sum from warehouses
        lowStockThreshold: p.inventory?.lowStockThreshold || 10,
        trackInventory: p.inventory?.trackInventory !== false,
        warehouseBreakdown,
        pricing: p.pricing,
        // Stock status
        isLowStock:
          (p.inventory?.stock || 0) <= (p.inventory?.lowStockThreshold || 10),
        isOutOfStock: (p.inventory?.stock || 0) === 0,
      };
    });

    // Filter by warehouse if specified
    let filteredInventory = inventoryData;
    if (warehouseFilter && warehouseFilter !== "all") {
      filteredInventory = inventoryData.filter((item) =>
        item.warehouseBreakdown.some(
          (wh) =>
            wh.warehouseId.toString() === warehouseFilter && wh.quantity > 0,
        ),
      );
    }

    // Calculate comprehensive stats
    const stats = {
      totalProducts: inventoryData.length,
      totalUnits: inventoryData.reduce((sum, item) => sum + item.totalStock, 0),
      lowStockItems: inventoryData.filter((item) => item.isLowStock).length,
      outOfStock: inventoryData.filter((item) => item.isOutOfStock).length,
      totalWarehouses: warehouses.length,
      // Calculate total stock value (using base price)
      stockValue: inventoryData.reduce(
        (sum, item) => sum + item.totalStock * (item.pricing?.basePrice || 0),
        0,
      ),
      // Warehouse-wise stock distribution
      warehouseDistribution: warehouses.map((wh) => ({
        warehouseId: wh._id,
        name: wh.name,
        totalUnits:
          wh.inventory?.reduce((sum, inv) => sum + (inv.quantity || 0), 0) || 0,
        productCount: wh.inventory?.length || 0,
      })),
    };

    return NextResponse.json({
      success: true,
      inventory: filteredInventory,
      warehouses: warehouses.map((wh) => ({
        _id: wh._id,
        name: wh.name,
        code: wh.code,
        location: wh.location,
      })),
      stats,
    });
  } catch (error) {
    console.error("❌ Inventory List API error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
