import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Seller from "@/lib/db/models/Seller";
import Advertisement from "@/lib/db/models/Advertisement";
import Product from "@/lib/db/models/Product";
import { verifyToken } from "@/lib/utils/auth";
import mongoose from "mongoose";

export async function GET(request) {
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

    const seller = await Seller.findOne({ userId: decoded.userId });
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller profile not found" },
        { status: 404 }
      );
    }

    // Get all advertisements/campaigns for this seller
    const ads = await Advertisement.find({
      sellerId: new mongoose.Types.ObjectId(decoded.userId),
    })
      .populate("products", "name images pricing")
      .sort({ createdAt: -1 });

    // Calculate overall metrics
    const totals = ads.reduce(
      (acc, ad) => {
        if (ad.metrics) {
          acc.impressions += ad.metrics.impressions || 0;
          acc.clicks += ad.metrics.clicks || 0;
          acc.conversions += ad.metrics.conversions || 0;
          acc.revenue += ad.metrics.revenue || 0;
        }
        if (ad.budget) {
          acc.spent += ad.budget.spent || 0;
        }
        return acc;
      },
      { impressions: 0, clicks: 0, conversions: 0, revenue: 0, spent: 0 }
    );

    const roas =
      totals.spent > 0 ? (totals.revenue / totals.spent).toFixed(2) : 0;
    const ctr =
      totals.impressions > 0
        ? ((totals.clicks / totals.impressions) * 100).toFixed(2)
        : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalImpressions: totals.impressions,
        totalClicks: totals.clicks,
        totalRevenue: totals.revenue,
        totalSpent: totals.spent,
        roas,
        ctr,
      },
      campaigns: ads,
    });
  } catch (error) {
    console.error("❌ Advertising API error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

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

    const data = await request.json();

    // Create new advertisement
    const newAd = await Advertisement.create({
      ...data,
      sellerId: decoded.userId,
      status: "active",
    });

    return NextResponse.json({ success: true, ad: newAd });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
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

    const { id, status, budget, bidAmount, boost } = await request.json();
    const ad = await Advertisement.findOne({
      _id: id,
      sellerId: decoded.userId,
    });

    if (!ad)
      return NextResponse.json(
        { success: false, message: "Campaign not found" },
        { status: 404 }
      );

    if (status) ad.status = status;
    if (budget) ad.budget.amount = budget;
    if (bidAmount) ad.bidding.bidAmount = bidAmount;
    if (typeof boost === "boolean") {
      ad.set("boost", boost);
    }

    await ad.save();
    return NextResponse.json({ success: true, ad });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
