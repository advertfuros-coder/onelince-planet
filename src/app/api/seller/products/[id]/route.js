// app/api/seller/orders/[id]/route.js
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
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const order = await Order.findById(params.id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name images')
      .lean()

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if seller has items in this order
    const sellerItems = order.items.filter(item => 
      item.seller && item.seller.toString() === decoded.id
    )

    if (sellerItems.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No items found for this seller' },
        { status: 403 }
      )
    }

    // Return order with only seller's items
    const sellerTotal = sellerItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    )

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        items: sellerItems,
        sellerTotal
      }
    })

  } catch (error) {
    console.error('Get order detail error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    )
  }
}

// Update order status
export async function PATCH(request, { params }) {
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

    const { status, trackingId } = await request.json()

    const order = await Order.findById(params.id)

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    // Update order status
    if (status) {
      order.status = status
      
      // Add to timeline
      order.timeline.push({
        status,
        description: `Order ${status}`,
        location: 'Seller Dashboard',
        timestamp: new Date()
      })
    }

    if (trackingId) {
      order.trackingId = trackingId
    }

    await order.save()

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order
    })

  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    )
  }
}
