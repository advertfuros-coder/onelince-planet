// app/api/wishlist/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import { verifyToken } from '@/lib/utils/auth'

export async function GET(request) {
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

    const user = await User.findById(decoded.id)
      .populate({
        path: 'wishlist',
        populate: {
          path: 'seller',
          select: 'name'
        }
      })

    return NextResponse.json({
      success: true,
      wishlist: user.wishlist
    })

  } catch (error) {
    console.error('Get wishlist error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    )
  }
}
