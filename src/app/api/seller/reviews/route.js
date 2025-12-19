// app/api/seller/reviews/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Seller from '@/lib/db/models/Seller'
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

    // Get seller profile
    const seller = await Seller.findOne({ userId: decoded.userId })
    if (!seller) {
      return NextResponse.json(
        { success: false, message: 'Seller profile not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const rating = searchParams.get('rating')
    const search = searchParams.get('search')

    // Build query to find reviews for seller's products
    let query = { seller: seller._id }
    
    if (rating && rating !== 'all') {
      query.rating = parseInt(rating)
    }

    if (search) {
      // Search in review text or customer name
      query.$or = [
        { comment: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } }
      ]
    }

    const reviews = await Review.find(query)
      .populate('product', 'name images')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .lean()

    // Calculate stats
    const allReviews = await Review.find({ seller: seller._id })
    const averageRating = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0

    const ratingBreakdown = {
      5: allReviews.filter(r => r.rating === 5).length,
      4: allReviews.filter(r => r.rating === 4).length,
      3: allReviews.filter(r => r.rating === 3).length,
      2: allReviews.filter(r => r.rating === 2).length,
      1: allReviews.filter(r => r.rating === 1).length,
    }

    return NextResponse.json({
      success: true,
      reviews: reviews.map(review => ({
        id: review._id,
        customer: {
          name: review.customer?.name || 'Anonymous',
          email: review.customer?.email
        },
        product: {
          id: review.product?._id,
          name: review.product?.name || 'Unknown Product',
          image: review.product?.images?.[0]?.url
        },
        rating: review.rating,
        comment: review.comment,
        date: review.createdAt,
        verified: review.verifiedPurchase || false,
        helpful: review.helpful || 0,
        replied: !!review.sellerReply,
        reply: review.sellerReply
      })),
      stats: {
        total: allReviews.length,
        averageRating: averageRating.toFixed(1),
        ratingBreakdown
      }
    })

  } catch (error) {
    console.error('Reviews API error:', error)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}
