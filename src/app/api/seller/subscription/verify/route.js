// app/api/seller/subscription/verify/route.js
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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tier } =
      await request.json();

    // Verify signature
    const isVerified = razorpayService.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isVerified) {
      return NextResponse.json(
        { success: false, message: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Process upgrade
    let subscription = await SellerSubscription.findOne({
      sellerId: decoded.userId,
    });
    if (!subscription) {
      subscription = new SellerSubscription({ sellerId: decoded.userId });
    }

    await subscription.upgradeTier(tier);

    // Record payment info
    subscription.billing.lastBillingDate = new Date();
    subscription.billing.paymentMethod = "razorpay";
    subscription.status = "active";
    await subscription.save();

    return NextResponse.json({
      success: true,
      message: `Payment verified and account upgraded to ${tier} tier`,
      subscription,
    });
  } catch (error) {
    console.error("Subscription Verify Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
