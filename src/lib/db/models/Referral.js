// lib/db/models/Referral.js
import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
  {
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    referralCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },

    // Rewards
    referrerReward: {
      type: {
        type: String,
        enum: ["points", "discount", "cash"],
        default: "points",
      },
      value: { type: Number, default: 100 },
    },

    refereeReward: {
      type: {
        type: String,
        enum: ["points", "discount", "cash"],
        default: "discount",
      },
      value: { type: Number, default: 50 },
    },

    // Conditions
    minimumPurchase: {
      type: Number,
      default: 0,
    },

    // Usage tracking
    uses: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        orderValue: Number,
        rewardGiven: Boolean,
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // Analytics
    analytics: {
      totalReferred: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
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

// Indexes
referralSchema.index({ referralCode: 1 });
referralSchema.index({ referrerId: 1 });

const Referral =
  mongoose.models.Referral || mongoose.model("Referral", referralSchema);

export default Referral;
