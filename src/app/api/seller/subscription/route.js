// app/api/seller/subscription/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import SellerSubscription from "@/lib/db/models/SellerSubscription";
import { verifyToken } from "@/lib/utils/auth";

export async function GET(request) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Seller access required" },
        { status: 403 }
      );
    }

    let subscription = await SellerSubscription.findOne({
      sellerId: decoded.userId,
    });

    // Create default subscription if none exists
    if (!subscription) {
      subscription = await SellerSubscription.create({
        sellerId: decoded.userId,
        tier: "free",
        features: SellerSubscription.getTierFeatures("free"),
      });
    }

    return NextResponse.json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error("Subscription Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
