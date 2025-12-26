import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import SellerSubscription from "@/lib/db/models/SellerSubscription";
import { verifyToken } from "@/lib/utils/auth";
import razorpayService from "@/lib/services/razorpayService";

export async function POST(request) {
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

    const { tier } = await request.json();

    // Validate tier
    const validTiers = ["free", "starter", "professional", "enterprise"];
    if (!validTiers.includes(tier)) {
      return NextResponse.json(
        { success: false, message: "Invalid tier" },
        { status: 400 }
      );
    }

    const tierFeatures = SellerSubscription.getTierFeatures(tier);
    const amount = tierFeatures.price;

    if (amount > 0) {
      // Create Razorpay Order
      const rzpOrder = await razorpayService.createOrder(
        amount,
        "INR",
        `sub_${decoded.userId}_${tier}_${Date.now()}`,
        {
          sellerId: decoded.userId,
          tier: tier,
          type: "subscription_upgrade",
        }
      );

      if (!rzpOrder.success) {
        return NextResponse.json(
          { success: false, message: "Failed to initiate payment" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        isPaid: true,
        order: rzpOrder,
        tier: tier,
        amount: amount,
        key: process.env.RAZORPAY_KEY_ID,
      });
    }

    // Free tier - upgrade immediately
    let subscription = await SellerSubscription.findOne({
      sellerId: decoded.userId,
    });
    if (!subscription) {
      subscription = new SellerSubscription({ sellerId: decoded.userId });
    }
    await subscription.upgradeTier(tier);

    return NextResponse.json({
      success: true,
      isPaid: false,
      message: `Successfully set to ${tier} plan`,
      subscription,
    });
  } catch (error) {
    console.error("Subscription Upgrade Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
