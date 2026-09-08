import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Product } from '@/lib/db/models';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const subCategory = searchParams.get('subCategory');

    const filter = {
      category: 'back-to-school',
      isActive: true,
      isApproved: true,
    };

    if (subCategory && subCategory !== 'All') {
      filter.subCategory = new RegExp(`^${subCategory}$`, 'i');
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const formatted = products.map((p) => ({
      ...p,
      _id: p._id.toString(),
      sellerId: p.sellerId?.toString() || p.sellerId,
    }));

    return NextResponse.json({
      success: true,
      count: formatted.length,
      products: formatted,
    });
  } catch (error) {
    console.error('Error fetching Back to School products:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
