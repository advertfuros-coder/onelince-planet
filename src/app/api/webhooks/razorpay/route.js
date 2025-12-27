import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db/mongodb";
import SellerSubscription from "@/lib/db/models/SellerSubscription";
import User from "@/lib/db/models/User";
import Seller from "@/lib/db/models/Seller";
import emailService from "@/lib/email/emailService";

/**
 * Razorpay Webhook Handler
 * Handles instant plan activation upon successful payment
 *
 * Events handled:
 * - payment.captured: Instant activation
 * - payment.failed: Notification
 * - subscription.activated: Recurring subscription start
 */
export async function POST(request) {
  try {
    await connectDB();

    // Get webhook signature and payload
    const signature = request.headers.get("x-razorpay-signature");
    const body = await request.text();

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature);
    if (!isValid) {
      console.error("❌ Invalid webhook signature");
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const payload = JSON.parse(body);
    const event = payload.event;
    const paymentData =
      payload.payload.payment?.entity || payload.payload.subscription?.entity;

    console.log(`📧 Razorpay Webhook: ${event}`);
    console.log(`💳 Payment ID: ${paymentData?.id}`);

    // Handle different webhook events
    switch (event) {
      case "payment.captured":
        await handlePaymentCaptured(paymentData, payload);
        break;

      case "payment.failed":
        await handlePaymentFailed(paymentData, payload);
        break;

      case "subscription.activated":
        await handleSubscriptionActivated(paymentData, payload);
        break;

      case "subscription.charged":
        await handleSubscriptionCharged(paymentData, payload);
        break;

      default:
        console.log(`ℹ️ Unhandled event: ${event}`);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    // Still return 200 to prevent Razorpay retries for our errors
    return NextResponse.json({ success: false, error: error.message });
  }
}

/**
 * Verify Razorpay webhook signature
 */
function verifyWebhookSignature(body, signature) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("❌ RAZORPAY_WEBHOOK_SECRET not configured");
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

/**
 * Handle successful payment - INSTANT ACTIVATION
 */
async function handlePaymentCaptured(payment, payload) {
  try {
    const startTime = Date.now();
    console.log("⚡ Starting instant activation...");

    // Extract metadata from payment
    const notes = payment.notes || {};
    const sellerId = notes.sellerId;
    const tier = notes.tier;
    const billingInterval = notes.billingInterval || "monthly";

    if (!sellerId || !tier) {
      console.error("❌ Missing sellerId or tier in payment notes");
      return;
    }

    // Find seller
    const seller = await User.findById(sellerId);
    if (!seller) {
      console.error(`❌ Seller not found: ${sellerId}`);
      return;
    }

    // Get or create subscription
    let subscription = await SellerSubscription.findOne({ sellerId });
    if (!subscription) {
      subscription = new SellerSubscription({ sellerId });
    }

    // Get tier features
    const tierFeatures = SellerSubscription.getTierFeatures(tier);

    // Update subscription
    const previousTier = subscription.tier;
    subscription.tier = tier;
    subscription.status = "active";
    subscription.features = tierFeatures;
    subscription.billing = {
      amount: tierFeatures.price,
      currency: payment.currency || "INR",
      interval: billingInterval,
      lastBillingDate: new Date(),
      nextBillingDate: calculateNextBillingDate(billingInterval),
      paymentMethod: "razorpay",
    };

    // Add to history
    subscription.history.push({
      tier: previousTier,
      startDate: subscription.createdAt || new Date(),
      endDate: new Date(),
      amount: subscription.billing.amount,
      status: "completed",
    });

    // Update metrics
    subscription.metrics.upgradeDate = new Date();
    subscription.metrics.monthsSubscribed += 1;

    await subscription.save();

    // Update seller model
    const sellerDoc = await Seller.findOne({ userId: sellerId });
    if (sellerDoc) {
      sellerDoc.subscriptionPlan = tier;
      sellerDoc.subscriptionStartDate = new Date();
      sellerDoc.subscriptionExpiry = subscription.billing.nextBillingDate;
      await sellerDoc.save();
    }

    const activationTime = Date.now() - startTime;
    console.log(`✅ Plan activated in ${activationTime}ms`);
    console.log(`📊 ${seller.email} upgraded: ${previousTier} → ${tier}`);

    // Update SubscriptionPlan analytics in real-time
    await updatePlanAnalytics(tier, tierFeatures.price);

    // Send confirmation email (async, don't wait)
    sendActivationEmail(seller, subscription, payment).catch((err) =>
      console.error("Email error:", err)
    );

    // Log successful activation
    await logSubscriptionEvent({
      sellerId,
      event: "plan_activated",
      tier,
      previousTier,
      amount: payment.amount / 100, // Convert paise to rupees
      paymentId: payment.id,
      activationTime,
    });
  } catch (error) {
    console.error("❌ Activation error:", error);
    throw error;
  }
}

/**
 * Update SubscriptionPlan analytics in real-time
 */
async function updatePlanAnalytics(tier, price) {
  try {
    const SubscriptionPlan = (await import("@/lib/db/models/SubscriptionPlan"))
      .default;

    const plan = await SubscriptionPlan.findOne({ name: tier });
    if (plan) {
      // Increment active subscribers
      plan.analytics.activeSubscribers =
        (plan.analytics.activeSubscribers || 0) + 1;
      plan.analytics.totalSubscribers =
        (plan.analytics.totalSubscribers || 0) + 1;

      // Update monthly revenue
      plan.analytics.monthlyRevenue =
        (plan.analytics.monthlyRevenue || 0) + price;

      await plan.save();
      console.log(`📊 Updated analytics for ${tier} plan`);
    }
  } catch (error) {
    console.error("❌ Analytics update error:", error);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(payment, payload) {
  try {
    const notes = payment.notes || {};
    const sellerId = notes.sellerId;

    if (!sellerId) return;

    const seller = await User.findById(sellerId);
    if (!seller) return;

    console.log(`❌ Payment failed for ${seller.email}`);

    // Send failure notification
    await emailService.sendEmail({
      to: seller.email,
      subject: "Payment Failed - Online Planet",
      html: generatePaymentFailedEmail(seller, payment),
    });

    // Log event
    await logSubscriptionEvent({
      sellerId,
      event: "payment_failed",
      reason: payment.error_description,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error("❌ Payment failed handler error:", error);
  }
}

/**
 * Handle subscription activation (recurring)
 */
async function handleSubscriptionActivated(subscription, payload) {
  try {
    console.log(`✅ Recurring subscription activated: ${subscription.id}`);
    // Handle recurring subscription logic here
  } catch (error) {
    console.error("❌ Subscription activation error:", error);
  }
}

/**
 * Handle subscription charge (recurring payment)
 */
async function handleSubscriptionCharged(payment, payload) {
  try {
    console.log(`💰 Subscription charged: ${payment.id}`);
    // Update billing dates, send receipt
  } catch (error) {
    console.error("❌ Subscription charge error:", error);
  }
}

/**
 * Calculate next billing date based on interval
 */
function calculateNextBillingDate(interval) {
  const now = new Date();
  switch (interval) {
    case "monthly":
      return new Date(now.setMonth(now.getMonth() + 1));
    case "quarterly":
      return new Date(now.setMonth(now.getMonth() + 3));
    case "yearly":
      return new Date(now.setFullYear(now.getFullYear() + 1));
    default:
      return new Date(now.setMonth(now.getMonth() + 1));
  }
}

/**
 * Send activation email
 */
async function sendActivationEmail(seller, subscription, payment) {
  const tierFeatures = SellerSubscription.getTierFeatures(subscription.tier);

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-badge { background: #10b981; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 20px 0; }
        .feature-list { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .feature-item { padding: 10px 0; border-bottom: 1px solid #eee; }
        .feature-item:last-child { border-bottom: none; }
        .cta-button { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .receipt { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #667eea; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to ${tierFeatures.name} Plan!</h1>
          <p>Your subscription is now active</p>
        </div>
        <div class="content">
          <div class="success-badge">
            ✅ Activated in less than 2 seconds!
          </div>
          
          <h2>Hello ${seller.name || "Seller"},</h2>
          <p>Great news! Your <strong>${
            tierFeatures.name
          }</strong> plan is now active and all features are unlocked.</p>
          
          <div class="receipt">
            <h3>📄 Payment Receipt</h3>
            <p><strong>Amount Paid:</strong> ₹${(
              payment.amount / 100
            ).toLocaleString()}</p>
            <p><strong>Payment ID:</strong> ${payment.id}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Billing Cycle:</strong> ${
              subscription.billing.interval
            }</p>
            <p><strong>Next Billing:</strong> ${subscription.billing.nextBillingDate.toLocaleDateString()}</p>
          </div>
          
          <div class="feature-list">
            <h3>🚀 Your New Features:</h3>
            <div class="feature-item">✓ <strong>${
              tierFeatures.maxProducts === -1
                ? "Unlimited"
                : tierFeatures.maxProducts
            }</strong> Products</div>
            <div class="feature-item">✓ <strong>${
              tierFeatures.maxWarehouses === -1
                ? "Unlimited"
                : tierFeatures.maxWarehouses
            }</strong> Warehouses</div>
            <div class="feature-item">✓ <strong>${
              tierFeatures.maxImages === -1
                ? "Unlimited"
                : tierFeatures.maxImages
            }</strong> Images per Product</div>
            ${
              tierFeatures.bulkUpload
                ? '<div class="feature-item">✓ <strong>Bulk Upload</strong> Tool</div>'
                : ""
            }
            ${
              tierFeatures.advancedAnalytics
                ? '<div class="feature-item">✓ <strong>Advanced Analytics</strong> Dashboard</div>'
                : ""
            }
            ${
              tierFeatures.apiAccess
                ? '<div class="feature-item">✓ <strong>API Access</strong> for Integrations</div>'
                : ""
            }
            ${
              tierFeatures.prioritySupport
                ? '<div class="feature-item">✓ <strong>Priority Support</strong> (24/7)</div>'
                : ""
            }
            ${
              tierFeatures.dedicatedManager
                ? '<div class="feature-item">✓ <strong>Dedicated Account Manager</strong></div>'
                : ""
            }
          </div>
          
          <p>All features are now available in your dashboard. Start exploring!</p>
          
          <a href="${
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
          }/seller/dashboard" class="cta-button">
            Go to Dashboard →
          </a>
          
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Need help? Contact our support team at support@onlineplanet.ae
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await emailService.sendEmail({
    to: seller.email,
    subject: `🎉 Welcome to ${tierFeatures.name} Plan - Online Planet`,
    html: emailHtml,
  });
}

/**
 * Generate payment failed email
 */
function generatePaymentFailedEmail(seller, payment) {
  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Payment Failed</h2>
        <p>Hello ${seller.name || "Seller"},</p>
        <p>We were unable to process your payment for the subscription upgrade.</p>
        <p><strong>Reason:</strong> ${
          payment.error_description || "Payment declined"
        }</p>
        <p>Please try again or contact your bank for more information.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/seller/subscription" 
           style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
          Try Again
        </a>
      </div>
    </body>
    </html>
  `;
}

/**
 * Log subscription event for analytics
 */
async function logSubscriptionEvent(eventData) {
  try {
    // You can implement logging to a separate collection or analytics service
    console.log("📊 Subscription Event:", JSON.stringify(eventData, null, 2));

    // TODO: Save to SubscriptionEvents collection for analytics
    // const SubscriptionEvent = mongoose.model('SubscriptionEvent');
    // await SubscriptionEvent.create(eventData);
  } catch (error) {
    console.error("Logging error:", error);
  }
}
