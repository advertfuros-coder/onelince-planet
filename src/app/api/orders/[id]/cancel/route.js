// app/api/orders/[id]/cancel/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Order from "@/lib/db/models/Order";
import { verifyToken } from "@/lib/utils/auth";
import orderService from "@/lib/services/orderService";

/**
 * Cancel order
 * POST /api/orders/[id]/cancel
 */
export async function POST(request, { params }) {
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

    const { id } = params;
    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json(
        { success: false, message: "Cancellation reason is required" },
        { status: 400 }
      );
    }

    // Verify user has permission to cancel this order
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const isSeller = order.items.some(
      (item) => item.seller.toString() === decoded.id
    );
    const isCustomer = order.customer.toString() === decoded.id;
    const isAdmin = decoded.role === "admin";

    if (!isSeller && !isCustomer && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to cancel this order" },
        { status: 403 }
      );
    }

    const cancelledBy = isCustomer ? "customer" : isSeller ? "seller" : "admin";

    // Cancel order
    const result = await orderService.cancelOrder(id, reason, cancelledBy);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
      order: result.order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
