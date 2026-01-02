// app/api/seller/integrations/amazon/status/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await connectDB();

    const seller = await User.findById(decoded.userId).select(
      "amazonIntegration"
    );

    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller not found" },
        { status: 404 }
      );
    }

    // Don't send credentials to frontend
    const integration = seller.amazonIntegration
      ? {
          isConnected: seller.amazonIntegration.isConnected || false,
          sellerId: seller.amazonIntegration.sellerId || null,
          region: seller.amazonIntegration.region || null,
          marketplaceId: seller.amazonIntegration.marketplaceId || null,
          accessKeyLastFour: seller.amazonIntegration.accessKeyLastFour || null,
          lastSyncAt: seller.amazonIntegration.lastSyncAt || null,
          isTokenValid: seller.amazonIntegration.isTokenValid || false,
          syncSettings: seller.amazonIntegration.syncSettings || {
            autoSyncProducts: true,
            autoSyncInventory: true,
            autoSyncOrders: false,
            syncInterval: "daily",
          },
        }
      : {
          isConnected: false,
          sellerId: null,
          lastSyncAt: null,
          syncSettings: null,
        };

    return NextResponse.json({
      success: true,
      integration,
    });
  } catch (error) {
    console.error("Get Amazon status error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get integration status",
      },
      { status: 500 }
    );
  }
}
