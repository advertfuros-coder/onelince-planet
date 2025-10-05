// app/api/admin/sellers/[id]/verify/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Seller from '@/lib/db/models/Seller'
import { verifyToken, isAdmin } from '@/lib/utils/adminAuth'

export async function POST(request, { params }) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { action, rejectionReason } = await request.json()

    let updateData = {}
    if (action === 'approve') {
      updateData = {
        isVerified: true,
        verificationStatus: 'verified',
        verifiedAt: new Date(),
      }
    } else if (action === 'reject') {
      updateData = {
        isVerified: false,
        verificationStatus: 'rejected',
        rejectionReason: rejectionReason || 'Documents not valid',
      }
    }

    const seller = await Seller.findByIdAndUpdate(params.id, updateData, { new: true })

    if (!seller) {
      return NextResponse.json({ success: false, message: 'Seller not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `Seller ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      seller,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}
