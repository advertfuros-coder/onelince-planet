// lib/db/models/SellerVerification.js
import mongoose from "mongoose";

const SellerVerificationSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
      unique: true,
      index: true,
    },
    verificationLevel: {
      type: String,
      enum: ["none", "basic", "verified", "premium", "elite"],
      default: "none",
    },
    badges: [
      {
        type: {
          type: String,
          enum: [
            "verified",
            "top_seller",
            "fast_shipper",
            "quality_products",
            "responsive",
            "trusted",
          ],
          required: true,
        },
        earnedAt: {
          type: Date,
          default: Date.now,
        },
        criteria: String,
      },
    ],
    documents: [
      {
        type: {
          type: String,
          enum: [
            "business_license",
            "tax_id",
            "identity_proof",
            "address_proof",
            "bank_details",
          ],
          required: true,
        },
        url: String,
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        reviewedAt: Date,
        reviewedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        notes: String,
      },
    ],
    metrics: {
      totalSales: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      responseTime: { type: Number, default: 0 }, // in hours
      fulfillmentRate: { type: Number, default: 0 }, // percentage
      returnRate: { type: Number, default: 0 }, // percentage
      onTimeDelivery: { type: Number, default: 0 }, // percentage
    },
    verificationHistory: [
      {
        level: String,
        changedAt: {
          type: Date,
          default: Date.now,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reason: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Method to check if seller qualifies for badge
SellerVerificationSchema.methods.checkBadgeEligibility = function () {
  const badges = [];

  // Verified Badge - All documents approved
  if (this.documents.every((doc) => doc.status === "approved")) {
    badges.push({ type: "verified", criteria: "All documents verified" });
  }

  // Top Seller - High sales and rating
  if (this.metrics.totalSales >= 100000 && this.metrics.averageRating >= 4.5) {
    badges.push({
      type: "top_seller",
      criteria: "High sales volume and excellent ratings",
    });
  }

  // Fast Shipper - Quick fulfillment
  if (this.metrics.fulfillmentRate >= 95 && this.metrics.onTimeDelivery >= 90) {
    badges.push({ type: "fast_shipper", criteria: "Consistent fast shipping" });
  }

  // Quality Products - Low return rate
  if (this.metrics.returnRate <= 5 && this.metrics.averageRating >= 4.0) {
    badges.push({
      type: "quality_products",
      criteria: "Low return rate and good ratings",
    });
  }

  // Responsive - Quick response time
  if (this.metrics.responseTime <= 2) {
    badges.push({ type: "responsive", criteria: "Responds within 2 hours" });
  }

  // Trusted - Overall excellence
  if (
    this.verificationLevel === "premium" ||
    this.verificationLevel === "elite"
  ) {
    badges.push({ type: "trusted", criteria: "Premium verified seller" });
  }

  return badges;
};

export default mongoose.models.SellerVerification ||
  mongoose.model("SellerVerification", SellerVerificationSchema);
