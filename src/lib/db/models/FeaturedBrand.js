import mongoose from "mongoose";

const FeaturedBrandSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      default: "Brand Name",
    },
    image: {
      type: String,
      required: true,
      default: "",
    },
    redirectUrl: {
      type: String,
      required: true,
      default: "/",
    },
    order: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.FeaturedBrand ||
  mongoose.model("FeaturedBrand", FeaturedBrandSchema);
