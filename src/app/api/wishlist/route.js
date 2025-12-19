// app/api/wishlist/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Wishlist from "@/lib/db/models/Wishlist";
import Product from "@/lib/db/models/Product";
import { verifyToken } from "@/lib/utils/auth";

// GET - Fetch user's wishlist
export async function GET(request) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    let wishlist = await Wishlist.findOne({ userId: decoded.userId }).populate({
      path: "items.productId",
      select:
        "name images pricing category brand isActive isApproved ratings inventory",
      populate: {
        path: "sellerId",
        select: "businessName",
      },
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: decoded.userId, items: [] });
    }

    // Filter out inactive or deleted products
    const activeItems = wishlist.items.filter(
      (item) =>
        item.productId && item.productId.isActive && item.productId.isApproved
    );

    return NextResponse.json({
      success: true,
      wishlist: {
        _id: wishlist._id,
        items: activeItems,
        count: activeItems.length,
      },
    });
  } catch (error) {
    console.error("Wishlist GET Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Add item to wishlist
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

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID required" },
        { status: 400 }
      );
    }

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive || !product.isApproved) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not available",
        },
        { status: 404 }
      );
    }

    let wishlist = await Wishlist.findOne({ userId: decoded.userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        userId: decoded.userId,
        items: [{ productId }],
      });
    } else {
      await wishlist.addItem(productId);
    }

    return NextResponse.json({
      success: true,
      message: "Product added to wishlist",
      wishlist: {
        _id: wishlist._id,
        count: wishlist.items.length,
      },
    });
  } catch (error) {
    console.error("Wishlist POST Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from wishlist
export async function DELETE(request) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID required" },
        { status: 400 }
      );
    }

    const wishlist = await Wishlist.findOne({ userId: decoded.userId });

    if (!wishlist) {
      return NextResponse.json(
        {
          success: false,
          message: "Wishlist not found",
        },
        { status: 404 }
      );
    }

    await wishlist.removeItem(productId);

    return NextResponse.json({
      success: true,
      message: "Product removed from wishlist",
      wishlist: {
        _id: wishlist._id,
        count: wishlist.items.length,
      },
    });
  } catch (error) {
    console.error("Wishlist DELETE Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
