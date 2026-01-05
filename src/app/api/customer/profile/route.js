import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";
import { verifyToken } from "@/lib/utils/auth";

export async function GET(request) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = decoded.id;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
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
    const body = await request.json();

    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = decoded.id;

    // List of allowed fields to update
    const allowedUpdates = [
      "name",
      "phone",
      "gender",
      "profilePicture",
      "addresses",
    ];
    const updates = {};

    Object.keys(body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
