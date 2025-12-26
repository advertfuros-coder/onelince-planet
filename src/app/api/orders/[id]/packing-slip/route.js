// app/api/orders/[id]/packing-slip/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Order from "@/lib/db/models/Order";
import User from "@/lib/db/models/User";
import { verifyToken } from "@/lib/utils/auth";
import orderService from "@/lib/services/orderService";

/**
 * Generate packing slip
 * GET /api/orders/[id]/packing-slip
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
      .populate("items.product", "name sku")
      .populate("items.seller", "businessName name");

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Verify user is seller or admin
    const isSeller = order.items.some(
      (item) => item.seller._id.toString() === decoded.id
    );
    const isAdmin = decoded.role === "admin";

    if (!isSeller && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Generate packing slip data
    const packingSlip = orderService.generatePackingSlip(order);

    return NextResponse.json({
      success: true,
      packingSlip,
    });
  } catch (error) {
    console.error("Generate packing slip error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
