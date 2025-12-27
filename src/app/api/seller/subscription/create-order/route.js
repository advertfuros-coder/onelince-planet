import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectDB from "@/lib/db/mongodb";
import SellerSubscription from "@/lib/db/models/SellerSubscription";
import { verifyToken } from "@/lib/utils/auth";

/**
 * Create Razorpay order for subscription upgrade
 * POST /api/seller/subscription/create-order
 */
export async function POST(request) {
  try {
    await connectDB();

    // Verify seller authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    // Get request data
    const { tier, billingInterval = "monthly" } = await request.json();

    // Validate tier
    const validTiers = ["free", "starter", "professional", "enterprise"];
    if (!validTiers.includes(tier)) {
      return NextResponse.json(
        { success: false, message: "Invalid tier" },
        { status: 400 }
      );
    }

    // Get tier pricing
    const tierFeatures = SellerSubscription.getTierFeatures(tier);
    let amount = tierFeatures.price;

    // Apply billing interval discounts
    const discounts = {
      monthly: 0,
      quarterly: 0.1, // 10% off
      yearly: 0.2, // 20% off
    };

    const discount = discounts[billingInterval] || 0;
    const discountedAmount = amount * (1 - discount);
    const finalAmount = Math.round(discountedAmount * 100); // Convert to paise

    // Check if already on this tier
    const currentSubscription = await SellerSubscription.findOne({
      sellerId: decoded.userId,
    });

    if (
      currentSubscription?.tier === tier &&
      currentSubscription?.status === "active"
    ) {
      return NextResponse.json(
        { success: false, message: "Already subscribed to this plan" },
        { status: 400 }
      );
    }

    // Calculate prorated amount if upgrading mid-cycle
    let proratedAmount = finalAmount;
    let proratedDays = 0;

    if (currentSubscription && currentSubscription.billing.nextBillingDate) {
      const daysRemaining = Math.ceil(
        (new Date(currentSubscription.billing.nextBillingDate) - new Date()) /
          (1000 * 60 * 60 * 24)
      );

      if (daysRemaining > 0) {
        const totalDays =
          billingInterval === "monthly"
            ? 30
            : billingInterval === "quarterly"
            ? 90
            : 365;
        const proratedRatio = daysRemaining / totalDays;
        proratedAmount = Math.round(finalAmount * proratedRatio);
        proratedDays = daysRemaining;
      }
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Create Razorpay order
    const orderOptions = {
      amount: proratedAmount, // Amount in paise
      currency: "INR",
      receipt: `sub_${Date.now().toString().slice(-10)}`, // Max 40 chars, using last 10 digits of timestamp
      notes: {
        sellerId: decoded.userId,
        tier,
        billingInterval,
        previousTier: currentSubscription?.tier || "free",
        proratedDays,
      },
    };

    const order = await razorpay.orders.create(orderOptions);

    console.log(`📦 Order created: ${order.id} for ${decoded.userId}`);
    console.log(
      `💰 Amount: ₹${proratedAmount / 100} (${proratedDays} days prorated)`
    );

    // Return order details to frontend
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: proratedAmount,
        currency: order.currency,
        tier,
        tierName: tierFeatures.name,
        billingInterval,
        discount: discount * 100, // Percentage
        originalAmount: finalAmount,
        proratedAmount,
        proratedDays,
        features: tierFeatures,
      },
      razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("❌ Create order error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create order",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
