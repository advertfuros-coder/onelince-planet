import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import TrendingProduct from "@/models/TrendingProduct";
import { verifyToken, isAdmin } from "@/lib/utils/adminAuth";
import { calculateDeliveryEstimate } from "@/lib/utils/deliveryEstimate";

// GET - Fetch all trending products
export async function GET() {
  try {
    await dbConnect();

    const trendingProducts = await TrendingProduct.find({ isActive: true })
      .populate({
        path: "product",
        populate: {
          path: "sellerId",
          select: "businessInfo country",
        },
      })
      .sort({ priority: 1, createdAt: -1 })
      .limit(8);

    const products = trendingProducts
      .map((tp) => {
        const product = tp.product;
        if (!product) return null;

        const basePrice = product.pricing?.basePrice || 0;
        const salePrice = product.pricing?.salePrice || basePrice;

        const discount = Math.round(
          product.pricing?.discountPercentage ||
            (basePrice > 0 ? ((basePrice - salePrice) / basePrice) * 100 : 0),
        );

        // Use shared utility for delivery estimate
        const sellerCountry =
          product.sellerId?.businessInfo?.country ||
          product.sellerId?.country ||
          "AE";
        const userCountry = "AE";
        const delivery = calculateDeliveryEstimate(
          product,
          userCountry,
          sellerCountry,
        );

        return {
          _id: product._id,
          name: product.name,
          price: salePrice,
          originalPrice: basePrice,
          image: product.images?.[0]?.url || product.image,
          rating: product.ratings?.average || 0,
          reviews: product.ratings?.count || 0,
          discount: discount,
          deliveryDate: delivery.label,
          // Include raw data for admin panel
          pricing: product.pricing,
          images: product.images,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      products: products,
    });
  } catch (error) {
    console.error("Error fetching trending products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch trending products" },
      { status: 500 },
    );
  }
}

// POST - Add product to trending (Admin only)
export async function POST(request) {
  try {
    await dbConnect();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { productId, priority } = await request.json();

    const trendingProduct = await TrendingProduct.create({
      product: productId,
      priority: priority || 0,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: "Product added to trending",
      trendingProduct,
    });
  } catch (error) {
    console.error("Error adding trending product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add trending product" },
      { status: 500 },
    );
  }
}

// DELETE - Remove product from trending (Admin only)
export async function DELETE(request) {
  try {
    await dbConnect();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    await TrendingProduct.findOneAndDelete({ product: productId });

    return NextResponse.json({
      success: true,
      message: "Product removed from trending",
    });
  } catch (error) {
    console.error("Error removing trending product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove trending product" },
      { status: 500 },
    );
  }
}
