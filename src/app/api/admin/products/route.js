// app/api/admin/products/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db/mongodb";
import Product from "@/lib/db/models/Product";
import Seller from "@/lib/db/models/Seller";
import Category from "@/lib/db/models/Category";
import { verifyToken, isAdmin } from "@/lib/utils/adminAuth";

export async function GET(request) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";
    const seller = searchParams.get("seller") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";

    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    // Fetch all categories for reference
    const allDbCategories = await Category.find({}).select("_id name slug path").lean();
    const categoryMap = new Map();
    allDbCategories.forEach((c) => {
      categoryMap.set(c._id.toString(), c.name);
    });

    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        const catDoc = allDbCategories.find((c) => c._id.toString() === category);
        const orConditions = [
          { category: category },
          { category: new mongoose.Types.ObjectId(category) },
          { categoryId: new mongoose.Types.ObjectId(category) },
        ];
        if (catDoc) {
          orConditions.push({ category: catDoc.name });
          if (catDoc.path) {
            orConditions.push({ categoryPath: new RegExp(`(^|/)${catDoc.path}(/|$)`, "i") });
          }
        }
        query.$and = query.$and || [];
        query.$and.push({ $or: orConditions });
      } else {
        const catDoc = allDbCategories.find(
          (c) =>
            c.name.toLowerCase() === category.toLowerCase() ||
            c.slug.toLowerCase() === category.toLowerCase()
        );
        const orConditions = [{ category: new RegExp(`^${category}$`, "i") }];
        if (catDoc) {
          orConditions.push(
            { category: catDoc._id },
            { category: catDoc._id.toString() },
            { category: catDoc.name },
            { categoryId: catDoc._id }
          );
          if (catDoc.path) {
            orConditions.push({ categoryPath: new RegExp(`(^|/)${catDoc.path}(/|$)`, "i") });
          }
        }
        query.$and = query.$and || [];
        query.$and.push({ $or: orConditions });
      }
    }
    if (status === "active") query.isActive = true;
    if (status === "inactive") query.isActive = false;
    if (status === "pending") query.isApproved = false;
    if (seller) query.sellerId = seller;

    // Build sort
    const sort = {};
    sort[sortBy] = order === "asc" ? 1 : -1;

    // Fetch products
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    console.log("Sample product sellerId:", products[0]?.sellerId); // Debug log

    // Get unique seller IDs from products
    const sellerIds = [
      ...new Set(products.map((p) => p.sellerId).filter(Boolean)),
    ];

    console.log("Seller IDs to fetch:", sellerIds); // Debug log

    // Try to find sellers by _id first (if sellerId is Seller ObjectId)
    let sellers = await Seller.find({ _id: { $in: sellerIds } })
      .select("businessInfo personalDetails userId")
      .lean();

    console.log("Sellers found by _id:", sellers.length); // Debug log

    // If no sellers found, try finding by userId (if sellerId is User ObjectId)
    if (sellers.length === 0 && sellerIds.length > 0) {
      sellers = await Seller.find({ userId: { $in: sellerIds } })
        .select("businessInfo personalDetails userId")
        .lean();

      console.log("Sellers found by userId:", sellers.length); // Debug log
    }

    // Create seller map - support both _id and userId matching
    const sellerMap = {};
    sellers.forEach((seller) => {
      const flattenedSeller = {
        ...seller,
        businessName: seller.businessInfo?.businessName || seller.businessName,
        email: seller.personalDetails?.email || seller.email
      };
      // Map by seller._id
      sellerMap[seller._id.toString()] = flattenedSeller;
      // Also map by seller.userId (in case product references User)
      if (seller.userId) {
        sellerMap[seller.userId.toString()] = flattenedSeller;
      }
    });

    console.log("Seller map keys:", Object.keys(sellerMap)); // Debug log

    // Attach seller info and resolve category names to products
    const productsWithSeller = products.map((product) => {
      const sellerId = product.sellerId?.toString();
      const catStr = product.category?.toString();
      const resolvedCategoryName = categoryMap.get(catStr) || product.category;

      return {
        ...product,
        category: resolvedCategoryName,
        seller: sellerMap[sellerId] || null,
      };
    });

    const [total, rawCategories] = await Promise.all([
      Product.countDocuments(query),
      Product.distinct("category"),
    ]);

    // Resolve any category that might be an ObjectId or string
    const resolvedCategoriesSet = new Set();
    rawCategories.forEach((cat) => {
      if (!cat) return;
      const catStr = cat.toString();
      if (categoryMap.has(catStr)) {
        resolvedCategoriesSet.add(categoryMap.get(catStr));
      } else if (!mongoose.Types.ObjectId.isValid(catStr)) {
        resolvedCategoriesSet.add(catStr);
      }
    });

    const categories = Array.from(resolvedCategoriesSet).sort((a, b) =>
      a.localeCompare(b)
    );

    // Calculate stats
    const stats = {
      totalProducts: await Product.countDocuments(),
      activeProducts: await Product.countDocuments({ isActive: true }),
      inactiveProducts: await Product.countDocuments({ isActive: false }),
      pendingApproval: await Product.countDocuments({ isApproved: false }),
      outOfStock: await Product.countDocuments({ "inventory.stock": 0 }),
      lowStock: await Product.countDocuments({
        "inventory.stock": { $gt: 0, $lte: 10 },
      }),
    };

    return NextResponse.json({
      success: true,
      products: productsWithSeller,
      stats,
      categories,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    console.error("Products API Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}

// Bulk update products
export async function PATCH(request) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { productIds, action } = await request.json();

    let updateData = {};
    switch (action) {
      case "activate":
        updateData = { isActive: true };
        break;
      case "deactivate":
        updateData = { isActive: false };
        break;
      case "approve":
        updateData = { isApproved: true, isActive: true };
        break;
      case "reject":
        updateData = { isApproved: false, isActive: false };
        break;
      case "delete":
        await Product.deleteMany({ _id: { $in: productIds } });
        return NextResponse.json({
          success: true,
          message: "Products deleted successfully",
        });
      default:
        return NextResponse.json(
          { success: false, message: "Invalid action" },
          { status: 400 },
        );
    }

    await Product.updateMany({ _id: { $in: productIds } }, updateData);

    return NextResponse.json({
      success: true,
      message: "Products updated successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
