// lib/db/models/Cart.js
import mongoose from 'mongoose'

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    price: {
      type: Number,
      required: true
    },
    variant: {
      type: Map,
      of: String
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Cart totals
  totals: {
    subtotal: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    shipping: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },

  // Applied coupons
  coupons: [{
    code: String,
    discount: Number
  }],

  lastModified: {
    type: Date,
    default: Date.now
  }

}, {
  timestamps: true
})

// Update lastModified on save
CartSchema.pre('save', function(next) {
  this.lastModified = Date.now()
  next()
})

// Calculate totals
CartSchema.methods.calculateTotals = function() {
  this.totals.subtotal = this.items.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  )
  this.totals.total = this.totals.subtotal + this.totals.tax + this.totals.shipping - this.totals.discount
  return this.totals
}

export default mongoose.models.Cart || mongoose.model('Cart', CartSchema)
