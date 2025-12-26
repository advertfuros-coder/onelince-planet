// app/api/orders/[id]/notes/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Order from "@/lib/db/models/Order";
import { verifyToken } from "@/lib/utils/auth";

/**
 * Add note to order
 * POST /api/orders/[id]/notes
 */
export async function POST(request, { params }) {
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
    const body = await request.json();
    const { text, isInternal } = body;

    if (!text) {
      return NextResponse.json(
        { success: false, message: "Note text is required" },
        { status: 400 }
      );
    }

    // Verify user has permission
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const isCustomer = order.customer.toString() === decoded.id;
    const isSeller = order.items.some(
      (item) => item.seller.toString() === decoded.id
    );
    const isAdmin = decoded.role === "admin";

    if (!isCustomer && !isSeller && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Customers cannot add internal notes
    const noteIsInternal = isCustomer ? false : isInternal || false;

    // Add note
    order.notes = order.notes || [];
    order.notes.push({
      text,
      addedBy: isCustomer ? "customer" : isSeller ? "seller" : "admin",
      addedById: decoded.id,
      timestamp: new Date(),
      isInternal: noteIsInternal,
    });

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Note added successfully",
      order,
    });
  } catch (error) {
    console.error("Add note error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Get notes for order
 * GET /api/orders/[id]/notes
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

    const order = await Order.findById(id).populate(
      "notes.addedById",
      "name email"
    );

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const isCustomer = order.customer.toString() === decoded.id;
    const isSeller = order.items.some(
      (item) => item.seller.toString() === decoded.id
    );
    const isAdmin = decoded.role === "admin";

    if (!isCustomer && !isSeller && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Filter out internal notes for customers
    let notes = order.notes || [];
    if (isCustomer) {
      notes = notes.filter((note) => !note.isInternal);
    }

    return NextResponse.json({
      success: true,
      notes,
    });
  } catch (error) {
    console.error("Get notes error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
