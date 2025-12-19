import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Notification from "@/lib/db/models/Notification";

/**
 * PATCH /api/admin/notifications/[id]
 * Mark notification as read
 */
export async function PATCH(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notification = await Notification.findOne({ _id: id, userId });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    await notification.markAsRead();

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Mark as Read Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to mark as read",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/notifications/[id]
 * Delete a notification
 */
export async function DELETE(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await Notification.deleteOne({ _id: id, userId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    console.error("Delete Notification Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete notification",
      },
      { status: 500 }
    );
  }
}
