// app/api/seller/training/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import SellerTraining from "@/lib/db/models/SellerTraining";
import { verifyToken } from "@/lib/utils/auth";

// GET - Fetch training progress
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

    let training = await SellerTraining.findOne({ sellerId: decoded.userId });

    if (!training) {
      training = await SellerTraining.create({
        sellerId: decoded.userId,
        onboarding: {
          steps: [
            {
              stepNumber: 1,
              title: "Create Your Store",
              description: "Set up your seller profile",
            },
            {
              stepNumber: 2,
              title: "Add First Product",
              description: "List your first product",
            },
            {
              stepNumber: 3,
              title: "Set Up Payment",
              description: "Configure payment methods",
            },
            {
              stepNumber: 4,
              title: "Configure Shipping",
              description: "Set shipping options",
            },
            {
              stepNumber: 5,
              title: "Upload Documents",
              description: "Submit verification documents",
            },
          ],
        },
        courses: [
          {
            courseId: "basics-101",
            title: "E-commerce Essentials",
            description:
              "Master the fundamentals of online selling and customer psychology.",
            category: "basics",
            lessons: [
              { title: "Market Dynamics", duration: 15, type: "video" },
              { title: "Product Positioning", duration: 20, type: "article" },
            ],
          },
          {
            courseId: "ops-201",
            title: "Logistics Architecture",
            description:
              "Optimizing your supply chain and fulfillment efficiency.",
            category: "operations",
            lessons: [
              { title: "Warehouse Management", duration: 30, type: "video" },
              { title: "Last-Mile Delivery", duration: 25, type: "article" },
            ],
          },
        ],
      });
    }

    return NextResponse.json({
      success: true,
      training,
    });
  } catch (error) {
    console.error("Training GET Error:", error);
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

// POST - Update training progress
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

    const { action, data } = await request.json();

    let training = await SellerTraining.findOne({ sellerId: decoded.userId });
    if (!training) {
      return NextResponse.json(
        { success: false, message: "Training record not found" },
        { status: 404 }
      );
    }

    switch (action) {
      case "complete_onboarding_step":
        await training.completeOnboardingStep(data.stepNumber);
        break;

      case "complete_lesson":
        await training.completeLesson(
          data.courseId,
          data.lessonId,
          data.timeSpent,
          data.quizScore
        );
        break;

      case "add_achievement":
        await training.addAchievement(
          data.type,
          data.title,
          data.description,
          data.points
        );
        break;

      case "update_streak":
        await training.updateStreak();
        break;

      default:
        return NextResponse.json(
          { success: false, message: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: "Training updated successfully",
      training,
    });
  } catch (error) {
    console.error("Training POST Error:", error);
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
