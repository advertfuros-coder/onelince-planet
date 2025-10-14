import { NextResponse } from 'next/server';
 import Coupon from '@/lib/db/models/Coupon';
import mongoose from 'mongoose';
import connectDB from '@/lib/db/mongodb';

// GET single coupon
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Coupon ID' },
        { status: 400 }
      );
    }

    const coupon = await Coupon.findById(id)
      .populate('sellerId', 'storeInfo.storeName')
      .populate('applicableProducts', 'name')
      .populate('specificUsers', 'name email');

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: 'Coupon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      coupon: coupon,
    });

  } catch (error) {
    console.error('Fetch coupon error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update coupon (toggle active status)
export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Coupon ID' },
        { status: 400 }
      );
    }

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { isActive: body.isActive },
      { new: true }
    );

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: 'Coupon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Coupon ${body.isActive ? 'activated' : 'deactivated'} successfully`,
      coupon: coupon,
    });

  } catch (error) {
    console.error('Update coupon error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE coupon
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Coupon ID' },
        { status: 400 }
      );
    }

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: 'Coupon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Coupon deleted successfully',
    });

  } catch (error) {
    console.error('Delete coupon error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
