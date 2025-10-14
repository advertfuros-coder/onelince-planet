import { Order } from "@/lib/db/models";
import connectDB from "@/lib/db/mongodb";

export async function PATCH(request) {
  try {
    await connectDB()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { orderIds, action, status } = await request.json()

    if (action === 'updateStatus' && status) {
      await Order.updateMany(
        { _id: { $in: orderIds } },
        {
          $set: { status },
          $push: {
            timeline: {
              status,
              description: `Order status updated to ${status} by admin`,
              timestamp: new Date(),
            },
          },
        }
      )
      return NextResponse.json({ success: true, message: 'Orders updated successfully' })
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error', error: error.message }, { status: 500 })
  }
}
