// app/api/admin/sellers/[id]/approve/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Seller from '@/lib/db/models/Seller'
import User from '@/lib/db/models/User'

export async function POST(request, { params }) {
  try {
    await connectDB()

    const { approved, rejectionReason } = await request.json()

    const seller = await Seller.findById(params.id)
    
    if (!seller) {
      return NextResponse.json(
        { success: false, message: 'Seller not found' },
        { status: 404 }
      )
    }

    if (approved) {
      seller.verificationStatus = 'approved'
      seller.approvedAt = new Date()
      
      // Update user verification
      await User.findByIdAndUpdate(seller.userId, { isVerified: true })
    } else {
      seller.verificationStatus = 'rejected'
      seller.rejectionReason = rejectionReason || 'Not specified'
    }

    await seller.save()

    return NextResponse.json({
      success: true,
      message: `Seller ${approved ? 'approved' : 'rejected'} successfully`,
      seller
    })

  } catch (error) {
    console.error('Approve seller error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
