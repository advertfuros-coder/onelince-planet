// lib/db/models/Seller.js
import mongoose from 'mongoose'

const SellerSchema = new mongoose.Schema({
  // User Reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Business Information
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  gstin: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  pan: {
    type: String,
    required: true,
    uppercase: true
  },
  businessType: {
    type: String,
    enum: ['individual', 'proprietorship', 'partnership', 'pvt_ltd', 'public_ltd', 'llp'],
    default: 'individual'
  },
  businessCategory: {
    type: String,
    enum: ['manufacturer', 'wholesaler', 'retailer', 'reseller', 'brand'],
    default: 'retailer'
  },
  establishedYear: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear()
  },
  
  // Bank Details
  bankDetails: {
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true, uppercase: true },
    accountHolderName: { type: String, required: true },
    bankName: { type: String, required: true },
    accountType: { 
      type: String, 
      enum: ['savings', 'current'], 
      default: 'current' 
    },
    branch: String,
    upiId: String
  },

  // Pickup/Warehouse Address
  pickupAddress: {
    addressLine1: { type: String, required: true },
    addressLine2: String,
    landmark: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' },
    latitude: Number,
    longitude: Number,
    isDefault: { type: Boolean, default: true }
  },

  // Additional Warehouses
  warehouses: [{
    name: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String,
    contactPerson: String,
    contactPhone: String,
    isActive: { type: Boolean, default: true }
  }],

  // Store Information (no businessType here)
  storeInfo: {
    storeName: { type: String, required: true },
    storeDescription: String,
    storeLogo: String,
    storeBanner: String,
    storeSlug: { type: String, sparse: true }, // Removed unique: true to avoid duplicate index
    website: String,
    storeCategories: [String],
    returnPolicy: String,
    shippingPolicy: String,
    termsAndConditions: String,
    customerSupportEmail: String,
    customerSupportPhone: String,
    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
      linkedin: String,
      youtube: String
    }
  },

  // Documents
  documents: {
    panCard: {
      url: String,
      verified: { type: Boolean, default: false },
      uploadedAt: Date
    },
    gstCertificate: {
      url: String,
      verified: { type: Boolean, default: false },
      uploadedAt: Date
    },
    idProof: {
      url: String,
      type: { type: String, enum: ['aadhaar', 'passport', 'driving_license', 'voter_id'] },
      verified: { type: Boolean, default: false },
      uploadedAt: Date
    },
    addressProof: {
      url: String,
      verified: { type: Boolean, default: false },
      uploadedAt: Date
    },
    bankStatement: {
      url: String,
      verified: { type: Boolean, default: false },
      uploadedAt: Date
    },
    cancelledCheque: {
      url: String,
      verified: { type: Boolean, default: false },
      uploadedAt: Date
    },
    tradeLicense: {
      url: String,
      verified: { type: Boolean, default: false },
      uploadedAt: Date
    },
    agreementSigned: { 
      type: Boolean, 
      default: false 
    },
    agreementSignedAt: Date
  },

  // Verification Status
  verificationStatus: {
    type: String,
    enum: ['pending', 'under_review', 'documents_required', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  verificationSteps: {
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    documentsVerified: { type: Boolean, default: false },
    bankVerified: { type: Boolean, default: false },
    addressVerified: { type: Boolean, default: false }
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String,
  suspensionReason: String,

  // Subscription & Plans
  subscriptionPlan: {
    type: String,
    enum: ['free', 'basic', 'premium', 'enterprise'],
    default: 'free'
  },
  subscriptionStartDate: Date,
  subscriptionExpiry: Date,

  // Commission & Fees
  commissionRate: {
    type: Number,
    default: 5,
    min: 0,
    max: 100
  },

  // Ratings & Reviews
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    breakdown: {
      five: { type: Number, default: 0 },
      four: { type: Number, default: 0 },
      three: { type: Number, default: 0 },
      two: { type: Number, default: 0 },
      one: { type: Number, default: 0 }
    }
  },

  // Sales Statistics
  salesStats: {
    totalSales: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalProducts: { type: Number, default: 0 },
    activeProducts: { type: Number, default: 0 },
    totalCustomers: { type: Number, default: 0 }
  },

  // Performance Metrics
  performance: {
    orderFulfillmentRate: { type: Number, default: 0 },
    avgShippingTime: { type: Number, default: 0 },
    customerSatisfactionScore: { type: Number, default: 0 }
  },

  // Status Flags
  isActive: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true
})

// Only one index definition per field
SellerSchema.index({ userId: 1 })
SellerSchema.index({ gstin: 1 })
SellerSchema.index({ verificationStatus: 1 })
SellerSchema.index({ isActive: 1 })

// Generate store slug before saving
SellerSchema.pre('save', function(next) {
  if (this.isModified('storeInfo.storeName') && !this.storeInfo.storeSlug) {
    this.storeInfo.storeSlug = this.storeInfo.storeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + this._id.toString().slice(-6)
  }
  next()
})

export default mongoose.models.Seller || mongoose.model('Seller', SellerSchema)
