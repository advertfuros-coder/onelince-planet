import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import CouponBanner from "@/lib/db/models/CouponBanner";
import { verifyToken, isAdmin } from "@/lib/utils/adminAuth";

// GET - Fetch active coupon banners (Public)
export async function GET(request) {
  try {
    await connectDB();

    const now = new Date();

    const banners = await CouponBanner.find({
      active: true,
      $or: [{ endDate: null }, { endDate: { $gte: now } }],
      startDate: { $lte: now },
    }).sort({ order: 1 });

    return NextResponse.json({
      success: true,
      banners,
      count: banners.length,
    });
  } catch (error) {
    console.error("Error fetching coupon banners:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST - Create or update coupon banner (Admin only)
export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();
    const { _id, ...data } = body;

    let banner;
    if (_id) {
      // Update existing banner
      banner = await CouponBanner.findByIdAndUpdate(_id, data, { new: true });
    } else {
      // Create new banner
      banner = await CouponBanner.create(data);
    }

    return NextResponse.json({
      success: true,
      banner,
      message: _id ? "Banner updated" : "Banner created",
    });
  } catch (error) {
    console.error("Error saving coupon banner:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove coupon banner (Admin only)
export async function DELETE(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Banner ID required" },
        { status: 400 }
      );
    }

    await connectDB();
    await CouponBanner.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Banner deleted",
    });
  } catch (error) {
    console.error("Error deleting coupon banner:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
