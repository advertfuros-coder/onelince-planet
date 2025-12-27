// app/api/auth/verify-otp/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";
import bcrypt from "bcryptjs";

// Import otpStore from send-otp route
// Note: In production, use Redis or database instead of in-memory storage
let otpStore = new Map();

// Function to set otpStore (called from send-otp)
export function setOTPStore(store) {
  otpStore = store;
}

export async function POST(request) {
  try {
    await connectDB();

    const { email, otp, newPassword } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Get OTP from store
    const storedData = otpStore.get(email);

    if (!storedData) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP not found or expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    // Check expiry
    if (Date.now() > storedData.expiryTime) {
      otpStore.delete(email);
      return NextResponse.json(
        {
          success: false,
          message: "OTP has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    // Check attempts (max 3)
    if (storedData.attempts >= 3) {
      otpStore.delete(email);
      return NextResponse.json(
        {
          success: false,
          message: "Too many failed attempts. Please request a new OTP.",
        },
        { status: 400 }
      );
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      storedData.attempts += 1;
      otpStore.set(email, storedData);

      return NextResponse.json(
        {
          success: false,
          message: `Invalid OTP. ${
            3 - storedData.attempts
          } attempts remaining.`,
          attemptsRemaining: 3 - storedData.attempts,
        },
        { status: 400 }
      );
    }

    // OTP is valid - update password if provided
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          {
            success: false,
            message: "Password must be at least 6 characters long",
          },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await User.findOneAndUpdate(
        { email },
        {
          password: hashedPassword,
          requirePasswordChange: false, // Remove password change requirement
        }
      );

      // Clear OTP from store
      otpStore.delete(email);

      return NextResponse.json({
        success: true,
        message: "Password updated successfully",
      });
    }

    // Just verify OTP without changing password
    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
