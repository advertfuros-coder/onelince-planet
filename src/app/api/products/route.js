// app/api/products/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Product from "@/lib/db/models/Product";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const brand = searchParams.get("brand");
    const rating = searchParams.get("rating");
    const verified = searchParams.get("verified") === "true";
    const fastDelivery = searchParams.get("fastDelivery") === "true";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";
    const ids = searchParams.get("ids"); // Comma-separated product IDs

    // Build query
    const query = { isActive: true, isDraft: { $ne: true } };

    // Fetch by specific IDs (for recently viewed)
    if (ids) {
      const idArray = ids.split(",").filter((id) => id.trim());
      query._id = { $in: idArray };
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    // Price filter
    if (minPrice || maxPrice) {
      query["pricing.salePrice"] = {};
      if (minPrice) query["pricing.salePrice"].$gte = parseFloat(minPrice);
      if (maxPrice) query["pricing.salePrice"].$lte = parseFloat(maxPrice);
    }

    // Brand filter
    if (brand) {
      query.brand = { $regex: brand, $options: "i" };
    }

    // Rating filter
    if (rating) {
      query["ratings.average"] = { $gte: parseFloat(rating) };
    }

    // Verified seller filter
    if (verified) {
      query.isVerified = true;
    }

    // Fast delivery filter (products with stock > 10)
    if (fastDelivery) {
      query["inventory.stock"] = { $gte: 10 };
    }

    // Count total documents
    const total = await Product.countDocuments(query);

    // Execute query with pagination
    const products = await Product.find(query)
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    return NextResponse.json({
      success: true,
      products,
      totalPages: Math.ceil(total / limit),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // TODO: Verify token and get seller ID
    const productData = await request.json();

    const product = await Product.create(productData);

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
