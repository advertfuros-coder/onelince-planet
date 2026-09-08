// app/api/customer/products-search/route.js
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
 * Dedicated API for Customer Product Search & Listing
 * GET /api/customer/products-search
 * Optimized for the customer-facing products page with advanced filtering
 */
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    // Parse all filter parameters
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

    // Build query
    let query = {
      isActive: true,
      isApproved: true,
      isDraft: { $ne: true },
    };

    const knownBrands = await getKnownBrands(Product);

    // Clean, tokenized search filter
    if (search || brand) {
      const { brandFilter, textFilter } = buildProductSearchFilter(
        search,
        brand,
        knownBrands
      );

      if (brandFilter) {
        Object.assign(query, brandFilter);
      }
      if (textFilter) {
        query.$and = query.$and || [];
        query.$and.push(textFilter);
      }
    }

    // Category filter
    if (category || subcategory) {
      const categoryFilter = await buildCategoryFilter(category, subcategory);
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

    // Brand filter
    if (brand) {
      query.brand = { $regex: brand, $options: "i" };
    }

    // Rating filter
    if (rating > 0) {
      query["ratings.average"] = { $gte: rating };
    }

    // Verified seller filter
    if (verified) {
      // This would require joining with Seller collection
      // For now, we'll add it as a feature flag
      query.isVerified = true;
    }

    // Fast delivery filter
    if (fastDelivery) {
      query["shipping.fastDelivery"] = true;
    }

    // Build sort object
    let sort = {};
    if (sortBy === "relevance") {
      sort = { "ratings.average": -1, "ratings.count": -1, createdAt: -1 };
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
            $lookup: {
              from: "sellers",
              localField: "sellerId",
              foreignField: "_id",
              as: "seller",
            },
          },
          {
            $unwind: {
              path: "$seller",
              preserveNullAndEmptyArrays: true,
            },
          },
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
              seller: {
                businessInfo: 1,
                storeInfo: 1,
                ratings: 1,
                verificationStatus: 1,
              },
              isVerified: 1,
              shipping: 1,
              createdAt: 1,
              variants: 1,
              relevanceScore: 1,
            },
          },
        ])
      : Product.find(query)
          .select(
            "name brand images pricing inventory category ratings highlights seller isVerified shipping createdAt variants",
          )
          .populate("seller", "businessInfo storeInfo ratings verificationStatus")
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();

    // Execute query with pagination
    const [products, totalCount] = await Promise.all([
      productsPromise,
      Product.countDocuments(query),
    ]);

    // Calculate additional metadata for each product and expand variants
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
        fastDelivery: product.shipping?.fastDelivery || false,
        sellerRating: product.seller?.ratings?.average || 0,
        sellerVerified: product.seller?.verificationStatus === "verified",
      };

      // Check if product has variants
      if (
        product.variants &&
        Array.isArray(product.variants) &&
        product.variants.length > 0
      ) {
        // Create a separate entry for each variant
        product.variants.forEach((variant) => {
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
                ? variant.images
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
              variantId: variant._id,
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

    console.log("🔍 Total products fetched:", products.length);
    console.log(
      "🔍 Total enriched products (with variants expanded):",
      enrichedProducts.length,
    );
    console.log(
      "🔍 Sample enriched product names:",
      enrichedProducts.slice(0, 5).map((p) => p.name),
    );
    // Get filter options for sidebar
    const [categories, brands] = await Promise.all([
      Product.distinct("category", { isActive: true, isApproved: true }),
      Product.distinct("brand", { isActive: true, isApproved: true }),
    ]);

    // Calculate price range
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
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: totalCount,
        productsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      filters: {
        categories: categories.filter(Boolean).sort(),
        brands: brands.filter(Boolean).sort(),
        priceRange: {
          min: priceStats[0]?.minPrice || 0,
          max: priceStats[0]?.maxPrice || 10000,
        },
      },
      appliedFilters: {
        search,
        category,
        minPrice: minPrice > 0 ? minPrice : null,
        maxPrice: maxPrice < Infinity ? maxPrice : null,
        brand,
        rating,
        verified,
        fastDelivery,
        sortBy,
        order,
      },
    });
  } catch (error) {
    console.error("❌ Customer Products Search API error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
