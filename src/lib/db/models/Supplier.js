// lib/db/models/Supplier.js
import mongoose from "mongoose";

const SupplierSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Supplier details
    name: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: String,
    email: {
      type: String,
      required: true,
    },
    phone: String,

    // Address
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },

    // Products supplied
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        sku: String,
        supplierSKU: String,
        unitPrice: Number,
        minOrderQuantity: Number,
        leadTimeDays: Number,
        isPreferred: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Auto-restock settings
    autoRestock: {
      enabled: {
        type: Boolean,
        default: false,
      },
      method: {
        type: String,
        enum: ["email", "api", "manual"],
        default: "email",
      },
      apiEndpoint: String,
      apiKey: String,
    },

    // Payment terms
    paymentTerms: {
      type: String,
      enum: ["prepaid", "net_30", "net_60", "net_90", "cod"],
      default: "net_30",
    },

    // Performance metrics
    metrics: {
      totalOrders: { type: Number, default: 0 },
      onTimeDeliveryRate: { type: Number, default: 100 },
      averageLeadTime: { type: Number, default: 0 },
      lastOrderDate: Date,
      rating: {
        type: Number,
        default: 5,
        min: 1,
        max: 5,
      },
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
SupplierSchema.index({ sellerId: 1, isActive: 1 });
SupplierSchema.index({ "products.productId": 1 });

// Method to get supplier for product
SupplierSchema.statics.getPreferredSupplier = async function (
  productId,
  sellerId
) {
  const supplier = await this.findOne({
    sellerId,
    isActive: true,
    "products.productId": productId,
    "products.isPreferred": true,
  });

  if (supplier) return supplier;

  // If no preferred, return any supplier for this product
  return this.findOne({
    sellerId,
    isActive: true,
    "products.productId": productId,
  });
};

export default mongoose.models.Supplier ||
  mongoose.model("Supplier", SupplierSchema);
