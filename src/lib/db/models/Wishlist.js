// lib/db/models/Wishlist.js
import mongoose from "mongoose";

const WishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Compound index for efficient queries
WishlistSchema.index({ userId: 1, "items.productId": 1 });

// Method to add item to wishlist
WishlistSchema.methods.addItem = function (productId) {
  const exists = this.items.some(
    (item) => item.productId.toString() === productId.toString(),
  );
  if (!exists) {
    this.items.push({ productId });
  }
  return this.save();
};

// Method to remove item from wishlist
WishlistSchema.methods.removeItem = function (productId) {
  this.items = this.items.filter(
    (item) => item.productId.toString() !== productId.toString(),
  );
  return this.save();
};

// Method to check if product is in wishlist
WishlistSchema.methods.hasProduct = function (productId) {
  return this.items.some(
    (item) => item.productId.toString() === productId.toString(),
  );
};

export default mongoose.models.Wishlist ||
  mongoose.model("Wishlist", WishlistSchema);
