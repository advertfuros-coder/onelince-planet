// scripts/seedDatabase.js
/**
 * Simple Database Seeding Script
 * Creates a seller account with products
 * 
 * Run: node -r dotenv/config scripts/seedDatabase.js
 */

require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found')
  process.exit(1)
}

// Define schemas inline (CommonJS compatible)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  role: { type: String, enum: ['customer', 'seller', 'admin'], default: 'customer' },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true })

const SellerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  businessName: { type: String, required: true },
  businessCategory: String,
  businessType: String,
  gstin: String,
  panNumber: String,
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    accountType: String,
  },
  pickupAddress: {
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String,
    country: String,
    phone: String,
  },
  storeInfo: {
    storeName: String,
    storeDescription: String,
    storeLogo: String,
    storeBanner: String,
  },
  isVerified: { type: Boolean, default: false },
  verificationStatus: { type: String, default: 'pending' },
  isActive: { type: Boolean, default: true },
  subscriptionPlan: { type: String, default: 'basic' },
  commissionRate: { type: Number, default: 10 },
  ratings: {
    average: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  performance: {
    orderFulfillmentRate: Number,
    customerSatisfactionScore: Number,
    responseTime: Number,
  },
}, { timestamps: true })

const ProductSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  name: { type: String, required: true },
  description: String,
  category: String,
  subcategory: String,
  pricing: {
    mrp: Number,
    selling: Number,
    costPrice: Number,
  },
  inventory: {
    stock: { type: Number, default: 0 },
    sku: String,
    lowStockThreshold: { type: Number, default: 10 },
  },
  images: [{
    url: String,
    alt: String,
  }],
  specifications: mongoose.Schema.Types.Mixed,
  shipping: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    freeShipping: { type: Boolean, default: false },
  },
  isActive: { type: Boolean, default: true },
  tags: [String],
  ratings: {
    average: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
}, { timestamps: true })

// Get or create models
const User = mongoose.models.User || mongoose.model('User', UserSchema)
const Seller = mongoose.models.Seller || mongoose.model('Seller', SellerSchema)
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema)

