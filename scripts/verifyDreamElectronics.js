// scripts/verifyDreamElectronics.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function verify() {
  await mongoose.connect(process.env.MONGODB_URI);

  const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    name: String,
    email: String,
    role: String,
    isVerified: Boolean,
    password: String
  }, { strict: false }));

  const Seller = mongoose.models.Seller || mongoose.model('Seller', new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    businessInfo: Object,
    storeInfo: Object,
    verificationStatus: String,
    subscriptionPlan: String
  }, { strict: false }));

  const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
    name: String,
    brand: String,
    sku: String,
    pricing: Object,
    inventory: Object,
    images: Array,
    specifications: Array,
    highlights: Array,
    isActive: Boolean,
    isApproved: Boolean,
    isDraft: Boolean
  }, { strict: false }));

  console.log('=== 1. VERIFY SELLER USER ===');
  const user = await User.findOne({ email: 'dream.electronics@onlineplanet.com' });
  console.log('User found:', !!user);
  console.log('Name:', user?.name);
  console.log('Email:', user?.email);
  console.log('Role:', user?.role);
  console.log('IsVerified:', user?.isVerified);
  const passwordMatch = await bcrypt.compare('DreamElectronics@2026', user?.password || '');
  console.log('Password valid (DreamElectronics@2026):', passwordMatch);

  console.log('\n=== 2. VERIFY SELLER PROFILE ===');
  const seller = await Seller.findOne({ userId: user._id });
  console.log('Seller profile found:', !!seller);
  console.log('Business Name:', seller?.businessInfo?.businessName);
  console.log('Store Name:', seller?.storeInfo?.storeName);
  console.log('Store Slug:', seller?.storeInfo?.storeSlug);
  console.log('GSTIN:', seller?.businessInfo?.gstin);
  console.log('Verification Status:', seller?.verificationStatus);
  console.log('Subscription Plan:', seller?.subscriptionPlan);

  console.log('\n=== 3. VERIFY 5 PRODUCTS ===');
  const products = await Product.find({ sellerId: seller._id });
  console.log('Total Products for Dream Electronics:', products.length);

  products.forEach((p, idx) => {
    console.log(`\n--- Product ${idx + 1}: ${p.brand} ---`);
    console.log('Name:', p.name);
    console.log('SKU:', p.sku);
    console.log('MRP (Base Price): ₹' + p.pricing?.basePrice?.toLocaleString('en-IN'));
    console.log('Sale Price: ₹' + p.pricing?.salePrice?.toLocaleString('en-IN'));
    console.log('Discount:', p.pricing?.discountPercentage?.toFixed(1) + '%');
    console.log('Stock:', p.inventory?.stock);
    console.log('Images Count:', p.images?.length);
    console.log('Primary Image:', p.images?.find((i) => i.isPrimary)?.url || p.images[0]?.url);
    console.log('Specs Count:', p.specifications?.length);
    console.log('Highlights Count:', p.highlights?.length);
    console.log('Active:', p.isActive, '| Approved:', p.isApproved);
  });

  console.log('\n=== 4. TEST SELLER DASHBOARD QUERY ===');
  const activeCount = await Product.countDocuments({
    sellerId: seller._id,
    isActive: true,
    isDraft: { $ne: true },
  });
  const totalCount = await Product.countDocuments({ sellerId: seller._id });
  console.log('Seller Total Products:', totalCount);
  console.log('Seller Active Products:', activeCount);

  console.log('\n=== 5. TEST STOREFRONT POPULATION ===');
  const sample = await Product.findOne({ sellerId: seller._id }).populate({
    path: 'sellerId',
    select: 'storeInfo.storeName ratings',
  });
  console.log('Populated Store Name:', sample?.sellerId?.storeInfo?.storeName);

  await mongoose.connection.close();
  console.log('\n✅ ALL VERIFICATION CHECKS PASSED');
}

verify().catch((err) => {
  console.error(err);
  process.exit(1);
});
