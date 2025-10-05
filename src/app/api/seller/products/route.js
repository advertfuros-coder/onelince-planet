// app/api/seller/products/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Product from '@/lib/db/models/Product'
import { verifyToken } from '@/lib/utils/auth'

export async function GET(request) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category')
    const status = searchParams.get('status')

    let query = { sellerId: decoded.userId }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ]
    }

    if (category) {
      query.category = category
    }

    if (status === 'active') {
      query.isActive = true
    } else if (status === 'inactive') {
      query.isActive = false
    } else if (status === 'pending') {
      query.isApproved = false
    } else if (status === 'approved') {
      query.isApproved = true
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const total = await Product.countDocuments(query)

    // Get stats
    const stats = {
      total: await Product.countDocuments({ sellerId: decoded.userId }),
      active: await Product.countDocuments({ sellerId: decoded.userId, isActive: true }),
      inactive: await Product.countDocuments({ sellerId: decoded.userId, isActive: false }),
      pending: await Product.countDocuments({ sellerId: decoded.userId, isApproved: false }),
      lowStock: await Product.countDocuments({ 
        sellerId: decoded.userId, 
        $expr: { $lte: ['$inventory.stock', '$inventory.lowStockThreshold'] }
      }),
    }

    return NextResponse.json({
      success: true,
      products,
      stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Products GET error:', error)
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Calculate discount percentage if sale price provided
    if (body.pricing?.salePrice && body.pricing?.basePrice) {
      body.pricing.discountPercentage = 
        ((body.pricing.basePrice - body.pricing.salePrice) / body.pricing.basePrice) * 100
    }

    const product = await Product.create({
      ...body,
      sellerId: decoded.userId,
      isApproved: false, // Requires admin approval
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Product created successfully. Awaiting admin approval.', 
      product 
    })
  } catch (error) {
    console.error('Product POST error:', error)
    return NextResponse.json({ 
      success: false, 
      message: error.code === 11000 ? 'SKU already exists' : 'Server error', 
      error: error.message 
    }, { status: 500 })
  }
}
