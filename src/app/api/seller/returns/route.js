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

    // Get orders with return requests
    const ordersWithReturns = await Order.find({
      "items.seller": decoded.userId,
      "returnRequest.status": { $exists: true },
    }).sort({ "returnRequest.requestedAt": -1 });

    const stats = {
      pendingApproval: ordersWithReturns.filter(
        (o) => o.returnRequest.status === "requested"
      ).length,
      awaitingReceipt: ordersWithReturns.filter(
        (o) => o.returnRequest.status === "approved"
      ).length,
      qualityCheck: ordersWithReturns.filter(
        (o) => o.returnRequest.status === "received"
      ).length,
      resolvedThisMonth: ordersWithReturns.filter(
        (o) =>
          ["quality_passed", "refunded"].includes(o.returnRequest.status) &&
          isThisMonth(o.returnRequest.resolvedAt)
      ).length,
    };

    return NextResponse.json({
      success: true,
      stats,
      returns: ordersWithReturns.map((order) => ({
        id: order._id,
        orderNumber: order.orderNumber,
        customer: order.shippingAddress.name,
        reason: order.returnRequest.reason,
        description: order.returnRequest.description,
        status: order.returnRequest.status,
        requestedAt: order.returnRequest.requestedAt,
        images: order.returnRequest.images,
        refundAmount: order.returnRequest.refundAmount || order.pricing.total,
      })),
    });
  } catch (error) {
    console.error("❌ Returns API error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

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

    const { orderId, action, comment, condition } = await request.json();
    const order = await Order.findById(orderId);

    if (!order)
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );

    // Update return status based on action
    switch (action) {
      case "APPROVE":
        order.returnRequest.status = "approved";
        break;
      case "REJECT":
        order.returnRequest.status = "rejected";
        order.returnRequest.comments = comment;
        break;
      case "RECEIVED":
        order.returnRequest.status = "received";
        break;
      case "RESOLVE":
        order.returnRequest.status =
          condition === "passed" ? "quality_passed" : "quality_failed";
        order.returnRequest.qualityCheck = {
          checkedAt: new Date(),
          comments: comment,
          condition: condition === "passed" ? "new" : "damaged",
        };
        order.returnRequest.resolvedAt = new Date();
        break;
    }

    await order.save();
    return NextResponse.json({
      success: true,
      message: `Return ${action.toLowerCase()}ed successfully`,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

function isThisMonth(date) {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  return (
    d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  );
}
