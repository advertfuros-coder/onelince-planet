// scripts/seedDreamElectronicsTablets.js
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
      stock: { type: Number, required: true, default: 15 },
      lowStockThreshold: { type: Number, default: 3 },
      reorderPoint: { type: Number, default: 5 },
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
      count: { type: Number, default: 84 },
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

async function seedTablets() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    const sellerEmail = 'dream.electronics@onlineplanet.com';
    const rawPassword = 'DreamElectronics@2026';

    // 1. Verify / Ensure User
    let user = await User.findOne({ email: sellerEmail });
    const hashedPassword = await bcrypt.hash(rawPassword, 12);

    if (!user) {
      user = await User.create({
        name: 'Dream Electronics',
        email: sellerEmail,
        password: hashedPassword,
        phone: '+91-9876543210',
        role: 'seller',
        isVerified: true,
      });
      console.log('✅ Created User:', user._id);
    } else {
      user.password = hashedPassword;
      user.role = 'seller';
      user.isVerified = true;
      await user.save();
      console.log('ℹ️  Verified & updated existing User:', user._id);
    }

    // 2. Verify / Ensure Seller Profile
    let seller = await Seller.findOne({ userId: user._id });
    if (!seller) {
      seller = await Seller.create({
        userId: user._id,
        personalDetails: {
          fullName: 'Dream Electronics',
          email: sellerEmail,
          phone: '+91-9876543210',
          residentialAddress: {
            addressLine1: 'Shop 42, Electronic City Commercial Complex',
            addressLine2: 'Phase 1, Hosur Road',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560100',
            country: 'IN',
          },
        },
        businessInfo: {
          businessName: 'Dream Electronics',
          gstin: '29AABCD1234E1Z5',
          pan: 'AABCD1234E',
          businessType: 'pvt_ltd',
          businessCategory: 'electronics',
          establishedYear: 2021,
          country: 'IN',
        },
        storeInfo: {
          storeName: 'Dream Electronics',
          storeSlug: 'dream-electronics',
          storeDescription: 'Premier destination for Electronics, Smart TVs, high-performance Tablets & iPads, and energy-efficient 2025/2026 Inverter Air Conditioners.',
          storeCategories: ['Electronics / Smart TV', 'Tablets & iPads', 'Air Conditioners'],
        },
        verificationStatus: 'approved',
        verificationSteps: {
          emailVerified: true,
          phoneVerified: true,
          documentsVerified: true,
          bankVerified: true,
          addressVerified: true,
        },
        subscriptionPlan: 'enterprise',
        commissionRate: 5,
        ratings: { average: 4.9, totalReviews: 156 },
        isActive: true,
        isVerified: true,
      });
      console.log('✅ Created Seller profile:', seller._id);
    } else {
      seller.storeInfo.storeName = 'Dream Electronics';
      seller.storeInfo.storeSlug = 'dream-electronics';
      seller.verificationStatus = 'approved';
      seller.subscriptionPlan = 'enterprise';
      seller.isActive = true;
      seller.isVerified = true;
      seller.verificationSteps = {
        emailVerified: true,
        phoneVerified: true,
        documentsVerified: true,
        bankVerified: true,
        addressVerified: true,
      };
      if (!seller.storeInfo.storeCategories) {
        seller.storeInfo.storeCategories = [];
      }
      if (!seller.storeInfo.storeCategories.includes('Electronics / Smart TV')) {
        seller.storeInfo.storeCategories.push('Electronics / Smart TV');
      }
      if (!seller.storeInfo.storeCategories.includes('Tablets & iPads')) {
        seller.storeInfo.storeCategories.push('Tablets & iPads');
      }
      await seller.save();
      console.log('ℹ️  Updated Seller profile to approved & enterprise:', seller._id);
    }

    // 3. Category: Tablets & iPads
    let tabletsCategory = await Category.findOne({ slug: 'tablets-pads' });
    if (!tabletsCategory) {
      const elec = await Category.findOne({ slug: 'electronics' });
      tabletsCategory = await Category.create({
        name: 'Tablets & iPads',
        slug: 'tablets-pads',
        icon: 'Tablet',
        parentId: elec ? elec._id : null,
        level: 2,
        path: 'electronics/tablets-pads',
        commissionRate: 5,
        requiresApproval: false,
        isActive: true,
        sortOrder: 2,
      });
    }

    // 4. Load Verified Tablets
    const tabletsDataPath = path.join(__dirname, 'verified_tablets.json');
    if (!fs.existsSync(tabletsDataPath)) {
      throw new Error(`verified_tablets.json not found at ${tabletsDataPath}! Run buildVerifiedTabletsList.js first.`);
    }

    const rawTablets = JSON.parse(fs.readFileSync(tabletsDataPath, 'utf8'));
    console.log(`\n📦 Seeding ${rawTablets.length} verified Tablets & iPads into Dream Electronics catalog...`);

    let seededCount = 0;

    for (const [idx, p] of rawTablets.entries()) {
      const formattedImages = p.images.map((url, imgIdx) => ({
        url,
        alt: `${p.title} - View ${imgIdx + 1}`,
        isPrimary: imgIdx === 0,
      }));

      const discountPercentage = Math.round(((p.basePrice - p.salePrice) / p.basePrice) * 100);

      const description = `${p.title}. Designed for professional workflows, creative design, high-resolution entertainment, and seamless multitasking. Powered by next-generation processing performance, vivid crystal-clear display, immersive multi-speaker audio with Dolby Atmos, and ultra-long battery endurance for all-day productivity.

### Key Highlights & Features:
${p.features && p.features.length > 0 ? p.features.map(f => `* **${f}**`).join('\n') : '* **Premium Build & Finish**\n* **High-Resolution Liquid Crystal / OLED Display**\n* **All-Day Battery Backup**\n* **Ultra-Fast Fast Charging Support**'}

### Technical Specifications:
${p.specs && p.specs.length > 0 ? p.specs.map(s => `* **${s.key}**: ${s.value}`).join('\n') : '* **Category**: Premium Tablet / Pad'}

### Warranty & Support:
* **Warranty**: 1 Year Official Brand Warranty across all authorized service centers nationwide.
* **Return/Replacement**: 7 Days replacement guarantee for peace of mind.`;

      const shortDescription = `${p.brand} flagship tablet featuring ultra-sharp display, high-efficiency processor, immersive quad-speakers, and all-day battery life.`;

      const tags = [
        'tablet',
        'tablets',
        'pad',
        'pads',
        p.brand.toLowerCase(),
        `${p.brand.toLowerCase()} tablet`,
        'electronics',
        'dream electronics',
      ];

      const productPayload = {
        sellerId: seller._id,
        name: p.title,
        description: description,
        shortDescription: shortDescription,
        category: tabletsCategory._id,
        categoryPath: 'electronics/tablets-pads',
        subCategory: 'Tablets & iPads',
        brand: p.brand,
        sku: `DE-TAB-${p.asin}`,
        pricing: {
          basePrice: p.basePrice,
          salePrice: p.salePrice,
          costPrice: Math.round(p.salePrice * 0.85),
          discountPercentage: discountPercentage > 0 ? discountPercentage : 18,
        },
        inventory: {
          stock: 15 + (idx % 8),
          lowStockThreshold: 3,
          reorderPoint: 5,
          trackInventory: true,
          soldCount: 12 + (idx * 4),
        },
        images: formattedImages,
        specifications: p.specs && p.specs.length > 0 ? p.specs : [
          { key: 'Brand', value: p.brand },
          { key: 'Category', value: 'Tablets & iPads' },
          { key: 'Operating System', value: p.brand === 'Apple' ? 'iPadOS' : 'Android' },
        ],
        highlights: p.features && p.features.length >= 3 ? p.features : [
          'High-Resolution Ultra-Vivid Screen',
          'High-Performance Multi-Core Architecture',
          'Quad Stereo Speakers with Immersive Audio',
          'Long-Lasting Battery with Quick Fast Charging',
        ],
        shipping: {
          weight: 0.65,
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
          average: Number((4.5 + ((idx % 5) * 0.1)).toFixed(1)),
          count: 55 + (idx * 16),
        },
        tags: tags,
        keywords: [p.brand.toLowerCase(), 'tablet', 'pad', 'dream electronics', p.title.toLowerCase()],
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

      console.log(`✨ [${idx + 1}/${rawTablets.length}] Seeded: [${p.brand}] ${p.title.substring(0, 48)}... (${formattedImages.length} verified photos)`);
      seededCount++;
    }

    // Update Category productCount
    await Category.updateOne({ _id: tabletsCategory._id }, { $set: { productCount: seededCount } });

    console.log('\n=======================================');
    console.log('🎉 TABLETS SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=======================================');
    console.log(`👤 Store: ${seller.storeInfo.storeName} (${sellerEmail})`);
    console.log(`🏷️ Category: Tablets & iPads (electronics/tablets-pads)`);
    console.log(`📱 Total Tablets Seeded: ${seededCount}`);
    console.log('=======================================\n');

    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedTablets();
