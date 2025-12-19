import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a campaign name"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Please provide a campaign type"],
      enum: ["email", "social", "search", "display", "referral", "other"],
      default: "other",
    },
    status: {
      type: String,
      enum: ["active", "paused", "completed", "draft", "scheduled"],
      default: "draft",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    budget: {
      type: Number,
      default: 0,
    },
    spent: {
      type: Number,
      default: 0,
    },
    targetAudience: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    stats: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Campaign ||
  mongoose.model("Campaign", campaignSchema);
