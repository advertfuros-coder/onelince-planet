// lib/db/models/Message.js
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    // Optional: grouping by order or product context
    context: {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying of conversations
MessageSchema.index({ sender: 1, recipient: 1 });
MessageSchema.index({ recipient: 1, sender: 1 });

export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema);
