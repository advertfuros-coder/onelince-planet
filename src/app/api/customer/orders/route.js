// app/api/customer/orders/route.js
import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db/connection';
import { Order, Product, User } from '../../../../lib/db/models';
import { verifyToken } from '../../../../lib/auth/jwt';
import { generateOrderNumber } from '../../../../lib/utils/helpers';
import WATIService from '../../../../lib/services/wati';

export async function POST(request) {
  try {
    await dbConnect();

    const decoded = verifyToken(request);
    if (!decoded || decoded.role !== 'customer') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod
    } = body;

    // Process order items
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId)
        .populate('sellerId', '_id storeInfo');
      
      if (!product || !product.isActive) {
        return NextResponse.json(
          { success: false, message: `Product not available: ${item.productId}` },
          { status: 400 }
        );
      }

      // Check stock
      if (product.inventory.stock < item.quantity) {
        return NextResponse.json(
          { success: false, message: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }

      const itemPrice = product.pricing.salePrice || product.pricing.basePrice;
      const itemTotal = itemPrice * item.quantity;
      subtotal += itemTotal;

      processedItems.push({
        productId: product._id,
        sellerId: product.sellerId._id,
        name: product.name,
        sku: product.sku,
        price: itemPrice,
        quantity: item.quantity,
        variant: item.variant || {},
        status: 'pending'
      });

      // Reduce inventory
      await Product.findByIdAndUpdate(product._id, {
        $inc: { 'inventory.stock': -item.quantity }
      });
    }

    // Calculate totals
    const shippingCharges = subtotal > 500 ? 0 : 50; // Free shipping above ₹500
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + shippingCharges + tax;

    // Create order
    const order = new Order({
      orderNumber: generateOrderNumber(),
      customerId: decoded.userId,
      items: processedItems,
      orderSummary: {
        subtotal,
        shippingCharges,
        tax,
        discount: 0,
        total
      },
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentInfo: {
        method: paymentMethod,
        status: 'pending'
      }
    });

    await order.save();

    // Send WhatsApp notification
    const user = await User.findById(decoded.userId);
    if (user.whatsappNumber) {
      try {
        await WATIService.sendOrderConfirmation(user.whatsappNumber, {
          orderNumber: order.orderNumber,
          total: order.orderSummary.total
        });
      } catch (error) {
        console.error('WhatsApp notification failed:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        total: order.orderSummary.total,
        status: order.overallStatus
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await dbConnect();

    const decoded = verifyToken(request);
    if (!decoded || decoded.role !== 'customer') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const orders = await Order.find({ customerId: decoded.userId })
      .populate('items.productId', 'name images')
      .populate('items.sellerId', 'storeInfo.storeName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments({ customerId: decoded.userId });

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
