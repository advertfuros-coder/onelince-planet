// app/api/seller/orders/[id]/label/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Order from "@/lib/db/models/Order";
import Seller from "@/lib/db/models/Seller";
import { verifyToken } from "@/lib/utils/auth";
import ekartService from "@/lib/services/ekartService";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const order = await Order.findById(id).populate("items.product");
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    // Verify order belongs to the seller
    const seller = await Seller.findOne({ userId: decoded.userId });
    if (
      !seller ||
      !order.items.some(
        (item) => item.seller?.toString() === seller._id.toString(),
      )
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    // If order has a shipment ID, download label
    if (order.shipping?.trackingId) {
      try {
        const labelData = await ekartService.downloadLabel(
          order.shipping.trackingId
        );
        
        console.log("Label data received:", labelData);
        
        // Check if it's a Buffer (PDF)
        if (Buffer.isBuffer(labelData)) {
          // Convert buffer to base64
          const base64 = labelData.toString('base64');
          return NextResponse.json({
            success: true,
            label_data: base64,
            content_type: 'application/pdf'
          });
        }
        
        // Otherwise try to extract URL from response
        const labelUrl = labelData?.data?.label_url || 
                        labelData?.label_url || 
                        labelData?.url ||
                        labelData?.data?.url ||
                        (typeof labelData === 'string' ? labelData : null);
        
        if (labelUrl) {
          return NextResponse.json({
            success: true,
            label_url: labelUrl,
          });
        } else {
          return NextResponse.json({
            success: false,
            message: "Label URL not found in response",
            debug: typeof labelData
          }, { status: 500 });
        }
      } catch (srError) {
        console.error("Ekart Label Error:", srError);
        return NextResponse.json(
          {
            success: false,
            message: srError.response?.data?.message || "Failed to download label from Ekart",
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
      { status: 400 },
    );
  } catch (error) {
    console.error("Label API Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
