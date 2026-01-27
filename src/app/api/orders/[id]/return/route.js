// app/api/orders/[id]/return/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import Order from "@/lib/db/models/Order";
import { verifyToken } from "@/lib/utils/auth";
import orderService from "@/lib/services/orderService";

/**
 * Request return
 * POST /api/orders/[id]/return
 */
export async function POST(request, { params }) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = params;
    const body = await request.json();
    const { reason, title, description, images } = body;

    if (!reason || !title) {
      return NextResponse.json(
        { success: false, message: "Reason and title are required" },
        { status: 400 },
      );
    }

    // Verify this is customer's order
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    if (order.customer.toString() !== decoded.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    // For COD orders, check for verified bank details
    const isCOD =
      order.paymentMethod === "COD" || order.paymentMethod === "cod";
    if (isCOD) {
      let bankDetails = order.returnRequest?.bankDetails;

      // If no bank details in order, try to use saved bank account from user profile
      if (!bankDetails || !bankDetails.isVerified) {
        const User = (await import("@/lib/db/models/User")).default;
        const user = await User.findById(decoded.id);

        if (
          user &&
          user.savedBankAccounts &&
          user.savedBankAccounts.length > 0
        ) {
          // Use default bank account or first verified account
          const defaultAccount = user.savedBankAccounts.find(
            (acc) => acc.isDefault && acc.isVerified,
          );
          const firstVerifiedAccount = user.savedBankAccounts.find(
            (acc) => acc.isVerified,
          );
          const savedAccount = defaultAccount || firstVerifiedAccount;

          if (savedAccount) {
            // Auto-populate bank details from saved account
            if (!order.returnRequest) {
              order.returnRequest = {};
            }

            order.returnRequest.bankDetails = {
              accountHolderName: savedAccount.accountHolderName,
              accountNumber: savedAccount.accountNumber,
              ifscCode: savedAccount.ifscCode,
              bankName: savedAccount.bankName,
              accountType: savedAccount.accountType,
              isVerified: true,
              verifiedAt: savedAccount.verifiedAt,
              razorpayFundAccountId: savedAccount.razorpayFundAccountId,
              validationId: savedAccount.validationId,
              validationUtr: savedAccount.validationUtr,
            };

            // Update last used timestamp
            savedAccount.lastUsedAt = new Date();
            await user.save();

            console.log(`✅ Using saved bank account for COD refund`);
            bankDetails = order.returnRequest.bankDetails;
          }
        }
      }

      // If still no verified bank details, require validation
      if (!bankDetails || !bankDetails.isVerified) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Please verify your bank account details first for COD refund",
            requiresBankValidation: true,
          },
          { status: 400 },
        );
      }
    }

    // Request return
    const result = await orderService.requestReturn(id, {
      reason,
      title,
      description,
      images,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: isCOD
        ? "Return request submitted. Refund will be processed to your verified bank account."
        : "Return request submitted successfully",
      order: result.order,
    });
  } catch (error) {
    console.error("Return request error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}

/**
 * Process return request (seller/admin)
 * PUT /api/orders/[id]/return
 */
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = params;
    const body = await request.json();
    const { action, reason, pickupDate, refundAmount } = body; // action: 'approved' or 'rejected'

    if (!action || !["approved", "rejected"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid action (approved/rejected) is required",
        },
        { status: 400 },
      );
    }

    // Verify user is seller or admin
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    const isSeller = order.items.some(
      (item) => item.seller.toString() === decoded.id,
    );
    const isAdmin = decoded.role === "admin";

    if (!isSeller && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    // Process return
    const result = await orderService.processReturnRequest(id, action, {
      reason,
      pickupDate,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 400 },
      );
    }

    // If approved and refund amount provided, process refund
    if (action === "approved" && refundAmount) {
      await orderService.processRefund(
        result.order,
        refundAmount,
        "Return approved",
      );
    }

    return NextResponse.json({
      success: true,
      message: `Return request ${action} successfully`,
      order: result.order,
    });
  } catch (error) {
    console.error("Process return error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 },
    );
  }
}
