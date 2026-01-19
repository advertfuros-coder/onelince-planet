// app/api/seller/orders/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Order from "@/lib/db/models/Order";
import { verifyToken } from "@/lib/utils/auth";

/**
 * Get seller's orders
 * GET /api/seller/orders
 */
export async function GET(request) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    console.log("=== SELLER ORDERS DEBUG ===");
    console.log("Token received:", token ? "Yes" : "No");
    console.log("Decoded seller ID:", decoded?.id);
    console.log("Decoded seller ID type:", typeof decoded?.id);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // First, let's check all orders to see what's in the database
    const allOrders = await Order.find({}).lean();
    console.log("Total orders in database:", allOrders.length);
    
    // Check if any orders have items with seller field
    const ordersWithSellerField = allOrders.filter(order => 
      order.items?.some(item => item.seller)
    );
    console.log("Orders with seller field:", ordersWithSellerField.length);
    
    // Log sample seller IDs to see format and check if they match
    if (ordersWithSellerField.length > 0) {
      const sampleOrder = ordersWithSellerField[0];
      const sampleSellerIds = sampleOrder.items
        .filter(item => item.seller)
        .map(item => ({
          seller: item.seller?.toString(),
          type: typeof item.seller,
          matches: item.seller?.toString() === decoded.id
        }));
      console.log("Sample seller IDs in orders:", sampleSellerIds);
      console.log("Sample order number:", sampleOrder.orderNumber);
    }

    // Try different query approaches
    const mongoose = require('mongoose');
    const sellerId = new mongoose.Types.ObjectId(decoded.id);
    
    // Method 1: Query with string ID
    const ordersMethod1 = await Order.find({
      "items.seller": decoded.id,
    }).lean();
    
    // Method 2: Query with ObjectId
    const ordersMethod2 = await Order.find({
      "items.seller": sellerId,
    }).lean();
    
    console.log("Orders found (string query):", ordersMethod1.length);
    console.log("Orders found (ObjectId query):", ordersMethod2.length);

    // Use whichever method found more orders
    const foundOrders = ordersMethod1.length > 0 ? ordersMethod1 : ordersMethod2;

    // Populate the found orders
    const orders = await Order.find({
      _id: { $in: foundOrders.map(o => o._id) }
    })
      .populate("customer", "name email phone")
      .populate("items.product", "name images sku")
      .sort({ createdAt: -1 })
      .lean();

    console.log("Final populated orders:", orders.length);

    // Filter items to show only seller's items
    const filteredOrders = orders.map((order) => ({
      ...order,
      items: order.items.filter(
        (item) => item.seller?.toString() === decoded.id
      ),
    }));

    console.log("Filtered orders count:", filteredOrders.length);
    console.log("=== END SELLER ORDERS DEBUG ===");

    return NextResponse.json({
      success: true,
      orders: filteredOrders,
      total: filteredOrders.length,
    });
  } catch (error) {
    console.error("Get seller orders error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
