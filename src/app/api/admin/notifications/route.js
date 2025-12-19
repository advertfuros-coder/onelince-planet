import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Notification from "@/lib/db/models/Notification";

/**
 * GET /api/admin/notifications
 * Fetch admin notifications with pagination
 */
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const userId = request.headers.get("x-user-id"); // From middleware

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const skip = (page - 1) * limit;

    // Build query
    const query = { userId };
    if (unreadOnly) {
      query.read = false;
    }

    // Fetch notifications
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ priority: -1, createdAt: -1 }) // High priority first
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ userId, read: false }),
    ]);

    return NextResponse.json({
      success: true,
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      unreadCount,
    });
  } catch (error) {
    console.error("Notifications API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch notifications",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/notifications
 * Create a new notification (for testing or system notifications)
 */
export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { type, title, message, priority, actionUrl, relatedEntity, userId } =
      body;

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      priority: priority || "medium",
      actionUrl,
      relatedEntity,
    });

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Create Notification Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create notification",
      },
      { status: 500 }
    );
  }
}
