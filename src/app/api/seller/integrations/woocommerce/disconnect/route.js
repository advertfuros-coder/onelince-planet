// app/api/seller/integrations/woocommerce/disconnect/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";
import jwt from "jsonwebtoken";

export async function DELETE(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await connectDB();

    // Remove WooCommerce integration
    await User.findByIdAndUpdate(decoded.userId, {
      $unset: { wooCommerceIntegration: 1 },
    });

    return NextResponse.json({
      success: true,
      message: "WooCommerce integration disconnected successfully",
    });
  } catch (error) {
    console.error("WooCommerce disconnect error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to disconnect WooCommerce",
      },
      { status: 500 }
    );
  }
}
