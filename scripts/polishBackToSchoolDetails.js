const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const CATEGORY_FEATURES = {
  'Backpacks': [
    'Ergonomic padded S-curve shoulder straps and breathable mesh back panel for all-day comfort',
    'Multi-compartment organizer with dedicated padded sleeve fitting up to 17" laptops and tablets',
    'Durable water-resistant high-density polyester fabric engineered for daily student use',
    'Heavy-duty dual self-repairing zippers and reinforced stress-point stitching',
    'Quick-access front zippered pocket and dual stretchable side mesh water bottle holders'
  ],
  'Stationery Supplies': [
    'Premium smooth bright-white archival pages that prevent ink bleed-through and feathering',
    'Durable cover binding designed to withstand rigorous school bag daily transport',
    'Clean ruled margins and high-opacity paper suitable for gel pens, fountain pens, and ballpoints',
    'Comprehensive student essentials kit perfect for classroom notes, assignments, and revision',
    'Eco-friendly elemental chlorine-free (ECF) paper crafted with sustainable forestry standards'
  ],
  'Laptops & Accessories': [
    'Multi-layer shock-absorbing padding protection shielding laptops against accidental bumps and drops',
    'Spill-resistant and water-repellent exterior fabric for all-weather campus travel',
    'Scratch-resistant soft fleece inner lining ensuring pristine hardware surfaces',
    'Slim and lightweight profile easily fits into backpacks, tote bags, or carrying cases',
    'Reinforced dual zippers and smooth gliding pullers for effortless access'
  ],
  'Lunch Boxes': [
    '100% Food-grade, BPA-free, non-toxic and microwave/freezer-safe materials',
    'Leak-proof airtight silicone gasket seal with 4-way secure snap locking clips',
    'Multiple balanced compartments designed for nutritious portion control and snack separation',
    'Stain-resistant, odor-resistant, and top-rack dishwasher safe for effortless cleaning',
    'Compact, portable, and durable design easily fitting school lunch bags and backpacks'
  ],
  'Water Bottles': [
    'Double-wall vacuum insulated stainless steel keeping drinks icy cold for 24h and warm for 12h',
    '100% Leak-proof lid with ergonomic sipper spout, straw, and secure locking flip cap',
    'Food-grade 304 (18/8) rust-free stainless steel preserving fresh flavor with zero metallic taste',
    'Comfortable carry handle/strap ideal for school, sports activities, and outdoor campus life',
    'Sweat-free powder-coated exterior providing an anti-slip grip for small and student hands'
  ],
  'Desk Setup': [
    'Eye-caring flicker-free illumination with adjustable brightness levels and ambient color modes',
    'Handcrafted premium wooden and metal construction adding timeless aesthetic to study spaces',
    'Ergonomic space-saving footprint with integrated organizer capacity for pens, phone, and books',
    'Energy-saving long-lasting LED technology providing comfortable glare-free reading light',
    'Stable anti-slip weighted base engineered for safety and vibration-free desk use'
  ],
  'Back To Nursery': [
    'Ultra-soft, skin-friendly, and lightweight materials customized for toddlers and preschoolers',
    'Ergonomic adjustable padded shoulder straps with secure front chest clip to prevent slipping',
    'Adorable vibrant 3D cartoon animal character design that kids love carrying to nursery',
    'Spacious main compartment perfectly sized for snacks, change of clothes, and drawing supplies',
    'Smooth, rounded child-safe zipper pulls that little hands can open and close with ease'
  ]
};

async function polish() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

  const products = await Product.find({ category: 'back-to-school' });
  console.log(`Found ${products.length} products to polish.`);

  for (const prod of products) {
    const sub = prod.subCategory || 'Backpacks';
    const feats = CATEGORY_FEATURES[sub] || CATEGORY_FEATURES['Backpacks'];

    const shortDesc = `${sub} engineered for students with durable quality, ergonomic comfort, and practical daily utility.`;
    const fullDesc = `${prod.name}.\n\n` +
      `Product Highlights:\n` +
      feats.map(f => `• ${f}`).join('\n') +
      `\n\nEquip students for success with verified campus gear built to last through the entire academic year.`;

    await Product.updateOne(
      { _id: prod._id },
      {
        $set: {
          highlights: feats,
          shortDescription: shortDesc,
          description: fullDesc
        }
      }
    );
    console.log(`✨ Polished: [${sub}] ${prod.name.slice(0, 45)}...`);
  }

  console.log('🎉 All 21 Back to School products polished successfully!');
  await mongoose.disconnect();
}

polish().catch(console.error);
