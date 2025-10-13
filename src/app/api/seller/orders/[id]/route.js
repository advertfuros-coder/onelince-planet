// app/api/seller/orders/[id]/route.js
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import connectDB from '@/lib/db/mongodb'
import Order from '@/lib/db/models/Order'
import { verifyToken } from '@/lib/utils/auth'

export async function GET(request, context) {
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
  const params = await context.params; // ✅ await params

    // Validate ObjectId format
    if (!params?.id || !mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid order ID format' },
        { status: 400 }
      )
    }

    // Fetch order by ID
    const order = await Order.findById(params.id)
      .populate('customer', 'name email phone')
      .populate({
        path: 'items.product',
        select: 'name images pricing'
      })
      .lean()

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if seller has items in this order
    const sellerItems = (order.items || []).filter(item => 
      item?.seller && item.seller.toString() === decoded.id
    )

    if (sellerItems.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No items found for this seller in this order' },
        { status: 403 }
      )
    }

    // Calculate seller's total
    const sellerTotal = sellerItems.reduce((sum, item) => {
      const price = item?.price || 0
      const quantity = item?.quantity || 0
      return sum + (price * quantity)
    }, 0)

    // Return complete order details
    return NextResponse.json({
      success: true,
      order: {
        _id: order._id,
        orderNumber: order.orderNumber || order._id.toString().slice(-8),
        userId: order.userId,
        customer: order.customer || {},
        
        // Items (seller's items only)
        items: sellerItems.map(item => ({
          product: item.product?._id,
          productName: item.product?.name || item.name,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          images: item.images || (item.product?.images ? item.product.images : []),
          status: item.status || 'pending'
        })),
        
        // Pricing
        pricing: order.pricing || {},
        sellerTotal,
        
        // Shipping Address
        shippingAddress: order.shippingAddress || {},
        
        // Payment
        payment: order.payment || {},
        
        // Status
        status: order.status || 'pending',
        
        // Dates
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        deliveredAt: order.deliveredAt || null,
        
        // Additional Info
        timeline: order.timeline || [],
        shipping: order.shipping || {},
        cancellation: order.cancellation || null,
        returnRequest: order.returnRequest || null
      }
    })

  } catch (error) {
    console.error('❌ Get order details error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    )
  }
}

