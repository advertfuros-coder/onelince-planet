import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/lib/db/models/Order";
import Product from "@/lib/db/models/Product";
import User from "@/lib/db/models/User";
import Seller from "@/lib/db/models/Seller";

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get("period") || "30");

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    // Previous period for comparison
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - period);

    // Fetch current period stats
    const [
      currentOrders,
      prevOrders,
      totalCustomers,
      activeProducts,
      totalSellers,
      recentOrders,
    ] = await Promise.all([
      // Current period orders
      Order.find({
        createdAt: { $gte: startDate, $lte: endDate },
      }),

      // Previous period orders
      Order.find({
        createdAt: { $gte: prevStartDate, $lt: startDate },
      }),

      // Total customers
      User.countDocuments({ role: "customer" }),

      // Active products
      Product.countDocuments({ isActive: true }),

      // Total sellers
      Seller.countDocuments({ isActive: true }),

      // Recent orders for table
      Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("customer", "name email")
        .lean(),
    ]);

    // Calculate metrics
    const currentRevenue = currentOrders.reduce(
      (sum, order) => sum + (order.pricing?.total || 0),
      0
    );
    const prevRevenue = prevOrders.reduce(
      (sum, order) => sum + (order.pricing?.total || 0),
      0
    );

    const currentOrderCount = currentOrders.length;
    const prevOrderCount = prevOrders.length;

    const avgOrderValue =
      currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0;

    // Calculate growth percentages
    const revenueGrowth =
      prevRevenue > 0
        ? ((currentRevenue - prevRevenue) / prevRevenue) * 100
        : currentRevenue > 0
        ? 100
        : 0;

    const orderGrowth =
      prevOrderCount > 0
        ? ((currentOrderCount - prevOrderCount) / prevOrderCount) * 100
        : currentOrderCount > 0
        ? 100
        : 0;

    // Mock growth for customers (you can calculate actual if needed)
    const customerGrowth = 12.5;

    // Calculate conversion rate (mock for now)
    const conversionRate = 2.4;

    // Average rating (you can calculate from reviews)
    const averageRating = 4.5;

    const dashboard = {
      totalRevenue: currentRevenue,
      revenueGrowth,
      totalOrders: currentOrderCount,
      orderGrowth,
      totalCustomers,
      customerGrowth,
      activeProducts,
      totalSellers,
      avgOrderValue,
      conversionRate,
      averageRating,
      recentOrders: recentOrders.map((order) => ({
        id: order._id,
        orderNumber: order.orderNumber || order._id.toString().slice(-8),
        customer: order.customer?.name || "Unknown",
        amount: order.pricing?.total || 0,
        status: order.status,
        date: order.createdAt,
      })),
    };

    return NextResponse.json({
      success: true,
      dashboard,
      period,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch dashboard data",
      },
      { status: 500 }
    );
  }
}
