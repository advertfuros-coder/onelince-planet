// lib/db/models/ProductQA.js
import mongoose from "mongoose";

const productQASchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Question
    question: {
      text: {
        type: String,
        required: true,
        maxlength: 500,
      },
      askedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      askedAt: {
        type: Date,
        default: Date.now,
      },
    },

    // Answers
    answers: [
      {
        text: {
          type: String,
          required: true,
          maxlength: 1000,
        },
        answeredBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        answeredAt: {
          type: Date,
          default: Date.now,
        },
        isSeller: {
          type: Boolean,
          default: false,
        },
        isVerifiedPurchase: {
          type: Boolean,
          default: false,
        },
        helpful: {
          count: { type: Number, default: 0 },
          users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        },
      },
    ],

    // Moderation
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved", // Auto-approve for faster user experience
    },

    // Analytics
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
productQASchema.index({ productId: 1, createdAt: -1 });
productQASchema.index({ "question.askedBy": 1 });

// Delete cached model
if (mongoose.models.ProductQA) {
  delete mongoose.models.ProductQA;
}

const ProductQA = mongoose.model("ProductQA", productQASchema);

export default ProductQA;
