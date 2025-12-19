// app/api/ai/pricing-recommendation/route.js
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/utils/auth";
import connectDB from "@/lib/db/mongodb";
import Product from "@/lib/db/models/Product";
import Order from "@/lib/db/models/Order";
import aiPricingEngine from "@/lib/services/aiPricingEngine";

export async function POST(request) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId } = body;

    // Get product data
    const product = await Product.findById(productId).lean();

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Get sales history
    const salesHistory = await Order.aggregate([
      { $unwind: "$items" },
      {
        $match: {
          "items.product": product._id,
          "items.status": "delivered",
          createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $project: {
          date: "$createdAt",
          quantity: "$items.quantity",
          price: "$items.price",
        },
      },
    ]);

    // Get view count (placeholder - implement analytics)
    const viewCount = product.views || 100;

    // Get competitor prices (placeholder - implement web scraping)
    const competitorPrices = [
      product.price * 0.95,
      product.price * 1.05,
      product.price * 0.98,
      product.price * 1.02,
    ];

    const productData = {
      currentPrice: product.price,
      costPrice: product.costPrice || product.price * 0.6,
      category: product.category,
      subcategory: product.subcategory,
      salesHistory,
      viewCount,
      stockLevel: product.inventory?.quantity || 0,
      competitorPrices,
    };

    const recommendation = await aiPricingEngine.getSmartPricingRecommendation(
      productData
    );

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error("Pricing Recommendation Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
