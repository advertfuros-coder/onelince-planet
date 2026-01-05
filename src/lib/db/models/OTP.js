// lib/db/models/OTP.js
import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  used: {
    type: Boolean,
    default: false,
  },
  // Store registration data until verified
  userData: {
    name: String,
    password: { type: String, select: false },
    phone: String,
    role: { type: String, default: 'customer' },
  }
}, { timestamps: true });

// Delete OTPs after they expire (TTL index)
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// If model already exists, use it, otherwise create new one
const OTP = mongoose.models.OTP || mongoose.model("OTP", OTPSchema);

export default OTP;
