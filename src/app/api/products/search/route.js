// app/api/products/search/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Product from "@/lib/db/models/Product";

/**
 * Enhanced Product Search & Filter API
 * GET /api/products/search
 * Handles search with proper brand filtering
 */
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    // Parse all parameters
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const minPrice = parseFloat(searchParams.get("minPrice")) || 0;
    const maxPrice = parseFloat(searchParams.get("maxPrice")) || Infinity;
    const brand = searchParams.get("brand") || "";
    const rating = parseFloat(searchParams.get("rating")) || 0;
    const verified = searchParams.get("verified") === "true";
    const fastDelivery = searchParams.get("fastDelivery") === "true";
    const sortBy = searchParams.get("sortBy") || "relevance";
    const order = searchParams.get("order") || "desc";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const country = searchParams.get("country") || "IN";

    // Build base query
    let query = {
      isActive: true,
      isApproved: true,
      isDraft: { $ne: true },
    };

    // IMPORTANT: Handle brand filter FIRST (before search)
    // If brand is selected, it takes priority
    if (brand) {
      query.brand = { $regex: brand, $options: "i" };
    }

    // Search filter - but only if NO brand is selected
    // OR apply search in addition to brand filter
    if (search) {
      // If brand is already filtered, search within those brand products
      if (brand) {
        // Search only in name, description, keywords for that brand
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { keywords: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ];
      } else {
        // No brand filter - search everywhere including brand
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { keywords: { $regex: search, $options: "i" } },
          { brand: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
        ];
      }
    }

    // Category filter
    if (category) {
      query.category = { $regex: category, $options: "i" };
    }

    // Price range filter
    if (minPrice > 0 || maxPrice < Infinity) {
      query["pricing.salePrice"] = {};
      if (minPrice > 0) query["pricing.salePrice"].$gte = minPrice;
      if (maxPrice < Infinity) query["pricing.salePrice"].$lte = maxPrice;
    }

    // Rating filter
    if (rating > 0) {
      query["ratings.average"] = { $gte: rating };
    }

    // Verified seller filter
    if (verified) {
      query.isVerified = true;
    }

    // Fast delivery filter
    if (fastDelivery) {
      query["shipping.fastDelivery"] = true;
    }

    // Build sort object
    let sort = {};
    if (sortBy === "relevance") {
      sort = { "ratings.average": -1, "ratings.count": -1 };
    } else if (sortBy === "createdAt") {
      sort = { createdAt: order === "desc" ? -1 : 1 };
    } else if (sortBy === "pricing.salePrice") {
      sort = { "pricing.salePrice": order === "desc" ? -1 : 1 };
    } else if (sortBy === "ratings.average") {
      sort = {
        "ratings.average": order === "desc" ? -1 : 1,
        "ratings.count": -1,
      };
    } else if (sortBy === "name") {
      sort = { name: order === "desc" ? -1 : 1 };
    } else {
      sort = { createdAt: -1 };
    }

    // Execute queries in parallel
    const [products, totalCount, allBrands, allCategories] = await Promise.all([
      Product.find(query)
        .select(
          "name brand images pricing inventory category ratings highlights shipping createdAt isBestSeller isNewArrival isPremium variants",
        )
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
      // Get ALL brands with counts for filter sidebar
      Product.aggregate([
        {
          $match: { isActive: true, isApproved: true, isDraft: { $ne: true } },
        },
        { $group: { _id: "$brand", count: { $sum: 1 } } },
        { $match: { _id: { $ne: null, $ne: "" } } },
        { $sort: { count: -1 } },
      ]),
      // Get ALL categories for filter
      Product.distinct("category", { isActive: true, isApproved: true }),
    ]);

    // Enrich products and expand variants
    const enrichedProducts = [];

    products.forEach((product) => {
      const discount =
        product.pricing?.basePrice && product.pricing?.salePrice
          ? Math.round(
              ((product.pricing.basePrice - product.pricing.salePrice) /
                product.pricing.basePrice) *
                100,
            )
          : 0;

      const baseProductData = {
        ...product,
        discount,
        inStock: (product.inventory?.stock || 0) > 0,
        lowStock:
          (product.inventory?.stock || 0) <=
          (product.inventory?.lowStockThreshold || 10),
        freeShipping: product.shipping?.freeShipping || false,
      };

      // Check if product has variants
      if (
        product.variants &&
        Array.isArray(product.variants) &&
        product.variants.length > 0
      ) {
        // Create a separate entry for each variant
        product.variants.forEach((variant, index) => {
          enrichedProducts.push({
            ...baseProductData,
            // Override product name to include variant name
            name: `${variant.name} ${product.name}`,
            // Use variant-specific data if available
            pricing: {
              ...product.pricing,
              salePrice: variant.price || product.pricing?.salePrice,
              basePrice: variant.originalPrice || product.pricing?.basePrice,
            },
            images:
              variant.images && variant.images.length > 0
                ? variant.images.map((img) => ({ url: img, alt: variant.name }))
                : product.images,
            inventory: {
              ...product.inventory,
              stock:
                variant.stock !== undefined
                  ? variant.stock
                  : product.inventory?.stock,
            },
            // Add variant info for reference
            variantInfo: {
              variantIndex: index,
              variantName: variant.name,
              isVariant: true,
            },
          });
        });
      } else {
        // No variants, add product as-is
        enrichedProducts.push(baseProductData);
      }
    });

    // Get price range
    const priceStats = await Product.aggregate([
      { $match: { isActive: true, isApproved: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$pricing.salePrice" },
          maxPrice: { $max: "$pricing.salePrice" },
        },
      },
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      products: enrichedProducts,
      stats: {
        total: totalCount,
        // Add more stats if needed
      },
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: totalPages,
      },
      // Return filter options with counts
      filterOptions: {
        brands: allBrands.map((b) => ({
          name: b._id,
          count: b.count,
        })),
        categories: allCategories.filter(Boolean).sort(),
        priceRange: {
          min: priceStats[0]?.minPrice || 0,
          max: priceStats[0]?.maxPrice || 100000,
        },
      },
      appliedFilters: {
        search,
        category,
        brand,
        minPrice: minPrice > 0 ? minPrice : null,
        maxPrice: maxPrice < Infinity ? maxPrice : null,
        rating,
        verified,
        fastDelivery,
        sortBy,
        order,
      },
    });
  } catch (error) {
    console.error("❌ Product Search API error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
