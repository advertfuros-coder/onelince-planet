import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Seller from "@/lib/db/models/Seller";
import { verifyToken, isAdmin } from "@/lib/utils/adminAuth";

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { documentType } = await request.json();

    const { id } = await params;
    const seller = await Seller.findById(id);
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller not found" },
        { status: 404 }
      );
    }

    if (seller.documents && seller.documents[documentType]) {
      seller.documents[documentType].verified = true;
      seller.documents[documentType].verifiedAt = new Date();
      seller.documents[documentType].verifiedBy = decoded.id;
    }

    // Update verification steps
    if (seller.verificationSteps) {
      seller.verificationSteps[documentType] = true;
    }

    // Check if all documents are verified
    const allVerified = Object.values(seller.documents || {}).every(
      (doc) => typeof doc === "object" && doc.verified
    );

    if (allVerified) {
      seller.isVerified = true;
      seller.verificationStatus = "approved";
    }

    await seller.save();

    return NextResponse.json({
      success: true,
      message: "Document verified successfully",
      seller,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
