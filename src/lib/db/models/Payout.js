// lib/db/models/Payout.js
import mongoose from 'mongoose'

const PayoutSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    transactionId: String,
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
    },
    processedAt: Date,
    completedAt: Date,
    failedReason: String,
  },
  { timestamps: true }
)

export default mongoose.models.Payout || mongoose.model('Payout', PayoutSchema)
