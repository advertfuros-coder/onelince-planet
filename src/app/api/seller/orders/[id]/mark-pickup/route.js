import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Order from '@/lib/db/models/Order';
import User from '@/lib/db/models/User';
import mongoose from 'mongoose';

export async function POST(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const { sellerId } = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Order ID' },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    const seller = await User.findById(sellerId);

    if (!seller) {
      return NextResponse.json(
        { success: false, message: 'Seller not found' },
        { status: 404 }
      );
    }

    order.pickup = {
      sellerMarked: true,
      sellerMarkedAt: new Date(),
      adminAssigned: false,
      scheduled: false,
      pickedUp: false,
      address: {
        name: seller.storeInfo?.storeName || seller.businessInfo?.businessName,
        phone: seller.phone,
        addressLine1: seller.pickupAddress?.addressLine1 || '',
        addressLine2: seller.pickupAddress?.addressLine2 || '',
        city: seller.pickupAddress?.city || '',
        state: seller.pickupAddress?.state || '',
        pincode: seller.pickupAddress?.pincode || '',
        country: seller.pickupAddress?.country || 'India'
      }
    };

    order.status = 'ready_for_pickup';

    order.timeline.push({
      status: 'ready_for_pickup',
      description: 'Seller marked order ready for pickup',
      timestamp: new Date()
    });

    await order.save();

    return NextResponse.json({
      success: true,
      message: 'Order marked ready for pickup successfully',
      order: order
    });

  } catch (error) {
    console.error('Mark pickup error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
