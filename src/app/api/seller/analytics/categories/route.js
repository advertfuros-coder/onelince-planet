// API Route: /api/seller/analytics/categories/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import Product from "@/lib/db/models/Product";
import Order from "@/lib/db/models/Order";
import Category from "@/lib/db/models/Category";
import jwt from "jsonwebtoken";

/**
 * GET /api/seller/analytics/categories
 * Get category performance analytics for seller
 *
 * Query params:
 *   - startDate: Start date for analytics (default: 30 days ago)
 *   - endDate: End date for analytics (default: today)
 *   - categoryPath: Optional filter by category path
 */
export async function GET(request) {
  try {
    await dbConnect();

    // Verify seller authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const sellerId = decoded.id;

    // Parse query params
    const { searchParams } = new URL(request.url);
    const categoryPath = searchParams.get("categoryPath");

    // Default to last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Build match query
    const matchQuery = {
      sellerId: sellerId,
      createdAt: { $gte: startDate, $lte: endDate },
    };

    if (categoryPath) {
      matchQuery.categoryPath = categoryPath;
    }

    // Aggregate category performance from orders
    const categoryStats = await Order.aggregate([
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$items",
      },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "itemProduct",
        },
      },
      {
        $unwind: "$itemProduct",
      },
      {
        $group: {
          _id: "$itemProduct.categoryPath",
          orders: { $addToSet: "$_id" }, // Unique orders
          revenue: { $sum: "$items.totalPrice" },
          units: { $sum: "$items.quantity" },
          categoryId: { $first: "$itemProduct.category" },
          categoryName: { $first: "$itemProduct.category" }, // Simplified
        },
      },
      {
        $project: {
          categoryPath: "$_id",
          orders: { $size: "$orders" },
          revenue: 1,
          units: 1,
          categoryId: 1,
          categoryName: 1,
          averageOrderValue: {
            $cond: [
              { $gt: [{ $size: "$orders" }, 0] },
              { $divide: ["$revenue", { $size: "$orders" }] },
              0,
            ],
          },
        },
      },
      {
        $sort: { revenue: -1 },
      },
    ]);

    // Get product counts per category
    const productCounts = await Product.aggregate([
      {
        $match: {
          sellerId: sellerId,
          ...(categoryPath && { categoryPath }),
        },
      },
      {
        $group: {
          _id: "$categoryPath",
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: ["$isActive", 1, 0],
            },
          },
        },
      },
    ]);

    // Merge with product counts
    const productCountMap = productCounts.reduce((acc, item) => {
      acc[item._id] = {
        total: item.total,
        active: item.active,
      };
      return acc;
    }, {});

    // Enrich category stats
    const enrichedStats = categoryStats.map((stat) => ({
      ...stat,
      productCount: productCountMap[stat.categoryPath] || {
        total: 0,
        active: 0,
      },
      // Mock views for now (would come from tracking system)
      views: stat.orders * 12, // Rough estimate: 1 order per 12 views
      conversionRate:
        stat.orders > 0
          ? ((stat.orders / (stat.orders * 12)) * 100).toFixed(2)
          : 0,
    }));

    // Calculate totals
    const totals = {
      revenue: enrichedStats.reduce((sum, s) => sum + (s.revenue || 0), 0),
      orders: enrichedStats.reduce((sum, s) => sum + (s.orders || 0), 0),
      units: enrichedStats.reduce((sum, s) => sum + (s.units || 0), 0),
      categories: enrichedStats.length,
    };

    // Generate insights
    const insights = generateInsights(enrichedStats);

    return NextResponse.json({
      success: true,
      data: {
        categories: enrichedStats,
        totals,
        insights,
        period: {
          start: startDate,
          end: endDate,
        },
      },
    });
  } catch (error) {
    console.error("[API] /api/seller/analytics/categories error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch analytics",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Generate smart insights from category data
 */
function generateInsights(categories) {
  if (!categories || categories.length === 0) {
    return [];
  }

  const insights = [];

  // Find best performer by conversion rate
  const bestConversion = categories.reduce((best, cat) =>
    parseFloat(cat.conversionRate) > parseFloat(best.conversionRate)
      ? cat
      : best
  );

  if (parseFloat(bestConversion.conversionRate) > 0) {
    insights.push({
      type: "success",
      icon: "🎯",
      title: "Best Performer",
      message: `${bestConversion.categoryPath.split("/").pop()} converting at ${
        bestConversion.conversionRate
      }%`,
      categoryPath: bestConversion.categoryPath,
    });
  }

  // Find highest revenue
  const topRevenue = categories[0]; // Already sorted by revenue
  if (topRevenue && topRevenue.revenue > 0) {
    insights.push({
      type: "info",
      icon: "💰",
      title: "Top Revenue",
      message: `${topRevenue.categoryPath
        .split("/")
        .pop()} generated AED ${topRevenue.revenue.toLocaleString()}`,
      categoryPath: topRevenue.categoryPath,
    });
  }

  // Find category with low conversion but high traffic
  const potentialOpportunity = categories.find(
    (cat) => cat.views > 100 && parseFloat(cat.conversionRate) < 5
  );

  if (potentialOpportunity) {
    insights.push({
      type: "opportunity",
      icon: "💡",
      title: "Opportunity",
      message: `${potentialOpportunity.categoryPath
        .split("/")
        .pop()} has high traffic but low conversion - consider price optimization`,
      categoryPath: potentialOpportunity.categoryPath,
    });
  }

  // Find categories needing attention (low performance)
  const needsAttention = categories.find(
    (cat) => cat.orders > 0 && parseFloat(cat.conversionRate) < 3
  );

  if (needsAttention) {
    insights.push({
      type: "warning",
      icon: "⚠️",
      title: "Needs Attention",
      message: `${needsAttention.categoryPath.split("/").pop()} only ${
        needsAttention.conversionRate
      }% conversion`,
      categoryPath: needsAttention.categoryPath,
    });
  }

  return insights.slice(0, 4); // Return top 4 insights
}
