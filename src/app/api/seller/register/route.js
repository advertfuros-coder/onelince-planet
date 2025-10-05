// app/api/seller/register/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Seller from '@/lib/db/models/Seller'
import User from '@/lib/db/models/User'
import { verifyToken } from '@/lib/utils/auth'

export async function POST(request) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already has a seller account
    const existingSeller = await Seller.findOne({ userId: decoded.userId })
    if (existingSeller) {
      return NextResponse.json(
        { success: false, message: 'You already have a seller account' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validate GSTIN format
    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(body.gstin)) {
      return NextResponse.json(
        { success: false, message: 'Invalid GSTIN format' },
        { status: 400 }
      )
    }

    // Validate PAN format
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(body.pan)) {
      return NextResponse.json(
        { success: false, message: 'Invalid PAN format' },
        { status: 400 }
      )
    }

    // Check if GSTIN or PAN already exists
    const existingGSTIN = await Seller.findOne({ gstin: body.gstin })
    if (existingGSTIN) {
      return NextResponse.json(
        { success: false, message: 'GSTIN already registered' },
        { status: 400 }
      )
    }

    // Create seller account with all fields
    const seller = await Seller.create({
      userId: decoded.userId,
      
      // Business Information
      businessName: body.businessName,
      gstin: body.gstin,
      pan: body.pan,
      businessType: body.businessType,
      businessCategory: body.businessCategory,
      establishedYear: body.establishedYear,
      
      // Bank Details
      bankDetails: {
        accountNumber: body.bankDetails.accountNumber,
        ifscCode: body.bankDetails.ifscCode,
        accountHolderName: body.bankDetails.accountHolderName,
        bankName: body.bankDetails.bankName,
        accountType: body.bankDetails.accountType || 'current',
        branch: body.bankDetails.branch,
        upiId: body.bankDetails.upiId,
      },
      
      // Pickup Address
      pickupAddress: {
        addressLine1: body.pickupAddress.addressLine1,
        addressLine2: body.pickupAddress.addressLine2,
        landmark: body.pickupAddress.landmark,
        city: body.pickupAddress.city,
        state: body.pickupAddress.state,
        pincode: body.pickupAddress.pincode,
        country: body.pickupAddress.country || 'India',
        isDefault: true,
      },
      
      // Store Information
      storeInfo: {
        storeName: body.storeInfo.storeName,
        storeDescription: body.storeInfo.storeDescription,
        storeLogo: body.storeInfo.storeLogo,
        storeBanner: body.storeInfo.storeBanner,
        website: body.storeInfo.website,
        storeCategories: body.storeInfo.storeCategories || [],
        customerSupportEmail: body.storeInfo.customerSupportEmail,
        customerSupportPhone: body.storeInfo.customerSupportPhone,
        socialMedia: body.storeInfo.socialMedia || {},
      },
      
      // Documents
      documents: {
        panCard: { url: body.documents?.panCard, uploadedAt: new Date() },
        gstCertificate: { url: body.documents?.gstCertificate, uploadedAt: new Date() },
        idProof: { 
          url: body.documents?.idProof, 
          type: body.documents?.idProofType,
          uploadedAt: new Date() 
        },
        addressProof: { url: body.documents?.addressProof, uploadedAt: new Date() },
        bankStatement: { url: body.documents?.bankStatement, uploadedAt: new Date() },
        cancelledCheque: { url: body.documents?.cancelledCheque, uploadedAt: new Date() },
        tradeLicense: { url: body.documents?.tradeLicense, uploadedAt: new Date() },
        agreementSigned: body.documents?.agreementSigned || false,
      },
      
      verificationStatus: 'pending',
      isActive: false,
      isVerified: false,
    })

    // Update user role to include seller
    await User.findByIdAndUpdate(decoded.userId, {
      role: 'seller',
    })

    return NextResponse.json({
      success: true,
      message: 'Seller registration submitted successfully. Your account will be reviewed within 24-48 hours.',
      seller,
    })
  } catch (error) {
    console.error('Seller registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const seller = await Seller.findOne({ userId: decoded.userId })

    return NextResponse.json({
      success: true,
      seller,
      hasSeller: !!seller,
    })
  } catch (error) {
    console.error('Get seller error:', error)
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}
