// app/api/seller/profile/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
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

    // Find seller profile
    const seller = await Seller.findOne({ userId: decoded.userId });

    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      seller: {
        _id: seller._id,
        businessName: seller.businessName,
        storeInfo: seller.storeInfo,
        isActive: seller.isActive,
        isVerified: seller.isVerified,
      },
    });
  } catch (error) {
    console.error("Seller profile error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
