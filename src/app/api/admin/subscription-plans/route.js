import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import SubscriptionPlan from "@/lib/db/models/SubscriptionPlan";
import { verifyToken } from "@/lib/utils/auth";

/**
 * GET /api/admin/subscription-plans
 * Get all subscription plans (admin only)
 */
export async function GET(request) {
  try {
    await connectDB();

    // Verify admin authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    // Get all plans (including drafts and archived)
    const plans = await SubscriptionPlan.find({}).sort({ sortOrder: 1 });

    return NextResponse.json({
      success: true,
      plans: plans.map((plan) => plan.getFullDetails()),
      total: plans.length,
    });
  } catch (error) {
    console.error("❌ Get plans error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/subscription-plans
 * Create a new subscription plan (admin only)
 */
export async function POST(request) {
  try {
    await connectDB();

    // Verify admin authentication
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const planData = await request.json();

    // Validate required fields
    if (!planData.name || !planData.displayName) {
      return NextResponse.json(
        { success: false, message: "Name and display name are required" },
        { status: 400 }
      );
    }

    // Check if plan with same name already exists
    const existingPlan = await SubscriptionPlan.findOne({
      name: planData.name.toLowerCase(),
    });

    if (existingPlan) {
      return NextResponse.json(
        { success: false, message: "Plan with this name already exists" },
        { status: 400 }
      );
    }

    // Create new plan
    const newPlan = new SubscriptionPlan({
      ...planData,
      createdBy: decoded.userId,
      updatedBy: decoded.userId,
    });

    await newPlan.save();

    console.log(`✅ Plan created: ${newPlan.displayName} by ${decoded.userId}`);

    return NextResponse.json({
      success: true,
      message: "Plan created successfully",
      plan: newPlan.getFullDetails(),
    });
  } catch (error) {
    console.error("❌ Create plan error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
