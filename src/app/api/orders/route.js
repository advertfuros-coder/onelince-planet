// app/api/orders/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Order from "@/lib/db/models/Order";
import Product from "@/lib/db/models/Product";
import User from "@/lib/db/models/User";
import Cart from "@/lib/db/models/Cart";
import { verifyToken } from "@/lib/utils/auth";
import msg91Service from "@/lib/services/msg91";
import emailService from "@/lib/services/emailService";

export async function GET(request) {
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

    // Find all orders where customer is current user sorted by date desc
    const orders = await Order.find({ customer: decoded.id })
      .populate("items.product", "name images price")
      .populate("items.seller", "businessName name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Orders list GET error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
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

    const body = await request.json();
    const { items, shippingAddress, paymentMethod, couponCode } = body;

    // Validation
    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "No items in order" },
        { status: 400 }
      );
    }

    if (
      !shippingAddress ||
      !shippingAddress.name ||
      !shippingAddress.phone ||
      !shippingAddress.addressLine1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      return NextResponse.json(
        { success: false, message: "Complete shipping address required" },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, message: "Payment method required" },
        { status: 400 }
      );
    }

    // Verify products, calculate totals, and prepare order items
    let orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }

      if (!product.isActive) {
        return NextResponse.json(
          {
            success: false,
            message: `Product ${product.name} is not available`,
          },
          { status: 400 }
        );
      }

      // Check stock availability
      const availableStock = product.inventory?.stock || 0;
      if (availableStock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `Only ${availableStock} units available for ${product.name}`,
          },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        seller: product.sellerId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        images: product.images || [],
        sku: product.sku,
        hsn: product.hsn,
        status: "pending",
      });

      // Reduce product stock
      product.inventory.stock -= item.quantity;
      await product.save();
    }

    // Calculate pricing
    const shippingCharge = subtotal >= 500 ? 0 : 50; // Free shipping above ₹500
    const taxRate = 0.18; // 18% GST
    const tax = (subtotal + shippingCharge) * taxRate;

    // Apply discount if coupon code provided
    let discount = 0;
    // TODO: Implement coupon validation and discount calculation

    const total = subtotal + tax + shippingCharge - discount;

    // Generate unique order number
    const orderNumber = `OP${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create order
    const order = await Order.create({
      orderNumber,
      customer: decoded.id,
      items: orderItems,
      pricing: {
        subtotal,
        tax,
        shipping: shippingCharge,
        discount,
        total,
      },
      shippingAddress: {
        name: shippingAddress.name,
        phone: shippingAddress.phone,
        email: shippingAddress.email || decoded.email,
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2 || "",
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
        country: shippingAddress.country || "India",
      },
      status: "pending",
      payment: {
        method: paymentMethod,
        status: paymentMethod === "cod" ? "pending" : "pending",
      },
      timeline: [
        {
          status: "pending",
          description: "Order placed successfully",
          timestamp: new Date(),
        },
      ],
    });

    // Clear user's cart after successful order placement
    await Cart.findOneAndUpdate({ userId: decoded.id }, { items: [] });

    // Populate order details for response and notifications
    const populatedOrder = await Order.findById(order._id)
      .populate("items.product", "name images")
      .populate("items.seller", "businessName name email phone")
      .populate("customer", "name email phone");

    // Send notifications
    try {
      // Customer notifications
      const customer = populatedOrder.customer;

      // WhatsApp & SMS via MSG91
      await msg91Service.notifyOrderConfirmed(populatedOrder, customer);

      // Email notification
      await emailService.sendOrderConfirmation(populatedOrder, customer);

      // Seller notifications
      const uniqueSellers = [
        ...new Set(
          populatedOrder.items.map((item) => item.seller._id.toString())
        ),
      ];
      for (const sellerId of uniqueSellers) {
        const seller = populatedOrder.items.find(
          (item) => item.seller._id.toString() === sellerId
        ).seller;

        // Notify seller via SMS
        await msg91Service.notifySellerNewOrder(populatedOrder, seller);

        // Email notification
        await emailService.sendSellerNewOrder(populatedOrder, seller);
      }
    } catch (notifError) {
      // Don't fail order if notifications fail
      console.error("Notification error:", notifError);
    }

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      order: populatedOrder,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("Order creation POST error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to place order",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
