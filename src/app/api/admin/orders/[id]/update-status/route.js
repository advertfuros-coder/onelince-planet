import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Order from '@/lib/db/models/Order';
import emailService from '@/lib/services/emailService';
import { generateInvoiceHTML } from '@/lib/services/invoiceGenerator';
import mongoose from 'mongoose';

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const { status, description } = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Order ID' },
        { status: 400 }
      );
    }

    const order = await Order.findById(id)
      .populate('customer', 'name email');

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    const validStatuses = ['confirmed', 'processing', 'ready_for_pickup', 'pickup', 'shipped', 'delivered', 'cancelled', 'returned'];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 }
      );
    }

    order.status = status;

    order.timeline.push({
      status: status,
      description: description || `Order status updated to ${status}`,
      timestamp: new Date()
    });

    // Handle specific status changes
    if (status === 'shipped') {
      order.shipping.shippedAt = new Date();
    }

    if (status === 'delivered') {
      order.shipping.deliveredAt = new Date();
      order.payment.status = 'paid';
      order.payment.paidAt = new Date();

      // Generate and send invoice
      try {
        const invoiceHTML = generateInvoiceHTML(order);
        await emailService.sendOrderDelivered(order, invoiceHTML);
        console.log('✅ Delivery confirmation email sent');
      } catch (emailError) {
        console.error('Email error:', emailError);
      }
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      order: order
    });

  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
