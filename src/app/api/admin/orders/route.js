import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Order from "@/lib/db/models/Order";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;

    // Build query
    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (search && search.trim()) {
      query.$or = [
        { orderNumber: { $regex: search.trim(), $options: "i" } },
        { "shippingAddress.name": { $regex: search.trim(), $options: "i" } },
        { "shippingAddress.phone": { $regex: search.trim(), $options: "i" } },
      ];
    }

    const allOrders = await Order.find(query)
      .populate("customer", "name email phone")
      .populate("items.product", "name images sku")
      .populate(
        "items.seller",
        "businessInfo storeInfo personalDetails"
      )
      .sort({ createdAt: -1 })
      .lean();

    // Calculate stats
    const stats = {
      total: allOrders.length,
      confirmed: 0,
      processing: 0,
      ready_for_pickup: 0,
      pickup: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
      totalRevenue: 0,
    };

    allOrders.forEach((order) => {
      if (stats.hasOwnProperty(order.status)) {
        stats[order.status]++;
      }
      if (!["cancelled", "returned"].includes(order.status)) {
        stats.totalRevenue += order.pricing.total || 0;
      }
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedOrders = allOrders.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      orders: paginatedOrders,
      stats: stats,
      pagination: {
        page,
        limit,
        total: allOrders.length,
        pages: Math.ceil(allOrders.length / limit),
      },
    });
  } catch (error) {
    console.error("Get admin orders error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
