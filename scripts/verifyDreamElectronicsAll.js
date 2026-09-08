// scripts/verifyDreamElectronicsAll.js
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function verifyAll() {
  await mongoose.connect(process.env.MONGODB_URI);

  const Seller = mongoose.models.Seller || mongoose.model('Seller', new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    businessInfo: Object,
    storeInfo: Object,
    verificationStatus: String
  }, { strict: false }));

  const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' },
    name: String,
    brand: String,
    sku: String,
    category: String,
    categoryPath: String,
    pricing: Object,
    inventory: Object,
    images: Array,
    specifications: Array,
    highlights: Array,
    isActive: Boolean,
    isApproved: Boolean,
    isDraft: Boolean
  }, { strict: false }));

  console.log('=== 1. VERIFY SELLER ACCOUNT ===');
  const seller = await Seller.findOne({
    $or: [{ 'storeInfo.storeName': 'Dream Electronics' }, { 'businessInfo.businessName': 'Dream Electronics' }]
  });
  console.log('Seller:', seller?.storeInfo?.storeName, '| ID:', seller?._id, '| Status:', seller?.verificationStatus);

  console.log('\n=== 2. TOTAL PRODUCTS FOR DREAM ELECTRONICS ===');
  const allProducts = await Product.find({ sellerId: seller._id });
  console.log('Total Products Count:', allProducts.length);

  const tvs = allProducts.filter(p => p.category === 'Smart TV' || p.categoryPath?.includes('tv'));
  const phones = allProducts.filter(p => p.category === 'Smartphones' || p.categoryPath?.includes('smartphones'));
  console.log(`- Smart TVs: ${tvs.length}`);
  console.log(`- Smartphones: ${phones.length}`);

  console.log('\n=== 3. BRAND BREAKDOWN (SMARTPHONES) ===');
  const brandMap = {};
  phones.forEach(p => {
    brandMap[p.brand] = (brandMap[p.brand] || 0) + 1;
  });
  console.table(brandMap);

  console.log('\n=== 4. INTEGRITY CHECK FOR ALL 20 PHONES ===');
  let validCount = 0;
  phones.forEach((p, i) => {
    const hasImages = p.images && p.images.length >= 4;
    const hasPricing = p.pricing && p.pricing.basePrice > 0 && p.pricing.salePrice > 0;
    const hasStock = p.inventory && p.inventory.stock === 10;
    const isLive = p.isActive === true && p.isApproved === true && p.isDraft !== true;
    const hasSpecs = p.specifications && p.specifications.length >= 7;
    const hasHighlights = p.highlights && p.highlights.length >= 5;

    const isValid = hasImages && hasPricing && hasStock && isLive && hasSpecs && hasHighlights;
    if (isValid) validCount++;

    console.log(`[${i + 1}] ${p.brand.padEnd(8)} | ${p.sku.padEnd(20)} | ₹${p.pricing.salePrice.toLocaleString('en-IN').padEnd(7)} | Imgs: ${p.images.length} | Specs: ${p.specifications.length} | Live: ${isLive ? 'YES' : 'NO'}`);
  });

  console.log(`\nIntegrity Result: ${validCount}/20 phones passed all strict checks!`);

  console.log('\n=== 5. SEARCH SIMULATION ===');
  const testQueries = ['iPhone', 'Galaxy', 'OnePlus', 'Redmi', 'Vivo', 'Realme', 'Oppo', 'Sony'];
  for (const q of testQueries) {
    const matched = await Product.find({
      sellerId: seller._id,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ]
    });
    console.log(`Search '${q}': Found ${matched.length} products`);
  }

  await mongoose.connection.close();
  console.log('\n✅ ALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
}

verifyAll().catch(err => {
  console.error(err);
  process.exit(1);
});
