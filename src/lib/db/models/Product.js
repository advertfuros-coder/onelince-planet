// lib/db/models/Product.js
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },

    name: {
      type: String,
      required: function () {
        return this.get("isDraft") !== true;
      },
      trim: true,
    },
    description: String,
    shortDescription: String,

    // Category (supports both new hierarchical and old string-based)
    category: {
      type: mongoose.Schema.Types.Mixed, // Can be ObjectId or String
      required: function () {
        return this.get("isDraft") !== true;
      },
    },
    categoryPath: String, // e.g., "fashion/men/t-shirts" - for efficient filtering
    subCategory: String, // Deprecated but kept for backwards compatibility

    brand: String,
    sku: {
      type: String,
      required: function () {
        return this.get("isDraft") !== true;
      },
      unique: true,
      sparse: true, // Allow multiple null/empty SKUs for drafts
    },

    pricing: {
      basePrice: {
        type: Number,
        required: function () {
          const isDraft = this.get ? this.get("isDraft") : this.isDraft;
          return isDraft !== true;
        },
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

    // Delivery Estimate (Pre-calculated, no API calls needed)
    deliveryEstimate: {
      domestic: {
        min: { type: Number, default: 2 }, // Minimum days for domestic delivery
        max: { type: Number, default: 5 }, // Maximum days for domestic delivery
      },
      international: {
        min: { type: Number, default: 7 }, // Minimum days for international delivery
        max: { type: Number, default: 14 }, // Maximum days for international delivery
      },
      lastUpdated: { type: Date, default: Date.now },
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
    keywords: [String], // Backend search terms
    highlights: [String], // Key feature bullet points
    hsnCode: String, // For tax/compliance

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

    isDraft: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },

    // Integration Fields
    shopifyProductId: String,
    shopifyVariantId: String,
    wooCommerceProductId: String,
    amazonASIN: String,
    amazonSKU: String,
    importedFrom: {
      type: String,
      enum: ["manual", "shopify", "woocommerce", "amazon", "csv", "api"],
      default: "manual",
    },
    lastSyncedAt: Date,
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
