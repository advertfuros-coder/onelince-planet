// scripts/seedBackToSchoolProducts.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

// User schema
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

// Seller schema
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
        default: 'stationery',
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
    subscription: {
      plan: { type: String, enum: ['free', 'starter', 'growth', 'enterprise'], default: 'enterprise' },
      status: { type: String, enum: ['active', 'past_due', 'canceled', 'expired'], default: 'active' },
      startDate: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

// Product schema
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
    sku: { type: String, unique: true, sparse: true },
    pricing: {
      basePrice: Number,
      salePrice: Number,
      costPrice: Number,
      discountPercentage: Number,
    },
    inventory: {
      stock: { type: Number, default: 50 },
      lowStockThreshold: { type: Number, default: 10 },
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
    shipping: {
      weight: { type: Number, default: 0.5 },
      unit: { type: String, default: 'kg' },
      freeShipping: { type: Boolean, default: true },
      shippingFee: { type: Number, default: 0 },
    },
    returnPolicy: {
      isReturnable: { type: Boolean, default: true },
      returnDuration: { type: Number, default: 10 },
      isReplaceable: { type: Boolean, default: true },
      replacementDuration: { type: Number, default: 10 },
    },
    deliveryEstimate: {
      domestic: {
        min: { type: Number, default: 2 },
        max: { type: Number, default: 4 },
      },
    },
    ratings: {
      average: { type: Number, default: 4.5 },
      count: { type: Number, default: 120 },
    },
    highlights: [String],
    tags: [String],
    keywords: [String],
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: true },
    isDraft: { type: Boolean, default: false },
    viewCount: { type: Number, default: 150 },
    importedFrom: { type: String, default: 'amazon' },
  },
  { timestamps: true }
);

function cleanHtml(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&#34;|&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

async function run() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB Atlas');

  const User = mongoose.models.User || mongoose.model('User', userSchema);
  const Seller = mongoose.models.Seller || mongoose.model('Seller', sellerSchema);
  const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

  // Find or create Campus Store seller
  const sellerEmail = 'campus.essentials@onlineplanet.com';
  let sellerUser = await User.findOne({ email: sellerEmail });

  if (!sellerUser) {
    const hashedPassword = await bcrypt.hash('CampusStore@2026', 10);
    sellerUser = await User.create({
      name: 'Campus Essentials Hub',
      email: sellerEmail,
      password: hashedPassword,
      phone: '+91 9887766554',
      role: 'seller',
      isVerified: true,
    });
    console.log('✅ Created User account for Campus Essentials Hub');
  }

  let sellerProfile = await Seller.findOne({ userId: sellerUser._id });
  if (!sellerProfile) {
    sellerProfile = await Seller.create({
      userId: sellerUser._id,
      personalDetails: {
        fullName: 'Campus Essentials Store Manager',
        email: sellerEmail,
        phone: '+91 9887766554',
        residentialAddress: {
          addressLine1: 'Unit 402, Academic City Plaza',
          addressLine2: 'Outer Ring Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560103',
          country: 'IN',
        },
      },
      businessInfo: {
        businessName: 'Campus Essentials Private Limited',
        gstin: '29AAACC9988Z1Z5',
        pan: 'AAACC9988Z',
        businessType: 'pvt_ltd',
        businessCategory: 'stationery',
        establishedYear: 2021,
        country: 'IN',
      },
      storeInfo: {
        storeName: 'Campus Essentials Hub',
        storeSlug: 'campus-essentials-hub',
        storeDescription: 'Premier authorized distributor for genuine Back to School gear, backpacks, stationery, lunch boxes, study desk setups, and preschool nursery essentials.',
      },
      verificationStatus: 'approved',
      subscription: {
        plan: 'enterprise',
        status: 'active',
        startDate: new Date(),
      },
    });
    console.log('✅ Created Seller profile for Campus Essentials Hub');
  }

  // Load scraped & verified products
  const dataPath = path.join(__dirname, 'verified_20_back_to_school.json');
  const rawProducts = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log(`Loaded ${rawProducts.length} verified products from JSON.`);

  // Remove existing back-to-school products for this seller to avoid duplicates
  await Product.deleteMany({ sellerId: sellerProfile._id });
  console.log('Cleared existing Back to School products for clean seed.');

  let insertedCount = 0;

  for (let i = 0; i < rawProducts.length; i++) {
    const item = rawProducts[i];
    const cleanedTitle = cleanHtml(item.title);
    const sku = `BTS-${item.asin || ('PROD' + i)}-${(i + 1).toString().padStart(3, '0')}`;

    const discountPercent = Math.round(((item.basePrice - item.salePrice) / item.basePrice) * 100);

    const formattedSpecs = (item.specs || []).map(s => ({
      key: cleanHtml(s.key),
      value: cleanHtml(s.value)
    }));

    const cleanFeatures = (item.features || []).map(cleanHtml);

    const description = `${cleanedTitle}.\n\n` +
      `Features & Highlights:\n` +
      cleanFeatures.map(f => `• ${f}`).join('\n') +
      `\n\nEquip students for success with durable, high-quality gear designed for daily school life, ergonomic support, and long-lasting durability.`;

    const productDoc = {
      sellerId: sellerProfile._id,
      name: cleanedTitle,
      description,
      shortDescription: cleanFeatures[0] || `${item.subCategory} ideal for school and daily study.`,
      category: 'back-to-school',
      categoryPath: `back-to-school/${(item.subCategory || 'gear').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      subCategory: item.subCategory,
      brand: cleanHtml(item.brand) || 'Campus Pro',
      sku,
      pricing: {
        basePrice: item.basePrice,
        salePrice: item.salePrice,
        costPrice: Math.round(item.salePrice * 0.7),
        discountPercentage: discountPercent > 0 ? discountPercent : 25,
      },
      inventory: {
        stock: 35 + (i * 3) % 40,
        lowStockThreshold: 8,
        trackInventory: true,
        soldCount: 40 + (i * 12) % 180,
      },
      images: item.images.map((url, idx) => ({
        url,
        alt: `${cleanedTitle} - View ${idx + 1}`,
        isPrimary: idx === 0,
      })),
      specifications: formattedSpecs,
      highlights: cleanFeatures,
      tags: ['back-to-school', item.subCategory.toLowerCase(), item.brand.toLowerCase(), 'student', 'stationery', 'school'],
      keywords: ['school', 'student', 'study', item.subCategory.toLowerCase(), item.brand.toLowerCase()],
      ratings: {
        average: parseFloat((4.3 + ((i % 6) * 0.1)).toFixed(1)),
        count: 75 + (i * 23) % 350,
      },
      shipping: {
        weight: 0.8,
        unit: 'kg',
        freeShipping: true,
        shippingFee: 0,
      },
      returnPolicy: {
        isReturnable: true,
        returnDuration: 10,
        isReplaceable: true,
        replacementDuration: 10,
      },
      deliveryEstimate: {
        domestic: { min: 2, max: 4 },
      },
      isActive: true,
      isApproved: true,
      isFeatured: true,
      isDraft: false,
      viewCount: 180 + i * 25,
      importedFrom: 'amazon',
    };

    await Product.create(productDoc);
    insertedCount++;
    console.log(`✅ [${insertedCount}/${rawProducts.length}] Seeded: ${cleanedTitle.slice(0, 45)}... (Images: ${productDoc.images.length}, ₹${productDoc.pricing.salePrice})`);
  }

  console.log(`\n🎉 Successfully seeded ${insertedCount} Back to School products!`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('❌ Error during seeding:', err);
  process.exit(1);
});
