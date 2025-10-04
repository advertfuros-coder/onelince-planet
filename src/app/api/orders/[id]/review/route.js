import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Review from '@/lib/db/models/Review'
import Order from '@/lib/db/models/Order'
import { verifyToken } from '@/lib/utils/auth'

export async function POST(request, { params }) {
  try {
    await connectDB()

    const resolvedParams = await params
    const orderId = resolvedParams.id

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    if (!decoded) 
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

    const order = await Order.findById(orderId)
    console.log('Order fetched:', order)
    console.log('Decoded user ID:', decoded.id)

    if (!order) {
      console.log('Order not found')
      return NextResponse.json(
        { success: false, message: 'Order not found' }, 
        { status: 400 }
      )
    }

    if (order.customer.toString() !== decoded.id) {
      console.log('User is not owner of the order')
      return NextResponse.json(
        { success: false, message: 'Not allowed: Not the owner' }, 
        { status: 403 }
      )
    }

    if (order.status !== 'delivered') {
      console.log('Order not delivered yet, current status:', order.status)
      return NextResponse.json(
        { success: false, message: 'Not allowed: Order not delivered yet' }, 
        { status: 403 }
      )
    }

    const { productId, rating, title, comment, images } = await request.json()
    console.log('Review ', { productId, rating, title, comment })

    const existingReview = await Review.findOne({
      order: orderId,
      customer: decoded.id,
      product: productId
    })
    if (existingReview) {
      console.log('Review already exists for product:', productId)
      return NextResponse.json(
        { success: false, message: 'Review already submitted for this product' },
        { status: 400 }
      )
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

    console.log('Review created:', review._id)

    return NextResponse.json({ success: true, review })

  } catch (error) {
    console.error('Error processing review submission:', error)
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    )
  }
}
