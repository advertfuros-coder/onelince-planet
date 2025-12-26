// app/api/coupons/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { verifyToken } from "@/lib/utils/auth";
import Coupon from "@/lib/db/models/Coupon";

// Get all coupons (admin/seller)
export async function GET(request) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || (decoded.role !== "admin" && decoded.role !== "seller")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status"); // active, expired, all

    const skip = (page - 1) * limit;

    let query = {};

    if (status === "active") {
      query.isActive = true;
      query.validUntil = { $gte: new Date() };
    } else if (status === "expired") {
      query.validUntil = { $lt: new Date() };
    }

    const [coupons, total] = await Promise.all([
      Coupon.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-internalNotes"),
      Coupon.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      coupons,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get coupons error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// Create coupon (admin/seller)
export async function POST(request) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || (decoded.role !== "admin" && decoded.role !== "seller")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (
      !body.code ||
      !body.type ||
      !body.value ||
      !body.validFrom ||
      !body.validUntil
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existing = await Coupon.findOne({ code: body.code.toUpperCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Coupon code already exists" },
        { status: 400 }
      );
    }

    const coupon = await Coupon.create({
      ...body,
      code: body.code.toUpperCase(),
      createdBy: decoded.id,
    });

    return NextResponse.json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    console.error("Create coupon error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
