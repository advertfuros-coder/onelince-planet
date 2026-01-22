// lib/db/models/LoyaltyProgram.js
import mongoose from "mongoose";

const loyaltyProgramSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Points
    points: {
      total: { type: Number, default: 0 },
      available: { type: Number, default: 0 },
      redeemed: { type: Number, default: 0 },
      expired: { type: Number, default: 0 },
    },

    // Tier
    tier: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum"],
      default: "bronze",
    },

    tierProgress: {
      currentSpending: { type: Number, default: 0 },
      nextTierRequirement: { type: Number, default: 10000 }, // ₹10,000 for silver
    },

    // Benefits
    benefits: {
      pointsMultiplier: { type: Number, default: 1 }, // Bronze = 1x, Silver = 1.5x, Gold = 2x, Platinum = 3x
      freeShipping: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
      earlyAccess: { type: Boolean, default: false },
    },

    // History
    transactions: [
      {
        type: {
          type: String,
          enum: ["earned", "redeemed", "expired", "adjusted"],
          required: true,
        },
        points: {
          type: Number,
          required: true,
        },
        description: String,
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        expiryDate: Date,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Lifetime stats
    lifetimeStats: {
      totalPointsEarned: { type: Number, default: 0 },
      totalPointsRedeemed: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      totalSpent: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
loyaltyProgramSchema.index({ tier: 1 });

// Methods
loyaltyProgramSchema.methods.addPoints = function (
  points,
  description,
  orderId = null,
) {
  const multipliedPoints = Math.round(points * this.benefits.pointsMultiplier);

  this.points.total += multipliedPoints;
  this.points.available += multipliedPoints;
  this.lifetimeStats.totalPointsEarned += multipliedPoints;

  this.transactions.push({
    type: "earned",
    points: multipliedPoints,
    description,
    orderId,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
  });

  return multipliedPoints;
};

loyaltyProgramSchema.methods.redeemPoints = function (points, description) {
  if (points > this.points.available) {
    throw new Error("Insufficient points");
  }

  this.points.available -= points;
  this.points.redeemed += points;
  this.lifetimeStats.totalPointsRedeemed += points;

  this.transactions.push({
    type: "redeemed",
    points: -points,
    description,
  });

  return true;
};

loyaltyProgramSchema.methods.updateTier = function () {
  const spending = this.tierProgress.currentSpending;

  let newTier = "bronze";
  let nextRequirement = 10000;
  let multiplier = 1;
  let benefits = {};

  if (spending >= 100000) {
    // ₹1,00,000
    newTier = "platinum";
    nextRequirement = null;
    multiplier = 3;
    benefits = {
      freeShipping: true,
      prioritySupport: true,
      earlyAccess: true,
    };
  } else if (spending >= 50000) {
    // ₹50,000
    newTier = "gold";
    nextRequirement = 100000;
    multiplier = 2;
    benefits = {
      freeShipping: true,
      prioritySupport: true,
      earlyAccess: false,
    };
  } else if (spending >= 10000) {
    // ₹10,000
    newTier = "silver";
    nextRequirement = 50000;
    multiplier = 1.5;
    benefits = {
      freeShipping: true,
      prioritySupport: false,
      earlyAccess: false,
    };
  }

  this.tier = newTier;
  this.tierProgress.nextTierRequirement = nextRequirement;
  this.benefits.pointsMultiplier = multiplier;
  this.benefits = { ...this.benefits, ...benefits };
};

const LoyaltyProgram =
  mongoose.models.LoyaltyProgram ||
  mongoose.model("LoyaltyProgram", loyaltyProgramSchema);

export default LoyaltyProgram;
