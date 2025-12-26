// app/api/payment/webhook/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import razorpayService from "@/lib/services/razorpayService";
import Order from "@/lib/db/models/Order";

/**
 * Razorpay Webhook Handler
 * POST /api/payment/webhook
 *
 * Handles webhook events from Razorpay
 */
export async function POST(request) {
  try {
    await connectDB();

    // Get webhook signature
    const signature = request.headers.get("x-razorpay-signature");

    // Get raw body
    const body = await request.json();

    // Verify webhook signature
    const isValid = razorpayService.verifyWebhookSignature(body, signature);

    if (!isValid) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 }
      );
    }

    const event = body.event;
    const payload = body.payload.payment?.entity || body.payload.order?.entity;

    console.log("Webhook event received:", event);

    // Handle different webhook events
    switch (event) {
      case "payment.authorized":
        await handlePaymentAuthorized(payload);
        break;

      case "payment.captured":
        await handlePaymentCaptured(payload);
        break;

      case "payment.failed":
        await handlePaymentFailed(payload);
        break;

      case "refund.created":
        await handleRefundCreated(payload);
        break;

      case "refund.processed":
        await handleRefundProcessed(payload);
        break;

      case "refund.failed":
        await handleRefundFailed(payload);
        break;

      case "order.paid":
        await handleOrderPaid(payload);
        break;

      default:
        console.log("Unhandled webhook event:", event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { success: false, message: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Webhook event handlers

async function handlePaymentAuthorized(payment) {
  console.log("Payment authorized:", payment.id);

  // Find order by Razorpay order ID
  const order = await Order.findOne({
    "payment.razorpayOrderId": payment.order_id,
  });

  if (order) {
    order.timeline.push({
      status: "payment_authorized",
      description: "Payment authorized - waiting for capture",
      timestamp: new Date(),
    });
    await order.save();
  }
}

async function handlePaymentCaptured(payment) {
  console.log("Payment captured:", payment.id);

  const order = await Order.findOne({
    "payment.razorpayOrderId": payment.order_id,
  });

  if (order) {
    order.payment.status = "paid";
    order.payment.transactionId = payment.id;
    order.payment.paidAt = new Date();

    if (order.status === "pending") {
      order.status = "confirmed";
    }

    order.timeline.push({
      status: "payment_captured",
      description: `Payment of ₹${payment.amount / 100} captured successfully`,
      timestamp: new Date(),
    });

    await order.save();
  }
}

async function handlePaymentFailed(payment) {
  console.log("Payment failed:", payment.id);

  const order = await Order.findOne({
    "payment.razorpayOrderId": payment.order_id,
  });

  if (order) {
    order.payment.status = "failed";
    order.payment.failureReason = payment.error_description;

    order.timeline.push({
      status: "payment_failed",
      description: `Payment failed: ${payment.error_description}`,
      timestamp: new Date(),
    });

    await order.save();
  }
}

async function handleRefundCreated(refund) {
  console.log("Refund created:", refund.id);

  const order = await Order.findOne({
    "payment.transactionId": refund.payment_id,
  });

  if (order) {
    order.payment.refunds = order.payment.refunds || [];
    order.payment.refunds.push({
      refundId: refund.id,
      amount: refund.amount / 100,
      status: "created",
      createdAt: new Date(),
    });

    order.timeline.push({
      status: "refund_initiated",
      description: `Refund of ₹${refund.amount / 100} initiated`,
      timestamp: new Date(),
    });

    await order.save();
  }
}

async function handleRefundProcessed(refund) {
  console.log("Refund processed:", refund.id);

  const order = await Order.findOne({
    "payment.transactionId": refund.payment_id,
  });

  if (order) {
    // Update refund status
    const refundRecord = order.payment.refunds?.find(
      (r) => r.refundId === refund.id
    );
    if (refundRecord) {
      refundRecord.status = "processed";
      refundRecord.processedAt = new Date();
    }

    order.payment.status = "refunded";

    order.timeline.push({
      status: "refund_completed",
      description: `Refund of ₹${refund.amount / 100} processed successfully`,
      timestamp: new Date(),
    });

    await order.save();
  }
}

async function handleRefundFailed(refund) {
  console.log("Refund failed:", refund.id);

  const order = await Order.findOne({
    "payment.transactionId": refund.payment_id,
  });

  if (order) {
    const refundRecord = order.payment.refunds?.find(
      (r) => r.refundId === refund.id
    );
    if (refundRecord) {
      refundRecord.status = "failed";
      refundRecord.failedAt = new Date();
    }

    order.timeline.push({
      status: "refund_failed",
      description: `Refund of ₹${refund.amount / 100} failed`,
      timestamp: new Date(),
    });

    await order.save();
  }
}

async function handleOrderPaid(orderData) {
  console.log("Order paid:", orderData.id);

  const order = await Order.findOne({
    "payment.razorpayOrderId": orderData.id,
  });

  if (order && order.status === "pending") {
    order.status = "confirmed";
    order.timeline.push({
      status: "order_paid",
      description: "Order payment completed",
      timestamp: new Date(),
    });
    await order.save();
  }
}
