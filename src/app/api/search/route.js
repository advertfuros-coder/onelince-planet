// app/api/search/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Product from "@/lib/db/models/Product";

/**
 * Dedicated API for Global Search Results Page
 * GET /api/search
 * Optimized for the main search page with comprehensive results
 */
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    // Parse search parameters
    const query = searchParams.get("q") || searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const minPrice = parseFloat(searchParams.get("minPrice")) || 0;
    const maxPrice = parseFloat(searchParams.get("maxPrice")) || Infinity;
    const brand = searchParams.get("brand") || "";
    const rating = parseFloat(searchParams.get("rating")) || 0;
    const verified = searchParams.get("verified") === "true";
    const fastDelivery = searchParams.get("fastDelivery") === "true";
    const inStock = searchParams.get("inStock") === "true";
    const sortBy = searchParams.get("sortBy") || "relevance";
    const order = searchParams.get("order") || "desc";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;

    // Build base query - only active and approved products
    let productQuery = {
      isActive: true,
      isApproved: true,
      isDraft: { $ne: true },
    };

    // Search query - comprehensive search across multiple fields
    if (query) {
      productQuery.$or = [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { keywords: { $regex: query, $options: "i" } },
        { brand: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { highlights: { $regex: query, $options: "i" } },
      ];
    }

    // Category filter
    if (category) {
      productQuery.category = { $regex: category, $options: "i" };
    }

    // Price range filter
    if (minPrice > 0 || maxPrice < Infinity) {
      productQuery["pricing.salePrice"] = {};
      if (minPrice > 0) productQuery["pricing.salePrice"].$gte = minPrice;
      if (maxPrice < Infinity)
        productQuery["pricing.salePrice"].$lte = maxPrice;
    }

    // Brand filter
    if (brand) {
      productQuery.brand = { $regex: brand, $options: "i" };
    }

    // Rating filter
    if (rating > 0) {
      productQuery["ratings.average"] = { $gte: rating };
    }

    // Stock filter
    if (inStock) {
      productQuery["inventory.stock"] = { $gt: 0 };
    }

    // Fast delivery filter
    if (fastDelivery) {
      productQuery["shipping.fastDelivery"] = true;
    }

    // Build sort object
    let sort = {};
    if (sortBy === "relevance") {
      // Relevance: prioritize by ratings and review count
      sort = { "ratings.average": -1, "ratings.count": -1, createdAt: -1 };
    } else if (sortBy === "price") {
      sort = { "pricing.salePrice": order === "asc" ? 1 : -1 };
    } else if (sortBy === "rating") {
      sort = { "ratings.average": -1, "ratings.count": -1 };
    } else if (sortBy === "newest") {
      sort = { createdAt: -1 };
    } else if (sortBy === "popular") {
      sort = { "ratings.count": -1, "ratings.average": -1 };
    } else {
      sort = { createdAt: -1 };
    }

    // Execute queries in parallel for better performance
    const [products, totalCount, categories, brands] = await Promise.all([
      Product.find(productQuery)
        .select(
          "name brand images pricing inventory category ratings highlights seller shipping createdAt isBestSeller isNewArrival isPremium",
        )
        .populate("seller", "businessInfo storeInfo ratings verificationStatus")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(productQuery),
      Product.distinct("category", { isActive: true, isApproved: true }),
      Product.distinct("brand", { isActive: true, isApproved: true }),
    ]);

    // Enrich products with calculated fields
    const enrichedProducts = products.map((product) => {
      // Calculate discount percentage
      const discount =
        product.pricing?.basePrice && product.pricing?.salePrice
          ? Math.round(
              ((product.pricing.basePrice - product.pricing.salePrice) /
                product.pricing.basePrice) *
                100,
            )
          : 0;

      // Stock status
      const stockQty = product.inventory?.stock || 0;
      const lowStockThreshold = product.inventory?.lowStockThreshold || 10;

      return {
        ...product,
        discount,
        inStock: stockQty > 0,
        lowStock: stockQty > 0 && stockQty <= lowStockThreshold,
        freeShipping: product.shipping?.freeShipping || false,
        fastDelivery: product.shipping?.fastDelivery || false,
        isVerified: product.seller?.verificationStatus === "verified",
        sellerName:
          product.seller?.storeInfo?.storeName ||
          product.seller?.businessInfo?.businessName,
        sellerRating: product.seller?.ratings?.average || 0,
      };
    });

    // Calculate statistics
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Get price range for filters
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

    return NextResponse.json({
      success: true,
      query: query,
      products: enrichedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: totalCount,
        productsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        startIndex: (page - 1) * limit + 1,
        endIndex: Math.min(page * limit, totalCount),
      },
      filters: {
        categories: categories.filter(Boolean).sort(),
        brands: brands.filter(Boolean).sort(),
        priceRange: {
          min: priceStats[0]?.minPrice || 0,
          max: priceStats[0]?.maxPrice || 100000,
        },
      },
      appliedFilters: {
        search: query,
        category: category || null,
        minPrice: minPrice > 0 ? minPrice : null,
        maxPrice: maxPrice < Infinity ? maxPrice : null,
        brand: brand || null,
        rating: rating > 0 ? rating : null,
        verified,
        fastDelivery,
        inStock,
        sortBy,
        order,
      },
    });
  } catch (error) {
    console.error("❌ Search API error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
