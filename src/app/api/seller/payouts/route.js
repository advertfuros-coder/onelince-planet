import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Seller from "@/lib/db/models/Seller";
import Order from "@/lib/db/models/Order";
import Payout from "@/lib/db/models/Payout";
import { verifyToken } from "@/lib/utils/auth";

export async function GET(request) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const seller = await Seller.findOne({ userId: decoded.userId });
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller profile not found" },
        { status: 404 }
      );
    }

    // 1. Get all payouts for this seller
    const payouts = await Payout.find({ sellerId: seller._id }).sort({
      createdAt: -1,
    });

    // 2. Calculate Pending Payouts from Orders
    // An order is eligible for payout if it is 'delivered' and payment is 'paid' (or 'cod' and 'delivered')
    // and it hasn't been included in a Payout yet.

    // We need to find orders that contain this seller's products
    const paidPayouts = await Payout.find({
      sellerId: seller._id,
      status: "completed",
    });
    const paidOrderIds = paidPayouts.reduce(
      (acc, p) => [...acc, ...p.orders],
      []
    );

    const allSellerOrders = await Order.find({
      "items.seller": decoded.userId,
      status: "delivered",
      _id: { $nin: paidOrderIds },
    });

    let pendingAmount = 0;
    let grossSales = 0;
    let totalCommission = 0;
    let totalShipping = 0;

    const commissionRate = seller.commissionRate || 5;

    const pendingOrders = allSellerOrders.map((order) => {
      const sellerItems = order.items.filter(
        (item) => item.seller.toString() === decoded.userId.toString()
      );

      const orderSubtotal = sellerItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const commission = (orderSubtotal * commissionRate) / 100;
      // For now, assume shipping is split or a flat fee per order if applicable.
      // In a real system, this would be more complex.
      const shipping = 0;
      const netAmount = orderSubtotal - commission - shipping;

      pendingAmount += netAmount;
      grossSales += orderSubtotal;
      totalCommission += commission;
      totalShipping += shipping;

      return {
        id: order._id,
        orderNumber: order.orderNumber,
        date: order.createdAt,
        amount: orderSubtotal,
        commission,
        net: netAmount,
        status: order.status,
      };
    });

    // 3. Lifetime stats
    const lifetimeCompletedPayouts = payouts.filter(
      (p) => p.status === "completed"
    );
    const totalWithdrawn = lifetimeCompletedPayouts.reduce(
      (sum, p) => sum + p.amount,
      0
    );

    return NextResponse.json({
      success: true,
      stats: {
        pendingPayout: Math.round(pendingAmount),
        nextPayoutDate: getNextThursday(),
        lifetimeEarnings: Math.round(totalWithdrawn + pendingAmount),
        totalWithdrawn: Math.round(totalWithdrawn),
      },
      waterfall: {
        grossSales: Math.round(grossSales),
        commission: Math.round(totalCommission),
        shipping: Math.round(totalShipping),
        netPayout: Math.round(pendingAmount),
      },
      history: payouts,
      pendingOrders: pendingOrders.slice(0, 10), // Last 10 pending
    });
  } catch (error) {
    console.error("❌ Payouts API error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

function getNextThursday() {
  const d = new Date();
  d.setDate(d.getDate() + ((4 + 7 - d.getDay()) % 7));
  if (d.getDay() === 4 && new Date().getDay() === 4) {
    // If today is Thursday, but it's already late or we want next week
    // d.setDate(d.getDate() + 7);
  }
  return d.toISOString().split("T")[0];
}
