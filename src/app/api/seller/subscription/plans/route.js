import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import SubscriptionPlan from "@/lib/db/models/SubscriptionPlan";

/**
 * GET /api/seller/subscription/plans
 * Get all active subscription plans for seller view
 */
export async function GET(request) {
  try {
    await connectDB();

    // Get all active and visible plans
    const plans = await SubscriptionPlan.find({
      status: "active",
      isVisible: true,
    }).sort({ sortOrder: 1 });

    // Transform plans for seller view
    const transformedPlans = plans.map((plan) => ({
      id: plan._id,
      name: plan.name,
      displayName: plan.displayName,
      description: plan.description,
      tagline: plan.tagline,
      icon: plan.icon,
      color: plan.color,
      pricing: {
        monthly: plan.pricing.monthly,
        quarterly:
          plan.pricing.quarterly || Math.round(plan.pricing.monthly * 0.9),
        yearly: plan.pricing.yearly || Math.round(plan.pricing.monthly * 0.8),
        currency: plan.pricing.currency || "INR",
      },
      discounts: plan.discounts,
      features: plan.features,
      isPopular: plan.isPopular,
    }));

    return NextResponse.json({
      success: true,
      plans: transformedPlans,
    });
  } catch (error) {
    console.error("❌ Get plans error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
