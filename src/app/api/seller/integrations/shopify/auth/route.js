// app/api/seller/integrations/shopify/auth/route.js
import { NextResponse } from "next/server";
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

    // Generate Shopify OAuth URL
    const shopifyApiKey = process.env.SHOPIFY_API_KEY;
    const scopes =
      process.env.SHOPIFY_SCOPES ||
      "read_products,write_products,read_inventory,write_inventory,read_orders";
    const redirectUri =
      process.env.SHOPIFY_REDIRECT_URI ||
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/seller/integrations/shopify/callback`;

    // Store seller ID in state for callback
    const state = Buffer.from(
      JSON.stringify({ sellerId: decoded.userId })
    ).toString("base64");

    // For now, we'll ask for shop domain via query param or have seller input it
    // In production, you might want to collect this on the frontend first
    const shopDomain = request.nextUrl.searchParams.get("shop");

    if (!shopDomain) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Shop domain is required. Please provide ?shop=yourstore.myshopify.com",
        },
        { status: 400 }
      );
    }

    const authUrl = `https://${shopDomain}/admin/oauth/authorize?client_id=${shopifyApiKey}&scope=${scopes}&redirect_uri=${redirectUri}&state=${state}`;

    return NextResponse.json({
      success: true,
      authUrl,
    });
  } catch (error) {
    console.error("Shopify auth error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to initiate Shopify authentication",
      },
      { status: 500 }
    );
  }
}
