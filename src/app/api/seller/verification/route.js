// app/api/seller/verification/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import SellerVerification from '@/lib/db/models/SellerVerification'
import { verifyToken } from '@/lib/utils/auth'

export async function GET(request) {
  try {
    await connectDB()
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'seller') {
      return NextResponse.json({ success: false, message: 'Seller access required' }, { status: 403 })
    }

    let verification = await SellerVerification.findOne({ sellerId: decoded.userId })

    if (!verification) {
      // Create default verification record
      verification = await SellerVerification.create({
        sellerId: decoded.userId,
        verificationLevel: 'none',
        badges: [],
        documents: [],
        metrics: {}
      })
    }

    // Check for new badge eligibility
    const eligibleBadges = verification.checkBadgeEligibility()
    
    // Add new badges if eligible
    for (const badge of eligibleBadges) {
      const exists = verification.badges.some(b => b.type === badge.type)
      if (!exists) {
        verification.badges.push(badge)
      }
    }

    await verification.save()

    return NextResponse.json({
      success: true,
      verification: {
        level: verification.verificationLevel,
        badges: verification.badges,
        metrics: verification.metrics
      }
    })
  } catch (error) {
    console.error('Verification API Error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    }, { status: 500 })
  }
}
