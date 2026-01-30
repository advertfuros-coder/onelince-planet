// app/api/seller/products-list/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Product from "@/lib/db/models/Product";
import Seller from "@/lib/db/models/Seller";
import { verifyToken } from "@/lib/utils/auth";

/**
 * Dedicated API for Products List Page
 * GET /api/seller/products-list
 * Optimized for the products listing page with all necessary data
 */
export async function GET(request) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // Get seller profile
    const seller = await Seller.findOne({ userId: decoded.userId });
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller profile not found" },
        { status: 404 },
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    // Build query
    let query = { sellerId: decoded.userId };

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { "inventory.sku": { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Status filters
    if (status === "active") {
      query.isActive = true;
      query.isDraft = { $ne: true };
    } else if (status === "inactive") {
      query.isActive = false;
      query.isDraft = { $ne: true };
    } else if (status === "pending") {
      query.isApproved = false;
      query.isDraft = { $ne: true };
    } else if (status === "approved") {
      query.isApproved = true;
      query.isDraft = { $ne: true };
    } else if (status === "draft") {
      query.isDraft = true;
    } else {
      // Default: Don't show drafts
      query.isDraft = { $ne: true };
    }

    // Calculate product health score
    const calculateHealth = (p) => {
      let score = 0;
      if (p.name?.length > 20) score += 15;
      if (p.description?.length > 100) score += 15;
      if (p.images?.length >= 3) score += 20;
      if (p.highlights && p.highlights.length >= 3) score += 15;
      if (p.category) score += 10;
      if (p.sku || p.inventory?.sku) score += 10;
      if (p.keywords?.length > 10) score += 15;
      return Math.min(score, 100);
    };

    let products;
    let total;

    // Handle low-health filter separately (requires calculation)
    if (status === "low-health") {
      const allProducts = await Product.find({
        sellerId: decoded.userId,
        isDraft: { $ne: true },
      }).lean();

      const lowHealthProducts = allProducts.filter(
        (p) => calculateHealth(p) < 70,
      );
      total = lowHealthProducts.length;
      products = lowHealthProducts.slice((page - 1) * limit, page * limit);
    } else {
      // Regular query with pagination
      products = await Product.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select(
          "name brand images pricing inventory category sku isActive isApproved isDraft ratings description highlights keywords createdAt",
        )
        .lean();

      total = await Product.countDocuments(query);
    }

    // Calculate stats (optimized queries)
    const [
      totalCount,
      activeCount,
      inactiveCount,
      pendingCount,
      draftCount,
      lowStockCount,
    ] = await Promise.all([
      Product.countDocuments({ sellerId: decoded.userId }),
      Product.countDocuments({
        sellerId: decoded.userId,
        isActive: true,
        isDraft: { $ne: true },
      }),
      Product.countDocuments({
        sellerId: decoded.userId,
        isActive: false,
        isDraft: { $ne: true },
      }),
      Product.countDocuments({
        sellerId: decoded.userId,
        isApproved: false,
        isDraft: { $ne: true },
      }),
      Product.countDocuments({
        sellerId: decoded.userId,
        isDraft: true,
      }),
      Product.countDocuments({
        sellerId: decoded.userId,
        isDraft: { $ne: true },
        $expr: { $lte: ["$inventory.stock", "$inventory.lowStockThreshold"] },
      }),
    ]);

    // Calculate low health count (only if needed for stats)
    const allProductsForHealth = await Product.find({
      sellerId: decoded.userId,
      isDraft: { $ne: true },
    })
      .select(
        "name description images highlights category inventory.sku sku keywords",
      )
      .lean();

    const lowHealthCount = allProductsForHealth.filter(
      (p) => calculateHealth(p) < 70,
    ).length;

    // Get unique categories
    const categories = await Product.distinct("category", {
      sellerId: decoded.userId,
    });

    const stats = {
      total: totalCount,
      active: activeCount,
      inactive: inactiveCount,
      pending: pendingCount,
      drafts: draftCount,
      lowStock: lowStockCount,
      lowHealth: lowHealthCount,
    };

    return NextResponse.json({
      success: true,
      products,
      stats,
      categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ Products List API error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
