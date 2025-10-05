// app/api/admin/orders/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Order from '@/lib/db/models/Order'
import { verifyToken, isAdmin } from '@/lib/utils/adminAuth'

export async function GET(request) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const paymentStatus = searchParams.get('paymentStatus') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = searchParams.get('order') || 'desc'

    const skip = (page - 1) * limit

    // Build query
    let query = {}
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.name': { $regex: search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search, $options: 'i' } },
      ]
    }
    if (status) query.status = status
    if (paymentStatus) query['payment.status'] = paymentStatus

    // Build sort
    const sort = {}
    sort[sortBy] = order === 'asc' ? 1 : -1

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('customer', 'name email phone')
        .populate('items.seller', 'businessName')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ])

    // Calculate stats
    const stats = {
      totalOrders: await Order.countDocuments(),
      pendingOrders: await Order.countDocuments({ status: 'pending' }),
      processingOrders: await Order.countDocuments({ status: 'processing' }),
      shippedOrders: await Order.countDocuments({ status: 'shipped' }),
      deliveredOrders: await Order.countDocuments({ status: 'delivered' }),
      cancelledOrders: await Order.countDocuments({ status: 'cancelled' }),
      totalRevenue: await Order.aggregate([
        { $match: { status: { $nin: ['cancelled', 'refunded'] } } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } },
      ]).then((res) => res[0]?.total || 0),
    }

    return NextResponse.json({
      success: true,
      orders,
      stats,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}

// Bulk update orders
export async function PATCH(request) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { orderIds, action, status } = await request.json()

    if (action === 'updateStatus' && status) {
      await Order.updateMany(
        { _id: { $in: orderIds } },
        {
          $set: { status },
          $push: {
            timeline: {
              status,
              description: `Order status updated to ${status} by admin`,
              timestamp: new Date(),
            },
          },
        }
      )
      return NextResponse.json({ success: true, message: 'Orders updated successfully' })
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}
