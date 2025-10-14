import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Order from '@/lib/db/models/Order';
import shiprocketService from '@/lib/services/shiprocket';
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    await connectDB();

    const { orderId, courierId } = await request.json();

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid Order ID' },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId)
      .populate('items.product', 'name sku')
      .populate('customer', 'name email phone');

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Step 1: Create order in Shiprocket
    const createOrderResponse = await shiprocketService.createOrder({
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      shippingAddress: order.shippingAddress,
      items: order.items.map(item => ({
        name: item.name,
        product: item.product._id,
        sku: item.sku || `SKU-${item.product._id}`,
        quantity: item.quantity,
        price: item.price,
        hsn: item.hsn || ''
      })),
      payment: order.payment,
      pricing: order.pricing,
      dimensions: order.dimensions
    });

    if (!createOrderResponse.success) {
      throw new Error('Failed to create Shiprocket order');
    }

    // Step 2: Get available couriers (if courierId not provided)
    let selectedCourierId = courierId;
    if (!selectedCourierId) {
      const couriersResponse = await shiprocketService.getAvailableCouriers(
        createOrderResponse.shipmentId
      );
      
      if (couriersResponse.couriers && couriersResponse.couriers.length > 0) {
        // Select the first available courier (or you can add logic to select best one)
        selectedCourierId = couriersResponse.couriers[0].courier_company_id;
      } else {
        throw new Error('No couriers available for this shipment');
      }
    }

    // Step 3: Assign courier and generate AWB
    const awbResponse = await shiprocketService.assignCourierAndGenerateAWB(
      createOrderResponse.shipmentId,
      selectedCourierId
    );

    // Step 4: Request pickup
    const pickupResponse = await shiprocketService.requestPickup(
      createOrderResponse.shipmentId
    );

    // Step 5: Generate label
    const labelResponse = await shiprocketService.generateLabel(
      createOrderResponse.shipmentId
    );

    // Update order with Shiprocket details
    order.shiprocket = {
      orderId: createOrderResponse.orderId,
      shipmentId: createOrderResponse.shipmentId,
      awbCode: awbResponse.awbCode,
      courierName: awbResponse.courierName,
      courierId: awbResponse.courierId,
      pickupScheduledDate: pickupResponse.pickupScheduledDate,
      pickupTokenNumber: pickupResponse.pickupTokenNumber,
      label: labelResponse.labelUrl,
      status: 'pickup_scheduled'
    };

    order.pickup.adminAssigned = true;
    order.pickup.adminAssignedAt = new Date();
    order.pickup.scheduled = true;
    order.pickup.scheduledDate = pickupResponse.pickupScheduledDate;

    order.shipping.trackingId = awbResponse.awbCode;
    order.shipping.carrier = awbResponse.courierName;

    order.status = 'pickup';

    order.timeline.push({
      status: 'pickup_scheduled',
      description: `Pickup scheduled with ${awbResponse.courierName}. AWB: ${awbResponse.awbCode}`,
      timestamp: new Date()
    });

    await order.save();

    return NextResponse.json({
      success: true,
      message: 'Shiprocket delivery assigned successfully',
      order: order,
      shiprocket: {
        orderId: createOrderResponse.orderId,
        shipmentId: createOrderResponse.shipmentId,
        awbCode: awbResponse.awbCode,
        courierName: awbResponse.courierName,
        pickupDate: pickupResponse.pickupScheduledDate,
        labelUrl: labelResponse.labelUrl
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
