import mongoose from "mongoose";

const CouponBannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    discountType: {
      type: String,
      enum: ["flat", "percentage"],
      default: "flat",
    },
    backgroundColor: {
      type: String,
      default: "#92C7CF",
    },
    textColor: {
      type: String,
      default: "#FFD66B",
    },
    order: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    termsAndConditions: {
      type: String,
      default: "T&C Apply",
    },
  },
  { timestamps: true }
);

// Index for faster queries
CouponBannerSchema.index({ active: 1, order: 1 });

export default mongoose.models.CouponBanner ||
  mongoose.model("CouponBanner", CouponBannerSchema);
