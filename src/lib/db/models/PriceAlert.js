// lib/db/models/PriceAlert.js
import mongoose from "mongoose";

const PriceAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    targetPrice: {
      type: Number,
      required: true,
    },
    currentPrice: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notified: {
      type: Boolean,
      default: false,
    },
    notifiedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
PriceAlertSchema.index({ userId: 1, productId: 1 });
PriceAlertSchema.index({ isActive: 1, notified: 1 });

export default mongoose.models.PriceAlert ||
  mongoose.model("PriceAlert", PriceAlertSchema);
