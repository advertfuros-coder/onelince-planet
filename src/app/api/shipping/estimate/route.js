import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Product from "@/lib/db/models/Product";
import Seller from "@/lib/db/models/Seller";
import shiprocketService from "@/lib/services/shiprocketService";
import ekartService from "@/lib/services/ekartService";

// Helper function to calculate delivery days based on distance
async function calculateDeliveryDays(pickupPincode, deliveryPincode) {
  try {
    // Fetch location details for both pincodes
    const [pickupResponse, deliveryResponse] = await Promise.all([
      fetch(`https://api.postalpincode.in/pincode/${pickupPincode}`),
      fetch(`https://api.postalpincode.in/pincode/${deliveryPincode}`),
    ]);

    const pickupData = await pickupResponse.json();
    const deliveryData = await deliveryResponse.json();

    if (
      pickupData[0]?.Status === "Success" &&
      deliveryData[0]?.Status === "Success"
    ) {
      const pickupLocation = pickupData[0].PostOffice[0];
      const deliveryLocation = deliveryData[0].PostOffice[0];

      const pickupCity = pickupLocation.District;
      const pickupState = pickupLocation.State;
      const deliveryCity = deliveryLocation.District;
      const deliveryState = deliveryLocation.State;

      // Same city delivery
      if (pickupCity === deliveryCity) {
        return {
          standard: 2,
          express: 1,
          location: `${deliveryCity}, ${deliveryState}`,
        };
      }

      // Same state delivery
      if (pickupState === deliveryState) {
        return {
          standard: 3,
          express: 2,
          location: `${deliveryCity}, ${deliveryState}`,
        };
      }

      // Metro to metro (major cities)
      const metroCities = [
        "Delhi",
        "Mumbai",
        "Bangalore",
        "Kolkata",
        "Chennai",
        "Hyderabad",
        "Pune",
        "Ahmedabad",
      ];
      const isMetroToMetro =
        metroCities.includes(pickupCity) && metroCities.includes(deliveryCity);

      if (isMetroToMetro) {
        return {
          standard: 3,
          express: 2,
          location: `${deliveryCity}, ${deliveryState}`,
        };
      }

      // Interstate delivery
      return {
        standard: 5,
        express: 3,
        location: `${deliveryCity}, ${deliveryState}`,
      };
    }
  } catch (error) {
    console.error("Failed to calculate delivery days:", error);
  }

  // Default fallback
  return {
    standard: 4,
    express: 2,
    location: null,
  };
}

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
          express_days: Math.max(1, bestCourier.estimated_delivery_days - 2),
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
        // Calculate realistic delivery days based on distance
        const deliveryDays = await calculateDeliveryDays(
          pickupPincode,
          deliveryPincode
        );

        const today = new Date();
        const standardEdd = new Date(today);
        standardEdd.setDate(today.getDate() + deliveryDays.standard);

        estimates.push({
          source: "Ekart",
          courier: "Ekart Logistics",
          etd: standardEdd.toISOString(),
          estimated_days: deliveryDays.standard,
          express_days: deliveryDays.express,
          available: true,
          location: deliveryDays.location,
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
