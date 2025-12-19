// app/api/seller/competitors/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import CompetitorTracking from "@/lib/db/models/CompetitorTracking";
import Product from "@/lib/db/models/Product";
import { verifyToken } from "@/lib/utils/auth";

// GET - Fetch all competitor tracking
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

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    let query = { sellerId: decoded.userId, isActive: true };
    if (productId) query.productId = productId;

    const trackings = await CompetitorTracking.find(query)
      .populate("productId", "name images pricing")
      .sort({ createdAt: -1 });

    // Calculate summary stats
    const stats = {
      totalTracked: trackings.length,
      totalCompetitors: trackings.reduce(
        (sum, t) => sum + t.competitors.length,
        0
      ),
      averagePriceDifference:
        trackings.reduce(
          (sum, t) => sum + (t.currentPosition?.percentageDifference || 0),
          0
        ) / trackings.length || 0,
      autoPricingEnabled: trackings.filter((t) => t.autoPricing?.enabled)
        .length,
    };

    return NextResponse.json({
      success: true,
      trackings,
      stats,
    });
  } catch (error) {
    console.error("Competitors GET Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Create new competitor tracking
export async function POST(request) {
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

    const data = await request.json();

    // Verify product belongs to seller
    const product = await Product.findOne({
      _id: data.productId,
      sellerId: decoded.userId,
    });
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Check if tracking already exists
    let tracking = await CompetitorTracking.findOne({
      sellerId: decoded.userId,
      productId: data.productId,
    });

    if (tracking) {
      // Add competitor to existing tracking
      if (data.competitor) {
        await tracking.addCompetitor(data.competitor);
      }
    } else {
      // Create new tracking
      tracking = await CompetitorTracking.create({
        sellerId: decoded.userId,
        productId: data.productId,
        competitors: data.competitor ? [data.competitor] : [],
        autoPricing: data.autoPricing || {},
        alerts: data.alerts || {},
      });
    }

    return NextResponse.json({
      success: true,
      message: "Competitor tracking created successfully",
      tracking,
    });
  } catch (error) {
    console.error("Competitor POST Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
