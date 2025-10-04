import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Product from '@/lib/db/models/Product'
import Review from '@/lib/db/models/Review'

export async function GET(request, { params }) {
  try {
    await connectDB()

    const { id } = params

    const product = await Product.findById(id)
      .populate('sellerId', 'name email') // populate seller info
      .lean()

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 })
    }

    // Fetch reviews for product with populated customer info
    const reviews = await Review.find({ product: id, status: 'published' })
      .populate('customer', 'name')
      .sort({ createdAt: -1 })
      .lean()

    // Compute average rating
    let avgRating = 0
    if (reviews.length > 0) {
      avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    }

    return NextResponse.json({ success: true, product, reviews, avgRating })
  } catch (error) {
    console.error("Error fetching product details:", error)
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}
