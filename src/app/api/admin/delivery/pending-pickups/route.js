import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Order from '@/lib/db/models/Order';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;

    const orders = await Order.find({
      'pickup.sellerMarked': true,
      'pickup.adminAssigned': false,
      status: 'ready_for_pickup'
    })
      .populate('customer', 'name email phone')
      .populate('items.seller', 'storeInfo businessName')
      .populate('items.product', 'name images')
      .sort({ 'pickup.sellerMarkedAt': -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Order.countDocuments({
      'pickup.sellerMarked': true,
      'pickup.adminAssigned': false,
      status: 'ready_for_pickup'
    });

    return NextResponse.json({
      success: true,
      orders: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get pending pickups error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
