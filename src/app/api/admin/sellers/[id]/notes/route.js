import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Seller from "@/lib/db/models/Seller";
import { verifyToken, isAdmin } from "@/lib/utils/adminAuth";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const token = request.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    await connectDB();

    const seller = await Seller.findById(id).populate(
      "adminNotes.createdBy",
      "name email"
    );
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller not found" },
        { status: 404 }
      );
    }

    // Get admin notes from seller document
    const notes = seller.adminNotes || [];

    // Sort by creation date descending (most recent first)
    notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json({
      success: true,
      notes,
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch notes",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const token = request.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const { note } = await request.json();

    if (!note || !note.trim()) {
      return NextResponse.json(
        { success: false, message: "Note content is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const seller = await Seller.findById(id);
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller not found" },
        { status: 404 }
      );
    }

    // Initialize adminNotes array if it doesn't exist
    if (!seller.adminNotes) {
      seller.adminNotes = [];
    }

    // Add new note
    seller.adminNotes.push({
      note: note.trim(),
      createdBy: decoded.userId,
      createdAt: new Date(),
    });

    // Add activity log entry
    if (!seller.activityLogs) {
      seller.activityLogs = [];
    }

    seller.activityLogs.push({
      type: "admin",
      action: "Note Added",
      description: "Admin added an internal note",
      timestamp: new Date(),
      performedBy: decoded.userId,
    });

    await seller.save();

    return NextResponse.json({
      success: true,
      message: "Note added successfully",
    });
  } catch (error) {
    console.error("Error adding note:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add note",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
