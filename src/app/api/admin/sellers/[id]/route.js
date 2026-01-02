// app/api/admin/sellers/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Seller from "@/lib/db/models/Seller";
import Product from "@/lib/db/models/Product";
import Order from "@/lib/db/models/Order";
import { verifyToken, isAdmin } from "@/lib/utils/adminAuth";

// Get single seller with details
export async function GET(request, { params }) {
  try {
    await connectDB();

    // Unwrap params
    const { id } = await params;

    const seller = await Seller.findById(id).populate(
      "userId",
      "name email phone"
    );
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller not found" },
        { status: 404 }
      );
    }

    const stats = {
      productCount: seller.salesStats?.productCount || 0,
      orderCount: seller.salesStats?.orderCount || 0,
      totalRevenue: seller.salesStats?.totalRevenue || 0,
      performance: seller.performance || {},
    };

    return NextResponse.json({ success: true, seller, stats });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// Update seller
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      businessName,
      tier,
      isActive,
      isVerified,
      verificationStatus,
      commission,
      bankDetails,
      pickupAddress,
      storeInfo,
      documents,
      verificationSteps,
      ratings,
      salesStats,
      performance,
      warehouses,
      subscriptionPlan,
      rejectionReason,
    } = body;

    // Unwrap params
    const { id } = await params;

    const seller = await Seller.findById(id);
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller not found" },
        { status: 404 }
      );
    }

    // Track what changed for activity log
    const changes = [];
    if (isActive !== undefined && seller.isActive !== isActive) {
      changes.push(isActive ? "Account activated" : "Account suspended");
    }
    if (isVerified !== undefined && seller.isVerified !== isVerified) {
      changes.push(isVerified ? "Seller verified" : "Verification revoked");
    }
    if (
      verificationStatus &&
      seller.verificationStatus !== verificationStatus
    ) {
      changes.push(`Verification status changed to ${verificationStatus}`);
    }

    // Update seller - only update fields that are provided
    if (businessName !== undefined) seller.businessName = businessName;
    if (tier !== undefined) seller.tier = tier;
    if (isActive !== undefined) seller.isActive = isActive;
    if (isVerified !== undefined) seller.isVerified = isVerified;
    if (verificationStatus !== undefined)
      seller.verificationStatus = verificationStatus;
    if (commission !== undefined) seller.commission = commission;
    if (bankDetails !== undefined) seller.bankDetails = bankDetails;
    if (pickupAddress !== undefined) seller.pickupAddress = pickupAddress;
    if (storeInfo !== undefined) seller.storeInfo = storeInfo;
    if (documents !== undefined) seller.documents = documents;
    if (verificationSteps !== undefined)
      seller.verificationSteps = verificationSteps;
    if (ratings !== undefined) seller.ratings = ratings;
    if (salesStats !== undefined) seller.salesStats = salesStats;
    if (performance !== undefined) seller.performance = performance;
    if (warehouses !== undefined) seller.warehouses = warehouses;
    if (subscriptionPlan !== undefined)
      seller.subscriptionPlan = subscriptionPlan;
    if (rejectionReason !== undefined) seller.rejectionReason = rejectionReason;

    // Add activity log if there were changes
    if (changes.length > 0) {
      if (!seller.activityLogs) seller.activityLogs = [];
      seller.activityLogs.push({
        type: "admin",
        action: "Seller Updated",
        description: changes.join(", "),
        timestamp: new Date(),
        performedBy: decoded.userId,
      });
    }

    await seller.save();

    return NextResponse.json({
      success: true,
      message: "Seller updated successfully",
      seller,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

// Delete seller
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || !isAdmin(decoded)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Unwrap params
    const { id } = await params;

    const seller = await Seller.findByIdAndDelete(id);
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Seller deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
