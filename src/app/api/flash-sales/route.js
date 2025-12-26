// app/api/flash-sales/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { verifyToken } from "@/lib/utils/auth";
import FlashSale from "@/lib/db/models/FlashSale";

// Get active flash sales (public)
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const onlyLive = searchParams.get("live") === "true";
    const featured = searchParams.get("featured") === "true";

    let query = { isActive: true };

    if (onlyLive) {
      const now = new Date();
      query.startTime = { $lte: now };
      query.endTime = { $gte: now };
    }

    if (featured) {
      query.featured = true;
    }

    const flashSales = await FlashSale.find(query)
      .populate("products.productId", "name images category")
      .sort({ priority: -1, startTime: -1 })
      .limit(20);

    return NextResponse.json({
      success: true,
      flashSales: flashSales.map((sale) => ({
        ...sale.toObject(),
        isLive: sale.isLive(),
        timeRemaining: sale.getTimeRemaining(),
      })),
    });
  } catch (error) {
    console.error("Get flash sales error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// Create flash sale (admin/seller)
export async function POST(request) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || (decoded.role !== "admin" && decoded.role !== "seller")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const flashSale = await FlashSale.create({
      ...body,
      createdBy: decoded.id,
    });

    return NextResponse.json({
      success: true,
      message: "Flash sale created successfully",
      flashSale,
    });
  } catch (error) {
    console.error("Create flash sale error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
