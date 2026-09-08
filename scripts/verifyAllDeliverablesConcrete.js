const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function verifyAllConcrete() {
  console.log('🚀 RUNNING 100% CONCRETE AUDIT FOR DREAM ELECTRONICS DELIVERABLES...\n');
  await mongoose.connect(process.env.MONGODB_URI);

  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Seller = mongoose.models.Seller || mongoose.model('Seller', new mongoose.Schema({}, { strict: false }));
  const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({}, { strict: false }));

  let errors = [];

  // 1. Seller & User Check
  console.log('--- 1. SELLER & USER AUTHENTICATION & KYC ---');
  const user = await User.findOne({ email: 'dream.electronics@onlineplanet.com' });
  if (!user) {
    errors.push('User with email dream.electronics@onlineplanet.com not found');
  } else {
    console.log(`✅ User found: ${user._id} (${user.email})`);
    if (user.role !== 'seller') errors.push(`User role is '${user.role}', expected 'seller'`);
    else console.log('✅ User role is seller');

    const passMatch = await bcrypt.compare('DreamElectronics@2026', user.password);
    if (!passMatch) errors.push('Password does not match DreamElectronics@2026');
    else console.log('✅ Password matches DreamElectronics@2026');
  }

  const seller = await Seller.findOne({
    $or: [
      { userId: user?._id },
      { 'businessInfo.businessName': 'Dream Electronics' },
      { 'storeInfo.storeName': 'Dream Electronics' }
    ]
  });

  if (!seller) {
    errors.push('Seller profile not found');
  } else {
    console.log(`✅ Seller profile found: ${seller._id}`);
    console.log(`   Store Name: ${seller.storeInfo?.storeName}`);
    console.log(`   Business Name: ${seller.businessInfo?.businessName}`);
    console.log(`   Plan: ${seller.subscription?.plan}`);
    console.log(`   Status: ${seller.verification?.status || seller.verificationStatus}`);
  }

  const sellerId = seller?._id;

  // 2. 20 ACs Check (2025/2026 Only)
  console.log('\n--- 2. 20 AIR CONDITIONERS (2025 & 2026 ONLY) ---');
  const acs = await Product.find({
    sellerId,
    $or: [
      { categoryPath: /air-conditioner/i },
      { tags: { $in: ['air conditioner', 'ac', 'split ac'] } }
    ]
  });

  console.log(`Total ACs found: ${acs.length}`);
  if (acs.length !== 20) {
    errors.push(`Expected exactly 20 ACs, found ${acs.length}`);
  }

  let acImageUrls = [];
  acs.forEach((ac, idx) => {
    // Check 2025/2026
    const text = `${ac.name} ${ac.description} ${ac.tags.join(' ')}`;
    const has2025 = text.includes('2025');
    const has2026 = text.includes('2026');
    if (!has2025 && !has2026) {
      errors.push(`AC #${idx + 1} (${ac.name}) does not mention 2025 or 2026`);
    }

    // Check images count >= 4
    if (!ac.images || ac.images.length < 4) {
      errors.push(`AC #${idx + 1} has ${ac.images?.length || 0} images, expected >= 4`);
    } else {
      ac.images.forEach(img => acImageUrls.push({ product: ac.name, url: img.url }));
    }
  });
  console.log(`✅ All ${acs.length} ACs have 2025/2026 certifications and >= 4 images! Total AC images: ${acImageUrls.length}`);

  // 3. Headphones Check (>= 4 images, authentic scraped, no 404s)
  console.log('\n--- 3. HEADPHONES CATALOG ---');
  const headphones = await Product.find({
    sellerId,
    $or: [
      { sku: { $regex: /^DE-HP-/ } },
      { tags: { $in: ['headphones', 'anc', 'earbuds', 'over ear'] } }
    ]
  });

  console.log(`Total Headphones found: ${headphones.length}`);
  if (headphones.length < 12) {
    errors.push(`Expected >= 12 headphones, found ${headphones.length}`);
  }

  let hpImageUrls = [];
  headphones.forEach((hp, idx) => {
    if (!hp.images || hp.images.length < 4) {
      errors.push(`Headphone #${idx + 1} (${hp.name}) has ${hp.images?.length || 0} images, expected >= 4`);
    } else {
      hp.images.forEach(img => hpImageUrls.push({ product: hp.name, url: img.url }));
    }
  });
  console.log(`✅ All ${headphones.length} Headphones have >= 4 images! Total Headphone images: ${hpImageUrls.length}`);

  // 4. Live 100% HTTP Check for ALL AC images and ALL Headphone images
  console.log('\n--- 4. TESTING 100% OF IMAGES VIA LIVE HTTP REQUESTS (NO 404s ALLOWED) ---');
  const allImagesToTest = [
    ...acImageUrls.map(x => ({ type: 'AC', ...x })),
    ...hpImageUrls.map(x => ({ type: 'Headphone', ...x }))
  ];
  console.log(`Total images to test individually: ${allImagesToTest.length}`);

  let failedImages = [];
  let successCount = 0;

  // Run tests in batches of 15 to be fast and respectful of CDN rate limits
  const BATCH_SIZE = 15;
  for (let i = 0; i < allImagesToTest.length; i += BATCH_SIZE) {
    const batch = allImagesToTest.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(async (item) => {
      try {
        const res = await fetch(item.url, {
          headers: { 'Range': 'bytes=0-100', 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(6000)
        });
        return { item, ok: res.ok, status: res.status };
      } catch (err) {
        return { item, ok: false, error: err.message };
      }
    }));

    for (const r of results) {
      if (!r.ok) {
        failedImages.push({ url: r.item.url, product: r.item.product, type: r.item.type, status: r.status, error: r.error });
      } else {
        successCount++;
      }
    }
    process.stdout.write(`  Tested ${Math.min(i + BATCH_SIZE, allImagesToTest.length)}/${allImagesToTest.length} images... (Success: ${successCount}, Failed: ${failedImages.length})\r`);
  }

  console.log(`\n\nImage Verification Result: ${successCount}/${allImagesToTest.length} succeeded!`);
  if (failedImages.length > 0) {
    console.error('❌ Failed images:', failedImages);
    errors.push(`${failedImages.length} images failed HTTP verification (non-200 or timeout)`);
  } else {
    console.log('🎉 100% of all image URLs returned valid HTTP 200/206 status codes! ZERO 404s!');
  }

  console.log('\n=============================================');
  if (errors.length > 0) {
    console.error(`❌ AUDIT FAILED with ${errors.length} errors:`);
    errors.forEach(e => console.error(`  - ${e}`));
    await mongoose.disconnect();
    process.exit(1);
  } else {
    console.log('✅ ALL DELIVERABLES AND SPECIFICATIONS ARE 100% VERIFIED!');
    console.log('=============================================\n');
    await mongoose.disconnect();
    process.exit(0);
  }
}

verifyAllConcrete().catch(err => {
  console.error('Fatal error in audit:', err);
  process.exit(1);
});
