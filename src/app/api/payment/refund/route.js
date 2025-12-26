// app/api/payment/refund/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { verifyToken } from "@/lib/utils/auth";
import razorpayService from "@/lib/services/razorpayService";
import Order from "@/lib/db/models/Order";
import User from "@/lib/db/models/User";
import msg91Service from "@/lib/services/msg91";
import emailService from "@/lib/services/emailService";

/**
 * Process refund
 * POST /api/payment/refund
 */
export async function POST(request) {
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

    const body = await request.json();
    const { orderId, amount, reason } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    // Get order
    const order = await Order.findById(orderId).populate(
      "customer",
      "name email phone"
    );

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Check permissions (seller, admin, or customer for their own order)
    const isSeller = order.items.some(
      (item) => item.seller.toString() === decoded.id
    );
    const isCustomer = order.customer._id.toString() === decoded.id;
    const isAdmin = decoded.role === "admin";

    if (!isSeller && !isCustomer && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to refund this order" },
        { status: 403 }
      );
    }

    // Check if payment exists and was successful
    if (order.payment.status !== "paid") {
      return NextResponse.json(
        { success: false, message: "Order payment was not successful" },
        { status: 400 }
      );
    }

    if (!order.payment.transactionId) {
      return NextResponse.json(
        { success: false, message: "No payment transaction found" },
        { status: 400 }
      );
    }

    // Check if already refunded
    if (order.payment.status === "refunded") {
      return NextResponse.json(
        { success: false, message: "Order already refunded" },
        { status: 400 }
      );
    }

    // Process refund through Razorpay
    const refundAmount = amount || order.pricing.total;
    const result = await razorpayService.refundPayment(
      order.payment.transactionId,
      refundAmount,
      {
        order_id: orderId,
        reason: reason || "Refund requested",
      }
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Refund processing failed",
          error: result.error,
        },
        { status: 500 }
      );
    }

    // Update order
    order.payment.refunds = order.payment.refunds || [];
    order.payment.refunds.push({
      refundId: result.refund.id,
      amount: result.refund.amount / 100,
      status: result.refund.status,
      createdAt: new Date(),
      reason: reason || "Refund requested",
    });

    // If full refund, update payment status
    if (refundAmount >= order.pricing.total) {
      order.payment.status = "refunded";
      order.status = "refunded";
    }

    order.timeline.push({
      status: "refund_initiated",
      description: `Refund of ₹${refundAmount} initiated${
        reason ? ": " + reason : ""
      }`,
      timestamp: new Date(),
    });

    await order.save();

    // Send refund notification
    try {
      await msg91Service.notifyRefundProcessed(
        order,
        order.customer,
        refundAmount
      );
    } catch (notifError) {
      console.error("Refund notification error:", notifError);
    }

    return NextResponse.json({
      success: true,
      message: "Refund initiated successfully",
      refund: {
        id: result.refund.id,
        amount: result.refund.amount / 100,
        status: result.refund.status,
      },
    });
  } catch (error) {
    console.error("Refund error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Get refund details
 * GET /api/payment/refund?orderId=xxx
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

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);

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
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      refunds: order.payment.refunds || [],
      paymentStatus: order.payment.status,
    });
  } catch (error) {
    console.error("Get refund error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
