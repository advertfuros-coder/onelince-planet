// app/api/seller/insights/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import AIInsight from "@/lib/db/models/AIInsight";
import { verifyToken } from "@/lib/utils/auth";

// GET - Fetch AI insights
export async function GET(request) {
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    let query = { sellerId: decoded.userId, isValid: true };
    if (type) query.type = type;
    if (status) query.status = status;

    const insights = await AIInsight.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(50);

    // Get stats
    const stats = {
      total: insights.length,
      byPriority: {
        critical: insights.filter((i) => i.priority === "critical").length,
        high: insights.filter((i) => i.priority === "high").length,
        medium: insights.filter((i) => i.priority === "medium").length,
        low: insights.filter((i) => i.priority === "low").length,
      },
      actedUpon: insights.filter((i) => i.status === "acted_upon").length,
    };

    return NextResponse.json({
      success: true,
      insights,
      stats,
    });
  } catch (error) {
    console.error("Insights GET Error:", error);
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

// POST - Generate or update insight
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

    const { action, insightId, data } = await request.json();

    if (action === "generate") {
      // Generate new AI insight
      const insight = await AIInsight.create({
        ...data,
        sellerId: decoded.userId,
      });

      return NextResponse.json({
        success: true,
        message: "Insight generated successfully",
        insight,
      });
    } else if (action === "mark_viewed" && insightId) {
      const insight = await AIInsight.findById(insightId);
      if (insight && insight.sellerId.toString() === decoded.userId) {
        await insight.markAsViewed();
        return NextResponse.json({ success: true, insight });
      }
    } else if (action === "mark_acted" && insightId) {
      const insight = await AIInsight.findById(insightId);
      if (insight && insight.sellerId.toString() === decoded.userId) {
        await insight.markAsActedUpon(data.recommendationIndex);
        return NextResponse.json({ success: true, insight });
      }
    } else if (action === "feedback" && insightId) {
      const insight = await AIInsight.findById(insightId);
      if (insight && insight.sellerId.toString() === decoded.userId) {
        await insight.addFeedback(data);
        return NextResponse.json({ success: true, insight });
      }
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Insights POST Error:", error);
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
