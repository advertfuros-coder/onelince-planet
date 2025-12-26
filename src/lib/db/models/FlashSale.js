// lib/db/models/FlashSale.js
import mongoose from "mongoose";

const flashSaleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: String,

    // Sale timing
    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    // Products on sale
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        originalPrice: Number,
        salePrice: {
          type: Number,
          required: true,
        },
        discountPercentage: Number,
        stockLimit: Number, // Limit quantity for flash sale
        soldCount: {
          type: Number,
          default: 0,
        },
      },
    ],

    // Display settings
    featured: {
      type: Boolean,
      default: false,
    },

    banner: {
      image: String,
      mobileImage: String,
    },

    priority: {
      type: Number,
      default: 0, // Higher priority shows first
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Analytics
    analytics: {
      totalViews: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
flashSaleSchema.index({ startTime: 1, endTime: 1 });
flashSaleSchema.index({ isActive: 1, featured: 1 });

// Methods
flashSaleSchema.methods.isLive = function () {
  const now = new Date();
  return this.isActive && now >= this.startTime && now <= this.endTime;
};

flashSaleSchema.methods.getTimeRemaining = function () {
  const now = new Date();
  const diff = this.endTime - now;

  if (diff <= 0) return null;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
};

const FlashSale =
  mongoose.models.FlashSale || mongoose.model("FlashSale", flashSaleSchema);

export default FlashSale;
