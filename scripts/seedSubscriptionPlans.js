// scripts/seedSubscriptionPlans.js
/**
 * Seed Subscription Plans
 * Based on market research of Etsy, eBay, Shopify
 * Run: node scripts/seedSubscriptionPlans.js
 */

const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Subscription Plan Schema (inline for seeding)
const SubscriptionPlanSchema = new mongoose.Schema(
  {
    name: String,
    displayName: String,
    description: String,
    tagline: String,
    icon: String,
    color: String,
    pricing: {
      monthly: Number,
      quarterly: Number,
      yearly: Number,
      currency: String,
    },
    discounts: {
      quarterly: Number,
      yearly: Number,
    },
    features: {
      maxProducts: Number,
      maxImages: Number,
      maxWarehouses: Number,
      maxPricingRules: Number,
      bulkUpload: Boolean,
      advancedAnalytics: Boolean,
      apiAccess: Boolean,
      apiCallsPerMonth: Number,
      whiteLabel: Boolean,
      prioritySupport: Boolean,
      dedicatedManager: Boolean,
      featuredListings: Number,
      sponsoredProducts: Number,
      emailMarketing: Boolean,
      multiWarehouse: Boolean,
      automatedPricing: Boolean,
      competitorTracking: Boolean,
      inventorySync: Boolean,
      customReports: Boolean,
    },
    status: String,
    isVisible: Boolean,
    isPopular: Boolean,
    sortOrder: Number,
  },
  { timestamps: true }
);

const SubscriptionPlan =
  mongoose.models.SubscriptionPlan ||
  mongoose.model("SubscriptionPlan", SubscriptionPlanSchema);

