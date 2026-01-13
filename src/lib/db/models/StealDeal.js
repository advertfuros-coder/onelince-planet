import mongoose from "mongoose";

const StealDealSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    stealPrice: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    quantity: {
      type: String,
      default: "1 unit",
    },
    limitedStock: {
      type: Boolean,
      default: false,
    },
    stockRemaining: {
      type: Number,
      default: null,
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
  },
  { timestamps: true }
);

// Virtual for discount percentage
StealDealSchema.virtual("discountPercentage").get(function () {
  return Math.round(
    ((this.originalPrice - this.stealPrice) / this.originalPrice) * 100
  );
});

// Ensure virtuals are included in JSON
StealDealSchema.set("toJSON", { virtuals: true });
StealDealSchema.set("toObject", { virtuals: true });

// Index for faster queries
StealDealSchema.index({ active: 1, order: 1 });
StealDealSchema.index({ product: 1 }, { unique: true }); // One steal deal per product

export default mongoose.models.StealDeal ||
  mongoose.model("StealDeal", StealDealSchema);
