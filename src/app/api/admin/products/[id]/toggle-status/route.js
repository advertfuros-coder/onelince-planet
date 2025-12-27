// API route to toggle product active status
import { NextResponse } from "next/server";
import Product from "@/lib/db/models/Product";
import connectDB from "@/lib/db/mongodb";
import { verifyToken, isAdmin } from "@/lib/utils/adminAuth";

export async function PATCH(req, { params }) {
  try {
    // Verify admin authentication
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    await connectDB();

    // Unwrap params
    const { id } = await params;

    // Find the product first to get current status
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Toggle the isActive status using findByIdAndUpdate
    // This bypasses validation for other fields
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: { isActive: !product.isActive } },
      { new: true, runValidators: false } // Don't run validators to avoid category/sellerId validation
    );

    return NextResponse.json({
      success: true,
      message: `Product ${
        updatedProduct.isActive ? "activated" : "deactivated"
      } successfully`,
      product: {
        _id: updatedProduct._id,
        name: updatedProduct.name,
        isActive: updatedProduct.isActive,
      },
    });
  } catch (error) {
    console.error("Error toggling product status:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to toggle product status",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
