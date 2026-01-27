import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import ReturnRequest from "@/lib/db/models/ReturnRequest";
import Order from "@/lib/db/models/Order";
import { verifyToken } from "@/lib/utils/auth";

export async function POST(request) {
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

    const body = await request.json();
    const { orderId, items, evidence, description } = body;

    const order = await Order.findById(orderId);
    if (!order || order.customer.toString() !== decoded.id) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    // Group items by seller and create separate requests if necessary
    // But for simplification and based on the current architecture, we'll assume the request is for specific items
    // and we'll find the seller from the ordered items.

    const sellerId = order.items.find(
      (item) => item.product.toString() === items[0].productId,
    )?.seller;

    if (!sellerId) {
      return NextResponse.json(
        { success: false, message: "Seller not found for these items" },
        { status: 400 },
      );
    }

    const returnRequest = await ReturnRequest.create({
      orderId,
      customerId: decoded.id,
      sellerId,
      items,
      evidence,
      description,
      status: "pending",
    });

    // Update order timeline
    order.timeline.push({
      status: "return_initiated",
      description: `Return/Replacement request initiated for ${items.length} item(s)`,
      timestamp: new Date(),
    });

    // Optionally update item status in order
    items.forEach((reqItem) => {
      const orderItem = order.items.find(
        (oi) =>
          oi.product.toString() === reqItem.productId &&
          (!reqItem.variantSku || oi.sku === reqItem.variantSku),
      );
      if (orderItem) {
        orderItem.status = "returned"; // Temporary status tracking
      }
    });

    await order.save();

    return NextResponse.json({ success: true, returnRequest });
  } catch (error) {
    console.error("Return Request Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}

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

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || "customer";

    let query = {};
    if (role === "customer") {
      query.customerId = decoded.id;
    } else if (role === "seller") {
      query.sellerId = decoded.id;
    } else if (role === "admin" && decoded.role === "admin") {
      // Admin sees all
    } else {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const returns = await ReturnRequest.find(query)
      .populate("orderId", "orderNumber status")
      .populate("customerId", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, returns });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
