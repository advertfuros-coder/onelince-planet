// app/api/shipping/shiprocket/create/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { verifyToken } from "@/lib/utils/auth";
import shiprocketService from "@/lib/services/shiprocketService";
import Order from "@/lib/db/models/Order";

export async function POST(request) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || (decoded.role !== "seller" && decoded.role !== "admin")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Check if already shipped
    if (order.shipping?.trackingId) {
      return NextResponse.json(
        { success: false, message: "Order already shipped" },
        { status: 400 }
      );
    }

    // Create Shiprocket order
    const result = await shiprocketService.createOrder({
      order_id: order.orderNumber,
      order_date: new Date(order.createdAt).toISOString().split("T")[0],
      pickup_location: process.env.SHIPROCKET_PICKUP_NAME || "Home",
      billing_customer_name: order.shippingAddress.name,
      billing_address: order.shippingAddress.addressLine1,
      billing_city: order.shippingAddress.city,
      billing_state: order.shippingAddress.state,
      billing_pincode: order.shippingAddress.pincode,
      billing_phone: order.shippingAddress.phone,
      billing_email: order.shippingAddress.email || "customer@example.com",
      shipping_is_billing: true,
      order_items: order.items.map((item) => ({
        name: item.name,
        sku: item.sku || String(item.product),
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
      })),
      payment_method: order.payment.method === "cod" ? "COD" : "Prepaid",
      sub_total: order.pricing.subtotal,
      length: 30,
      breadth: 20,
      height: 15,
      weight: 1.0,
    });

    // Update order with Shiprocket info
    order.shipping = order.shipping || {};
    order.shipping.provider = "shiprocket";
    order.shipping.shiprocketOrderId = result.order_id;
    order.shipping.shiprocketShipmentId = result.shipment_id;
    order.shipping.trackingId = result.awb_code;
    order.shipping.carrier = result.courier_name || "Shiprocket";

    order.status = "shipped";
    order.timeline.push({
      status: "shipped",
      description: `Order shipped via Shiprocket. AWB: ${result.awb_code}`,
      timestamp: new Date(),
    });

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Shipment created successfully",
      data: {
        orderId: result.order_id,
        shipmentId: result.shipment_id,
        trackingId: result.awb_code,
        courier: result.courier_name,
      },
    });
  } catch (error) {
    console.error("Shiprocket create shipment error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
