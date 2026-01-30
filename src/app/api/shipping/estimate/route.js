import { NextResponse } from "next/server";

// Remote/restricted pincodes in India (very remote areas, islands, conflict zones)
const REMOTE_PINCODES = [
  // Andaman & Nicobar Islands (very remote)
  /^744\d{3}$/,
  // Lakshadweep Islands
  /^682\d{3}$/,
  // Remote areas of Jammu & Kashmir
  /^19[0-4]\d{3}$/,
  // Remote areas of Ladakh
  /^194\d{3}$/,
  // Remote areas of Arunachal Pradesh
  /^79[0-2]\d{3}$/,
  // Remote areas of Sikkim
  /^737\d{3}$/,
  // Remote areas of Himachal Pradesh (high altitude)
  /^172\d{3}$/,
  // Remote areas of Uttarakhand (high altitude)
  /^246\d{3}$/,
];

function isRemoteArea(pincode) {
  return REMOTE_PINCODES.some((pattern) => pattern.test(pincode));
}

export async function POST(request) {
  try {
    const { productId, deliveryPincode } = await request.json();

    if (!deliveryPincode || deliveryPincode.length !== 6) {
      return NextResponse.json(
        { success: false, message: "Invalid pincode" },
        { status: 400 },
      );
    }

    // Check if pincode is in remote area
    if (isRemoteArea(deliveryPincode)) {
      return NextResponse.json({
        success: true,
        estimate: {
          available: false,
          message: "Delivery not available to this location",
          reason:
            "This area is currently not serviceable. We're working to expand our delivery network.",
        },
      });
    }

    // Mock shipping logic - in production this would connect to a shipping provider like Shiprocket/Delhivery
    const today = new Date();

    // Calculate standard delivery (5-7 days)
    const minDays = 5;
    const maxDays = 7;
    const standardDate = new Date(today);
    standardDate.setDate(today.getDate() + minDays);

    // Calculate express delivery (2-3 days)
    const expressDays = 2;
    const expressDate = new Date(today);
    expressDate.setDate(today.getDate() + expressDays);

    return NextResponse.json({
      success: true,
      estimate: {
        available: true,
        courier: "Express Logistics",
        estimated_days: `${minDays}-${maxDays}`,
        express_days: expressDays,
        etd: standardDate.toISOString(),
        express_etd: expressDate.toISOString(),
        is_cod_available: true,
        shipping_charge: 0,
        express_charge: 99,
      },
    });
  } catch (error) {
    console.error("Shipping estimate error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch shipping estimate" },
      { status: 500 },
    );
  }
}
