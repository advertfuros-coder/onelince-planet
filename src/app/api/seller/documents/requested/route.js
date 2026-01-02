import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Seller from "@/lib/db/models/Seller";
import { verifyToken } from "@/lib/utils/auth";

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

    const seller = await Seller.findOne({ userId: decoded.userId });
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      requestedDocuments: seller.documents?.requestedDocuments || [],
    });
  } catch (error) {
    console.error("Fetch requested docs error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

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

    const { requestId, url } = await request.json();
    if (!requestId || !url) {
      return NextResponse.json(
        { success: false, message: "Request ID and file URL are required" },
        { status: 400 }
      );
    }

    const seller = await Seller.findOne({ userId: decoded.userId });
    if (!seller || !seller.documents?.requestedDocuments) {
      return NextResponse.json(
        { success: false, message: "Seller or requests not found" },
        { status: 404 }
      );
    }

    const doc = seller.documents.requestedDocuments.id(requestId);
    if (!doc) {
      return NextResponse.json(
        { success: false, message: "Specific request not found" },
        { status: 404 }
      );
    }

    doc.url = url;
    doc.status = "uploaded";
    doc.uploadedAt = new Date();

    await seller.save();

    return NextResponse.json({
      success: true,
      message: "Document uploaded successfully",
      requestedDocuments: seller.documents.requestedDocuments,
    });
  } catch (error) {
    console.error("Upload requested doc error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
