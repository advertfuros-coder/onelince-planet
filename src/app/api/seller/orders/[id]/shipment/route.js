import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Order from "@/lib/db/models/Order";
import Seller from "@/lib/db/models/Seller";
import { verifyToken } from "@/lib/utils/auth";
import ekartService from "@/lib/services/ekartService";

export async function POST(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    // Auth check
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // Get Order
    const order = await Order.findById(id).populate("items.product");
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    // Verify ownership
    const seller = await Seller.findOne({ userId: decoded.userId });
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller profile not found" },
        { status: 404 },
      );
    }

    // Check if order belongs to seller (at least one item)
    const isSellerOrder = order.items.some(
      (item) => item.seller.toString() === seller._id.toString(),
    );
    if (!isSellerOrder) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access to order" },
        { status: 403 },
      );
    }

    // Check status
    if (!["packed", "ready_for_pickup"].includes(order.status)) {
      return NextResponse.json(
        { success: false, message: "Order must be PACKED to create shipment" },
        { status: 400 },
      );
    }

    // Check if already created
    if (order.shipping?.trackingId) {
      return NextResponse.json(
        {
          success: false,
          message: "Shipment already created",
          trackingId: order.shipping.trackingId,
        },
        { status: 400 },
      );
    }

    // Get dimensions from request body
    const body = await request.json();
    const dimensions = body.dimensions || {
      weight: 0.5,
      length: 30,
      width: 20,
      height: 15,
    };

    // Call Ekart
    const response = await ekartService.createShipmentFromOrder(
      order,
      seller,
      dimensions,
    );

    if (response && (response.tracking_id || response.success)) {
      // Update Order
      order.shipping = {
        ...order.shipping,
        trackingId: response.tracking_id || response.package_id,
        carrier: "Ekart",
        shippedAt: new Date(),
      };

      // Change status to shipped
      const oldStatus = order.status;
      order.status = "shipped";

      // Add to status history
      if (!order.statusHistory) {
        order.statusHistory = [];
      }

      order.statusHistory.push({
        status: "shipped",
        timestamp: new Date(),
        note: `Shipment created with Ekart. Tracking ID: ${order.shipping.trackingId}`,
        updatedBy: seller?._id || "seller",
      });

      await order.save();

      console.log(
        `✅ Order ${order.orderNumber} status: ${oldStatus} → shipped`,
      );

      return NextResponse.json({
        success: true,
        message:
          "Ekart shipment created successfully. Order status updated to shipped.",
        trackingId: order.shipping.trackingId,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: response?.message || "Failed to create shipment in Ekart",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Create shipment error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Server Error" },
      { status: 500 },
    );
  }
}
