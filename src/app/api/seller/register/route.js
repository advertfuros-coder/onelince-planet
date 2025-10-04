// app/api/seller/register/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import User from '@/lib/db/models/User'
import Seller from '@/lib/db/models/Seller'

export async function POST(request) {
  try {
    await connectDB()

    const body = await request.json()
    const {
      name,
      email,
      password,
      phone,
      storeName,
      storeDescription,
      storeWebsite,
      storeAddress,
      businessType,
      businessCategory,
      establishedYear,
      gstin,
      pan,
      bankDetails
    } = body

    // Validate required fields
    if (!name || !email || !password || !phone || !storeName || 
        !storeAddress || !gstin || !pan || !bankDetails) {
      return NextResponse.json(
        { success: false, message: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    // Check if email exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 400 }
      )
    }

    // Check if GSTIN exists
    const existingSeller = await Seller.findOne({ gstin })
    if (existingSeller) {
      return NextResponse.json(
        { success: false, message: 'GSTIN already registered' },
        { status: 400 }
      )
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'seller',
      isVerified: false
    })

    // Create seller profile - businessType at root level
    const seller = await Seller.create({
      userId: user._id,
      businessName: storeName,
      gstin,
      pan,
      businessType: businessType || 'individual', // Root level
      businessCategory: businessCategory || 'retailer',
      establishedYear,
      bankDetails,
      pickupAddress: storeAddress,
      storeInfo: {
        storeName,
        storeDescription,
        website: storeWebsite
        // No businessType here
      },
      verificationStatus: 'pending'
    })

    return NextResponse.json({
      success: true,
      message: 'Seller registration submitted. Awaiting admin approval.',
     
        sellerId: seller._id,
        businessName: seller.businessName,
        verificationStatus: seller.verificationStatus
     
    }, { status: 201 })

  } catch (error) {
    console.error('Seller registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    )
  }
}
