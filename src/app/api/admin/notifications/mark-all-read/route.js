import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Notification from "@/lib/db/models/Notification";

/**
 * POST /api/admin/notifications/mark-all-read
 * Mark all notifications as read for the current user
 */
export async function POST(request) {
  try {
    await dbConnect();

    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await Notification.updateMany(
      { userId, read: false },
      {
        $set: {
          read: true,
          readAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      markedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark All Read Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to mark all as read",
      },
      { status: 500 }
    );
  }
}