// Update order (Accept/Update Status) - PATCH
export async function PATCH(request, context) {
  try {

      const params = await context.params; // ✅ await params

    await connectDB()
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    
    if (!decoded || decoded.role !== 'seller') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate ObjectId format
    if (!params?.id || !mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid order ID format' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { action, status, trackingId, carrier, paymentStatus, cancellationReason } = body

    const order = await Order.findById(params.id)

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if seller has items in this order
    const sellerItemIndices = []
    order.items.forEach((item, index) => {
      if (item?.seller && item.seller.toString() === decoded.id) {
        sellerItemIndices.push(index)
      }
    })

    if (sellerItemIndices.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to update this order' },
        { status: 403 }
      )
    }

    // Initialize timeline if not exists
    if (!Array.isArray(order.timeline)) {
      order.timeline = []
    }

    // Handle different actions
    if (action === 'accept') {
      // Accept Order (pending -> processing)
      // Updated logic: allow acceptance if order.status is 'pending' OR seller's individual items are 'pending'
      const sellerPendingItems = sellerItemIndices.filter(index => order.items[index].status === 'pending')
      if (order.status !== 'pending' && sellerPendingItems.length === 0) {
        return NextResponse.json(
          { success: false, message: 'Order can only be accepted when status is pending or seller has pending items' },
          { status: 400 }
        )
      }

      // Update seller's items to processing
      sellerPendingItems.forEach(index => {
        order.items[index].status = 'processing'
      })

      // If all items in the order are processing after this action, then set main order status to processing
      const allItemsProcessing = order.items.every(item => item.status === 'processing')
      if (allItemsProcessing) {
        order.status = 'processing'
      }

      order.timeline.push({
        status: 'processing',
        description: 'Order is being processed by seller',
        timestamp: new Date()
      })

      await order.save()

      return NextResponse.json({
        success: true,
        message: 'Order accepted successfully',
        order: await getOrderResponse(order, decoded.id)
      })
    }

    // Handle payment status update for COD
    if (paymentStatus) {
      if (!order.payment) {
        order.payment = {}
      }

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
          { success: false, message: 'Payment status can only be updated for COD pending/failed payments' },
          { status: 400 }
        )
      }
    }

    // Handle status update
    if (status) {
      const validTransitions = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['processing', 'cancelled'],
        processing: ['shipped', 'cancelled'],
        shipped: ['delivered'],
        delivered: [],
        cancelled: [],
        returned: [],
        refunded: []
      }

      const currentStatus = order.status || 'pending'

      if (!validTransitions[currentStatus]) {
        return NextResponse.json(
          { success: false, message: `Invalid current status: ${currentStatus}` },
          { status: 400 }
        )
      }

      if (!validTransitions[currentStatus].includes(status)) {
        return NextResponse.json(
          { success: false, message: `Cannot change status from ${currentStatus} to ${status}` },
          { status: 400 }
        )
      }

      // Handle cancellation
      if (status === 'cancelled') {
        if (!order.cancellation) {
          order.cancellation = {}
        }
        order.cancellation.cancelledBy = 'seller'
        order.cancellation.cancelledAt = new Date()
        order.cancellation.reason = cancellationReason || 'Cancelled by seller'
      }

      // Update main order status
      order.status = status
      
      // Update seller's item statuses
      sellerItemIndices.forEach(index => {
        order.items[index].status = status
      })
      
      order.timeline.push({
        status,
        description: getStatusDescription(status),
        timestamp: new Date()
      })

      // Update shipping info based on status
      if (status === 'shipped') {
        if (!order.shipping) {
          order.shipping = {}
        }
        
        order.shipping.shippedAt = new Date()
        
        const estimatedDelivery = new Date()
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 5)
        order.shipping.estimatedDelivery = estimatedDelivery
      }

      if (status === 'delivered') {
        if (!order.shipping) {
          order.shipping = {}
        }
        order.shipping.deliveredAt = new Date()
        order.deliveredAt = new Date()
      }
    }

    // Update tracking info
    if (trackingId) {
      if (!order.shipping) {
        order.shipping = {}
      }

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

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: await getOrderResponse(order, decoded.id)
    })

  } catch (error) {
    console.error('❌ Update order error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    )
  }
}

// Helper function to format order response
async function getOrderResponse(order, sellerId) {
  const populatedOrder = await Order.findById(order._id)
    .populate('customer', 'name email phone')
    .populate({
      path: 'items.product',
      select: 'name images pricing'
    })
    .lean()

  const sellerItems = (populatedOrder.items || []).filter(item => 
    item?.seller && item.seller.toString() === sellerId
  )

  const sellerTotal = sellerItems.reduce((sum, item) => {
    const price = item?.price || 0
    const quantity = item?.quantity || 0
    return sum + (price * quantity)
  }, 0)

  return {
    _id: populatedOrder._id,
    orderNumber: populatedOrder.orderNumber || populatedOrder._id.toString().slice(-8),
    customer: populatedOrder.customer || {},
    items: sellerItems.map(item => ({
      product: item.product?._id,
      productName: item.product?.name || item.name,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      images: item.images || (item.product?.images ? item.product.images : []),
      status: item.status || 'pending'
    })),
    pricing: populatedOrder.pricing || {},
    sellerTotal,
    shippingAddress: populatedOrder.shippingAddress || {},
    payment: populatedOrder.payment || {},
    status: populatedOrder.status,
    createdAt: populatedOrder.createdAt,
    updatedAt: populatedOrder.updatedAt,
    deliveredAt: populatedOrder.deliveredAt || null,
    timeline: populatedOrder.timeline || [],
    shipping: populatedOrder.shipping || {},
    cancellation: populatedOrder.cancellation || null,
    returnRequest: populatedOrder.returnRequest || null
  }
}

function getStatusDescription(status) {
  const descriptions = {
    pending: 'Order is pending',
    confirmed: 'Order confirmed by seller',
    processing: 'Order is being processed',
    shipped: 'Order has been shipped',
    delivered: 'Order has been delivered',
    cancelled: 'Order has been cancelled',
    returned: 'Order has been returned',
    refunded: 'Order has been refunded'
  }
  return descriptions[status] || `Order status changed to ${status}`
}
