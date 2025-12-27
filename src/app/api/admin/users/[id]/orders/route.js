// app/api/admin/users/[id]/orders/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Order from "@/lib/db/models/Order";
import { verifyToken, isAdmin } from "@/lib/utils/adminAuth";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const orders = await Order.find({ customerId: id })
      .sort({ createdAt: -1 })
      .limit(50);

    // Calculate stats
    const totalOrders = orders.length;
    const totalSpent = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    const stats = {
      totalOrders,
      totalSpent,
      avgOrderValue,
    };

    return NextResponse.json({ success: true, orders, stats });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
