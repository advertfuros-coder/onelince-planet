import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Seller from "@/lib/db/models/Seller";

export async function POST(req) {
  try {
    await dbConnect();
    const { gstin, pan } = await req.json();

    if (!gstin && !pan) {
      return NextResponse.json(
        { success: false, message: "GSTIN or PAN is required" },
        { status: 400 }
      );
    }

    // Search for existing seller with same GSTIN or PAN
    const query = [];
    if (gstin) query.push({ gstin: gstin.toUpperCase() });
    if (pan) query.push({ pan: pan.toUpperCase() });

    const existingSeller = await Seller.findOne({
      $or: query,
    });

    if (existingSeller) {
      // Check if banned or suspended
      if (
        existingSeller.verificationStatus === "suspended" ||
        existingSeller.verificationStatus === "rejected"
      ) {
        return NextResponse.json({
          success: true,
          isRegistered: true,
          isBanned: true,
          banReason:
            existingSeller.suspensionReason ||
            existingSeller.rejectionReason ||
            "Violating platform terms and conditions",
          storeName: existingSeller.storeInfo.storeName,
        });
      }

      // Already registered but not banned
      return NextResponse.json({
        success: true,
        isRegistered: true,
        isBanned: false,
        storeName: existingSeller.storeInfo.storeName,
      });
    }

    // Not registered
    return NextResponse.json({
      success: true,
      isRegistered: false,
    });
  } catch (error) {
    console.error("Check business error:", error);
    return NextResponse.json(
      { success: false, message: "Server error check business" },
      { status: 500 }
    );
  }
}
