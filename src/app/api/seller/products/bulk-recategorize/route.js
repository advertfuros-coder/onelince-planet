// API Route: /api/seller/products/bulk-recategorize/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import Product from "@/lib/db/models/Product";
import Category from "@/lib/db/models/Category";
import jwt from "jsonwebtoken";

/**
 * POST /api/seller/products/bulk-recategorize
 * Bulk recategorize multiple products at once
 *
 * Request Body:
 * {
 *   productIds: string[] (required) - Array of product IDs to recategorize
 *   categoryId: string (required) - New category ID
 *   categoryPath: string (required) - New category path
 * }
 */
export async function POST(request) {
  try {
    await dbConnect();

    // Verify seller authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const sellerId = decoded.id;

    // Parse request body
    const body = await request.json();
    const { productIds, categoryId, categoryPath } = body;

    // Validation
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Product IDs are required (must be an array)",
        },
        { status: 400 }
      );
    }

    if (!categoryId || !categoryPath) {
      return NextResponse.json(
        { success: false, message: "Category ID and path are required" },
        { status: 400 }
      );
    }

    // Limit to 1000 products per batch for safety
    if (productIds.length > 1000) {
      return NextResponse.json(
        { success: false, message: "Maximum 1000 products per batch" },
        { status: 400 }
      );
    }

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category || !category.isActive) {
      return NextResponse.json(
        { success: false, message: "Invalid or inactive category" },
        { status: 400 }
      );
    }

    // Get category name for display
    const categoryName = category.name;

    // Track results
    const results = {
      total: productIds.length,
      updated: 0,
      failed: 0,
      errors: [],
    };

    // Process in batches of 50 for better performance
    const batchSize = 50;
    for (let i = 0; i < productIds.length; i += batchSize) {
      const batch = productIds.slice(i, i + batchSize);

      try {
        // Use bulkWrite for efficient updates
        const bulkOps = batch.map((productId) => ({
          updateOne: {
            filter: {
              _id: productId,
              sellerId: sellerId, // Ensure seller owns the product
            },
            update: {
              $set: {
                category: categoryId,
                categoryPath: categoryPath,
                // Store category name as string for backwards compatibility
                categoryName: categoryName,
                updatedAt: new Date(),
              },
            },
          },
        }));

        const result = await Product.bulkWrite(bulkOps, { ordered: false });
        results.updated += result.modifiedCount;

        // Track failures in this batch
        const expectedUpdates = batch.length;
        const actualUpdates = result.modifiedCount;
        if (actualUpdates < expectedUpdates) {
          const failedCount = expectedUpdates - actualUpdates;
          results.failed += failedCount;

          // Find which products failed (optional, can be expensive)
          const verifyBatch = await Product.find({
            _id: { $in: batch },
            sellerId: sellerId,
          }).select("_id");

          const updatedIds = verifyBatch.map((p) => p._id.toString());
          const failedIds = batch.filter((id) => !updatedIds.includes(id));

          failedIds.forEach((id) => {
            results.errors.push({
              productId: id,
              reason: "Product not found or unauthorized",
            });
          });
        }
      } catch (batchError) {
        console.error("Batch update error:", batchError);
        results.failed += batch.length;
        batch.forEach((id) => {
          results.errors.push({
            productId: id,
            reason: batchError.message || "Update failed",
          });
        });
      }
    }

    // Update category product count (optional, for analytics)
    try {
      const productCount = await Product.countDocuments({
        category: categoryId,
        isActive: true,
      });
      await Category.findByIdAndUpdate(categoryId, {
        productCount: productCount,
      });
    } catch (countError) {
      console.error("Category count update error:", countError);
      // Non-critical, don't fail the request
    }

    return NextResponse.json({
      success: true,
      data: {
        total: results.total,
        updated: results.updated,
        failed: results.failed,
        errors: results.errors.slice(0, 10), // Return max 10 errors to avoid huge payloads
        category: {
          id: categoryId,
          name: categoryName,
          path: categoryPath,
        },
      },
      message: `Successfully updated ${results.updated} of ${results.total} products`,
    });
  } catch (error) {
    console.error("[API] /api/seller/products/bulk-recategorize error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to bulk recategorize products",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
