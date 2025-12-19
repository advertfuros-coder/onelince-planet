// lib/db/models/AIInsight.js
import mongoose from "mongoose";

const AIInsightSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Insight details
    type: {
      type: String,
      enum: [
        "revenue_forecast",
        "demand_prediction",
        "pricing_recommendation",
        "inventory_optimization",
        "customer_behavior",
        "market_trend",
        "competitor_analysis",
        "product_recommendation",
        "risk_alert",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },
    description: String,

    // AI Analysis
    analysis: {
      confidence: {
        type: Number,
        min: 0,
        max: 100,
      },
      dataPoints: Number,
      model: String,
      version: String,
    },

    // Predictions
    predictions: [
      {
        metric: String,
        currentValue: Number,
        predictedValue: Number,
        timeframe: String, // '7d', '30d', '90d'
        confidence: Number,
        trend: {
          type: String,
          enum: ["up", "down", "stable"],
        },
      },
    ],

    // Recommendations
    recommendations: [
      {
        action: String,
        priority: {
          type: String,
          enum: ["low", "medium", "high", "critical"],
        },
        impact: {
          type: String,
          enum: ["low", "medium", "high"],
        },
        estimatedValue: Number,
        description: String,
        implemented: {
          type: Boolean,
          default: false,
        },
        implementedAt: Date,
      },
    ],

    // Data sources
    dataSources: [
      {
        source: String,
        dataPoints: Number,
        dateRange: {
          start: Date,
          end: Date,
        },
      },
    ],

    // Visualization data
    chartData: {
      type: mongoose.Schema.Types.Mixed,
    },

    // Status
    status: {
      type: String,
      enum: ["generated", "viewed", "acted_upon", "dismissed", "expired"],
      default: "generated",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    // Engagement
    viewedAt: Date,
    actedUponAt: Date,
    dismissedAt: Date,

    // Validity
    validUntil: Date,
    isValid: {
      type: Boolean,
      default: true,
    },

    // Feedback
    feedback: {
      helpful: Boolean,
      accuracy: Number, // 1-5
      comment: String,
      submittedAt: Date,
    },

    // Performance tracking
    actualOutcome: {
      metric: String,
      value: Number,
      measuredAt: Date,
      variance: Number, // Difference from prediction
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
AIInsightSchema.index({ sellerId: 1, type: 1, status: 1 });
AIInsightSchema.index({ sellerId: 1, priority: 1, createdAt: -1 });
AIInsightSchema.index({ validUntil: 1 });

// Method to mark as viewed
AIInsightSchema.methods.markAsViewed = function () {
  this.status = "viewed";
  this.viewedAt = new Date();
  return this.save();
};

// Method to mark as acted upon
AIInsightSchema.methods.markAsActedUpon = function (recommendationIndex) {
  this.status = "acted_upon";
  this.actedUponAt = new Date();

  if (
    recommendationIndex !== undefined &&
    this.recommendations[recommendationIndex]
  ) {
    this.recommendations[recommendationIndex].implemented = true;
    this.recommendations[recommendationIndex].implementedAt = new Date();
  }

  return this.save();
};

// Method to add feedback
AIInsightSchema.methods.addFeedback = function (feedbackData) {
  this.feedback = {
    ...feedbackData,
    submittedAt: new Date(),
  };
  return this.save();
};

// Method to record actual outcome
AIInsightSchema.methods.recordOutcome = function (metric, value) {
  const prediction = this.predictions.find((p) => p.metric === metric);

  this.actualOutcome = {
    metric,
    value,
    measuredAt: new Date(),
    variance: prediction
      ? ((value - prediction.predictedValue) / prediction.predictedValue) * 100
      : 0,
  };

  return this.save();
};

// Auto-expire old insights
AIInsightSchema.pre("save", function (next) {
  if (this.validUntil && new Date() > this.validUntil) {
    this.isValid = false;
    if (this.status === "generated") {
      this.status = "expired";
    }
  }
  next();
});

export default mongoose.models.AIInsight ||
  mongoose.model("AIInsight", AIInsightSchema);
