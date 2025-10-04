// app/api/seller/analytics/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Order from '@/lib/db/models/Order'
import Product from '@/lib/db/models/Product'
import Review from '@/lib/db/models/Review'
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
    const period = searchParams.get('period') || '30days'

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    if (period === '7days') {
      startDate.setDate(now.getDate() - 7)
    } else if (period === '30days') {
      startDate.setDate(now.getDate() - 30)
    } else if (period === '90days') {
      startDate.setDate(now.getDate() - 90)
    } else if (period === '1year') {
      startDate.setFullYear(now.getFullYear() - 1)
    }

    // Get seller's products
    const sellerProducts = await Product.find({ seller: decoded.id }).select('_id')
    const productIds = sellerProducts.map(p => p._id)

    // Get orders containing seller's products
    const orders = await Order.find({
      'items.seller': decoded.id,
      createdAt: { $gte: startDate }
    })

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => {
      const sellerItems = order.items.filter(item => 
        item.seller.toString() === decoded.id
      )
      const sellerTotal = sellerItems.reduce((itemSum, item) => 
        itemSum + (item.price * item.quantity), 0
      )
      return sum + sellerTotal
    }, 0)

    const totalOrders = orders.length

    const totalProducts = await Product.countDocuments({ seller: decoded.id, isActive: true })

    // Get reviews
    const reviews = await Review.find({ 
      product: { $in: productIds },
      status: 'published'
    })
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
      : 0

    // Sales trend by day/month
    const salesTrend = []
    const groupedOrders = {}
    
    orders.forEach(order => {
      const date = new Date(order.createdAt)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      
      if (!groupedOrders[key]) {
        groupedOrders[key] = { date: key, revenue: 0, orders: 0 }
      }
      
      const sellerItems = order.items.filter(item => item.seller.toString() === decoded.id)
      const dayRevenue = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      
      groupedOrders[key].revenue += dayRevenue
      groupedOrders[key].orders += 1
    })

    Object.values(groupedOrders).forEach(day => {
      salesTrend.push(day)
    })

    // Top selling products
    const productSales = {}
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.seller.toString() === decoded.id) {
          const pid = item.product.toString()
          if (!productSales[pid]) {
            productSales[pid] = {
              productId: pid,
              name: item.name,
              quantity: 0,
              revenue: 0
            }
          }
          productSales[pid].quantity += item.quantity
          productSales[pid].revenue += item.price * item.quantity
        }
      })
    })

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    return NextResponse.json({
      success: true,
      analytics: {
        overview: {
          totalRevenue,
          totalOrders,
          totalProducts,
          avgRating: avgRating.toFixed(1),
          totalReviews: reviews.length
        },
        salesTrend,
        topProducts,
        period
      }
    })

  } catch (error) {
    console.error('Get seller analytics error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    )
  }
}
