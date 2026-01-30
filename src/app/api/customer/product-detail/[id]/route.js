import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Product from "@/lib/db/models/Product";
import Review from "@/lib/db/models/Review";
import mongoose from "mongoose";

export async function GET(request, context) {
  try {
    await connectDB();
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Product ID" },
        { status: 400 },
      );
    }

    // Use aggregation to handle both 'seller' and 'sellerId' fields
    const productPipeline = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
          isActive: true,
          isApproved: true,
          isDraft: { $ne: true },
        },
      },
      {
        $lookup: {
          from: "sellers",
          localField: "seller", // Try 'seller' field first
          foreignField: "_id",
          as: "sellerData",
        },
      },
      {
        $lookup: {
          from: "sellers",
          localField: "sellerId", // Fallback to 'sellerId' field
          foreignField: "_id",
          as: "sellerIdData",
        },
      },
      {
        $addFields: {
          // Use whichever lookup succeeded
          sellerInfo: {
            $cond: {
              if: { $gt: [{ $size: "$sellerData" }, 0] },
              then: { $arrayElemAt: ["$sellerData", 0] },
              else: { $arrayElemAt: ["$sellerIdData", 0] },
            },
          },
        },
      },
      {
        $project: {
          sellerData: 0,
          sellerIdData: 0,
        },
      },
    ];

    const products = await Product.aggregate(productPipeline);

    if (!products || products.length === 0) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 },
      );
    }

    const product = products[0];

    // If sellerInfo is undefined, fetch seller directly
    let sellerInfo = product.sellerInfo;
    if (!sellerInfo && product.sellerId) {

      const Seller = (await import("@/lib/db/models/Seller")).default;

      const sellerCount = await Seller.countDocuments();


      sellerInfo = await Seller.findById(product.sellerId)
        .select("businessInfo storeInfo personalDetails ratings")
        .lean();


      if (!sellerInfo && sellerCount > 0) {
        const anySeller = await Seller.findOne().lean();

        
        // Use the available seller as fallback
        sellerInfo = await Seller.findById(anySeller._id)
          .select("businessInfo storeInfo personalDetails ratings")
          .lean();
      }
    }

    // Fetch reviews for this product
    const reviews = await Review.find({
      productId: id,
      isApproved: true,
    })
      .populate("userId", "name profilePicture")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Calculate rating distribution
    const statsAggregation = await Review.aggregate([
      {
        $match: {
          productId: new mongoose.Types.ObjectId(id),
          isApproved: true,
        },
      },
      {
        $group: {
          _id: null,
          average: { $avg: "$rating" },
          count: { $sum: 1 },
          distribution: {
            $push: "$rating",
          },
        },
      },
    ]);

    const stats = statsAggregation[0]
      ? {
          average: parseFloat(statsAggregation[0].average.toFixed(1)),
          count: statsAggregation[0].count,
          distribution: {
            5: statsAggregation[0].distribution.filter((r) => r === 5).length,
            4: statsAggregation[0].distribution.filter((r) => r === 4).length,
            3: statsAggregation[0].distribution.filter((r) => r === 3).length,
            2: statsAggregation[0].distribution.filter((r) => r === 2).length,
            1: statsAggregation[0].distribution.filter((r) => r === 1).length,
          },
        }
      : {
          average: 0,
          count: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        };

    // Fetch related products (same category, different product)
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: id },
      isActive: true,
      isApproved: true,
      isDraft: { $ne: true },
    })
      .limit(8)
      .select("name images pricing ratings inventory.stock")
      .lean();

    // Calculate actual product count for this seller
    const sellerId = sellerInfo?._id || product.sellerId;
    const sellerProductCount = await Product.countDocuments({
      $or: [{ seller: sellerId }, { sellerId: sellerId }],
      isActive: true,
      isApproved: true,
    });

    // Extract seller name with proper fallback
    const sellerName =
      sellerInfo?.storeInfo?.storeName ||
      sellerInfo?.businessInfo?.businessName ||
      sellerInfo?.personalDetails?.fullName ||
      "Official Store";

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        ratings: {
          average: stats.average,
          count: stats.count,
        },
        reviews,
        reviewsCount: stats.count,
        ratingDistribution: stats.distribution,
        relatedProducts,
        sellerProductCount,
        sellerName,
        // Keep sellerInfo for frontend compatibility
        sellerId: sellerInfo,
      },
    });
  } catch (error) {
    console.error("Fetch product error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
