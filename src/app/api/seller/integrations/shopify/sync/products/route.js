// app/api/seller/integrations/shopify/sync/products/route.js
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
    const { decryptData } = await import('@/lib/security/encryption')
    const accessToken = decryptData(
      seller.shopifyIntegration.encryptedToken,
      seller.shopifyIntegration.tokenIV,
      seller.shopifyIntegration.tokenAuthTag,
      decoded.userId
    )
    const shopDomain = seller.shopifyIntegration.shopDomain;

    // Fetch products from Shopify
    const shopifyResponse = await fetch(
      `https://${shopDomain}/admin/api/2024-01/products.json?limit=250`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (!shopifyResponse.ok) {
      throw new Error("Failed to fetch products from Shopify");
    }

    const { products: shopifyProducts } = await shopifyResponse.json();

    let syncedCount = 0;

    // Import products
    for (const shopifyProduct of shopifyProducts) {
      // Map Shopify product to your schema
      const productData = {
        sellerId: decoded.userId,
        name: shopifyProduct.title,
        description: shopifyProduct.body_html?.replace(/<[^>]*>/g, "") || "", // Strip HTML
        brand: shopifyProduct.vendor || "Unknown",
        category: shopifyProduct.product_type || "General",
        images:
          shopifyProduct.images?.map((img) => ({
            url: img.src,
            alt: img.alt || shopifyProduct.title,
            isPrimary: img.position === 1,
          })) || [],
        pricing: {
          basePrice: parseFloat(shopifyProduct.variants[0]?.price || 0),
          salePrice:
            parseFloat(shopifyProduct.variants[0]?.compare_at_price || 0) ||
            null,
          currency: "AED", // Adjust based on your needs
        },
        inventory: {
          stock: shopifyProduct.variants.reduce(
            (sum, v) => sum + (v.inventory_quantity || 0),
            0
          ),
          lowStockThreshold: 10,
          trackInventory: true,
        },
        sku: shopifyProduct.variants[0]?.sku || `SHOPIFY-${shopifyProduct.id}`,
        tags: shopifyProduct.tags?.split(",").map((t) => t.trim()) || [],
        isActive: shopifyProduct.status === "active",
        isApproved: false, // Require admin approval
        isDraft: false,
        shopifyProductId: shopifyProduct.id.toString(),
        importedFrom: "shopify",
      };

      // Check if product already exists
      const existingProduct = await Product.findOne({
        sellerId: decoded.userId,
        shopifyProductId: shopifyProduct.id.toString(),
      });

      if (existingProduct) {
        // Update existing product
        await Product.findByIdAndUpdate(existingProduct._id, productData);
      } else {
        // Create new product
        await Product.create(productData);
      }

      syncedCount++;
    }

    // Update last sync time
    await User.findByIdAndUpdate(decoded.userId, {
      "shopifyIntegration.lastSyncAt": new Date(),
    });

    return NextResponse.json({
      success: true,
      count: syncedCount,
      message: `Successfully synced ${syncedCount} products from Shopify`,
    });
  } catch (error) {
    console.error("Shopify product sync error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to sync products",
      },
      { status: 500 }
    );
  }
}
