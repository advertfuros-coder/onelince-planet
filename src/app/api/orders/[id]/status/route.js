// app/api/orders/[id]/status/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Order from "@/lib/db/models/Order";
import { verifyToken } from "@/lib/utils/auth";
import orderService from "@/lib/services/orderService";

/**
 * Update order status
 * PUT /api/orders/[id]/status
 */
export async function PUT(request, { params }) {
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
    const { status, trackingId, carrier, estimatedDelivery, description } =
      body;

    if (!status) {
      return NextResponse.json(
        { success: false, message: "Status is required" },
        { status: 400 }
      );
    }

    // Verify user has permission to update this order
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Check permissions
    const isSeller = order.items.some(
      (item) => item.seller.toString() === decoded.id
    );
    const isCustomer = order.customer.toString() === decoded.id;
    const isAdmin = decoded.role === "admin";

    if (!isSeller && !isCustomer && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to update this order" },
        { status: 403 }
      );
    }

    // Update status
    const result = await orderService.updateOrderStatus(id, status, {
      trackingId,
      carrier,
      estimatedDelivery,
      description,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      order: result.order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
