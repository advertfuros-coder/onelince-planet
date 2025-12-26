// lib/db/models/Coupon.js
import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["percentage", "fixed", "free_shipping", "buy_x_get_y"],
      required: true,
    },

    // Discount details
    value: {
      type: Number,
      default: 0,
    },

    // For buy_x_get_y offers
    buyQuantity: Number,
    getQuantity: Number,
    buyProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    getProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    // Conditions
    minimumPurchase: {
      type: Number,
      default: 0,
    },

    maximumDiscount: {
      type: Number, // For percentage discounts
    },

    // Applicability
    applicableCategories: [String],
    applicableProducts: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    ],
    excludedCategories: [String],
    excludedProducts: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    ],

    // User restrictions
    firstTimeOnly: {
      type: Boolean,
      default: false,
    },

    applicableUserTypes: {
      type: [String],
      enum: ["all", "new", "returning", "premium"],
      default: ["all"],
    },

    specificUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Usage limits
    usageLimit: {
      total: { type: Number }, // Total times coupon can be used
      perUser: { type: Number, default: 1 },
    },

    usageCount: {
      total: { type: Number, default: 0 },
      users: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          count: { type: Number, default: 0 },
          lastUsed: Date,
        },
      ],
    },

    // Time restrictions
    validFrom: {
      type: Date,
      required: true,
    },

    validUntil: {
      type: Date,
      required: true,
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Metadata
    description: String,
    internalNotes: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Analytics
    analytics: {
      totalRevenue: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      totalDiscount: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// couponSchema.index({ code: 1 }); // Already indexed by unique: true
couponSchema.index({ validFrom: 1, validUntil: 1 });
couponSchema.index({ isActive: 1 });

// Methods
couponSchema.methods.isValid = function (userId, cartTotal, products) {
  const now = new Date();

  // Check if active
  if (!this.isActive) {
    return { valid: false, message: "Coupon is not active" };
  }

  // Check date validity
  if (now < this.validFrom) {
    return { valid: false, message: "Coupon is not yet valid" };
  }

  if (now > this.validUntil) {
    return { valid: false, message: "Coupon has expired" };
  }

  // Check total usage limit
  if (this.usageLimit.total && this.usageCount.total >= this.usageLimit.total) {
    return { valid: false, message: "Coupon usage limit reached" };
  }

  // Check per-user usage limit
  if (userId) {
    const userUsage = this.usageCount.users.find(
      (u) => u.userId.toString() === userId.toString()
    );
    if (
      userUsage &&
      this.usageLimit.perUser &&
      userUsage.count >= this.usageLimit.perUser
    ) {
      return {
        valid: false,
        message: "You have already used this coupon maximum times",
      };
    }
  }

  // Check minimum purchase
  if (this.minimumPurchase && cartTotal < this.minimumPurchase) {
    return {
      valid: false,
      message: `Minimum purchase of ₹${this.minimumPurchase} required`,
    };
  }

  return { valid: true };
};

couponSchema.methods.calculateDiscount = function (cartTotal, items) {
  let discount = 0;

  switch (this.type) {
    case "percentage":
      discount = (cartTotal * this.value) / 100;
      if (this.maximumDiscount) {
        discount = Math.min(discount, this.maximumDiscount);
      }
      break;

    case "fixed":
      discount = Math.min(this.value, cartTotal);
      break;

    case "free_shipping":
      discount = 0; // Handled separately in shipping calculation
      break;

    case "buy_x_get_y":
      // Calculate buy X get Y discount
      // Implementation depends on your cart structure
      break;

    default:
      discount = 0;
  }

  return Math.round(discount * 100) / 100;
};

// Delete cached model to avoid conflicts
if (mongoose.models.Coupon) {
  delete mongoose.models.Coupon;
}

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
