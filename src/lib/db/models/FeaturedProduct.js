import mongoose from "mongoose";

const FeaturedProductSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      enum: ["todays_best_deals", "trending", "new_arrivals", "hot_picks"],
      required: true,
      default: "todays_best_deals",
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
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
      default: null, // Null means no end date
    },
  },
  { timestamps: true }
);

// Index for faster queries
FeaturedProductSchema.index({ section: 1, active: 1, order: 1 });
FeaturedProductSchema.index({ product: 1, section: 1 }, { unique: true }); // Prevent duplicate products in same section

export default mongoose.models.FeaturedProduct ||
  mongoose.model("FeaturedProduct", FeaturedProductSchema);
