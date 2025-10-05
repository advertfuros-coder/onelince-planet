// app/api/admin/orders/[orderNumber]/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Order from '@/lib/db/models/Order'
import { verifyToken, isAdmin } from '@/lib/utils/adminAuth'

export async function GET(request, { params }) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { orderNumber } = await params

    const order = await Order.findOne({ orderNumber })
      .populate('customer', 'name email phone')
      .populate('items.product', 'name images category')
      .populate('items.seller', 'businessName email phone')
      .lean()

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { orderNumber } = await params
    const body = await request.json()

    const order = await Order.findOne({ orderNumber })

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 })
    }

    // Update status
    if (body.status && body.status !== order.status) {
      order.status = body.status
      order.timeline.push({
        status: body.status,
        description: body.description || `Order status updated to ${body.status} by admin`,
        timestamp: new Date(),
      })

      // Update shipping info if shipped
      if (body.status === 'shipped' && body.shipping) {
        order.shipping = {
          ...order.shipping,
          trackingId: body.shipping.trackingId,
          carrier: body.shipping.carrier,
          shippedAt: new Date(),
        }
      }

      // Update delivery info if delivered
      if (body.status === 'delivered') {
        order.shipping = {
          ...order.shipping,
          deliveredAt: new Date(),
        }
        order.payment.status = 'paid'
      }
    }

    await order.save()

    const updatedOrder = await Order.findOne({ orderNumber })
      .populate('customer', 'name email phone')
      .populate('items.product', 'name images category')
      .populate('items.seller', 'businessName email phone')
      .lean()

    return NextResponse.json({ success: true, message: 'Order updated successfully', order: updatedOrder })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}
