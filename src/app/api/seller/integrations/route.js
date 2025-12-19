// app/api/seller/integrations/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import ExternalIntegration from "@/lib/db/models/ExternalIntegration";
import { verifyToken } from "@/lib/utils/auth";

// GET - Fetch all integrations
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

    const integrations = await ExternalIntegration.find({
      sellerId: decoded.userId,
    })
      .select(
        "-credentials.apiSecret -credentials.accessToken -credentials.refreshToken"
      )
      .sort({ createdAt: -1 });

    const stats = {
      total: integrations.length,
      connected: integrations.filter((i) => i.status === "connected").length,
      totalSyncs: integrations.reduce((sum, i) => sum + i.stats.totalSyncs, 0),
      totalProductsSynced: integrations.reduce(
        (sum, i) => sum + i.stats.totalProductsSynced,
        0
      ),
    };

    return NextResponse.json({
      success: true,
      integrations,
      stats,
    });
  } catch (error) {
    console.error("Integrations GET Error:", error);
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

// POST - Create new integration
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

    const integrationData = await request.json();

    // Check if integration already exists
    const existing = await ExternalIntegration.findOne({
      sellerId: decoded.userId,
      platform: integrationData.platform,
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Integration already exists for this platform",
        },
        { status: 400 }
      );
    }

    const integration = await ExternalIntegration.create({
      ...integrationData,
      sellerId: decoded.userId,
    });

    return NextResponse.json({
      success: true,
      message: "Integration created successfully",
      integration,
    });
  } catch (error) {
    console.error("Integration POST Error:", error);
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
