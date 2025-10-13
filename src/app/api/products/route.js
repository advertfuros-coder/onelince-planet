// app/api/products/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Product from '@/lib/db/models/Product'

export async function GET(request) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = searchParams.get('order') || 'desc'

    // Build query
    const query = { isActive: true  }

    if (category) {
      query.category = category
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ]
    }

    if (minPrice || maxPrice) {
      query['pricing.basePrice'] = {}
      if (minPrice) query['pricing.basePrice'].$gte = parseFloat(minPrice)
      if (maxPrice) query['pricing.basePrice'].$lte = parseFloat(maxPrice)
    }

    // Count total documents
    const total = await Product.countDocuments(query)

    // Execute query with pagination - Remove populate for now
    const products = await Product.find(query)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean() // Add lean() for better performance

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    await connectDB()
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // TODO: Verify token and get seller ID
    const productData = await request.json()

    const product = await Product.create(productData)

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product
    }, { status: 201 })

  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    )
  }
}
