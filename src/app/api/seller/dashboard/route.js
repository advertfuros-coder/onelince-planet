// app/api/seller/dashboard/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Seller from '@/lib/db/models/Seller'
import Product from '@/lib/db/models/Product'
import Order from '@/lib/db/models/Order'
import { verifyToken } from '@/lib/utils/auth'

export async function GET(request) {
  try {
    console.log('🔵 Dashboard API called')
    
    await connectDB()
    console.log('✅ Connected to DB')
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    console.log('🔑 Token:', token ? 'Found' : 'Not found')
    
    const decoded = verifyToken(token)
    console.log('👤 Decoded user:', decoded)
    
    if (!decoded || decoded.role !== 'seller') {
      console.log('❌ Unauthorized - role:', decoded?.role)
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get seller profile
    const seller = await Seller.findOne({ userId: decoded.id })
    console.log('🏪 Seller found:', seller ? seller.businessName : 'Not found')
    
    if (!seller) {
      console.log('❌ Seller profile not found for userId:', decoded.id)
      return NextResponse.json(
        { success: false, message: 'Seller profile not found' },
        { status: 404 }
      )
    }

    console.log('📊 Seller stats:', seller.salesStats)

    // Return seller's stored stats directly
    const responseData = {
      totalProducts: seller.salesStats?.totalProducts || 0,
      totalOrders: seller.salesStats?.totalOrders || 0,
      totalRevenue: seller.salesStats?.totalRevenue || 0,
      totalCustomers: seller.salesStats?.totalCustomers || 0,
      activeProducts: seller.salesStats?.activeProducts || 0,
      
      // Sample data for charts (you can calculate real data later)
      recentOrders: [],
      salesData: [
        { month: 'May', sales: 450000 },
        { month: 'Jun', sales: 520000 },
        { month: 'Jul', sales: 680000 },
        { month: 'Aug', sales: 750000 },
        { month: 'Sep', sales: 890000 },
        { month: 'Oct', sales: 950000 }
      ],
      topProducts: [
        { name: 'Wireless Headphones', sales: 234, revenue: 585000 },
        { name: 'Smart Watch', sales: 189, revenue: 678900 },
        { name: 'Bluetooth Speaker', sales: 156, revenue: 312000 },
        { name: 'Laptop Stand', sales: 142, revenue: 284000 },
        { name: 'USB-C Hub', sales: 128, revenue: 256000 }
      ],
      
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
      }
    }

    console.log('✅ Sending response:', responseData)

    return NextResponse.json({
      success: true,
       data: responseData // FIXED: was "responseData" now " responseData"
    })

  } catch (error) {
    console.error('❌ Dashboard API error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    )
  }
}
