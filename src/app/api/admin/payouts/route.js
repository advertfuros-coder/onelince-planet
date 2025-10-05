// app/api/admin/payouts/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Payout from '@/lib/db/models/Payout'
import Order from '@/lib/db/models/Order'
import Seller from '@/lib/db/models/Seller'
import { verifyToken, isAdmin } from '@/lib/utils/adminAuth'

export async function GET(request) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const sellerId = searchParams.get('seller') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = searchParams.get('order') || 'desc'

    const skip = (page - 1) * limit

    // Build query
    let query = {}
    if (status) query.status = status
    if (sellerId) query.sellerId = sellerId

    // Build sort
    const sort = {}
    sort[sortBy] = order === 'asc' ? 1 : -1

    const [payouts, total, sellers] = await Promise.all([
      Payout.find(query)
        .populate('sellerId', 'businessName email bankDetails')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Payout.countDocuments(query),
      Seller.find({}, 'businessName email').lean(),
    ])

    // Calculate stats
    const stats = {
      totalPayouts: await Payout.countDocuments(),
      pendingPayouts: await Payout.countDocuments({ status: 'pending' }),
      processingPayouts: await Payout.countDocuments({ status: 'processing' }),
      completedPayouts: await Payout.countDocuments({ status: 'completed' }),
      failedPayouts: await Payout.countDocuments({ status: 'failed' }),
      totalAmount: await Payout.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]).then((res) => res[0]?.total || 0),
      pendingAmount: await Payout.aggregate([
        { $match: { status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]).then((res) => res[0]?.total || 0),
    }

    return NextResponse.json({
      success: true,
      payouts,
      sellers,
      stats,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}

// Create payouts for sellers
export async function POST(request) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { sellerIds } = await request.json()

    const createdPayouts = []

    for (const sellerId of sellerIds) {
      // Get delivered orders for this seller that haven't been paid out
      const orders = await Order.find({
        'items.seller': sellerId,
        status: 'delivered',
        'payment.status': 'paid',
      }).lean()

      if (orders.length === 0) continue

      let totalAmount = 0
      const orderIds = []

      orders.forEach((order) => {
        order.items.forEach((item) => {
          if (item.seller.toString() === sellerId) {
            const itemTotal = item.price * item.quantity
            const commission = itemTotal * 0.05 // 5% commission
            totalAmount += itemTotal - commission
            orderIds.push(order._id)
          }
        })
      })

      if (totalAmount > 0) {
        const seller = await Seller.findById(sellerId).populate('userId', 'name email')

        const payout = await Payout.create({
          sellerId,
          amount: totalAmount,
          orders: orderIds,
          status: 'pending',
          bankDetails: {
            accountHolderName: seller.bankDetails?.accountHolderName,
            accountNumber: seller.bankDetails?.accountNumber,
            ifscCode: seller.bankDetails?.ifscCode,
            bankName: seller.bankDetails?.bankName,
          },
        })

        createdPayouts.push(payout)
      }
    }

    return NextResponse.json({
      success: true,
      message: `${createdPayouts.length} payout(s) created successfully`,
      payouts: createdPayouts,
    })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}

// Bulk update payouts
export async function PATCH(request) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { payoutIds, status, transactionId } = await request.json()

    const updateData = { status }
    if (status === 'completed') {
      updateData.completedAt = new Date()
      if (transactionId) updateData.transactionId = transactionId
    }
    if (status === 'processing') {
      updateData.processedAt = new Date()
    }

    await Payout.updateMany({ _id: { $in: payoutIds } }, updateData)

    return NextResponse.json({ success: true, message: 'Payouts updated successfully' })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}
