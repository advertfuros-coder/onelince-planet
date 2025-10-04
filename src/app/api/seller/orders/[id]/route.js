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
      .populate('items.product', 'name images pricing')
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

    // Calculate seller's total
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
    console.error('Get seller order error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    )
  }
}

// Update order status (PATCH)// app/api/seller/orders/[id]/route.js

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

    const { status, trackingId, carrier, paymentStatus } = await request.json()

    const order = await Order.findById(params.id)

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if seller has items in this order
    const hasSellerItems = order.items.some(item => 
      item.seller && item.seller.toString() === decoded.id
    )

    if (!hasSellerItems) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to update this order' },
        { status: 403 }
      )
    }

    // Handle paymentStatus update for COD orders
    if (paymentStatus) {
      if (order.payment.method === 'cod' && ['pending', 'failed'].includes(order.payment.status)) {
        order.payment.status = paymentStatus
        order.payment.paidAt = new Date()
        
        order.timeline.push({
          status: 'payment_received',
          description: 'Payment marked as received by seller',
          timestamp: new Date()
        })
      } else {
        return NextResponse.json(
          { success: false, message: 'Payment status can only be updated manually for COD pending/failed payments' },
          { status: 400 }
        )
      }
    }

    // Validate status transition
    if (status) {
      const validTransitions = {
        pending: ['processing', 'cancelled'],
        processing: ['shipped', 'cancelled'],
        shipped: ['delivered'],
        delivered: [],
        cancelled: []
      }

      if (!validTransitions[order.status]?.includes(status)) {
        return NextResponse.json(
          { success: false, message: `Cannot change status from ${order.status} to ${status}` },
          { status: 400 }
        )
      }

      order.status = status
      
      order.timeline.push({
        status,
        description: getStatusDescription(status),
        timestamp: new Date()
      })

      if (status === 'shipped') {
        order.shipping = order.shipping || {}
        order.shipping.shippedAt = new Date()
        
        const estimatedDelivery = new Date()
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 5)
        order.shipping.estimatedDelivery = estimatedDelivery
      }

      if (status === 'delivered') {
        order.shipping = order.shipping || {}
        order.shipping.deliveredAt = new Date()
      }
    }

    // Update tracking info
    if (trackingId) {
      order.shipping = order.shipping || {}
      order.shipping.trackingId = trackingId
      
      if (carrier) {
        order.shipping.carrier = carrier
      }

      order.timeline.push({
        status: 'tracking_added',
        description: `Tracking ID added: ${trackingId}`,
        timestamp: new Date()
      })
    }

    await order.save()

    // Populate and return
    const updatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name images')
      .lean()

    const sellerItems = updatedOrder.items.filter(item => 
      item.seller && item.seller.toString() === decoded.id
    )

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: {
        ...updatedOrder,
        items: sellerItems
      }
    })

  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    )
  }
}

function getStatusDescription(status) {
  const descriptions = {
    processing: 'Order is being processed',
    shipped: 'Order has been shipped',
    delivered: 'Order has been delivered',
    cancelled: 'Order has been cancelled'
  }
  return descriptions[status] || `Order status changed to ${status}`
}


// Helper function for status descriptions
 