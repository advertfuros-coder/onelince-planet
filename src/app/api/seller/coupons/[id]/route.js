// app/api/seller/coupons/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Coupon from "@/lib/db/models/Coupon";
import { verifyToken } from "@/lib/utils/auth";

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();

    const coupon = await Coupon.findOneAndUpdate(
      { _id: id, createdBy: decoded.userId },
      { $set: data },
      { new: true }
    );

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Coupon not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    console.error("Coupons PUT Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const coupon = await Coupon.findOneAndDelete({
      _id: id,
      createdBy: decoded.userId,
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Coupon not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Coupons DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
