// app/api/seller/shipping/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import ShippingRule from "@/lib/db/models/ShippingRule";
import Seller from "@/lib/db/models/Seller";
import { verifyToken } from "@/lib/utils/auth";

export async function GET(request) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // specific query for seller using userId or sellerId depending on schema
    // ShippingRule uses sellerId as User ID ref based on my definition
    const rules = await ShippingRule.find({ sellerId: decoded.userId }).sort({
      createdAt: -1,
    });

    // Fetch pickup address from Seller profile
    const seller = await Seller.findOne({ userId: decoded.userId });
    const pickupAddress = seller?.pickupAddress || null;

    return NextResponse.json({
      success: true,
      shippingRules: rules.map((rule) => ({
        id: rule._id,
        name: rule.name,
        isActive: rule.isActive,
        type: rule.type,
        conditions: rule.conditions,
        pricing: rule.pricing,
        deliveryTime: rule.deliveryTime,
      })),
      pickupAddress,
    });
  } catch (error) {
    console.error("Shipping API GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Basic validation
    if (!data.name || !data.pricing?.baseRate) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const rule = await ShippingRule.create({
      sellerId: decoded.userId,
      ...data,
    });

    return NextResponse.json({
      success: true,
      rule: {
        id: rule._id,
        ...rule._doc,
      },
    });
  } catch (error) {
    console.error("Shipping API POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
