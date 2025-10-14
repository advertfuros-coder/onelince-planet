import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Order from '@/lib/db/models/Order'
import { verifyToken } from '@/lib/utils/auth'

export async function POST(request, { params }) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { title, reason, description, images } = await request.json()

    const order = await Order.findById(id)
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 })
    }

    if (order.customer.toString() !== decoded.userId) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    if (order.status !== 'delivered') {
      return NextResponse.json({ success: false, message: 'Only delivered orders can be returned' }, { status: 400 })
    }

    order.returnRequest = {
      title,
      reason,
      description,
      images: images || [],
      status: 'requested',
      requestedAt: new Date()
    }

    order.timeline.push({
      status: 'return_requested',
      description: 'Customer requested a return',
      timestamp: new Date()
    })

    await order.save()

    return NextResponse.json({ success: true, message: 'Return request submitted successfully', order })
  } catch (error) {
    console.error('Return request error:', error)
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}