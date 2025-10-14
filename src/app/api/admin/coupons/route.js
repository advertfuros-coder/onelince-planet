import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Coupon from '@/lib/db/models/Coupon';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'active', 'expired', 'all'

    let query = {};

    if (status === 'active') {
      const now = new Date();
      query = {
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      };
    } else if (status === 'expired') {
      const now = new Date();
      query = {
        $or: [
          { isActive: false },
          { endDate: { $lt: now } },
        ],
      };
    }

    const coupons = await Coupon.find(query)
      .populate('sellerId', 'storeInfo.storeName')
      .populate('applicableProducts', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      coupons: coupons,
      count: coupons.length,
    });

  } catch (error) {
    console.error('Fetch coupons error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
