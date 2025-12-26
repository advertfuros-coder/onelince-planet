// app/api/coupons/validate/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { verifyToken } from "@/lib/utils/auth";
import Coupon from "@/lib/db/models/Coupon";

// Validate coupon
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

    const { code, cartTotal, products } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Coupon code is required" },
        { status: 400 }
      );
    }

    // Find coupon
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Invalid coupon code" },
        { status: 404 }
      );
    }

    // Validate coupon
    const validation = coupon.isValid(decoded.id, cartTotal, products);

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 400 }
      );
    }

    // Calculate discount
    const discount = coupon.calculateDiscount(cartTotal, products);

    return NextResponse.json({
      success: true,
      message: "Coupon applied successfully",
      coupon: {
        code: coupon.code,
        type: coupon.type,
        description: coupon.description,
      },
      discount,
      freeShipping: coupon.type === "free_shipping",
    });
  } catch (error) {
    console.error("Validate coupon error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
