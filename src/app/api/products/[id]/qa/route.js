// app/api/products/[id]/qa/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { verifyToken } from "@/lib/utils/auth";
import ProductQA from "@/lib/db/models/ProductQA";

// Get Q&A for product
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      ProductQA.find({ productId: id, status: "approved" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("question.askedBy", "name profilePicture")
        .populate("answers.answeredBy", "name profilePicture")
        .lean(),
      ProductQA.countDocuments({ productId: id, status: "approved" }),
    ]);

    return NextResponse.json({
      success: true,
      questions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get Q&A error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// Ask question
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

    const { question } = await request.json();

    if (!question || question.trim().length < 10) {
      return NextResponse.json(
        { success: false, message: "Question must be at least 10 characters" },
        { status: 400 }
      );
    }

    const qa = await ProductQA.create({
      productId: id,
      question: {
        text: question,
        askedBy: decoded.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Question posted successfully",
      qa,
    });
  } catch (error) {
    console.error("Post question error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
