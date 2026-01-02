// app/api/seller/settings/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Seller from "@/lib/db/models/Seller";
import User from "@/lib/db/models/User";
import { verifyToken } from "@/lib/utils/auth";

export async function GET(request) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Seller access required" },
        { status: 403 }
      );
    }

    const [seller, user] = await Promise.all([
      Seller.findOne({ userId: decoded.userId }),
      User.findById(decoded.userId),
    ]);

    if (!seller || !user) {
      return NextResponse.json(
        { success: false, message: "Seller profile not found" },
        { status: 404 }
      );
    }

    // Construct settings object matching the frontend structure
    const settings = {
      profile: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: null, // Implement if image upload exists
      },
      store: {
        storeName: seller.storeInfo?.storeName || seller.businessInfo?.businessName,
        storeDescription: seller.storeInfo?.storeDescription || "",
        storeAddress: seller.pickupAddress?.addressLine1 || "",
        gstin: seller.businessInfo?.gstin,
        pan: seller.businessInfo?.pan,
      },
      notifications: {
        // Mock notifications as they aren't in schema yet
        orderNotifications: true,
        paymentNotifications: true,
        reviewNotifications: true,
        promotionalEmails: false,
        smsNotifications: true,
      },
      banking: {
        accountNumber: seller.bankDetails?.accountNumber || "",
        ifscCode: seller.bankDetails?.ifscCode || "",
        bankName: seller.bankDetails?.bankName || "",
        accountHolderName: seller.bankDetails?.accountHolderName || "",
      },
    };

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Settings GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "seller") {
      return NextResponse.json(
        { success: false, message: "Seller access required" },
        { status: 403 }
      );
    }

    const { section, data } = await request.json();
    // section: 'profile' | 'store' | 'banking' | 'notifications'

    const user = await User.findById(decoded.userId);
    const seller = await Seller.findOne({ userId: decoded.userId });

    if (section === "profile") {
      if (data.name) user.name = data.name;
      if (data.phone) user.phone = data.phone;
      // Email change usually requires verification, skipping for now
      await user.save();
    } else if (section === "store") {
      if (data.storeName) seller.storeInfo.storeName = data.storeName;
      if (data.storeDescription)
        seller.storeInfo.storeDescription = data.storeDescription;
      if (data.storeAddress)
        seller.pickupAddress.addressLine1 = data.storeAddress;

      // Allow updating GSTIN and PAN if they are provided
      if (data.gstin) seller.businessInfo.gstin = data.gstin.toUpperCase();
      if (data.pan) seller.businessInfo.pan = data.pan.toUpperCase();

      await seller.save();
    } else if (section === "banking") {
      if (data.accountNumber)
        seller.bankDetails.accountNumber = data.accountNumber;
      if (data.ifscCode)
        seller.bankDetails.ifscCode = data.ifscCode.toUpperCase();
      if (data.bankName) seller.bankDetails.bankName = data.bankName;
      if (data.accountHolderName)
        seller.bankDetails.accountHolderName = data.accountHolderName;

      // Also allow tax details in banking for convenience
      if (data.gstin) seller.businessInfo.gstin = data.gstin.toUpperCase();
      if (data.pan) seller.businessInfo.pan = data.pan.toUpperCase();

      await seller.save();
    }
    // Notifications would go here

    // Return updated settings
    return GET(request);
  } catch (error) {
    console.error("Settings PUT Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error: " + error.message },
      { status: 500 }
    );
  }
}
