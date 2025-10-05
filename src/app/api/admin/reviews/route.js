// app/api/admin/reviews/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Review from '@/lib/db/models/Review'
import Product from '@/lib/db/models/Product'
import { verifyToken, isAdmin } from '@/lib/utils/adminAuth'

export async function GET(request) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const search = searchParams.get('search') || ''
    const rating = searchParams.get('rating') || ''
    const status = searchParams.get('status') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = searchParams.get('order') || 'desc'

    const skip = (page - 1) * limit

    // Build query
    let query = {}
    if (rating) query.rating = parseInt(rating)
    if (status === 'published') query.isApproved = true
    if (status === 'pending') query.isApproved = false

    // Build sort
    const sort = {}
    sort[sortBy] = order === 'asc' ? 1 : -1

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('userId', 'name email')
        .populate('productId', 'name images')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(query),
    ])

    // Calculate stats
    const stats = {
      totalReviews: await Review.countDocuments(),
      publishedReviews: await Review.countDocuments({ isApproved: true }),
      pendingReviews: await Review.countDocuments({ isApproved: false }),
      averageRating: await Review.aggregate([
        { $group: { _id: null, avg: { $avg: '$rating' } } },
      ]).then((res) => res[0]?.avg || 0),
      fiveStar: await Review.countDocuments({ rating: 5 }),
      fourStar: await Review.countDocuments({ rating: 4 }),
      threeStar: await Review.countDocuments({ rating: 3 }),
      twoStar: await Review.countDocuments({ rating: 2 }),
      oneStar: await Review.countDocuments({ rating: 1 }),
    }

    return NextResponse.json({
      success: true,
      reviews,
      stats,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}

// Bulk update reviews
export async function PATCH(request) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { reviewIds, action } = await request.json()

    if (action === 'approve') {
      await Review.updateMany({ _id: { $in: reviewIds } }, { isApproved: true })
    } else if (action === 'reject') {
      await Review.updateMany({ _id: { $in: reviewIds } }, { isApproved: false })
    } else if (action === 'delete') {
      await Review.deleteMany({ _id: { $in: reviewIds } })
    }

    // Recalculate product ratings
    const reviews = await Review.find({ _id: { $in: reviewIds } })
    const productIds = [...new Set(reviews.map((r) => r.productId))]

    for (const productId of productIds) {
      const productReviews = await Review.find({ productId, isApproved: true })
      const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length || 0

      await Product.findByIdAndUpdate(productId, {
        'ratings.average': avgRating,
        'ratings.count': productReviews.length,
      })
    }

    return NextResponse.json({ success: true, message: 'Reviews updated successfully' })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}
