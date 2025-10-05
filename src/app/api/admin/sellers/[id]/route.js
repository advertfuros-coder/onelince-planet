// app/api/admin/sellers/[id]/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Seller from '@/lib/db/models/Seller'
import Product from '@/lib/db/models/Product'
import Order from '@/lib/db/models/Order'
import { verifyToken, isAdmin } from '@/lib/utils/adminAuth'

// Get single seller with details
export async function GET(request, { params }) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const seller = await Seller.findById(params.id).populate('userId', 'name email phone')
    if (!seller) {
      return NextResponse.json({ success: false, message: 'Seller not found' }, { status: 404 })
    }

    const stats = {
      productCount: seller.salesStats?.productCount || 0,
      orderCount: seller.salesStats?.orderCount || 0,
      totalRevenue: seller.salesStats?.totalRevenue || 0,
      performance: seller.performance || {},
    }

    return NextResponse.json({ success: true, seller, stats })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}

// Update seller
export async function PUT(request, { params }) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      businessName,
      tier,
      isActive,
      isVerified,
      verificationStatus,
      commission,
      bankDetails,
      pickupAddress,
      storeInfo,
      documents,
      verificationSteps,
      ratings,
      salesStats,
      performance,
      warehouses,
      subscriptionPlan,
    } = body

    const seller = await Seller.findByIdAndUpdate(
      params.id,
      {
        businessName,
        tier,
        isActive,
        isVerified,
        verificationStatus,
        commission,
        bankDetails,
        pickupAddress,
        storeInfo,
        documents,
        verificationSteps,
        ratings,
        salesStats,
        performance,
        warehouses,
        subscriptionPlan,
      },
      { new: true, runValidators: true }
    )

    if (!seller) {
      return NextResponse.json({ success: false, message: 'Seller not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Seller updated successfully', seller })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}

// Delete seller
export async function DELETE(request, { params }) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const seller = await Seller.findByIdAndDelete(params.id)
    if (!seller) {
      return NextResponse.json({ success: false, message: 'Seller not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Seller deleted successfully' })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}
