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
    const country = searchParams.get("country"); // IN or AE

    // Build query
    const query = { isActive: true, isApproved: true, isDraft: { $ne: true } };

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

    // Aggregation pipeline for cross-model filtering
    let pipeline = [{ $match: query }];

    // Region/Country filtering - Filter by seller's business country
    if (country) {
      pipeline.push(
        {
          $lookup: {
            from: "sellers",
            localField: "sellerId",
            foreignField: "_id",
            as: "seller_info",
          },
        },
        { $unwind: "$seller_info" },
        {
          $match: {
            "seller_info.businessInfo.country": country, // Direct match on country code (IN or AE)
          },
        },
      );
    }

    // Total count calculation (for pagination)
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Product.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Add sorting, skip, and limit to pipeline
    pipeline.push({ $sort: { [sortBy]: order === "desc" ? -1 : 1 } });
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });

    // Execute query
    let products = await Product.aggregate(pipeline);

    // Populate sellerId field from the lookup results or fetch them manually for the results
    // Since aggregate doesn't use Mongoose populate, we'll manually fetch seller info for the current page
    const sellerIds = [...new Set(products.map((p) => p.sellerId))];
    const sellers = await (
      await import("@/lib/db/models/Seller")
    ).default
      .find({
        _id: { $in: sellerIds },
      })
      .select("businessInfo storeInfo personalDetails isVerified ratings")
      .lean();

    const sellerMap = sellers.reduce((acc, s) => {
      acc[s._id.toString()] = s;
      return acc;
    }, {});

    products = products.map((p) => ({
      ...p,
      sellerId: sellerMap[p.sellerId?.toString()] || null,
    }));

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
      { status: 500 },
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
        { status: 401 },
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
      { status: 201 },
    );
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
