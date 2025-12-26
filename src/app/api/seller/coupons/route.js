// app/api/seller/coupons/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Coupon from '@/lib/db/models/Coupon';
import { verifyToken } from '@/lib/utils/auth';

export async function GET(request) {
  try {
    await connectDB();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'seller') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const coupons = await Coupon.find({ createdBy: decoded.userId }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      coupons
    });

  } catch (error) {
    console.error('Coupons GET Error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'seller') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Add createdBy
    const couponData = {
        ...data,
        createdBy: decoded.userId,
        isActive: true
    };

    const coupon = await Coupon.create(couponData);

    return NextResponse.json({
      success: true,
      message: 'Coupon created successfully',
      coupon
    });

  } catch (error) {
    console.error('Coupons POST Error:', error);
    if (error.code === 11000) {
        return NextResponse.json({ success: false, message: 'Coupon code already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
