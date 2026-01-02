// app/api/seller/integrations/woocommerce/sync/products/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";
import Product from "@/lib/db/models/Product";
import jwt from "jsonwebtoken";
import { decryptData } from "@/lib/security/encryption";

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

    if (!seller || !seller.wooCommerceIntegration?.isConnected) {
      return NextResponse.json(
        {
          success: false,
          message: "WooCommerce not connected",
        },
        { status: 400 }
      );
    }

    // Decrypt credentials
    const consumerKey = decryptData(
      seller.wooCommerceIntegration.encryptedConsumerKey,
      seller.wooCommerceIntegration.keyIV,
      seller.wooCommerceIntegration.keyAuthTag,
      decoded.userId
    );
    const consumerSecret = decryptData(
      seller.wooCommerceIntegration.encryptedConsumerSecret,
      seller.wooCommerceIntegration.secretIV,
      seller.wooCommerceIntegration.secretAuthTag,
      decoded.userId + "_secret"
    );

    const storeUrl = seller.wooCommerceIntegration.storeUrl;
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
      "base64"
    );

    // Fetch products from WooCommerce
    const wooResponse = await fetch(
      `${storeUrl}/wp-json/wc/v3/products?per_page=100`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!wooResponse.ok) {
      throw new Error("Failed to fetch products from WooCommerce");
    }

    const wooProducts = await wooResponse.json();

    let syncedCount = 0;

    // Import products
    for (const wooProduct of wooProducts) {
      // Map WooCommerce product to your schema
      const productData = {
        sellerId: decoded.userId,
        name: wooProduct.name,
        description:
          wooProduct.description?.replace(/<[^>]*>/g, "") ||
          wooProduct.short_description?.replace(/<[^>]*>/g, "") ||
          "",
        brand: wooProduct.brands?.[0]?.name || "Unknown",
        category: wooProduct.categories?.[0]?.name || "General",
        images:
          wooProduct.images?.map((img, index) => ({
            url: img.src,
            alt: img.alt || wooProduct.name,
            isPrimary: index === 0,
          })) || [],
        pricing: {
          basePrice: parseFloat(
            wooProduct.regular_price || wooProduct.price || 0
          ),
          salePrice: wooProduct.sale_price
            ? parseFloat(wooProduct.sale_price)
            : null,
          currency: "AED", // Adjust based on your needs
        },
        inventory: {
          stock: parseInt(wooProduct.stock_quantity || 0),
          lowStockThreshold: parseInt(wooProduct.low_stock_amount || 10),
          trackInventory: wooProduct.manage_stock || false,
        },
        sku: wooProduct.sku || `WOO-${wooProduct.id}`,
        tags: wooProduct.tags?.map((t) => t.name) || [],
        isActive: wooProduct.status === "publish",
        isApproved: false, // Require admin approval
        isDraft: false,
        wooCommerceProductId: wooProduct.id.toString(),
        importedFrom: "woocommerce",
      };

      // Check if product already exists
      const existingProduct = await Product.findOne({
        sellerId: decoded.userId,
        wooCommerceProductId: wooProduct.id.toString(),
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
      "wooCommerceIntegration.lastSyncAt": new Date(),
    });

    return NextResponse.json({
      success: true,
      count: syncedCount,
      message: `Successfully synced ${syncedCount} products from WooCommerce`,
    });
  } catch (error) {
    console.error("WooCommerce product sync error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to sync products",
      },
      { status: 500 }
    );
  }
}
