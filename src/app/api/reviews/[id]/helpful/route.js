// app/api/reviews/[id]/helpful/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { verifyToken } from "@/lib/utils/auth";
import Review from "@/lib/db/models/Review";

export async function POST(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { helpful } = await request.json();
    const review = await Review.findById(id);

    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    if (helpful) {
      review.markHelpful(decoded.id);
    } else {
      review.markNotHelpful(decoded.id);
    }

    await review.save();

    return NextResponse.json({
      success: true,
      helpful: review.helpful.count,
      notHelpful: review.notHelpful.count,
    });
  } catch (error) {
    console.error("Mark helpful error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
