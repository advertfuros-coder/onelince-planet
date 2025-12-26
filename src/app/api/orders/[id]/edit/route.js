// app/api/orders/[id]/edit/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Order from "@/lib/db/models/Order";
import { verifyToken } from "@/lib/utils/auth";
import orderService from "@/lib/services/orderService";

/**
 * Edit order (before fulfillment)
 * PUT /api/orders/[id]/edit
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
    const { shippingAddress, notes } = body;

    // Verify user has permission to edit
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const isCustomer = order.customer.toString() === decoded.id;
    const isSeller = order.items.some(
      (item) => item.seller.toString() === decoded.id
    );
    const isAdmin = decoded.role === "admin";

    if (!isCustomer && !isSeller && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Edit order
    const result = await orderService.editOrder(id, {
      shippingAddress,
      notes,
      addedBy: isCustomer ? "customer" : isSeller ? "seller" : "admin",
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      order: result.order,
    });
  } catch (error) {
    console.error("Edit order error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
