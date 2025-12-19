import { NextResponse } from 'next/server'
import crypto from 'crypto'
import axios from 'axios'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const merchantTransactionId = searchParams.get('transactionId')

    if (!merchantTransactionId) {
      return NextResponse.redirect(
        new URL(`/orders/${orderId}?payment=failed`, request.url)
      )
    }

    // Verify payment status
    const saltKey = process.env.PHONEPE_SALT_KEY
    const saltIndex = process.env.PHONEPE_SALT_INDEX
    const merchantId = process.env.PHONEPE_MERCHANT_ID
    const hostUrl = process.env.PHONEPE_HOST_URL

    // Generate checksum for status check
    const checksumString = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + saltKey
    const checksum = crypto.createHash('sha256').update(checksumString).digest('hex')
    const xVerify = `${checksum}###${saltIndex}`

    // Check payment status
    const statusResponse = await axios.get(
      `${hostUrl}/v1/status/${merchantId}/${merchantTransactionId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': merchantId
        }
      }
    )

    const paymentStatus = statusResponse.data?.data?.state

    if (paymentStatus === 'COMPLETED') {
      // Payment successful - redirect to order page
      return NextResponse.redirect(
        new URL(`/orders/${orderId}?payment=success&txnId=${merchantTransactionId}`, request.url)
      )
    } else if (paymentStatus === 'FAILED') {
      return NextResponse.redirect(
        new URL(`/orders/${orderId}?payment=failed`, request.url)
      )
    } else {
      return NextResponse.redirect(
        new URL(`/orders/${orderId}?payment=pending`, request.url)
      )
    }

  } catch (error) {
    console.error('PhonePe callback error:', error.response?.data || error.message)
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    return NextResponse.redirect(
      new URL(`/orders/${orderId}?payment=error`, request.url)
    )
  }
}

export async function POST(request) {
  // Handle POST callback from PhonePe
  try {
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    
    // Extract transaction ID from callback
    const merchantTransactionId = body?.transactionId || body?.data?.merchantTransactionId

    if (!merchantTransactionId) {
      return NextResponse.json(
        { success: false, message: 'Transaction ID missing' },
        { status: 400 }
      )
    }

    // Verify payment status using the same logic as GET
    const saltKey = process.env.PHONEPE_SALT_KEY
    const saltIndex = process.env.PHONEPE_SALT_INDEX
    const merchantId = process.env.PHONEPE_MERCHANT_ID
    const hostUrl = process.env.PHONEPE_HOST_URL

    const checksumString = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + saltKey
    const checksum = crypto.createHash('sha256').update(checksumString).digest('hex')
    const xVerify = `${checksum}###${saltIndex}`

    const statusResponse = await axios.get(
      `${hostUrl}/v1/status/${merchantId}/${merchantTransactionId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': merchantId
        }
      }
    )

    const paymentStatus = statusResponse.data?.data?.state

    return NextResponse.json({
      success: true,
      status: paymentStatus,
      orderId: orderId
    })

  } catch (error) {
    console.error('PhonePe POST callback error:', error.response?.data || error.message)
    return NextResponse.json(
      { success: false, message: 'Callback processing failed' },
      { status: 500 }
    )
  }
}
