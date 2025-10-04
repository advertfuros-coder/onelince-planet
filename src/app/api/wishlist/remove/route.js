// app/api/wishlist/remove/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import { verifyToken } from '@/lib/utils/auth'

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

    const { productId } = await request.json()

    const user = await User.findById(decoded.id)
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId)
    await user.save()

    return NextResponse.json({
      success: true,
      message: 'Product removed from wishlist'
    })

  } catch (error) {
    console.error('Remove from wishlist error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    )
  }
}
