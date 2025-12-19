// app/api/seller/customers/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Seller from "@/lib/db/models/Seller";
import Order from "@/lib/db/models/Order";
import User from "@/lib/db/models/User";
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

    // Get seller profile
    const seller = await Seller.findOne({ userId: decoded.userId });
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller profile not found" },
        { status: 404 }
      );
    }

    // Get all orders with seller's products
    const allOrders = await Order.find({
      "items.seller": seller._id,
    })
      .populate("customer", "name email phone createdAt")
      .lean();

    // Group orders by customer
    const customerMap = new Map();

    allOrders.forEach((order) => {
      const customerId = order.customer?._id?.toString();
      if (!customerId) return;

      const sellerItems = order.items.filter(
        (item) => item.seller.toString() === seller._id.toString()
      );

      if (sellerItems.length === 0) return;

      const orderTotal = sellerItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          id: customerId,
          name: order.customer.name || "Unknown",
          email: order.customer.email || "",
          phone: order.customer.phone || "",
          location:
            order.shippingAddress?.city && order.shippingAddress?.state
              ? `${order.shippingAddress.city}, ${order.shippingAddress.state}`
              : "N/A",
          totalOrders: 0,
          totalSpent: 0,
          orders: [],
          customerSince: order.customer.createdAt || order.createdAt,
          status: "active",
        });
      }

      const customer = customerMap.get(customerId);
      customer.totalOrders += 1;
      customer.totalSpent += orderTotal;
      customer.orders.push({
        orderId: order._id,
        orderNumber: order.orderNumber,
        date: order.createdAt,
        total: orderTotal,
      });

      // Update location if we have better data
      if (
        order.shippingAddress?.city &&
        !customer.location.includes(order.shippingAddress.city)
      ) {
        customer.location = `${order.shippingAddress.city}, ${
          order.shippingAddress.state || ""
        }`;
      }
    });

    // Convert to array and calculate additional metrics
    const customers = Array.from(customerMap.values()).map((customer) => {
      // Sort orders by date to get last order
      customer.orders.sort((a, b) => new Date(b.date) - new Date(a.date));

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        location: customer.location,
        totalOrders: customer.totalOrders,
        totalSpent: Math.round(customer.totalSpent),
        averageOrderValue: Math.round(
          customer.totalSpent / customer.totalOrders
        ),
        lastOrder: customer.orders[0]?.date,
        customerSince: customer.customerSince,
        status: customer.status,
      };
    });

    // Sort by total spent (descending)
    customers.sort((a, b) => b.totalSpent - a.totalSpent);

    return NextResponse.json({
      success: true,
      customers,
      stats: {
        total: customers.length,
        totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
        averageOrderValue:
          customers.length > 0
            ? Math.round(
                customers.reduce((sum, c) => sum + c.totalSpent, 0) /
                  customers.reduce((sum, c) => sum + c.totalOrders, 0)
              )
            : 0,
      },
    });
  } catch (error) {
    console.error("Customers API error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
