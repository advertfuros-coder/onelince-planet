// app/api/seller/orders/bulk-status/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Order from "@/lib/db/models/Order";
import { verifyToken } from "@/lib/utils/auth";

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

    const { orderIds, status } = await request.json();

    if (!orderIds || !Array.isArray(orderIds) || !status) {
      return NextResponse.json(
        { success: false, message: "Invalid payload" },
        { status: 400 }
      );
    }

    // Update multiple orders at once
    // We only update if the order belongs to this seller (items.seller matches decoded.userId)
    // Actually, in our model, an order can have items from multiple sellers.
    // So we should update the item status AND the overall order status if all items are from this seller.

    // For simplicity, we assume one seller per order in this context or we update the top-level status
    // but with a check that at least one item belongs to this seller.

    const result = await Order.updateMany(
      {
        _id: { $in: orderIds },
        "items.seller": decoded.userId,
      },
      {
        $set: { status: status },
        $push: {
          timeline: {
            status: status,
            description: `Bulk status update to ${status}`,
            timestamp: new Date(),
          },
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} orders synchronized`,
      result,
    });
  } catch (error) {
    console.error("Bulk Status Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
