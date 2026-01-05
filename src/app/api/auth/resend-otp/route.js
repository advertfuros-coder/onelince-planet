// app/api/auth/resend-otp/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";
import OTP from "@/lib/db/models/OTP";
import emailService from "@/lib/email/emailService";
import { generateOTPEmail } from "@/lib/email/templates/otpEmail";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
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

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in DB
    await OTP.deleteMany({ email });
    await OTP.create({
      email,
      otp,
      expiresAt: expiryTime,
    });

    // Send Email
    const emailHtml = generateOTPEmail({
      name: user.name,
      otp,
      expiryMinutes: 10,
    });

    const result = await emailService.sendEmail({
      to: email,
      subject: "Your New Verification Code - Online Planet",
      html: emailHtml,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "New verification code sent to your email",
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Failed to send email", error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Resend OTP error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
