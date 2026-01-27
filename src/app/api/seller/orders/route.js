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

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // IMPORTANT: The seller logged in is a User, but products have Seller IDs
    // We need to get the Seller document associated with this User first
    const Seller = require("@/lib/db/models/Seller").default;
    const sellerProfile = await Seller.findOne({ userId: decoded.id });

    if (!sellerProfile) {
      // No seller profile found for this user
      return NextResponse.json({
        success: true,
        orders: [],
        total: 0,
        message:
          "No seller profile found. Please complete your seller onboarding.",
      });
    }

    console.log("=== SELLER ORDERS ===");
    console.log("User ID (from token):", decoded.id);
    console.log("Seller ID (from profile):", sellerProfile._id.toString());

    // Query orders where items.seller matches the User ID
    // Note: In our schema, items.seller usually references the User model
    const orders = await Order.find({
      "items.seller": decoded.id,
    })
      .populate("customer", "name email phone")
      .populate("items.product", "name images sku")
      .sort({ createdAt: -1 })
      .lean();

    console.log("Orders found:", orders.length);
    console.log("=== END SELLER ORDERS ===");

    // Filter items to show only this seller's items
    const filteredOrders = orders.map((order) => ({
      ...order,
      items: order.items.filter(
        (item) => item.seller?.toString() === decoded.id,
      ),
    }));

    return NextResponse.json({
      success: true,
      orders: filteredOrders,
      total: filteredOrders.length,
    });
  } catch (error) {
    console.error("Get seller orders error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
