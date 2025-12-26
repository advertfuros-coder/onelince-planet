// app/api/seller/pricing-rules/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import PricingRule from "@/lib/db/models/PricingRule";
import { verifyToken } from "@/lib/utils/auth";

// GET - Fetch all pricing rules for the seller
export async function GET(request) {
  try {
    await connectDB();

    // Verify authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Seller access required" },
        { status: 403 }
      );
    }

    const rules = await PricingRule.find({ sellerId: decoded.userId }).sort({
      priority: -1,
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      rules,
    });
  } catch (error) {
    console.error("Pricing Rules GET Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Create a new pricing rule
export async function POST(request) {
  try {
    await connectDB();

    // Verify authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Seller access required" },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.type) {
      return NextResponse.json(
        {
          success: false,
          message: "Name and Type are required",
        },
        { status: 400 }
      );
    }

    const rule = await PricingRule.create({
      ...data,
      sellerId: decoded.userId,
      status: "active",
    });

    return NextResponse.json({
      success: true,
      message: "Pricing rule created successfully",
      rule,
    });
  } catch (error) {
    console.error("Pricing Rules POST Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
