// app/api/seller/integrations/shopify/connect/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";
import jwt from "jsonwebtoken";
import { encryptData, getLastChars } from "@/lib/security/encryption";

/**
 * Connect Shopify store using Admin API Access Token
 * This replaces the OAuth flow with a simpler, more secure approach
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
    const { shopDomain, accessToken } = body;

    // Validate input
    if (!shopDomain || !accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Shop domain and access token are required",
        },
        { status: 400 }
      );
    }

    // Clean shop domain (remove https://, trailing slashes, etc.)
    const cleanDomain = shopDomain
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "")
      .trim();

    // Validate shop domain format
    if (
      !cleanDomain.includes(".myshopify.com") &&
      !cleanDomain.match(/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid shop domain. Use format: yourstore.myshopify.com",
        },
        { status: 400 }
      );
    }

    // Validate token by making a test API call
    let shopInfo;
    try {
      const testResponse = await fetch(
        `https://${cleanDomain}/admin/api/2024-01/shop.json`,
        {
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        console.error("Shopify API error:", errorText);
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid access token or shop domain. Please check your credentials.",
          },
          { status: 400 }
        );
      }

      const data = await testResponse.json();
      shopInfo = data.shop;

      // Verify the shop domain matches
      if (
        shopInfo.domain !== cleanDomain &&
        shopInfo.myshopify_domain !== cleanDomain
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Shop domain does not match the provided token",
          },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("Token validation error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to validate Shopify credentials. Please try again.",
        },
        { status: 500 }
      );
    }

    await connectDB();

    // Check if another seller already connected this shop
    const existingConnection = await User.findOne({
      _id: { $ne: decoded.userId },
      "shopifyIntegration.shopDomain": cleanDomain,
      "shopifyIntegration.isConnected": true,
    });

    if (existingConnection) {
      return NextResponse.json(
        {
          success: false,
          message: "This Shopify store is already connected to another account",
        },
        { status: 409 }
      );
    }

    // Encrypt the access token using seller ID as salt
    const { encrypted, iv, authTag } = encryptData(accessToken, decoded.userId);

    // Get scopes from API version header or use defaults
    const scopes = [
      "read_products",
      "write_products",
      "read_inventory",
      "write_inventory",
      "read_orders",
    ];

    // Update seller with encrypted credentials
    await User.findByIdAndUpdate(decoded.userId, {
      "shopifyIntegration.isConnected": true,
      "shopifyIntegration.shopDomain": cleanDomain,
      "shopifyIntegration.encryptedToken": encrypted,
      "shopifyIntegration.tokenIV": iv,
      "shopifyIntegration.tokenAuthTag": authTag,
      "shopifyIntegration.tokenLastFour": getLastChars(accessToken, 4),
      "shopifyIntegration.tokenCreatedAt": new Date(),
      "shopifyIntegration.tokenLastValidated": new Date(),
      "shopifyIntegration.tokenScopes": scopes,
      "shopifyIntegration.isTokenValid": true,
      "shopifyIntegration.failedAttempts": 0,
      "shopifyIntegration.syncSettings": {
        autoSyncProducts: true,
        autoSyncInventory: true,
        autoSyncOrders: false,
        syncInterval: "daily",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Shopify store connected successfully",
      shopInfo: {
        name: shopInfo.name,
        domain: cleanDomain,
        email: shopInfo.email,
        currency: shopInfo.currency,
        timezone: shopInfo.timezone,
      },
    });
  } catch (error) {
    console.error("Shopify connect error:", error);

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
        message: "Failed to connect Shopify store. Please try again.",
      },
      { status: 500 }
    );
  }
}
