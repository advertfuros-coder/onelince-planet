// app/api/orders/[id]/invoice/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Order from "@/lib/db/models/Order";
import User from "@/lib/db/models/User";
import { verifyToken } from "@/lib/utils/auth";
import orderService from "@/lib/services/orderService";

/**
 * Generate GST invoice
 * GET /api/orders/[id]/invoice
 */
export async function GET(request, { params }) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;

    const order = await Order.findById(id)
      .populate("items.product", "name sku hsn")
      .populate("items.seller", "businessName name gstin address")
      .populate("customer", "name email phone");

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Verify user is seller, customer, or admin
    const isSeller = order.items.some(
      (item) => item.seller._id.toString() === decoded.id
    );
    const isCustomer = order.customer._id.toString() === decoded.id;
    const isAdmin = decoded.role === "admin";

    if (!isSeller && !isCustomer && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get seller info (assuming first seller for multi-vendor)
    const seller = await User.findById(order.items[0].seller._id);

    // Generate GST invoice
    const invoice = orderService.generateGSTInvoice(order, seller);

    return NextResponse.json({
      success: true,
      invoice,
    });
  } catch (error) {
    console.error("Generate invoice error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
