// scripts/seedWoodCraftFurniture.js
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

// Schemas
const productSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    brand: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    categoryPath: { type: String, required: true },
    subCategory: { type: String },
    sku: { type: String, required: true, uppercase: true, trim: true },
    pricing: {
      basePrice: { type: Number, required: true },
      salePrice: { type: Number, required: true },
      costPrice: { type: Number },
      discountPercentage: { type: Number, default: 0 },
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
        url: { type: String, required: true },
        alt: { type: String },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    specifications: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    highlights: [String],
    shipping: {
      weight: { type: Number, default: 25 },
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
    ratings: {
      average: { type: Number, default: 4.7 },
      count: { type: Number, default: 42 },
    },
    tags: [String],
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: true },
    isDraft: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const Seller = mongoose.models.Seller || mongoose.model('Seller', new mongoose.Schema({}, { strict: false }));
const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({}, { strict: false }));

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    // 1. Resolve WoodCraft Living seller
    const seller = await Seller.findOne({
      $or: [
        { 'storeInfo.storeName': 'WoodCraft Living' },
        { 'businessInfo.businessName': 'WoodCraft Living Pvt. Ltd.' },
      ],
    });

    if (!seller) {
      throw new Error('❌ WoodCraft Living seller account not found! Run seedWoodCraftSeller.js first.');
    }
    console.log(`🏢 Seller identified: ${seller.storeInfo?.storeName} (${seller._id})`);

    // 2. Load verified products
    const dataPath = path.join(__dirname, 'verified_furniture.json');
    if (!fs.existsSync(dataPath)) {
      throw new Error(`❌ File ${dataPath} not found! Run buildVerifiedFurnitureList.js first.`);
    }
    const rawProducts = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log(`📦 Loaded ${rawProducts.length} verified furniture items from verified_furniture.json\n`);

    // 3. Resolve Category IDs
    const categoryCache = {};
    for (const p of rawProducts) {
      if (!categoryCache[p.categorySlug]) {
        let cat = await Category.findOne({ slug: p.categorySlug });
        if (!cat) {
          cat = await Category.findOne({ path: p.categoryPath });
        }
        if (cat) {
          categoryCache[p.categorySlug] = cat._id;
          console.log(`📁 Resolved Category "${p.categoryName}" -> ${cat._id} (${cat.path})`);
        } else {
          console.warn(`⚠️ Category for slug "${p.categorySlug}" not found! Falling back to general Furniture category.`);
          const generalFurn = await Category.findOne({ slug: 'furniture' });
          categoryCache[p.categorySlug] = generalFurn ? generalFurn._id : new mongoose.Types.ObjectId('69720d241648cf2c64e400c9');
        }
      }
    }

    console.log('\n🚀 Starting Database Upsert for 20 Furniture Items...');
    let inserted = 0;
    let updated = 0;

    for (const p of rawProducts) {
      const discount = Math.round(((p.basePrice - p.salePrice) / p.basePrice) * 100);
      const catId = categoryCache[p.categorySlug];

      const formattedImages = p.images.map((url, idx) => ({
        url,
        alt: `${p.title} - Official View ${idx + 1}`,
        isPrimary: idx === 0,
      }));

      const productSlug = `${p.sku.toLowerCase()}-${p.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')}`.substring(0, 80);

      const payload = {
        sellerId: seller._id,
        name: p.title,
        slug: productSlug,
        description: p.description,
        shortDescription: `${p.brand} ${p.categoryName} with solid hardwood construction, premium finish, and 3-year warranty.`,
        brand: p.brand,
        category: catId,
        categoryPath: p.categoryPath,
        subCategory: p.categoryName,
        sku: p.sku,
        pricing: {
          basePrice: p.basePrice,
          salePrice: p.salePrice,
          costPrice: Math.round(p.salePrice * 0.7),
          discountPercentage: discount,
        },
        inventory: {
          stock: 15,
          lowStockThreshold: 3,
          reorderPoint: 5,
          trackInventory: true,
          soldCount: 0,
        },
        images: formattedImages,
        specifications: p.specifications,
        highlights: p.highlights,
        shipping: {
          weight: p.categoryKey === 'office' ? 18 : 45,
          unit: 'kg',
          freeShipping: true,
          shippingFee: 0,
        },
        tags: p.tags,
        isActive: true,
        isApproved: true,
        isFeatured: true,
        isDraft: false,
      };

      const existing = await Product.findOne({ sku: p.sku });
      if (existing) {
        await Product.updateOne({ sku: p.sku }, { $set: payload });
        console.log(`🔄 [UPDATED]  ${p.categoryName.padEnd(16)} | ${p.sku.padEnd(20)} | ₹${p.salePrice} | ${p.images.length} imgs | ${p.title.substring(0, 35)}...`);
        updated++;
      } else {
        await Product.create(payload);
        console.log(`✨ [INSERTED] ${p.categoryName.padEnd(16)} | ${p.sku.padEnd(20)} | ₹${p.salePrice} | ${p.images.length} imgs | ${p.title.substring(0, 35)}...`);
        inserted++;
      }
    }

    console.log('\n=======================================');
    console.log('🎉 FURNITURE SEEDING COMPLETE!');
    console.log('=======================================');
    console.log(`🏢 Store: WoodCraft Living (${seller._id})`);
    console.log(`📦 Total Products: ${rawProducts.length} (Inserted: ${inserted}, Updated: ${updated})`);
    console.log(`📸 Total Verified Images: ${rawProducts.reduce((acc, p) => acc + p.images.length, 0)}`);

    await mongoose.disconnect();
    console.log('🔌 Database connection closed\n');
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seed();
