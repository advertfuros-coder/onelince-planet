// app/api/seller/integrations/woocommerce/connect/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";
import jwt from "jsonwebtoken";
import { encryptData, getLastChars } from "@/lib/security/encryption";

/**
 * Connect WooCommerce store using Consumer Key and Consumer Secret
 */
export async function POST(request) {
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

    const body = await request.json();
    const { storeUrl, consumerKey, consumerSecret } = body;

    // Validate input
    if (!storeUrl || !consumerKey || !consumerSecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Store URL, Consumer Key, and Consumer Secret are required",
        },
        { status: 400 }
      );
    }

    // Clean store URL
    let cleanUrl = storeUrl.trim();
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = "https://" + cleanUrl;
    }
    cleanUrl = cleanUrl.replace(/\/$/, ""); // Remove trailing slash

    // Validate URL format
    try {
      new URL(cleanUrl);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid store URL format",
        },
        { status: 400 }
      );
    }

    // Validate credentials by making a test API call
    let storeInfo;
    try {
      const testUrl = `${cleanUrl}/wp-json/wc/v3/system_status`;
      const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
        "base64"
      );

      const testResponse = await fetch(testUrl, {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      });

      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        console.error("WooCommerce API error:", errorText);
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid credentials or store URL. Please check your WooCommerce REST API keys.",
          },
          { status: 400 }
        );
      }

      const data = await testResponse.json();
      storeInfo = {
        name: data.settings?.general_store_name || "WooCommerce Store",
        version: data.environment?.version || "Unknown",
        currency: data.settings?.currency || "USD",
        timezone: data.settings?.timezone || "UTC",
      };
    } catch (error) {
      console.error("WooCommerce validation error:", error);
      return NextResponse.json(
        {
          success: false,
          message:
            "Failed to connect to WooCommerce store. Please verify your store URL and credentials.",
        },
        { status: 500 }
      );
    }

    await connectDB();

    // Check if another seller already connected this store
    const existingConnection = await User.findOne({
      _id: { $ne: decoded.userId },
      "wooCommerceIntegration.storeUrl": cleanUrl,
      "wooCommerceIntegration.isConnected": true,
    });

    if (existingConnection) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This WooCommerce store is already connected to another account",
        },
        { status: 409 }
      );
    }

    // Encrypt the credentials using seller ID as salt
    const {
      encrypted: encryptedKey,
      iv: keyIV,
      authTag: keyAuthTag,
    } = encryptData(consumerKey, decoded.userId);
    const {
      encrypted: encryptedSecret,
      iv: secretIV,
      authTag: secretAuthTag,
    } = encryptData(consumerSecret, decoded.userId + "_secret");

    // Update seller with encrypted credentials
    await User.findByIdAndUpdate(decoded.userId, {
      "wooCommerceIntegration.isConnected": true,
      "wooCommerceIntegration.storeUrl": cleanUrl,
      "wooCommerceIntegration.encryptedConsumerKey": encryptedKey,
      "wooCommerceIntegration.keyIV": keyIV,
      "wooCommerceIntegration.keyAuthTag": keyAuthTag,
      "wooCommerceIntegration.encryptedConsumerSecret": encryptedSecret,
      "wooCommerceIntegration.secretIV": secretIV,
      "wooCommerceIntegration.secretAuthTag": secretAuthTag,
      "wooCommerceIntegration.keyLastFour": getLastChars(consumerKey, 4),
      "wooCommerceIntegration.tokenCreatedAt": new Date(),
      "wooCommerceIntegration.tokenLastValidated": new Date(),
      "wooCommerceIntegration.isTokenValid": true,
      "wooCommerceIntegration.failedAttempts": 0,
      "wooCommerceIntegration.syncSettings": {
        autoSyncProducts: true,
        autoSyncInventory: true,
        autoSyncOrders: false,
        syncInterval: "daily",
      },
    });

    return NextResponse.json({
      success: true,
      message: "WooCommerce store connected successfully",
      storeInfo: {
        name: storeInfo.name,
        url: cleanUrl,
        version: storeInfo.version,
        currency: storeInfo.currency,
        timezone: storeInfo.timezone,
      },
    });
  } catch (error) {
    console.error("WooCommerce connect error:", error);

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid authentication token",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect WooCommerce store. Please try again.",
      },
      { status: 500 }
    );
  }
}
