import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import FeaturedProduct from "@/lib/db/models/FeaturedProduct";
import { verifyToken, isAdmin } from "@/lib/utils/adminAuth";

// GET - Fetch featured products with full details for admin management
export async function GET(request) {
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
    const section = searchParams.get("section") || "todays_best_deals";

    await connectDB();

    const featuredProducts = await FeaturedProduct.find({ section })
      .populate({
        path: "product",
        select:
          "name slug description pricing images category ratings inventory.stock isActive isApproved",
      })
      .sort({ order: 1 });

    return NextResponse.json({
      success: true,
      featuredProducts,
      count: featuredProducts.length,
    });
  } catch (error) {
    console.error("Error fetching featured products for management:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
