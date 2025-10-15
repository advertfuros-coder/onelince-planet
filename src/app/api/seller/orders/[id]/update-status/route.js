import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Order from '@/lib/db/models/Order';
import Product from '@/lib/db/models/Product';
 import mongoose from 'mongoose';
import emailService from '@/lib/emailService';

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const { status, sellerId, reason } = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Order ID' },
        { status: 400 }
      );
    }

    const order = await Order.findById(id)
      .populate('customer', 'name email')
      .populate('items.seller', 'email businessName storeInfo');

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    let statusMessage = '';
    let emailMessage = '';

    // Handle status transitions
    if (status === 'processing' && order.status === 'confirmed') {
      order.status = 'processing';
      statusMessage = 'Order accepted and set to processing';
      emailMessage = 'Your order has been accepted by the seller and is being processed.';
      
      order.timeline.push({
        status: 'processing',
        description: statusMessage,
        timestamp: new Date(),
      });

    } else if (status === 'ready_for_pickup' && order.status === 'processing') {
      order.status = 'ready_for_pickup';
      statusMessage = 'Order marked ready for pickup';
      emailMessage = 'Your order has been prepared and is ready for pickup by our delivery partner.';
      
      order.pickup.sellerMarked = true;
      order.pickup.sellerMarkedAt = new Date();
      
      order.timeline.push({
        status: 'ready_for_pickup',
        description: statusMessage,
        timestamp: new Date(),
      });

    } else if (status === 'cancelled' && order.status === 'confirmed') {
      order.status = 'cancelled';
      statusMessage = reason || 'Order declined by seller';
      emailMessage = `Your order has been cancelled. Reason: ${reason || 'Seller unable to fulfill order'}`;
      
      order.cancellation = {
        reason: reason || 'Declined by seller',
        cancelledBy: 'seller',
        cancelledAt: new Date()
      };
      
      order.timeline.push({
        status: 'cancelled',
        description: statusMessage,
        timestamp: new Date(),
      });

      // Restore inventory
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { 'inventory.stock': item.quantity },
          $set: { isActive: true }
        });
      }

    } else {
      return NextResponse.json(
        { success: false, message: `Invalid status transition from ${order.status} to ${status}` },
        { status: 400 }
      );
    }

    await order.save();

    // Send email notification
    try {
      await emailService.sendOrderStatusUpdate(order, status, emailMessage);
    } catch (emailError) {
      console.error('Email send error:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: statusMessage,
      order: order,
    });

  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
