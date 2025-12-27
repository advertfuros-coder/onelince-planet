// app/api/seller/inventory/logs/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
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

    const logs = await InventoryLog.find({ sellerId: decoded.userId })
      .populate("productId", "name sku images")
      .populate("warehouseId", "name code")
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error) {
    console.error("Inventory Logs GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
