// lib/db/models/Advertisement.js
import mongoose from 'mongoose'

const AdvertisementSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Campaign details
  campaignName: {
    type: String,
    required: true,
    trim: true
  },
  campaignType: {
    type: String,
    enum: ['sponsored_product', 'featured_listing', 'banner_ad', 'category_spotlight'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'rejected'],
    default: 'draft'
  },

  // Target products
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],

  // Targeting
  targeting: {
    categories: [String],
    keywords: [String],
    locations: [String], // Cities/states
    demographics: {
      ageRange: {
        min: Number,
        max: Number
      },
      gender: {
        type: String,
        enum: ['all', 'male', 'female', 'other']
      }
    },
    devices: [String], // mobile, desktop, tablet
    timeOfDay: {
      start: String, // "09:00"
      end: String    // "21:00"
    }
  },

  // Budget & Bidding
  budget: {
    type: {
      type: String,
      enum: ['daily', 'total', 'unlimited'],
      default: 'daily'
    },
    amount: {
      type: Number,
      required: true
    },
    spent: {
      type: Number,
      default: 0
    },
    remaining: Number
  },
  
  bidding: {
    strategy: {
      type: String,
      enum: ['cpc', 'cpm', 'cpa'], // Cost per click, impression, acquisition
      default: 'cpc'
    },
    bidAmount: Number,
    maxBid: Number,
    autoBidding: {
      type: Boolean,
      default: false
    }
  },

  // Schedule
  schedule: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    isAlwaysOn: {
      type: Boolean,
      default: false
    }
  },

  // Creative assets
  creative: {
    headline: String,
    description: String,
    images: [String],
    callToAction: {
      type: String,
      enum: ['shop_now', 'learn_more', 'buy_now', 'view_details'],
      default: 'shop_now'
    },
    landingUrl: String
  },

  // Performance metrics
  metrics: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 }, // Click-through rate
    conversionRate: { type: Number, default: 0 },
    roas: { type: Number, default: 0 }, // Return on ad spend
    averageCpc: { type: Number, default: 0 },
    averageCpm: { type: Number, default: 0 }
  },

  // Daily performance tracking
  dailyMetrics: [{
    date: Date,
    impressions: Number,
    clicks: Number,
    conversions: Number,
    spent: Number,
    revenue: Number
  }],

  // Placement
  placement: {
    positions: [String], // 'search_results', 'product_page', 'homepage', 'category_page'
    priority: {
      type: Number,
      default: 1
    }
  },

  // Optimization
  optimization: {
    autoOptimize: {
      type: Boolean,
      default: false
    },
    optimizationGoal: {
      type: String,
      enum: ['clicks', 'conversions', 'revenue', 'impressions']
    },
    learningPhase: {
      type: Boolean,
      default: true
    },
    lastOptimized: Date
  }
}, {
  timestamps: true
})

// Indexes
AdvertisementSchema.index({ sellerId: 1, status: 1 })
AdvertisementSchema.index({ status: 1, 'schedule.startDate': 1 })
AdvertisementSchema.index({ campaignType: 1, status: 1 })

// Method to update metrics
AdvertisementSchema.methods.recordImpression = function() {
  this.metrics.impressions += 1
  return this.save()
}

AdvertisementSchema.methods.recordClick = function() {
  this.metrics.clicks += 1
  this.metrics.ctr = (this.metrics.clicks / this.metrics.impressions) * 100
  
  // Deduct from budget
  if (this.bidding.strategy === 'cpc') {
    this.budget.spent += this.bidding.bidAmount
    this.budget.remaining = this.budget.amount - this.budget.spent
  }
  
  return this.save()
}

AdvertisementSchema.methods.recordConversion = function(revenue) {
  this.metrics.conversions += 1
  this.metrics.revenue += revenue
  this.metrics.conversionRate = (this.metrics.conversions / this.metrics.clicks) * 100
  this.metrics.roas = (this.metrics.revenue / this.budget.spent) * 100
  
  return this.save()
}

// Method to check if campaign should run
AdvertisementSchema.methods.shouldRun = function() {
  if (this.status !== 'active') return false
  
  const now = new Date()
  
  // Check schedule
  if (now < this.schedule.startDate) return false
  if (this.schedule.endDate && now > this.schedule.endDate) return false
  
  // Check budget
  if (this.budget.type !== 'unlimited' && this.budget.spent >= this.budget.amount) return false
  
  return true
}

// Method to get performance summary
AdvertisementSchema.methods.getPerformanceSummary = function() {
  return {
    impressions: this.metrics.impressions,
    clicks: this.metrics.clicks,
    conversions: this.metrics.conversions,
    revenue: this.metrics.revenue,
    spent: this.budget.spent,
    ctr: this.metrics.ctr.toFixed(2),
    conversionRate: this.metrics.conversionRate.toFixed(2),
    roas: this.metrics.roas.toFixed(2),
    averageCpc: this.metrics.clicks > 0 ? (this.budget.spent / this.metrics.clicks).toFixed(2) : 0
  }
}

export default mongoose.models.Advertisement || mongoose.model('Advertisement', AdvertisementSchema)
