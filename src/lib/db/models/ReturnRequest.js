import mongoose from "mongoose";

const ReturnRequestSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        variantSku: String,
        name: String,
        price: Number,
        quantity: Number,
        reason: String,
        type: {
          type: String,
          enum: ["return", "replacement"],
          default: "return",
        },
      },
    ],
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "picked_up",
        "received",
        "completed",
      ],
      default: "pending",
    },
    adminNotes: String,
    sellerNotes: String,
    evidence: [String],
    description: String,
  },
  { timestamps: true },
);

export default mongoose.models.ReturnRequest ||
  mongoose.model("ReturnRequest", ReturnRequestSchema);
