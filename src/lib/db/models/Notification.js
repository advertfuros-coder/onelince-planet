// lib/db/models/Notification.js
import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    // Recipient
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Notification Type
    type: {
      type: String,
      enum: [
        "NEW_ORDER",
        "ORDER_PROCESSING",
        "ORDER_SHIPPED",
        "ORDER_CANCELLED",
        "RETURN_REQUESTED",
        "RETURN_RECEIVED",
        "RETURN_PROCESSED",
        "LOW_STOCK",
        "OUT_OF_STOCK",
        "PRODUCT_APPROVED",
        "PRODUCT_REJECTED",
        "PAYOUT_INITIATED",
        "PAYOUT_COMPLETED",
        "PAYOUT_FAILED",
        "REVIEW_RECEIVED",
        "COMPETITOR_PRICE_ALERT",
        "CAMPAIGN_PERFORMANCE",
        "SYSTEM_MAINTENANCE",
        "SECURITY_ALERT",
      ],
      required: true,
    },

    category: {
      type: String,
      enum: [
        "sales",
        "inventory",
        "financial",
        "customers",
        "marketing",
        "system",
      ],
      default: "system",
      index: true,
    },

    subType: String, // Dynamic sub-category tracking

    // Priority
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    // Content
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: true,
      maxlength: 500,
    },

    // Action URL
    actionUrl: {
      type: String,
    },

    actionText: {
      type: String,
      default: "View Details",
    },

    // Related Entity
    relatedEntity: {
      type: {
        type: String,
        enum: ["order", "product", "seller", "user", "review", "payout"],
      },
      id: mongoose.Schema.Types.ObjectId,
    },

    // Status
    read: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: Date,

    // Metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },

    // Expiry (optional)
    expiresAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, priority: 1 });

// Mark as read
NotificationSchema.methods.markAsRead = function () {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Auto-delete expired notifications
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
