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
      products: products.flatMap((product) => {
        // If product has variants, expand each variant as a separate result
        if (product.variants && product.variants.length > 0) {
          const searchRegex = new RegExp(query, "i");
          
          // Filter variants that match the search query
          const matchingVariants = product.variants.filter((v) => {
            const variantFullName = `${v.name} ${product.name}`;
            return searchRegex.test(variantFullName) || 
                   searchRegex.test(product.name) || 
                   searchRegex.test(v.name);
          });

          // If we have matching variants, return them as individual results
          if (matchingVariants.length > 0) {
            return matchingVariants.map((v) => ({
              type: "product",
              id: `${product._id}_${v.sku}`,
              parentId: product._id,
              variantSku: v.sku,
              variantName: v.name,
              name: `${v.name} ${product.name}`, // e.g., "Pineapple Moisturizer Cold Cream"
              slug: product.slug || product._id,
              image: (v.images && v.images[0]) || product.images?.[0]?.url || null,
              price: v.price || product.pricing?.salePrice || product.pricing?.basePrice || 0,
              category: product.category?.name || "Uncategorized",
              rating: product.ratings?.average || 0,
              stock: v.stock || 0,
            }));
          }
        }
        
        // For products without variants or no matching variants, return the base product
        return [
          {
            type: "product",
            id: product._id,
            name: product.name,
            slug: product.slug || product._id,
            image: product.images?.[0]?.url || null,
            price: product.pricing?.salePrice || product.pricing?.basePrice || 0,
            category: product.category?.name || "Uncategorized",
            rating: product.ratings?.average || 0,
          },
        ];
      }).slice(0, limit), // Limit final results after expansion
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
 * Search products by name, keywords, tags, AND variant names
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
      { "variants.name": searchRegex }, // Search within variant names
    ],
  })
    .select("name images pricing slug category ratings variants")
    .populate("category", "name")
    .limit(limit * 2) // Fetch more to account for variant expansion
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
