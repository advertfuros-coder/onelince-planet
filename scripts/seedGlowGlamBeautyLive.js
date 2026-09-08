// scripts/seedGlowGlamBeautyLive.js
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
        default: 'beauty',
      },
      establishedYear: { type: Number, default: 2022 },
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
      average: { type: Number, default: 4.9 },
      totalReviews: { type: Number, default: 215 },
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
      stock: { type: Number, required: true, default: 50 },
      lowStockThreshold: { type: Number, default: 5 },
      reorderPoint: { type: Number, default: 10 },
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
      average: { type: Number, default: 4.8 },
      count: { type: Number, default: 140 },
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

    const sellerEmail = 'glow.glam@onlineplanet.com';
    const rawPassword = 'GlowGlam@2026';

    // 1. Ensure User
    let user = await User.findOne({ email: sellerEmail });
    const hashedPassword = await bcrypt.hash(rawPassword, 12);

    if (!user) {
      user = await User.create({
        name: 'Glow & Glam Beauty',
        email: sellerEmail,
        password: hashedPassword,
        phone: '+91-9876543230',
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
          fullName: 'Glow & Glam Beauty Care',
          email: sellerEmail,
          phone: '+91-9876543230',
          residentialAddress: {
            addressLine1: 'Plot 18, Phoenix Beauty Mall',
            addressLine2: 'Kurla West, LBS Road',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400070',
            country: 'IN',
          },
        },
        businessInfo: {
          businessName: 'Glow & Glam Beauty Care Pvt. Ltd.',
          gstin: '27AABCG1234F1Z8',
          pan: 'AABCG1234F',
          businessType: 'pvt_ltd',
          businessCategory: 'beauty',
          establishedYear: 2022,
          country: 'IN',
        },
        storeInfo: {
          storeName: 'Glow & Glam Beauty',
          storeSlug: 'glow-glam-beauty',
          storeDescription: 'Your official destination for 100% authentic, dermatologically tested skincare, haircare, sunscreens, serums, and premium cosmetics from top global & Indian brands.',
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
          totalReviews: 215,
        },
      });
      console.log('✅ Created Seller profile:', seller._id);
    } else {
      seller.verificationStatus = 'approved';
      seller.subscriptionPlan = 'enterprise';
      await seller.save();
      console.log('ℹ️  Seller profile verified:', seller._id);
    }

    // 3. Category Cache
    const categoriesBySlug = {};
    const allCats = await Category.find({});
    allCats.forEach(c => { categoriesBySlug[c.slug] = c; });

    // 4. Load Scraped Beauty Products
    const filePath = path.join(__dirname, 'verified_20_beauty_products.json');
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Data file not found: ${filePath}`);
      process.exit(1);
    }

    const products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`\n📦 Found ${products.length} verified beauty products to seed...`);

    let seededCount = 0;
    for (let idx = 0; idx < products.length; idx++) {
      const p = products[idx];
      const discountPct = Math.round(((p.basePrice - p.salePrice) / p.basePrice) * 100);

      const catDoc = categoriesBySlug[p.categorySlug] || categoriesBySlug['skincare'] || categoriesBySlug['beauty'];

      const formattedImages = p.images.map((imgUrl, imgIdx) => ({
        url: imgUrl,
        alt: `${p.brand} ${p.title} - View ${imgIdx + 1}`,
        isPrimary: imgIdx === 0,
      }));

      const tags = [
        'beauty',
        'skincare',
        p.subCategory.toLowerCase(),
        p.brand.toLowerCase(),
        'dermatologist tested',
        'glow and glam',
        'original'
      ];

      const productPayload = {
        sellerId: seller._id,
        name: p.title,
        shortDescription: `Authentic ${p.brand} ${p.subCategory}. Dermatologically tested formula for daily use with visible clinical results.`,
        description: `Upgrade your daily self-care routine with the ${p.title}.\n\n` +
          `Carefully sourced and guaranteed 100% genuine by Glow & Glam Beauty, this high-performance formulation delivers targeted active benefits while nourishing and protecting your skin barrier.\n\n` +
          `Key Benefits:\n` +
          `- Formulation: Dermatologist-backed and non-comedogenic\n` +
          `- Active Performance: Clinically researched concentrations for optimal efficacy\n` +
          `- Skin Safety: Free from harmful parabens and harsh irritants\n` +
          `- Quality Assurance: Fresh batch certified directly from manufacturer`,
        category: catDoc ? catDoc._id : 'skincare',
        categoryPath: catDoc ? catDoc.path : 'beauty/skincare',
        subCategory: p.subCategory,
        brand: p.brand,
        sku: `GGB-BT-${p.asin}`,
        pricing: {
          basePrice: p.basePrice,
          salePrice: p.salePrice,
          costPrice: Math.round(p.salePrice * 0.82),
          discountPercentage: discountPct > 0 ? discountPct : 15,
        },
        inventory: {
          stock: 45 + (idx * 5),
          lowStockThreshold: 5,
          reorderPoint: 10,
          trackInventory: true,
          soldCount: 30 + (idx * 8),
        },
        images: formattedImages,
        specifications: p.specs && p.specs.length > 0 ? p.specs : [
          { key: 'Brand', value: p.brand },
          { key: 'Category', value: p.subCategory },
          { key: 'Skin Type', value: 'All Skin Types' },
          { key: 'Form', value: 'Liquid / Gel / Cream' }
        ],
        highlights: p.features && p.features.length >= 3 ? p.features : [
          'Dermatologically tested and certified formula',
          'Rich in active antioxidants and restorative hydration',
          'Lightweight, fast-absorbing and non-greasy finish',
          '100% genuine guaranteed by Glow & Glam Beauty'
        ],
        shipping: {
          weight: 0.25,
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
          average: Number((4.6 + ((idx % 4) * 0.1)).toFixed(1)),
          count: 85 + (idx * 17),
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
        console.log(`🔄 [${idx + 1}/${products.length}] Updated: ${p.title.substring(0, 50)}... (${formattedImages.length} photos)`);
      } else {
        await Product.create(productPayload);
        console.log(`✨ [${idx + 1}/${products.length}] Inserted: ${p.title.substring(0, 50)}... (${formattedImages.length} photos)`);
      }
      seededCount++;
    }

    console.log('\n=======================================');
    console.log('🎉 BEAUTY PRODUCTS SEEDED SUCCESSFULLY!');
    console.log('=======================================');
    console.log(`👤 Store: ${seller.storeInfo.storeName} (${sellerEmail})`);
    console.log(`🔑 Login Password: ${rawPassword}`);
    console.log(`🆔 Seller ID: ${seller._id}`);
    console.log(`💄 Total Products Seeded: ${seededCount}`);
    console.log('=======================================\n');

    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seed();
