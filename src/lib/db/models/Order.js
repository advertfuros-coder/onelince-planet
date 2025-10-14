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
    sku: String,
    hsn: String,
    weight: { type: Number, default: 0.5 }, // in kg
    status: { 
      type: String, 
      enum: ['pending','processing','shipped','delivered','cancelled','returned'], 
      default: 'pending' 
    }
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

  status: { 
    type: String, 
    enum: ['pending','processing','confirmed','ready_for_pickup','pickup','shipped','delivered','cancelled','returned','refunded'], 
    default: 'confirmed' 
  },

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

  // ✅ NEW: Shiprocket Integration Fields
  shiprocket: {
    orderId: String,              // Shiprocket order ID
    shipmentId: String,           // Shiprocket shipment ID
    awbCode: String,              // Air Waybill Number
    courierName: String,          // Courier company name
    courierId: Number,            // Courier company ID
    pickupScheduledDate: Date,
    pickupTokenNumber: String,
    label: String,                // Label URL
    manifest: String,             // Manifest URL
    invoice: String,              // Invoice URL
    status: String,               // Shiprocket status
    currentStatus: String,        // Current delivery status
    etd: Date,                    // Estimated Time of Delivery
  },

  // ✅ NEW: Pickup Management
  pickup: {
    sellerMarked: { type: Boolean, default: false },
    sellerMarkedAt: Date,
    adminAssigned: { type: Boolean, default: false },
    adminAssignedAt: Date,
    adminAssignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    scheduled: { type: Boolean, default: false },
    scheduledDate: Date,
    pickedUp: { type: Boolean, default: false },
    pickedUpAt: Date,
    address: {
      name: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' }
    }
  },

  // ✅ NEW: Delivery Tracking
  deliveryTracking: [{
    status: String,
    statusCode: String,
    activity: String,
    location: String,
    timestamp: Date,
    instructions: String
  }],

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
    title: String,
    description: String,
    images: [String],
    status: {
      type: String,
      enum: ['requested', 'approved', 'rejected', 'refunded'],
      default: 'requested'
    },
    requestedAt: Date,
    resolvedAt: Date,
    refundAmount: Number
  },

  // ✅ NEW: Package Dimensions
  dimensions: {
    length: { type: Number, default: 10 }, // in cm
    breadth: { type: Number, default: 10 }, // in cm
    height: { type: Number, default: 10 }, // in cm
    weight: { type: Number, default: 0.5 } // in kg
  }

}, { timestamps: true })

export default mongoose.models.Order || mongoose.model('Order', OrderSchema)
