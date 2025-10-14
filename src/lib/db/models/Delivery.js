// lib/db/models/Delivery.js
import mongoose from 'mongoose'

const DeliverySchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller'
  },
  status: {
    type: String,
    enum: ['pending', 'dispatched', 'in_transit', 'delivered', 'failed'],
    default: 'pending'
  },
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  deliveryPartner: String,
  trackingNumber: String,
  notes: String
}, {
  timestamps: true
})

export default mongoose.models.Delivery || mongoose.model('Delivery', DeliverySchema)
