import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Order from '@/lib/db/models/Order'
import Review from '@/lib/db/models/Review'
import { verifyToken } from '@/lib/utils/auth'

export async function GET(request, { params }) {
  try {
    await connectDB()

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const order = await Order.findById(id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name images sku pricing')
      .lean()

    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 })
    }

    // Security: Only allow customer to view own orders
    if (order.customer._id.toString() !== decoded.id) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    // Fetch reviews for items in order
    const productIds = order.items.map(item => item.product._id)
    const reviews = await Review.find({
      product: { $in: productIds },
      customer: decoded.id,
      order: id,
      status: 'published'
    }).lean()

    // Map productId to review for quick access in frontend
    const reviewMap = {}
    reviews.forEach(r => {
      reviewMap[r.product.toString()] = r
    })

    return NextResponse.json({ success: true, order, reviewMap })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}
