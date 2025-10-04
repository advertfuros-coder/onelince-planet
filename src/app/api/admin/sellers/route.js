// app/api/admin/sellers/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Seller from '@/lib/db/models/Seller'
import User from '@/lib/db/models/User'
import { verifyToken } from '@/lib/utils/auth'

export async function GET(request) {
  try {
    await connectDB()
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20

    const query = {}
    if (status === 'pending') {
      query.isApproved = false
    } else if (status === 'approved') {
      query.isApproved = true
    }

    const total = await Seller.countDocuments(query)

    const sellers = await Seller.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)

    return NextResponse.json({
      success: true,
      sellers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get sellers error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    )
  }
}
