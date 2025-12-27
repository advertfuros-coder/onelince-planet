import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import SellerSubscription from "@/lib/db/models/SellerSubscription";
import SubscriptionPlan from "@/lib/db/models/SubscriptionPlan";
import Seller from "@/lib/db/models/Seller";
import { verifyToken } from "@/lib/utils/auth";

/**
 * Activate subscription after successful payment
 * POST /api/seller/subscription/activate
 *
 * This provides instant activation without waiting for webhook
 * Used for test payments where webhook may not fire
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
    const {
      tier,
      billingInterval = "monthly",
      paymentId,
      orderId,
    } = await request.json();

    console.log(`⚡ Instant activation requested for ${decoded.userId}`);
    console.log(`📦 Tier: ${tier}, Payment: ${paymentId}`);

    const startTime = Date.now();

    // Get tier features from SubscriptionPlan model
    const plan = await SubscriptionPlan.findOne({ name: tier });
    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Plan not found" },
        { status: 404 }
      );
    }

    // Get or create subscription
    let subscription = await SellerSubscription.findOne({
      sellerId: decoded.userId,
    });
    if (!subscription) {
      subscription = new SellerSubscription({ sellerId: decoded.userId });
    }

    const previousTier = subscription.tier;

    // Calculate next billing date
    const calculateNextBillingDate = (interval) => {
      const now = new Date();
      switch (interval) {
        case "monthly":
          return new Date(now.setMonth(now.getMonth() + 1));
        case "quarterly":
          return new Date(now.setMonth(now.getMonth() + 3));
        case "yearly":
          return new Date(now.setFullYear(now.getFullYear() + 1));
        default:
          return new Date(now.setMonth(now.getMonth() + 1));
      }
    };

    // Update subscription
    subscription.tier = tier;
    subscription.status = "active";
    subscription.features = plan.features;
    subscription.billing = {
      amount: plan.pricing.monthly,
      currency: "INR",
      interval: billingInterval,
      lastBillingDate: new Date(),
      nextBillingDate: calculateNextBillingDate(billingInterval),
      paymentMethod: "razorpay",
      lastPaymentId: paymentId,
      lastOrderId: orderId,
    };

    // Add to history
    if (previousTier && previousTier !== tier) {
      subscription.history.push({
        tier: previousTier,
        startDate: subscription.createdAt || new Date(),
        endDate: new Date(),
        amount: subscription.billing.amount,
        status: "completed",
      });
    }

    // Update metrics
    subscription.metrics = {
      ...subscription.metrics,
      upgradeDate: new Date(),
      monthsSubscribed: (subscription.metrics?.monthsSubscribed || 0) + 1,
    };

    await subscription.save();

    // Update seller model
    const sellerDoc = await Seller.findOne({ userId: decoded.userId });
    if (sellerDoc) {
      sellerDoc.subscriptionPlan = tier;
      sellerDoc.subscriptionStartDate = new Date();
      sellerDoc.subscriptionExpiry = subscription.billing.nextBillingDate;
      await sellerDoc.save();
    }

    // Update plan analytics
    if (plan) {
      plan.analytics = plan.analytics || {};
      plan.analytics.activeSubscribers =
        (plan.analytics.activeSubscribers || 0) + 1;
      plan.analytics.totalSubscribers =
        (plan.analytics.totalSubscribers || 0) + 1;
      plan.analytics.monthlyRevenue =
        (plan.analytics.monthlyRevenue || 0) + plan.pricing.monthly;
      await plan.save();
    }

    // Decrease previous plan analytics if upgrading
    if (previousTier && previousTier !== tier) {
      const previousPlan = await SubscriptionPlan.findOne({
        name: previousTier,
      });
      if (previousPlan && previousPlan.analytics) {
        previousPlan.analytics.activeSubscribers = Math.max(
          0,
          (previousPlan.analytics.activeSubscribers || 0) - 1
        );
        previousPlan.analytics.monthlyRevenue = Math.max(
          0,
          (previousPlan.analytics.monthlyRevenue || 0) -
            (previousPlan.pricing?.monthly || 0)
        );
        await previousPlan.save();
      }
    }

    const activationTime = Date.now() - startTime;
    console.log(`✅ Instant activation complete in ${activationTime}ms`);
    console.log(`📊 ${decoded.userId}: ${previousTier} → ${tier}`);

    return NextResponse.json({
      success: true,
      message: "Subscription activated successfully",
      subscription: {
        tier: subscription.tier,
        status: subscription.status,
        features: subscription.features,
        billing: subscription.billing,
      },
      activationTime,
    });
  } catch (error) {
    console.error("❌ Activation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to activate subscription",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
