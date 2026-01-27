// app/api/orders/[id]/validate-bank/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Order from "@/lib/db/models/Order";
import { verifyToken } from "@/lib/utils/auth";
import razorpayService from "@/lib/services/razorpayService";

/**
 * Validate bank account for COD refund
 * POST /api/orders/[id]/validate-bank
 */
export async function POST(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

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
    const { accountHolderName, accountNumber, ifscCode, accountType } = body;

    // Validate required fields
    if (!accountHolderName || !accountNumber || !ifscCode) {
      return NextResponse.json(
        { success: false, message: "All bank details are required" },
        { status: 400 },
      );
    }

    // Get Order
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    // Verify ownership
    if (order.customer.toString() !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    // Check if order is COD
    if (order.paymentMethod !== "COD" && order.paymentMethod !== "cod") {
      return NextResponse.json(
        {
          success: false,
          message: "Bank validation is only required for COD orders",
        },
        { status: 400 },
      );
    }

    // Validate bank account with Razorpay
    console.log(`🏦 Validating bank account for order ${order.orderNumber}`);

    const validation = await razorpayService.validateBankAccount({
      accountHolderName,
      accountNumber,
      ifscCode,
    });

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 400 },
      );
    }

    // Update return request with bank details
    if (!order.returnRequest) {
      order.returnRequest = {};
    }

    order.returnRequest.bankDetails = {
      accountHolderName,
      accountNumber,
      ifscCode,
      accountType: accountType || "savings",
      isVerified: validation.isValid,
      verifiedAt: validation.isValid ? new Date() : null,
      razorpayFundAccountId: validation.fundAccountId,
      validationId: validation.validationId,
      validationStatus: validation.status,
      validationUtr: validation.utr,
    };

    await order.save();

    // Save verified bank account to user profile for future use
    if (validation.isValid) {
      const User = (await import("@/lib/db/models/User")).default;
      const user = await User.findById(decoded.userId);

      if (user) {
        // Check if this account already exists
        const existingAccount = user.savedBankAccounts?.find(
          (acc) =>
            acc.accountNumber === accountNumber && acc.ifscCode === ifscCode,
        );

        if (!existingAccount) {
          // Add new bank account
          if (!user.savedBankAccounts) {
            user.savedBankAccounts = [];
          }

          // If this is the first account, make it default
          const isFirstAccount = user.savedBankAccounts.length === 0;

          user.savedBankAccounts.push({
            accountHolderName,
            accountNumber,
            ifscCode,
            accountType: accountType || "savings",
            isDefault: isFirstAccount,
            isVerified: true,
            verifiedAt: new Date(),
            razorpayFundAccountId: validation.fundAccountId,
            validationId: validation.validationId,
            validationUtr: validation.utr,
            addedAt: new Date(),
            lastUsedAt: new Date(),
          });

          await user.save();
          console.log(`✅ Bank account saved to user profile for future use`);
        } else {
          // Update last used timestamp
          existingAccount.lastUsedAt = new Date();
          await user.save();
          console.log(`✅ Existing bank account updated`);
        }
      }
    }

    console.log(
      `✅ Bank account ${validation.isValid ? "verified" : "validation initiated"} for order ${order.orderNumber}`,
    );

    return NextResponse.json({
      success: true,
      isVerified: validation.isValid,
      message: validation.message,
      validationId: validation.validationId,
      status: validation.status,
    });
  } catch (error) {
    console.error("Bank validation error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}

/**
 * Check bank validation status
 * GET /api/orders/[id]/validate-bank
 */
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    // Auth check
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    // Verify ownership
    if (
      order.customer.toString() !== decoded.userId &&
      decoded.role !== "admin"
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const bankDetails = order.returnRequest?.bankDetails;

    if (!bankDetails) {
      return NextResponse.json({
        success: true,
        isVerified: false,
        message: "No bank details found",
      });
    }

    // If already verified, return status
    if (bankDetails.isVerified) {
      return NextResponse.json({
        success: true,
        isVerified: true,
        message: "Bank account is verified",
        bankDetails: {
          accountHolderName: bankDetails.accountHolderName,
          accountNumber: `***${bankDetails.accountNumber.slice(-4)}`,
          ifscCode: bankDetails.ifscCode,
          verifiedAt: bankDetails.verifiedAt,
        },
      });
    }

    // Check validation status with Razorpay
    if (bankDetails.validationId) {
      const statusCheck = await razorpayService.checkValidationStatus(
        bankDetails.validationId,
      );

      if (statusCheck.success && statusCheck.isValid) {
        // Update order
        bankDetails.isVerified = true;
        bankDetails.verifiedAt = new Date();
        bankDetails.validationStatus = statusCheck.status;
        bankDetails.validationUtr = statusCheck.utr;
        await order.save();

        return NextResponse.json({
          success: true,
          isVerified: true,
          message: "Bank account verified successfully",
        });
      }

      return NextResponse.json({
        success: true,
        isVerified: false,
        status: statusCheck.status,
        message: "Bank validation in progress",
      });
    }

    return NextResponse.json({
      success: true,
      isVerified: false,
      message: "Bank validation not initiated",
    });
  } catch (error) {
    console.error("Check bank validation error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
