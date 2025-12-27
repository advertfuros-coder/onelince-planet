// lib/db/models/InventoryLog.js
import mongoose from "mongoose";

const InventoryLogSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
    },
    type: {
      type: String,
      enum: [
        "addition",
        "subtraction",
        "transfer",
        "sale",
        "return",
        "adjustment",
        "damaged",
      ],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId, // Order ID, Transfer ID, etc.
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  }
);

InventoryLogSchema.index({ createdAt: -1 });

export default mongoose.models.InventoryLog ||
  mongoose.model("InventoryLog", InventoryLogSchema);
