// app/api/orders/[id]/tracking/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Order from "@/lib/db/models/Order";
import { verifyToken } from "@/lib/utils/auth";
import ekartService from "@/lib/services/ekartService";

/**
 * Get real-time tracking information for an order
 */
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    // Auth check
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // Get Order
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    // Verify ownership (customer can only see their own orders)
    if (
      decoded.role === "customer" &&
      order.customer.toString() !== decoded.userId
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    // If no tracking ID, return basic order info
    if (!order.shipping?.trackingId) {
      return NextResponse.json({
        success: true,
        order: {
          orderNumber: order.orderNumber,
          status: order.status,
          createdAt: order.createdAt,
          estimatedDelivery: order.estimatedDelivery,
        },
        tracking: null,
        message: "Shipment not yet created",
      });
    }

    // Get live tracking from Ekart
    try {
      const trackingData = await ekartService.trackShipment(
        order.shipping.trackingId,
      );

      return NextResponse.json({
        success: true,
        order: {
          orderNumber: order.orderNumber,
          status: order.status,
          createdAt: order.createdAt,
          shippedAt: order.shipping.shippedAt,
          deliveredAt: order.shipping.deliveredAt,
          trackingId: order.shipping.trackingId,
          carrier: order.shipping.carrier,
        },
        tracking: trackingData,
        statusHistory: order.statusHistory || [],
      });
    } catch (trackingError) {
      console.error("Tracking error:", trackingError);

      // Return order info even if tracking fails
      return NextResponse.json({
        success: true,
        order: {
          orderNumber: order.orderNumber,
          status: order.status,
          createdAt: order.createdAt,
          shippedAt: order.shipping.shippedAt,
          deliveredAt: order.shipping.deliveredAt,
          trackingId: order.shipping.trackingId,
          carrier: order.shipping.carrier,
        },
        tracking: null,
        statusHistory: order.statusHistory || [],
        message: "Live tracking temporarily unavailable",
      });
    }
  } catch (error) {
    console.error("Tracking API error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
