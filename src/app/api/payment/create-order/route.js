// app/api/payment/create-order/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { verifyToken } from "@/lib/utils/auth";
import razorpayService from "@/lib/services/razorpayService";
import Order from "@/lib/db/models/Order";

/**
 * Create Razorpay order
 * POST /api/payment/create-order
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
    const { orderId, amount, currency = "INR" } = body;

    if (!orderId || !amount) {
      return NextResponse.json(
        { success: false, message: "Order ID and amount are required" },
        { status: 400 }
      );
    }

    // Verify order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    if (order.customer.toString() !== decoded.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to access this order" },
        { status: 403 }
      );
    }

    // Verify amount matches order total
    if (Math.abs(order.pricing.total - amount) > 0.01) {
      return NextResponse.json(
        { success: false, message: "Amount mismatch" },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const result = await razorpayService.createOrder(
      amount,
      currency,
      `order_${orderId}`,
      {
        order_id: orderId,
        customer_id: decoded.id,
      }
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to create payment order",
          error: result.error,
        },
        { status: 500 }
      );
    }

    // Update order with Razorpay order ID
    order.payment.razorpayOrderId = result.orderId;
    await order.save();

    return NextResponse.json({
      success: true,
      razorpayOrderId: result.orderId,
      amount: result.amount,
      currency: result.currency,
      keyId: process.env.RAZORPAY_KEY_ID, // For frontend
    });
  } catch (error) {
    console.error("Create payment order error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
