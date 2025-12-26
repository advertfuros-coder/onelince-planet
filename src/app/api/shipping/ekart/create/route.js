// app/api/shipping/ekart/create/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { verifyToken } from '@/lib/utils/auth';
import ekartService from '@/lib/services/ekartService';
import Order from '@/lib/db/models/Order';

export async function POST(request) {
  try {
    await connectDB();

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded || (decoded.role !== 'seller' && decoded.role !== 'admin')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    // Check if already shipped
    if (order.shipping?.trackingId) {
      return NextResponse.json(
        { success: false, message: 'Order already shipped' },
        { status: 400 }
      );
    }

    // Create Ekart shipment
    const result = await ekartService.createShipmentFromOrder(order);

    if (!result.success) {
      throw new Error(result.message || 'Failed to create shipment');
    }

    // Update order with Ekart info
    order.shipping = order.shipping || {};
    order.shipping.provider = 'ekart';
    order.shipping.trackingId = result.tracking_id;
    order.shipping.carrier = 'Ekart Logistics';
    order.shipping.labelUrl = result.label_url;

    order.status = 'shipped';
    order.timeline.push({
      status: 'shipped',
      description: `Order shipped via Ekart. Tracking: ${result.tracking_id}`,
      timestamp: new Date()
    });

    await order.save();

    return NextResponse.json({
      success: true,
      message: 'Shipment created successfully',
      data: {
        trackingId: result.tracking_id,
        labelUrl: result.label_url,
        courier: 'Ekart Logistics'
      }
    });

  } catch (error) {
    console.error('Ekart create shipment error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}
