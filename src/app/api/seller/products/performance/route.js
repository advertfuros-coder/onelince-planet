// app/api/seller/products/performance/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Product from "@/lib/db/models/Product";
import Order from "@/lib/db/models/Order";
import Review from "@/lib/db/models/Review";
import { verifyToken } from "@/lib/utils/auth";

export async function GET(request) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Seller access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const period = searchParams.get("period") || "30"; // days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    if (productId) {
      // Get specific product performance
      const product = await Product.findOne({
        _id: productId,
        sellerId: decoded.userId,
      });

      if (!product) {
        return NextResponse.json(
          { success: false, message: "Product not found" },
          { status: 404 }
        );
      }

      // Get orders for this product
      const orders = await Order.find({
        "items.product": productId,
        createdAt: { $gte: startDate },
      });

      // Calculate metrics
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => {
        const item = order.items.find(
          (i) => i.product.toString() === productId
        );
        return sum + (item ? item.price * item.quantity : 0);
      }, 0);

      const totalUnits = orders.reduce((sum, order) => {
        const item = order.items.find(
          (i) => i.product.toString() === productId
        );
        return sum + (item ? item.quantity : 0);
      }, 0);

      // Get reviews
      const reviews = await Review.find({ productId })
        .sort({ createdAt: -1 })
        .limit(10);

      // Calculate conversion rate (views to purchases)
      const views = product.analytics?.views || 0;
      const conversionRate = views > 0 ? (totalOrders / views) * 100 : 0;

      return NextResponse.json({
        success: true,
        performance: {
          product: {
            _id: product._id,
            name: product.name,
            images: product.images,
            pricing: product.pricing,
            inventory: product.inventory,
          },
          metrics: {
            totalOrders,
            totalRevenue,
            totalUnits,
            averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
            conversionRate: conversionRate.toFixed(2),
            views: views,
            rating: product.ratings?.average || 0,
            reviewCount: product.ratings?.count || 0,
          },
          recentReviews: reviews,
          trend: {
            // Calculate weekly trend
            lastWeek: await calculateWeeklyMetrics(productId, 7),
            thisWeek: await calculateWeeklyMetrics(productId, 0),
          },
        },
      });
    } else {
      // Get all products performance summary
      const products = await Product.find({ sellerId: decoded.userId });

      const performanceData = await Promise.all(
        products.map(async (product) => {
          const orders = await Order.find({
            "items.product": product._id,
            createdAt: { $gte: startDate },
          });

          const totalRevenue = orders.reduce((sum, order) => {
            const item = order.items.find(
              (i) => i.product.toString() === product._id.toString()
            );
            return sum + (item ? item.price * item.quantity : 0);
          }, 0);

          const totalUnits = orders.reduce((sum, order) => {
            const item = order.items.find(
              (i) => i.product.toString() === product._id.toString()
            );
            return sum + (item ? item.quantity : 0);
          }, 0);

          return {
            productId: product._id,
            name: product.name,
            image: product.images?.[0],
            totalOrders: orders.length,
            totalRevenue,
            totalUnits,
            stock: product.inventory?.stock || 0,
            rating: product.ratings?.average || 0,
            isActive: product.isActive,
            isApproved: product.isApproved,
          };
        })
      );

      // Sort by revenue
      performanceData.sort((a, b) => b.totalRevenue - a.totalRevenue);

      return NextResponse.json({
        success: true,
        performance: {
          products: performanceData,
          summary: {
            totalProducts: products.length,
            activeProducts: products.filter((p) => p.isActive).length,
            totalRevenue: performanceData.reduce(
              (sum, p) => sum + p.totalRevenue,
              0
            ),
            totalOrders: performanceData.reduce(
              (sum, p) => sum + p.totalOrders,
              0
            ),
            totalUnits: performanceData.reduce(
              (sum, p) => sum + p.totalUnits,
              0
            ),
            averageRating:
              performanceData.reduce((sum, p) => sum + p.rating, 0) /
                performanceData.length || 0,
          },
        },
      });
    }
  } catch (error) {
    console.error("Performance API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

async function calculateWeeklyMetrics(productId, daysAgo) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (daysAgo + 7));
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - daysAgo);

  const orders = await Order.find({
    "items.product": productId,
    createdAt: { $gte: startDate, $lte: endDate },
  });

  const revenue = orders.reduce((sum, order) => {
    const item = order.items.find(
      (i) => i.product.toString() === productId.toString()
    );
    return sum + (item ? item.price * item.quantity : 0);
  }, 0);

  return {
    orders: orders.length,
    revenue,
  };
}
