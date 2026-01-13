import mongoose from "mongoose";

const HomepageBannerSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["main", "sale"],
      required: true,
    },
    title: String,
    subtitle: String,
    description: String,
    productImage: String,
    buttonText: String,
    buttonLink: String,

    // Styling
    bgColor: String, // Gradient or solid
    textColor: String,

    // Text Alignment
    textAlign: {
      vertical: {
        type: String,
        enum: ["top", "center", "bottom"],
        default: "center",
      },
      horizontal: {
        type: String,
        enum: ["left", "center", "right"],
        default: "left",
      },
    },

    // Button Styling
    buttonStyle: {
      bgColor: String,
      textColor: String,
      align: { type: String, enum: ["left", "center", "right"], default: "left" }
    },

    // Image Alignment
    imagePosition: {
      horizontal: {
        type: String,
        enum: ["left", "center", "right"],
        default: "right",
      },
      vertical: {
        type: String,
        enum: ["top", "center", "bottom"],
        default: "center",
      },
    },

    containerBg: String,
    customTextColor: String,
    discount: String,

    // Visibility toggles
    showTitle: { type: Boolean, default: true },
    showSubtitle: { type: Boolean, default: true },
    showDescription: { type: Boolean, default: true },
    showButton: { type: Boolean, default: true },

    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, strict: false }
);

export default mongoose.models.HomepageBanner ||
  mongoose.model("HomepageBanner", HomepageBannerSchema);
