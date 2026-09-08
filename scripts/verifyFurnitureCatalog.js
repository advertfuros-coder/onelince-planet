// scripts/verifyFurnitureCatalog.js
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function verifyCatalog() {
  console.log('🛋️ Starting Full Quality & Verification Audit for WoodCraft Living Furniture Catalog...\n');
  await mongoose.connect(process.env.MONGODB_URI);

  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Seller = mongoose.models.Seller || mongoose.model('Seller', new mongoose.Schema({}, { strict: false }));
  const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({}, { strict: false }));

  let errors = [];

  // 1. Seller & User Check
  console.log('====================================================');
  console.log('1. SELLER PROFILE & CREDENTIALS CHECK');
  console.log('====================================================');
  const user = await User.findOne({ email: 'woodcraft.living@onlineplanet.com' });
  if (!user) {
    errors.push('User with email woodcraft.living@onlineplanet.com not found');
  } else {
    console.log(`- Email (Login ID): ${user.email} ✅`);
    console.log(`- User Role: ${user.role} ${user.role === 'seller' ? '✅' : '❌'}`);
    const passMatch = await bcrypt.compare('WoodCraft@2026', user.password);
    console.log(`- Password ('WoodCraft@2026') Valid: ${passMatch ? '✅' : '❌'}`);
    if (!passMatch) errors.push('Password does not match WoodCraft@2026');
  }

  const seller = await Seller.findOne({
    $or: [
      { userId: user?._id },
      { 'storeInfo.storeName': 'WoodCraft Living' },
      { 'businessInfo.businessName': 'WoodCraft Living Pvt. Ltd.' },
    ],
  });

  if (!seller) {
    errors.push('Seller profile for WoodCraft Living not found');
  } else {
    console.log(`- Store Name: ${seller.storeInfo?.storeName} ✅`);
    console.log(`- Seller ID: ${seller._id} ✅`);
    console.log(`- Verification Status: ${seller.verification?.status || seller.verificationStatus} ✅`);
    console.log(`- Subscription Plan: ${seller.subscription?.plan || seller.subscriptionPlan} ✅`);
  }

  const sellerId = seller?._id;

  // 2. Total Products Check (Target: 20)
  console.log('\n====================================================');
  console.log('2. FURNITURE PRODUCTS CATALOG (TARGET: 20)');
  console.log('====================================================');
  const products = await Product.find({ sellerId });
  console.log(`- Total Furniture Products Found: ${products.length} (Target: 20) ${products.length === 20 ? '✅' : '❌'}`);
  if (products.length !== 20) {
    errors.push(`Expected 20 furniture products, found ${products.length}`);
  }

  // Category Breakdown
  const catBreakdown = {};
  let totalImages = 0;
  let allHaveGte4Images = true;
  let allImagesList = [];

  products.forEach((p, idx) => {
    catBreakdown[p.subCategory || p.categoryPath] = (catBreakdown[p.subCategory || p.categoryPath] || 0) + 1;
    const imgCount = p.images?.length || 0;
    totalImages += imgCount;

    if (imgCount < 4) {
      allHaveGte4Images = false;
      errors.push(`Product "${p.name}" has ${imgCount} images (< 4)!`);
    }

    if (p.images) {
      p.images.forEach((img) => allImagesList.push({ product: p.name, sku: p.sku, url: img.url }));
    }

    console.log(`[#${(idx + 1).toString().padStart(2, ' ')}] ${(p.subCategory || '').padEnd(16)} | ${p.sku.padEnd(18)} | ₹${p.pricing.salePrice.toString().padEnd(6)} | Photos: ${imgCount} | ${p.name.substring(0, 40)}...`);
  });

  console.log('\n- Category Breakdown:');
  console.table(catBreakdown);
  console.log(`- All products have >= 4 photos: ${allHaveGte4Images ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`- Total Gallery Images: ${totalImages} (Average: ${(totalImages / products.length).toFixed(1)} per product)`);

  // 3. Live 100% HTTP Check for All Images (Ensuring Zero 404s)
  console.log('\n====================================================');
  console.log('3. TESTING 100% OF FURNITURE IMAGE URLS (ZERO 404s)');
  console.log('====================================================');
  console.log(`Total URLs to test via HTTP: ${allImagesList.length}`);

  let successCount = 0;
  let failedImages = [];
  const BATCH_SIZE = 15;

  for (let i = 0; i < allImagesList.length; i += BATCH_SIZE) {
    const batch = allImagesList.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (item) => {
        try {
          const res = await fetch(item.url, {
            headers: { Range: 'bytes=0-100', 'User-Agent': 'Mozilla/5.0' },
            signal: AbortSignal.timeout(6000),
          });
          return { item, ok: res.ok, status: res.status };
        } catch (err) {
          return { item, ok: false, error: err.message };
        }
      })
    );

    for (const r of results) {
      if (!r.ok) {
        failedImages.push({ url: r.item.url, sku: r.item.sku, product: r.item.product, status: r.status, error: r.error });
      } else {
        successCount++;
      }
    }
    process.stdout.write(`  Tested ${Math.min(i + BATCH_SIZE, allImagesList.length)}/${allImagesList.length} images... (Success: ${successCount}, Failed: ${failedImages.length})\r`);
  }

  console.log(`\n\nImage Verification Result: ${successCount}/${allImagesList.length} succeeded!`);
  if (failedImages.length > 0) {
    console.error('❌ Failed Images:', failedImages);
    errors.push(`${failedImages.length} images failed verification!`);
  } else {
    console.log('🎉 100% OF IMAGE URLS RETURNED HTTP 200/206! ZERO 404s! ✅ PASS');
  }

  // 4. Storefront Search Simulation
  console.log('\n====================================================');
  console.log('4. STOREFRONT SEARCH & QUERY SIMULATION');
  console.log('====================================================');
  const queries = ['Sofa', 'Bed', 'Dining Table', 'Wardrobe', 'Office', 'Sheesham', 'WoodCraft'];
  for (const q of queries) {
    const matched = await Product.find({
      sellerId,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { subCategory: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ],
    });
    console.log(`- Query "${q}": Found ${matched.length} active products in WoodCraft Living storefront`);
  }

  console.log('\n====================================================');
  if (errors.length > 0) {
    console.error(`❌ AUDIT FAILED WITH ${errors.length} ERRORS!`);
    errors.forEach((e) => console.error(`  - ${e}`));
    await mongoose.disconnect();
    process.exit(1);
  } else {
    console.log('🎉 100% AUDIT COMPLETE — ALL SPECIFICATIONS SATISFIED!');
    console.log('====================================================\n');
    await mongoose.disconnect();
    process.exit(0);
  }
}

verifyCatalog().catch((err) => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
