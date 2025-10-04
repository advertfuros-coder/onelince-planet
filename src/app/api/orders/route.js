// app/api/orders/route.js
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

    // Find all orders where customer is current user sorted by date desc
    const orders = await Order.find({ customer: decoded.id })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ success: true, orders })
  } catch (error) {
    console.error('Orders list GET error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    )
  }
}
