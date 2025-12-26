// app/api/seller/products/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Product from "@/lib/db/models/Product";
import { verifyToken } from "@/lib/utils/auth";

export async function GET(request, { params }) {
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

    const { id } = await params;

    // Find seller profile first to get the correct ID
    // (Consolidating logic with the main products route)
    const seller = await import("@/lib/db/models/Seller").then((mod) =>
      mod.default.findOne({ userId: decoded.userId })
    );

    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller profile not found" },
        { status: 404 }
      );
    }

    const product = await Product.findOne({ _id: id, sellerId: seller._id });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Product GET error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
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

    const { id } = await params;
    const body = await request.json();

    // Find seller profile first
    const seller = await import("@/lib/db/models/Seller").then((mod) =>
      mod.default.findOne({ userId: decoded.userId })
    );

    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller profile not found" },
        { status: 404 }
      );
    }

    // Calculate discount percentage
    if (body.pricing?.salePrice && body.pricing?.basePrice) {
      body.pricing.discountPercentage =
        ((body.pricing.basePrice - body.pricing.salePrice) /
          body.pricing.basePrice) *
        100;
    }

    const product = await Product.findOneAndUpdate(
      { _id: id, sellerId: seller._id },
      body,
      { new: true }
    );

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Product PUT error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
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

    const { id } = await params;

    // Find seller profile first
    const seller = await import("@/lib/db/models/Seller").then((mod) =>
      mod.default.findOne({ userId: decoded.userId })
    );

    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller profile not found" },
        { status: 404 }
      );
    }

    const product = await Product.findOneAndDelete({
      _id: id,
      sellerId: seller._id,
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Product DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
