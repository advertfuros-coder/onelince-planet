// models/CategoryAnalytics.js
import mongoose from "mongoose";

const categoryAnalyticsSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    categoryPath: {
      type: String,
      required: true,
      index: true,
    },
    categoryName: String,

    // Time period
    date: {
      type: Date,
      required: true,
      index: true,
    },
    period: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      default: "daily",
    },

    // Traffic Metrics
    views: {
      type: Number,
      default: 0,
    },
    uniqueVisitors: {
      type: Number,
      default: 0,
    },

    // Sales Metrics
    orders: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
    units: {
      type: Number,
      default: 0,
    },

    // Calculated Metrics
    conversionRate: {
      type: Number,
      default: 0, // Percentage (orders / views * 100)
    },
    averageOrderValue: {
      type: Number,
      default: 0, // revenue / orders
    },
    revenuePerView: {
      type: Number,
      default: 0, // revenue / views
    },

    // Product Metrics
    activeProductCount: {
      type: Number,
      default: 0,
    },
    totalProductCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
categoryAnalyticsSchema.index({ sellerId: 1, date: -1 });
categoryAnalyticsSchema.index({ categoryId: 1, date: -1 });
categoryAnalyticsSchema.index({ sellerId: 1, categoryPath: 1, date: -1 });

// Pre-save hook to calculate metrics
categoryAnalyticsSchema.pre("save", function (next) {
  if (this.views > 0 && this.orders >= 0) {
    this.conversionRate = (this.orders / this.views) * 100;
  }

  if (this.orders > 0 && this.revenue > 0) {
    this.averageOrderValue = this.revenue / this.orders;
  }

  if (this.views > 0 && this.revenue > 0) {
    this.revenuePerView = this.revenue / this.views;
  }

  next();
});

export default mongoose.models.CategoryAnalytics ||
  mongoose.model("CategoryAnalytics", categoryAnalyticsSchema);
