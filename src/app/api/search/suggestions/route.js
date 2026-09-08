import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Product from "@/lib/db/models/Product";
import Category from "@/lib/db/models/Category";
import { buildProductSearchFilter, buildRelevanceAddFields } from "@/lib/db/utils/searchHelper";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit")) || 10;

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        suggestions: [],
      });
    }

    await connectDB();

    // Search in parallel for better performance
    const [products, categories] = await Promise.all([
      searchProducts(query, limit),
      searchCategories(query, limit),
    ]);

    // Combine and format suggestions
    const suggestions = {
      categories: categories.map((cat) => ({
        type: "category",
        id: cat._id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon || "📦",
        productCount: cat.productCount || 0,
      })),
      products: products.slice(0, limit).map((product) => ({
        type: "product",
        id: product._id,
        name: product.name,
        slug: product.slug || product._id,
        image: product.images?.[0]?.url || null,
        price: product.pricing?.salePrice || product.pricing?.basePrice || 0,
        category: product.category?.name || (typeof product.category === "string" ? product.category : "Uncategorized"),
        rating: product.ratings?.average || 0,
        stock: product.inventory?.stock || 0,
      })),
      total: categories.length + products.length,
    };

    return NextResponse.json({
      success: true,
      query,
      suggestions,
    });
  } catch (error) {
    console.error("Search suggestions error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch suggestions",
        suggestions: { categories: [], products: [], total: 0 },
      },
      { status: 500 },
    );
  }
}

/**
 * Search products with clean token filtering and relevance scoring
 */
async function searchProducts(query, limit) {
  const searchFilter = buildProductSearchFilter(query);
  if (!searchFilter) return [];

  const baseQuery = {
    isActive: true,
    isDraft: { $ne: true },
    ...searchFilter,
  };

  return Product.aggregate([
    { $match: baseQuery },
    buildRelevanceAddFields(query),
    { $sort: { relevanceScore: -1, "ratings.average": -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryDoc",
      },
    },
    {
      $project: {
        name: 1,
        brand: 1,
        images: 1,
        pricing: 1,
        inventory: 1,
        slug: 1,
        ratings: 1,
        variants: 1,
        category: {
          $cond: [
            { $gt: [{ $size: "$categoryDoc" }, 0] },
            { $arrayElemAt: ["$categoryDoc", 0] },
            { name: "$category" },
          ],
        },
      },
    },
  ]);
}

/**
 * Search categories by name, slug
 */
async function searchCategories(query, limit) {
  const searchRegex = new RegExp(query, "i");

  return Category.find({
    isActive: true,
    $or: [
      { name: searchRegex },
      { slug: searchRegex },
      { description: searchRegex },
    ],
  })
    .select("name slug icon description")
    .limit(Math.min(limit, 5)) // Max 5 categories
    .lean();
}
