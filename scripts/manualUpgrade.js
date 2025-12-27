// scripts/manualUpgrade.js
/**
 * Manual subscription upgrade script
 * Use this when webhook fails to update subscription
 * Run: node scripts/manualUpgrade.js <sellerId> <newTier>
 */

const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Import models
const SellerSubscriptionSchema = new mongoose.Schema(
  {
    sellerId: mongoose.Schema.Types.ObjectId,
    tier: String,
    status: String,
    features: Object,
    billing: Object,
    usage: Object,
    history: Array,
    metrics: Object,
  },
  { timestamps: true }
);

const SubscriptionPlanSchema = new mongoose.Schema(
  {
    name: String,
    displayName: String,
    pricing: Object,
    features: Object,
  },
  { timestamps: true }
);

const SellerSubscription =
  mongoose.models.SellerSubscription ||
  mongoose.model("SellerSubscription", SellerSubscriptionSchema);

const SubscriptionPlan =
  mongoose.models.SubscriptionPlan ||
  mongoose.model("SubscriptionPlan", SubscriptionPlanSchema);

async function manualUpgrade() {
  try {
    await connectDB();

    const sellerId = process.argv[2] || "694ff6d0cc843fd3ab3a79b3"; // Default to your ID
    const newTier = process.argv[3] || "professional"; // Default to professional

    console.log(`\n🔧 Manual Upgrade Tool`);
    console.log(`====================`);
    console.log(`Seller ID: ${sellerId}`);
    console.log(`New Tier: ${newTier}\n`);

    // Get the new plan details
    const newPlan = await SubscriptionPlan.findOne({ name: newTier });

    if (!newPlan) {
      console.error(`❌ Plan "${newTier}" not found in database`);
      console.log("\nAvailable plans:");
      const plans = await SubscriptionPlan.find({}, "name displayName");
      plans.forEach((p) => console.log(`  - ${p.name} (${p.displayName})`));
      process.exit(1);
    }

    console.log(`📦 Found plan: ${newPlan.displayName}`);
    console.log(`   Price: ₹${newPlan.pricing.monthly}/month`);
    console.log(
      `   Products: ${
        newPlan.features.maxProducts === -1
          ? "Unlimited"
          : newPlan.features.maxProducts
      }`
    );

    // Get current subscription
    const subscription = await SellerSubscription.findOne({ sellerId });

    if (!subscription) {
      console.error(`❌ No subscription found for seller: ${sellerId}`);
      process.exit(1);
    }

    const oldTier = subscription.tier;
    console.log(`\n📊 Current subscription:`);
    console.log(`   Tier: ${oldTier}`);
    console.log(`   Status: ${subscription.status}`);

    // Update subscription
    console.log(`\n⚡ Upgrading...`);

    // Add current plan to history
    subscription.history.push({
      tier: oldTier,
      startDate: subscription.createdAt || new Date(),
      endDate: new Date(),
      amount: subscription.billing?.amount || 0,
      status: "completed",
    });

    // Update to new plan
    subscription.tier = newTier;
    subscription.status = "active";
    subscription.features = newPlan.features;
    subscription.billing = {
      ...subscription.billing,
      amount: newPlan.pricing.monthly,
      lastBillingDate: new Date(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      paymentMethod: "razorpay",
    };
    subscription.metrics = {
      ...subscription.metrics,
      upgradeDate: new Date(),
      monthsSubscribed: (subscription.metrics?.monthsSubscribed || 0) + 1,
    };

    await subscription.save();

    console.log(`✅ Upgrade complete!`);
    console.log(`\n📊 New subscription details:`);
    console.log(`   Tier: ${subscription.tier}`);
    console.log(`   Status: ${subscription.status}`);
    console.log(`   Billing Amount: ₹${subscription.billing.amount}`);
    console.log(
      `   Max Products: ${
        subscription.features.maxProducts === -1
          ? "Unlimited"
          : subscription.features.maxProducts
      }`
    );
    console.log(
      `   Max Warehouses: ${
        subscription.features.maxWarehouses === -1
          ? "Unlimited"
          : subscription.features.maxWarehouses
      }`
    );
    console.log(
      `   Bulk Upload: ${subscription.features.bulkUpload ? "Yes" : "No"}`
    );
    console.log(
      `   API Access: ${subscription.features.apiAccess ? "Yes" : "No"}`
    );
    console.log(
      `   Advanced Analytics: ${
        subscription.features.advancedAnalytics ? "Yes" : "No"
      }`
    );

    console.log(
      `\n🎉 Success! Refresh your subscription page to see the changes.`
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

manualUpgrade();
