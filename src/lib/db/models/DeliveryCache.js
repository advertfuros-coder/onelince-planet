// lib/db/models/DeliveryCache.js
import mongoose from "mongoose";

const DeliveryCacheSchema = new mongoose.Schema(
  {
    // Route Identification
    fromHub: {
      type: String,
      required: true,
      index: true,
      // Format: 'MUMBAI_400001'
    },
    toDistrict: {
      type: String,
      required: true,
      index: true,
      // Format: 'BANGALORE_URBAN'
    },

    // Covered Pincodes
    toPincodes: [
      {
        type: String,
        index: true,
      },
    ],

    // Delivery Estimate
    estimate: {
      min: {
        type: Number,
        required: true,
        min: 1,
      },
      max: {
        type: Number,
        required: true,
        min: 1,
      },
      average: {
        type: Number,
        required: true,
      },
      provider: {
        type: String,
        default: "eKart",
        enum: ["eKart", "Shiprocket", "Delhivery", "BlueDart"],
      },
    },

    // Logistics Metadata
    logistics: {
      distance: Number, // in kilometers
      zone: {
        type: String,
        enum: ["Metro", "Tier1", "Tier2", "Tier3", "Remote"],
      },
      serviceability: {
        type: String,
        enum: ["Express", "Standard", "Economy"],
        default: "Standard",
      },
      codAvailable: {
        type: Boolean,
        default: true,
      },
      weight: {
        min: Number, // Min weight supported (kg)
        max: Number, // Max weight supported (kg)
      },
    },

    // Cache Management
    metadata: {
      lastUpdated: {
        type: Date,
        default: Date.now,
        index: true,
      },
      expiresAt: {
        type: Date,
        required: true,
        index: true,
      },
      updateFrequency: {
        type: String,
        enum: ["daily", "weekly", "biweekly"],
        default: "weekly",
      },
      apiCallCount: {
        type: Number,
        default: 1,
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.9,
      },
    },

    // Performance Tracking
    performance: {
      actualDeliveries: Number, // Total deliveries on this route
      averageDelay: Number, // In days (can be negative for early)
      onTimePercentage: Number, // % delivered on time
      lastDelivery: Date,
    },
  },
  {
    timestamps: true,
    collection: "deliverycache",
  }
);

// Compound indexes for efficient queries
DeliveryCacheSchema.index({ fromHub: 1, toDistrict: 1 }, { unique: true });
DeliveryCacheSchema.index({ toPincodes: 1 });
DeliveryCacheSchema.index({ "metadata.expiresAt": 1 });

// Static method to find estimate by pincode
DeliveryCacheSchema.statics.findByPincode = async function (
  fromHub,
  toPincode
) {
  return this.findOne({
    fromHub,
    toPincodes: toPincode,
    "metadata.expiresAt": { $gt: new Date() },
  });
};

// Static method to find expired caches
DeliveryCacheSchema.statics.findExpired = async function () {
  return this.find({
    "metadata.expiresAt": { $lte: new Date() },
  });
};

// Instance method to check if cache is valid
DeliveryCacheSchema.methods.isValid = function () {
  return this.metadata.expiresAt > new Date();
};

// Instance method to refresh expiry
DeliveryCacheSchema.methods.refresh = function (days = 7) {
  this.metadata.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  this.metadata.lastUpdated = new Date();
  this.metadata.apiCallCount += 1;
  return this.save();
};

const DeliveryCache =
  mongoose.models.DeliveryCache ||
  mongoose.model("DeliveryCache", DeliveryCacheSchema);

export default DeliveryCache;
