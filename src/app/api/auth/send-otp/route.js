// app/api/auth/send-otp/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";
import emailService from "@/lib/email/emailService";
import { generateOTPEmail } from "@/lib/email/templates/otpEmail";

import OTP from "@/lib/db/models/OTP";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}

export async function POST(request) {
  try {
    await connectDB();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await OTP.deleteMany({ email }); // Clear old OTPs for this email
    await OTP.create({
      email,
      otp,
      expiresAt: expiryTime,
    });

    // Send OTP email
    try {
      const emailHtml = generateOTPEmail({
        name: user.name,
        otp,
        expiryMinutes: 10,
      });

      const emailResult = await emailService.sendEmail({
        to: email,
        subject: "Your OTP for Password Change - Online Planet",
        html: emailHtml,
      });

      if (emailResult.success) {
        console.log("✅ OTP sent to:", email);
        if (emailResult.previewUrl) {
          console.log("📧 Email preview:", emailResult.previewUrl);
        }

        return NextResponse.json({
          success: true,
          message: "OTP sent successfully to your email",
          previewUrl: emailResult.previewUrl, // Only for development
        });
      } else {
        throw new Error("Failed to send email");
      }
    } catch (emailError) {
      console.error("❌ Email error:", emailError);
      return NextResponse.json(
        { success: false, message: "Failed to send OTP email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}


