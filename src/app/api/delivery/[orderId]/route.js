// app/api/delivery/[orderId]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Delivery from "@/lib/db/models/Delivery";
import { verifyToken } from "@/lib/utils/auth";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { orderId } = await params;
    const delivery = await Delivery.findOne({ orderId }).lean();
    if (!delivery) {
      return NextResponse.json(
        { success: false, message: "No delivery data" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, delivery });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const updates = await request.json();
    const { orderId } = await params;
    const delivery = await Delivery.findOneAndUpdate({ orderId }, updates, {
      new: true,
      upsert: true,
    });
    return NextResponse.json({ success: true, delivery });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update delivery" },
      { status: 500 }
    );
  }
}
