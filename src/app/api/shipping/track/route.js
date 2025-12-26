// app/api/shipping/track/route.js
import { NextResponse } from "next/server";
import shiprocketService from "@/lib/services/shiprocketService";
import ekartService from "@/lib/services/ekartService";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingId = searchParams.get("trackingId");
    const provider = searchParams.get("provider");

    if (!trackingId) {
      return NextResponse.json(
        { success: false, message: "Tracking ID is required" },
        { status: 400 }
      );
    }

    let trackingData;

    if (provider === "shiprocket") {
      trackingData = await shiprocketService.trackShipment(trackingId);
    } else if (provider === "ekart") {
      trackingData = await ekartService.trackShipment(trackingId);
    } else {
      // Try both
      try {
        trackingData = await shiprocketService.trackShipment(trackingId);
      } catch (e) {
        trackingData = await ekartService.trackShipment(trackingId);
      }
    }

    return NextResponse.json({
      success: true,
      data: trackingData,
    });
  } catch (error) {
    console.error("Track shipment error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to track shipment",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
