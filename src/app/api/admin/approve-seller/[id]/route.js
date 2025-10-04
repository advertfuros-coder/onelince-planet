// app/api/admin/approve-seller/[id]/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Seller from '@/lib/db/models/Seller'
import User from '@/lib/db/models/User'

export async function POST(request, { params }) {
  try {
    await connectDB()
    
    const seller = await Seller.findById(params.id)
    if (!seller) {
      return NextResponse.json({ success: false, message: 'Seller not found' }, { status: 404 })
    }

    seller.verificationStatus = 'approved'
    await seller.save()

    await User.findByIdAndUpdate(seller.userId, { isVerified: true })

    return NextResponse.json({ 
      success: true, 
      message: 'Seller approved successfully' 
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
