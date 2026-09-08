// scripts/seedDreamElectronicsPhonesLive.js
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
    profilePicture: { type: String, default: '' },
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
      residentialAddress: {
        addressLine1: String,
        addressLine2: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: 'IN' },
      },
    },
    businessInfo: {
      businessName: { type: String, required: true, trim: true },
      gstin: { type: String, required: true, unique: true, uppercase: true },
      pan: { type: String, uppercase: true },
      businessType: {
        type: String,
        enum: ['individual', 'proprietorship', 'partnership', 'pvt_ltd', 'public_ltd', 'llp'],
        default: 'pvt_ltd',
      },
      businessCategory: {
        type: String,
        default: 'electronics',
      },
      establishedYear: { type: Number, default: 2021 },
      country: { type: String, default: 'IN' },
    },
    storeInfo: {
      storeName: { type: String, required: true, trim: true },
      storeSlug: { type: String, required: true, unique: true, lowercase: true },
      storeDescription: String,
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
    ratings: {
      average: { type: Number, default: 4.6 },
      count: { type: Number, default: 84 },
    },
    tags: [String],
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

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    const sellerEmail = 'dream.electronics@onlineplanet.com';
    const rawPassword = 'DreamElectronics@2026';

    // 1. Ensure User
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
      console.log('ℹ️  User verified:', user._id);
    }

    // 2. Ensure Seller Profile
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
          businessName: 'Dream Electronics Pvt. Ltd.',
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
          storeDescription: 'Your premier destination for next-generation 5G smartphones, flagship devices, energy-efficient split ACs, and smart TVs.',
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
        ratings: {
          average: 4.9,
          totalReviews: 184,
        },
      });
      console.log('✅ Created Seller profile:', seller._id);
    } else {
      seller.verificationStatus = 'approved';
      seller.subscriptionPlan = 'enterprise';
      await seller.save();
      console.log('ℹ️  Seller profile verified:', seller._id);
    }

    // 3. Category for Smartphones
    let phoneCategory = await Category.findOne({ slug: 'smartphones' });
    if (!phoneCategory) {
      phoneCategory = await Category.findOne({ slug: 'mobiles' });
    }
    if (!phoneCategory) {
      phoneCategory = await Category.findOne({ slug: 'electronics' });
    }
    console.log('📱 Category found:', phoneCategory ? `${phoneCategory.name} (${phoneCategory.path})` : 'Not found');

    // 4. Load Scraped & Verified 2025/2026 Phones
    const filePath = path.join(__dirname, 'verified_2025_2026_phones.json');
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Data file not found: ${filePath}`);
      process.exit(1);
    }

    const phones = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`\n📦 Found ${phones.length} verified smartphone products to seed...`);

    if (phones.length < 20) {
      console.warn(`⚠️ Warning: Expected at least 20 phones, currently have ${phones.length}`);
    }

    let seededCount = 0;
    for (let idx = 0; idx < phones.length; idx++) {
      const p = phones[idx];
      const discountPct = Math.round(((p.basePrice - p.salePrice) / p.basePrice) * 100);

      const formattedImages = p.images.map((imgUrl, imgIdx) => ({
        url: imgUrl,
        alt: `${p.brand} ${p.modelYear} Smartphone - View ${imgIdx + 1}`,
        isPrimary: imgIdx === 0,
      }));

      const tags = [
        'smartphone',
        'mobile',
        '5g mobile',
        p.brand.toLowerCase(),
        `${p.modelYear} phone`,
        `${p.modelYear} smartphone`,
        'flagship',
        'android',
        'amoled',
        'dream electronics',
      ];

      const productPayload = {
        sellerId: seller._id,
        name: p.title,
        shortDescription: `${p.brand} 5G Smartphone (${p.modelYear} Release) featuring ultra-fast multi-core processing, AI-enhanced camera system, vivid AMOLED display, and ultra-durable fast-charging battery.`,
        description: `Experience cutting-edge mobile performance with the ${p.title}.\n\n` +
          `Launched as part of the ${p.modelYear} generation, this device is engineered for lightning-speed 5G connectivity, professional photography, cinematic media consumption, and peak daily multitasking.\n\n` +
          `Key Highlights:\n` +
          `- Model Generation: ${p.modelYear} Official Release\n` +
          `- Certified Display: High refresh rate HDR panel for fluid visuals\n` +
          `- Performance: Advanced high-efficiency mobile processor with intelligent thermal management\n` +
          `- Battery & Charging: All-day battery endurance with rapid charging support\n` +
          `- Warranty & Support: 1 Year Manufacturer Warranty backed by Dream Electronics verified customer care`,
        category: phoneCategory ? phoneCategory._id : 'smartphones',
        categoryPath: phoneCategory ? phoneCategory.path : 'electronics/mobiles/smartphones',
        subCategory: 'Smartphones',
        brand: p.brand,
        sku: `DE-PH-${p.asin}`,
        pricing: {
          basePrice: p.basePrice,
          salePrice: p.salePrice,
          costPrice: Math.round(p.salePrice * 0.88),
          discountPercentage: discountPct > 0 ? discountPct : 15,
        },
        inventory: {
          stock: 25 + (idx * 3),
          lowStockThreshold: 4,
          reorderPoint: 8,
          trackInventory: true,
          soldCount: 15 + (idx * 6),
        },
        images: formattedImages,
        specifications: p.specs && p.specs.length > 0 ? p.specs : [
          { key: 'Model Year', value: p.modelYear },
          { key: 'Brand', value: p.brand },
          { key: 'Cellular Technology', value: '5G' },
          { key: 'Operating System', value: 'Android' },
          { key: 'Form Factor', value: 'Smartphone' },
          { key: 'Warranty', value: '1 Year Manufacturer Warranty' }
        ],
        highlights: p.features && p.features.length >= 3 ? p.features : [
          `${p.modelYear} Next-Gen Flagship Architecture`,
          'Ultra-vivid High Refresh Rate AMOLED Display',
          'Pro-Grade Multi-Camera Array with Night Mode',
          'Superfast High-Capacity Battery & Rapid Charging',
          'Official 1-Year Manufacturer Warranty'
        ],
        shipping: {
          weight: 0.45,
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
        ratings: {
          average: Number((4.5 + ((idx % 5) * 0.1)).toFixed(1)),
          count: 58 + (idx * 21),
        },
        tags: tags,
        isActive: true,
        isApproved: true,
        isFeatured: true,
        isDraft: false,
      };

      const existing = await Product.findOne({ sku: productPayload.sku });
      if (existing) {
        await Product.updateOne({ sku: productPayload.sku }, { $set: productPayload });
        console.log(`🔄 [${idx + 1}/${phones.length}] Updated: ${p.title.substring(0, 50)}... (${formattedImages.length} photos)`);
      } else {
        await Product.create(productPayload);
        console.log(`✨ [${idx + 1}/${phones.length}] Inserted: ${p.title.substring(0, 50)}... (${formattedImages.length} photos)`);
      }
      seededCount++;
    }

    console.log('\n=======================================');
    console.log('🎉 SMARTPHONES SEEDED SUCCESSFULLY!');
    console.log('=======================================');
    console.log(`👤 Store: ${seller.storeInfo.storeName} (${sellerEmail})`);
    console.log(`🔑 Login Password: ${rawPassword}`);
    console.log(`🆔 Seller ID: ${seller._id}`);
    console.log(`🏷️ Category: Smartphones (${phoneCategory ? phoneCategory.path : 'electronics/mobiles/smartphones'})`);
    console.log(`📱 Total Phone Products Seeded: ${seededCount}`);
    console.log('=======================================\n');

    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seed();
