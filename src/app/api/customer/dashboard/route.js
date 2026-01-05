import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Order from "@/lib/db/models/Order";
import User from "@/lib/db/models/User";
import { verifyToken } from "@/lib/utils/auth";

export async function GET(request) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = decoded.id;

    // Parallel queries for performance
    const [orders, user] = await Promise.all([
      Order.find({ customer: userId }).sort({ createdAt: -1 }),
      User.findById(userId).select(
        "wishlist name email phone gender addresses profilePicture"
      ),
    ]);

    const stats = {
      totalOrders: orders.length,
      activeOrders: orders.filter(
        (o) =>
          !["delivered", "cancelled", "returned", "refunded"].includes(o.status)
      ).length,
      wishlistCount: user.wishlist?.length || 0,
      recentOrders: orders.slice(0, 3),
    };

    // Calculate profile completion
    const profileFields = [
      "name",
      "email",
      "phone",
      "gender",
      "profilePicture",
    ];
    const filledFields = profileFields.filter((f) => !!user[f]);
    const hasAddress = user.addresses?.length > 0;
    const completionPercentage = Math.round(
      ((filledFields.length + (hasAddress ? 1 : 0)) /
        (profileFields.length + 1)) *
        100
    );

    return NextResponse.json({
      success: true,
      stats,
      completionPercentage,
      user,
    });
  } catch (error) {
    console.error("Customer dashboard error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
