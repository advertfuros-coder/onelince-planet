// app/api/coupons/apply/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { verifyToken } from "@/lib/utils/auth";
import Coupon from "@/lib/db/models/Coupon";
import Order from "@/lib/db/models/Order";

// Apply coupon to order (record usage)
export async function POST(request) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { code, orderId } = await request.json();

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Invalid coupon code" },
        { status: 404 }
      );
    }

    // Update usage count
    coupon.usageCount.total += 1;

    const userUsage = coupon.usageCount.users.find(
      (u) => u.userId.toString() === decoded.id.toString()
    );

    if (userUsage) {
      userUsage.count += 1;
      userUsage.lastUsed = new Date();
    } else {
      coupon.usageCount.users.push({
        userId: decoded.id,
        count: 1,
        lastUsed: new Date(),
      });
    }

    // Update analytics
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        coupon.analytics.totalOrders += 1;
        coupon.analytics.totalRevenue += order.pricing.total;
        coupon.analytics.totalDiscount += order.pricing.discount;
      }
    }

    await coupon.save();

    return NextResponse.json({
      success: true,
      message: "Coupon applied successfully",
    });
  } catch (error) {
    console.error("Apply coupon error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
