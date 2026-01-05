import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Order from "@/lib/db/models/Order";
import Product from "@/lib/db/models/Product";
import { verifyToken } from "@/lib/utils/auth";

export async function GET(request) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = decoded.id;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = { customer: userId };

    if (status && status !== "all") {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // Extract token if available (for authenticated users)
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = token ? verifyToken(token) : null;

    const {
      items,
      shippingAddress,
      paymentMethod,
      transactionId,
      couponCode,
      customerId,
      guestEmail,
      isGuestOrder,
      subtotal: clientSubtotal,
      tax: clientTax,
      shipping: clientShipping,
      donation: clientDonation,
      total: clientTotal,
    } = body;

    // Validation
    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty" },
        { status: 400 }
      );
    }

    if (
      !shippingAddress ||
      !shippingAddress.name ||
      !shippingAddress.addressLine1
    ) {
      return NextResponse.json(
        { success: false, message: "Shipping address is required" },
        { status: 400 }
      );
    }

    // Validate products and calculate totals server-side
    const orderItems = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product not found: ${item.productId}` },
          { status: 404 }
        );
      }

      // Check stock
      const availableStock = product.inventory?.stock || 0;
      if (availableStock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient stock for ${product.name}. Available: ${availableStock}`,
          },
          { status: 400 }
        );
      }

      // Get the correct price
      const itemPrice =
        product.pricing?.salePrice || product.pricing?.basePrice || 0;

      if (!itemPrice || itemPrice <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid price for product: ${product.name}`,
          },
          { status: 400 }
        );
      }

      const itemTotal = itemPrice * item.quantity;
      calculatedSubtotal += itemTotal;

      // Build order item with all required fields
      orderItems.push({
        product: product._id,
        seller: product.sellerId, // Use sellerId from Product model
        name: product.name,
        price: itemPrice,
        quantity: item.quantity,
        images: product.images?.map((img) => img.url || img) || [],
        sku: product.sku || "",
        hsn: product.hsnCode || "",
        weight: product.shipping?.weight || 0.5,
        status: "confirmed",
      });

      // Update product stock
      product.inventory.stock -= item.quantity;
      product.inventory.soldCount =
        (product.inventory.soldCount || 0) + item.quantity;
      await product.save();
    }

    // Calculate all pricing server-side to prevent manipulation
    // Round to 2 decimal places
    const roundToTwo = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

    const serverSubtotal = roundToTwo(calculatedSubtotal);
    const serverTax = roundToTwo(serverSubtotal * 0.05); // 5% tax
    const serverShipping = parseFloat(clientShipping) || 0;
    const serverDonation = parseFloat(clientDonation) || 0;
    const serverDiscount = 0; // Can be calculated based on coupon code
    const serverTotal = roundToTwo(
      serverSubtotal +
        serverTax +
        serverShipping +
        serverDonation -
        serverDiscount
    );

    // Validate the calculated total is a valid number
    if (isNaN(serverTotal) || isNaN(serverSubtotal)) {
      return NextResponse.json(
        { success: false, message: "Invalid pricing calculation" },
        { status: 400 }
      );
    }

    // Create order with proper structure
    const orderData = {
      customer: decoded?.id || null,
      guestEmail: isGuestOrder ? guestEmail : null,
      isGuestOrder: isGuestOrder || false,
      items: orderItems,
      shippingAddress: {
        name: shippingAddress.name,
        phone: shippingAddress.phone,
        email: shippingAddress.email,
        addressLine1: shippingAddress.addressLine1,
        addressLine2: shippingAddress.addressLine2 || "",
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
        country: shippingAddress.country || "UAE",
      },
      payment: {
        method: paymentMethod || "cod",
        status: paymentMethod === "cod" ? "pending" : "paid",
        transactionId: transactionId || null,
        couponCode: couponCode || null,
        paidAt: paymentMethod !== "cod" ? new Date() : null,
      },
      pricing: {
        subtotal: serverSubtotal,
        tax: serverTax,
        shipping: serverShipping,
        discount: serverDiscount,
        donation: serverDonation,
        total: serverTotal,
      },
      status: "pending",
      orderNumber: `OP-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}`,
      timeline: [
        {
          status: "pending",
          description: "Order placed successfully",
          timestamp: new Date(),
        },
      ],
    };

    console.log("Creating order with data:", {
      itemsCount: orderItems.length,
      subtotal: serverSubtotal,
      total: serverTotal,
      paymentMethod: orderData.payment.method,
    });

    const order = await Order.create(orderData);

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      orderId: order._id,
      orderNumber: order.orderNumber,
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      errors: error.errors,
    });

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create order",
        error: error.message,
        details: error.errors
          ? Object.keys(error.errors).map((key) => ({
              field: key,
              message: error.errors[key].message,
            }))
          : null,
      },
      { status: 500 }
    );
  }
}
