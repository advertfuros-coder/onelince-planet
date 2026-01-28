// app/api/seller/warehouses/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Warehouse from "@/lib/db/models/Warehouse";
import SellerSubscription from "@/lib/db/models/SellerSubscription";
import { verifyToken } from "@/lib/utils/auth";

// GET - Fetch all warehouses
export async function GET(request) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Seller access required" },
        { status: 403 },
      );
    }

    // Find seller profile first
    const Seller = require("@/lib/db/models/Seller").default;
    const sellerProfile = await Seller.findOne({ userId: decoded.userId });

    if (!sellerProfile) {
      return NextResponse.json(
        { success: false, message: "Seller profile not found" },
        { status: 404 },
      );
    }

    const warehouses = await Warehouse.find({ sellerId: sellerProfile._id })
      .populate("inventory.productId", "name images sku")
      .sort({ "settings.priority": -1, createdAt: -1 });

    // Calculate summary stats
    const stats = {
      total: warehouses.length,
      active: warehouses.filter((w) => w.settings.isActive).length,
      totalCapacity: warehouses.reduce((sum, w) => sum + w.capacity.total, 0),
      totalUsed: warehouses.reduce((sum, w) => sum + w.capacity.used, 0),
      totalProducts: warehouses.reduce(
        (sum, w) => sum + w.metrics.totalProducts,
        0,
      ),
      totalStock: warehouses.reduce((sum, w) => sum + w.metrics.totalStock, 0),
    };

    return NextResponse.json({
      success: true,
      warehouses,
      stats,
    });
  } catch (error) {
    console.error("Warehouses GET Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// POST - Create new warehouse
export async function POST(request) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Seller access required" },
        { status: 403 },
      );
    }

    // Find seller profile first
    const Seller = require("@/lib/db/models/Seller").default;
    const sellerProfile = await Seller.findOne({ userId: decoded.userId });

    if (!sellerProfile) {
      return NextResponse.json(
        { success: false, message: "Seller profile not found" },
        { status: 404 },
      );
    }

    // Check subscription limits
    const subscription = await SellerSubscription.findOne({
      sellerId: sellerProfile._id,
    });
    if (subscription && !subscription.canAddWarehouse()) {
      return NextResponse.json(
        {
          success: false,
          message: `Warehouse limit reached. Upgrade to add more warehouses.`,
          limit: subscription.features.maxWarehouses,
        },
        { status: 403 },
      );
    }

    const warehouseData = await request.json();

    // Create warehouse
    const warehouse = await Warehouse.create({
      ...warehouseData,
      sellerId: sellerProfile._id,
    });

    // Update subscription usage
    if (subscription) {
      subscription.usage.warehousesCreated += 1;
      await subscription.save();
    }

    return NextResponse.json({
      success: true,
      message: "Warehouse created successfully",
      warehouse,
    });
  } catch (error) {
    console.error("Warehouse POST Error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error.code === 11000
            ? "Warehouse code already exists"
            : "Server error",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
