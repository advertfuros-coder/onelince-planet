// app/api/seller/notifications/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Notification from "@/lib/db/models/Notification";
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const unreadOnly = searchParams.get("unread") === "true";

    let query = { userId: decoded.userId };
    if (unreadOnly) query.read = false;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const unreadCount = await Notification.countDocuments({
      userId: decoded.userId,
      read: false,
    });

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Notifications GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
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

    const { id, markAll } = await request.json();

    if (markAll) {
      await Notification.updateMany(
        { userId: decoded.userId, read: false },
        { read: true, readAt: new Date() }
      );
    } else if (id) {
      await Notification.findOneAndUpdate(
        { _id: id, userId: decoded.userId },
        { read: true, readAt: new Date() }
      );
    }

    return NextResponse.json({
      success: true,
      message: markAll
        ? "All notifications marked as read"
        : "Notification marked as read",
    });
  } catch (error) {
    console.error("Notifications PUT Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
