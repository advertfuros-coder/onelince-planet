import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import SubscriptionPlan from "@/lib/db/models/SubscriptionPlan";
import { verifyToken } from "@/lib/utils/auth";

/**
 * GET /api/admin/subscription-plans/[id]
 * Get a single subscription plan
 */
export async function GET(request, { params }) {
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
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const plan = await SubscriptionPlan.findById(params.id);

    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      plan: plan.getFullDetails(),
    });
  } catch (error) {
    console.error("❌ Get plan error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/subscription-plans/[id]
 * Update a subscription plan
 */
export async function PUT(request, { params }) {
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
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const updateData = await request.json();

    const plan = await SubscriptionPlan.findById(params.id);

    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Plan not found" },
        { status: 404 }
      );
    }

    // Update plan fields
    Object.keys(updateData).forEach((key) => {
      if (key !== "_id" && key !== "createdAt" && key !== "createdBy") {
        plan[key] = updateData[key];
      }
    });

    plan.updatedBy = decoded.userId;
    await plan.save();

    console.log(`✅ Plan updated: ${plan.displayName} by ${decoded.userId}`);

    return NextResponse.json({
      success: true,
      message: "Plan updated successfully",
      plan: plan.getFullDetails(),
    });
  } catch (error) {
    console.error("❌ Update plan error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/subscription-plans/[id]
 * Delete (archive) a subscription plan
 */
export async function DELETE(request, { params }) {
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
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const plan = await SubscriptionPlan.findById(params.id);

    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Plan not found" },
        { status: 404 }
      );
    }

    // Don't actually delete, just archive
    plan.status = "archived";
    plan.isVisible = false;
    plan.updatedBy = decoded.userId;
    await plan.save();

    console.log(`✅ Plan archived: ${plan.displayName} by ${decoded.userId}`);

    return NextResponse.json({
      success: true,
      message: "Plan archived successfully",
    });
  } catch (error) {
    console.error("❌ Delete plan error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
