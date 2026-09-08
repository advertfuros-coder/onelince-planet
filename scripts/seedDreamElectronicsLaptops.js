// scripts/seedDreamElectronicsLaptops.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

// Schemas
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    phone: { type: String, required: true },
    role: { type: String, enum: ['customer', 'seller', 'admin'], default: 'customer' },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const sellerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    personalDetails: {
      fullName: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, required: true, trim: true },
    },
    businessInfo: {
      businessName: { type: String, required: true, trim: true },
      gstin: { type: String, required: true, unique: true, uppercase: true },
      pan: { type: String, uppercase: true },
      businessType: { type: String, default: 'pvt_ltd' },
      businessCategory: { type: String, default: 'electronics' },
      establishedYear: { type: Number, default: 2021 },
      country: { type: String, default: 'IN' },
    },
    storeInfo: {
      storeName: { type: String, required: true, trim: true },
      storeSlug: { type: String, required: true, lowercase: true },
      storeDescription: String,
      storeCategories: [String],
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'under_review', 'documents_required', 'approved', 'rejected', 'suspended'],
      default: 'approved',
    },
    verificationSteps: {
      emailVerified: { type: Boolean, default: true },
      phoneVerified: { type: Boolean, default: true },
      documentsVerified: { type: Boolean, default: true },
      bankVerified: { type: Boolean, default: true },
      addressVerified: { type: Boolean, default: true },
    },
    subscriptionPlan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'enterprise',
    },
    commissionRate: { type: Number, default: 5 },
    ratings: {
      average: { type: Number, default: 4.8 },
      totalReviews: { type: Number, default: 142 },
    },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    icon: String,
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    level: { type: Number, default: 1 },
    path: { type: String, required: true },
    commissionRate: { type: Number, default: 5 },
    requiresApproval: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    productCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    name: { type: String, required: true, trim: true },
    description: String,
    shortDescription: String,
    category: mongoose.Schema.Types.Mixed,
    categoryPath: String,
    subCategory: String,
    brand: String,
    sku: { type: String, required: true, unique: true },
    pricing: {
      basePrice: { type: Number, required: true },
      salePrice: Number,
      costPrice: Number,
      discountPercentage: Number,
    },
    inventory: {
      stock: { type: Number, required: true, default: 10 },
      lowStockThreshold: { type: Number, default: 2 },
      reorderPoint: { type: Number, default: 4 },
      trackInventory: { type: Boolean, default: true },
      soldCount: { type: Number, default: 0 },
    },
    images: [
      {
        url: String,
        alt: String,
        isPrimary: { type: Boolean, default: false },
      },
    ],
    specifications: [
      {
        key: String,
        value: String,
      },
    ],
    highlights: [String],
    shipping: {
      weight: Number,
      unit: { type: String, default: 'kg' },
      freeShipping: { type: Boolean, default: true },
      shippingFee: { type: Number, default: 0 },
    },
    returnPolicy: {
      isReturnable: { type: Boolean, default: true },
      returnDuration: { type: Number, default: 7 },
      isReplaceable: { type: Boolean, default: true },
      replacementDuration: { type: Number, default: 7 },
    },
    deliveryEstimate: {
      domestic: { min: Number, max: Number },
      international: { min: Number, max: Number },
    },
    ratings: {
      average: { type: Number, default: 4.6 },
      count: { type: Number, default: 60 },
    },
    tags: [String],
    keywords: [String],
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: true },
    isDraft: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Seller = mongoose.models.Seller || mongoose.model('Seller', sellerSchema);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function seedLaptops() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    const sellerEmail = 'dream.electronics@onlineplanet.com';

    // 1. Find Seller Profile
    const user = await User.findOne({ email: sellerEmail });
    if (!user) {
      throw new Error(`Seller user ${sellerEmail} not found!`);
    }

    let seller = await Seller.findOne({ userId: user._id });
    if (!seller) {
      throw new Error(`Seller profile for user ${user._id} not found!`);
    }

    if (!seller.storeInfo.storeCategories) {
      seller.storeInfo.storeCategories = [];
    }
    if (!seller.storeInfo.storeCategories.includes('Laptops')) {
      seller.storeInfo.storeCategories.push('Laptops');
    }
    await seller.save();
    console.log('ℹ️  Verified Seller profile:', seller.storeInfo.storeName);

    // 2. Find Category: Laptops
    let laptopCategory = await Category.findOne({ slug: 'laptops' });
    if (!laptopCategory) {
      const elec = await Category.findOne({ slug: 'electronics' });
      laptopCategory = await Category.create({
        name: 'Laptops',
        slug: 'laptops',
        icon: 'Laptop',
        parentId: elec ? elec._id : null,
        level: 2,
        path: 'electronics/laptops',
        commissionRate: 5,
        requiresApproval: false,
        isActive: true,
        sortOrder: 1,
      });
      console.log('Created Laptops category:', laptopCategory._id);
    } else {
      console.log('Found Laptops category:', laptopCategory._id);
    }

    // 3. Load Verified Laptops
    const laptopsDataPath = path.join(__dirname, 'verified_laptops.json');
    if (!fs.existsSync(laptopsDataPath)) {
      throw new Error(`verified_laptops.json not found at ${laptopsDataPath}! Run buildVerifiedLaptopsList.js first.`);
    }

    const rawLaptops = JSON.parse(fs.readFileSync(laptopsDataPath, 'utf8'));
    console.log(`\n📦 Seeding ${rawLaptops.length} verified Laptops into Dream Electronics catalog...`);

    let seededCount = 0;

    for (const [idx, p] of rawLaptops.entries()) {
      const formattedImages = p.images.map((url, imgIdx) => ({
        url,
        alt: `${p.title} - View ${imgIdx + 1}`,
        isPrimary: imgIdx === 0,
      }));

      const discountPercentage = Math.round(((p.basePrice - p.salePrice) / p.basePrice) * 100);

      const description = `${p.title}. Engineered for powerhouse computing, demanding high-performance workloads, AAA gaming, and pro creative productivity. Features ultra-responsive high-refresh display, military-grade durable chassis, advanced cooling thermal architecture, and lightning-fast solid state storage.

### Key Highlights & Innovations:
${p.features && p.features.length > 0 ? p.features.map(f => `* **${f}**`).join('\n') : '* **High Performance Multi-Core Processor**\n* **Dedicated High-Speed Graphics**\n* **Anti-Glare High Refresh Display**\n* **Precision Backlit Keyboard**'}

### Technical Specifications:
${p.specs && p.specs.length > 0 ? p.specs.map(s => `* **${s.key}**: ${s.value}`).join('\n') : '* **Category**: High Performance Laptop'}

### In The Box:
* 1 x ${p.brand} Laptop
* 1 x High-Speed Smart AC Power Adapter & Charging Cord
* 1 x User Guide & Official Brand Warranty Documentation

### Warranty & Support:
* **Warranty**: 1 Year On-Site Official Brand Warranty across all authorized service centers nationwide.
* **Return Policy**: 7 Days replacement guarantee for peace of mind.`;

      const shortDescription = `${p.brand} high-performance laptop featuring crystal-clear high-refresh display, powerful modern processor, dedicated thermal cooling, and fast SSD storage.`;

      const seriesList = ['victus', 'tuf', 'macbook', 'loq', 'inspiron', 'vivobook', 'nitro', 'zenbook', 'galaxy book', 'pavilion', 'legion'];
      const matchedSeries = seriesList.filter(s => p.title.toLowerCase().includes(s));

      const tags = [
        'laptop',
        'laptops',
        p.brand.toLowerCase(),
        `${p.brand.toLowerCase()} laptop`,
        'electronics',
        'gaming laptop',
        'thin and light',
        'dream electronics',
        ...matchedSeries,
        ...matchedSeries.map(s => `${p.brand.toLowerCase()} ${s}`)
      ];

      const productPayload = {
        sellerId: seller._id,
        name: p.title,
        description: description,
        shortDescription: shortDescription,
        category: laptopCategory._id,
        categoryPath: 'electronics/laptops',
        subCategory: 'Laptops',
        brand: p.brand,
        sku: `DE-LAP-${p.asin}`,
        pricing: {
          basePrice: p.basePrice,
          salePrice: p.salePrice,
          costPrice: Math.round(p.salePrice * 0.88),
          discountPercentage: discountPercentage > 0 ? discountPercentage : 18,
        },
        inventory: {
          stock: 12 + (idx % 6),
          lowStockThreshold: 2,
          reorderPoint: 4,
          trackInventory: true,
          soldCount: 8 + (idx * 3),
        },
        images: formattedImages,
        specifications: p.specs && p.specs.length > 0 ? p.specs : [
          { key: 'Brand', value: p.brand },
          { key: 'Category', value: 'Laptops' },
          { key: 'Operating System', value: p.brand === 'Apple' ? 'macOS' : 'Windows 11 Home' },
        ],
        highlights: p.features && p.features.length >= 3 ? p.features : [
          'High Performance Processor & Thermal System',
          'Vivid High-Refresh Display',
          'Fast Gen 4 PCIe NVMe SSD Storage',
          'Precision Backlit Keyboard & Ergonomic Trackpad',
        ],
        shipping: {
          weight: 2.2,
          unit: 'kg',
          freeShipping: true,
          shippingFee: 0,
        },
        returnPolicy: {
          isReturnable: true,
          returnDuration: 7,
          isReplaceable: true,
          replacementDuration: 7,
        },
        deliveryEstimate: {
          domestic: { min: 2, max: 4 },
          international: { min: 7, max: 12 },
        },
        ratings: {
          average: Number((4.4 + ((idx % 6) * 0.1)).toFixed(1)),
          count: 42 + (idx * 14),
        },
        tags: tags,
        keywords: [p.brand.toLowerCase(), 'laptop', 'laptops', 'dream electronics', p.title.toLowerCase()],
        isActive: true,
        isApproved: true,
        isFeatured: true,
        isDraft: false,
      };

      await Product.findOneAndUpdate(
        { sku: productPayload.sku },
        { $set: productPayload },
        { upsert: true, new: true }
      );

      console.log(`✨ [${idx + 1}/${rawLaptops.length}] Seeded: [${p.brand}] ${p.title.substring(0, 48)}... (${formattedImages.length} verified photos)`);
      seededCount++;
    }

    // Update Category productCount
    await Category.updateOne({ _id: laptopCategory._id }, { $set: { productCount: seededCount } });

    console.log('\n=======================================');
    console.log('🎉 LAPTOPS SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=======================================');
    console.log(`👤 Store: ${seller.storeInfo.storeName} (${sellerEmail})`);
    console.log(`🏷️ Category: Laptops (electronics/laptops)`);
    console.log(`💻 Total Laptops Seeded: ${seededCount}`);
    console.log('=======================================\n');

    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedLaptops();
