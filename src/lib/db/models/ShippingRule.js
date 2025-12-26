// lib/db/models/ShippingRule.js
import mongoose from 'mongoose'

const ShippingRuleSchema = new mongoose.Schema({
  sellerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  name: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true },
  type: { 
    type: String, 
    enum: ['weight', 'price', 'flat'], 
    default: 'price' 
  },
  conditions: {
    minOrderValue: Number,
    maxOrderValue: Number,
    minWeight: Number,
    maxWeight: Number
  },
  pricing: {
    baseRate: { type: Number, required: true },
    freeShippingThreshold: Number
  },
  deliveryTime: { type: String, default: '3-5 business days' }
}, { timestamps: true })

export default mongoose.models.ShippingRule || mongoose.model('ShippingRule', ShippingRuleSchema)
