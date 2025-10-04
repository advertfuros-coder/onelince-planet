import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Review from '@/lib/db/models/Review'
import Order from '@/lib/db/models/Order'
import { verifyToken } from '@/lib/utils/auth'

export async function POST(request, context) {
  await connectDB()

  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  const decoded = verifyToken(token)
  if (!decoded) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const params = await context.params
  const orderId = params.id

  const body = await request.json()
  const { productId, rating, title, comment, images } = body

  // Verify order ownership and delivered status
  const order = await Order.findById(orderId)
  if (!order || order.customer.toString() !== decoded.id || order.status !== 'delivered') {
    return NextResponse.json({ success: false, message: 'Not allowed' }, { status: 403 })
  }

  const existingReview = await Review.findOne({ order: orderId, customer: decoded.id, product: productId })
  if (existingReview) {
    return NextResponse.json({ success: false, message: 'Already reviewed' }, { status: 400 })
  }

  const review = await Review.create({
    product: productId,
    order: orderId,
    customer: decoded.id,
    rating,
    title,
    comment,
    images,
    verified: true,
    status: 'pending'
  })

  return NextResponse.json({ success: true, review })
}
