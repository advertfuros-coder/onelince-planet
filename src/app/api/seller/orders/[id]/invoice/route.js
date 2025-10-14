import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Order from '@/lib/db/models/Order';
import Seller from '@/lib/db/models/Seller';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Order ID' },
        { status: 400 }
      );
    }

    const order = await Order.findById(id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name sku')
      .populate('items.seller', 'businessName storeInfo pickupAddress')
      .lean();

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      invoice: {
        orderNumber: order.orderNumber,
        orderDate: order.createdAt,
        customer: order.customer,
        seller: order.items[0].seller,
        items: order.items,
        pricing: order.pricing,
        shippingAddress: order.shippingAddress,
        payment: order.payment
      }
    });

  } catch (error) {
    console.error('Get invoice error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
