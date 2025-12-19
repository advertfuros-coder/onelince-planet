// lib/db/models/CompetitorTracking.js
import mongoose from "mongoose";

const CompetitorTrackingSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    // Competitor details
    competitors: [
      {
        name: String,
        url: String,
        platform: {
          type: String,
          enum: ["amazon", "flipkart", "myntra", "ajio", "custom"],
          default: "custom",
        },
        productUrl: String,
        lastScraped: Date,
        scrapingStatus: {
          type: String,
          enum: ["active", "failed", "paused"],
          default: "active",
        },
      },
    ],

    // Price history
    priceHistory: [
      {
        competitor: String,
        price: Number,
        inStock: Boolean,
        scrapedAt: {
          type: Date,
          default: Date.now,
        },
        discount: Number,
        rating: Number,
        reviews: Number,
      },
    ],

    // Current competitive position
    currentPosition: {
      myPrice: Number,
      lowestCompetitorPrice: Number,
      averageCompetitorPrice: Number,
      priceRank: Number, // 1 = cheapest
      priceDifference: Number,
      percentageDifference: Number,
    },

    // Auto-pricing settings
    autoPricing: {
      enabled: {
        type: Boolean,
        default: false,
      },
      strategy: {
        type: String,
        enum: ["match_lowest", "beat_lowest", "match_average", "custom"],
        default: "match_lowest",
      },
      beatByAmount: Number, // Amount to beat lowest price by
      beatByPercentage: Number, // Percentage to beat lowest price by
      minPrice: Number, // Floor price
      maxPrice: Number, // Ceiling price
      updateFrequency: {
        type: String,
        enum: ["realtime", "hourly", "daily"],
        default: "daily",
      },
    },

    // Alerts
    alerts: {
      priceDropAlert: {
        enabled: Boolean,
        threshold: Number, // Alert when competitor drops price by X%
      },
      outOfStockAlert: {
        enabled: Boolean,
      },
      newCompetitorAlert: {
        enabled: Boolean,
      },
    },

    // Analytics
    analytics: {
      totalScans: { type: Number, default: 0 },
      successfulScans: { type: Number, default: 0 },
      failedScans: { type: Number, default: 0 },
      priceChanges: { type: Number, default: 0 },
      lastPriceUpdate: Date,
      averagePriceChange: Number,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
CompetitorTrackingSchema.index({ sellerId: 1, productId: 1 });
CompetitorTrackingSchema.index({ sellerId: 1, isActive: 1 });

// Method to add competitor
CompetitorTrackingSchema.methods.addCompetitor = function (competitorData) {
  this.competitors.push({
    ...competitorData,
    lastScraped: new Date(),
    scrapingStatus: "active",
  });
  return this.save();
};

// Method to update price
CompetitorTrackingSchema.methods.updatePrice = function (
  competitorName,
  priceData
) {
  this.priceHistory.push({
    competitor: competitorName,
    ...priceData,
    scrapedAt: new Date(),
  });

  // Update analytics
  this.analytics.totalScans += 1;
  if (priceData.price) {
    this.analytics.successfulScans += 1;
  } else {
    this.analytics.failedScans += 1;
  }

  // Update current position
  this.updateCompetitivePosition();

  return this.save();
};

// Method to calculate competitive position
CompetitorTrackingSchema.methods.updateCompetitivePosition = function () {
  const recentPrices = this.priceHistory
    .filter((p) => p.scrapedAt > new Date(Date.now() - 24 * 60 * 60 * 1000)) // Last 24 hours
    .filter((p) => p.price > 0);

  if (recentPrices.length === 0) return;

  const competitorPrices = recentPrices.map((p) => p.price);
  const lowestPrice = Math.min(...competitorPrices);
  const averagePrice =
    competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length;

  this.currentPosition = {
    myPrice: this.myPrice || 0,
    lowestCompetitorPrice: lowestPrice,
    averageCompetitorPrice: averagePrice,
    priceRank: competitorPrices.filter((p) => p < this.myPrice).length + 1,
    priceDifference: this.myPrice - lowestPrice,
    percentageDifference: ((this.myPrice - lowestPrice) / lowestPrice) * 100,
  };
};

// Method to get recommended price
CompetitorTrackingSchema.methods.getRecommendedPrice = function () {
  if (!this.autoPricing.enabled) return null;

  const { strategy, beatByAmount, beatByPercentage, minPrice, maxPrice } =
    this.autoPricing;
  const { lowestCompetitorPrice, averageCompetitorPrice } =
    this.currentPosition;

  let recommendedPrice;

  switch (strategy) {
    case "match_lowest":
      recommendedPrice = lowestCompetitorPrice;
      break;
    case "beat_lowest":
      if (beatByAmount) {
        recommendedPrice = lowestCompetitorPrice - beatByAmount;
      } else if (beatByPercentage) {
        recommendedPrice = lowestCompetitorPrice * (1 - beatByPercentage / 100);
      }
      break;
    case "match_average":
      recommendedPrice = averageCompetitorPrice;
      break;
    default:
      recommendedPrice = lowestCompetitorPrice;
  }

  // Apply min/max constraints
  if (minPrice && recommendedPrice < minPrice) recommendedPrice = minPrice;
  if (maxPrice && recommendedPrice > maxPrice) recommendedPrice = maxPrice;

  return Math.round(recommendedPrice * 100) / 100;
};

export default mongoose.models.CompetitorTracking ||
  mongoose.model("CompetitorTracking", CompetitorTrackingSchema);
