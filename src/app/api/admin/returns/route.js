// app/api/admin/returns/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Order from "@/lib/db/models/Order";
import { verifyToken } from "@/lib/utils/auth";
import ekartService from "@/lib/services/ekartService";

/**
 * Get all return requests for admin
 * GET /api/admin/returns
 */
export async function GET(request) {
  try {
    await connectDB();

    // Auth check
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // Get all orders with return requests
    const orders = await Order.find({
      returnRequest: { $exists: true, $ne: null },
    })
      .populate("customer", "name email phone")
      .populate("items.seller", "businessInfo.businessName")
      .sort({ "returnRequest.requestedAt": -1 });

    // Format return data
    const returns = orders.map((order) => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      customer: {
        name: order.customer?.name || order.shippingAddress?.name,
        email: order.customer?.email,
        phone: order.shippingAddress?.phone,
      },
      seller:
        order.items[0]?.seller?.businessInfo?.businessName || "Unknown Seller",
      returnRequest: order.returnRequest,
      orderTotal: order.pricing?.total,
      orderDate: order.createdAt,
      deliveredAt: order.shipping?.deliveredAt,
      returnTrackingId: order.returnShipping?.trackingId,
      returnStatus: order.returnShipping?.status,
      status: order.status,
    }));

    return NextResponse.json({
      success: true,
      returns,
      stats: {
        total: returns.length,
        requested: returns.filter((r) => r.returnRequest.status === "requested")
          .length,
        approved: returns.filter((r) => r.returnRequest.status === "approved")
          .length,
        rejected: returns.filter((r) => r.returnRequest.status === "rejected")
          .length,
        completed: returns.filter((r) => r.returnRequest.status === "refunded")
          .length,
      },
    });
  } catch (error) {
    console.error("Admin get returns error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

/**
 * Admin approves return and creates Ekart RTO shipment
 * POST /api/admin/returns
 */
export async function POST(request) {
  try {
    await connectDB();

    // Auth check
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { orderId, action, reason } = body;

    if (!orderId || !action) {
      return NextResponse.json(
        { success: false, message: "Order ID and action are required" },
        { status: 400 },
      );
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    if (!order.returnRequest) {
      return NextResponse.json(
        { success: false, message: "No return request found" },
        { status: 400 },
      );
    }

    if (action === "approve") {
      // Update return request status
      order.returnRequest.status = "approved";
      order.returnRequest.approvedAt = new Date();
      order.returnRequest.approvedBy = decoded.userId;

      // Create Ekart RTO shipment
      try {
        const rtoResponse = await ekartService.createReturnShipment(
          order,
          order.returnRequest,
        );

        // Store return shipping info
        order.returnShipping = {
          trackingId: rtoResponse.tracking_id || rtoResponse.package_id,
          carrier: "Ekart",
          status: "pickup_scheduled",
          createdAt: new Date(),
        };

        // Update status history
        if (!order.statusHistory) {
          order.statusHistory = [];
        }

        order.statusHistory.push({
          status: "return_approved",
          timestamp: new Date(),
          note: `Return approved. Ekart pickup scheduled. RTO Tracking: ${order.returnShipping.trackingId}`,
          updatedBy: decoded.userId,
        });

        console.log(
          `✅ Return approved for order ${order.orderNumber}. RTO Tracking: ${order.returnShipping.trackingId}`,
        );
      } catch (ekartError) {
        console.error("Ekart RTO creation failed:", ekartError);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to create return shipment with Ekart",
          },
          { status: 500 },
        );
      }
    } else if (action === "reject") {
      order.returnRequest.status = "rejected";
      order.returnRequest.rejectedAt = new Date();
      order.returnRequest.rejectedBy = decoded.userId;
      order.returnRequest.rejectionReason =
        reason || "Does not meet return criteria";

      if (!order.statusHistory) {
        order.statusHistory = [];
      }

      order.statusHistory.push({
        status: "return_rejected",
        timestamp: new Date(),
        note: `Return rejected: ${reason || "Does not meet return criteria"}`,
        updatedBy: decoded.userId,
      });

      console.log(`❌ Return rejected for order ${order.orderNumber}`);
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: `Return ${action}d successfully`,
      order: {
        orderNumber: order.orderNumber,
        returnRequest: order.returnRequest,
        returnShipping: order.returnShipping,
      },
    });
  } catch (error) {
    console.error("Admin process return error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
