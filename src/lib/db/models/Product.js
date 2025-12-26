// lib/db/models/Product.js
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    sellerId: {
      // Changed from 'seller' to 'sellerId'
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    shortDescription: String,

    category: {
      type: String, // Or ObjectId if using Category model
      required: true,
    },
    subCategory: String,

    brand: String,
    sku: {
      type: String,
      required: true,
      unique: true,
    },

    pricing: {
      basePrice: {
        type: Number,
        required: true,
      },
      salePrice: Number,
      costPrice: Number,
      discountPercentage: Number,
    },

    inventory: {
      stock: {
        type: Number,
        required: true,
        default: 0,
      },
      lowStockThreshold: {
        type: Number,
        default: 10,
      },
      reorderPoint: {
        type: Number,
        default: 20,
      },
      trackInventory: {
        type: Boolean,
        default: true,
      },
      soldCount: {
        type: Number,
        default: 0,
      },
    },

    // Variant Options (e.g., Color, Size)
    options: [
      {
        name: { type: String, required: true }, // e.g. "Color"
        values: [String], // e.g. ["Red", "Blue"]
      },
    ],

    // Actual Variants
    variants: [
      {
        name: String, // e.g. "Red - S"
        sku: { type: String, sparse: true }, // Unique SKU for variant
        price: Number,
        stock: { type: Number, default: 0 },
        attributes: {
          type: Map,
          of: String, // { "Color": "Red", "Size": "S" }
        },
        imageIndex: { type: Number, default: 0 }, // Link to main images array
      },
    ],

    images: [
      {
        url: String,
        alt: String,
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],

    specifications: [
      {
        key: String,
        value: String,
      },
    ],

    shipping: {
      weight: Number,
      freeShipping: {
        type: Boolean,
        default: false,
      },
      shippingFee: Number,
    },

    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },

    tags: [String],

    isActive: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },

    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

ProductSchema.index({ sellerId: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ isActive: 1, isApproved: 1 });

if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

export default mongoose.model("Product", ProductSchema);
