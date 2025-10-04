// app/api/orders/[id]/return/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Order from '@/lib/db/models/Order'
import { verifyToken } from '@/lib/utils/auth'

export async function POST(request, { params }) {
  await connectDB()
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  const decoded = verifyToken(token)
  if (!decoded) 
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const { reason, type } = await request.json()
  const order = await Order.findById(params.id)
  if (!order || order.customer.toString() !== decoded.id)
    return NextResponse.json({ success: false, message: 'Invalid order' }, { status: 403 })

  if (order.status === 'delivered' && type === 'return') {
    order.returnRequest = {
      reason,
      status: 'requested',
      requestedAt: new Date()
    }
    order.timeline.push({ status: 'return_requested', description: reason, timestamp: new Date() })
    await order.save()
    return NextResponse.json({ success: true, message: 'Return requested' })
  }

  if (['pending', 'processing'].includes(order.status) && type === 'cancel') {
    order.status = 'cancelled'
    order.cancellation = { reason, cancelledBy: 'customer', cancelledAt: new Date() }
    order.timeline.push({ status: 'cancelled', description: reason, timestamp: new Date() })
    await order.save()
    return NextResponse.json({ success: true, message: 'Order cancelled' })
  }

  return NextResponse.json({ success: false, message: 'Action not allowed' }, { status: 400 })
}
