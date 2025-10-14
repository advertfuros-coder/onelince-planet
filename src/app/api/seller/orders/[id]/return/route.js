import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Order from '@/lib/db/models/Order'
import { verifyToken } from '@/lib/utils/auth'

export async function GET(request, { params }) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'seller') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const order = await Order.findById(id)
    if (!order) return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 })

    const hasSellerItems = order.items.some(item => item.seller.toString() === decoded.userId)
    if (!hasSellerItems) {
      return NextResponse.json({ success: false, message: 'No access to this order' }, { status: 403 })
    }

    return NextResponse.json({ success: true, returnRequest: order.returnRequest || null })
  } catch (error) {
    console.error('Seller return view error:', error)
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}