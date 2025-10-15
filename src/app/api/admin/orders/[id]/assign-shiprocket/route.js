import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Order from '@/lib/db/models/Order';
import ShiprocketService from '@/lib/services/shiprocket';
import emailService from '@/lib/services/emailService';
import mongoose from 'mongoose';

export async function POST(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const { courierId, adminId } = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Order ID' },
        { status: 400 }
      );
    }

    const order = await Order.findById(id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name sku')
      .populate('items.seller', 'businessName storeInfo pickupAddress');

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.status !== 'ready_for_pickup') {
      return NextResponse.json(
        { success: false, message: 'Order must be in ready_for_pickup status' },
        { status: 400 }
      );
    }

    console.log('📦 Creating Shiprocket order for:', order.orderNumber);

    // Create Shiprocket order
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
        { success: false, message: shiprocketResult.error || 'Failed to create Shiprocket order' },
        { status: 500 }
      );
    }

    console.log('✅ Shiprocket order created:', shiprocketResult.orderId);

    // Get available couriers
    const couriersResult = await ShiprocketService.getAvailableCouriers(shiprocketResult.shipmentId);

    if (!couriersResult.success || !couriersResult.couriers.length) {
      return NextResponse.json(
        { success: false, message: 'No courier partners available for this location' },
        { status: 400 }
      );
    }

    // Assign courier and generate AWB
    let selectedCourier = couriersResult.couriers[0]; // Default to first courier
    if (courierId) {
      selectedCourier = couriersResult.couriers.find(c => c.courier_company_id === courierId) || selectedCourier;
    }

    console.log('🚚 Assigning courier:', selectedCourier.courier_name);

    const awbResult = await ShiprocketService.assignCourierAndGenerateAWB(
      shiprocketResult.shipmentId,
      selectedCourier.courier_company_id
    );

    if (!awbResult.success) {
      return NextResponse.json(
        { success: false, message: 'Failed to assign courier' },
        { status: 500 }
      );
    }

    console.log('✅ AWB generated:', awbResult.awbCode);

    // Update order
    order.shiprocket = {
      orderId: shiprocketResult.orderId,
      shipmentId: shiprocketResult.shipmentId,
      awbCode: awbResult.awbCode,
      courierName: selectedCourier.courier_name,
      courierId: selectedCourier.courier_company_id,
      label: awbResult.label,
      pickupScheduledDate: awbResult.pickupScheduledDate
    };

    order.pickup.adminAssigned = true;
    order.pickup.adminAssignedAt = new Date();
    order.pickup.adminAssignedBy = adminId;
    order.pickup.scheduled = true;
    order.pickup.scheduledDate = awbResult.pickupScheduledDate;

    order.status = 'pickup';

    order.timeline.push({
      status: 'pickup',
      description: `Shiprocket assigned - ${selectedCourier.courier_name} - AWB: ${awbResult.awbCode}`,
      timestamp: new Date()
    });

    await order.save();

    // Send email notification
    try {
      await emailService.sendOrderShipped(order);
      console.log('✅ Shipping email sent');
    } catch (emailError) {
      console.error('Email error:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Shiprocket assigned successfully',
      order: order,
      shiprocket: {
        orderId: shiprocketResult.orderId,
        shipmentId: shiprocketResult.shipmentId,
        awbCode: awbResult.awbCode,
        courierName: selectedCourier.courier_name,
        availableCouriers: couriersResult.couriers
      }
    });

  } catch (error) {
    console.error('Assign Shiprocket error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
