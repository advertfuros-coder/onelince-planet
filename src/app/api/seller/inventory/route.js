// app/api/seller/inventory/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Product from "@/lib/db/models/Product";
import Warehouse from "@/lib/db/models/Warehouse";
import InventoryLog from "@/lib/db/models/InventoryLog";
import { verifyToken } from "@/lib/utils/auth";

export async function GET(request) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get("warehouseId");
    const search = searchParams.get("search") || "";

    // Query products
    let query = { sellerId: decoded.userId, isDraft: { $ne: true } };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(query)
      .select("name sku inventory images category")
      .lean();

    // Fetch warehouses for this seller
    const warehouses = await Warehouse.find({
      sellerId: decoded.userId,
    }).lean();

    // Construct inventory data
    const inventoryData = products.map((p) => {
      const warehouseStock = warehouses.map((w) => {
        const item = w.inventory?.find(
          (inv) => inv.productId.toString() === p._id.toString()
        );
        return {
          warehouseId: w._id,
          warehouseName: w.name,
          quantity: item ? item.quantity : 0,
        };
      });

      return {
        _id: p._id,
        name: p.name,
        sku: p.sku || "N/A",
        category: p.category,
        image: p.images?.[0]?.url,
        totalStock: p.inventory?.stock || 0,
        lowStockThreshold: p.inventory?.lowStockThreshold || 10,
        warehouseBreakdown: warehouseStock,
      };
    });

    return NextResponse.json({
      success: true,
      inventory: inventoryData,
      warehouses: warehouses.map((w) => ({ _id: w._id, name: w.name })),
    });
  } catch (error) {
    console.error("Inventory GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId, warehouseId, type, quantity, reason } =
      await request.json();

    const product = await Product.findById(productId);
    const warehouse = await Warehouse.findById(warehouseId);

    if (!product || !warehouse) {
      return NextResponse.json(
        { success: false, message: "Product or Warehouse not found" },
        { status: 404 }
      );
    }

    const prevStock = product.inventory?.stock || 0;

    // Update Warehouse Inventory
    await warehouse.updateInventory(
      productId,
      quantity,
      type === "addition" ? "add" : "subtract"
    );

    // Sync Product total stock
    const allWarehouses = await Warehouse.find({ sellerId: decoded.userId });
    let newTotalStock = 0;
    allWarehouses.forEach((wh) => {
      const item = wh.inventory.find(
        (inv) => inv.productId.toString() === productId
      );
      if (item) newTotalStock += item.quantity;
    });

    product.inventory.stock = newTotalStock;
    await product.save();

    // Log the change
    await InventoryLog.create({
      sellerId: decoded.userId,
      productId,
      warehouseId,
      type,
      quantity,
      previousStock: prevStock,
      newStock: newTotalStock,
      reason,
      performedBy: decoded.userId,
    });

    return NextResponse.json({
      success: true,
      message: "Inventory updated and synced",
      newTotalStock,
    });
  } catch (error) {
    console.error("Inventory POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
