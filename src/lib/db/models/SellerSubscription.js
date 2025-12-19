// lib/db/models/SellerSubscription.js
import mongoose from "mongoose";

const SellerSubscriptionSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    tier: {
      type: String,
      enum: ["free", "starter", "professional", "enterprise"],
      default: "free",
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired", "trial"],
      default: "active",
    },

    // Billing
    billing: {
      amount: { type: Number, default: 0 },
      currency: { type: String, default: "INR" },
      interval: {
        type: String,
        enum: ["monthly", "quarterly", "yearly"],
        default: "monthly",
      },
      nextBillingDate: Date,
      lastBillingDate: Date,
      paymentMethod: String,
    },

    // Trial
    trial: {
      isActive: { type: Boolean, default: false },
      startDate: Date,
      endDate: Date,
      daysRemaining: Number,
    },

    // Features & Limits
    features: {
      // Product limits
      maxProducts: { type: Number, default: 50 }, // Free: 50, Starter: 500, Pro: 5000, Enterprise: Unlimited
      maxImages: { type: Number, default: 5 }, // Images per product
      maxWarehouses: { type: Number, default: 1 },
      maxPricingRules: { type: Number, default: 0 },

      // Tools access
      bulkUpload: { type: Boolean, default: false },
      advancedAnalytics: { type: Boolean, default: false },
      apiAccess: { type: Boolean, default: false },
      whiteLabel: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
      dedicatedManager: { type: Boolean, default: false },

      // Marketing
      featuredListings: { type: Number, default: 0 },
      sponsoredProducts: { type: Number, default: 0 },
      emailMarketing: { type: Boolean, default: false },

      // Advanced features
      multiWarehouse: { type: Boolean, default: false },
      automatedPricing: { type: Boolean, default: false },
      competitorTracking: { type: Boolean, default: false },
      inventorySync: { type: Boolean, default: false },
      customReports: { type: Boolean, default: false },
    },

    // Usage tracking
    usage: {
      productsListed: { type: Number, default: 0 },
      warehousesCreated: { type: Number, default: 0 },
      pricingRulesActive: { type: Number, default: 0 },
      apiCallsThisMonth: { type: Number, default: 0 },
      storageUsed: { type: Number, default: 0 }, // in MB
    },

    // Subscription history
    history: [
      {
        tier: String,
        startDate: Date,
        endDate: Date,
        amount: Number,
        status: String,
      },
    ],

    // Add-ons
    addOns: [
      {
        name: String,
        price: Number,
        active: Boolean,
        addedAt: Date,
      },
    ],

    // Metrics
    metrics: {
      totalRevenue: { type: Number, default: 0 },
      lifetimeValue: { type: Number, default: 0 },
      monthsSubscribed: { type: Number, default: 0 },
      upgradeDate: Date,
      downgradDate: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Static method to get tier features
SellerSubscriptionSchema.statics.getTierFeatures = function (tier) {
  const tiers = {
    free: {
      name: "Free",
      price: 0,
      maxProducts: 50,
      maxImages: 5,
      maxWarehouses: 1,
      maxPricingRules: 0,
      bulkUpload: false,
      advancedAnalytics: false,
      apiAccess: false,
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
    starter: {
      name: "Starter",
      price: 999,
      maxProducts: 500,
      maxImages: 10,
      maxWarehouses: 2,
      maxPricingRules: 5,
      bulkUpload: true,
      advancedAnalytics: true,
      apiAccess: false,
      whiteLabel: false,
      prioritySupport: false,
      dedicatedManager: false,
      featuredListings: 2,
      sponsoredProducts: 5,
      emailMarketing: true,
      multiWarehouse: true,
      automatedPricing: true,
      competitorTracking: false,
      inventorySync: false,
      customReports: false,
    },
    professional: {
      name: "Professional",
      price: 2999,
      maxProducts: 5000,
      maxImages: 20,
      maxWarehouses: 5,
      maxPricingRules: 20,
      bulkUpload: true,
      advancedAnalytics: true,
      apiAccess: true,
      whiteLabel: false,
      prioritySupport: true,
      dedicatedManager: false,
      featuredListings: 10,
      sponsoredProducts: 20,
      emailMarketing: true,
      multiWarehouse: true,
      automatedPricing: true,
      competitorTracking: true,
      inventorySync: true,
      customReports: true,
    },
    enterprise: {
      name: "Enterprise",
      price: 9999,
      maxProducts: -1, // Unlimited
      maxImages: -1,
      maxWarehouses: -1,
      maxPricingRules: -1,
      bulkUpload: true,
      advancedAnalytics: true,
      apiAccess: true,
      whiteLabel: true,
      prioritySupport: true,
      dedicatedManager: true,
      featuredListings: -1,
      sponsoredProducts: -1,
      emailMarketing: true,
      multiWarehouse: true,
      automatedPricing: true,
      competitorTracking: true,
      inventorySync: true,
      customReports: true,
    },
  };

  return tiers[tier] || tiers.free;
};

// Method to check if feature is available
SellerSubscriptionSchema.methods.hasFeature = function (featureName) {
  return this.features[featureName] === true || this.features[featureName] > 0;
};

// Method to check usage limits
SellerSubscriptionSchema.methods.canAddProduct = function () {
  if (this.features.maxProducts === -1) return true; // Unlimited
  return this.usage.productsListed < this.features.maxProducts;
};

SellerSubscriptionSchema.methods.canAddWarehouse = function () {
  if (this.features.maxWarehouses === -1) return true;
  return this.usage.warehousesCreated < this.features.maxWarehouses;
};

SellerSubscriptionSchema.methods.canAddPricingRule = function () {
  if (this.features.maxPricingRules === -1) return true;
  return this.usage.pricingRulesActive < this.features.maxPricingRules;
};

// Method to upgrade tier
SellerSubscriptionSchema.methods.upgradeTier = async function (newTier) {
  const tierFeatures = this.constructor.getTierFeatures(newTier);

  // Add to history
  this.history.push({
    tier: this.tier,
    startDate: this.createdAt,
    endDate: new Date(),
    amount: this.billing.amount,
    status: "completed",
  });

  // Update tier and features
  this.tier = newTier;
  this.features = tierFeatures;
  this.billing.amount = tierFeatures.price;
  this.metrics.upgradeDate = new Date();

  await this.save();
  return this;
};

export default mongoose.models.SellerSubscription ||
  mongoose.model("SellerSubscription", SellerSubscriptionSchema);
