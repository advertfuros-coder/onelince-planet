// app/api/orders/[id]/return/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Order from "@/lib/db/models/Order";
import { verifyToken } from "@/lib/utils/auth";
import orderService from "@/lib/services/orderService";

/**
 * Request return
 * POST /api/orders/[id]/return
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
    const { reason, title, description, images } = body;

    if (!reason || !title) {
      return NextResponse.json(
        { success: false, message: "Reason and title are required" },
        { status: 400 }
      );
    }

    // Verify this is customer's order
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    if (order.customer.toString() !== decoded.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Request return
    const result = await orderService.requestReturn(id, {
      reason,
      title,
      description,
      images,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Return request submitted successfully",
      order: result.order,
    });
  } catch (error) {
    console.error("Return request error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Process return request (seller/admin)
 * PUT /api/orders/[id]/return
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
    const { action, reason, pickupDate, refundAmount } = body; // action: 'approved' or 'rejected'

    if (!action || !["approved", "rejected"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid action (approved/rejected) is required",
        },
        { status: 400 }
      );
    }

    // Verify user is seller or admin
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
    const isAdmin = decoded.role === "admin";

    if (!isSeller && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Process return
    const result = await orderService.processReturnRequest(id, action, {
      reason,
      pickupDate,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 }
      );
    }

    // If approved and refund amount provided, process refund
    if (action === "approved" && refundAmount) {
      await orderService.processRefund(
        result.order,
        refundAmount,
        "Return approved"
      );
    }

    return NextResponse.json({
      success: true,
      message: `Return request ${action} successfully`,
      order: result.order,
    });
  } catch (error) {
    console.error("Process return error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
