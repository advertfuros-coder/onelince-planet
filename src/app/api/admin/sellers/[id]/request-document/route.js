import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Seller from "@/lib/db/models/Seller";
import { verifyToken, isAdmin } from "@/lib/utils/adminAuth";

export async function POST(request, { params }) {
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

    const { id } = await params;
    const { title, description } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: "Title and description are required" },
        { status: 400 }
      );
    }

    const seller = await Seller.findById(id);
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller not found" },
        { status: 404 }
      );
    }

    // Add to requestedDocuments
    if (!seller.documents.requestedDocuments) {
      seller.documents.requestedDocuments = [];
    }

    seller.documents.requestedDocuments.push({
      title,
      description,
      status: "pending",
      requestedAt: new Date(),
    });

    await seller.save();

    return NextResponse.json({
      success: true,
      message: "Document requested successfully",
      requestedDocuments: seller.documents.requestedDocuments,
    });
  } catch (error) {
    console.error("Request document error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
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
  
      const { id } = await params;
      const { requestId, status, rejectionReason } = await request.json();
  
      const seller = await Seller.findById(id);
      if (!seller) {
        return NextResponse.json(
          { success: false, message: "Seller not found" },
          { status: 404 }
        );
      }
  
      const doc = seller.documents.requestedDocuments.id(requestId);
      if (!doc) {
        return NextResponse.json(
          { success: false, message: "Request not found" },
          { status: 404 }
        );
      }
  
      doc.status = status;
      if (rejectionReason) doc.rejectionReason = rejectionReason;
  
      await seller.save();
  
      return NextResponse.json({
        success: true,
        message: "Document request status updated",
        requestedDocuments: seller.documents.requestedDocuments,
      });
    } catch (error) {
      console.error("Update request error:", error);
      return NextResponse.json(
        { success: false, message: "Server error", error: error.message },
        { status: 500 }
      );
    }
  }
