// app/api/seller/notifications/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Notification from "@/lib/db/models/Notification";
import { verifyToken } from "@/lib/utils/auth";

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    const decoded = verifyToken(token);
    if (!decoded)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );

    const { id } = params;
    const notification = await Notification.findOne({
      _id: id,
      userId: decoded.userId,
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, message: "Notification not found" },
        { status: 404 }
      );
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    const decoded = verifyToken(token);
    if (!decoded)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );

    const { id } = params;
    await Notification.deleteOne({ _id: id, userId: decoded.userId });

    return NextResponse.json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
