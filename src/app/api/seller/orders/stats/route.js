// app/api/seller/orders/stats/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Order from '@/lib/db/models/Order'
import { verifyToken } from '@/lib/utils/auth'

export async function GET(request) {
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

    // Get all orders with seller's items
    const orders = await Order.find({ 'items.seller': decoded.id }).lean()

    // Calculate statistics
    const stats = {
      totalOrders: 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      totalRevenue: 0,
      todayOrders: 0,
      weekOrders: 0,
      monthOrders: 0
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)

    orders.forEach(order => {
      // Filter seller's items
      const sellerItems = order.items.filter(item => 
        item.seller && item.seller.toString() === decoded.id
      )

      if (sellerItems.length === 0) return

      stats.totalOrders++
      stats[order.status]++

      // Calculate revenue
      const orderRevenue = sellerItems.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      )
      stats.totalRevenue += orderRevenue

      // Date-based counts
      const orderDate = new Date(order.createdAt)
      if (orderDate >= today) stats.todayOrders++
      if (orderDate >= weekAgo) stats.weekOrders++
      if (orderDate >= monthAgo) stats.monthOrders++
    })

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
