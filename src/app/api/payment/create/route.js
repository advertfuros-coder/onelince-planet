// app/api/payment/create/route.js
import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { verifyToken } from '@/lib/utils/auth'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { amount, currency = 'INR', receipt } = await request.json()

    const options = {
      amount: amount * 100, // amount in smallest currency unit
      currency,
      receipt,
      payment_capture: 1
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json({
      success: true,
      order
    })

  } catch (error) {
    console.error('Create payment error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    )
  }
}
