// app/api/payment/verify/route.js
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import connectDB from '@/lib/db/mongodb'
import Order from '@/lib/db/models/Order'
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

    const { orderId, paymentId, signature, orderNumber } = await request.json()

    // Verify signature
    const body = orderId + '|' + paymentId
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex')

    if (expectedSignature === signature) {
      // Update order payment status
      await Order.findOneAndUpdate(
        { orderNumber },
        {
          paymentStatus: 'paid',
          'paymentDetails.paymentId': paymentId,
          'paymentDetails.orderId': orderId,
          'paymentDetails.signature': signature
        }
      )

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully'
      })
    } else {
      return NextResponse.json(
        { success: false, message: 'Payment verification failed' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Verify payment error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    )
  }
}
