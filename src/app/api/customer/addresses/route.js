// app/api/customer/addresses/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";
import { verifyToken } from "@/lib/utils/auth";

// GET - Fetch all saved addresses for logged-in user
export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 },
      );
    }

    await dbConnect();
    const user = await User.findById(decoded.userId).select("addresses");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      addresses: user.addresses || [],
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch addresses",
      },
      { status: 500 },
    );
  }
}

// POST - Add new address
export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 },
      );
    }

    const addressData = await request.json();
    await dbConnect();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // If this is set as default, unset other defaults
    if (addressData.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    // If this is the first address, make it default
    if (user.addresses.length === 0) {
      addressData.isDefault = true;
    }

    user.addresses.push(addressData);
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Address added successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("Error adding address:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add address",
      },
      { status: 500 },
    );
  }
}
