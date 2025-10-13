// app/api/seller/dashboard/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Seller from '@/lib/db/models/Seller'
import Product from '@/lib/db/models/Product'
import Order from '@/lib/db/models/Order'
import User from '@/lib/db/models/User'
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

    // Get seller profile
    const seller = await Seller.findOne({ userId: decoded.id })
    
    if (!seller) {
      return NextResponse.json(
        { success: false, message: 'Seller profile not found' },
        { status: 404 }
      )
    }

    // ========== REAL DATA CALCULATIONS ==========

    // 1. Get all products for this seller
    const products = await Product.find({ sellerId: decoded.id })
    const productIds = products.map(p => p._id)

    // 2. Get all orders containing seller's products
    const allOrders = await Order.find({
      'items.seller': decoded.id
    }).populate('customer', 'name email phone')

    // 3. Filter items belonging to this seller from all orders
    const sellerOrderItems = []
    const recentOrdersData = []

    allOrders.forEach(order => {
      const sellerItems = order.items.filter(item => 
        item.seller.toString() === decoded.id.toString()
      )

      if (sellerItems.length > 0) {
        sellerOrderItems.push(...sellerItems.map(item => ({
          ...item.toObject(),
          orderId: order._id,
          orderNumber: order.orderNumber,
          customer: order.customer,
          paymentStatus: order.payment.status,
          createdAt: order.createdAt,
          shippingAddress: order.shippingAddress
        })))

        // Add to recent orders
        recentOrdersData.push({
          orderId: order._id,
          orderNumber: order.orderNumber,
          customer: order.customer,
          items: sellerItems,
          createdAt: order.createdAt,
          paymentStatus: order.payment.status
        })
      }
    })

    // 4. Calculate ORDER STATUS BREAKDOWN
    const orderStatusBreakdown = {
      pending: sellerOrderItems.filter(item => item.status === 'pending').length,
      processing: sellerOrderItems.filter(item => item.status === 'processing').length,
      shipped: sellerOrderItems.filter(item => item.status === 'shipped').length,
      delivered: sellerOrderItems.filter(item => item.status === 'delivered').length,
      cancelled: sellerOrderItems.filter(item => item.status === 'cancelled').length,
      returned: sellerOrderItems.filter(item => item.status === 'returned').length
    }

    // 5. Calculate REVENUE (only delivered items)
    const deliveredItems = sellerOrderItems.filter(item => item.status === 'delivered')
    
    const grossRevenue = deliveredItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity)
    }, 0)

    const commissionRate = seller.commissionRate || 5
    const commissionAmount = (grossRevenue * commissionRate) / 100
    const netRevenue = grossRevenue - commissionAmount // Revenue after commission

    // 6. Calculate PENDING PAYOUT (delivered but payment pending)
    const pendingPayoutItems = deliveredItems.filter(item => 
      item.paymentStatus === 'pending' || item.paymentStatus === 'paid'
    )
    
    const pendingPayoutAmount = pendingPayoutItems.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity
      const itemCommission = (itemTotal * commissionRate) / 100
      return sum + (itemTotal - itemCommission)
    }, 0)

    // 7. Get UNIQUE CUSTOMERS
    const uniqueCustomers = new Set(
      sellerOrderItems.map(item => item.customer?._id?.toString()).filter(Boolean)
    )

    // 8. Calculate AVERAGE ORDER VALUE
    const totalOrderValue = sellerOrderItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    )
    const avgOrderValue = sellerOrderItems.length > 0 
      ? totalOrderValue / sellerOrderItems.length 
      : 0

    // 9. Get LOW STOCK PRODUCTS
    const lowStockProducts = products.filter(p => 
      p.inventory.trackInventory && 
      p.inventory.stock <= p.inventory.lowStockThreshold &&
      p.isActive
    ).map(p => ({
      _id: p._id,
      name: p.name,
      stock: p.inventory.stock,
      threshold: p.inventory.lowStockThreshold,
      image: p.images[0]?.url
    }))

    // 10. Get RECENT ORDERS (Last 10)
    const recentOrders = recentOrdersData
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(order => ({
        orderId: order.orderNumber || order.orderId.toString().slice(-8),
        customer: order.customer?.name || 'Guest',
        customerEmail: order.customer?.email,
        items: order.items.length,
        amount: order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: order.items[0]?.status || 'pending',
        paymentStatus: order.paymentStatus,
        date: order.createdAt
      }))

    // 11. Calculate MONTHLY SALES DATA (Last 6 months)
    const now = new Date()
    const salesByMonth = {}
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = date.toLocaleString('en-US', { month: 'short' })
      salesByMonth[monthKey] = 0
    }

    deliveredItems.forEach(item => {
      const itemDate = new Date(item.createdAt)
      const monthKey = itemDate.toLocaleString('en-US', { month: 'short' })
      
      if (salesByMonth.hasOwnProperty(monthKey)) {
        const itemTotal = item.price * item.quantity
        const itemCommission = (itemTotal * commissionRate) / 100
        salesByMonth[monthKey] += (itemTotal - itemCommission)
      }
    })

    const salesData = Object.entries(salesByMonth).map(([month, sales]) => ({
      month,
      sales: Math.round(sales)
    }))

    // 12. Get TOP SELLING PRODUCTS
    const productSales = {}
    
    deliveredItems.forEach(item => {
      const productId = item.product.toString()
      if (!productSales[productId]) {
        productSales[productId] = {
          productId,
          name: item.name,
          quantity: 0,
          revenue: 0
        }
      }
      productSales[productId].quantity += item.quantity
      const itemTotal = item.price * item.quantity
      const itemCommission = (itemTotal * commissionRate) / 100
      productSales[productId].revenue += (itemTotal - itemCommission)
    })

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(p => ({
        name: p.name,
        sales: p.quantity,
        revenue: Math.round(p.revenue)
      }))

    // 13. Calculate THIS MONTH vs LAST MONTH
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const thisMonthRevenue = deliveredItems
      .filter(item => new Date(item.createdAt) >= thisMonth)
      .reduce((sum, item) => {
        const itemTotal = item.price * item.quantity
        const itemCommission = (itemTotal * commissionRate) / 100
        return sum + (itemTotal - itemCommission)
      }, 0)

    const lastMonthRevenue = deliveredItems
      .filter(item => {
        const itemDate = new Date(item.createdAt)
        return itemDate >= lastMonth && itemDate < thisMonth
      })
      .reduce((sum, item) => {
        const itemTotal = item.price * item.quantity
        const itemCommission = (itemTotal * commissionRate) / 100
        return sum + (itemTotal - itemCommission)
      }, 0)

    const revenueGrowth = lastMonthRevenue > 0
      ? (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
      : 0

    // 14. Calculate CANCELLATION RATE
    const cancelledCount = orderStatusBreakdown.cancelled + orderStatusBreakdown.returned
    const totalOrders = sellerOrderItems.length
    const cancellationRate = totalOrders > 0 
      ? ((cancelledCount / totalOrders) * 100).toFixed(1)
      : 0

    // 15. Update seller stats in DB (optional - run in background)
    seller.salesStats = {
      totalSales: grossRevenue,
      totalRevenue: netRevenue,
      totalOrders: sellerOrderItems.length,
      totalProducts: products.length,
      activeProducts: products.filter(p => p.isActive && p.isApproved).length,
      totalCustomers: uniqueCustomers.size
    }
    seller.save().catch(err => console.error('Failed to update seller stats:', err))

    // ========== RESPONSE DATA ==========
    const responseData = {
      // Key Metrics
      totalProducts: products.length,
      activeProducts: products.filter(p => p.isActive && p.isApproved).length,
      totalOrders: sellerOrderItems.length,
      grossRevenue: Math.round(grossRevenue),
      commissionAmount: Math.round(commissionAmount),
      netRevenue: Math.round(netRevenue), // Revenue after commission
      totalCustomers: uniqueCustomers.size,
      avgOrderValue: Math.round(avgOrderValue),
      pendingPayout: Math.round(pendingPayoutAmount),
      
      // Order Status Breakdown
      orderStatusBreakdown,
      
      // Growth Metrics
      revenueGrowth: parseFloat(revenueGrowth),
      cancellationRate: parseFloat(cancellationRate),
      
      // Charts & Lists
      salesData,
      topProducts,
      recentOrders,
      lowStockProducts,
      
      // Seller Info
      sellerInfo: {
        businessName: seller.businessName,
        storeName: seller.storeInfo?.storeName,
        rating: seller.ratings?.average || 0,
        totalReviews: seller.ratings?.totalReviews || 0,
        verificationStatus: seller.verificationStatus,
        subscriptionPlan: seller.subscriptionPlan,
        commissionRate: seller.commissionRate,
        performance: seller.performance || {
          orderFulfillmentRate: 0,
          avgShippingTime: 0,
          customerSatisfactionScore: 0
        }
      },

      // Alerts & Actions
      alerts: {
        lowStock: lowStockProducts.length,
        pendingOrders: orderStatusBreakdown.pending,
        processingOrders: orderStatusBreakdown.processing,
        shippedOrders: orderStatusBreakdown.shipped
      }
    }

    return NextResponse.json({
      success: true,
       responseData
    })

  } catch (error) {
    console.error('❌ Dashboard API error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    )
  }
}
