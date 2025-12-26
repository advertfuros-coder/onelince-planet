import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Order from "@/lib/db/models/Order";
import Seller from "@/lib/db/models/Seller";
import { generateInvoiceHTML } from "@/lib/services/invoiceGenerator";
import { verifyToken } from "@/lib/utils/auth";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Order ID" },
        { status: 400 }
      );
    }

    const order = await Order.findById(id)
      .populate("customer", "name email")
      .populate("items.product", "name sku")
      .lean();

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    // Fetch seller details
    const seller = await Seller.findOne({ userId: decoded.userId }).lean();

    const invoiceHTML = generateInvoiceHTML(order, seller);

    return new NextResponse(invoiceHTML, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="invoice-${order.orderNumber}.html"`,
      },
    });
  } catch (error) {
    console.error("Generate invoice error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
