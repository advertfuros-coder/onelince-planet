// lib/db/models/PayoutRequest.js
import mongoose from 'mongoose'

const payoutRequestSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'processed'],
      default: 'pending',
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    processedDate: {
      type: Date,
    },
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      accountHolderName: String,
      bankName: String,
    },
    upiId: {
      type: String,
    },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'upi'],
      default: 'bank_transfer',
    },
    transactionId: {
      type: String,
    },
    notes: {
      type: String,
    },
    adminNotes: {
      type: String,
    },
    rejectionReason: {
      type: String,
    },
  },
  { timestamps: true }
)

// Indexes for performance
payoutRequestSchema.index({ sellerId: 1, status: 1 })
payoutRequestSchema.index({ status: 1, requestDate: -1 })

export default mongoose.models.PayoutRequest || mongoose.model('PayoutRequest', payoutRequestSchema)
