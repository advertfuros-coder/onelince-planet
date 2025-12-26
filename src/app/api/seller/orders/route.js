// app/api/seller/orders/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Order from "@/lib/db/models/Order";
import { verifyToken } from "@/lib/utils/auth";

/**
 * Get seller's orders
 * GET /api/seller/orders
 */
export async function GET(request) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find orders where seller has items
    const orders = await Order.find({
      "items.seller": decoded.id,
    })
      .populate("customer", "name email phone")
      .populate("items.product", "name images sku")
      .sort({ createdAt: -1 })
      .lean();

    // Filter items to show only seller's items
    const filteredOrders = orders.map((order) => ({
      ...order,
      items: order.items.filter(
        (item) => item.seller.toString() === decoded.id
      ),
    }));

    return NextResponse.json({
      success: true,
      orders: filteredOrders,
      total: filteredOrders.length,
    });
  } catch (error) {
    console.error("Get seller orders error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
