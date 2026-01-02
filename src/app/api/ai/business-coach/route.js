// app/api/ai/business-coach/route.js
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/utils/auth";
import connectDB from "@/lib/db/mongodb";
import Seller from "@/lib/db/models/Seller";
import Product from "@/lib/db/models/Product";
import Order from "@/lib/db/models/Order";
import aiBusinessCoach from "@/lib/services/aiBusinessCoach";

export async function POST(request) {
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

    const body = await request.json();
    const { action } = body;

    // Get seller
    const seller = await Seller.findOne({ userId: decoded.userId });
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller not found" },
        { status: 404 }
      );
    }

    // Get seller data
    const products = await Product.find({ sellerId: seller._id });
    const orders = await Order.find({ "items.seller": seller._id });

    // Calculate metrics
    const totalProducts = products.length;
    const totalOrders = orders.length;

    // Calculate revenue from delivered orders only
    const totalRevenue = orders.reduce((sum, order) => {
      const sellerItems = order.items.filter(
        (item) =>
          item.seller?.toString() === seller._id.toString() &&
          item.status === "delivered"
      );
      return (
        sum +
        sellerItems.reduce(
          (itemSum, item) => itemSum + item.price * item.quantity,
          0
        )
      );
    }, 0);

    // Category performance
    const categoryMap = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.seller?.toString() === seller._id.toString()) {
          const product = products.find(
            (p) => p._id?.toString() === item.product?.toString()
          );
          if (product) {
            if (!categoryMap[product.category]) {
              categoryMap[product.category] = { orders: 0, revenue: 0 };
            }
            categoryMap[product.category].orders += 1;
            categoryMap[product.category].revenue += item.price * item.quantity;
          }
        }
      });
    });

    const categoryPerformance = Object.entries(categoryMap).map(
      ([category, data]) => ({
        category,
        ...data,
      })
    );

    // Calculate monthly trends
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    let thisMonthRevenue = 0;
    let lastMonthRevenue = 0;

    orders.forEach((order) => {
      const sellerItems = order.items.filter(
        (item) =>
          item.seller?.toString() === seller._id.toString() &&
          item.status === "delivered"
      );
      const orderRevenue = sellerItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const d = new Date(order.createdAt);
      if (d >= thisMonth) thisMonthRevenue += orderRevenue;
      else if (d >= lastMonth && d < thisMonth)
        lastMonthRevenue += orderRevenue;
    });

    const monthlyTrends = [
      { label: "lastMonth", revenue: lastMonthRevenue },
      { label: "thisMonth", revenue: thisMonthRevenue },
    ];

    const sellerData = {
      sellerId: seller._id,
      businessName: seller.businessInfo?.businessName,
      totalProducts,
      totalOrders,
      totalRevenue,
      averageRating: seller.ratings?.average || 4.0,
      responseTime: seller.responseTime || 12,
      fulfillmentRate: seller.performance?.orderFulfillmentRate || 95,
      returnRate: seller.performance?.returnRate || 5,
      categoryPerformance,
      monthlyTrends,
      competitorData: {},
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      customers: orders.length,
    };

    let result;

    switch (action) {
      case "analyze_performance":
        result = await aiBusinessCoach.analyzeSellerPerformance(sellerData);
        break;

      case "suggest_products":
        result = await aiBusinessCoach.suggestNewProducts({
          categories: [...new Set(products.map((p) => p.category))],
          topProducts: products.slice(0, 5),
          customerDemographics: {},
        });
        break;

      default:
        return NextResponse.json(
          { success: false, message: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Business Coach Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
