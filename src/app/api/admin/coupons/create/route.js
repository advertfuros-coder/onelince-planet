import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Coupon from '@/lib/db/models/Coupon';
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate coupon code uniqueness
    const existingCoupon = await Coupon.findOne({ 
      code: body.code.toUpperCase() 
    });

    if (existingCoupon) {
      return NextResponse.json(
        { success: false, message: 'Coupon code already exists' },
        { status: 400 }
      );
    }

    // Validate dates
    if (new Date(body.startDate) >= new Date(body.endDate)) {
      return NextResponse.json(
        { success: false, message: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Prepare coupon data
    const couponData = {
      code: body.code.toUpperCase(),
      description: body.description,
      discountType: body.discountType,
      discountValue: parseFloat(body.discountValue),
      maxDiscountAmount: body.maxDiscountAmount ? parseFloat(body.maxDiscountAmount) : null,
      scope: body.scope,
      minPurchaseAmount: parseFloat(body.minPurchaseAmount) || 0,
      minItemQuantity: parseInt(body.minItemQuantity) || 1,
      totalUsageLimit: body.totalUsageLimit ? parseInt(body.totalUsageLimit) : null,
      perUserLimit: parseInt(body.perUserLimit) || 1,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      userEligibility: body.userEligibility,
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdBy: body.createdBy || new mongoose.Types.ObjectId(), // Replace with actual admin ID from session
      creatorType: 'admin',
    };

    // Handle scope-specific fields
    if (body.scope === 'seller' && body.sellerId) {
      couponData.sellerId = body.sellerId;
    }

    if (body.scope === 'product' && body.applicableProducts?.length > 0) {
      couponData.applicableProducts = body.applicableProducts;
    }

    if (body.scope === 'category' && body.applicableCategories?.length > 0) {
      couponData.applicableCategories = body.applicableCategories;
    }

    // Handle user eligibility
    if (body.userEligibility === 'specific_users') {
      if (body.specificUserEmails?.length > 0) {
        couponData.specificUserEmails = body.specificUserEmails;
      }
      if (body.specificUsers?.length > 0) {
        couponData.specificUsers = body.specificUsers;
      }
    }

    // Create coupon
    const coupon = await Coupon.create(couponData);

    return NextResponse.json({
      success: true,
      message: 'Coupon created successfully',
      coupon: coupon,
    });

  } catch (error) {
    console.error('Coupon creation error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
