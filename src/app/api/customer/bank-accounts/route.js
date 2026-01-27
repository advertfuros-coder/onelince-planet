// app/api/customer/bank-accounts/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";
import { verifyToken } from "@/lib/utils/auth";

/**
 * Get customer's saved bank accounts
 * GET /api/customer/bank-accounts
 */
export async function GET(request) {
  try {
    await connectDB();

    // Auth check
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "customer") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Return bank accounts with masked account numbers
    const bankAccounts = (user.savedBankAccounts || []).map((account) => ({
      _id: account._id,
      accountHolderName: account.accountHolderName,
      accountNumber: `***${account.accountNumber.slice(-4)}`, // Masked
      accountNumberFull: account.accountNumber, // For validation only
      ifscCode: account.ifscCode,
      bankName: account.bankName,
      accountType: account.accountType,
      isDefault: account.isDefault,
      isVerified: account.isVerified,
      verifiedAt: account.verifiedAt,
      razorpayFundAccountId: account.razorpayFundAccountId,
      addedAt: account.addedAt,
      lastUsedAt: account.lastUsedAt,
    }));

    return NextResponse.json({
      success: true,
      bankAccounts,
      count: bankAccounts.length,
    });
  } catch (error) {
    console.error("Get bank accounts error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

/**
 * Set default bank account
 * PUT /api/customer/bank-accounts
 */
export async function PUT(request) {
  try {
    await connectDB();

    // Auth check
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "customer") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { accountId } = body;

    if (!accountId) {
      return NextResponse.json(
        { success: false, message: "Account ID is required" },
        { status: 400 },
      );
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Find the account
    const account = user.savedBankAccounts?.id(accountId);
    if (!account) {
      return NextResponse.json(
        { success: false, message: "Bank account not found" },
        { status: 404 },
      );
    }

    // Set all accounts to non-default
    user.savedBankAccounts.forEach((acc) => {
      acc.isDefault = false;
    });

    // Set selected account as default
    account.isDefault = true;

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Default bank account updated",
    });
  } catch (error) {
    console.error("Set default bank account error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

/**
 * Delete bank account
 * DELETE /api/customer/bank-accounts
 */
export async function DELETE(request) {
  try {
    await connectDB();

    // Auth check
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== "customer") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json(
        { success: false, message: "Account ID is required" },
        { status: 400 },
      );
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Remove the account
    const accountIndex = user.savedBankAccounts?.findIndex(
      (acc) => acc._id.toString() === accountId,
    );

    if (accountIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Bank account not found" },
        { status: 404 },
      );
    }

    const wasDefault = user.savedBankAccounts[accountIndex].isDefault;
    user.savedBankAccounts.splice(accountIndex, 1);

    // If deleted account was default, make first account default
    if (wasDefault && user.savedBankAccounts.length > 0) {
      user.savedBankAccounts[0].isDefault = true;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Bank account deleted",
    });
  } catch (error) {
    console.error("Delete bank account error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
