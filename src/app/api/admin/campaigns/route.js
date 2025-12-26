import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Advertisement from "@/lib/db/models/Advertisement";
import { verifyToken } from "@/lib/utils/auth";

export async function GET(request) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    let query = {};
    if (status) query.status = status;
    if (type) query.campaignType = type;

    const total = await Advertisement.countDocuments(query);

    const campaigns = await Advertisement.find(query)
      .populate("sellerId", "businessName email")
      .populate("products", "name images pricing")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Aggregate Stats
    const stats = await Advertisement.aggregate([
      {
        $group: {
          _id: null,
          totalSpend: { $sum: "$budget.spent" },
          totalRevenue: { $sum: "$metrics.revenue" },
          activeCampaigns: {
            $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
          },
          pendingCampaigns: {
            $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] }, // Assuming draft needs review or we add a pending status later
          },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      campaigns,
      stats: stats[0] || {
        totalSpend: 0,
        totalRevenue: 0,
        activeCampaigns: 0,
        pendingCampaigns: 0,
      },
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin Campaigns GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { campaignId, status, rejectionReason } = await request.json();

    if (!["active", "paused", "rejected", "completed"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    const campaign = await Advertisement.findByIdAndUpdate(
      campaignId,
      {
        status,
        ...(rejectionReason && { "optimization.notes": rejectionReason }), // Store reason in notes or similar field
      },
      { new: true }
    );

    if (!campaign) {
      return NextResponse.json(
        { success: false, message: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Campaign ${status} successfully`,
      campaign,
    });
  } catch (error) {
    console.error("Admin Campaigns PATCH Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
