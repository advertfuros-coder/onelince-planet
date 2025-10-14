import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },

    // Discount Configuration
    discountType: {
      type: String,
      enum: ['percentage', 'fixed', 'free_shipping'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number, // For percentage type - maximum discount cap
      default: null,
    },

    // Coupon Scope
    scope: {
      type: String,
      enum: ['platform', 'seller', 'product', 'category'],
      default: 'platform',
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      default: null,
    },
    applicableProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }],
    applicableCategories: [String],

    // Purchase Requirements
    minPurchaseAmount: {
      type: Number,
      default: 0,
    },
    minItemQuantity: {
      type: Number,
      default: 1,
    },

    // Usage Limits
    totalUsageLimit: {
      type: Number,
      default: null, // null = unlimited
    },
    perUserLimit: {
      type: Number,
      default: 1,
    },
    currentUsageCount: {
      type: Number,
      default: 0,
    },

    // Date Validity
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },

    // User Eligibility
    userEligibility: {
      type: String,
      enum: ['all', 'new_customers', 'specific_users'],
      default: 'all',
    },
    specificUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    specificUserEmails: [String],

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Tracking
    usedBy: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
      usedAt: {
        type: Date,
        default: Date.now,
      },
      discountApplied: Number,
    }],

    // Creator
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    creatorType: {
      type: String,
      enum: ['admin', 'seller'],
      default: 'admin',
    },
  },
  { timestamps: true }
);

// Indexes
CouponSchema.index({ code: 1 });
CouponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
CouponSchema.index({ scope: 1, sellerId: 1 });

// Check if coupon is valid
CouponSchema.methods.isValid = function() {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.startDate &&
    now <= this.endDate &&
    (this.totalUsageLimit === null || this.currentUsageCount < this.totalUsageLimit)
  );
};

export default mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
