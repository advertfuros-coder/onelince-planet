// app/api/admin/sellers/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Seller from '@/lib/db/models/Seller'
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
    const status = searchParams.get('status') || ''
    const tier = searchParams.get('tier') || ''
    const verificationStatus = searchParams.get('verification') || ''

    const skip = (page - 1) * limit

    // Build query
    let query = {}
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
      ]
    }
    if (status === 'active') query.isActive = true
    if (status === 'inactive') query.isActive = false
    if (tier) query.tier = tier
    if (verificationStatus === 'pending') query.verificationStatus = 'pending'
    if (verificationStatus === 'verified') query.isVerified = true
    if (verificationStatus === 'rejected') query.verificationStatus = 'rejected'

    const [sellers, total] = await Promise.all([
      Seller.find(query).populate('userId', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Seller.countDocuments(query),
    ])

    return NextResponse.json({
      success: true,
      sellers,
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
