// app/api/seller/orders/export/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Order from '@/lib/db/models/Order'
import { verifyToken } from '@/lib/utils/auth'

export async function GET(request) {
  try {
    await connectDB()
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    
    if (!decoded || decoded.role !== 'seller') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const orders = await Order.find({ 'items.seller': decoded.id })
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 })
      .lean()

    // Generate CSV
    const csvRows = [
      ['Order ID', 'Order Number', 'Customer', 'Status', 'Total', 'Date'].join(',')
    ]

    orders.forEach(order => {
      const sellerItems = order.items.filter(item => 
        item.seller && item.seller.toString() === decoded.id
      )
      
      if (sellerItems.length === 0) return

      const total = sellerItems.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      )

      csvRows.push([
        order._id,
        order.orderNumber || 'N/A',
        order.customer?.name || 'N/A',
        order.status,
        total,
        new Date(order.createdAt).toLocaleDateString()
      ].join(','))
    })

    const csv = csvRows.join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="orders-${Date.now()}.csv"`
      }
    })

  } catch (error) {
    console.error('Export orders error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
