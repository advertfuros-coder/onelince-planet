// scripts/verifyDreamElectronicsAC.js
const mongoose = require('mongoose');
const https = require('https');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

function checkImage(url) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const req = https.request({
        method: 'HEAD',
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
      }, (res) => {
        resolve({ url, status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400 });
      });
      req.on('error', () => resolve({ url, status: 500, ok: false }));
      req.setTimeout(5000, () => {
        req.destroy();
        resolve({ url, status: 408, ok: false });
      });
      req.end();
    } catch {
      resolve({ url, status: 500, ok: false });
    }
  });
}

async function verifyAll() {
  console.log('🔍 Starting comprehensive verification for Dream Electronics AC products...\n');
  await mongoose.connect(process.env.MONGODB_URI);

  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Seller = mongoose.models.Seller || mongoose.model('Seller', new mongoose.Schema({}, { strict: false }));
  const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

  // 1. Verify User & Seller
  const user = await User.findOne({ email: 'dream.electronics@onlineplanet.com' }).lean();
  console.log('1. User Check:');
  console.log(`   - ID: ${user._id}`);
  console.log(`   - Email: ${user.email}`);
  console.log(`   - Role: ${user.role}`);
  console.log(`   - isVerified: ${user.isVerified}`);

  const seller = await Seller.findOne({ userId: user._id }).lean();
  console.log('\n2. Seller Check:');
  console.log(`   - ID: ${seller._id}`);
  console.log(`   - Store Name: ${seller.storeInfo.storeName}`);
  console.log(`   - Status: ${seller.verificationStatus}`);
  console.log(`   - Plan: ${seller.subscriptionPlan}`);
  console.log(`   - All Steps Verified:`, seller.verificationSteps);

  // 2. Query AC Products
  const acProducts = await Product.find({ sellerId: seller._id, sku: /^DE-AC-/ }).lean();
  console.log(`\n3. Product Count Check:`);
  console.log(`   - Found ${acProducts.length} AC products under Dream Electronics (Target: 20)`);

  let allImagesOk = true;
  let allMin4 = true;
  let all2025Or2026 = true;

  console.log(`\n4. Inspecting Individual Products:`);
  for (const [idx, p] of acProducts.entries()) {
    const hasMin4 = p.images && p.images.length >= 4;
    if (!hasMin4) allMin4 = false;

    const isYearValid = /2025|2026/.test(p.name);
    if (!isYearValid) all2025Or2026 = false;

    console.log(`   [#${idx + 1}] [${p.brand}] ${p.name.substring(0, 55)}...`);
    console.log(`        SKU: ${p.sku} | Price: ₹${p.pricing.salePrice} (MRP: ₹${p.pricing.basePrice}) | Photos: ${p.images?.length}`);

    // Verify first 2 images of each product over network
    for (const img of p.images.slice(0, 2)) {
      const check = await checkImage(img.url);
      if (!check.ok) {
        allImagesOk = false;
        console.log(`        ❌ Image 404/Error (${check.status}): ${img.url}`);
      }
    }
  }

  console.log('\n=======================================');
  console.log('VERIFICATION SUMMARY:');
  console.log(`- Exact 20 AC Products: ${acProducts.length === 20 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`- All have >= 4 Photos: ${allMin4 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`- All 2025/2026 Models: ${all2025Or2026 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`- Image HTTP Status (No 404): ${allImagesOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`- Seller Active & Approved: ${seller.verificationStatus === 'approved' ? '✅ PASS' : '❌ FAIL'}`);
  console.log('=======================================\n');

  await mongoose.disconnect();
}

verifyAll().catch(console.error);
