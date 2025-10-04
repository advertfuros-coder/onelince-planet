// scripts/seedFullSellerData.js
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '.env.local' })

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  role: String,
  isVerified: Boolean
}, { timestamps: true })

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

// Seller Schema (same as your model)
const sellerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  businessName: { type: String, required: true, trim: true },
  gstin: { type: String, required: true, unique: true, uppercase: true },
  pan: { type: String, required: true, uppercase: true },
  businessType: { type: String, enum: ['individual', 'proprietorship', 'partnership', 'pvt_ltd', 'public_ltd', 'llp'], default: 'individual' },
  businessCategory: { type: String, enum: ['manufacturer', 'wholesaler', 'retailer', 'reseller', 'brand'], default: 'retailer' },
  establishedYear: { type: Number, min: 1900, max: new Date().getFullYear() },
  bankDetails: {
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true, uppercase: true },
    accountHolderName: { type: String, required: true },
    bankName: { type: String, required: true },
    accountType: { type: String, enum: ['savings', 'current'], default: 'current' },
    branch: String,
    upiId: String
  },
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
  storeInfo: {
    storeName: { type: String, required: true },
    storeDescription: String,
    storeLogo: String,
    storeBanner: String,
    storeSlug: { type: String, sparse: true },
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
  documents: {
    panCard: { url: String, verified: { type: Boolean, default: false }, uploadedAt: Date },
    gstCertificate: { url: String, verified: { type: Boolean, default: false }, uploadedAt: Date },
    idProof: { url: String, type: { type: String, enum: ['aadhaar', 'passport', 'driving_license', 'voter_id'] }, verified: { type: Boolean, default: false }, uploadedAt: Date },
    addressProof: { url: String, verified: { type: Boolean, default: false }, uploadedAt: Date },
    bankStatement: { url: String, verified: { type: Boolean, default: false }, uploadedAt: Date },
    cancelledCheque: { url: String, verified: { type: Boolean, default: false }, uploadedAt: Date },
    tradeLicense: { url: String, verified: { type: Boolean, default: false }, uploadedAt: Date },
    agreementSigned: { type: Boolean, default: false },
    agreementSignedAt: Date
  },
  verificationStatus: { type: String, enum: ['pending', 'under_review', 'documents_required', 'approved', 'rejected', 'suspended'], default: 'pending' },
  verificationSteps: {
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    documentsVerified: { type: Boolean, default: false },
    bankVerified: { type: Boolean, default: false },
    addressVerified: { type: Boolean, default: false }
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  rejectionReason: String,
  suspensionReason: String,
  subscriptionPlan: { type: String, enum: ['free', 'basic', 'premium', 'enterprise'], default: 'free' },
  subscriptionStartDate: Date,
  subscriptionExpiry: Date,
  commissionRate: { type: Number, default: 5, min: 0, max: 100 },
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
  salesStats: {
    totalSales: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalProducts: { type: Number, default: 0 },
    activeProducts: { type: Number, default: 0 },
    totalCustomers: { type: Number, default: 0 }
  },
  performance: {
    orderFulfillmentRate: { type: Number, default: 0 },
    avgShippingTime: { type: Number, default: 0 },
    customerSatisfactionScore: { type: Number, default: 0 }
  },
  isActive: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', userSchema)
const Seller = mongoose.models.Seller || mongoose.model('Seller', sellerSchema)

async function seedFullSellerData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    // Delete existing test data
    await User.deleteOne({ email: 'rajesh@techstore.com' })
    await Seller.deleteOne({ gstin: '27AABCT1234Q1Z5' })
    console.log('🗑️  Cleaned existing test data\n')

    // 1. CREATE USER
    const user = await User.create({
      name: 'Rajesh Kumar',
      email: 'rajesh@techstore.com',
      password: 'seller123456',
      phone: '+91-9876543210',
      role: 'seller',
      isVerified: true
    })
    console.log('✅ User Created')
    console.log(`   📧 Email: ${user.email}`)
    console.log(`   🔑 Password: seller123456\n`)

    // 2. CREATE COMPLETE SELLER PROFILE
    const seller = await Seller.create({
      userId: user._id,
      
      // Business Details
      businessName: 'TechStore India Pvt Ltd',
      gstin: '27AABCT1234Q1Z5',
      pan: 'AABCT1234Q',
      businessType: 'pvt_ltd',
      businessCategory: 'retailer',
      establishedYear: 2018,

      // Bank Details
      bankDetails: {
        accountNumber: '1234567890123456',
        ifscCode: 'HDFC0001234',
        accountHolderName: 'TechStore India Pvt Ltd',
        bankName: 'HDFC Bank',
        accountType: 'current',
        branch: 'Andheri West, Mumbai',
        upiId: 'techstore@hdfcbank'
      },

      // Main Pickup Address
      pickupAddress: {
        addressLine1: 'Shop No. 45, Tech Plaza, Ground Floor',
        addressLine2: 'Near Metro Station',
        landmark: 'Opposite City Mall',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India',
        latitude: 19.0760,
        longitude: 72.8777,
        isDefault: true
      },

      // Multiple Warehouses
      warehouses: [
        {
          name: 'Main Warehouse - Navi Mumbai',
          addressLine1: 'Plot No. 23, Sector 11',
          addressLine2: 'Industrial Area, MIDC',
          city: 'Navi Mumbai',
          state: 'Maharashtra',
          pincode: '400708',
          contactPerson: 'Amit Singh',
          contactPhone: '+91-9876543211',
          isActive: true
        },
        {
          name: 'Secondary Warehouse - Pune',
          addressLine1: 'Gala No. 12, Phase 2',
          addressLine2: 'Chakan Industrial Area',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411019',
          contactPerson: 'Priya Sharma',
          contactPhone: '+91-9876543212',
          isActive: true
        },
        {
          name: 'North India Hub - Delhi',
          addressLine1: 'Warehouse 5, Okhla Industrial Estate',
          addressLine2: 'Phase 3',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110020',
          contactPerson: 'Rahul Verma',
          contactPhone: '+91-9876543213',
          isActive: true
        }
      ],

      // Store Information
      storeInfo: {
        storeName: 'TechStore India',
        storeDescription: 'Your trusted destination for premium electronics and gadgets. We offer the latest technology products from top brands with warranty and excellent after-sales service. Authorized dealer and service center.',
        storeLogo: 'https://via.placeholder.com/200x200/4F46E5/FFFFFF?text=TechStore',
        storeBanner: 'https://via.placeholder.com/1200x400/6366F1/FFFFFF?text=TechStore+India',
        storeSlug: 'techstore-india',
        website: 'https://techstoreindia.com',
        storeCategories: [
          'Electronics',
          'Mobile Phones',
          'Laptops & Computers',
          'Gaming',
          'Accessories',
          'Smart Home',
          'Audio & Video'
        ],
        returnPolicy: '7-day hassle-free returns on all products. No questions asked for manufacturing defects.',
        shippingPolicy: 'Free shipping on orders above ₹500. Same-day delivery available in Mumbai. Next-day delivery in metro cities.',
        termsAndConditions: 'All products come with manufacturer warranty. Invoice will be provided for all purchases.',
        customerSupportEmail: 'support@techstoreindia.com',
        customerSupportPhone: '+91-9876543210',
        socialMedia: {
          facebook: 'https://facebook.com/techstoreindia',
          instagram: 'https://instagram.com/techstoreindia',
          twitter: 'https://twitter.com/techstoreindia',
          linkedin: 'https://linkedin.com/company/techstoreindia',
          youtube: 'https://youtube.com/@techstoreindia'
        }
      },

      // All Documents (Verified)
      documents: {
        panCard: {
          url: 'https://example.com/documents/pan-card.pdf',
          verified: true,
          uploadedAt: new Date('2024-01-15')
        },
        gstCertificate: {
          url: 'https://example.com/documents/gst-certificate.pdf',
          verified: true,
          uploadedAt: new Date('2024-01-15')
        },
        idProof: {
          url: 'https://example.com/documents/aadhaar.pdf',
          type: 'aadhaar',
          verified: true,
          uploadedAt: new Date('2024-01-15')
        },
        addressProof: {
          url: 'https://example.com/documents/address-proof.pdf',
          verified: true,
          uploadedAt: new Date('2024-01-15')
        },
        bankStatement: {
          url: 'https://example.com/documents/bank-statement.pdf',
          verified: true,
          uploadedAt: new Date('2024-01-16')
        },
        cancelledCheque: {
          url: 'https://example.com/documents/cancelled-cheque.pdf',
          verified: true,
          uploadedAt: new Date('2024-01-16')
        },
        tradeLicense: {
          url: 'https://example.com/documents/trade-license.pdf',
          verified: true,
          uploadedAt: new Date('2024-01-16')
        },
        agreementSigned: true,
        agreementSignedAt: new Date('2024-01-20')
      },

      // Verification (All Complete)
      verificationStatus: 'approved',
      verificationSteps: {
        emailVerified: true,
        phoneVerified: true,
        documentsVerified: true,
        bankVerified: true,
        addressVerified: true
      },
      approvedAt: new Date('2024-01-25'),

      // Premium Subscription
      subscriptionPlan: 'premium',
      subscriptionStartDate: new Date('2024-02-01'),
      subscriptionExpiry: new Date('2025-02-01'),

      // Commission
      commissionRate: 4.5,

      // Ratings & Reviews
      ratings: {
        average: 4.7,
        totalReviews: 487,
        breakdown: {
          five: 350,
          four: 102,
          three: 25,
          two: 7,
          one: 3
        }
      },

      // Sales Statistics
      salesStats: {
        totalSales: 1847,
        totalRevenue: 5678934,
        totalOrders: 1680,
        totalProducts: 234,
        activeProducts: 218,
        totalCustomers: 1342
      },

      // Performance Metrics
      performance: {
        orderFulfillmentRate: 98.7,
        avgShippingTime: 1.8,
        customerSatisfactionScore: 4.8
      },

      // Active Status
      isActive: true,
      isVerified: true
    })

    console.log('✅ Seller Profile Created\n')
    console.log('═══════════════════════════════════════════════════════')
    console.log('                  SELLER DETAILS                       ')
    console.log('═══════════════════════════════════════════════════════')
    console.log('\n📊 BUSINESS INFORMATION')
    console.log(`   Business Name: ${seller.businessName}`)
    console.log(`   Store Name: ${seller.storeInfo.storeName}`)
    console.log(`   GSTIN: ${seller.gstin}`)
    console.log(`   PAN: ${seller.pan}`)
    console.log(`   Business Type: ${seller.businessType}`)
    console.log(`   Category: ${seller.businessCategory}`)
    console.log(`   Established: ${seller.establishedYear}`)
    
    console.log('\n🏦 BANK DETAILS')
    console.log(`   Account: ${seller.bankDetails.accountNumber}`)
    console.log(`   IFSC: ${seller.bankDetails.ifscCode}`)
    console.log(`   Bank: ${seller.bankDetails.bankName}`)
    console.log(`   Branch: ${seller.bankDetails.branch}`)
    console.log(`   UPI: ${seller.bankDetails.upiId}`)
    
    console.log('\n📍 PICKUP ADDRESS')
    console.log(`   ${seller.pickupAddress.addressLine1}`)
    console.log(`   ${seller.pickupAddress.city}, ${seller.pickupAddress.state} - ${seller.pickupAddress.pincode}`)
    
    console.log(`\n🏭 WAREHOUSES (${seller.warehouses.length})`)
    seller.warehouses.forEach((w, i) => {
      console.log(`   ${i + 1}. ${w.name}`)
      console.log(`      ${w.city}, ${w.state} - ${w.pincode}`)
      console.log(`      Contact: ${w.contactPerson} (${w.contactPhone})`)
    })
    
    console.log('\n💰 SALES STATISTICS')
    console.log(`   Total Orders: ${seller.salesStats.totalOrders.toLocaleString()}`)
    console.log(`   Total Sales: ${seller.salesStats.totalSales.toLocaleString()}`)
    console.log(`   Total Revenue: ₹${seller.salesStats.totalRevenue.toLocaleString()}`)
    console.log(`   Total Products: ${seller.salesStats.totalProducts}`)
    console.log(`   Active Products: ${seller.salesStats.activeProducts}`)
    console.log(`   Total Customers: ${seller.salesStats.totalCustomers.toLocaleString()}`)
    
    console.log('\n⭐ RATINGS')
    console.log(`   Average: ${seller.ratings.average} ⭐`)
    console.log(`   Total Reviews: ${seller.ratings.totalReviews}`)
    console.log(`   5★: ${seller.ratings.breakdown.five} | 4★: ${seller.ratings.breakdown.four} | 3★: ${seller.ratings.breakdown.three}`)
    
    console.log('\n📈 PERFORMANCE')
    console.log(`   Fulfillment Rate: ${seller.performance.orderFulfillmentRate}%`)
    console.log(`   Avg Shipping: ${seller.performance.avgShippingTime} days`)
    console.log(`   Customer Satisfaction: ${seller.performance.customerSatisfactionScore}/5`)
    
    console.log('\n✅ VERIFICATION STATUS')
    console.log(`   Status: ${seller.verificationStatus.toUpperCase()}`)
    console.log(`   Subscription: ${seller.subscriptionPlan.toUpperCase()}`)
    console.log(`   Commission Rate: ${seller.commissionRate}%`)
    console.log(`   Active: ${seller.isActive ? 'YES' : 'NO'}`)
    console.log(`   Verified: ${seller.isVerified ? 'YES' : 'NO'}`)
    
    console.log('\n═══════════════════════════════════════════════════════')
    console.log('\n🔐 LOGIN CREDENTIALS')
    console.log(`   Email: ${user.email}`)
    console.log(`   Password: seller123456`)
    console.log('\n✅ Seller seeding completed successfully!')
    console.log('═══════════════════════════════════════════════════════\n')

    mongoose.connection.close()
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

seedFullSellerData()
