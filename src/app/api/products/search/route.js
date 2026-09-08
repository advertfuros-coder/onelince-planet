// app/api/products/search/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Product from "@/lib/db/models/Product";
import { buildCategoryFilter } from "@/lib/db/utils/categoryMatcher";
import {
  buildProductSearchFilter,
  buildRelevanceAddFields,
  getKnownBrands,
} from "@/lib/db/utils/searchHelper";

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
    const subcategory = searchParams.get("subcategory") || searchParams.get("sub") || "";
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

    const knownBrands = await getKnownBrands(Product);

    // Clean, tokenized search without description or cross-brand false positives
    let activeBrand = brand;
    if (search || brand) {
      const { brandFilter, textFilter, detectedBrand } = buildProductSearchFilter(
        search,
        brand,
        knownBrands
      );

      if (brandFilter) {
        Object.assign(query, brandFilter);
        activeBrand = detectedBrand;
      }
      if (textFilter) {
        query.$and = query.$and || [];
        query.$and.push(textFilter);
      }
    }

    // Category filter
    let categoryFilter = null;
    if (category || subcategory) {
      categoryFilter = await buildCategoryFilter(category, subcategory);
      if (categoryFilter) {
        query.$and = query.$and || [];
        query.$and.push(categoryFilter);
      }
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

    const isRelevanceSearch = sortBy === "relevance" && Boolean(search && search.trim());

    const productsPromise = isRelevanceSearch
      ? Product.aggregate([
          { $match: query },
          buildRelevanceAddFields(search),
          { $sort: { relevanceScore: -1, "ratings.average": -1, createdAt: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              name: 1,
              brand: 1,
              images: 1,
              pricing: 1,
              inventory: 1,
              category: 1,
              ratings: 1,
              highlights: 1,
              shipping: 1,
              createdAt: 1,
              isBestSeller: 1,
              isNewArrival: 1,
              isPremium: 1,
              variants: 1,
              relevanceScore: 1,
            },
          },
        ])
      : Product.find(query)
          .select(
            "name brand images pricing inventory category ratings highlights shipping createdAt isBestSeller isNewArrival isPremium variants",
          )
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();

    // Query for faceted brands:
    const brandFacetQuery = { ...query };
    if (brand && !search) {
      delete brandFacetQuery.brand;
    }
    const brandsPromise = Product.aggregate([
      { $match: brandFacetQuery },
      { $group: { _id: "$brand", count: { $sum: 1 } } },
      { $match: { _id: { $ne: null, $ne: "" } } },
      { $sort: { count: -1 } },
    ]);

    const categoriesPromise = search
      ? Product.distinct("category", brandFacetQuery)
      : Product.distinct("category", { isActive: true, isApproved: true });

    // Execute queries in parallel
    const [products, totalCount, allBrands, allCategories] = await Promise.all([
      productsPromise,
      Product.countDocuments(query),
      brandsPromise,
      categoriesPromise,
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

      // Add product as a single entry (variants will be selected on the product detail page)
      enrichedProducts.push(baseProductData);
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
