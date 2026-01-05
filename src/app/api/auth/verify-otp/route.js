// app/api/auth/verify-otp/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";
import bcrypt from "bcryptjs";

import OTP from "@/lib/db/models/OTP";

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

    // Get OTP from database
    const storedData = await OTP.findOne({ email, used: false });

    if (!storedData) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP not found or already used. Please request a new one.",
        },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date() > storedData.expiresAt) {
      await OTP.deleteOne({ _id: storedData._id });
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
      await OTP.deleteOne({ _id: storedData._id });
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
      await storedData.save();

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

    // OTP is valid - mark as used
    storedData.used = true;
    await storedData.save();

    // CASE 1: New Registration Staged in OTP
    if (storedData.userData && storedData.userData.name) {
      const { name, password, phone, role } = storedData.userData;
      
      // Final check for verified exists
      const verifiedUser = await User.findOne({ email, isVerified: true });
      if (verifiedUser) {
        await OTP.deleteOne({ _id: storedData._id });
        return NextResponse.json({ success: false, message: "User already verified" }, { status: 400 });
      }

      // Create/Update the user record now that they are verified
      await User.findOneAndUpdate(
        { email },
        { 
          name, 
          password, 
          phone, 
          role, 
          isVerified: true,
          requirePasswordChange: false
        },
        { upsert: true, new: true }
      );

      await OTP.deleteOne({ _id: storedData._id });
      return NextResponse.json({
        success: true,
        message: "Account verified and created successfully! 🎉",
      });
    }

    // CASE 2: Password Reset (newPassword provided)
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
          requirePasswordChange: false,
          isVerified: true,
        }
      );

      // Clear OTP from database
      await OTP.deleteOne({ _id: storedData._id });

      return NextResponse.json({
        success: true,
        message: "Password updated successfully",
      });
    }

    // CASE 3: Standard Verification (e.g. login block verification)
    await User.findOneAndUpdate({ email }, { isVerified: true });

    // Just verify OTP without any other action
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
