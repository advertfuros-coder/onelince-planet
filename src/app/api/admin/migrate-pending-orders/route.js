import { NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Order from '@/lib/db/models/Order'

export async function POST(request) {
  try {
    await connectDB()

    const result = await Order.updateMany(
      { status: 'pending' },
      { 
        $set: { 
          status: 'confirmed',
          'items.$[].status': 'confirmed'
        }
      }
    )

    // Update timeline entries
    const orders = await Order.find({ status: 'confirmed' })
    let timelineUpdated = 0

    for (const order of orders) {
      if (order.timeline && order.timeline.length > 0) {
        if (order.timeline[0].status === 'pending') {
          order.timeline[0].status = 'confirmed'
          order.timeline[0].description = 'Order placed successfully'
          await order.save()
          timelineUpdated++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      ordersUpdated: result.modifiedCount,
      timelinesUpdated: timelineUpdated
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}
