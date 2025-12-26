// app/api/seller/campaigns/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Campaign from "@/lib/db/models/Campaign";
import { verifyToken } from "@/lib/utils/auth";

export async function PUT(request, { params }) {
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

    const { id } = params;
    const data = await request.json();

    const campaign = await Campaign.findOne({
      _id: id,
      createdBy: decoded.userId,
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, message: "Campaign not found" },
        { status: 404 }
      );
    }

    if (data.status) campaign.status = data.status;
    // Add other fields updates as needed

    await campaign.save();

    return NextResponse.json({
      success: true,
      campaign,
    });
  } catch (error) {
    console.error("Update Campaign Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
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

    const { id } = params;
    const campaign = await Campaign.findOneAndDelete({
      _id: id,
      createdBy: decoded.userId,
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, message: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Campaign deleted",
    });
  } catch (error) {
    console.error("Delete Campaign Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
