// app/api/admin/sellers/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Seller from "@/lib/db/models/Seller";
import User from "@/lib/db/models/User";
import Product from "@/lib/db/models/Product";
import Order from "@/lib/db/models/Order";
import { verifyToken, isAdmin } from "@/lib/utils/adminAuth";
import bcrypt from "bcryptjs";
import emailService from "@/lib/email/emailService";
import { generateSellerApprovalEmail } from "@/lib/email/templates/sellerApproval";

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

    // Support both flat and nested incoming data structure
    const fullNameValue =
      body.fullName !== undefined
        ? body.fullName
        : body.personalDetails?.fullName;
    const emailValue =
      body.email !== undefined ? body.email : body.personalDetails?.email;
    const phoneValue =
      body.phone !== undefined ? body.phone : body.personalDetails?.phone;
    const dobValue =
      body.dateOfBirth !== undefined
        ? body.dateOfBirth
        : body.personalDetails?.dateOfBirth;
    const resAddrValue =
      body.residentialAddress !== undefined
        ? body.residentialAddress
        : body.personalDetails?.residentialAddress;

    const bizNameValue =
      body.businessName !== undefined
        ? body.businessName
        : body.businessInfo?.businessName;
    const gstinValue =
      body.gstin !== undefined ? body.gstin : body.businessInfo?.gstin;
    const panValue = body.pan !== undefined ? body.pan : body.businessInfo?.pan;
    const bizTypeValue =
      body.businessType !== undefined
        ? body.businessType
        : body.businessInfo?.businessType;
    const bizCatValue =
      body.businessCategory !== undefined
        ? body.businessCategory
        : body.businessInfo?.businessCategory;
    const estYearValue =
      body.establishedYear !== undefined
        ? body.establishedYear
        : body.businessInfo?.establishedYear;

    const {
      tier,
      isActive,
      isVerified,
      verificationStatus,
      commission, // Mapped to commissionRate
      commissionRate,
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

      // Handle Approval Logic: Generate temporary password and send email
      if (
        verificationStatus === "approved" &&
        seller.verificationStatus !== "approved"
      ) {
        try {
          // Generate temporary password (random 8 characters)
          const tempPassword = Math.random()
            .toString(36)
            .slice(-8)
            .toUpperCase();

          // Hash password for user update
          const hashedPassword = await bcrypt.hash(tempPassword, 10);

          // Find and update the associated user
          const user = await User.findById(seller.userId);
          if (user) {
            user.password = hashedPassword;
            user.requirePasswordChange = true;
            user.isVerified = true;
            await user.save();

            // Send approval email
            const emailHtml = generateSellerApprovalEmail({
              sellerName: user.name,
              email: user.email,
              password: tempPassword,
              businessName: seller.businessInfo?.businessName || "Your Store",
              dashboardUrl: `${
                process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"
              }/seller/login`,
            });

            await emailService.sendEmail({
              to: user.email,
              subject:
                "🎉 Your Seller Account is Approved - Start Selling Now!",
              html: emailHtml,
            });

            changes.push(`Temporary password sent to ${user.email}`);
          }
        } catch (error) {
          console.error("Approval logic error:", error);
          // Don't fail the whole update if email fails, but log it
        }
      }
    }

    // Initialize nested objects if they don't exist
    if (!seller.personalDetails) seller.personalDetails = {};
    if (!seller.businessInfo) seller.businessInfo = {};

    // Update Personal Details
    if (fullNameValue !== undefined)
      seller.personalDetails.fullName = fullNameValue;
    if (emailValue !== undefined) seller.personalDetails.email = emailValue;
    if (phoneValue !== undefined) seller.personalDetails.phone = phoneValue;
    if (dobValue !== undefined) seller.personalDetails.dateOfBirth = dobValue;
    if (resAddrValue !== undefined) {
      seller.personalDetails.residentialAddress = {
        ...seller.personalDetails.residentialAddress,
        ...resAddrValue,
      };
    }

    // Update Business Info
    if (bizNameValue !== undefined)
      seller.businessInfo.businessName = bizNameValue;
    if (gstinValue !== undefined) seller.businessInfo.gstin = gstinValue;
    if (panValue !== undefined) seller.businessInfo.pan = panValue;
    if (bizTypeValue !== undefined)
      seller.businessInfo.businessType = bizTypeValue;
    if (bizCatValue !== undefined)
      seller.businessInfo.businessCategory = bizCatValue;
    if (estYearValue !== undefined)
      seller.businessInfo.establishedYear = estYearValue;

    // Update Root Fields
    if (tier !== undefined) seller.tier = tier;
    if (isActive !== undefined) seller.isActive = isActive;
    if (isVerified !== undefined) seller.isVerified = isVerified;
    if (verificationStatus !== undefined)
      seller.verificationStatus = verificationStatus;

    // Handle Commission (support both names)
    if (commissionRate !== undefined) seller.commissionRate = commissionRate;
    else if (commission !== undefined) seller.commissionRate = commission;

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
        performedBy: decoded.userId || decoded.id,
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
