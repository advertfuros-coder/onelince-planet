// app/api/seller/documents/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import SellerDocument from "@/lib/db/models/SellerDocument";
import { verifyToken } from "@/lib/utils/auth";

// GET - Fetch all documents
export async function GET(request) {
  try {
    await connectDB();

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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = { sellerId: decoded.userId };
    if (status) query.status = status;

    const documents = await SellerDocument.find(query)
      .sort({ createdAt: -1 })
      .populate("reviewedBy", "name email");

    // Get verification status
    const verificationStatus = await SellerDocument.getVerificationStatus(
      decoded.userId
    );

    // Get expiring documents
    const expiringDocs = await SellerDocument.getExpiringDocuments(
      decoded.userId,
      30
    );

    // Group by status
    const stats = {
      total: documents.length,
      pending: documents.filter((d) => d.status === "pending").length,
      under_review: documents.filter((d) => d.status === "under_review").length,
      approved: documents.filter((d) => d.status === "approved").length,
      rejected: documents.filter((d) => d.status === "rejected").length,
      resubmission_required: documents.filter(
        (d) => d.status === "resubmission_required"
      ).length,
      expiring_soon: expiringDocs.length,
    };

    return NextResponse.json({
      success: true,
      documents,
      stats,
      verificationStatus,
      expiringDocuments: expiringDocs,
    });
  } catch (error) {
    console.error("Documents GET Error:", error);
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

// POST - Upload new document
export async function POST(request) {
  try {
    await connectDB();

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

    const documentData = await request.json();

    // Check if resubmission
    if (documentData.originalDocumentId) {
      const originalDoc = await SellerDocument.findById(
        documentData.originalDocumentId
      );
      if (originalDoc) {
        documentData.isResubmission = true;
        documentData.resubmissionCount =
          (originalDoc.resubmissionCount || 0) + 1;
      }
    }

    const document = await SellerDocument.create({
      ...documentData,
      sellerId: decoded.userId,
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      message: "Document uploaded successfully",
      document,
    });
  } catch (error) {
    console.error("Document POST Error:", error);
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
