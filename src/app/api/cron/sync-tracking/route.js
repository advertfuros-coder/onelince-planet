// app/api/cron/sync-tracking/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Order from "@/lib/db/models/Order";
import ekartService from "@/lib/services/ekartService";

/**
 * Cron job to sync tracking status for all active shipments
 * Should be called every 30 minutes or hourly
 */
export async function GET(request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "your-secret-key";

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectDB();

    // Find all orders that are shipped but not delivered
    const activeOrders = await Order.find({
      "shipping.trackingId": { $exists: true, $ne: null },
      status: { $in: ["shipped", "out_for_delivery"] },
    }).limit(100); // Process 100 orders at a time

    console.log(`🔄 Syncing tracking for ${activeOrders.length} orders...`);

    let updated = 0;
    let errors = 0;

    for (const order of activeOrders) {
      try {
        // Get tracking info from Ekart
        const trackingData = await ekartService.trackShipment(
          order.shipping.trackingId,
        );

        console.log(`📦 Tracking data for ${order.orderNumber}:`, trackingData);

        // Map Ekart status to our status
        const statusMap = {
          PICKED_UP: "shipped",
          IN_TRANSIT: "shipped",
          OUT_FOR_DELIVERY: "out_for_delivery",
          DELIVERED: "delivered",
          RETURNED: "returned",
          CANCELLED: "cancelled",
          RTO: "returned",
        };

        const ekartStatus =
          trackingData?.status || trackingData?.current_status;
        const newStatus = statusMap[ekartStatus];

        if (newStatus && order.status !== newStatus) {
          const oldStatus = order.status;
          order.status = newStatus;

          // Update delivery timestamp
          if (newStatus === "delivered" && trackingData.delivered_at) {
            order.shipping.deliveredAt = new Date(trackingData.delivered_at);
          }

          if (
            newStatus === "out_for_delivery" &&
            trackingData.out_for_delivery_at
          ) {
            order.shipping.outForDeliveryAt = new Date(
              trackingData.out_for_delivery_at,
            );
          }

          // Add to status history
          if (!order.statusHistory) {
            order.statusHistory = [];
          }

          order.statusHistory.push({
            status: newStatus,
            timestamp: new Date(),
            note: `Auto-synced from Ekart: ${ekartStatus}`,
            updatedBy: "system",
          });

          await order.save();
          updated++;

          console.log(`✅ ${order.orderNumber}: ${oldStatus} → ${newStatus}`);
        }

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`❌ Error syncing ${order.orderNumber}:`, error.message);
        errors++;
      }
    }

    console.log(`✅ Sync complete: ${updated} updated, ${errors} errors`);

    return NextResponse.json({
      success: true,
      processed: activeOrders.length,
      updated,
      errors,
    });
  } catch (error) {
    console.error("❌ Tracking sync error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
