import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Seller from "@/lib/db/models/Seller";
import Order from "@/lib/db/models/Order";
import { verifyToken } from "@/lib/utils/auth";

export async function GET(request) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const seller = await Seller.findOne({ userId: decoded.userId });
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller profile not found" },
        { status: 404 }
      );
    }

    // Get orders that require shipping action (pending, confirmed, processing, packed, ready_for_pickup)
    const shippingOrders = await Order.find({
      "items.seller": decoded.userId,
      status: {
        $in: [
          "confirmed",
          "processing",
          "packed",
          "ready_for_pickup",
          "shipped",
        ],
      },
    }).sort({ createdAt: -1 });

    const stats = {
      pending: shippingOrders.filter((o) =>
        ["confirmed", "processing"].includes(o.status)
      ).length,
      ready: shippingOrders.filter((o) => o.status === "ready_for_pickup")
        .length,
      shippedToday: shippingOrders.filter(
        (o) => o.status === "shipped" && isToday(o.updatedAt)
      ).length,
      pickupPoint: seller.pickupAddress?.city || "Not Set",
    };

    return NextResponse.json({
      success: true,
      stats,
      orders: shippingOrders.map((order) => ({
        id: order._id,
        orderNumber: order.orderNumber,
        date: order.createdAt,
        customer: order.shippingAddress.name,
        itemsCount: order.items.filter(
          (i) => i.seller.toString() === decoded.userId.toString()
        ).length,
        status: order.status,
        courier: order.shiprocket?.courierName || "Standard",
        trackingId: order.shiprocket?.awbCode || order.shipping?.trackingId,
      })),
    });
  } catch (error) {
    console.error("❌ Shipping API error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// POST for updating status (Ready for Pickup / Manifest)
export async function POST(request) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { orderId, action } = await request.json();
    const order = await Order.findById(orderId);

    if (!order)
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );

    if (action === "READY_FOR_PICKUP") {
      order.status = "ready_for_pickup";
      order.pickup.sellerMarked = true;
      order.pickup.sellerMarkedAt = new Date();
      order.timeline.push({
        status: "ready_for_pickup",
        description: "Seller marked order as ready for pickup.",
        timestamp: new Date(),
      });
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order status updated",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

function isToday(date) {
  const d = new Date(date);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}
