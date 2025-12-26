// app/api/reviews/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { verifyToken } from "@/lib/utils/auth";
import Review from "@/lib/db/models/Review";
import Order from "@/lib/db/models/Order";

// Get reviews for a product
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const rating = searchParams.get("rating"); // Filter by rating
    const verified = searchParams.get("verified") === "true";
    const withMedia = searchParams.get("withMedia") === "true";
    const sort = searchParams.get("sort") || "recent"; // recent, helpful, rating

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    // Build query
    let query = { productId, status: "approved" };

    if (rating) {
      query.rating = parseInt(rating);
    }

    if (verified) {
      query.verifiedPurchase = true;
    }

    if (withMedia) {
      query.$or = [
        { photos: { $exists: true, $ne: [] } },
        { videos: { $exists: true, $ne: [] } },
      ];
    }

    // Sort
    let sortQuery = {};
    if (sort === "recent") {
      sortQuery = { createdAt: -1 };
    } else if (sort === "helpful") {
      sortQuery = { "helpful.count": -1, createdAt: -1 };
    } else if (sort === "rating") {
      sortQuery = { rating: -1, createdAt: -1 };
    }

    const [reviews, total, stats] = await Promise.all([
      Review.find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .populate("userId", "name profilePicture")
        .lean(),
      Review.countDocuments(query),
      Review.getProductStats(productId),
    ]);

    return NextResponse.json({
      success: true,
      reviews,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// Create review
export async function POST(request) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, orderId, rating, title, comment, photos, videos } = body;

    // Validate required fields
    if (!productId || !rating || !title || !comment) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      productId,
      userId: decoded.id,
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, message: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    // Verify purchase if orderId provided
    let verifiedPurchase = false;
    if (orderId) {
      const order = await Order.findOne({
        _id: orderId,
        userId: decoded.id,
        "items.product": productId,
        status: "delivered",
      });

      verifiedPurchase = !!order;
    }

    // Create review
    const review = await Review.create({
      productId,
      userId: decoded.id,
      orderId,
      rating,
      title,
      comment,
      photos: photos || [],
      videos: videos || [],
      verifiedPurchase,
      status: "pending", // Requires moderation
    });

    return NextResponse.json({
      success: true,
      message:
        "Review submitted successfully. It will appear after moderation.",
      review,
    });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
