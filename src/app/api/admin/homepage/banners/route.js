import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import HomepageBanner from "@/lib/db/models/HomepageBanner";
import { verifyToken, isAdmin } from "@/lib/utils/adminAuth";

export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const banners = await HomepageBanner.find().sort({ order: 1 });
    return NextResponse.json({ success: true, banners });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const data = await request.json();

    // If id exists, update, otherwise create
    if (data._id) {
      const banner = await HomepageBanner.findByIdAndUpdate(data._id, data, {
        new: true,
      });
      return NextResponse.json({ success: true, banner });
    } else {
      const banner = await HomepageBanner.create(data);
      return NextResponse.json({ success: true, banner });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    await connectDB();
    await HomepageBanner.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Banner deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
