// lib/db/models/Order.js
import mongoose from 'mongoose'

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true, sparse: true },

  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String,
    price: Number,
    quantity: Number,
    images: [String],
    status: { type: String, enum: ['pending','processing','shipped','delivered','cancelled','returned'], default: 'pending' }
  }],

  pricing: {
    subtotal: Number,
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: Number
  },

  shippingAddress: {
    name: String,
    phone: String,
    email: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },

  status: { type: String, enum: ['pending','processing','confirmed','shipped','delivered','cancelled','returned','refunded'], default: 'pending' },

  payment: {
    method: { type: String, enum: ['cod','online','card','upi','wallet'], required: true },
    status: { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending' },
    transactionId: String,
    paidAt: Date
  },

  shipping: {
    trackingId: String,
    carrier: String,
    shippedAt: Date,
    estimatedDelivery: Date,
    deliveredAt: Date
  },

  timeline: [{
    status: String,
    description: String,
    timestamp: { type: Date, default: Date.now }
  }],

  cancellation: {
    reason: String,
    cancelledBy: String,
    cancelledAt: Date
  },

  returnRequest: {
    reason: String,
    status: { type: String, enum: ['requested','approved','rejected','refunded'], default: null },
    requestedAt: Date,
    resolvedAt: Date,
    refundAmount: Number
  }

}, { timestamps: true })

export default mongoose.models.Order || mongoose.model('Order', OrderSchema)
