// app/api/seller/campaigns/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Advertisement from "@/lib/db/models/Advertisement";
import SellerSubscription from "@/lib/db/models/SellerSubscription";
import { verifyToken } from "@/lib/utils/auth";

// GET - Fetch all campaigns
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
    const status = searchParams.get("status");

    let query = { sellerId: decoded.userId };
    if (status) query.status = status;

    const campaigns = await Advertisement.find(query)
      .populate("products", "name images pricing")
      .sort({ createdAt: -1 });

    // Calculate summary stats
    const stats = {
      total: campaigns.length,
      active: campaigns.filter((c) => c.status === "active").length,
      paused: campaigns.filter((c) => c.status === "paused").length,
      totalSpent: campaigns.reduce((sum, c) => sum + c.budget.spent, 0),
      totalRevenue: campaigns.reduce((sum, c) => sum + c.metrics.revenue, 0),
      totalImpressions: campaigns.reduce(
        (sum, c) => sum + c.metrics.impressions,
        0
      ),
      totalClicks: campaigns.reduce((sum, c) => sum + c.metrics.clicks, 0),
      averageROAS:
        campaigns.length > 0
          ? campaigns.reduce((sum, c) => sum + c.metrics.roas, 0) /
            campaigns.length
          : 0,
    };

    return NextResponse.json({
      success: true,
      campaigns,
      stats,
    });
  } catch (error) {
    console.error("Campaigns GET Error:", error);
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

// POST - Create new campaign
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

    // Check subscription limits
    const subscription = await SellerSubscription.findOne({
      sellerId: decoded.userId,
    });
    if (!subscription || !subscription.hasFeature("sponsoredProducts")) {
      return NextResponse.json(
        {
          success: false,
          message: "Upgrade your subscription to create ad campaigns",
        },
        { status: 403 }
      );
    }

    const campaignData = await request.json();

    // Create campaign
    const campaign = await Advertisement.create({
      ...campaignData,
      sellerId: decoded.userId,
      status: "draft",
      "budget.remaining": campaignData.budget?.amount || 0,
    });

    return NextResponse.json({
      success: true,
      message: "Campaign created successfully",
      campaign,
    });
  } catch (error) {
    console.error("Campaign POST Error:", error);
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
