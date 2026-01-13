import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import HomepageBanner from "@/lib/db/models/HomepageBanner";

export async function GET() {
  try {
    await connectDB();
    const banners = await HomepageBanner.find({ active: true }).sort({
      order: 1,
    });
    return NextResponse.json({ success: true, banners });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
