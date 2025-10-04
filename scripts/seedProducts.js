// scripts/seedProducts.js
const mongoose = require('mongoose')
const path = require('path')

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

// Check if MONGODB_URI exists
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local')
  process.exit(1)
}

// Define Product Schema
const productSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    lowercase: true
  },
  shortDescription: {
    type: String,
    maxlength: 160
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  subCategory: String,
  brand: String,
  sku: {
    type: String,
    required: true
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true
    },
    salePrice: Number,
    costPrice: Number
  },
  inventory: {
    stock: {
      type: Number,
      required: true,
      default: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 10
    },
    trackInventory: {
      type: Boolean,
      default: true
    }
  },
  images: [{
    url: String,
    publicId: String,
    alt: String
  }],
  variants: [{
    name: String,
    value: String,
    price: Number,
    stock: Number
  }],
  specifications: [{
    key: String,
    value: String
  }],
  shipping: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    freeShipping: {
      type: Boolean,
      default: false
    },
    shippingFee: Number
  },
  ratings: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  totalSales: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  phone: String,
  role: {
    type: String,
    enum: ['customer', 'seller', 'admin'],
    default: 'customer'
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Create models
const Product = mongoose.models.Product || mongoose.model('Product', productSchema)
const User = mongoose.models.User || mongoose.model('User', userSchema)

// Helper function to generate slug
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const products = [
  {
    name: 'Wireless Bluetooth Headphones Pro',
    shortDescription: 'Premium noise-canceling wireless headphones with 30-hour battery life',
    description: 'Experience superior sound quality with these premium wireless headphones. Features active noise cancellation, 30-hour battery life, and comfortable over-ear design. Perfect for music lovers and professionals.',
    category: 'Electronics',
    subCategory: 'Audio',
    brand: 'SoundTech',
    sku: 'ST-WBH-001',
    pricing: {
      basePrice: 2999,
      salePrice: 1999,
      costPrice: 1500
    },
    inventory: {
      stock: 50,
      lowStockThreshold: 10,
      trackInventory: true
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', alt: 'Wireless Headphones' }
    ],
    specifications: [
      { key: 'Battery Life', value: '30 hours' },
      { key: 'Connectivity', value: 'Bluetooth 5.0' },
      { key: 'Weight', value: '250g' },
      { key: 'Warranty', value: '1 year' }
    ],
    shipping: {
      weight: 0.3,
      dimensions: { length: 20, width: 18, height: 8 },
      freeShipping: true
    },
    ratings: {
      average: 4.5,
      count: 120
    },
    isActive: true,
    isFeatured: true,
    isApproved: true
  },
  {
    name: 'Smart Watch Pro Series 5',
    shortDescription: 'Fitness tracker with heart rate monitor and GPS',
    description: 'Track your fitness goals with this advanced smartwatch. Features include heart rate monitoring, GPS tracking, sleep analysis, and 50+ sport modes.',
    category: 'Electronics',
    subCategory: 'Wearables',
    brand: 'FitTech',
    sku: 'FT-SW-005',
    pricing: {
      basePrice: 5999,
      salePrice: 4499,
      costPrice: 3500
    },
    inventory: {
      stock: 35,
      lowStockThreshold: 10,
      trackInventory: true
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', alt: 'Smart Watch' }
    ],
    specifications: [
      { key: 'Display', value: '1.4" AMOLED' },
      { key: 'Battery', value: '7 days' },
      { key: 'Water Resistant', value: '5ATM' }
    ],
    shipping: {
      weight: 0.1,
      dimensions: { length: 10, width: 10, height: 5 },
      freeShipping: true
    },
    ratings: {
      average: 4.3,
      count: 85
    },
    isActive: true,
    isFeatured: true,
    isApproved: true
  },
  {
    name: 'Wireless Gaming Mouse RGB',
    shortDescription: 'Professional gaming mouse with 16000 DPI',
    description: 'Dominate your games with this high-performance wireless gaming mouse. Features 16000 DPI sensor, customizable RGB lighting, and programmable buttons.',
    category: 'Electronics',
    subCategory: 'Gaming',
    brand: 'GamePro',
    sku: 'GP-WGM-001',
    pricing: {
      basePrice: 2499,
      salePrice: 1799,
      costPrice: 1200
    },
    inventory: {
      stock: 45,
      lowStockThreshold: 10,
      trackInventory: true
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500', alt: 'Gaming Mouse' }
    ],
    specifications: [
      { key: 'DPI', value: '16000' },
      { key: 'Buttons', value: '8 programmable' },
      { key: 'Battery', value: '70 hours' }
    ],
    shipping: {
      weight: 0.15,
      dimensions: { length: 15, width: 10, height: 5 },
      freeShipping: false,
      shippingFee: 50
    },
    ratings: {
      average: 4.7,
      count: 95
    },
    isActive: true,
    isApproved: true
  },
  {
    name: 'Premium Leather Wallet',
    shortDescription: 'Genuine leather bifold wallet with RFID protection',
    description: 'Handcrafted genuine leather wallet with multiple card slots, cash compartment, and RFID blocking technology to protect your cards.',
    category: 'Fashion',
    subCategory: 'Accessories',
    brand: 'LeatherCraft',
    sku: 'LC-PLW-001',
    pricing: {
      basePrice: 1999,
      salePrice: 1299,
      costPrice: 800
    },
    inventory: {
      stock: 100,
      lowStockThreshold: 20,
      trackInventory: true
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500', alt: 'Leather Wallet' }
    ],
    variants: [
      { name: 'Color', value: 'Brown', price: 0, stock: 50 },
      { name: 'Color', value: 'Black', price: 0, stock: 50 }
    ],
    specifications: [
      { key: 'Material', value: 'Genuine Leather' },
      { key: 'Card Slots', value: '8' },
      { key: 'RFID Protection', value: 'Yes' }
    ],
    shipping: {
      weight: 0.1,
      dimensions: { length: 12, width: 10, height: 2 },
      freeShipping: false,
      shippingFee: 40
    },
    ratings: {
      average: 4.8,
      count: 180
    },
    isActive: true,
    isFeatured: true,
    isApproved: true
  },
  {
    name: 'LED Smart Bulb RGB 10W',
    shortDescription: 'WiFi enabled color changing smart bulb with voice control',
    description: 'Transform your home lighting with this smart LED bulb. Control via app, voice assistants, or set schedules. 16 million colors to choose from.',
    category: 'Home & Decor',
    subCategory: 'Lighting',
    brand: 'SmartHome',
    sku: 'SH-LSB-010',
    pricing: {
      basePrice: 799,
      salePrice: 599,
      costPrice: 400
    },
    inventory: {
      stock: 150,
      lowStockThreshold: 30,
      trackInventory: true
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1550985616-10810253b84d?w=500', alt: 'Smart Bulb' }
    ],
    specifications: [
      { key: 'Power', value: '10W' },
      { key: 'Connectivity', value: 'WiFi 2.4GHz' },
      { key: 'Colors', value: '16 million' },
      { key: 'Voice Control', value: 'Alexa, Google Home' }
    ],
    shipping: {
      weight: 0.1,
      dimensions: { length: 8, width: 8, height: 12 },
      freeShipping: false,
      shippingFee: 40
    },
    ratings: {
      average: 4.6,
      count: 200
    },
    isActive: true,
    isFeatured: true,
    isApproved: true
  },
  {
    name: 'Yoga Mat Premium Non-Slip',
    shortDescription: 'Extra thick yoga mat with carrying strap',
    description: 'Premium quality yoga mat made from eco-friendly TPE material. Extra thick for comfort, non-slip surface for safety. Comes with carrying strap.',
    category: 'Sports',
    subCategory: 'Yoga',
    brand: 'FitLife',
    sku: 'FL-YMP-001',
    pricing: {
      basePrice: 1299,
      salePrice: 899,
      costPrice: 600
    },
    inventory: {
      stock: 75,
      lowStockThreshold: 15,
      trackInventory: true
    },
    images: [
      { url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500', alt: 'Yoga Mat' }
    ],
    variants: [
      { name: 'Color', value: 'Purple', price: 0, stock: 25 },
      { name: 'Color', value: 'Blue', price: 0, stock: 25 },
      { name: 'Color', value: 'Pink', price: 0, stock: 25 }
    ],
    specifications: [
      { key: 'Material', value: 'TPE' },
      { key: 'Thickness', value: '6mm' },
      { key: 'Size', value: '183cm x 61cm' },
      { key: 'Eco-Friendly', value: 'Yes' }
    ],
    shipping: {
      weight: 1.0,
      dimensions: { length: 63, width: 15, height: 15 },
      freeShipping: false,
      shippingFee: 60
    },
    ratings: {
      average: 4.7,
      count: 156
    },
    isActive: true,
    isApproved: true
  }
]

async function seedProducts() {
  try {
    console.log('🔗 Connecting to MongoDB...')
    console.log('URI:', process.env.MONGODB_URI ? 'Found' : 'Not found')
    
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Drop the slug index if it exists
    try {
      await Product.collection.dropIndex('slug_1')
      console.log('🗑️  Dropped slug index')
    } catch (err) {
      console.log('ℹ️  No slug index to drop')
    }

    // Find or create a seller user
    let seller = await User.findOne({ role: 'seller' })
    
    if (!seller) {
      console.log('👤 Creating default seller...')
      seller = await User.create({
        name: 'Default Seller',
        email: 'seller@onlineplanet.com',
        password: '$2a$10$YourHashedPasswordHere',
        role: 'seller',
        isVerified: true
      })
      console.log('✅ Created default seller')
    } else {
      console.log('👤 Using existing seller:', seller.email)
    }

    // Delete existing products
    const deleteResult = await Product.deleteMany({})
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing products`)

    // Add seller ID and slug to all products
    const productsWithSellerAndSlug = products.map(product => ({
      ...product,
      seller: seller._id,
      slug: generateSlug(product.name)
    }))

    // Insert products
    console.log('📦 Inserting products...')
    const result = await Product.insertMany(productsWithSellerAndSlug)
    console.log(`✅ Successfully seeded ${result.length} products`)
    
    console.log('\n📊 Summary:')
    console.log(`   - Total products: ${result.length}`)
    console.log(`   - Seller: ${seller.name} (${seller.email})`)
    console.log('\n🎉 Seeding completed successfully!')

    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
  } catch (error) {
    console.error('❌ Error seeding products:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

seedProducts()
