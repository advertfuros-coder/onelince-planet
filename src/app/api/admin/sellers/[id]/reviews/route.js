import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Review from "@/lib/db/models/Review";
import Product from "@/lib/db/models/Product";
import { verifyToken, isAdmin } from "@/lib/utils/adminAuth";

export async function GET(request, { params }) {
  try {
    await connectDB();

    // Await params before accessing its properties
    const { id } = await params;

    // const token = request.headers.get('authorization')?.replace('Bearer ', '')
    // const decoded = verifyToken(token)

    // if (!decoded || !isAdmin(decoded)) {
    //   return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    // }

    // Get all products by this seller
    const products = await Product.find({ sellerId: id }).select("_id");
    const productIds = products.map((p) => p.id);

    // Get all reviews for these products
    const reviews = await Review.find({ product: { $in: productIds } })
      .populate("customer", "name email")
      .populate("product", "name images")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
