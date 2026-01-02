import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Product from "@/lib/db/models/Product";
import Seller from "@/lib/db/models/Seller";
import shiprocketService from "@/lib/services/shiprocketService";
import ekartService from "@/lib/services/ekartService";

export async function POST(request) {
  try {
    await connectDB();
    const { productId, deliveryPincode } = await request.json();

    if (!productId || !deliveryPincode) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Get Product and Seller details
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    const seller = await Seller.findById(product.sellerId);
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller not found" },
        { status: 404 }
      );
    }

    const pickupPincode = seller.pickupAddress?.pincode || "226022"; // Default if not found

    let estimates = [];

    // 2. Try Shiprocket for serviceability and ETA
    try {
      const shiprocketResult = await shiprocketService.getCourierServiceability(
        pickupPincode,
        deliveryPincode,
        0.5, // Default weight 500g
        0 // Prepaid for estimate
      );

      if (
        shiprocketResult.status === 200 &&
        shiprocketResult.data?.available_courier_companies?.length > 0
      ) {
        // Find the one with earliest delivery
        const couriers = shiprocketResult.data.available_courier_companies;
        const bestCourier = couriers.sort(
          (a, b) => new Date(a.etd) - new Date(b.etd)
        )[0];

        estimates.push({
          source: "Shiprocket",
          courier: bestCourier.courier_name,
          etd: bestCourier.etd,
          estimated_days: bestCourier.estimated_delivery_days,
          available: true,
        });
      }
    } catch (err) {
      console.error("Shiprocket estimate error:", err.message);
    }

    // 3. Try Ekart for serviceability
    try {
      const ekartResult = await ekartService.checkServiceability(
        deliveryPincode
      );
      if (
        ekartResult &&
        (ekartResult.status === "SUCCESS" ||
          ekartResult.status === true ||
          ekartResult.is_serviceable)
      ) {
        // Ekart usually takes 3-5 days for standard
        const today = new Date();
        const edd = new Date(today);
        edd.setDate(today.getDate() + 4); // Average 4 days

        estimates.push({
          source: "Ekart",
          courier: "Ekart Logistics",
          etd: edd.toISOString(),
          estimated_days: 4,
          available: true,
        });
      }
    } catch (err) {
      console.error("Ekart estimate error:", err.message);
    }

    if (estimates.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Delivery not available for this pincode",
        isServiceable: false,
      });
    }

    // Return the best (earliest) estimate
    const bestEstimate = estimates.sort(
      (a, b) => new Date(a.etd) - new Date(b.etd)
    )[0];

    return NextResponse.json({
      success: true,
      estimate: bestEstimate,
      isServiceable: true,
    });
  } catch (error) {
    console.error("Shipping estimate error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
