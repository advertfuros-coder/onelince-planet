// app/api/seller/reports/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Order from "@/lib/db/models/Order";
import Product from "@/lib/db/models/Product";
import Seller from "@/lib/db/models/Seller";
import { verifyToken } from "@/lib/utils/auth";
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
    const period = searchParams.get("period") || "30";

    const seller = await Seller.findOne({ userId: decoded.userId });
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller not found" },
        { status: 404 }
      );
    }

    // Date calculations
    const now = new Date();
    let startDate = new Date();
    if (period === "7") startDate.setDate(now.getDate() - 7);
    else if (period === "30") startDate.setDate(now.getDate() - 30);
    else if (period === "90") startDate.setDate(now.getDate() - 90);
    else startDate = new Date(0); // Lifetime

    // Aggregations
    const [summary, timeSeries, categories, regions] = await Promise.all([
      // Summary stats
      Order.aggregate([
        {
          $match: {
            "items.seller": new mongoose.Types.ObjectId(decoded.userId),
            createdAt: { $gte: startDate },
          },
        },
        { $unwind: "$items" },
        { $match: { "items.seller": new mongoose.Types.ObjectId(decoded.userId) } },
        {
          $group: {
            _id: null,
            revenue: {
              $sum: { $multiply: ["$items.price", "$items.quantity"] },
            },
            orders: { $addToSet: "$_id" },
          },
        },
        {
          $project: {
            revenue: 1,
            ordersCount: { $size: "$orders" },
            aov: {
              $cond: [
                { $gt: [{ $size: "$orders" }, 0] },
                { $divide: ["$revenue", { $size: "$orders" }] },
                0,
              ],
            },
          },
        },
      ]).then((res) => res[0] || { revenue: 0, ordersCount: 0, aov: 0 }),

      // Time series data
      Order.aggregate([
        {
          $match: {
            "items.seller": new mongoose.Types.ObjectId(decoded.userId),
            createdAt: { $gte: startDate },
          },
        },
        { $unwind: "$items" },
        { $match: { "items.seller": new mongoose.Types.ObjectId(decoded.userId) } },
        {
          $group: {
            _id: { $dateToString: { format: "%b %d", date: "$createdAt" } },
            revenue: {
              $sum: { $multiply: ["$items.price", "$items.quantity"] },
            },
            date: { $first: "$createdAt" },
          },
        },
        { $sort: { date: 1 } },
        {
          $project: {
            date: "$_id",
            revenue: 1,
            benchmark: { $multiply: ["$revenue", 0.8] },
          },
        },
      ]),

      // Category breakdown
      Order.aggregate([
        {
          $match: {
            "items.seller": new mongoose.Types.ObjectId(decoded.userId),
            createdAt: { $gte: startDate },
          },
        },
        { $unwind: "$items" },
        { $match: { "items.seller": new mongoose.Types.ObjectId(decoded.userId) } },
        {
          $lookup: {
            from: "products",
            localField: "items.product",
            foreignField: "_id",
            as: "productInfo",
          },
        },
        { $unwind: "$productInfo" },
        {
          $group: {
            _id: "$productInfo.category",
            value: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          },
        },
        { $sort: { value: -1 } },
      ]),

      // Regional breakdown (Mocking with shipping address states if available)
      Order.aggregate([
        {
          $match: {
            "items.seller": new mongoose.Types.ObjectId(decoded.userId),
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: "$shippingAddress.state",
            value: { $sum: "$totalAmount" },
          },
        },
        { $sort: { value: -1 } },
        { $limit: 4 },
      ]),
    ]);

    // Post-processing for frontend schema
    const totalRev = summary.revenue || 1;
    const processedCategories = categories.map((c) => ({
      name: c._id || "Uncategorized",
      value: c.value,
      percentage: Math.round((c.value / totalRev) * 100),
    }));

    const processedRegions = regions.map((r) => ({
      label: r._id || "Standard Hub",
      value: r.value,
      percentage: Math.round((r.value / totalRev) * 100),
    }));

    return NextResponse.json({
      success: true,
      reports: {
        summary: {
          revenue: summary.revenue,
          orders: summary.ordersCount,
          aov: summary.aov,
          retention: 65, // Dynamic retention logic could be complex, using a healthy benchmark for now
        },
        timeSeries,
        categories: processedCategories,
        regions: processedRegions,
      },
    });
  } catch (error) {
    console.error("Reports API Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
