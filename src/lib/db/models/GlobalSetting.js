import mongoose from "mongoose";

const GlobalSettingSchema = new mongoose.Schema(
  {
    siteIdentity: {
      siteName: { type: String, default: "Online Planet" },
      logoUrl: String,
      faviconUrl: String,
      description: String,
    },
    contact: {
      supportEmail: { type: String, default: "support@example.com" },
      supportPhone: String,
      address: String,
    },
    commission: {
      defaultRate: { type: Number, default: 10 }, // 10%
      taxRate: { type: Number, default: 18 }, // 18% GST likely
    },
    features: {
      enableSellerRegistration: { type: Boolean, default: true },
      enableReviews: { type: Boolean, default: true },
      maintenanceMode: { type: Boolean, default: false },
    },
    socials: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
    },
    // New Settings
    emailSettings: {
      smtpHost: String,
      smtpPort: String,
      smtpUser: String,
      smtpPass: String, // Should be encrypted in real app
      fromEmail: String,
      fromName: String,
    },
    paymentSettings: {
      razorpayId: String,
      razorpaySecret: String,
      stripeKey: String,
      stripeSecret: String,
      currency: { type: String, default: "INR" },
    },
  },
  { timestamps: true }
);

// Ensure only one document exists usually, but we don't strictly enforce singleton here for simplicity
export default mongoose.models.GlobalSetting ||
  mongoose.model("GlobalSetting", GlobalSettingSchema);
