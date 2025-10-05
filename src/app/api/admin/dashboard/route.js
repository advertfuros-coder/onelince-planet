import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import Product from '@/lib/db/models/Product'
import Order from '@/lib/db/models/Order'
import Seller from '@/lib/db/models/Seller'
import Review from '@/lib/db/models/Review'
import PayoutRequest from '@/lib/db/models/PayoutRequest'
import { verifyToken, isAdmin } from '@/lib/utils/adminAuth'

export async function GET(request) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Time periods
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // === CORE COUNTS ===
    const [users, products, orders, sellers, reviews, pendingPayouts] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Seller.countDocuments(),
      Review.countDocuments(),
      PayoutRequest.countDocuments({ status: 'pending' }),
    ])

    // === REVENUE & FINANCIAL METRICS ===
    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          platformCommission: { $sum: '$platformFee' },
        },
      },
    ])
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0
    const platformCommission = revenueAgg[0]?.platformCommission || 0

    // Average Order Value
    const avgOrderValue = orders > 0 ? totalRevenue / orders : 0

    // Monthly revenue (last 30 days)
    const monthlyRevenueAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, paymentStatus: 'paid' } },
      { $group: { _id: null, revenue: { $sum: '$totalAmount' } } },
    ])
    const monthlyRevenue = monthlyRevenueAgg[0]?.revenue || 0

    // === SELLER METRICS ===
    const newSellers = await Seller.countDocuments({ createdAt: { $gte: sevenDaysAgo } })
    const activeSellers = await Seller.countDocuments({ isActive: true })
    const verifiedSellers = await Seller.countDocuments({ isVerified: true })

    // Top sellers by revenue (last 30 days)
    const topSellersAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$sellerId', revenue: { $sum: '$totalAmount' }, orderCount: { $sum: 1 } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'sellers',
          localField: '_id',
          foreignField: '_id',
          as: 'sellerInfo',
        },
      },
      { $unwind: '$sellerInfo' },
      {
        $project: {
          _id: 0,
          sellerId: '$_id',
          name: '$sellerInfo.businessName',
          revenue: 1,
          orderCount: 1,
        },
      },
    ])

    // Seller distribution by tier
    const sellerDistributionAgg = await Seller.aggregate([
      { $group: { _id: '$tier', count: { $sum: 1 } } },
    ])
    const sellerDistribution = sellerDistributionAgg.map(({ _id, count }) => ({
      name: _id || 'Free',
      value: count,
    }))

    // === ORDER METRICS ===
    const newOrders = await Order.countDocuments({ createdAt: { $gte: sevenDaysAgo } })
    const pendingOrders = await Order.countDocuments({ status: 'pending' })
    const completedOrders = await Order.countDocuments({ status: 'delivered' })
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' })

    // Order fulfillment rate
    const fulfillmentRate = orders > 0 ? ((completedOrders / orders) * 100).toFixed(2) : 0

    // Weekly new orders grouped by day
    const weeklyNewOrdersAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ])

    const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    let weeklyNewOrders = Array(7)
      .fill(0)
      .map((_, idx) => ({ day: dayMap[idx], orders: 0 }))
    for (const day of weeklyNewOrdersAgg) {
      weeklyNewOrders[day._id - 1].orders = day.count
    }

    // === CUSTOMER METRICS ===
    const newCustomers = await User.countDocuments({ role: 'customer', createdAt: { $gte: sevenDaysAgo } })

    // Repeat customer rate
    const repeatCustomersAgg = await Order.aggregate([
      { $group: { _id: '$customerId', orderCount: { $sum: 1 } } },
      { $match: { orderCount: { $gt: 1 } } },
      { $count: 'repeatCustomers' },
    ])
    const repeatCustomers = repeatCustomersAgg[0]?.repeatCustomers || 0
    const totalCustomers = await User.countDocuments({ role: 'customer' })
    const repeatCustomerRate = totalCustomers > 0 ? ((repeatCustomers / totalCustomers) * 100).toFixed(2) : 0

    // === PRODUCT METRICS ===
    const activeProducts = await Product.countDocuments({ isActive: true })
    const outOfStockProducts = await Product.countDocuments({ 'inventory.stock': 0 })

    // Top selling products (last 30 days)
    const topProductsAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQty: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        },
      },
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          name: '$productInfo.name',
          totalQty: 1,
          revenue: 1,
        },
      },
    ])

    // Low selling products (products with 0-2 sales in last 30 days)
    const lowProductsAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product', totalQty: { $sum: '$items.quantity' } } },
      { $match: { totalQty: { $lte: 2 } } },
      { $sort: { totalQty: 1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          name: '$productInfo.name',
          totalQty: 1,
        },
      },
    ])

    // Product category performance
    const categoryPerformanceAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.category',
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          category: '$_id',
          revenue: 1,
          orders: 1,
        },
      },
    ])

    // === RATING & REVIEW METRICS ===
    const avgRatingAgg = await Review.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ])
    const avgRating = avgRatingAgg[0]?.avgRating?.toFixed(2) || 0
    const totalReviews = avgRatingAgg[0]?.count || 0

    const pendingReviews = await Review.countDocuments({ status: 'pending' })

    // === REGIONAL PERFORMANCE ===
    const regionalPerformanceAgg = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: '$shippingAddress.state',
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          state: '$_id',
          orders: 1,
          revenue: 1,
        },
      },
    ])

    // === CONVERSION & ENGAGEMENT ===
    // Cart abandonment (assuming you track cart sessions)
    // This would require a separate Cart model tracking
    // For now, placeholder
    const cartAbandonmentRate = 65 // Average industry benchmark

    // === GROWTH METRICS ===
    // Calculate growth percentages (comparing last 7 days vs previous 7 days)
    const previousWeekStart = new Date()
    previousWeekStart.setDate(previousWeekStart.getDate() - 14)

    const previousWeekOrders = await Order.countDocuments({
      createdAt: { $gte: previousWeekStart, $lt: sevenDaysAgo },
    })

    const orderGrowth =
      previousWeekOrders > 0 ? (((newOrders - previousWeekOrders) / previousWeekOrders) * 100).toFixed(2) : 0

    // === OVERVIEW OBJECT ===
    const overview = {
      users,
      products,
      orders,
      sellers,
      newSellers,
      newOrders,
      activeSellers,
      verifiedSellers,
      pendingPayouts,
      totalRevenue: totalRevenue.toFixed(2),
      platformCommission: platformCommission.toFixed(2),
      avgOrderValue: avgOrderValue.toFixed(2),
      monthlyRevenue: monthlyRevenue.toFixed(2),
      avgRating,
      totalReviews,
      pendingReviews,
      activeProducts,
      outOfStockProducts,
      newCustomers,
      repeatCustomerRate,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      fulfillmentRate,
      cartAbandonmentRate,
      orderGrowth,
    }

    return NextResponse.json({
      success: true,
      overview,
      weeklyNewOrders,
      sellerDistribution,
      topSellers: topSellersAgg,
      topProducts: topProductsAgg,
      lowSellingProducts: lowProductsAgg,
      categoryPerformance: categoryPerformanceAgg,
      regionalPerformance: regionalPerformanceAgg,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}
