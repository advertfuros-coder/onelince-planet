// app/api/wishlist/share/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Wishlist from "@/lib/db/models/Wishlist";
import { verifyToken } from "@/lib/utils/auth";

// POST - Generate shareable wishlist link
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

    const wishlist = await Wishlist.findOne({ userId: decoded.userId });

    if (!wishlist || wishlist.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Wishlist is empty",
        },
        { status: 400 }
      );
    }

    // Generate a shareable token (base64 encoded wishlist ID)
    const shareToken = Buffer.from(wishlist._id.toString()).toString("base64");
    const shareUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/wishlist/shared/${shareToken}`;

    return NextResponse.json({
      success: true,
      shareUrl,
      shareToken,
    });
  } catch (error) {
    console.error("Share Wishlist Error:", error);
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

// GET - Fetch shared wishlist
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const shareToken = searchParams.get("token");

    if (!shareToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Share token required",
        },
        { status: 400 }
      );
    }

    // Decode the wishlist ID from token
    const wishlistId = Buffer.from(shareToken, "base64").toString("utf-8");

    const wishlist = await Wishlist.findById(wishlistId)
      .populate({
        path: "items.productId",
        select:
          "name images pricing category brand isActive isApproved ratings",
        populate: {
          path: "sellerId",
          select: "businessName",
        },
      })
      .populate("userId", "name");

    if (!wishlist) {
      return NextResponse.json(
        {
          success: false,
          message: "Wishlist not found",
        },
        { status: 404 }
      );
    }

    // Filter active products
    const activeItems = wishlist.items.filter(
      (item) =>
        item.productId && item.productId.isActive && item.productId.isApproved
    );

    return NextResponse.json({
      success: true,
      wishlist: {
        ownerName: wishlist.userId?.name || "Someone",
        items: activeItems,
        count: activeItems.length,
      },
    });
  } catch (error) {
    console.error("Get Shared Wishlist Error:", error);
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
