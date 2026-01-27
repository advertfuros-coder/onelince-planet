// app/api/webhooks/ekart/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Order from "@/lib/db/models/Order";

/**
 * Ekart Webhook Handler
 * Receives tracking updates from Ekart and updates order status
 */
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    console.log("📦 Ekart webhook received:", body);

    const {
      tracking_id,
      status,
      current_status,
      delivered_at,
      out_for_delivery_at,
    } = body;

    if (!tracking_id) {
      return NextResponse.json(
        { success: false, message: "Missing tracking_id" },
        { status: 400 },
      );
    }

    // Find order by tracking ID
    const order = await Order.findOne({ "shipping.trackingId": tracking_id });

    if (!order) {
      console.log(`⚠️ Order not found for tracking ID: ${tracking_id}`);
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    // Map Ekart status to our order status
    const statusMap = {
      PICKED_UP: "shipped",
      IN_TRANSIT: "shipped",
      OUT_FOR_DELIVERY: "out_for_delivery",
      DELIVERED: "delivered",
      RETURNED: "returned",
      CANCELLED: "cancelled",
      RTO: "returned",
    };

    const ekartStatus = status || current_status;
    const newStatus = statusMap[ekartStatus];

    if (newStatus && order.status !== newStatus) {
      const oldStatus = order.status;
      order.status = newStatus;

      // Update shipping info
      if (newStatus === "delivered" && delivered_at) {
        order.shipping.deliveredAt = new Date(delivered_at);
      }

      if (newStatus === "out_for_delivery" && out_for_delivery_at) {
        order.shipping.outForDeliveryAt = new Date(out_for_delivery_at);
      }

      // Add to status history
      if (!order.statusHistory) {
        order.statusHistory = [];
      }

      order.statusHistory.push({
        status: newStatus,
        timestamp: new Date(),
        note: `Updated via Ekart webhook: ${ekartStatus}`,
        updatedBy: "system",
      });

      await order.save();

      console.log(
        `✅ Order ${order.orderNumber} status updated: ${oldStatus} → ${newStatus}`,
      );
    }

    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("❌ Ekart webhook error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
