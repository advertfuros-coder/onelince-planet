// app/api/seller/products/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Product from "@/lib/db/models/Product";
import { verifyToken } from "@/lib/utils/auth";

export async function GET(request) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Use decoded.id for sellerId
    const products = await Product.find({ sellerId: decoded.id }).sort({
      createdAt: -1,
    });
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    console.log("🔑 Decoded token:", decoded); // Debug log

    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();

    console.log("📦 Product data received:", data); // Debug log

    // Validate required fields
    if (
      !data.name ||
      !data.description ||
      !data.category ||
      !data.pricing?.basePrice ||
      !data.inventory?.stock
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields: name, description, category, pricing.basePrice, inventory.stock",
        },
        { status: 400 }
      );
    }

    // Create product with sellerId from token
    const product = await Product.create({
      ...data,
      sellerId: decoded.id,
      isApproved: true, // Auto-approve for testing
      isActive: true,
    });

    console.log("✅ Product created:", product._id); // Debug log

    return NextResponse.json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.error("❌ Create product error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}
