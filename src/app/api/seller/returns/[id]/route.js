// app/api/seller/returns/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Order from "@/lib/db/models/Order";
import { verifyToken } from "@/lib/utils/auth";

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { status, resolutionReason, refundAmount, qualityCheck } =
      await request.json();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Verify it belongs to seller
    const isSellerOrder = order.items.some(
      (item) => item.seller.toString() === decoded.userId
    );
    if (!isSellerOrder) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    // Update return request status
    order.returnRequest.status = status;
    order.returnRequest.resolvedAt = new Date();

    if (qualityCheck) {
      order.returnRequest.qualityCheck = {
        ...qualityCheck,
        checkedAt: new Date(),
        checkedBy: decoded.userId,
      };
    }

    if (status === "approved") {
      // Transitional status: seller approves the REQUEST
    } else if (status === "received") {
      // Item physically arrived at warehouse
    } else if (status === "quality_passed") {
      // Verified item condition
    } else if (status === "quality_failed") {
      // Item rejected after inspection
    } else if (status === "refunded") {
      order.status = "returned";
      order.payment.status = "refunded";
      if (refundAmount) order.returnRequest.refundAmount = refundAmount;
    } else if (status === "rejected") {
      order.notes.push({
        text: `Return request rejected: ${resolutionReason}`,
        addedBy: "seller",
        addedById: decoded.userId,
      });
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: `Return request ${status}`,
      order,
    });
  } catch (error) {
    console.error("Returns PUT Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
