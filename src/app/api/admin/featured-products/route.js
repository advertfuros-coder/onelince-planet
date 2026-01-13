import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import FeaturedProduct from "@/lib/db/models/FeaturedProduct";
import Product from "@/lib/db/models/Product";
import { verifyToken, isAdmin } from "@/lib/utils/adminAuth";

// GET - Fetch featured products for a section
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section") || "todays_best_deals";
    const limit = parseInt(searchParams.get("limit")) || 10;

    await connectDB();

    const now = new Date();
    
    const featuredProducts = await FeaturedProduct.find({
      section,
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
      .sort({ order: 1 })
      .limit(limit);

    // Filter out any entries where product doesn't exist
    // Accept products that are active and approved
    const validProducts = featuredProducts
      .filter(fp => {
        if (!fp.product) {
          console.log('Featured product has no associated product:', fp._id)
          return false
        }
        // Product must be active and approved (or isActive/isApproved fields don't exist for backwards compatibility)
        const isValid = (fp.product.isActive !== false) && (fp.product.isApproved !== false)
        if (!isValid) {
          console.log('Product filtered out:', fp.product.name, 'isActive:', fp.product.isActive, 'isApproved:', fp.product.isApproved)
        }
        return isValid
      })
      .map(fp => {
        const product = fp.product
        // Transform to match expected frontend format
        return {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.pricing?.salePrice || product.pricing?.basePrice || 0,
          originalPrice: product.pricing?.basePrice || 0,
          images: product.images,
          category: product.category,
          rating: product.ratings?.average || 0,
          reviewCount: product.ratings?.count || 0,
          stock: product.inventory?.stock || 0,
        }
      });

    console.log(`Featured products query found ${featuredProducts.length} entries, ${validProducts.length} valid products`)

    return NextResponse.json({
      success: true,
      products: validProducts,
      count: validProducts.length,
    });
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST - Add a product to featured section (Admin only)
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
    const { productId, section, order, startDate, endDate } = body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Check if product already exists in this section
    const existing = await FeaturedProduct.findOne({
      product: productId,
      section: section || "todays_best_deals",
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Product already exists in this section" },
        { status: 400 }
      );
    }

    const featuredProduct = await FeaturedProduct.create({
      product: productId,
      section: section || "todays_best_deals",
      order: order || 0,
      startDate: startDate || new Date(),
      endDate: endDate || null,
      active: true,
    });

    const populated = await FeaturedProduct.findById(
      featuredProduct._id
    ).populate("product");

    return NextResponse.json({
      success: true,
      featuredProduct: populated,
      message: "Product added to featured section",
    });
  } catch (error) {
    console.error("Error adding featured product:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove a product from featured section (Admin only)
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
        { success: false, message: "Featured product ID required" },
        { status: 400 }
      );
    }

    await connectDB();
    await FeaturedProduct.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Product removed from featured section",
    });
  } catch (error) {
    console.error("Error removing featured product:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update featured product settings (Admin only)
export async function PATCH(request) {
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
    const { id, order, active, startDate, endDate } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Featured product ID required" },
        { status: 400 }
      );
    }

    const updateData = {};
    if (order !== undefined) updateData.order = order;
    if (active !== undefined) updateData.active = active;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;

    const featuredProduct = await FeaturedProduct.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate("product");

    if (!featuredProduct) {
      return NextResponse.json(
        { success: false, message: "Featured product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      featuredProduct,
      message: "Featured product updated",
    });
  } catch (error) {
    console.error("Error updating featured product:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
