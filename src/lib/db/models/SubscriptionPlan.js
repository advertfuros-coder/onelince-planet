// lib/db/models/SubscriptionPlan.js
import mongoose from "mongoose";

const SubscriptionPlanSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      enum: ["free", "starter", "professional", "enterprise", "custom"],
    },
    displayName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    tagline: {
      type: String,
    },
    icon: {
      type: String,
      default: "⭐",
    },
    color: {
      type: String,
      default: "#3B82F6",
    },

    // Pricing
    pricing: {
      monthly: {
        type: Number,
        required: true,
        default: 0,
      },
      quarterly: {
        type: Number, // Actual price or discount percentage
        default: 0,
      },
      yearly: {
        type: Number, // Actual price or discount percentage
        default: 0,
      },
      trialDays: {
        type: Number,
        default: 0,
      },
      setupFee: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: "INR",
      },
    },

    // Discount Configuration
    discounts: {
      quarterly: {
        type: Number, // Percentage
        default: 10,
      },
      yearly: {
        type: Number, // Percentage
        default: 20,
      },
    },

    // Features & Limits
    features: {
      // Product limits
      maxProducts: {
        type: Number,
        default: 50, // -1 = unlimited
      },
      maxImages: {
        type: Number,
        default: 5,
      },
      maxWarehouses: {
        type: Number,
        default: 1,
      },
      maxPricingRules: {
        type: Number,
        default: 0,
      },

      // Tools access
      bulkUpload: {
        type: Boolean,
        default: false,
      },
      advancedAnalytics: {
        type: Boolean,
        default: false,
      },
      apiAccess: {
        type: Boolean,
        default: false,
      },
      apiCallsPerMonth: {
        type: Number,
        default: 0, // -1 = unlimited
      },
      whiteLabel: {
        type: Boolean,
        default: false,
      },
      prioritySupport: {
        type: Boolean,
        default: false,
      },
      dedicatedManager: {
        type: Boolean,
        default: false,
      },

      // Marketing
      featuredListings: {
        type: Number,
        default: 0, // -1 = unlimited
      },
      sponsoredProducts: {
        type: Number,
        default: 0,
      },
      emailMarketing: {
        type: Boolean,
        default: false,
      },

      // Advanced features
      multiWarehouse: {
        type: Boolean,
        default: false,
      },
      automatedPricing: {
        type: Boolean,
        default: false,
      },
      competitorTracking: {
        type: Boolean,
        default: false,
      },
      inventorySync: {
        type: Boolean,
        default: false,
      },
      customReports: {
        type: Boolean,
        default: false,
      },
    },

    // Metadata
    status: {
      type: String,
      enum: ["active", "draft", "archived"],
      default: "active",
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },

    // Analytics (auto-calculated)
    analytics: {
      totalSubscribers: {
        type: Number,
        default: 0,
      },
      activeSubscribers: {
        type: Number,
        default: 0,
      },
      monthlyRevenue: {
        type: Number,
        default: 0,
      },
      conversionRate: {
        type: Number,
        default: 0,
      },
      churnRate: {
        type: Number,
        default: 0,
      },
      avgLifetimeValue: {
        type: Number,
        default: 0,
      },
    },

    // A/B Testing (future feature)
    variants: [
      {
        name: String,
        pricing: Object,
        features: Object,
        trafficPercentage: Number,
        conversionRate: Number,
        isActive: Boolean,
      },
    ],

    // Audit
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SubscriptionPlanSchema.index({ name: 1 });
SubscriptionPlanSchema.index({ status: 1, isVisible: 1 });
SubscriptionPlanSchema.index({ sortOrder: 1 });

// Virtual for calculated quarterly/yearly prices
SubscriptionPlanSchema.virtual("calculatedPricing").get(function () {
  return {
    monthly: this.pricing.monthly,
    quarterly: Math.round(
      this.pricing.monthly * (1 - this.discounts.quarterly / 100)
    ),
    yearly: Math.round(
      this.pricing.monthly * (1 - this.discounts.yearly / 100)
    ),
  };
});

// Method to get full plan details
SubscriptionPlanSchema.methods.getFullDetails = function () {
  return {
    id: this._id,
    name: this.name,
    displayName: this.displayName,
    description: this.description,
    tagline: this.tagline,
    icon: this.icon,
    color: this.color,
    pricing: {
      ...this.pricing.toObject(),
      calculated: this.calculatedPricing,
    },
    discounts: this.discounts,
    features: this.features,
    status: this.status,
    isVisible: this.isVisible,
    isPopular: this.isPopular,
    analytics: this.analytics,
  };
};

// Static method to get all active plans
SubscriptionPlanSchema.statics.getActivePlans = async function () {
  return await this.find({ status: "active", isVisible: true }).sort({
    sortOrder: 1,
  });
};

// Static method to get plan by name
SubscriptionPlanSchema.statics.getPlanByName = async function (name) {
  return await this.findOne({ name: name.toLowerCase(), status: "active" });
};

// Method to update analytics
SubscriptionPlanSchema.methods.updateAnalytics = async function (data) {
  this.analytics = {
    ...this.analytics.toObject(),
    ...data,
  };
  await this.save();
};

// Pre-save hook to calculate quarterly/yearly prices if not set
SubscriptionPlanSchema.pre("save", function (next) {
  if (!this.pricing.quarterly) {
    this.pricing.quarterly = Math.round(
      this.pricing.monthly * (1 - this.discounts.quarterly / 100)
    );
  }
  if (!this.pricing.yearly) {
    this.pricing.yearly = Math.round(
      this.pricing.monthly * (1 - this.discounts.yearly / 100)
    );
  }
  next();
});

export default mongoose.models.SubscriptionPlan ||
  mongoose.model("SubscriptionPlan", SubscriptionPlanSchema);
