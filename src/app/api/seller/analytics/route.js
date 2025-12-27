// app/api/seller/analytics/route.js - With AI Predictions
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Order from "@/lib/db/models/Order";
import Product from "@/lib/db/models/Product";
import Seller from "@/lib/db/models/Seller";
import { verifyToken } from "@/lib/utils/auth";
import aiService from "@/lib/services/aiService";
import mongoose from "mongoose";

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

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30days";
    const generatePredictions = searchParams.get("predict") === "true";

    // Get seller
    const seller = await Seller.findOne({ userId: decoded.userId });
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller not found" },
        { status: 404 }
      );
    }

    // Calculate date range
    const daysMap = { "7days": 7, "30days": 30, "90days": 90, "1year": 365 };
    const daysAgo = daysMap[range] || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Fetch analytics data
    const [
      products,
      orders,
      totalRevenue,
      totalOrders,
      revenueByDate,
      topProducts,
      categoryPerformance,
    ] = await Promise.all([
      // All seller products
      Product.find({ sellerId: decoded.userId }).lean(),

      // All seller orders
      Order.find({
        "items.seller": decoded.userId,
        createdAt: { $gte: startDate },
      }).lean(),

      // Total revenue
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $unwind: "$items" },
        {
          $match: {
            "items.seller": new mongoose.Types.ObjectId(decoded.userId),
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          },
        },
      ]).then((res) => res[0]?.total || 0),

      // Total orders count
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $unwind: "$items" },
        {
          $match: {
            "items.seller": new mongoose.Types.ObjectId(decoded.userId),
          },
        },
        { $group: { _id: "$_id" } },
        { $count: "total" },
      ]).then((res) => res[0]?.total || 0),

      // Revenue by date
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $unwind: "$items" },
        {
          $match: {
            "items.seller": new mongoose.Types.ObjectId(decoded.userId),
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: {
              $sum: { $multiply: ["$items.price", "$items.quantity"] },
            },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Top performing products
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $unwind: "$items" },
        {
          $match: {
            "items.seller": new mongoose.Types.ObjectId(decoded.userId),
          },
        },
        {
          $group: {
            _id: "$items.product",
            totalSold: { $sum: "$items.quantity" },
            revenue: {
              $sum: { $multiply: ["$items.price", "$items.quantity"] },
            },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      ]),

      // Category performance
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $unwind: "$items" },
        {
          $match: {
            "items.seller": new mongoose.Types.ObjectId(decoded.userId),
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "items.product",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: "$product.category",
            revenue: {
              $sum: { $multiply: ["$items.price", "$items.quantity"] },
            },
            orders: { $sum: 1 },
          },
        },
        { $sort: { revenue: -1 } },
      ]),
    ]);

    // Calculate metrics
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.isActive).length;

    // Get unique customers
    const customerIds = new Set();
    orders.forEach((order) => {
      if (order.customer) customerIds.add(order.customer.toString());
    });

    // Previous period for growth calculation
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - daysAgo);

    const [prevRevenue, prevOrders] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: previousStartDate, $lt: startDate } } },
        { $unwind: "$items" },
        {
          $match: {
            "items.seller": new mongoose.Types.ObjectId(decoded.userId),
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          },
        },
      ]).then((res) => res[0]?.total || 0),

      Order.aggregate([
        { $match: { createdAt: { $gte: previousStartDate, $lt: startDate } } },
        { $unwind: "$items" },
        {
          $match: {
            "items.seller": new mongoose.Types.ObjectId(decoded.userId),
          },
        },
        { $group: { _id: "$_id" } },
        { $count: "total" },
      ]).then((res) => res[0]?.total || 0),
    ]);

    const revenueGrowth =
      prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const ordersGrowth =
      prevOrders > 0 ? ((totalOrders - prevOrders) / prevOrders) * 100 : 0;

    const analyticsData = {
      overview: {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        conversionRate: 0, // Would need view tracking
        totalProducts,
        activeProducts,
        totalCustomers: customerIds.size,
      },
      growth: {
        revenue: revenueGrowth,
        orders: ordersGrowth,
        avgOrderValue: 0, // Calculate if needed
        conversionRate: 0,
      },
      salesTrend: revenueByDate,
      topProducts: topProducts.map((p) => ({
        name: p.product?.name || "Unknown",
        revenue: p.revenue,
        quantity: p.totalSold,
      })),
      topCategories: categoryPerformance.slice(0, 5).map((cat, idx) => ({
        name: cat._id || "Uncategorized",
        revenue: cat.revenue,
        percentage: ((cat.revenue / totalRevenue) * 100).toFixed(1),
      })),
      customerInsights: {
        totalCustomers: customerIds.size,
        newCustomers: Math.floor(customerIds.size * 0.6), // Simplified
        returningCustomers: Math.floor(customerIds.size * 0.4), // Simplified
        customerRetentionRate: 40, // Simplified
      },
    };

    // Generate AI predictions if requested
    let predictions = null;
    if (generatePredictions) {
      predictions = await generateSellerPredictions(
        analyticsData,
        seller,
        products
      );
    }

    return NextResponse.json({
      success: true,
      data: analyticsData,
      predictions,
    });
  } catch (error) {
    console.error("Seller Analytics Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}

async function generateSellerPredictions(analyticsData, seller, products) {
  try {
    const prompt = `You are a business consultant for an e-commerce seller. Analyze their performance and provide actionable insights.

Seller: ${seller.businessName || "Online Seller"}

Performance Metrics:
- Total Revenue: ₹${analyticsData.overview.totalRevenue.toFixed(2)}
- Revenue Growth: ${analyticsData.growth.revenue.toFixed(1)}%
- Total Orders: ${analyticsData.overview.totalOrders}
- Orders Growth: ${analyticsData.growth.orders.toFixed(1)}%
- Average Order Value: ₹${analyticsData.overview.avgOrderValue.toFixed(2)}
- Total Products: ${analyticsData.overview.totalProducts}
- Active Products: ${analyticsData.overview.activeProducts}
- Total Customers: ${analyticsData.overview.totalCustomers}

Top Categories:
${analyticsData.topCategories
  .map((c) => `- ${c.name}: ₹${c.revenue.toFixed(0)} (${c.percentage}%)`)
  .join("\n")}

Top Products:
${analyticsData.topProducts
  .slice(0, 5)
  .map((p) => `- ${p.name}: ${p.quantity} sold, ₹${p.revenue.toFixed(0)}`)
  .join("\n")}

Provide strategic insights in JSON format with these exact keys:
{
  "revenueForecast": "30-day revenue prediction with specific number and reasoning",
  "growthOpportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],
  "productStrategy": ["strategy 1", "strategy 2", "strategy 3"],
  "pricingStrategy": ["pricing tip 1", "pricing tip 2"],
  "marketingAdvice": ["marketing action 1", "marketing action 2", "marketing action 3"],
  "risks": ["potential risk 1", "potential risk 2"]
}`;

    const response = await aiService.generateStructuredData(prompt, {
      revenueForecast: "string",
      growthOpportunities: ["string"],
      productStrategy: ["string"],
      pricingStrategy: ["string"],
      marketingAdvice: ["string"],
      risks: ["string"],
    });

    return response;
  } catch (error) {
    console.error("AI Prediction Error:", error);
    // Return fallback predictions
    return createFallbackPredictions(analyticsData);
  }
}

function createFallbackPredictions(data) {
  const projectedRevenue =
    data.overview.totalRevenue * (1 + data.growth.revenue / 100);

  return {
    revenueForecast: `Based on ${
      data.growth.revenue > 0 ? "positive" : "current"
    } trend, projected 30-day revenue: ₹${projectedRevenue.toLocaleString(
      "en-IN"
    )} (${data.growth.revenue.toFixed(1)}% growth)`,

    growthOpportunities: [
      `Focus on top ${Math.min(
        5,
        data.overview.activeProducts
      )} performing products - they drive majority of sales`,
      `Expand product catalog in high-performing categories: ${data.topCategories[0]?.name}`,
      `Target customer retention - ${data.customerInsights.returningCustomers} repeat customers show loyalty potential`,
    ],

    productStrategy: [
      `Optimize listings for ${
        data.overview.totalProducts - data.overview.activeProducts
      } inactive products`,
      `Create product bundles with best sellers: ${data.topProducts[0]?.name}`,
      `Analyze and replicate success patterns of top products`,
    ],

    pricingStrategy: [
      `Review pricing for products with declining sales`,
      `Consider competitive pricing analysis for top category: ${data.topCategories[0]?.name}`,
    ],

    marketingAdvice: [
      `Increase ad spend for ${data.topCategories[0]?.name} category (${data.topCategories[0]?.percentage}% of revenue)`,
      `Launch email campaign targeting ${data.customerInsights.newCustomers} new customers`,
      `Implement referral program for ${data.customerInsights.returningCustomers} loyal customers`,
    ],

    risks: [
      data.growth.revenue < 0
        ? "⚠️ Negative revenue growth - immediate action needed"
        : null,
      data.growth.orders < 0
        ? "⚠️ Declining orders - review product competitiveness"
        : null,
      data.overview.activeProducts < data.overview.totalProducts * 0.5
        ? "⚠️ Many inactive products - optimize catalog"
        : null,
    ].filter(Boolean),
  };
}
