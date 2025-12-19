// app/api/ai/chat/route.js
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/utils/auth";
import AIChatbotService from "@/lib/services/aiChatbot";

export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    const body = await request.json();
    const { message, context = {}, userType = "customer" } = body;

    // Initialize chatbot
    const chatbot = new AIChatbotService(userType);

    //  Add user info to context
    if (decoded) {
      context.user = {
        id: decoded.userId,
        role: decoded.role,
        ...context.user,
      };
    }

    // Get response
    const response = await chatbot.chat(message, context);

    return NextResponse.json(response);
  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Sorry, I encountered an error. Please try again.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// Get quick replies
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get("userType") || "customer";

    const chatbot = new AIChatbotService(userType);
    const quickReplies = await chatbot.generateQuickReplies({ userType });

    return NextResponse.json({
      success: true,
      quickReplies,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
