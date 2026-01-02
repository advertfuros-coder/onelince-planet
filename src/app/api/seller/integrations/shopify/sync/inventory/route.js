// app/api/seller/integrations/shopify/sync/inventory/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";
import Product from "@/lib/db/models/Product";
import jwt from "jsonwebtoken";

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

    await connectDB();

    const seller = await User.findById(decoded.userId);

    if (!seller || !seller.shopifyIntegration?.isConnected) {
      return NextResponse.json(
        {
          success: false,
          message: "Shopify not connected",
        },
        { status: 400 }
      );
    }

    // Decrypt access token
    const accessToken = Buffer.from(
      seller.shopifyIntegration.accessToken,
      "base64"
    ).toString();
    const shopDomain = seller.shopifyIntegration.shopDomain;

    // Get all products imported from Shopify
    const products = await Product.find({
      seller: decoded.userId,
      importedFrom: "shopify",
      shopifyProductId: { $exists: true },
    });

    let syncedCount = 0;

    for (const product of products) {
      try {
        // Fetch product from Shopify to get latest inventory
        const shopifyResponse = await fetch(
          `https://${shopDomain}/admin/api/2024-01/products/${product.shopifyProductId}.json`,
          {
            headers: {
              "X-Shopify-Access-Token": accessToken,
              "Content-Type": "application/json",
            },
          }
        );

        if (shopifyResponse.ok) {
          const { product: shopifyProduct } = await shopifyResponse.json();

          // Update inventory
          const totalStock = shopifyProduct.variants.reduce(
            (sum, v) => sum + (v.inventory_quantity || 0),
            0
          );

          await Product.findByIdAndUpdate(product._id, {
            "inventory.stock": totalStock,
          });

          syncedCount++;
        }
      } catch (err) {
        console.error(
          `Failed to sync inventory for product ${product._id}:`,
          err
        );
      }
    }

    // Update last sync time
    await User.findByIdAndUpdate(decoded.userId, {
      "shopifyIntegration.lastSyncAt": new Date(),
    });

    return NextResponse.json({
      success: true,
      count: syncedCount,
      message: `Successfully synced inventory for ${syncedCount} products`,
    });
  } catch (error) {
    console.error("Shopify inventory sync error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to sync inventory",
      },
      { status: 500 }
    );
  }
}
