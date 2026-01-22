import mongoose from "mongoose";

const TrendingProductSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    priority: {
      type: Number,
      default: 0,
      description: "Lower number = higher priority (shows first)",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      description: "Admin who added this product to trending",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      description: "Optional end date for trending period",
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
TrendingProductSchema.index({ isActive: 1, priority: 1 });
TrendingProductSchema.index({ product: 1 }, { unique: true });

export default mongoose.models.TrendingProduct ||
  mongoose.model("TrendingProduct", TrendingProductSchema);
