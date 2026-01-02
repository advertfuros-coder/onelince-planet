// app/api/seller/integrations/woocommerce/status/route.js
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
      "wooCommerceIntegration"
    );

    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller not found" },
        { status: 404 }
      );
    }

    // Don't send credentials to frontend
    const integration = seller.wooCommerceIntegration
      ? {
          isConnected: seller.wooCommerceIntegration.isConnected || false,
          storeUrl: seller.wooCommerceIntegration.storeUrl || null,
          keyLastFour: seller.wooCommerceIntegration.keyLastFour || null,
          lastSyncAt: seller.wooCommerceIntegration.lastSyncAt || null,
          isTokenValid: seller.wooCommerceIntegration.isTokenValid || false,
          syncSettings: seller.wooCommerceIntegration.syncSettings || {
            autoSyncProducts: true,
            autoSyncInventory: true,
            autoSyncOrders: false,
            syncInterval: "daily",
          },
        }
      : {
          isConnected: false,
          storeUrl: null,
          lastSyncAt: null,
          syncSettings: null,
        };

    return NextResponse.json({
      success: true,
      integration,
    });
  } catch (error) {
    console.error("Get WooCommerce status error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get integration status",
      },
      { status: 500 }
    );
  }
}
