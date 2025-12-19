import { NextResponse } from 'next/server'
import crypto from 'crypto'
import axios from 'axios'

export async function POST(request) {
  try {
    const body = await request.json()
    const { merchantTransactionId } = body

    if (!merchantTransactionId) {
      return NextResponse.json(
        { success: false, message: 'merchantTransactionId is required' },
        { status: 400 }
      )
    }

    const saltKey = process.env.PHONEPE_SALT_KEY
    const saltIndex = process.env.PHONEPE_SALT_INDEX
    const merchantId = process.env.PHONEPE_MERCHANT_ID
    const hostUrl = process.env.PHONEPE_HOST_URL

    // Generate checksum
    const checksumString = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + saltKey
    const checksum = crypto.createHash('sha256').update(checksumString).digest('hex')
    const xVerify = `${checksum}###${saltIndex}`

    // Check payment status
    const response = await axios.get(
      `${hostUrl}/v1/status/${merchantId}/${merchantTransactionId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': merchantId
        }
      }
    )

    const data = response.data?.data

    return NextResponse.json({
      success: true,
      status: data.state,
      transactionId: data.transactionId,
      amount: data.amount / 100, // Convert paise to rupees
      paymentInstrument: data.paymentInstrument
    })

  } catch (error) {
    console.error('PhonePe verify error:', error.response?.data || error.message)
    return NextResponse.json(
      { success: false, message: 'Payment verification failed' },
      { status: 500 }
    )
  }
}
