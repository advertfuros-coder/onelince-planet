// app/api/seller/integrations/amazon/settings/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";
import jwt from "jsonwebtoken";

export async function PUT(request) {
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

    const body = await request.json();
    const {
      autoSyncProducts,
      autoSyncInventory,
      autoSyncOrders,
      syncInterval,
    } = body;

    await connectDB();

    await User.findByIdAndUpdate(decoded.userId, {
      "amazonIntegration.syncSettings": {
        autoSyncProducts,
        autoSyncInventory,
        autoSyncOrders,
        syncInterval,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Sync settings updated successfully",
    });
  } catch (error) {
    console.error("Update Amazon settings error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update settings",
      },
      { status: 500 }
    );
  }
}
