// app/api/auth/login/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";
import Seller from "@/lib/db/models/Seller";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Please provide email and password" },
        { status: 400 }
      );
    }

    // Find user with password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!user.isVerified) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please verify your email before logging in. Check your email for verification code.",
          requiresVerification: true,
          email: user.email,
        },
        { status: 403 }
      );
    }

    // If seller, check verification status
    if (user.role === "seller") {
      const seller = await Seller.findOne({ userId: user._id });

      if (!seller) {
        return NextResponse.json(
          { success: false, message: "Seller profile not found" },
          { status: 404 }
        );
      }

      if (seller.verificationStatus !== "approved") {
        return NextResponse.json(
          {
            success: false,
            message: `Your seller account is ${seller.verificationStatus}. Please wait for admin approval.`,
          },
          { status: 403 }
        );
      }
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        userId: user._id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        requirePasswordChange: user.requirePasswordChange,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
