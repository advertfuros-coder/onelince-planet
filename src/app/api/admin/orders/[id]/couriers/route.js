import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Order from '@/lib/db/models/Order';
import ShiprocketService from '@/lib/services/shiprocket';
import mongoose from 'mongoose';

export async function POST(request, { params }) {
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
      .populate('items.seller', 'pickupAddress');

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Create temporary Shiprocket order if not exists
    let shipmentId = order.shiprocket?.shipmentId;

    if (!shipmentId) {
      const shiprocketResult = await ShiprocketService.createOrder({
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        shippingAddress: order.shippingAddress,
        items: order.items,
        pricing: order.pricing,
        payment: order.payment,
        dimensions: order.dimensions || {}
      });

      if (!shiprocketResult.success) {
        return NextResponse.json(
          { success: false, message: 'Failed to create Shiprocket order' },
          { status: 500 }
        );
      }

      shipmentId = shiprocketResult.shipmentId;

      // Save shipment ID to order
      order.shiprocket = {
        orderId: shiprocketResult.orderId,
        shipmentId: shiprocketResult.shipmentId
      };
      await order.save();
    }

    // Get available couriers
    const couriersResult = await ShiprocketService.getAvailableCouriers(shipmentId);

    if (!couriersResult.success) {
      return NextResponse.json(
        { success: false, message: 'Failed to fetch couriers' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      couriers: couriersResult.couriers,
      shipmentId: shipmentId
    });

  } catch (error) {
    console.error('Get couriers error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
