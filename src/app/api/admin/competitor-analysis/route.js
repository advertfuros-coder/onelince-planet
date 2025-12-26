import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import CompetitorTracking from "@/lib/db/models/CompetitorTracking";
import { verifyToken } from "@/lib/utils/auth";

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
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";

    // Query builder
    let query = { isActive: true };
    // If search is needed, we'd need to lookup product IDs first or do an aggregation.
    // For simplicity in this v1, we fetch recent and rely on frontend search or simple population limits if possible.
    // However, aggregation is better for "Search by Product Name" when the field is in a referenced collection.

    const total = await CompetitorTracking.countDocuments(query);

    const trackings = await CompetitorTracking.find(query)
      .populate({
        path: "productId",
        select: "name images pricing category",
      })
      .populate({
        path: "sellerId",
        select: "businessName email",
      })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    // Filter by search term if provided (inefficient for large DBs, but okay for v1 MVP)
    let filteredTrackings = trackings;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTrackings = trackings.filter(
        (t) =>
          t.productId?.name?.toLowerCase().includes(searchLower) ||
          t.sellerId?.businessName?.toLowerCase().includes(searchLower)
      );
    }

    // Aggregates for Stats
    // We can do a separate aggregation for global stats
    const statsAggregation = await CompetitorTracking.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalTracked: { $sum: 1 },
          avgDiff: { $avg: "$currentPosition.percentageDifference" },
          cheaperExampleCount: {
            $sum: {
              $cond: [
                { $lt: ["$currentPosition.percentageDifference", 0] },
                1,
                0,
              ],
            },
          },
          expensiveExampleCount: {
            $sum: {
              $cond: [
                { $gt: ["$currentPosition.percentageDifference", 0] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const globalStats = statsAggregation[0] || {
      totalTracked: 0,
      avgDiff: 0,
      cheaperExampleCount: 0,
      expensiveExampleCount: 0,
    };

    return NextResponse.json({
      success: true,
      trackings: filteredTrackings, // Note: pagination calculation isn't perfectly accurate with post-fetch filter, but acceptable for now
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      stats: {
        totalTracked: globalStats.totalTracked,
        marketPosition: globalStats.avgDiff < 0 ? "Cheaper" : "Premium",
        percentageDiff: globalStats.avgDiff,
        productsCheaperThanMarket: globalStats.cheaperExampleCount,
        productsMoreExpensive: globalStats.expensiveExampleCount,
      },
    });
  } catch (error) {
    console.error("Admin Competitor Analysis Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
