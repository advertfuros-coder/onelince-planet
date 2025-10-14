import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Product from '@/lib/db/models/Product';
import Review from '@/lib/db/models/Review';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Product ID' },
        { status: 400 }
      );
    }

    // Fetch product with seller details
    const product = await Product.findById(id)
      .populate('sellerId', 'storeInfo businessName ratings')
      .lean();

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    // Fetch reviews for this product
    const reviews = await Review.find({ 
      productId: id, 
      isApproved: true 
    })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate rating distribution
    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    };

    // Fetch related products (same category, different product)
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: id },
      isActive: true,
      isApproved: true,
    })
      .limit(8)
      .select('name images pricing ratings')
      .lean();

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        reviews,
        ratingDistribution,
        relatedProducts,
      },
    });

  } catch (error) {
    console.error('Fetch product error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
