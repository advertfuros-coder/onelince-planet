import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import SellerSubscription from "@/lib/db/models/SellerSubscription";
import Product from "@/lib/db/models/Product";
import Warehouse from "@/lib/db/models/Warehouse";
import { verifyToken } from "@/lib/utils/auth";

/**
 * GET /api/seller/usage
 * Get seller's current usage and limits
 */
export async function GET(request) {
  try {
    await connectDB();

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
        { success: false, message: "Seller access required" },
        { status: 403 }
      );
    }

    // Get subscription
    let subscription = await SellerSubscription.findOne({
      sellerId: decoded.userId,
    });

    if (!subscription) {
      subscription = await SellerSubscription.create({
        sellerId: decoded.userId,
        tier: "free",
      });
    }

    // Get actual usage from database
    const productsCount = await Product.countDocuments({
      sellerId: decoded.userId,
      status: { $ne: "deleted" },
    });

    const warehousesCount = await Warehouse.countDocuments({
      sellerId: decoded.userId,
      status: "active",
    });

    // Update usage in subscription
    subscription.usage.productsListed = productsCount;
    subscription.usage.warehousesCreated = warehousesCount;
    await subscription.save();

    // Get tier features
    const tierFeatures = SellerSubscription.getTierFeatures(subscription.tier);

    // Calculate usage percentages
    const calculatePercentage = (current, limit) => {
      if (limit === -1) return 0; // Unlimited
      return Math.round((current / limit) * 100);
    };

    const calculateDaysUntilLimit = (current, limit, growthRate = 0.05) => {
      if (limit === -1) return -1; // Unlimited
      if (current >= limit) return 0; // Already at limit

      const remaining = limit - current;
      const dailyGrowth = (current * growthRate) / 30; // Monthly growth rate to daily

      if (dailyGrowth <= 0) return -1; // No growth

      return Math.ceil(remaining / dailyGrowth);
    };

    // Calculate growth rate (simple: last 30 days)
    const growthRate = 0.15; // 15% monthly growth (can be calculated from historical data)

    const usage = {
      products: {
        current: productsCount,
        limit: tierFeatures.maxProducts,
        percentage: calculatePercentage(
          productsCount,
          tierFeatures.maxProducts
        ),
        daysUntilLimit: calculateDaysUntilLimit(
          productsCount,
          tierFeatures.maxProducts,
          growthRate
        ),
        status:
          calculatePercentage(productsCount, tierFeatures.maxProducts) >= 90
            ? "critical"
            : calculatePercentage(productsCount, tierFeatures.maxProducts) >= 70
            ? "warning"
            : "normal",
      },
      warehouses: {
        current: warehousesCount,
        limit: tierFeatures.maxWarehouses,
        percentage: calculatePercentage(
          warehousesCount,
          tierFeatures.maxWarehouses
        ),
        status:
          calculatePercentage(warehousesCount, tierFeatures.maxWarehouses) >= 90
            ? "critical"
            : calculatePercentage(
                warehousesCount,
                tierFeatures.maxWarehouses
              ) >= 70
            ? "warning"
            : "normal",
      },
      images: {
        limit: tierFeatures.maxImages,
        status: "normal",
      },
      apiCalls: {
        current: subscription.usage.apiCallsThisMonth || 0,
        limit: tierFeatures.apiAccess ? -1 : 0,
        available: tierFeatures.apiAccess,
      },
      storage: {
        current: subscription.usage.storageUsed || 0,
        limit: -1, // Unlimited for now
      },
    };

    // Get plan details
    const planDetails = {
      tier: subscription.tier,
      tierName: tierFeatures.name,
      price: tierFeatures.price,
      status: subscription.status,
      billing: subscription.billing,
      features: tierFeatures,
    };

    // Suggest upgrade if needed
    let upgradeRecommendation = null;
    if (usage.products.percentage >= 80 || usage.warehouses.percentage >= 80) {
      const nextTier =
        subscription.tier === "free"
          ? "starter"
          : subscription.tier === "starter"
          ? "professional"
          : subscription.tier === "professional"
          ? "enterprise"
          : null;

      if (nextTier) {
        const nextTierFeatures = SellerSubscription.getTierFeatures(nextTier);
        upgradeRecommendation = {
          tier: nextTier,
          tierName: nextTierFeatures.name,
          price: nextTierFeatures.price,
          reason:
            usage.products.daysUntilLimit > 0 &&
            usage.products.daysUntilLimit < 30
              ? `You'll hit your product limit in ${usage.products.daysUntilLimit} days`
              : "You're approaching your plan limits",
          benefits: [
            `${
              nextTierFeatures.maxProducts === -1
                ? "Unlimited"
                : nextTierFeatures.maxProducts
            } products`,
            `${
              nextTierFeatures.maxWarehouses === -1
                ? "Unlimited"
                : nextTierFeatures.maxWarehouses
            } warehouses`,
            nextTierFeatures.apiAccess ? "API Access" : null,
            nextTierFeatures.prioritySupport ? "Priority Support" : null,
          ].filter(Boolean),
        };
      }
    }

    return NextResponse.json({
      success: true,
      usage,
      plan: planDetails,
      upgradeRecommendation,
    });
  } catch (error) {
    console.error("❌ Get usage error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
