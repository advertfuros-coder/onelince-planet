// app/api/seller/orders/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Order from '@/lib/db/models/Order'
import { verifyToken } from '@/lib/utils/auth'

export async function GET(request) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Query for orders containing items from this seller
    let query = { 'items.seller': decoded.userId }

    if (status) {
      query['items.status'] = status
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.name': { $regex: search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search, $options: 'i' } },
      ]
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('customer', 'fullName email phone')
      .populate('items.product', 'name images')
      .lean()

    // Filter items to only show seller's products
    const filteredOrders = orders.map((order) => ({
      ...order,
      items: order.items.filter((item) => item.seller.toString() === decoded.userId),
    }))

    const total = await Order.countDocuments(query)

    // Get stats
    const stats = await getSellerOrderStats(decoded.userId)

 
    return NextResponse.json({
      success: true,
      orders: filteredOrders,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Seller orders GET error:', error)
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}

async function getSellerOrderStats(sellerId) {
  const [
    totalOrders,
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    totalRevenue,
  ] = await Promise.all([
    Order.countDocuments({ 'items.seller': sellerId }),
    Order.countDocuments({ 'items.seller': sellerId, 'items.status': 'pending' }),
    Order.countDocuments({ 'items.seller': sellerId, 'items.status': 'processing' }),
    Order.countDocuments({ 'items.seller': sellerId, 'items.status': 'shipped' }),
    Order.countDocuments({ 'items.seller': sellerId, 'items.status': 'delivered' }),
    Order.countDocuments({ 'items.seller': sellerId, 'items.status': 'cancelled' }),
    Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.seller': sellerId, 'items.status': { $nin: ['cancelled', 'returned'] } } },
      {
        $group: {
          _id: null,
          total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
    ]).then((res) => res[0]?.total || 0),
  ])

  return {
    totalOrders,
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    totalRevenue,
  }
}
