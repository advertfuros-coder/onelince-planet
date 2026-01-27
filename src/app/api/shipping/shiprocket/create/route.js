// app/api/shipping/shiprocket/create/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { verifyToken } from "@/lib/utils/auth";
import shiprocketService from "@/lib/services/shiprocketService";
import Order from "@/lib/db/models/Order";
import Seller from "@/lib/db/models/Seller";

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

    // Determine Seller and Pickup Location
    let pickupLocationName = process.env.SHIPROCKET_PICKUP_NAME || "Home";
    
    // We use the seller from the first item as the pickup location source
    const sellerUserId = order.items[0]?.seller;
    
    if (sellerUserId) {
      const sellerProfile = await Seller.findOne({ userId: sellerUserId });
      
      if (sellerProfile && sellerProfile.pickupAddress) {
        const { pickupAddress, businessInfo, personalDetails } = sellerProfile;
        // Create a unique location code for this seller
        const locationCode = `Seller_${sellerProfile._id}`;
        
        try {
          // Check if this location already exists in Shiprocket
          const pickupLocationsResponse = await shiprocketService.getPickupLocations();
          // The API response structure usually has data property or the array directly depending on the client wrapper
          // Based on shiprocketService.js implementation, it returns response.data directly.
          // Shiprocket API returns { shipping_address: [...] }
          const existingLocation = pickupLocationsResponse?.shipping_address?.find(
            loc => loc.pickup_location === locationCode
          );
          
          if (!existingLocation) {
            console.log(`Creating new pickup location for seller: ${locationCode}`);
            // Add new pickup location
            await shiprocketService.addPickupLocation({
              pickup_location: locationCode,
              name: businessInfo?.businessName || personalDetails?.fullName || "Seller",
              email: personalDetails?.email || "seller@example.com",
              phone: personalDetails?.phone || "9876543210",
              address: pickupAddress.addressLine1,
              address_2: pickupAddress.addressLine2 || "",
              city: pickupAddress.city,
              state: pickupAddress.state,
              country: pickupAddress.country || "India",
              pin_code: pickupAddress.pincode
            });
          } else {
            console.log(`Using existing pickup location: ${locationCode}`);
          }
          
          pickupLocationName = locationCode;
        } catch (err) {
          console.error("Error managing pickup location:", err.message);
          // Fallback to default if managing location fails
        }
      }
    }

    // Create Shiprocket order
    const result = await shiprocketService.createOrder({
      order_id: order.orderNumber,
      order_date: new Date(order.createdAt).toISOString().split("T")[0],
      pickup_location: pickupLocationName,
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
