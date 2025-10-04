// app/api/seller/orders/bulk-update/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Order from '@/lib/db/models/Order'
import { verifyToken } from '@/lib/utils/auth'

export async function POST(request) {
  try {
    await connectDB()
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    
    if (!decoded || decoded.role !== 'seller') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { orderIds, status } = await request.json()

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Order IDs are required' },
        { status: 400 }
      )
    }

    const updatedOrders = []

    for (const orderId of orderIds) {
      const order = await Order.findById(orderId)
      
      if (!order) continue

      // Check if seller has items in this order
      const hasSellerItems = order.items.some(item => 
        item.seller && item.seller.toString() === decoded.id
      )

      if (!hasSellerItems) continue

      // Update status
      order.status = status
      order.timeline.push({
        status,
        description: `Bulk update: ${status}`,
        timestamp: new Date()
      })

      await order.save()
      updatedOrders.push(order._id)
    }

    return NextResponse.json({
      success: true,
      message: `${updatedOrders.length} orders updated`,
      updatedCount: updatedOrders.length
    })

  } catch (error) {
    console.error('Bulk update error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
