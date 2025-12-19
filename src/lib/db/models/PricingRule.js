// lib/db/models/PricingRule.js
import mongoose from "mongoose";

const PricingRuleSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    type: {
      type: String,
      enum: [
        "dynamic",
        "scheduled",
        "inventory_based",
        "competitor_based",
        "bulk_discount",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "paused", "scheduled", "expired"],
      default: "active",
    },
    priority: {
      type: Number,
      default: 1, // Higher number = higher priority
    },

    // Target products
    appliesTo: {
      type: String,
      enum: ["all", "category", "specific", "tag"],
      default: "all",
    },
    targetProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    targetCategories: [String],
    targetTags: [String],

    // Pricing logic
    priceAdjustment: {
      type: {
        type: String,
        enum: ["percentage", "fixed", "formula"],
        required: true,
      },
      value: Number, // percentage or fixed amount
      formula: String, // e.g., "basePrice * 0.9 + 50"
    },

    // Conditions
    conditions: {
      minStock: Number,
      maxStock: Number,
      minPrice: Number,
      maxPrice: Number,
      timeOfDay: {
        start: String, // "09:00"
        end: String, // "18:00"
      },
      daysOfWeek: [String], // ["monday", "tuesday"]
      dateRange: {
        start: Date,
        end: Date,
      },
    },

    // Dynamic pricing specific
    dynamicSettings: {
      competitorPriceMultiplier: Number, // e.g., 0.95 = 5% below competitor
      demandMultiplier: Number, // Adjust based on demand
      updateFrequency: {
        type: String,
        enum: ["realtime", "hourly", "daily"],
        default: "hourly",
      },
    },

    // Inventory-based pricing
    inventorySettings: {
      highStockDiscount: Number, // % discount when stock > threshold
      lowStockPremium: Number, // % increase when stock < threshold
      highStockThreshold: Number,
      lowStockThreshold: Number,
    },

    // Bulk discount
    bulkDiscountTiers: [
      {
        minQuantity: Number,
        discount: Number, // percentage
      },
    ],

    // Metrics
    metrics: {
      productsAffected: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      averageDiscount: { type: Number, default: 0 },
      lastApplied: Date,
    },

    // Execution history
    executionLog: [
      {
        executedAt: {
          type: Date,
          default: Date.now,
        },
        productsUpdated: Number,
        averagePriceChange: Number,
        status: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
PricingRuleSchema.index({ sellerId: 1, status: 1 });
PricingRuleSchema.index({ sellerId: 1, type: 1 });

// Method to check if rule should apply
PricingRuleSchema.methods.shouldApply = function (
  product,
  currentTime = new Date()
) {
  // Check status
  if (this.status !== "active") return false;

  // Check date range
  if (this.conditions.dateRange) {
    if (
      currentTime < this.conditions.dateRange.start ||
      currentTime > this.conditions.dateRange.end
    ) {
      return false;
    }
  }

  // Check time of day
  if (this.conditions.timeOfDay) {
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    const currentTimeStr = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;

    if (
      currentTimeStr < this.conditions.timeOfDay.start ||
      currentTimeStr > this.conditions.timeOfDay.end
    ) {
      return false;
    }
  }

  // Check days of week
  if (this.conditions.daysOfWeek && this.conditions.daysOfWeek.length > 0) {
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const currentDay = days[currentTime.getDay()];
    if (!this.conditions.daysOfWeek.includes(currentDay)) {
      return false;
    }
  }

  // Check stock conditions
  if (
    this.conditions.minStock &&
    product.inventory.stock < this.conditions.minStock
  )
    return false;
  if (
    this.conditions.maxStock &&
    product.inventory.stock > this.conditions.maxStock
  )
    return false;

  // Check price conditions
  if (
    this.conditions.minPrice &&
    product.pricing.basePrice < this.conditions.minPrice
  )
    return false;
  if (
    this.conditions.maxPrice &&
    product.pricing.basePrice > this.conditions.maxPrice
  )
    return false;

  return true;
};

// Method to calculate new price
PricingRuleSchema.methods.calculatePrice = function (
  product,
  competitorPrice = null
) {
  let newPrice = product.pricing.basePrice;

  switch (this.type) {
    case "dynamic":
      if (this.dynamicSettings.competitorPriceMultiplier && competitorPrice) {
        newPrice =
          competitorPrice * this.dynamicSettings.competitorPriceMultiplier;
      }
      break;

    case "inventory_based":
      if (this.inventorySettings) {
        if (
          product.inventory.stock > this.inventorySettings.highStockThreshold
        ) {
          newPrice =
            newPrice * (1 - this.inventorySettings.highStockDiscount / 100);
        } else if (
          product.inventory.stock < this.inventorySettings.lowStockThreshold
        ) {
          newPrice =
            newPrice * (1 + this.inventorySettings.lowStockPremium / 100);
        }
      }
      break;

    case "scheduled":
    case "competitor_based":
      if (this.priceAdjustment.type === "percentage") {
        newPrice = newPrice * (1 + this.priceAdjustment.value / 100);
      } else if (this.priceAdjustment.type === "fixed") {
        newPrice = newPrice + this.priceAdjustment.value;
      }
      break;
  }

  // Ensure price doesn't go below cost
  if (product.pricing.costPrice && newPrice < product.pricing.costPrice) {
    newPrice = product.pricing.costPrice;
  }

  return Math.round(newPrice * 100) / 100; // Round to 2 decimals
};

export default mongoose.models.PricingRule ||
  mongoose.model("PricingRule", PricingRuleSchema);
