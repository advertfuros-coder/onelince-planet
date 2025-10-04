// app/api/reviews/pending/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Review from '@/lib/db/models/Review'
import { verifyToken } from '@/lib/utils/auth'

export async function GET(request) {
  await connectDB()
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  const decoded = verifyToken(token)
  if (!decoded || (decoded.role !== 'admin' && decoded.role !== 'seller')) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
  const reviews = await Review.find({ status: 'pending' })
      .populate('product', 'name')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .lean()
  return NextResponse.json({ success: true, reviews })
}
