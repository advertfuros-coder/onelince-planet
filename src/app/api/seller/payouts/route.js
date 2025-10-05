// app/api/seller/payouts/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Payout from '@/lib/db/models/Payout'
import Order from '@/lib/db/models/Order'
import Seller from '@/lib/db/models/Seller'
import { verifyToken } from '@/lib/utils/auth'

export async function GET(request) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Get seller
    const seller = await Seller.findOne({ userId: decoded.userId })
    if (!seller) {
      return NextResponse.json({ success: false, message: 'Seller not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Get payouts
    let query = { sellerId: seller._id }
    if (status) {
      query.status = status
    }

    const payouts = await Payout.find(query)
      .sort({ createdAt: -1 })
      .populate('orders')
      .lean()

    // Calculate available balance (delivered orders not yet paid out)
    const deliveredOrders = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.seller': seller._id, 'items.status': 'delivered' } },
      {
        $group: {
          _id: '$_id',
          total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
    ])

    const totalDeliveredRevenue = deliveredOrders.reduce((sum, order) => sum + order.total, 0)

    // Get total paid out
    const paidOutAmount = await Payout.aggregate([
      { $match: { sellerId: seller._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]).then((res) => res[0]?.total || 0)

    // Get pending payouts
    const pendingPayouts = await Payout.aggregate([
      { $match: { sellerId: seller._id, status: { $in: ['pending', 'processing'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]).then((res) => res[0]?.total || 0)

    const availableBalance = totalDeliveredRevenue - paidOutAmount - pendingPayouts

    // Get stats
    const stats = {
      totalEarnings: totalDeliveredRevenue,
      availableBalance: Math.max(0, availableBalance),
      pendingPayouts,
      totalPaidOut: paidOutAmount,
    }

    return NextResponse.json({
      success: true,
      payouts,
      stats,
      bankDetails: seller.bankDetails,
    })
  } catch (error) {
    console.error('Payouts GET error:', error)
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const seller = await Seller.findOne({ userId: decoded.userId })
    if (!seller) {
      return NextResponse.json({ success: false, message: 'Seller not found' }, { status: 404 })
    }

    // Check if bank details are complete
    if (!seller.bankDetails?.accountNumber || !seller.bankDetails?.ifscCode) {
      return NextResponse.json(
        { success: false, message: 'Please add your bank details before requesting a payout' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { amount, orderIds } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, message: 'Invalid amount' }, { status: 400 })
    }

    // Calculate available balance
    const deliveredOrders = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.seller': seller._id, 'items.status': 'delivered' } },
      {
        $group: {
          _id: '$_id',
          total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
    ])

    const totalDeliveredRevenue = deliveredOrders.reduce((sum, order) => sum + order.total, 0)

    const paidOutAmount = await Payout.aggregate([
      { $match: { sellerId: seller._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]).then((res) => res[0]?.total || 0)

    const pendingPayouts = await Payout.aggregate([
      { $match: { sellerId: seller._id, status: { $in: ['pending', 'processing'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]).then((res) => res[0]?.total || 0)

    const availableBalance = totalDeliveredRevenue - paidOutAmount - pendingPayouts

    if (amount > availableBalance) {
      return NextResponse.json(
        { success: false, message: `Insufficient balance. Available: ₹${availableBalance.toFixed(2)}` },
        { status: 400 }
      )
    }

    // Create payout request
    const payout = await Payout.create({
      sellerId: seller._id,
      amount,
      orders: orderIds || [],
      bankDetails: {
        accountHolderName: seller.bankDetails.accountHolderName,
        accountNumber: seller.bankDetails.accountNumber,
        ifscCode: seller.bankDetails.ifscCode,
        bankName: seller.bankDetails.bankName,
      },
      status: 'pending',
    })

    return NextResponse.json({
      success: true,
      message: 'Payout request submitted successfully',
      payout,
    })
  } catch (error) {
    console.error('Payout POST error:', error)
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}
