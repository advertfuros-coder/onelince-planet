// app/api/seller/bank-details/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Seller from "@/lib/db/models/Seller";
import { verifyToken } from "@/lib/utils/auth";

export async function GET(request) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Seller access required" },
        { status: 403 }
      );
    }

    const seller = await Seller.findOne({ userId: decoded.userId });
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller profile not found" },
        { status: 404 }
      );
    }

    const bankDetails = {
      accountHolderName: seller.bankDetails?.accountHolderName || "",
      accountNumber: seller.bankDetails?.accountNumber || "",
      bankName: seller.bankDetails?.bankName || "",
      ifscCode: seller.bankDetails?.ifscCode || "",
      branchName: seller.bankDetails?.branch || "",
      accountType: seller.bankDetails?.accountType || "current",
      upiId: seller.bankDetails?.upiId || "",
      verified: seller.verificationSteps?.bankVerified || false,
    };

    return NextResponse.json({
      success: true,
      bankDetails,
    });
  } catch (error) {
    console.error("Bank Details GET Error:", error);
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
    if (!token)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Seller access required" },
        { status: 403 }
      );
    }

    const data = await request.json();
    const {
      accountHolderName,
      accountNumber,
      bankName,
      ifscCode,
      branchName,
      accountType,
      upiId,
    } = data;

    // Validate required fields
    if (
      !accountHolderName ||
      !accountNumber ||
      !bankName ||
      !ifscCode ||
      !accountType
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const seller = await Seller.findOne({ userId: decoded.userId });
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller profile not found" },
        { status: 404 }
      );
    }

    seller.bankDetails = {
      accountHolderName,
      accountNumber,
      bankName,
      ifscCode,
      branch: branchName,
      accountType,
      upiId,
    };

    // In a real scenario, changing bank details might reset verification status
    // seller.verificationSteps.bankVerified = false

    await seller.save();

    return NextResponse.json({
      success: true,
      message: "Bank details updated successfully",
      bankDetails: {
        ...seller.bankDetails,
        verified: seller.verificationSteps?.bankVerified,
      },
    });
  } catch (error) {
    console.error("Bank Details POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
