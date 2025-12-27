// app/api/seller/products/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Product from "@/lib/db/models/Product";
import Seller from "@/lib/db/models/Seller";
import { verifyToken } from "@/lib/utils/auth";

export async function GET(request) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find seller profile
    const seller = await Seller.findOne({ userId: decoded.userId });
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller profile not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    // Use seller._id for querying products
    let query = { sellerId: seller._id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { "inventory.sku": { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    } else if (status === "pending") {
      query.isApproved = false;
    } else if (status === "approved") {
      query.isApproved = true;
    } else if (status === "draft") {
      query.isDraft = true;
    }

    // Default: Don't show drafts in normal lists unless specifically asked
    if (status !== "draft") {
      query.isDraft = { $ne: true };
    }

    let products;
    let total;

    if (status === "low-health") {
      // For low-health, we need to calculate health for all and filter
      // Note: This is acceptable for seller-specific catalogs (~few thousand max)
      const allSellerProducts = await Product.find({
        sellerId: seller._id,
        isDraft: { $ne: true },
      }).lean();

      const calculateHealth = (p) => {
        let score = 0;
        if (p.name?.length > 20) score += 15;
        if (p.description?.length > 100) score += 15;
        if (p.images?.length >= 3) score += 20;
        if (p.highlights && p.highlights.length >= 3) score += 15;
        if (p.category) score += 10;
        if (p.sku) score += 10;
        if (p.keywords?.length > 10) score += 15;
        return Math.min(score, 100);
      };

      const filtered = allSellerProducts.filter((p) => calculateHealth(p) < 70);
      total = filtered.length;
      products = filtered.slice((page - 1) * limit, page * limit);
    } else {
      products = await Product.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
      total = await Product.countDocuments(query);
    }

    // Get stats efficiently
    const allProductsForStats = await Product.find({ sellerId: seller._id, isDraft: { $ne: true } }).select('name description images highlights category inventory.sku keywords').lean();
    
    const calculateHealth = (p) => {
      let score = 0;
      if (p.name?.length > 20) score += 15;
      if (p.description?.length > 100) score += 15;
      if (p.images?.length >= 3) score += 20;
      if (p.highlights && p.highlights.length >= 3) score += 15;
      if (p.category) score += 10;
      if (p.inventory?.sku || p.sku) score += 10;
      if (p.keywords?.length > 10) score += 15;
      return Math.min(score, 100);
    };

    const lowHealthCount = allProductsForStats.filter(p => calculateHealth(p) < 70).length;

    const stats = {
      total: await Product.countDocuments({ sellerId: seller._id }),
      active: await Product.countDocuments({
        sellerId: seller._id,
        isActive: true,
        isDraft: { $ne: true },
      }),
      inactive: await Product.countDocuments({
        sellerId: seller._id,
        isActive: false,
        isDraft: { $ne: true },
      }),
      pending: await Product.countDocuments({
        sellerId: seller._id,
        isApproved: false,
        isDraft: { $ne: true },
      }),
      drafts: await Product.countDocuments({
        sellerId: seller._id,
        isDraft: true,
      }),
      lowStock: await Product.countDocuments({
        sellerId: seller._id,
        isDraft: { $ne: true },
        $expr: { $lte: ["$inventory.stock", "$inventory.lowStockThreshold"] },
      }),
      lowHealth: lowHealthCount
    };

    return NextResponse.json({
      success: true,
      products,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Products GET error:", error);
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
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find seller profile
    const seller = await Seller.findOne({ userId: decoded.userId });
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller profile not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Calculate discount percentage if sale price provided
    if (body.pricing?.salePrice && body.pricing?.basePrice) {
      body.pricing.discountPercentage =
        ((body.pricing.basePrice - body.pricing.salePrice) /
          body.pricing.basePrice) *
        100;
    }

    const product = await Product.create({
      ...body,
      sellerId: seller._id,
      isApproved: false, // Moved to manual/quality-check review queue
    });

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Product POST error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.code === 11000 ? "SKU already exists" : "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
