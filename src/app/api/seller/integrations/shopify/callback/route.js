// app/api/seller/integrations/shopify/callback/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";
import crypto from "crypto";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const shop = searchParams.get("shop");
    const state = searchParams.get("state");
    const hmac = searchParams.get("hmac");

    if (!code || !shop || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/seller/integrations?error=missing_params`
      );
    }

    // Verify HMAC (security check)
    const queryString = request.url.split("?")[1];
    const params = new URLSearchParams(queryString);
    params.delete("hmac");
    const sortedParams = Array.from(params.entries())
      .sort()
      .map(([key, val]) => `${key}=${val}`)
      .join("&");
    const calculatedHmac = crypto
      .createHmac("sha256", process.env.SHOPIFY_API_SECRET)
      .update(sortedParams)
      .digest("hex");

    if (calculatedHmac !== hmac) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/seller/integrations?error=invalid_hmac`
      );
    }

    // Decode state to get seller ID
    const { sellerId } = JSON.parse(Buffer.from(state, "base64").toString());

    // Exchange code for access token
    const tokenResponse = await fetch(
      `https://${shop}/admin/oauth/access_token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.SHOPIFY_API_KEY,
          client_secret: process.env.SHOPIFY_API_SECRET,
          code,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/seller/integrations?error=token_exchange_failed`
      );
    }

    // Encrypt access token before storing
    const encryptedToken = Buffer.from(tokenData.access_token).toString(
      "base64"
    ); // Simple encoding, use proper encryption in production

    // Update seller with Shopify integration
    await User.findByIdAndUpdate(sellerId, {
      "shopifyIntegration.isConnected": true,
      "shopifyIntegration.shopDomain": shop,
      "shopifyIntegration.accessToken": encryptedToken,
      "shopifyIntegration.lastSyncAt": null,
      "shopifyIntegration.syncSettings": {
        autoSyncProducts: true,
        autoSyncInventory: true,
        autoSyncOrders: false,
        syncInterval: "daily",
      },
    });

    // Redirect back to integrations page with success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/seller/integrations?success=shopify_connected`
    );
  } catch (error) {
    console.error("Shopify callback error:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/seller/integrations?error=connection_failed`
    );
  }
}
