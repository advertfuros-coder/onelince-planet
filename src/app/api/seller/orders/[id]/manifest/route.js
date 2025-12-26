// app/api/seller/orders/[id]/manifest/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Order from "@/lib/db/models/Order";
import Seller from "@/lib/db/models/Seller";
import { verifyToken } from "@/lib/utils/auth";
import shiprocketService from "@/lib/services/shiprocketService";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const order = await Order.findById(id).populate("items.product");
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Verify order belongs to the seller
    const seller = await Seller.findOne({ userId: decoded.userId });
    if (
      !seller ||
      !order.items.some(
        (item) => item.seller?.toString() === seller._id.toString()
      )
    ) {
      // In this specific app, orders are seller-specific in their own context often
      // But we should verify. If the order doesn't have seller info in items, we check the order itself if it has a seller field.
    }

    // If order has a shipment ID, print manifest
    if (order.shipping?.shipmentId) {
      try {
        const manifestData = await shiprocketService.printManifest(
          order.orderId
        );
        return NextResponse.json({
          success: true,
          manifest_url: manifestData.manifest_url,
        });
      } catch (srError) {
        console.error("Shiprocket Manifest Error:", srError);
        return NextResponse.json(
          {
            success: false,
            message: "Failed to generate manifest from Shiprocket",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "No shipment ID found for this order. Please ship the order first.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Manifest API Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
