// app/api/payment/verify/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { verifyToken } from "@/lib/utils/auth";
import razorpayService from "@/lib/services/razorpayService";
import Order from "@/lib/db/models/Order";
import User from "@/lib/db/models/User";
import msg91Service from "@/lib/services/msg91";
import emailService from "@/lib/services/emailService";

/**
 * Verify Razorpay payment
 * POST /api/payment/verify
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
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } =
      body;

    if (
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature ||
      !orderId
    ) {
      return NextResponse.json(
        { success: false, message: "Missing payment details" },
        { status: 400 }
      );
    }

    // Verify signature
    const isValid = razorpayService.verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Get payment details from Razorpay
    const paymentResult = await razorpayService.getPayment(razorpayPaymentId);
    if (!paymentResult.success) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch payment details" },
        { status: 500 }
      );
    }

    const payment = paymentResult.payment;

    // Update order with payment details
    const order = await Order.findById(orderId)
      .populate("customer", "name email phone")
      .populate("items.seller", "name email phone businessName");

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    if (order.customer._id.toString() !== decoded.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update payment details
    order.payment.transactionId = razorpayPaymentId;
    order.payment.status = "paid";
    order.payment.paidAt = new Date();
    order.payment.razorpayOrderId = razorpayOrderId;
    order.payment.method = payment.method; // card, netbanking, upi, wallet
    order.payment.paymentDetails = {
      email: payment.email,
      contact: payment.contact,
      method: payment.method,
      bank: payment.bank,
      wallet: payment.wallet,
      vpa: payment.vpa,
      cardId: payment.card_id,
    };

    // Update order status
    if (order.status === "pending") {
      order.status = "confirmed";
    }

    order.timeline.push({
      status: "payment_completed",
      description: `Payment of ₹${order.pricing.total} completed via ${payment.method}`,
      timestamp: new Date(),
    });

    await order.save();

    // Send notifications
    try {
      // Customer notifications
      await msg91Service.notifyOrderConfirmed(order, order.customer);
      await emailService.sendOrderConfirmation(order, order.customer);

      // Seller notifications
      const uniqueSellers = [
        ...new Set(order.items.map((item) => item.seller._id.toString())),
      ];
      for (const sellerId of uniqueSellers) {
        const seller = order.items.find(
          (item) => item.seller._id.toString() === sellerId
        ).seller;
        await msg91Service.notifySellerNewOrder(order, seller);
        await emailService.sendSellerNewOrder(order, seller);
      }
    } catch (notifError) {
      console.error("Notification error:", notifError);
      // Don't fail payment verification if notifications fail
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.payment.status,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
