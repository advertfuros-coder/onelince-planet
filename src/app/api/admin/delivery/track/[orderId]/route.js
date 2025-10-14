import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Order from '@/lib/db/models/Order';
import shiprocketService from '@/lib/services/shiprocket';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { orderId } = params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Order ID' },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    if (!order.shiprocket?.shipmentId) {
      return NextResponse.json(
        { success: false, message: 'No Shiprocket tracking available' },
        { status: 400 }
      );
    }

    // Get tracking from Shiprocket
    const trackingResponse = await shiprocketService.trackShipment(
      order.shiprocket.shipmentId
    );

    // Update order with latest tracking
    if (trackingResponse.tracking && trackingResponse.tracking.shipment_track) {
      const tracks = trackingResponse.tracking.shipment_track;
      
      order.deliveryTracking = tracks.map(track => ({
        status: track.current_status,
        statusCode: track.status_code,
        activity: track.activity,
        location: track.location || '',
        timestamp: new Date(track.date),
        instructions: track.instructions || ''
      }));

      order.shiprocket.currentStatus = tracks[0]?.current_status;
      order.shiprocket.status = tracks[0]?.current_status;

      await order.save();
    }

    return NextResponse.json({
      success: true,
      tracking: trackingResponse.tracking,
      order: order
    });

  } catch (error) {
    console.error('Track shipment error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
