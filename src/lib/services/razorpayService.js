// lib/services/razorpayService.js
import Razorpay from "razorpay";
import crypto from "crypto";

class RazorpayService {
  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  }

  /**
   * Create Razorpay order
   */
  async createOrder(amount, currency = "INR", receipt, notes = {}) {
    try {
      const options = {
        amount: Math.round(amount * 100), // Amount in paise
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
        notes: {
          ...notes,
          created_by: "Online Planet",
        },
      };

      const order = await this.razorpay.orders.create(options);
      console.log("Razorpay order created:", order.id);

      return {
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      };
    } catch (error) {
      console.error("Razorpay order creation error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Verify payment signature
   */
  verifyPaymentSignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  ) {
    try {
      const text = `${razorpayOrderId}|${razorpayPaymentId}`;
      const generated_signature = crypto
        .createHmac("sha256", this.razorpay.key_secret)
        .update(text)
        .digest("hex");

      const isValid = generated_signature === razorpaySignature;

      if (isValid) {
        console.log("Payment signature verified successfully");
      } else {
        console.error("Payment signature verification failed");
      }

      return isValid;
    } catch (error) {
      console.error("Signature verification error:", error);
      return false;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(body, signature) {
    try {
      const expectedSignature = crypto
        .createHmac("sha256", this.webhookSecret)
        .update(JSON.stringify(body))
        .digest("hex");

      return expectedSignature === signature;
    } catch (error) {
      console.error("Webhook signature verification error:", error);
      return false;
    }
  }

  /**
   * Fetch payment details
   */
  async getPayment(paymentId) {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return {
        success: true,
        payment,
      };
    } catch (error) {
      console.error("Fetch payment error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Capture payment
   */
  async capturePayment(paymentId, amount) {
    try {
      const payment = await this.razorpay.payments.capture(
        paymentId,
        Math.round(amount * 100), // Amount in paise
        "INR",
      );

      console.log("Payment captured:", paymentId);
      return {
        success: true,
        payment,
      };
    } catch (error) {
      console.error("Payment capture error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(paymentId, amount = null, notes = {}) {
    try {
      const options = {
        ...(amount && { amount: Math.round(amount * 100) }), // If amount specified, partial refund
        notes: {
          ...notes,
          refunded_by: "Online Planet",
        },
      };

      const refund = await this.razorpay.payments.refund(paymentId, options);

      console.log("Refund processed:", refund.id);
      return {
        success: true,
        refund,
      };
    } catch (error) {
      console.error("Refund error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get refund details
   */
  async getRefund(paymentId, refundId) {
    try {
      const refund = await this.razorpay.payments.fetchRefund(
        paymentId,
        refundId,
      );
      return {
        success: true,
        refund,
      };
    } catch (error) {
      console.error("Fetch refund error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get all refunds for a payment
   */
  async getAllRefunds(paymentId) {
    try {
      const refunds =
        await this.razorpay.payments.fetchMultipleRefund(paymentId);
      return {
        success: true,
        refunds: refunds.items,
      };
    } catch (error) {
      console.error("Fetch refunds error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create payout (for seller payments)
   */
  async createPayout(
    amount,
    account,
    mode = "IMPS",
    purpose = "payout",
    notes = {},
  ) {
    try {
      const options = {
        account_number: process.env.RAZORPAY_ACCOUNT_NUMBER, // Your account
        amount: Math.round(amount * 100),
        currency: "INR",
        mode,
        purpose,
        fund_account_id: account.fund_account_id,
        queue_if_low_balance: true,
        reference_id: `payout_${Date.now()}`,
        notes: {
          ...notes,
          created_by: "Online Planet",
        },
      };

      const payout = await this.razorpay.payouts.create(options);

      console.log("Payout created:", payout.id);
      return {
        success: true,
        payout,
      };
    } catch (error) {
      console.error("Payout creation error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create fund account for seller
   */
  async createFundAccount(sellerId, accountDetails) {
    try {
      const contact = await this.razorpay.contacts.create({
        name: accountDetails.name,
        email: accountDetails.email,
        contact: accountDetails.phone,
        type: "vendor",
        reference_id: `seller_${sellerId}`,
        notes: {
          seller_id: sellerId,
        },
      });

      const fundAccount = await this.razorpay.fundAccount.create({
        contact_id: contact.id,
        account_type: accountDetails.account_type || "bank_account",
        bank_account: {
          name: accountDetails.account_holder_name,
          ifsc: accountDetails.ifsc,
          account_number: accountDetails.account_number,
        },
      });

      return {
        success: true,
        contact,
        fundAccount,
      };
    } catch (error) {
      console.error("Fund account creation error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Fetch order by ID
   */
  async fetchOrder(orderId) {
    try {
      const order = await this.razorpay.orders.fetch(orderId);
      return {
        success: true,
        order,
      };
    } catch (error) {
      console.error("Fetch order error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get all payments for an order
   */
  async getOrderPayments(orderId) {
    try {
      const payments = await this.razorpay.orders.fetchPayments(orderId);
      return {
        success: true,
        payments: payments.items,
      };
    } catch (error) {
      console.error("Fetch order payments error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate payment link
   */
  async createPaymentLink(
    amount,
    description,
    customer,
    referenceId,
    notes = {},
  ) {
    try {
      const options = {
        amount: Math.round(amount * 100),
        currency: "INR",
        description,
        customer: {
          name: customer.name,
          email: customer.email,
          contact: customer.phone,
        },
        reference_id: referenceId,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
        callback_method: "get",
        notes,
      };

      const link = await this.razorpay.paymentLink.create(options);

      console.log("Payment link created:", link.id);
      return {
        success: true,
        link,
      };
    } catch (error) {
      console.error("Payment link creation error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Validate bank account details using Razorpay Fund Account Validation
   * Sends ₹1 to the account to verify it's valid
   */
  async validateBankAccount(bankDetails) {
    try {
      const { accountHolderName, accountNumber, ifscCode } = bankDetails;

      console.log("🏦 Validating bank account:", {
        accountNumber: `***${accountNumber.slice(-4)}`,
        ifscCode,
      });

      // Step 1: Create a contact (customer)
      const contact = await this.razorpay.contacts.create({
        name: accountHolderName,
        type: "customer",
        reference_id: `contact_${Date.now()}`,
      });

      console.log("✅ Contact created:", contact.id);

      // Step 2: Create a fund account
      const fundAccount = await this.razorpay.fundAccount.create({
        contact_id: contact.id,
        account_type: "bank_account",
        bank_account: {
          name: accountHolderName,
          ifsc: ifscCode,
          account_number: accountNumber,
        },
      });

      console.log("✅ Fund account created:", fundAccount.id);

      // Step 3: Validate the fund account (sends ₹1 to verify)
      const validation = await this.razorpay.fundAccount.validate({
        fund_account_id: fundAccount.id,
        amount: 100, // ₹1 in paise (100 paise = ₹1)
        currency: "INR",
        notes: {
          purpose: "Bank account validation for COD refund",
        },
      });

      console.log("✅ Validation initiated:", validation.id);

      // Return validation details
      return {
        success: true,
        isValid: validation.status === "completed",
        fundAccountId: fundAccount.id,
        validationId: validation.id,
        status: validation.status,
        utr: validation.utr,
        message:
          validation.status === "completed"
            ? "Bank account verified successfully. ₹1 has been sent to your account."
            : "Bank account validation in progress. Please wait...",
      };
    } catch (error) {
      console.error("❌ Bank validation error:", error);

      // Handle specific Razorpay errors
      if (error.error?.description) {
        return {
          success: false,
          isValid: false,
          message: error.error.description,
        };
      }

      return {
        success: false,
        isValid: false,
        message: "Failed to validate bank account. Please check your details.",
      };
    }
  }

  /**
   * Check validation status
   */
  async checkValidationStatus(validationId) {
    try {
      const validation =
        await this.razorpay.fundAccount.fetchValidation(validationId);

      return {
        success: true,
        status: validation.status,
        isValid: validation.status === "completed",
        utr: validation.utr,
      };
    } catch (error) {
      console.error("❌ Check validation status error:", error);
      return {
        success: false,
        message: "Failed to check validation status",
      };
    }
  }

  /**
   * Process refund to bank account (for COD orders)
   */
  async processBankTransfer(fundAccountId, amount, orderId) {
    try {
      console.log(
        `💰 Processing bank transfer: ₹${amount / 100} to fund account ${fundAccountId}`,
      );

      const payout = await this.razorpay.payouts.create({
        account_number: process.env.RAZORPAY_ACCOUNT_NUMBER, // Your Razorpay account
        fund_account_id: fundAccountId,
        amount: amount, // in paise
        currency: "INR",
        mode: "IMPS", // Instant transfer
        purpose: "refund",
        queue_if_low_balance: true,
        reference_id: `refund_${orderId}`,
        narration: `Refund for order ${orderId}`,
        notes: {
          order_id: orderId,
          type: "COD_refund",
        },
      });

      console.log("✅ Payout created:", payout.id);

      return {
        success: true,
        payoutId: payout.id,
        status: payout.status,
        utr: payout.utr,
        message: "Refund initiated successfully",
      };
    } catch (error) {
      console.error("❌ Bank transfer error:", error);

      if (error.error?.description) {
        return {
          success: false,
          message: error.error.description,
        };
      }

      return {
        success: false,
        message: "Failed to process bank transfer",
      };
    }
  }
}

const razorpayService = new RazorpayService();
export default razorpayService;
