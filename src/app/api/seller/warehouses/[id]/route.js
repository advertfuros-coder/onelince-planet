import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Warehouse from "@/lib/db/models/Warehouse";
import { verifyToken } from "@/lib/utils/auth";
import mongoose from "mongoose";

// GET - Single Warehouse Details
export async function GET(request, { params }) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Seller access required" },
        { status: 403 }
      );
    }

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Warehouse ID" },
        { status: 400 }
      );
    }

    const warehouse = await Warehouse.findOne({
      _id: id,
      sellerId: decoded.userId,
    }).populate(
      "inventory.productId",
      "name images sku pricing.salePrice pricing.basePrice"
    );

    if (!warehouse) {
      return NextResponse.json(
        { success: false, message: "Warehouse not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, warehouse });
  } catch (error) {
    console.error("Warehouse GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update Warehouse
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Seller access required" },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();

    const warehouse = await Warehouse.findOneAndUpdate(
      { _id: id, sellerId: decoded.userId },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!warehouse) {
      return NextResponse.json(
        { success: false, message: "Warehouse not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Warehouse updated successfully",
      warehouse,
    });
  } catch (error) {
    console.error("Warehouse PUT Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete Warehouse
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Seller access required" },
        { status: 403 }
      );
    }

    const { id } = params;

    // Check if warehouse has stock before deleting?
    const warehouse = await Warehouse.findOne({
      _id: id,
      sellerId: decoded.userId,
    });

    if (!warehouse) {
      return NextResponse.json(
        { success: false, message: "Warehouse not found" },
        { status: 404 }
      );
    }

    if (warehouse.metrics.totalStock > 0 && warehouse.settings.isActive) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cannot delete active warehouse with existing stock. Transfer stock first.",
        },
        { status: 400 }
      );
    }

    await Warehouse.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Warehouse deleted successfully",
    });
  } catch (error) {
    console.error("Warehouse DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
