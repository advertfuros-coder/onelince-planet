import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Order from '@/lib/db/models/Order'
import Review from '@/lib/db/models/Review'
import { verifyToken } from '@/lib/utils/auth'

export async function GET(request, { params }) {
  console.log(`API /api/orders/${params.id} called`)

  try {
    await connectDB()
    console.log('MongoDB connected')

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      console.log('No token in request headers')
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    console.log('Token decoded:', decoded)

    if (!decoded) {
      console.log('Invalid token')
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const id = params.id
    console.log('Fetching orderId:', id)

    const order = await Order.findById(id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name images sku pricing')
      .lean()

    if (!order) {
      console.log('Order not found in DB')
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 })
    }

    // Check ownership
    const customerId = order.customer?._id ? order.customer._id.toString() : order.customer.toString()
    console.log('Order customerId:', customerId, 'Decoded userId:', decoded.id)

    if (customerId !== decoded.id) {
      console.log('User trying to access order they do not own')
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    // Fetch reviews for order items by this customer
    const productIds = order.items.map((item) =>
      item.product._id ? item.product._id.toString() : item.product.toString()
    )
    console.log('Order products:', productIds)

    const reviews = await Review.find({ order: id, customer: decoded.id, product: { $in: productIds } }).lean()
    console.log('Reviews found for order:', reviews.length)

    const reviewMap = {}
    for (const r of reviews) {
      reviewMap[r.product.toString()] = r
    }

    return NextResponse.json({ success: true, order, reviewMap })
  } catch (error) {
    console.error('Error in /api/orders/[id]/route.js:', error)
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}
