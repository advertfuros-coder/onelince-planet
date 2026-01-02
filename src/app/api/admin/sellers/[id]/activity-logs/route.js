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

    const seller = await Seller.findById(id);
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller not found" },
        { status: 404 }
      );
    }

    // Get activity logs from seller document
    const logs = seller.activityLogs || [];

    // Sort by timestamp descending (most recent first)
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return NextResponse.json({
      success: true,
      logs: logs.slice(0, 50), // Return last 50 logs
    });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch activity logs",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
