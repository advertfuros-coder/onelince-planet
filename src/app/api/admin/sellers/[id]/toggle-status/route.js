import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Seller from "@/lib/db/models/Seller";
import User from "@/lib/db/models/User";
import { verifyToken, isAdmin } from "@/lib/utils/adminAuth";
import bcrypt from "bcryptjs";
import emailService from "@/lib/email/emailService";
import { generateSellerApprovalEmail } from "@/lib/email/templates/sellerApproval";

export async function PATCH(request, { params }) {
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

    // Await params before accessing params.id
    const { id } = await params;

    const seller = await Seller.findById(id).populate("userId");
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller not found" },
        { status: 404 }
      );
    }

    const wasInactive = !seller.isActive;
    seller.isActive = !seller.isActive;

    // If activating seller, generate temporary password and send email
    if (wasInactive && seller.isActive) {
      // Generate temporary password (random 8 characters)
      const tempPassword = Math.random().toString(36).slice(-8).toUpperCase();

      // Hash and update user password
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      await User.findByIdAndUpdate(seller.userId._id, {
        password: hashedPassword,
        requirePasswordChange: true, // Flag to force password change on first login
      });

      // Update seller verification status
      seller.verificationStatus = "approved";
      seller.isVerified = true;

      // Send approval email with credentials
      try {
        const emailHtml = generateSellerApprovalEmail({
          sellerName: seller.userId.name,
          email: seller.userId.email,
          password: tempPassword,
          businessName: seller.businessInfo?.businessName,
          dashboardUrl: `${
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"
          }/seller/dashboard`,
        });

        const emailResult = await emailService.sendEmail({
          to: seller.userId.email,
          subject: "🎉 Your Seller Account is Approved - Start Selling Now!",
          html: emailHtml,
        });

        if (emailResult.success) {
          console.log("✅ Approval email sent to:", seller.userId.email);
          if (emailResult.previewUrl) {
            console.log("📧 Email preview:", emailResult.previewUrl);
          }
        }
      } catch (emailError) {
        console.error("❌ Email sending error:", emailError);
        // Don't fail the activation if email fails
      }
    }

    await seller.save();

    return NextResponse.json({
      success: true,
      message: `Seller ${
        seller.isActive ? "activated and approval email sent" : "deactivated"
      } successfully`,
      seller,
    });
  } catch (error) {
    console.error("Toggle seller status error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
