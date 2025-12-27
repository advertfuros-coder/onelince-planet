// scripts/checkSubscription.js
/**
 * Check seller subscription status
 * Run: node scripts/checkSubscription.js <sellerId>
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

const SellerSubscriptionSchema = new mongoose.Schema(
  {
    sellerId: mongoose.Schema.Types.ObjectId,
    tier: String,
    status: String,
    features: Object,
    billing: Object,
    usage: Object,
    history: Array,
  },
  { timestamps: true }
);

const SellerSubscription =
  mongoose.models.SellerSubscription ||
  mongoose.model("SellerSubscription", SellerSubscriptionSchema);

async function checkSubscription() {
  try {
    await connectDB();

    const sellerId = process.argv[2];

    if (!sellerId) {
      console.log("📋 Fetching all subscriptions...\n");
      const allSubs = await SellerSubscription.find({})
        .sort({ updatedAt: -1 })
        .limit(10);

      console.log(`Found ${allSubs.length} subscriptions:\n`);

      allSubs.forEach((sub, index) => {
        console.log(`${index + 1}. Seller ID: ${sub.sellerId}`);
        console.log(`   Tier: ${sub.tier}`);
        console.log(`   Status: ${sub.status}`);
        console.log(`   Last Updated: ${sub.updatedAt}`);
        console.log(`   Billing Amount: ₹${sub.billing?.amount || 0}`);
        console.log("");
      });
    } else {
      console.log(`🔍 Checking subscription for seller: ${sellerId}\n`);

      const subscription = await SellerSubscription.findOne({ sellerId });

      if (!subscription) {
        console.log("❌ No subscription found for this seller");
        process.exit(0);
      }

      console.log("📊 Subscription Details:");
      console.log("========================");
      console.log(`Seller ID: ${subscription.sellerId}`);
      console.log(`Current Tier: ${subscription.tier}`);
      console.log(`Status: ${subscription.status}`);
      console.log(`Billing Amount: ₹${subscription.billing?.amount || 0}`);
      console.log(
        `Billing Interval: ${subscription.billing?.interval || "N/A"}`
      );
      console.log(
        `Last Billing: ${subscription.billing?.lastBillingDate || "N/A"}`
      );
      console.log(
        `Next Billing: ${subscription.billing?.nextBillingDate || "N/A"}`
      );
      console.log(`\nFeatures:`);
      console.log(`- Max Products: ${subscription.features?.maxProducts || 0}`);
      console.log(
        `- Max Warehouses: ${subscription.features?.maxWarehouses || 0}`
      );
      console.log(
        `- Bulk Upload: ${subscription.features?.bulkUpload ? "Yes" : "No"}`
      );
      console.log(
        `- API Access: ${subscription.features?.apiAccess ? "Yes" : "No"}`
      );

      if (subscription.history && subscription.history.length > 0) {
        console.log(`\n📜 History (${subscription.history.length} entries):`);
        subscription.history.slice(-3).forEach((h, i) => {
          console.log(`${i + 1}. ${h.tier} - ${h.status} (₹${h.amount})`);
        });
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

checkSubscription();
