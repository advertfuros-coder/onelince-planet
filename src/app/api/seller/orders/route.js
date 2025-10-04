// app/api/seller/orders/route.js
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const dateRange = searchParams.get('dateRange')

    // Build query
    let query = { 'items.seller': decoded.id }

    // Filter by status
    if (status && status !== 'all') {
      query.status = status
    }

    // Search by order number or customer name
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } }
      ]
    }

    // Filter by date range
    if (dateRange && dateRange !== 'all') {
      const now = new Date()
      let startDate

      switch (dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0))
          break
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7))
          break
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1))
          break
      }

      if (startDate) {
        query.createdAt = { $gte: startDate }
      }
    }

    // Get orders
    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .lean()

    // Filter items to only show seller's products
    const filteredOrders = orders.map(order => ({
      ...order,
      items: order.items.filter(item => 
        item.seller && item.seller.toString() === decoded.id
      )
    })).filter(order => order.items.length > 0)

    // Calculate seller's total for each order
    const ordersWithSellerTotal = filteredOrders.map(order => {
      const sellerTotal = order.items.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      )
      return {
        ...order,
        sellerTotal
      }
    })

    return NextResponse.json({
      success: true,
      orders: ordersWithSellerTotal,
      count: ordersWithSellerTotal.length
    })

  } catch (error) {
    console.error('Get seller orders error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    )
  }
}
