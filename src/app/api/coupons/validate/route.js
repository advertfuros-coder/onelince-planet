// app/api/coupons/validate/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Coupon from '@/lib/db/models/Coupon'
import Order from '@/lib/db/models/Order'
import Product from '@/lib/db/models/Product'
import { verifyToken } from '@/lib/utils/auth'

export async function POST(request) {
  try {
    await connectDB()

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { code, subtotal, items } = await request.json()

    // Find coupon
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(), 
      isActive: true 
    })

    if (!coupon) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid coupon code' 
      }, { status: 400 })
    }

    // Check validity period
    const now = new Date()
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return NextResponse.json({ 
        success: false, 
        message: 'Coupon has expired or not yet valid' 
      }, { status: 400 })
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ 
        success: false, 
        message: 'Coupon usage limit reached' 
      }, { status: 400 })
    }

    // Check user usage limit
    const userOrdersWithCoupon = await Order.countDocuments({
      customer: decoded.id,
      'payment.couponCode': code.toUpperCase()
    })

    if (userOrdersWithCoupon >= coupon.userUsageLimit) {
      return NextResponse.json({ 
        success: false, 
        message: 'You have already used this coupon' 
      }, { status: 400 })
    }

    // Check minimum order value
    if (subtotal < coupon.minOrderValue) {
      return NextResponse.json({ 
        success: false, 
        message: `Minimum order value of ₹${coupon.minOrderValue} required` 
      }, { status: 400 })
    }

    // Check first order only
    if (coupon.firstOrderOnly) {
      const previousOrders = await Order.countDocuments({ customer: decoded.id })
      if (previousOrders > 0) {
        return NextResponse.json({ 
          success: false, 
          message: 'This coupon is only valid for first orders' 
        }, { status: 400 })
      }
    }

    // Calculate discount
    let discount = 0
    if (coupon.discountType === 'percentage') {
      discount = (subtotal * coupon.discountValue) / 100
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount
      }
    } else if (coupon.discountType === 'fixed') {
      discount = coupon.discountValue
    }

    discount = Math.round(discount * 100) / 100

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      },
      discount
    })

  } catch (error) {
    console.error('Coupon validation error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    )
  }
}
