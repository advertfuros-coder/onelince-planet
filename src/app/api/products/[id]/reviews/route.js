// app/api/products/[id]/reviews/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Review from "@/lib/db/models/Review";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // Fetch reviews
    const reviews = await Review.find({
      productId: new mongoose.Types.ObjectId(id),
      status: "approved",
    })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Get review statistics
    const stats = await Review.aggregate([
      {
        $match: {
          productId: new mongoose.Types.ObjectId(id),
          status: "approved",
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratings: { $push: "$rating" },
        },
      },
    ]);

    let reviewStats = {
      averageRating: 0,
      totalReviews: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };

    if (stats.length > 0) {
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      stats[0].ratings.forEach((rating) => {
        distribution[rating] = (distribution[rating] || 0) + 1;
      });

      reviewStats = {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews,
        distribution,
      };
    }

    return NextResponse.json({
      success: true,
      reviews,
      stats: reviewStats,
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
