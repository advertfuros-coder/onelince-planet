// app/api/search/suggestions/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Product from "@/lib/db/models/Product";
import Category from "@/lib/db/models/Category";

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
      products: products.map((product) => ({
        type: "product",
        id: product._id,
        name: product.name,
        slug: product.slug || product._id,
        image: product.images?.[0]?.url || null,
        price: product.pricing?.salePrice || product.pricing?.basePrice || 0,
        category: product.category?.name || "Uncategorized",
        rating: product.ratings?.average || 0,
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
      { status: 500 }
    );
  }
}

/**
 * Search products by name, keywords, tags
 */
async function searchProducts(query, limit) {
  const searchRegex = new RegExp(query, "i");

  return Product.find({
    isActive: true,
    isDraft: false,
    $or: [
      { name: searchRegex },
      { keywords: searchRegex },
      { tags: searchRegex },
      { brand: searchRegex },
    ],
  })
    .select("name images pricing slug category ratings")
    .populate("category", "name")
    .limit(limit)
    .sort({ "ratings.average": -1, "inventory.soldCount": -1 })
    .lean();
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
