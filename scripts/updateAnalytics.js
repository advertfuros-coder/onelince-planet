// scripts/updateAnalytics.js
/**
 * Manually update subscription plan analytics
 * Use this after test payments when webhook doesn't fire
 * Run: node scripts/updateAnalytics.js
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
    billing: Object,
  },
  { timestamps: true }
);

const SubscriptionPlanSchema = new mongoose.Schema(
  {
    name: String,
    displayName: String,
    pricing: Object,
    analytics: Object,
  },
  { timestamps: true }
);

const SellerSubscription =
  mongoose.models.SellerSubscription ||
  mongoose.model("SellerSubscription", SellerSubscriptionSchema);

const SubscriptionPlan =
  mongoose.models.SubscriptionPlan ||
  mongoose.model("SubscriptionPlan", SubscriptionPlanSchema);

async function updateAnalytics() {
  try {
    await connectDB();

    console.log("\n📊 Updating Subscription Analytics...\n");

    // Get all plans
    const plans = await SubscriptionPlan.find({});

    for (const plan of plans) {
      // Count active subscriptions for this plan
      const activeSubscribers = await SellerSubscription.countDocuments({
        tier: plan.name,
        status: "active",
      });

      // Calculate total revenue (active subscribers * plan price)
      const monthlyRevenue = activeSubscribers * (plan.pricing?.monthly || 0);

      // Get total subscribers (including inactive)
      const totalSubscribers = await SellerSubscription.countDocuments({
        tier: plan.name,
      });

      // Update plan analytics
      plan.analytics = {
        ...plan.analytics,
        activeSubscribers,
        totalSubscribers,
        monthlyRevenue,
      };

      await plan.save();

      console.log(`✅ ${plan.displayName}:`);
      console.log(`   Active Subscribers: ${activeSubscribers}`);
      console.log(`   Total Subscribers: ${totalSubscribers}`);
      console.log(`   Monthly Revenue: ₹${monthlyRevenue.toLocaleString()}`);
      console.log("");
    }

    // Calculate totals
    const totalActive = await SellerSubscription.countDocuments({
      status: "active",
    });
    const totalRevenue = plans.reduce(
      (sum, p) => sum + (p.analytics?.monthlyRevenue || 0),
      0
    );

    console.log("📈 Overall Stats:");
    console.log(`   Total Active Subscriptions: ${totalActive}`);
    console.log(`   Total Monthly Revenue: ₹${totalRevenue.toLocaleString()}`);

    console.log("\n🎉 Analytics updated successfully!");
    console.log("Refresh your admin panel to see the changes.\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

updateAnalytics();
