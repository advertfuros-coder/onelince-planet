// lib/db/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["customer", "seller", "admin"],
      default: "customer",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    requirePasswordChange: {
      type: Boolean,
      default: false,
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    // Shopify Integration
    shopifyIntegration: {
      isConnected: { type: Boolean, default: false },
      shopDomain: String,
      encryptedToken: String,
      tokenIV: String,
      tokenAuthTag: String,
      tokenLastFour: String,
      tokenCreatedAt: Date,
      tokenLastValidated: Date,
      tokenScopes: [String],
      isTokenValid: { type: Boolean, default: true },
      lastSyncAt: Date,
      lastSyncStatus: String,
      failedAttempts: { type: Number, default: 0 },
      syncSettings: {
        autoSyncProducts: { type: Boolean, default: true },
        autoSyncInventory: { type: Boolean, default: true },
        autoSyncOrders: { type: Boolean, default: false },
        syncInterval: {
          type: String,
          enum: ["hourly", "daily", "manual"],
          default: "daily",
        },
      },
      allowedIPs: [String],
      require2FA: { type: Boolean, default: false },
    },

    // WooCommerce Integration
    wooCommerceIntegration: {
      isConnected: { type: Boolean, default: false },
      storeUrl: String,
      encryptedConsumerKey: String,
      keyIV: String,
      keyAuthTag: String,
      encryptedConsumerSecret: String,
      secretIV: String,
      secretAuthTag: String,
      keyLastFour: String,
      tokenCreatedAt: Date,
      tokenLastValidated: Date,
      isTokenValid: { type: Boolean, default: true },
      failedAttempts: { type: Number, default: 0 },
      lastSyncAt: Date,
      syncSettings: {
        autoSyncProducts: { type: Boolean, default: true },
        autoSyncInventory: { type: Boolean, default: true },
        autoSyncOrders: { type: Boolean, default: false },
        syncInterval: {
          type: String,
          enum: ["hourly", "daily", "manual"],
          default: "daily",
        },
      },
    },

    // Amazon Integration
    amazonIntegration: {
      isConnected: { type: Boolean, default: false },
      sellerId: String,
      region: String,
      marketplaceId: String,
      encryptedAccessKey: String,
      accessKeyIV: String,
      accessKeyAuthTag: String,
      encryptedSecretKey: String,
      secretKeyIV: String,
      secretKeyAuthTag: String,
      encryptedRefreshToken: String,
      refreshTokenIV: String,
      refreshTokenAuthTag: String,
      accessKeyLastFour: String,
      tokenCreatedAt: Date,
      tokenLastValidated: Date,
      isTokenValid: { type: Boolean, default: true },
      failedAttempts: { type: Number, default: 0 },
      lastSyncAt: Date,
      syncSettings: {
        autoSyncProducts: { type: Boolean, default: true },
        autoSyncInventory: { type: Boolean, default: true },
        autoSyncOrders: { type: Boolean, default: false },
        syncInterval: {
          type: String,
          enum: ["hourly", "daily", "manual"],
          default: "daily",
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.model("User", UserSchema);