async function seed() {
  console.log('🌱 Seeding database...\n')

  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to:', mongoose.connection.name)

    // 1. Create Seller User
    console.log('\n👤 Creating seller user...')
    const hashedPassword = await bcrypt.hash('Seller@123456', 10)
    
    let sellerUser = await User.findOne({ email: 'seller@onlineplanet.ae' })
    if (!sellerUser) {
      sellerUser = await User.create({
        name: 'Premium Electronics Store',
        email: 'seller@onlineplanet.ae',
        password: hashedPassword,
        phone: '+971501234567',
        role: 'seller',
        isVerified: true,
      })
      console.log('✅ Created:', sellerUser.email)
    } else {
      console.log('ℹ️  Already exists')
    }

    // 2. Create Seller Profile
    console.log('\n🏪 Creating seller profile...')
    let seller = await Seller.findOne({ userId: sellerUser._id })
    if (!seller) {
      seller = await Seller.create({
        userId: sellerUser._id,
        businessName: 'Premium Electronics Store',
        businessCategory: 'electronics',
        businessType: 'partnership',
        gstin: 'AE12345678901',
        panNumber: 'ABCDE1234F',
        bankDetails: {
          accountHolderName: 'Premium Electronics',
          accountNumber: '1234567890',
          bankName: 'Emirates NBD',
          ifscCode: 'ENBD0001234',
          accountType: 'current',
        },
        pickupAddress: {
          addressLine1: 'Shop 123, Electronics Souk',
          addressLine2: 'Deira',
          city: 'Dubai',
          state: 'Dubai',
          pincode: '00000',
          country: 'UAE',
          phone: '+971501234567',
        },
        storeInfo: {
          storeName: 'Premium Electronics',
          storeDescription: 'Premium electronics in UAE',
          storeLogo: 'https://placehold.co/200x200/3B82F6/white?text=PE',
          storeBanner: 'https://placehold.co/1200x300/1E40AF/white?text=Premium+Electronics',
        },
        isVerified: true,
        verificationStatus: 'approved',
        isActive: true,
        subscriptionPlan: 'premium',
        commissionRate: 5,
        ratings: { average: 4.5, totalReviews: 150 },
        performance: {
          orderFulfillmentRate: 95,
          customerSatisfactionScore: 4.5,
          responseTime: 24,
        },
      })
      console.log('✅ Created:', seller.businessName)
    } else {
      console.log('ℹ️  Already exists')
    }

    // 3. Create Products
    console.log('\n📦 Creating products...')
    const products = [
      {
        name: 'iPhone 15 Pro Max 256GB',
        description: 'Latest Apple iPhone with A17 Pro chip',
        category: 'Smartphones',
        pricing: { mrp: 5499, selling: 5199, costPrice: 4500 },
        inventory: { stock: 50, sku: 'IPH15PM-256' },
        images: [{ url: 'https://placehold.co/800/1E40AF/FFF?text=iPhone', alt: 'iPhone 15' }],
      },
      {
        name: 'Samsung Galaxy S24 Ultra 512GB',
        description: 'Premium flagship with S Pen',
        category: 'Smartphones',
        pricing: { mrp: 5299, selling: 4999, costPrice: 4300 },
        inventory: { stock: 35, sku: 'SGS24U-512' },
        images: [{ url: 'https://placehold.co/800/9333EA/FFF?text=Galaxy', alt: 'Galaxy S24' }],
      },
      {
        name: 'MacBook Air M3 16GB/512GB',
        description: 'Apple MacBook Air with M3 chip',
        category: 'Laptops',
        pricing: { mrp: 5999, selling: 5699, costPrice: 5000 },
        inventory: { stock: 20, sku: 'MBA-M3-16' },
        images: [{ url: 'https://placehold.co/800/059669/FFF?text=MacBook', alt: 'MacBook Air' }],
      },
      {
        name: 'Sony WH-1000XM5 Headphones',
        description: 'Premium wireless noise-canceling',
        category: 'Audio',
        pricing: { mrp: 1499, selling: 1299, costPrice: 1000 },
        inventory: { stock: 75, sku: 'SONY-XM5' },
        images: [{ url: 'https://placehold.co/800/EF4444/FFF?text=Sony', alt: 'Sony XM5' }],
      },
      {
        name: 'iPad Pro 12.9" M2 256GB',
        description: 'Apple iPad Pro with M2 chip',
        category: 'Tablets',
        pricing: { mrp: 4899, selling: 4599, costPrice: 4000 },
        inventory: { stock: 15, sku: 'IPADPRO-129' },
        images: [{ url: 'https://placehold.co/800/7C3AED/FFF?text=iPad', alt: 'iPad Pro' }],
      },
      {
        name: 'Dell XPS 15 i7/32GB/1TB',
        description: 'Premium Windows laptop',
        category: 'Laptops',
        pricing: { mrp: 7999, selling: 7499, costPrice: 6500 },
        inventory: { stock: 8, sku: 'DELLXPS15' },
        images: [{ url: 'https://placehold.co/800/0EA5E9/FFF?text=Dell', alt: 'Dell XPS' }],
      },
    ]

    for (const p of products) {
      const existing = await Product.findOne({ sellerId: seller._id, 'inventory.sku': p.inventory.sku })
      if (!existing) {
        await Product.create({
          ...p,
          sellerId: seller._id,
          inventory: {
            ...p.inventory,
            sku: p.inventory.sku + '-' + Date.now(), // Make SKU unique
          },
          shipping: { weight: 0.5, dimensions: { length: 20, width: 15, height: 5 }, freeShipping: true },
          isActive: true,
          tags: [p.category.toLowerCase()],
          ratings: { average: 4 + Math.random(), totalReviews: Math.floor(Math.random() * 50) + 10 },
        })
        console.log(`✅ ${p.name}`)
      } else {
        console.log(`ℹ️  ${p.name} (exists)`)
      }
    }

    console.log('\n🎉 Seeding complete!')
    console.log('\n🔐 Login:')
    console.log('   Email: seller@onlineplanet.ae')
    console.log('   Password: Seller@123456')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
  } finally {
    await mongoose.connection.close()
    console.log('\n👋 Done!\n')
  }
}

seed()
