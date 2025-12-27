import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Product from "@/lib/db/models/Product";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    await connectDB();

    // Await params before accessing its properties
    const { id } = await params;

    console.log("📦 Fetching products for seller:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Seller ID" },
        { status: 400 }
      );
    }

    const products = await Product.find({ sellerId: id })
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .lean();

    console.log("✅ Products found:", products.length);

    return NextResponse.json({
      success: true,
      products: products,
    });
  } catch (error) {
    console.error("❌ Get products error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