// Subscription Plans based on market research
const plans = [
  {
    name: "free",
    displayName: "Free",
    description: "Perfect for getting started with your marketplace journey",
    tagline: "Start selling today",
    icon: "🌱",
    color: "#6B7280",
    pricing: {
      monthly: 0,
      quarterly: 0,
      yearly: 0,
      currency: "INR",
    },
    discounts: {
      quarterly: 0,
      yearly: 0,
    },
    features: {
      maxProducts: 50, // Similar to Etsy's basic approach
      maxImages: 5,
      maxWarehouses: 1,
      maxPricingRules: 0,
      bulkUpload: false,
      advancedAnalytics: false,
      apiAccess: false,
      apiCallsPerMonth: 0,
      whiteLabel: false,
      prioritySupport: false,
      dedicatedManager: false,
      featuredListings: 0,
      sponsoredProducts: 0,
      emailMarketing: false,
      multiWarehouse: false,
      automatedPricing: false,
      competitorTracking: false,
      inventorySync: false,
      customReports: false,
    },
    status: "active",
    isVisible: true,
    isPopular: false,
    sortOrder: 1,
  },
  {
    name: "starter",
    displayName: "Starter",
    description: "For growing businesses ready to scale",
    tagline: "Accelerate your growth",
    icon: "🚀",
    color: "#3B82F6",
    pricing: {
      monthly: 999, // Competitive with eBay Basic ($21.95) and Shopify Basic ($29)
      quarterly: 899, // 10% off
      yearly: 799, // 20% off
      currency: "INR",
    },
    discounts: {
      quarterly: 10,
      yearly: 20,
    },
    features: {
      maxProducts: 500, // Between eBay Starter (250) and Basic (1000)
      maxImages: 10,
      maxWarehouses: 2,
      maxPricingRules: 5,
      bulkUpload: true, // Key differentiator
      advancedAnalytics: true,
      apiAccess: false,
      apiCallsPerMonth: 0,
      whiteLabel: false,
      prioritySupport: false,
      dedicatedManager: false,
      featuredListings: 2,
      sponsoredProducts: 5,
      emailMarketing: true, // Like Etsy Plus
      multiWarehouse: true,
      automatedPricing: false,
      competitorTracking: false,
      inventorySync: true,
      customReports: false,
    },
    status: "active",
    isVisible: true,
    isPopular: true, // Most popular tier
    sortOrder: 2,
  },
  {
    name: "professional",
    displayName: "Professional",
    description: "For established sellers with high-volume operations",
    tagline: "Power your business",
    icon: "💎",
    color: "#8B5CF6",
    pricing: {
      monthly: 2999, // Competitive with eBay Premium ($59.95) and Shopify Advanced ($299)
      quarterly: 2699, // 10% off
      yearly: 2399, // 20% off
      currency: "INR",
    },
    discounts: {
      quarterly: 10,
      yearly: 20,
    },
    features: {
      maxProducts: 5000, // Similar to eBay Premium (10,000)
      maxImages: 20,
      maxWarehouses: 5,
      maxPricingRules: 20,
      bulkUpload: true,
      advancedAnalytics: true,
      apiAccess: true, // Major upgrade
      apiCallsPerMonth: 10000,
      whiteLabel: false,
      prioritySupport: true, // 24/7 support
      dedicatedManager: false,
      featuredListings: 10,
      sponsoredProducts: 20,
      emailMarketing: true,
      multiWarehouse: true,
      automatedPricing: true, // Competitive advantage
      competitorTracking: true, // Unique feature
      inventorySync: true,
      customReports: true,
    },
    status: "active",
    isVisible: true,
    isPopular: false,
    sortOrder: 3,
  },
  {
    name: "enterprise",
    displayName: "Enterprise",
    description: "For large-scale operations requiring unlimited resources",
    tagline: "Unlimited possibilities",
    icon: "👑",
    color: "#F59E0B",
    pricing: {
      monthly: 9999, // Competitive with eBay Anchor ($299.95) and Shopify Plus ($2,300)
      quarterly: 8999, // 10% off
      yearly: 7999, // 20% off
      currency: "INR",
    },
    discounts: {
      quarterly: 10,
      yearly: 20,
    },
    features: {
      maxProducts: -1, // Unlimited
      maxImages: -1, // Unlimited
      maxWarehouses: -1, // Unlimited
      maxPricingRules: -1, // Unlimited
      bulkUpload: true,
      advancedAnalytics: true,
      apiAccess: true,
      apiCallsPerMonth: -1, // Unlimited
      whiteLabel: true, // Premium feature
      prioritySupport: true,
      dedicatedManager: true, // Dedicated account manager
      featuredListings: -1, // Unlimited
      sponsoredProducts: -1, // Unlimited
      emailMarketing: true,
      multiWarehouse: true,
      automatedPricing: true,
      competitorTracking: true,
      inventorySync: true,
      customReports: true,
    },
    status: "active",
    isVisible: true,
    isPopular: false,
    sortOrder: 4,
  },
];

async function seedPlans() {
  try {
    await connectDB();

    console.log("🌱 Seeding subscription plans...\n");

    // Clear existing plans
    await SubscriptionPlan.deleteMany({});
    console.log("🗑️  Cleared existing plans\n");

    // Insert new plans
    for (const plan of plans) {
      const created = await SubscriptionPlan.create(plan);
      console.log(`✅ Created: ${created.displayName} (${created.name})`);
      console.log(`   Price: ₹${created.pricing.monthly}/month`);
      console.log(
        `   Products: ${
          created.features.maxProducts === -1
            ? "Unlimited"
            : created.features.maxProducts
        }`
      );
      console.log(`   Status: ${created.status}\n`);
    }

    console.log("🎉 Seeding complete!");
    console.log(`\n📊 Summary:`);
    console.log(`   Total plans created: ${plans.length}`);
    console.log(
      `   Active plans: ${plans.filter((p) => p.status === "active").length}`
    );
    console.log(
      `   Popular plan: ${
        plans.find((p) => p.isPopular)?.displayName || "None"
      }`
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
}

// Run seeding
seedPlans();
