import { NextResponse } from 'next/server'
import crypto from 'crypto'
import axios from 'axios'

export async function POST(request) {
  try {
    const body = await request.json()
    const { amount, orderId, customerPhone, customerName } = body

    // Validate required fields
    if (!amount || !orderId) {
      return NextResponse.json(
        { success: false, message: 'Amount and orderId are required' },
        { status: 400 }
      )
    }

    const merchantId = process.env.PHONEPE_MERCHANT_ID
    const saltKey = process.env.PHONEPE_SALT_KEY
    const saltIndex = process.env.PHONEPE_SALT_INDEX
    const hostUrl = process.env.PHONEPE_HOST_URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    // Generate unique merchant transaction ID
    const merchantTransactionId = `MT${Date.now()}${orderId}`

    // Prepare payload
    const payload = {
      merchantId: merchantId,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: customerPhone || `USER${Date.now()}`,
      amount: Math.round(amount * 100), // Amount in paise
      redirectUrl: `${appUrl}/api/payment/phonepe/callback?orderId=${orderId}`,
      redirectMode: 'REDIRECT',
      callbackUrl: `${appUrl}/api/payment/phonepe/callback?orderId=${orderId}`,
      mobileNumber: customerPhone,
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    }

    // Convert payload to base64
    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64')

    // Generate checksum
    const checksumString = payloadBase64 + '/pg/v1/pay' + saltKey
    const checksum = crypto.createHash('sha256').update(checksumString).digest('hex')
    const xVerify = `${checksum}###${saltIndex}`

    // Make request to PhonePe
    const response = await axios.post(
      `${hostUrl}/v1/pay`,
      {
        request: payloadBase64
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify
        }
      }
    )

    if (response.data.success) {
      return NextResponse.json({
        success: true,
        paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
        merchantTransactionId: merchantTransactionId
      })
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to initiate payment' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('PhonePe create order error:', error.response?.data || error.message)
    return NextResponse.json(
      { 
        success: false, 
        message: error.response?.data?.message || 'Payment initiation failed' 
      },
      { status: 500 }
    )
  }
}
