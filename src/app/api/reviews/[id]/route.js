// app/api/reviews/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Review from "@/lib/db/models/Review";
import { verifyToken } from "@/lib/utils/auth";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const review = await Review.findById(id)
      .populate("customer", "name avatar")
      .populate("product", "name images")
      .populate("reply.author", "name");

    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error("Get review error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
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

    const { id } = await params;
    const review = await Review.findById(id);

    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    const updates = await request.json();

    // If seller is replying to review
    if (updates.reply && decoded.role === "seller") {
      review.reply = {
        text: updates.reply,
        date: new Date(),
        author: decoded.id,
      };
    } else {
      // Customer updating their own review
      if (review.customer.toString() !== decoded.id) {
        return NextResponse.json(
          { success: false, message: "Not authorized" },
          { status: 403 }
        );
      }
      Object.assign(review, updates);
    }

    await review.save();

    return NextResponse.json({
      success: true,
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    console.error("Update review error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
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

    const review = await Review.findById(params.id);

    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    // Only customer who wrote review or admin can delete
    if (review.customer.toString() !== decoded.id && decoded.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }

    const { id } = await params;
    await Review.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
