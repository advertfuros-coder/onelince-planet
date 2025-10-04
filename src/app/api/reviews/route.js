// app/api/reviews/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Review from '@/lib/db/models/Review'
import Order from '@/lib/db/models/Order'
import { verifyToken } from '@/lib/utils/auth'

export async function GET(request) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10

    const query = { status: 'published' }
    if (productId) {
      query.product = productId
    }

    const total = await Review.countDocuments(query)

    const reviews = await Review.find(query)
      .populate('customer', 'name avatar')
      .populate('product', 'name images')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)

    return NextResponse.json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get reviews error:', error)
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
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { product, order, rating, title, comment, images } = await request.json()

    // Verify user has purchased this product
    const orderDoc = await Order.findOne({
      _id: order,
      customer: decoded.id,
      'items.product': product,
      status: 'delivered'
    })

    if (!orderDoc) {
      return NextResponse.json(
        { success: false, message: 'You can only review products you have purchased' },
        { status: 400 }
      )
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      customer: decoded.id,
      product,
      order
    })

    if (existingReview) {
      return NextResponse.json(
        { success: false, message: 'You have already reviewed this product' },
        { status: 400 }
      )
    }

    // Create review
    const review = await Review.create({
      product,
      customer: decoded.id,
      order,
      rating,
      title,
      comment,
      images,
      verified: true
    })

    const populatedReview = await Review.findById(review._id)
      .populate('customer', 'name avatar')
      .populate('product', 'name images')

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      review: populatedReview
    }, { status: 201 })

  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    )
  }
}
