// lib/db/models/Review.js
import mongoose from 'mongoose'

const ReviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
     },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    images: [String],
    isApproved: {
      type: Boolean,
      default: false,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Number,
      default: 0,
    },
    unhelpful: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema)
