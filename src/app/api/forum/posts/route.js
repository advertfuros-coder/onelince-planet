// app/api/forum/posts/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import ForumPost from "@/lib/db/models/ForumPost";
import ForumReply from "@/lib/db/models/ForumReply";
import { verifyToken } from "@/lib/utils/auth";

// GET - Fetch all forum posts
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    let query = { status: "published" };
    if (category && category !== "all") query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const posts = await ForumPost.find(query)
      .populate("authorId", "name email")
      .populate("lastReplyBy", "name")
      .sort({ isPinned: -1, isFeatured: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await ForumPost.countDocuments(query);

    // Get stats
    const stats = {
      total: await ForumPost.countDocuments({ status: "published" }),
      byCategory: await ForumPost.aggregate([
        { $match: { status: "published" } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
    };

    return NextResponse.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats,
    });
  } catch (error) {
    console.error("Forum GET Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Create new forum post
export async function POST(request) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Seller access required" },
        { status: 403 }
      );
    }

    const postData = await request.json();

    const post = await ForumPost.create({
      ...postData,
      authorId: decoded.userId,
      authorType: "seller",
    });

    return NextResponse.json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Forum POST Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
