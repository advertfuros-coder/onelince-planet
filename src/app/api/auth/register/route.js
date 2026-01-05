import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";
import OTP from "@/lib/db/models/OTP";
import emailService from "@/lib/email/emailService";
import { generateOTPEmail } from "@/lib/email/templates/otpEmail";

import bcrypt from "bcryptjs";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, email, password, phone } = body;
    const role = "customer"; // Force customer role, no admin creation via UI

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    // Check if a VERIFIED user already exists
    const verifiedUser = await User.findOne({ email, isVerified: true });
    if (verifiedUser) {
      return NextResponse.json(
        { success: false, message: "User already exists with this email" },
        { status: 400 }
      );
    }

    // Hash password for temporary storage
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate Verification OTP
    const otp = generateOTP();
    const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store Registration Data + OTP in OTP collection (Temporary)
    // This way we "never create any kind of database [User record]" for him until verified
    await OTP.deleteMany({ email });
    await OTP.create({
      email,
      otp,
      expiresAt: expiryTime,
      userData: {
        name,
        password: hashedPassword,
        phone,
        role
      }
    });

    // Send Verification Email
    try {
      const emailHtml = generateOTPEmail({
        name,
        otp,
        expiryMinutes: 1440, // 24 hours
      });

      const emailResult = await emailService.sendEmail({
        to: email,
        subject: "Verify Your Account - Online Planet",
        html: emailHtml,
      });

      if (emailResult.success) {
        console.log("✅ Verification email sent to:", email);
      } else {
        console.error("❌ Failed to send verification email:", emailResult.error);
      }
    } catch (emailError) {
      console.error("❌ Email sending exception:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Success! Please check your email for the verification code.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
