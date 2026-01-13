import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import StealDeal from "@/lib/db/models/StealDeal";
import Product from "@/lib/db/models/Product";
import { verifyToken, isAdmin } from "@/lib/utils/adminAuth";

// GET - Fetch active steal deals (Public)
export async function GET(request) {
  try {
    await connectDB();

    const now = new Date();
    
    const deals = await StealDeal.find({
      active: true,
      $or: [
        { endDate: null },
        { endDate: { $gte: now } }
      ],
      startDate: { $lte: now }
    })
      .populate({
        path: "product",
        select: "name slug description pricing images category ratings inventory.stock isActive isApproved",
      })
      .sort({ order: 1 });

    // Filter out deals where product doesn't exist or is inactive
    // Also ensure steal price is actually lower than original price
    const validDeals = deals
      .filter(deal => {
        const hasProduct = deal.product && (deal.product.isActive !== false) && (deal.product.isApproved !== false);
        const isPriceReduced = deal.stealPrice < deal.originalPrice;
        return hasProduct && isPriceReduced;
      })
      .map(deal => ({
        _id: deal.product._id,
        name: deal.product.name,
        slug: deal.product.slug,
        images: deal.product.images,
        quantity: deal.quantity,
        pricing: {
          salePrice: deal.stealPrice,
          basePrice: deal.originalPrice,
        },
        discountPercentage: deal.discountPercentage,
        limitedStock: deal.limitedStock,
        stockRemaining: deal.stockRemaining,
      }));

    return NextResponse.json({
      success: true,
      deals: validDeals,
      count: validDeals.length,
    });
  } catch (error) {
    console.error("Error fetching steal deals:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST - Create or update steal deal (Admin only)
export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();
    const { _id, productId, ...data } = body;

    // Validate that steal price is lower than original price
    if (data.stealPrice && data.originalPrice && data.stealPrice >= data.originalPrice) {
      return NextResponse.json(
        { success: false, message: "Steal price must be lower than original price" },
        { status: 400 }
      );
    }

    // Check if product exists
    if (productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return NextResponse.json(
          { success: false, message: "Product not found" },
          { status: 404 }
        );
      }
    }

    let deal;
    if (_id) {
      // Update existing deal
      deal = await StealDeal.findByIdAndUpdate(_id, data, { new: true }).populate("product");
    } else {
      // Create new deal
      if (!productId) {
        return NextResponse.json(
          { success: false, message: "Product ID required for new deal" },
          { status: 400 }
        );
      }
      deal = await StealDeal.create({ product: productId, ...data });
      deal = await StealDeal.findById(deal._id).populate("product");
    }

    return NextResponse.json({
      success: true,
      deal,
      message: _id ? "Deal updated" : "Deal created",
    });
  } catch (error) {
    console.error("Error saving steal deal:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove steal deal (Admin only)
export async function DELETE(request) {
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Deal ID required" },
        { status: 400 }
      );
    }

    await connectDB();
    await StealDeal.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Deal deleted",
    });
  } catch (error) {
    console.error("Error deleting steal deal:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
