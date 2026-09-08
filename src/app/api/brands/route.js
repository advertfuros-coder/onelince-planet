import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Product from "@/lib/db/models/Product";
import { buildCategoryFilter } from "@/lib/db/utils/categoryMatcher";
import { buildProductSearchFilter, getKnownBrands } from "@/lib/db/utils/searchHelper";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory") || searchParams.get("sub") || "";
    const search = searchParams.get("search") || "";

    // Build query
    const query = { isActive: true, isApproved: true, isDraft: { $ne: true } };
    if (category || subcategory) {
      const categoryFilter = await buildCategoryFilter(category, subcategory);
      if (categoryFilter) {
        query.$and = query.$and || [];
        query.$and.push(categoryFilter);
      }
    }

    if (search) {
      const knownBrands = await getKnownBrands(Product);
      const { brandFilter, textFilter } = buildProductSearchFilter(search, "", knownBrands);
      if (brandFilter) {
        Object.assign(query, brandFilter);
      }
      if (textFilter) {
        query.$and = query.$and || [];
        query.$and.push(textFilter);
      }
    }

    // Get unique brands with counts
    const brands = await Product.aggregate([
      { $match: query },
      { $group: { _id: "$brand", count: { $sum: 1 } } },
      { $match: { _id: { $ne: null, $ne: "" } } }, // Exclude null/empty brands
      { $sort: { count: -1 } },
      { $limit: 20 },
      {
        $project: {
          name: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      brands,
    });
  } catch (error) {
    console.error("Get brands error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
