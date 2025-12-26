// app/api/seller/advertising/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Campaign from "@/lib/db/models/Campaign";
import { verifyToken } from "@/lib/utils/auth";

export async function GET(request) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Seller access required" },
        { status: 403 }
      );
    }

    const campaigns = await Campaign.find({ createdBy: decoded.userId }).sort({
      createdAt: -1,
    });

    // Calculate stats
    const stats = {
      activeCampaigns: campaigns.filter((c) => c.status === "active").length,
      totalSpent: campaigns.reduce((acc, c) => acc + (c.spent || 0), 0),
      totalClicks: campaigns.reduce(
        (acc, c) => acc + (c.stats?.clicks || 0),
        0
      ),
      totalConversions: campaigns.reduce(
        (acc, c) => acc + (c.stats?.conversions || 0),
        0
      ),
    };

    return NextResponse.json({
      success: true,
      campaigns,
      stats,
    });
  } catch (error) {
    console.error("Advertising Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Seller access required" },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Basic validation
    if (!data.name || !data.type) {
      return NextResponse.json(
        { success: false, message: "Name and Type are required" },
        { status: 400 }
      );
    }

    const campaign = await Campaign.create({
      ...data,
      createdBy: decoded.userId,
      status: "active", // Auto-activate for demo
    });

    return NextResponse.json({
      success: true,
      campaign,
    });
  } catch (error) {
    console.error("Create Campaign Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
