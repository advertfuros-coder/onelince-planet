// app/api/loyalty/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { verifyToken } from "@/lib/utils/auth";
import LoyaltyProgram from "@/lib/db/models/LoyaltyProgram";

// Get user's loyalty program
export async function GET(request) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    let loyalty = await LoyaltyProgram.findOne({ userId: decoded.id });

    // Create if doesn't exist
    if (!loyalty) {
      loyalty = await LoyaltyProgram.create({
        userId: decoded.id,
      });
    }

    return NextResponse.json({
      success: true,
      loyalty,
    });
  } catch (error) {
    console.error("Get loyalty error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// Redeem points
export async function POST(request) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { points, description } = await request.json();

    const loyalty = await LoyaltyProgram.findOne({ userId: decoded.id });

    if (!loyalty) {
      return NextResponse.json(
        { success: false, message: "Loyalty program not found" },
        { status: 404 }
      );
    }

    try {
      loyalty.redeemPoints(points, description);
      await loyalty.save();

      return NextResponse.json({
        success: true,
        message: "Points redeemed successfully",
        loyalty,
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Redeem points error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
