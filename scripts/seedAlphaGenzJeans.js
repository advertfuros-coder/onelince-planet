// scripts/seedAlphaGenzJeans.js
/**
 * Seeding script for seller 'Alpha GENZ Fashions' and 20 curated Men's Jeans products
 * Scraped from Flipkart and Amazon India
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

// 1. Schemas matching my-app DB models
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
        default: 'fashion',
      },
      establishedYear: { type: Number, default: 2023 },
      country: { type: String, default: 'IN' },
    },
    pickupAddress: {
      addressLine1: { type: String, required: true },
      addressLine2: String,
      landmark: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: 'IN' },
      isDefault: { type: Boolean, default: true },
    },
    storeInfo: {
      storeName: { type: String, required: true },
      storeDescription: String,
      storeLogo: String,
      storeBanner: String,
      storeSlug: { type: String, sparse: true },
      website: String,
      storeCategories: [String],
      returnPolicy: String,
      shippingPolicy: String,
      termsAndConditions: String,
      customerSupportEmail: String,
      customerSupportPhone: String,
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
      totalReviews: { type: Number, default: 156 },
    },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: true },
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
      soldCount: { type: Number, default: 18 },
    },
    options: [
      {
        name: { type: String, required: true },
        values: [String],
      },
    ],
    variants: [
      {
        name: String,
        sku: String,
        price: Number,
        stock: Number,
        attributes: { type: Map, of: String },
        images: [String],
      },
    ],
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
      returnDuration: { type: Number, default: 7 },
      isReplaceable: { type: Boolean, default: true },
      replacementDuration: { type: Number, default: 7 },
    },
    deliveryEstimate: {
      domestic: {
        min: { type: Number, default: 2 },
        max: { type: Number, default: 4 },
      },
      international: {
        min: { type: Number, default: 7 },
        max: { type: Number, default: 12 },
      },
      lastUpdated: { type: Date, default: Date.now },
    },
    ratings: {
      average: { type: Number, default: 4.5 },
      count: { type: Number, default: 85 },
    },
    tags: [String],
    keywords: [String],
    highlights: [String],
    hsnCode: { type: String, default: '62034200' },
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isDraft: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    importedFrom: { type: String, default: 'manual' },
  },
  { timestamps: true }
);

// Helper for sizes and variants
function generateJeansVariants(baseSku, salePrice) {
  const sizes = ['28', '30', '32', '34', '36'];
  return sizes.map((size) => ({
    name: `Size ${size}`,
    sku: `${baseSku}-${size}`,
    price: salePrice,
    stock: Math.floor(Math.random() * 20) + 10,
    attributes: { Size: size },
  }));
}

// 20 Curated Men's Jeans Products from Flipkart & Amazon
const jeansProducts = [
  // 1. Levi's 511 Slim Fit Blue
  {
    name: "Levi's 511 Men Slim Fit Mid Rise Blue Jeans",
    brand: "Levi's",
    sku: "AGF-LEV-511-BLU",
    shortDescription: "Iconic Levi's 511 Slim Fit denim with stretch flexibility and timeless blue wash.",
    description: `### Levi's 511™ Slim Fit Denim Jeans
The definitive modern slim fit that is cut close without being too restrictive. A quintessential wardrobe staple designed for versatility.

- **Fit:** Slim through the hip and thigh with a slightly tapered leg.
- **Fabric:** 98% Cotton, 2% Elastane for superior stretch and shape recovery.
- **Rise:** Sits right below the natural waist (Mid Rise).
- **Styling:** Pair effortlessly with a graphic tee, crisp button-down shirt, or casual jacket.
- **Care:** Machine wash cold, wash inside out with like colors.`,
    pricing: {
      basePrice: 3499,
      salePrice: 1644,
      costPrice: 1100,
      discountPercentage: 53,
    },
    inventory: {
      stock: 65,
      lowStockThreshold: 10,
      reorderPoint: 15,
      trackInventory: true,
      soldCount: 42,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/jean/b/j/y/28-18298-1954-levi-s-original-imahn7bfu78zdhhu.jpeg?q=70",
        alt: "Levi's 511 Men Slim Fit Mid Rise Blue Jeans",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Slim Fit" },
      { key: "Rise", value: "Mid Rise" },
      { key: "Fabric", value: "98% Cotton, 2% Elastane" },
      { key: "Stretch", value: "Stretchable" },
      { key: "Closure", value: "Button & Zip Fly" },
      { key: "Pockets", value: "5 Pockets" },
      { key: "Wash Care", value: "Machine Wash" },
      { key: "Distress", value: "Clean Look" },
    ],
    ratings: { average: 4.6, count: 184 },
    tags: ["levis", "511", "slim-fit", "men-jeans", "denim", "blue-jeans"],
    keywords: ["levis jeans", "slim fit jeans", "blue denim", "mens branded jeans"],
    highlights: ["Signature Levi's Red Tab", "Flexible All-Day Comfort Stretch", "5-Pocket Classic Construction"],
    isFeatured: true,
  },

  // 2. Levi's 512 Tapered Fit Blue
  {
    name: "Levi's 512 Men Tapered Fit Mid Rise Blue Jeans",
    brand: "Levi's",
    sku: "AGF-LEV-512-BLU",
    shortDescription: "Levi's 512 Slim Taper tailored fit jeans offering a sleek modern silhouette.",
    description: `### Levi's 512™ Slim Taper Jeans
The perfect sweet spot between a skinny and a regular taper. Slim through the thigh with a clean narrow leg opening for a sharp modern aesthetic.

- **Fit:** Slim through the thigh, tapered down to the ankle.
- **Fabric:** Heavyweight premium stretch denim (99% Cotton, 1% Elastane).
- **Finishing:** Whiskered wash with subtle faded detailing.
- **Occasion:** Everyday casual, weekend outings, and evening wear.`,
    pricing: {
      basePrice: 2999,
      salePrice: 1409,
      costPrice: 950,
      discountPercentage: 53,
    },
    inventory: {
      stock: 55,
      lowStockThreshold: 10,
      reorderPoint: 15,
      trackInventory: true,
      soldCount: 38,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/jean/x/u/h/-original-imahq7yhb2ghzfbe.jpeg?q=70",
        alt: "Levi's 512 Men Tapered Fit Mid Rise Blue Jeans",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Tapered Fit" },
      { key: "Rise", value: "Mid Rise" },
      { key: "Fabric", value: "99% Cotton, 1% Elastane" },
      { key: "Stretch", value: "Stretchable" },
      { key: "Closure", value: "Zip Fly with Shank Button" },
      { key: "Wash", value: "Medium Stone Wash" },
    ],
    ratings: { average: 4.5, count: 142 },
    tags: ["levis", "512", "tapered-fit", "stretch", "blue-jeans"],
    keywords: ["levis 512", "tapered jeans men", "mens blue denim"],
    highlights: ["Sleek Slim Taper Cut", "Whiskered Thigh Highlights", "Durable Double-Stitched Seams"],
    isFeatured: true,
  },

  // 3. Levi's Men Tapered Fit Mid Rise Black
  {
    name: "Levi's Men Tapered Fit Mid Rise Black Denim Jeans",
    brand: "Levi's",
    sku: "AGF-LEV-TAP-BLK",
    shortDescription: "Deep pitch-black tapered denim by Levi's with sleek contouring and premium stretch.",
    description: `### Levi's Black Denim Tapered Jeans
Versatile black denim engineered with fade-resistant dye technology. Delivers an urban sleek look that bridges casual streetwear and smart casual.

- **Fit:** Slim Tapered fit tailored around the ankle.
- **Fabric:** 98% Cotton, 2% Spandex blend for active movement.
- **Color:** Deep Jet Black that stays true through multiple washes.`,
    pricing: {
      basePrice: 2999,
      salePrice: 1409,
      costPrice: 950,
      discountPercentage: 53,
    },
    inventory: {
      stock: 50,
      lowStockThreshold: 8,
      reorderPoint: 12,
      trackInventory: true,
      soldCount: 45,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/jean/h/c/b/-original-imah3fqksvgdd6kc.jpeg?q=70",
        alt: "Levi's Men Tapered Fit Mid Rise Black Jeans",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Tapered Fit" },
      { key: "Rise", value: "Mid Rise" },
      { key: "Color", value: "Jet Black" },
      { key: "Fabric", value: "Cotton Blend with Spandex" },
      { key: "Stretch", value: "Mild Stretch" },
    ],
    ratings: { average: 4.7, count: 210 },
    tags: ["levis", "black-jeans", "tapered", "streetwear", "alpha-genz"],
    keywords: ["black levis jeans", "black tapered denim", "mens black jeans"],
    highlights: ["Fade-Resistant Deep Black Dye", "Custom Branded Rivets", "Premium Leather Back Patch"],
    isFeatured: true,
  },

  // 4. Levi's Men Straight Fit Dark Blue
  {
    name: "Levi's Men Straight Fit Mid Rise Dark Blue Jeans",
    brand: "Levi's",
    sku: "AGF-LEV-STR-DBLU",
    shortDescription: "Classic straight-leg cut in deep dark blue denim with authentic heritage detailing.",
    description: `### Levi's Heritage Straight Fit Jeans
Timeless, comfortable, and iconic. The straight fit offers room through the seat and thigh with a straight leg opening from knee to ankle.

- **Fit:** Relaxed Straight Fit.
- **Fabric:** 100% Heavy Cotton Denim.
- **Finish:** Raw dark indigo rinse with golden contrast stitching.`,
    pricing: {
      basePrice: 3099,
      salePrice: 1549,
      costPrice: 1020,
      discountPercentage: 50,
    },
    inventory: {
      stock: 45,
      lowStockThreshold: 8,
      reorderPoint: 12,
      trackInventory: true,
      soldCount: 29,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/jean/g/m/h/-original-imahq7cz8zgfgmba.jpeg?q=70",
        alt: "Levi's Men Straight Fit Mid Rise Dark Blue Jeans",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Straight Fit" },
      { key: "Rise", value: "Mid Rise" },
      { key: "Fabric", value: "100% Pure Cotton" },
      { key: "Stretch", value: "Non-Stretch" },
      { key: "Finish", value: "Dark Rinse" },
    ],
    ratings: { average: 4.4, count: 96 },
    tags: ["levis", "straight-fit", "raw-denim", "dark-blue"],
    keywords: ["straight fit jeans levis", "dark blue denim", "mens classic jeans"],
    highlights: ["Authentic Rigid 100% Cotton", "Copper Rivets & Shank Button", "Reinforced Stress Points"],
    isFeatured: false,
  },

  // 5. Jack & Jones Slim Fit Blue (Scraped from Amazon)
  {
    name: "Jack & Jones Men Solid Cotton Blend Slim Fit Low Rise Blue Jeans",
    brand: "Jack & Jones",
    sku: "AGF-JJ-SLIM-BLU",
    shortDescription: "Premium Jack & Jones European slim fit jeans with high-recovery stretch blend.",
    description: `### Jack & Jones Men's Slim Fit Denim
Imported from premier retail collections, these Jack & Jones slim fit jeans deliver modern European styling, exceptional flexibility, and tailored fit.

- **Fabric:** 98% Cotton, 2% Elastane for unhindered mobility.
- **Fit:** Slim low-rise cut with ergonomic seams.
- **Weight:** 320g lightweight comfortable all-weather denim.
- **Hardware:** Matte metal trims with embossed brand logo.`,
    pricing: {
      basePrice: 3499,
      salePrice: 1400,
      costPrice: 920,
      discountPercentage: 60,
    },
    inventory: {
      stock: 50,
      lowStockThreshold: 10,
      reorderPoint: 15,
      trackInventory: true,
      soldCount: 52,
    },
    images: [
      {
        url: "https://m.media-amazon.com/images/I/51cHzpby4PL._SY741_.jpg",
        alt: "Jack & Jones Men Solid Cotton Blend Slim Fit Low Rise Blue Jeans",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Slim Fit" },
      { key: "Rise", value: "Low Rise" },
      { key: "Fabric", value: "Cotton Blend (98% Cotton, 2% Elastane)" },
      { key: "Stretch", value: "Super Stretch" },
      { key: "Origin", value: "India" },
    ],
    ratings: { average: 4.5, count: 110 },
    tags: ["jack-and-jones", "slim-fit", "low-rise", "amazon-bestseller"],
    keywords: ["jack and jones jeans", "slim low rise jeans", "cotton stretch jeans"],
    highlights: ["60% Off Limited Season Deal", "360-Degree Comfort Flex", "Tailored Low Rise Waist"],
    isFeatured: true,
  },

  // 6. Jack & Jones Regular Fit Light Blue (Amazon)
  {
    name: "Jack & Jones Men Regular Fit Low Rise Light Blue Jeans",
    brand: "Jack & Jones",
    sku: "AGF-JJ-REG-LBLU",
    shortDescription: "Fresh summer aesthetic in light ice-blue wash with relaxed low-rise fit.",
    description: `### Jack & Jones Light Blue Denim
A breezy casual wash designed for warm climates and casual summer styling. Features gentle distressing and clean stone wash accents.

- **Fit:** Regular fit through seat with straight leg.
- **Wash:** Bleached ice blue stone wash.
- **Comfort:** Breathable cotton weave with soft interior finish.`,
    pricing: {
      basePrice: 3599,
      salePrice: 1800,
      costPrice: 1150,
      discountPercentage: 50,
    },
    inventory: {
      stock: 40,
      lowStockThreshold: 8,
      reorderPoint: 12,
      trackInventory: true,
      soldCount: 31,
    },
    images: [
      {
        url: "https://images-eu.ssl-images-amazon.com/images/I/614iDAYN+nL._AC_UL600_SR600,600_.jpg",
        alt: "Jack & Jones Men Regular Fit Low Rise Light Blue Jeans",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Regular Fit" },
      { key: "Rise", value: "Low Rise" },
      { key: "Color", value: "Light Blue" },
      { key: "Fabric", value: "99% Cotton, 1% Elastane" },
    ],
    ratings: { average: 4.4, count: 68 },
    tags: ["jack-and-jones", "light-blue", "regular-fit", "summer-denim"],
    keywords: ["light blue jeans", "ice wash denim", "jack and jones regular"],
    highlights: ["Subtle Whisker Fade", "Breathable Lightweight Twill", "Signature J&J Jacron Patch"],
    isFeatured: false,
  },

  // 7. Jack & Jones Slim Dark Indigo (Amazon)
  {
    name: "Jack & Jones Men Slim Fit Low Rise Dark Indigo Jeans",
    brand: "Jack & Jones",
    sku: "AGF-JJ-SLIM-IND",
    shortDescription: "Deep navy indigo wash with clean flat front and tonal stitching.",
    description: `### Jack & Jones Dark Indigo Slim Denim
Sharp, refined, and versatile. The deep dark indigo colorway works seamlessly for casual Fridays, semi-formal dinners, or evening outings.

- **Fit:** Modern Slim Fit.
- **Color:** Dark Indigo Blue.
- **Fabric:** 98% Ring-Spun Cotton, 2% Spandex.`,
    pricing: {
      basePrice: 2999,
      salePrice: 1203,
      costPrice: 790,
      discountPercentage: 60,
    },
    inventory: {
      stock: 45,
      lowStockThreshold: 10,
      reorderPoint: 15,
      trackInventory: true,
      soldCount: 40,
    },
    images: [
      {
        url: "https://images-eu.ssl-images-amazon.com/images/I/51B5kmYawlL._AC_UL600_SR600,600_.jpg",
        alt: "Jack & Jones Men Slim Fit Low Rise Dark Indigo Jeans",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Slim Fit" },
      { key: "Rise", value: "Low Rise" },
      { key: "Fabric", value: "Cotton Blend Stretch" },
      { key: "Pockets", value: "5 Pockets" },
    ],
    ratings: { average: 4.5, count: 92 },
    tags: ["jack-and-jones", "dark-indigo", "evening-wear", "slim-jeans"],
    keywords: ["dark indigo jeans", "jack and jones slim", "mens smart denim"],
    highlights: ["Tonal Stitch Detailing", "Deep Saturation Dye", "Wrinkle-Resistant Weave"],
    isFeatured: false,
  },

  // 8. Spykar Loose Fit Low Rise Blue
  {
    name: "Spykar Men Loose Fit Low Rise Washed Blue Jeans",
    brand: "Spykar",
    sku: "AGF-SPY-LSE-BLU",
    shortDescription: "On-trend Gen-Z baggy streetwear silhouette in medium blue denim from Spykar.",
    description: `### Spykar Loose Fit Streetwear Denim
Built for the Gen-Z street style aesthetic. A relaxed, slouchy loose fit engineered with durable heavy-gauge denim for skate culture and everyday wear.

- **Fit:** Loose / Relaxed Baggy Cut.
- **Rise:** Low Rise Slouch.
- **Fabric:** 100% Breathable Cotton.
- **Aesthetic:** Wide leg opening that falls neatly over sneakers and high-tops.`,
    pricing: {
      basePrice: 2699,
      salePrice: 1133,
      costPrice: 750,
      discountPercentage: 58,
    },
    inventory: {
      stock: 60,
      lowStockThreshold: 10,
      reorderPoint: 15,
      trackInventory: true,
      soldCount: 54,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/jean/w/r/q/-original-imahq7d4esghusrx.jpeg?q=70",
        alt: "Spykar Men Loose Fit Low Rise Washed Blue Jeans",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Loose Fit" },
      { key: "Rise", value: "Low Rise" },
      { key: "Fabric", value: "100% Cotton" },
      { key: "Style", value: "Baggy / Streetwear" },
      { key: "Leg Opening", value: "Wide Leg" },
    ],
    ratings: { average: 4.6, count: 175 },
    tags: ["spykar", "loose-fit", "baggy-jeans", "gen-z", "streetwear"],
    keywords: ["spykar baggy jeans", "loose fit denim men", "skater jeans"],
    highlights: ["Authentic Streetwear Fit", "Wide-Leg Sneaker Drop", "Durable Heavyweight Cotton"],
    isFeatured: true,
  },

  // 9. Spykar Loose Fit Black Streetwear
  {
    name: "Spykar Men Loose Fit Mid Rise Black Streetwear Jeans",
    brand: "Spykar",
    sku: "AGF-SPY-LSE-BLK",
    shortDescription: "Edgy washed black baggy jeans crafted with Spykar's signature urban design language.",
    description: `### Spykar Washed Black Baggy Jeans
A dark urban wardrobe hero. Loose through the hips and wide through the legs with a vintage acid-washed black patina.

- **Fit:** Loose Baggy Fit.
- **Finish:** Washed charcoal black with faint knee fades.
- **Styling:** Match with oversized hoodies, boxy graphic tees, and chunky sneakers.`,
    pricing: {
      basePrice: 3299,
      salePrice: 1319,
      costPrice: 870,
      discountPercentage: 60,
    },
    inventory: {
      stock: 55,
      lowStockThreshold: 10,
      reorderPoint: 15,
      trackInventory: true,
      soldCount: 48,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/jean/m/m/0/-original-imahpyfyczfzzpww.jpeg?q=70",
        alt: "Spykar Men Loose Fit Mid Rise Black Jeans",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Loose Fit" },
      { key: "Rise", value: "Mid Rise" },
      { key: "Color", value: "Washed Black" },
      { key: "Fabric", value: "100% Cotton" },
    ],
    ratings: { average: 4.7, count: 205 },
    tags: ["spykar", "black-denim", "loose-fit", "streetwear", "alpha-genz"],
    keywords: ["spykar black jeans", "black baggy denim", "loose black jeans"],
    highlights: ["Vintage Charcoal Wash", "Reinforced Pocket Linings", "Signature Back Pocket Stitch"],
    isFeatured: true,
  },

  // 10. Spykar Regular Fit Mid Rise Blue
  {
    name: "Spykar Men Regular Fit Mid Rise Blue Jeans",
    brand: "Spykar",
    sku: "AGF-SPY-REG-BLU",
    shortDescription: "All-day comfort regular fit jeans in classic blue stone wash by Spykar.",
    description: `### Spykar Classic Regular Fit Denim
Designed for men who value effortless comfort and rugged reliability. Engineered with active-flex denim that bends and moves with you.

- **Fit:** Regular Mid Rise.
- **Fabric:** 98% Cotton, 2% Elastane.
- **Finish:** Medium Enzyme Wash.`,
    pricing: {
      basePrice: 2599,
      salePrice: 1117,
      costPrice: 740,
      discountPercentage: 57,
    },
    inventory: {
      stock: 50,
      lowStockThreshold: 10,
      reorderPoint: 15,
      trackInventory: true,
      soldCount: 36,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/jean/f/1/t/-original-imahptygfzfpuxen.jpeg?q=70",
        alt: "Spykar Men Regular Fit Mid Rise Blue Jeans",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Regular Fit" },
      { key: "Rise", value: "Mid Rise" },
      { key: "Fabric", value: "Cotton Stretch" },
      { key: "Closure", value: "Button & Zip" },
    ],
    ratings: { average: 4.4, count: 112 },
    tags: ["spykar", "regular-fit", "blue-jeans", "daily-wear"],
    keywords: ["spykar regular jeans", "mens daily denim", "blue stretch jeans"],
    highlights: ["Comfort Waistband", "Enzyme Softened Fabric", "5 Pocket Classic Layout"],
    isFeatured: false,
  },

  // 11. Spykar Straight Fit Mid Rise Grey
  {
    name: "Spykar Men Straight Fit Mid Rise Grey Jeans",
    brand: "Spykar",
    sku: "AGF-SPY-STR-GRY",
    shortDescription: "Understated cool in premium slate grey denim with straight-leg architecture.",
    description: `### Spykar Slate Grey Straight Fit Denim
Ditch the conventional blue and elevate your style quotient with Spykar's slate grey straight denim.

- **Fit:** Straight leg from thigh to hem.
- **Color:** Cool Slate Grey with muted fading.
- **Fabric:** 99% Cotton, 1% Elastane.`,
    pricing: {
      basePrice: 2799,
      salePrice: 1175,
      costPrice: 780,
      discountPercentage: 58,
    },
    inventory: {
      stock: 45,
      lowStockThreshold: 8,
      reorderPoint: 12,
      trackInventory: true,
      soldCount: 28,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/jean/m/l/m/-original-imahqsfkttpfzyfc.jpeg?q=70",
        alt: "Spykar Men Straight Fit Mid Rise Grey Jeans",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Straight Fit" },
      { key: "Rise", value: "Mid Rise" },
      { key: "Color", value: "Grey" },
      { key: "Fabric", value: "Cotton Blend" },
    ],
    ratings: { average: 4.3, count: 88 },
    tags: ["spykar", "grey-jeans", "straight-fit", "neutral-denim"],
    keywords: ["spykar grey jeans", "grey straight fit denim", "mens grey jeans"],
    highlights: ["Contemporary Grey Tint", "Zero Color Bleed Guarantee", "Engineered Straight Cuff"],
    isFeatured: false,
  },

  // 12. Flying Machine Slim Fit Dark Blue
  {
    name: "Flying Machine Men Slim Fit Mid Rise Dark Blue Jeans",
    brand: "Flying Machine",
    sku: "AGF-FM-SLM-DBLU",
    shortDescription: "India's pioneer denim brand Flying Machine brings youthful energy and sharp slim tailoring.",
    description: `### Flying Machine Slim Fit Dark Indigo Jeans
Rock your everyday adventures with Flying Machine's signature youth slim cut. Crafted with high-stretch twill that maintains shape from morning till night.

- **Fit:** Slim tailored fit.
- **Rise:** Mid Rise.
- **Fabric:** 98% Cotton, 2% Spandex.
- **Features:** Anti-sag pocket construction and branded metal hardware.`,
    pricing: {
      basePrice: 2399,
      salePrice: 1104,
      costPrice: 720,
      discountPercentage: 54,
    },
    inventory: {
      stock: 60,
      lowStockThreshold: 10,
      reorderPoint: 15,
      trackInventory: true,
      soldCount: 44,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/jean/b/s/z/-original-imahq2ukhq6rpbgf.jpeg?q=70",
        alt: "Flying Machine Men Slim Fit Mid Rise Dark Blue Jeans",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Slim Fit" },
      { key: "Rise", value: "Mid Rise" },
      { key: "Fabric", value: "Cotton Blend Stretch" },
      { key: "Stretch", value: "Stretchable" },
    ],
    ratings: { average: 4.5, count: 165 },
    tags: ["flying-machine", "slim-fit", "dark-blue", "youth-denim"],
    keywords: ["flying machine jeans", "slim fit flying machine", "dark blue jeans"],
    highlights: ["Youth-Centric Slim Pattern", "Ultra-Flexible Movement", "Original Flying Machine Tri-Color Tab"],
    isFeatured: true,
  },

  // 13. Flying Machine Straight Fit Blue
  {
    name: "Flying Machine Men Straight Fit Mid Rise Blue Jeans",
    brand: "Flying Machine",
    sku: "AGF-FM-STR-BLU",
    shortDescription: "Authentic straight fit denim in rich blue with contrast stitching from Flying Machine.",
    description: `### Flying Machine Straight Fit Denim
A relaxed everyday classic with timeless appeal. Easy through the thigh and straight down, making it the ideal partner for shirts and polos.

- **Fit:** Straight Fit.
- **Wash:** Classic Indigo Wash.
- **Fabric:** 99% Cotton, 1% Elastane.`,
    pricing: {
      basePrice: 2599,
      salePrice: 1819,
      costPrice: 1190,
      discountPercentage: 30,
    },
    inventory: {
      stock: 40,
      lowStockThreshold: 8,
      reorderPoint: 12,
      trackInventory: true,
      soldCount: 22,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/jean/t/6/j/40-fmjen10254-flying-machine-original-imahntg4hj2jzpae.jpeg?q=70",
        alt: "Flying Machine Men Straight Fit Mid Rise Blue Jeans",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Straight Fit" },
      { key: "Rise", value: "Mid Rise" },
      { key: "Fabric", value: "Cotton Rich Blend" },
    ],
    ratings: { average: 4.3, count: 76 },
    tags: ["flying-machine", "straight-fit", "classic-blue"],
    keywords: ["flying machine straight fit", "mens blue jeans", "durable denim"],
    highlights: ["Reinforced Coin Pocket", "Soft-Touch Wash Finish", "Heavy-Duty Brass Zipper"],
    isFeatured: false,
  },

  // 14. Flying Machine Relaxed Fit Vintage Blue
  {
    name: "Flying Machine Men Relaxed Fit Mid Rise Blue Jeans",
    brand: "Flying Machine",
    sku: "AGF-FM-REL-BLU",
    shortDescription: "Relaxed vintage wash jeans crafted for effortless comfort and retro appeal.",
    description: `### Flying Machine Vintage Relaxed Jeans
Revisiting the golden era of 90s denim with a modern relaxed cut. Sits comfortably at the waist with generous room through the leg.

- **Fit:** Relaxed Fit.
- **Wash:** Vintage Hand-Distressed Blue.
- **Fabric:** 100% Breathable Cotton.`,
    pricing: {
      basePrice: 2199,
      salePrice: 1429,
      costPrice: 940,
      discountPercentage: 35,
    },
    inventory: {
      stock: 35,
      lowStockThreshold: 6,
      reorderPoint: 10,
      trackInventory: true,
      soldCount: 19,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/jean/f/b/j/-original-imahq635uczahzgp.jpeg?q=70",
        alt: "Flying Machine Men Relaxed Fit Mid Rise Blue Jeans",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Relaxed Fit" },
      { key: "Rise", value: "Mid Rise" },
      { key: "Fabric", value: "100% Cotton" },
    ],
    ratings: { average: 4.4, count: 82 },
    tags: ["flying-machine", "relaxed-fit", "vintage-denim", "90s-style"],
    keywords: ["flying machine relaxed jeans", "vintage wash denim", "comfy jeans"],
    highlights: ["Authentic Retro Wash", "Non-Constrictive Silhouette", "Durable Double Stitched Pockets"],
    isFeatured: false,
  },

  // 15. Killer Slim Fit Washed Blue
  {
    name: "Killer Men Slim Fit Mid Rise Washed Blue Denim Jeans",
    brand: "Killer",
    sku: "AGF-KLR-SLM-BLU",
    shortDescription: "Killer Jeans attitude in premium washed blue denim with stretch performance.",
    description: `### Killer Attitude Slim Fit Jeans
Unleash bold attitude with Killer's iconic premium jeans. Crafted with high-grade denim that features whiskering, thigh shading, and signature metal hardware.

- **Fit:** Slim Fit.
- **Fabric:** 98% Cotton, 2% Elastane.
- **Wash:** Distressed Medium Blue.`,
    pricing: {
      basePrice: 3599,
      salePrice: 1439,
      costPrice: 950,
      discountPercentage: 60,
    },
    inventory: {
      stock: 55,
      lowStockThreshold: 10,
      reorderPoint: 15,
      trackInventory: true,
      soldCount: 41,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/jean/n/h/2/32-kjo-91896-slm-slmft-mding-killer-original-imahp9mq3jsz64jf.jpeg?q=70",
        alt: "Killer Men Slim Fit Mid Rise Blue Jeans",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Slim Fit" },
      { key: "Rise", value: "Mid Rise" },
      { key: "Fabric", value: "98% Cotton, 2% Elastane" },
      { key: "Stretch", value: "Stretchable" },
    ],
    ratings: { average: 4.6, count: 168 },
    tags: ["killer", "slim-fit", "attitude-denim", "washed-blue"],
    keywords: ["killer jeans", "killer slim fit jeans", "mens branded denim"],
    highlights: ["Signature K-Embossed Rivets", "Whiskered Hand-Scraped Fading", "Shape-Memory Stretch Denim"],
    isFeatured: true,
  },

  // 16. Killer Straight Fit Dark Indigo
  {
    name: "Killer Men Straight Fit Mid Rise Dark Indigo Jeans",
    brand: "Killer",
    sku: "AGF-KLR-STR-IND",
    shortDescription: "Deep indigo straight denim with a powerful presence and clean raw look.",
    description: `### Killer Raw Dark Indigo Straight Jeans
Designed for strength and longevity. Dark indigo denim that wears in beautifully over time, moulding to the wearer's daily lifestyle.

- **Fit:** Classic Straight Fit.
- **Fabric:** Premium Cotton Denim.
- **Tone:** Midnight Indigo.`,
    pricing: {
      basePrice: 3599,
      salePrice: 1439,
      costPrice: 950,
      discountPercentage: 60,
    },
    inventory: {
      stock: 45,
      lowStockThreshold: 8,
      reorderPoint: 12,
      trackInventory: true,
      soldCount: 30,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/jean/i/q/q/32-kjo-3168-st-stft-dkindg-killer-original-imahzx76yeetftgj.jpeg?q=70",
        alt: "Killer Men Straight Fit Mid Rise Dark Blue Jeans",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Straight Fit" },
      { key: "Rise", value: "Mid Rise" },
      { key: "Fabric", value: "Cotton Blend" },
      { key: "Finish", value: "Raw Dark Wash" },
    ],
    ratings: { average: 4.5, count: 124 },
    tags: ["killer", "straight-fit", "dark-indigo", "raw-denim"],
    keywords: ["killer straight jeans", "dark indigo jeans men", "mens tough denim"],
    highlights: ["Heavy-Duty Denim Weave", "Contrast Amber Seams", "Original Killer Brand Patch"],
    isFeatured: false,
  },

  // 17. Highlander Tapered Fit Washed Black
  {
    name: "Highlander Men Tapered Fit Mid Rise Washed Black Jeans",
    brand: "Highlander",
    sku: "AGF-HL-TAP-BLK",
    shortDescription: "Budget-friendly, highly popular street denim in vintage faded black wash.",
    description: `### Highlander Tapered Black Denim
High on style and easy on the pocket. Highlander delivers trendy tapered street denim with comfortable stretch and distressed edge.

- **Fit:** Tapered Fit.
- **Color:** Faded Washed Black.
- **Fabric:** Cotton Lycra Blend.`,
    pricing: {
      basePrice: 1299,
      salePrice: 519,
      costPrice: 340,
      discountPercentage: 60,
    },
    inventory: {
      stock: 80,
      lowStockThreshold: 15,
      reorderPoint: 20,
      trackInventory: true,
      soldCount: 95,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/jean/c/l/1/-original-imahanzz7wg47f6w.jpeg?q=70",
        alt: "Highlander Men Tapered Fit Mid Rise Black Jeans",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Tapered Fit" },
      { key: "Rise", value: "Mid Rise" },
      { key: "Fabric", value: "Cotton Lycra Blend" },
      { key: "Stretch", value: "Comfort Stretch" },
    ],
    ratings: { average: 4.3, count: 320 },
    tags: ["highlander", "budget-denim", "tapered-black", "flipkart-bestseller"],
    keywords: ["highlander jeans", "budget jeans men", "black tapered jeans"],
    highlights: ["Super Affordable Price", "Active Lycra Stretch", "Easy Everyday Machine Wash"],
    isFeatured: true,
  },

  // 18. Highlander Straight Fit Light Blue
  {
    name: "Highlander Men Straight Fit Mid Rise Light Blue Jeans",
    brand: "Highlander",
    sku: "AGF-HL-STR-LBLU",
    shortDescription: "Light blue washed straight jeans offering breezy style and reliable comfort.",
    description: `### Highlander Light Blue Denim
Clean and casual. The light blue wash gives an effortless weekend vibe, paired best with white sneakers and basic tees.

- **Fit:** Straight Fit.
- **Color:** Clean Light Sky Blue.
- **Fabric:** Cotton Stretch Blend.`,
    pricing: {
      basePrice: 2599,
      salePrice: 831,
      costPrice: 520,
      discountPercentage: 68,
    },
    inventory: {
      stock: 50,
      lowStockThreshold: 10,
      reorderPoint: 15,
      trackInventory: true,
      soldCount: 42,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/jean/e/z/r/38-phjn000193-highlander-original-imah3yucdv6ehqhj.jpeg?q=70",
        alt: "Highlander Men Straight Fit Mid Rise Light Blue Jeans",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Straight Fit" },
      { key: "Rise", value: "Mid Rise" },
      { key: "Fabric", value: "Cotton Poly Stretch" },
    ],
    ratings: { average: 4.2, count: 150 },
    tags: ["highlander", "straight-fit", "light-blue", "casual-wear"],
    keywords: ["light blue jeans", "highlander straight fit", "mens summer jeans"],
    highlights: ["Fresh Light Blue Tone", "Flexible Everyday Fabric", "68% Off Value Deal"],
    isFeatured: false,
  },

  // 19. Red Chief Regular Fit Vintage Light Blue
  {
    name: "Red Chief Men Regular Fit Mid Rise Light Blue Jeans",
    brand: "Red Chief",
    sku: "AGF-RC-REG-LBLU",
    shortDescription: "Tough and durable regular denim from premier leather & apparel maker Red Chief.",
    description: `### Red Chief Rugged Regular Denim
Engineered with heavy-duty construction that Red Chief is famous for. Reinforced rivets, thick gauge denim yarn, and a comfortable regular rise.

- **Fit:** Regular Mid Rise.
- **Fabric:** 100% Ring Cotton.
- **Wash:** Vintage enzyme light blue.`,
    pricing: {
      basePrice: 2599,
      salePrice: 1299,
      costPrice: 820,
      discountPercentage: 50,
    },
    inventory: {
      stock: 45,
      lowStockThreshold: 8,
      reorderPoint: 12,
      trackInventory: true,
      soldCount: 38,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/jean/o/y/6/30-o-8560161-081-red-chief-original-imahehg5ctxxt8zf.jpeg?q=70",
        alt: "Red Chief Men Regular Fit Mid Rise Light Blue Jeans",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Regular Fit" },
      { key: "Rise", value: "Mid Rise" },
      { key: "Fabric", value: "100% Cotton" },
      { key: "Weight", value: "520g Heavy Denim" },
    ],
    ratings: { average: 4.6, count: 180 },
    tags: ["red-chief", "regular-fit", "rugged-denim", "heavy-duty"],
    keywords: ["red chief jeans", "red chief denim", "heavy duty jeans"],
    highlights: ["Rugged Workwear Durability", "Genuine Red Chief Leather Brand Patch", "Reinforced Bartack Stitching"],
    isFeatured: false,
  },

  // 20. Yagan Gen-Z Baggy Washed Black
  {
    name: "Yagan Men Baggy Fit Mid Rise Washed Black Skater Jeans",
    brand: "Yagan",
    sku: "AGF-YAG-BGY-BLK",
    shortDescription: "Ultra-wide Gen-Z skater baggy jeans with whiskered distressed wash.",
    description: `### Yagan Gen-Z Baggy Skater Denim
The ultimate streetwear silhouette for the modern generation. Extra volume through the legs, relaxed thigh room, and an effortless drape over sneakers.

- **Fit:** Baggy Skater Fit.
- **Color:** Washed Charcoal Black with 3D Whiskers.
- **Fabric:** 100% Heavy Twill Cotton.
- **Style:** 90s Grunge, Hip-Hop & Skater culture.`,
    pricing: {
      basePrice: 1999,
      salePrice: 689,
      costPrice: 440,
      discountPercentage: 65,
    },
    inventory: {
      stock: 75,
      lowStockThreshold: 15,
      reorderPoint: 20,
      trackInventory: true,
      soldCount: 82,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/jean/z/t/b/36-mens-black-mid-rise-wishker-baggy-jeans-9x-denims-original-imahp5a8pg3ydnyy.jpeg?q=70",
        alt: "Yagan Men Baggy Fit Mid Rise Washed Black Skater Jeans",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Baggy Fit" },
      { key: "Rise", value: "Mid Rise" },
      { key: "Style", value: "Skater / Streetwear" },
      { key: "Fabric", value: "100% Cotton Heavyweight" },
      { key: "Leg Opening", value: "22 Inch Wide Leg" },
    ],
    ratings: { average: 4.7, count: 240 },
    tags: ["yagan", "baggy-jeans", "skater-denim", "gen-z", "alpha-genz"],
    keywords: ["baggy jeans men", "skater jeans", "gen z denim", "washed black baggy"],
    highlights: ["Authentic Oversized Baggy Fit", "3D Whiskered Knee Fades", "Heavyweight 100% Cotton Denim"],
    isFeatured: true,
  },
];

async function seedAlphaGenz() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected successfully to MongoDB!\n');

    const User = mongoose.models.User || mongoose.model('User', userSchema);
    const Seller = mongoose.models.Seller || mongoose.model('Seller', sellerSchema);
    const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
    const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({}, { strict: false }));

    // ==========================================
    // 1. Setup Seller User
    // ==========================================
    const sellerEmail = 'alphagenzfashions@onlineplanet.in';
    const plainPassword = 'AlphaGENZ@2026';
    let user = await User.findOne({ email: sellerEmail });

    if (!user) {
      console.log(`👤 Creating User account for ${sellerEmail}...`);
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      user = await User.create({
        name: 'Alpha GENZ Fashions',
        email: sellerEmail,
        password: hashedPassword,
        phone: '+91-9876543220',
        role: 'seller',
        isVerified: true,
      });
      console.log('✅ Created Seller User:', user._id);
    } else {
      console.log('ℹ️  Found existing User:', user.email, '(', user._id, ')');
      if (user.role !== 'seller') {
        user.role = 'seller';
        user.isVerified = true;
        await user.save();
      }
    }

    // ==========================================
    // 2. Setup Seller Profile
    // ==========================================
    let seller = await Seller.findOne({ userId: user._id });

    if (!seller) {
      console.log('🏪 Creating Seller profile: Alpha GENZ Fashions...');
      seller = await Seller.create({
        userId: user._id,
        personalDetails: {
          fullName: 'Alpha GENZ Fashions Store Owner',
          email: sellerEmail,
          phone: '+91-9876543220',
          residentialAddress: {
            addressLine1: 'B-204, Fashion Galleria, Linking Road',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400052',
            country: 'IN',
          },
        },
        businessInfo: {
          businessName: 'Alpha GENZ Fashions Pvt. Ltd.',
          gstin: '07AABCA1234F1Z5',
          pan: 'AABCA1234F',
          businessType: 'pvt_ltd',
          businessCategory: 'fashion',
          establishedYear: 2023,
          country: 'IN',
        },
        pickupAddress: {
          addressLine1: 'Unit 402, Denim Park, Andheri East',
          addressLine2: 'Near Metro Station',
          landmark: 'Opposite Logistics Hub',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400069',
          country: 'IN',
          isDefault: true,
        },
        storeInfo: {
          storeName: 'Alpha GENZ Fashions',
          storeSlug: 'alpha-genz-fashions',
          storeDescription:
            'Alpha GENZ Fashions is your premier destination for the latest denim trends, youth-centric streetwear, and iconic denim brands including Levi\'s, Spykar, Flying Machine, Jack & Jones, and Killer. Designed for comfort, durability, and bold style.',
          storeCategories: ['Fashion', "Men's Clothing", 'Jeans', 'Streetwear'],
          storeLogo:
            'https://rukminim2.flixcart.com/image/832/832/xif0q/jean/h/c/b/-original-imah3fqksvgdd6kc.jpeg?q=70',
          storeBanner:
            'https://images.unsplash.com/photo-1542272604-780c96856592?w=1200',
          customerSupportEmail: sellerEmail,
          customerSupportPhone: '+91-9876543220',
          returnPolicy: '7 Days hassle-free return and exchange on all denim products.',
          shippingPolicy: 'Free express shipping across India within 2-4 business days.',
          termsAndConditions: '100% genuine branded apparel with verified authenticity guarantee.',
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
          average: 4.8,
          totalReviews: 156,
        },
        isActive: true,
        isVerified: true,
      });
      console.log('✅ Created Seller profile:', seller._id);
    } else {
      console.log('ℹ️  Updating existing Seller profile:', seller._id);
      seller.verificationStatus = 'approved';
      seller.isActive = true;
      seller.isVerified = true;
      seller.verificationSteps = {
        emailVerified: true,
        phoneVerified: true,
        documentsVerified: true,
        bankVerified: true,
        addressVerified: true,
      };
      await seller.save();
    }

    // ==========================================
    // 3. Category Lookup / Verification
    // ==========================================
    const jeansCat = await Category.findOne({ slug: 'men-jeans' });
    const categoryName = jeansCat?.name || 'Jeans';
    const categoryPath = jeansCat?.path || 'fashion/mens-clothing/men-jeans';
    const subCategory = "Men's Clothing";

    console.log(`📂 Category mapped: ${categoryName} (${categoryPath})\n`);

    // ==========================================
    // 4. Upsert 20 Men's Jeans Products
    // ==========================================
    console.log(`📦 Upserting ${jeansProducts.length} Men's Jeans Products...\n`);

    let inserted = 0;
    let updated = 0;

    for (const item of jeansProducts) {
      const variants = generateJeansVariants(item.sku, item.pricing.salePrice);
      const options = [
        {
          name: 'Size',
          values: ['28', '30', '32', '34', '36'],
        },
      ];

      const productPayload = {
        ...item,
        sellerId: seller._id,
        category: categoryName,
        categoryPath: categoryPath,
        subCategory: subCategory,
        options: options,
        variants: variants,
        isActive: true,
        isApproved: true,
        isDraft: false,
      };

      const existing = await Product.findOne({ sku: item.sku });
      if (existing) {
        await Product.updateOne({ sku: item.sku }, { $set: productPayload });
        console.log(`🔄 [UPDATED] ${item.brand.padEnd(15)} | ${item.name} (SKU: ${item.sku})`);
        updated++;
      } else {
        await Product.create(productPayload);
        console.log(`✨ [INSERTED] ${item.brand.padEnd(15)} | ${item.name} (SKU: ${item.sku})`);
        inserted++;
      }
    }

    console.log('\n======================================================');
    console.log('🎉 ALPHA GENZ FASHIONS JEANS SEEDING COMPLETED!');
    console.log('======================================================');
    console.log(`🏢 Seller: ${seller.storeInfo.storeName} (${sellerEmail})`);
    console.log(`🔑 Login Password: ${plainPassword}`);
    console.log(`🆔 Seller ID: ${seller._id}`);
    console.log(`🆔 User ID: ${user._id}`);
    console.log(`👖 Total Products: ${jeansProducts.length} (Inserted: ${inserted}, Updated: ${updated})`);

    const brandCounts = {};
    jeansProducts.forEach((p) => {
      brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
    });
    console.log('📊 Brand Breakdown:', brandCounts);

    await mongoose.connection.close();
    console.log('🔌 Database connection closed\n');
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedAlphaGenz();
