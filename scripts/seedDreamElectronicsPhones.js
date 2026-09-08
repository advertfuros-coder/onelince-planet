// scripts/seedDreamElectronicsPhones.js
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

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
      stock: { type: Number, required: true, default: 10 },
      lowStockThreshold: { type: Number, default: 2 },
      reorderPoint: { type: Number, default: 5 },
      trackInventory: { type: Boolean, default: true },
      soldCount: { type: Number, default: 0 },
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
      average: { type: Number, default: 4.6 },
      count: { type: Number, default: 120 },
    },
    tags: [String],
    keywords: [String],
    highlights: [String],
    hsnCode: { type: String, default: '85171300' },
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: true },
    isDraft: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    importedFrom: { type: String, default: 'manual' },
  },
  { timestamps: true }
);

const phoneProducts = [
  // 1. Apple iPhone 16
  {
    name: 'Apple iPhone 16 (128 GB) - Black',
    shortDescription: 'Apple iPhone 16 with A18 Bionic Chip, Camera Control, 48MP Fusion Camera, and Super Retina XDR OLED',
    description: `Meet iPhone 16. Built for Apple Intelligence and equipped with the ultra-fast A18 chip, iPhone 16 leaps two generations ahead. Featuring the groundbreaking Camera Control button, you can instantly adjust exposure, depth of field, and zoom with haptic precision.

The 48MP Fusion camera works as two cameras in one, capturing super-high-resolution images with rich optical-quality 2x Telephoto zoom. Enhanced Photographic Styles allow you to customize skin tones and color moods in real time.

Built with aerospace-grade aluminum and color-infused back glass, iPhone 16 features the latest-generation Ceramic Shield that is 2x tougher than any smartphone glass. With up to 22 hours of video playback and USB-C connectivity, it delivers top-tier performance all day long.`,
    brand: 'Apple',
    sku: 'DE-APL-IP16-128',
    pricing: {
      basePrice: 79900,
      salePrice: 74900,
      costPrice: 66000,
      discountPercentage: 6.26,
    },
    inventory: { stock: 10, lowStockThreshold: 2, reorderPoint: 5, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://m.media-amazon.com/images/I/71w3oJ7aWyL._SL1500_.jpg', alt: 'iPhone 16 Black Front', isPrimary: true },
      { url: 'https://m.media-amazon.com/images/I/71D62WzIqBL._SL1500_.jpg', alt: 'iPhone 16 Back and Camera', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/61H4hT3F5vL._SL1500_.jpg', alt: 'iPhone 16 Camera Control Button', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/81U2fU1hGHL._SL1500_.jpg', alt: 'iPhone 16 Angles and Display', isPrimary: false },
    ],
    specifications: [
      { key: 'Display', value: '6.1-inch Super Retina XDR OLED (2556 x 1179)' },
      { key: 'Processor', value: 'Apple A18 Chip with 6-core CPU & 5-core GPU' },
      { key: 'Rear Camera', value: '48MP Fusion + 12MP Ultra Wide with Macro' },
      { key: 'Front Camera', value: '12MP TrueDepth with Autofocus' },
      { key: 'Storage', value: '128 GB' },
      { key: 'Operating System', value: 'iOS 18' },
      { key: 'Connector', value: 'USB-C (supports USB 2 and DisplayPort)' },
      { key: 'Battery Life', value: 'Up to 22 hours video playback' },
      { key: 'Water Resistance', value: 'IP68 (6 meters up to 30 mins)' },
      { key: 'Warranty', value: '1 Year Apple Brand Warranty' },
    ],
    highlights: [
      'Powered by the ultra-fast A18 chip with 16-core Neural Engine',
      'Tactile Camera Control button for instant framing and adjustment',
      '48MP Fusion camera with 2x optical-quality Telephoto zoom',
      'Action Button for quick access to flashlight, shortcuts, and silent mode',
      'Aerospace-grade aluminum body with latest Ceramic Shield glass',
    ],
    tags: ['apple', 'iphone', 'iphone 16', 'smartphone', '5g phone', 'ios'],
    keywords: ['apple iphone 16', 'iphone 16 128gb', 'ios 18', 'camera control', 'dream electronics'],
    shipping: { weight: 0.17, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 2. Apple iPhone 15
  {
    name: 'Apple iPhone 15 (128 GB) - Black',
    shortDescription: 'Apple iPhone 15 with Dynamic Island, 48MP Main Camera, A16 Bionic, and USB-C',
    description: `iPhone 15 brings you Dynamic Island, bubbling up alerts and Live Activities so you never miss a beat. With durable color-infused glass and an aerospace-grade aluminum design, it is comfortable to hold and built to last.

The 48MP Main camera captures breathtaking photos with stunning detail and vibrant colors. Shoot next-generation portraits with dramatic focus shifting even after the shot is taken.

Powered by the superfast A16 Bionic chip, you get all-day battery life and seamless gaming performance. Charge effortlessly with the universal USB-C connector.`,
    brand: 'Apple',
    sku: 'DE-APL-IP15-128',
    pricing: {
      basePrice: 69900,
      salePrice: 58999,
      costPrice: 51000,
      discountPercentage: 15.6,
    },
    inventory: { stock: 10, lowStockThreshold: 2, reorderPoint: 5, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://m.media-amazon.com/images/I/71657TiFeHL._SL1500_.jpg', alt: 'iPhone 15 Black Front', isPrimary: true },
      { url: 'https://m.media-amazon.com/images/I/712CBkmhLhL._SL1500_.jpg', alt: 'iPhone 15 Back View', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/61L1If8A18L._SL1500_.jpg', alt: 'iPhone 15 Dynamic Island', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/818fO9o66vL._SL1500_.jpg', alt: 'iPhone 15 USB-C Port', isPrimary: false },
    ],
    specifications: [
      { key: 'Display', value: '6.1-inch Super Retina XDR OLED with Dynamic Island' },
      { key: 'Processor', value: 'Apple A16 Bionic Chip' },
      { key: 'Rear Camera', value: '48MP Main + 12MP Ultra Wide' },
      { key: 'Front Camera', value: '12MP TrueDepth Camera' },
      { key: 'Storage', value: '128 GB' },
      { key: 'Operating System', value: 'iOS 17 (Upgradable to iOS 18)' },
      { key: 'Connector', value: 'USB-C' },
      { key: 'Battery Life', value: 'Up to 20 hours video playback' },
      { key: 'Warranty', value: '1 Year Apple Brand Warranty' },
    ],
    highlights: [
      'Interactive Dynamic Island for alerts and live background activities',
      '48MP Main camera with 2x Telephoto for high-res portraits',
      'Durable color-infused glass with textured matte finish',
      'Super-efficient A16 Bionic processor for high-speed multitasking',
      'Universal USB-C charging connector for all your Apple devices',
    ],
    tags: ['apple', 'iphone 15', 'dynamic island', '5g phone', 'ios'],
    keywords: ['apple iphone 15', 'iphone 15 128gb', 'dynamic island', 'usb-c iphone', 'dream electronics'],
    shipping: { weight: 0.171, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 3. Apple iPhone 13
  {
    name: 'Apple iPhone 13 (128 GB) - Midnight',
    shortDescription: 'Apple iPhone 13 with Super Retina XDR, A15 Bionic, Cinematic Mode, and Durable Ceramic Shield',
    description: `iPhone 13 is engineered with Apple's powerful A15 Bionic chip and an advanced dual-camera system featuring Cinematic Mode that automatically shifts focus between subjects for movie-like storytelling.

Its 6.1-inch Super Retina XDR display is ultra-bright and sharp, visible even under direct sunlight. Protected by the durable Ceramic Shield front and IP68 water resistance, it offers enduring quality and reliable all-day battery performance.`,
    brand: 'Apple',
    sku: 'DE-APL-IP13-128',
    pricing: {
      basePrice: 59900,
      salePrice: 45999,
      costPrice: 39000,
      discountPercentage: 23.2,
    },
    inventory: { stock: 10, lowStockThreshold: 2, reorderPoint: 5, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://m.media-amazon.com/images/I/61VuVU94RnL._SL1500_.jpg', alt: 'iPhone 13 Midnight Front', isPrimary: true },
      { url: 'https://m.media-amazon.com/images/I/71fVoqRC0wL._SL1500_.jpg', alt: 'iPhone 13 Diagonal Camera', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/617ffROc-EL._SL1500_.jpg', alt: 'iPhone 13 Edge View', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/81dG74vP0vL._SL1500_.jpg', alt: 'iPhone 13 Display and Box', isPrimary: false },
    ],
    specifications: [
      { key: 'Display', value: '6.1-inch Super Retina XDR OLED' },
      { key: 'Processor', value: 'Apple A15 Bionic Chip' },
      { key: 'Rear Camera', value: '12MP Wide + 12MP Ultra Wide with Sensor-shift OIS' },
      { key: 'Front Camera', value: '12MP TrueDepth Front Camera' },
      { key: 'Storage', value: '128 GB' },
      { key: 'Operating System', value: 'iOS' },
      { key: 'Battery', value: 'Up to 19 hours video playback' },
      { key: 'Warranty', value: '1 Year Apple Warranty' },
    ],
    highlights: [
      '6.1-inch Super Retina XDR OLED with Ceramic Shield durability',
      'Cinematic Mode with shallow depth of field in 1080p at 30 fps',
      'Advanced dual-camera system with Sensor-shift Optical Image Stabilization',
      'Lightning-fast A15 Bionic processor for incredible gaming and speed',
      'IP68 industry-leading water and dust resistance',
    ],
    tags: ['apple', 'iphone 13', 'midnight', '5g phone', 'ios'],
    keywords: ['apple iphone 13', 'iphone 13 midnight', 'cinematic mode', 'dream electronics'],
    shipping: { weight: 0.174, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 4. Samsung Galaxy S24 Ultra 5G
  {
    name: 'Samsung Galaxy S24 Ultra 5G (Titanium Gray, 12GB RAM, 256GB Storage)',
    shortDescription: 'Samsung Galaxy S24 Ultra with Galaxy AI, 200MP Camera, S-Pen, Snapdragon 8 Gen 3, and Titanium Frame',
    description: `Welcome to the era of mobile AI with the Samsung Galaxy S24 Ultra. Powered by the customized Snapdragon 8 Gen 3 for Galaxy, unleash new levels of creativity and productivity with Circle to Search with Google, Live Translate, and Note Assist.

Encased in a premium Titanium frame with Corning Gorilla Armor glass that reduces screen reflections by up to 75%. Capture jaw-dropping detail with the 200MP main sensor and 50MP 5x optical periscope lens for 100x Space Zoom. Built-in S-Pen included for precision note-taking and sketching.`,
    brand: 'Samsung',
    sku: 'DE-SAM-S24U-256',
    pricing: {
      basePrice: 134999,
      salePrice: 99999,
      costPrice: 87000,
      discountPercentage: 25.93,
    },
    inventory: { stock: 10, lowStockThreshold: 2, reorderPoint: 5, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://m.media-amazon.com/images/I/71CXhVHpM0L._SL1500_.jpg', alt: 'Samsung S24 Ultra Titanium Front', isPrimary: true },
      { url: 'https://m.media-amazon.com/images/I/71RVuWl+PHL._SL1500_.jpg', alt: 'Samsung S24 Ultra Quad Camera', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/71LcaZ+D8WL._SL1500_.jpg', alt: 'Samsung S24 Ultra S-Pen', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/71wK7q05oVL._SL1500_.jpg', alt: 'Samsung S24 Ultra Titanium Frame', isPrimary: false },
    ],
    specifications: [
      { key: 'Display', value: '6.8-inch Dynamic AMOLED 2X, QHD+, 1-120Hz, 2600 nits' },
      { key: 'Processor', value: 'Qualcomm Snapdragon 8 Gen 3 for Galaxy' },
      { key: 'RAM / Storage', value: '12 GB RAM / 256 GB UFS 4.0' },
      { key: 'Rear Camera', value: '200MP Main + 50MP Periscope (5x) + 12MP Ultra-Wide + 10MP Telephoto (3x)' },
      { key: 'Front Camera', value: '12MP Dual Pixel AF' },
      { key: 'Battery & Charging', value: '5000 mAh with 45W wired and 15W wireless charging' },
      { key: 'Operating System', value: 'One UI 6.1 (Android 14) with 7 Years OS Updates' },
      { key: 'Build Material', value: 'Titanium Frame with Corning Gorilla Armor' },
      { key: 'Warranty', value: '1 Year Manufacturer Warranty' },
    ],
    highlights: [
      'Galaxy AI: Circle to Search, Live Translate, and Photo Assist',
      'Ultra-tough Titanium shield with reduced glare Corning Gorilla Armor',
      'ProVisual Engine with 200MP main camera and 100x Space Zoom',
      'Built-in embedded S-Pen for seamless writing, navigating, and drawing',
      'Massive vapor chamber cooling for sustained ray-tracing gaming',
    ],
    tags: ['samsung', 'galaxy s24 ultra', 's24 ultra', 'flagship phone', 'galaxy ai', '5g phone'],
    keywords: ['samsung galaxy s24 ultra', 's24 ultra 256gb', 'galaxy ai', 'spen phone', 'dream electronics'],
    shipping: { weight: 0.232, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 5. Samsung Galaxy S23 FE 5G
  {
    name: 'Samsung Galaxy S23 FE 5G (Mint, 8GB RAM, 128GB Storage)',
    shortDescription: 'Samsung Galaxy S23 FE with 50MP Pro-grade Camera, Dynamic AMOLED 2X 120Hz, and IP68 Water Resistance',
    description: `Experience the flagship Galaxy S series spirit with the Galaxy S23 FE. Featuring an iconic floating camera design, metal frame, and vibrant glass back in stunning Mint.

Its 50MP high-resolution camera captures crisp nighttime portraits with enhanced Nightography. The 6.4-inch Dynamic AMOLED 2X display with Vision Booster adapts brightness dynamically to outdoor sunlight.`,
    brand: 'Samsung',
    sku: 'DE-SAM-S23FE-128',
    pricing: {
      basePrice: 79999,
      salePrice: 39999,
      costPrice: 32000,
      discountPercentage: 50.0,
    },
    inventory: { stock: 10, lowStockThreshold: 2, reorderPoint: 5, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://m.media-amazon.com/images/I/71b8P0Vz3rL._SL1500_.jpg', alt: 'Samsung S23 FE Mint Front', isPrimary: true },
      { url: 'https://m.media-amazon.com/images/I/61C2H3rB7CL._SL1500_.jpg', alt: 'Samsung S23 FE Back Triple Camera', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/61Q60v9+pUL._SL1500_.jpg', alt: 'Samsung S23 FE Floating Camera Design', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/71z78g2Q0OL._SL1500_.jpg', alt: 'Samsung S23 FE Metal Edges', isPrimary: false },
    ],
    specifications: [
      { key: 'Display', value: '6.4-inch FHD+ Dynamic AMOLED 2X (120Hz)' },
      { key: 'Processor', value: 'Samsung Exynos 2200 4nm Octa-Core' },
      { key: 'RAM / Storage', value: '8 GB RAM / 128 GB Storage' },
      { key: 'Rear Camera', value: '50MP OIS + 12MP Ultra Wide + 8MP 3x Telephoto' },
      { key: 'Battery', value: '4500 mAh with 25W Fast Charging' },
      { key: 'Water Resistance', value: 'IP68 Certified' },
      { key: 'Warranty', value: '1 Year Brand Warranty' },
    ],
    highlights: [
      '50MP Pro-grade sensor with Nightography for low-light clarity',
      'Smooth 120Hz Dynamic AMOLED 2X display with Vision Booster',
      'Corning Gorilla Glass 5 front and back with aluminum frame',
      'IP68 dust and water resistance for peace of mind',
      '4 major OS upgrades and 5 years of security updates guaranteed',
    ],
    tags: ['samsung', 'galaxy s23 fe', 's23 fe', '5g phone', 'samsung amoled'],
    keywords: ['samsung galaxy s23 fe', 's23 fe mint', 'samsung flagship killer', 'dream electronics'],
    shipping: { weight: 0.209, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 6. Samsung Galaxy M35 5G
  {
    name: 'Samsung Galaxy M35 5G (Daybreak Blue, 6GB RAM, 128GB Storage)',
    shortDescription: 'Samsung Galaxy M35 5G with 6000mAh Battery, 120Hz sAMOLED, 50MP OIS Camera, and Vapor Chamber Cooling',
    description: `Conquer your day with the Samsung Galaxy M35 5G. Packing a monstrous 6000mAh battery that lasts up to 2 days, you stay powered through non-stop gaming, video streaming, and work.

Equipped with a 6.6-inch 120Hz Super AMOLED screen, colors pop with incredible vibrancy. The advanced Exynos 1380 processor paired with Vapor Cooling Chamber keeps thermal throttles away during long usage sessions.`,
    brand: 'Samsung',
    sku: 'DE-SAM-M35-128',
    pricing: {
      basePrice: 24499,
      salePrice: 16999,
      costPrice: 13800,
      discountPercentage: 30.61,
    },
    inventory: { stock: 10, lowStockThreshold: 2, reorderPoint: 5, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://m.media-amazon.com/images/I/81t6E09p2yL._SL1500_.jpg', alt: 'Samsung M35 Blue Front View', isPrimary: true },
      { url: 'https://m.media-amazon.com/images/I/71n0uO+zJgL._SL1500_.jpg', alt: 'Samsung M35 Rear 50MP Camera', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/71oX6m7p2sL._SL1500_.jpg', alt: 'Samsung M35 6000mAh Battery Highlights', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/71hO5D68PPL._SL1500_.jpg', alt: 'Samsung M35 Side Profile and Buttons', isPrimary: false },
    ],
    specifications: [
      { key: 'Display', value: '6.6-inch FHD+ Super AMOLED (120Hz, 1000 nits)' },
      { key: 'Processor', value: 'Samsung Exynos 1380 5nm Processor' },
      { key: 'RAM / Storage', value: '6 GB RAM / 128 GB Storage (Expandable up to 1TB)' },
      { key: 'Rear Camera', value: '50MP OIS Main + 8MP Ultra-Wide + 2MP Macro' },
      { key: 'Battery', value: '6000 mAh Monster Battery with 25W Charging' },
      { key: 'Cooling', value: 'Vapor Chamber Cooling System' },
      { key: 'Security', value: 'Samsung Knox Vault + Side Fingerprint Sensor' },
      { key: 'Warranty', value: '1 Year Brand Warranty' },
    ],
    highlights: [
      'Huge 6000mAh battery for up to 2 days of uninterrupted use',
      'Fluid 120Hz Super AMOLED display with 1000 nits High Brightness Mode',
      '50MP No Shake Camera with Optical Image Stabilization (OIS)',
      'Built-in Vapor Cooling Chamber for lag-free gaming',
      'Knox Vault hardware-level data security with 4 OS upgrades',
    ],
    tags: ['samsung', 'galaxy m35', '6000mah phone', 'samoled 120hz', '5g phone'],
    keywords: ['samsung galaxy m35 5g', 'galaxy m35 daybreak blue', '6000mah battery phone', 'dream electronics'],
    shipping: { weight: 0.222, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 7. OnePlus 12 5G
  {
    name: 'OnePlus 12 5G (Silky Black, 12GB RAM, 256GB Storage)',
    shortDescription: 'OnePlus 12 with Snapdragon 8 Gen 3, 4th Gen Hasselblad Camera, 2K 120Hz ProXDR, and 100W SUPERVOOC',
    description: `The OnePlus 12 redefines smooth. Delivering industry-leading flagship performance powered by the Snapdragon 8 Gen 3 processor, Dual Cryo-velocity VC cooling, and 12GB LPDDR5X RAM.

Featuring the 4th Gen Hasselblad Camera System with the all-new Sony LYT-808 50MP sensor and a 64MP 3x periscope telephoto lens. The 2K 120Hz ProXDR display with Aqua Touch keeps scrolling responsive even with wet hands. Packed with a 5400mAh battery and blazing 100W wired and 50W wireless AIRVOOC charging.`,
    brand: 'OnePlus',
    sku: 'DE-1PL-12-256',
    pricing: {
      basePrice: 69999,
      salePrice: 59999,
      costPrice: 51000,
      discountPercentage: 14.28,
    },
    inventory: { stock: 10, lowStockThreshold: 2, reorderPoint: 5, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://m.media-amazon.com/images/I/717Qo4MH97L._SL1500_.jpg', alt: 'OnePlus 12 Silky Black Front View', isPrimary: true },
      { url: 'https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg', alt: 'OnePlus 12 Hasselblad Camera Matrix', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/613Yl3aYtIL._SL1500_.jpg', alt: 'OnePlus 12 Display and Aqua Touch', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/71rQ7FjP2yL._SL1500_.jpg', alt: 'OnePlus 12 Side Profile and Alert Slider', isPrimary: false },
    ],
    specifications: [
      { key: 'Display', value: '6.82-inch 2K 120Hz ProXDR Display with LTPO 4.0 (4500 nits peak)' },
      { key: 'Processor', value: 'Qualcomm Snapdragon 8 Gen 3 (4nm)' },
      { key: 'RAM / Storage', value: '12 GB LPDDR5X / 256 GB UFS 4.0' },
      { key: 'Rear Camera', value: '50MP Sony LYT-808 + 64MP 3x Periscope Telephoto + 48MP Ultra-Wide' },
      { key: 'Front Camera', value: '32MP Sony IMX615' },
      { key: 'Battery & Charging', value: '5400 mAh Battery with 100W SUPERVOOC + 50W AIRVOOC' },
      { key: 'Operating System', value: 'OxygenOS 14 based on Android 14' },
      { key: 'Warranty', value: '1 Year Brand Warranty' },
    ],
    highlights: [
      'Flagship Snapdragon 8 Gen 3 with 12GB LPDDR5X high-speed RAM',
      '4th Gen Hasselblad Camera System with 64MP 3x Periscope Lens',
      'Groundbreaking 2K ProXDR Display with 4500 nits peak brightness and Aqua Touch',
      'Massive 5400mAh Battery with 100W wired and 50W wireless charging',
      'Signature Alert Slider with 3-position toggle for silent, vibrate, and ring',
    ],
    tags: ['oneplus', 'oneplus 12', 'hasselblad', 'flagship phone', '5g phone', 'snapdragon 8 gen 3'],
    keywords: ['oneplus 12 5g', 'oneplus 12 silky black', 'hasselblad phone', '100w fast charging', 'dream electronics'],
    shipping: { weight: 0.22, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 8. OnePlus 12R 5G
  {
    name: 'OnePlus 12R 5G (Cool Blue, 8GB RAM, 128GB Storage)',
    shortDescription: 'OnePlus 12R with Snapdragon 8 Gen 2, 1.5K 120Hz ProXDR LTPO 4.0 Display, 5500mAh Battery, and 100W Charging',
    description: `Powered by the Qualcomm Snapdragon 8 Gen 2 platform, OnePlus 12R delivers unprecedented flagship-grade performance and energy efficiency. Its 4th-generation LTPO 120Hz ProXDR display dynamically scales refresh rates between 1Hz to 120Hz for ultra-smooth scrolling and battery conservation.

Equipped with the largest battery ever on a OnePlus device at 5500mAh, accompanied by 100W SUPERVOOC fast charging that juices the device from 1% to 100% in just 26 minutes. 50MP Sony IMX890 camera with OIS ensures sharp and vibrant photography.`,
    brand: 'OnePlus',
    sku: 'DE-1PL-12R-128',
    pricing: {
      basePrice: 42999,
      salePrice: 37999,
      costPrice: 32000,
      discountPercentage: 11.62,
    },
    inventory: { stock: 10, lowStockThreshold: 2, reorderPoint: 5, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://m.media-amazon.com/images/I/717Qo4MH97L._SL1500_.jpg', alt: 'OnePlus 12R Cool Blue Front', isPrimary: true },
      { url: 'https://m.media-amazon.com/images/I/714qc+UomVL._SL1500_.jpg', alt: 'OnePlus 12R Rear Camera Circle', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg', alt: 'OnePlus 12R Blue Back Glass', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/71j2a7z1sUL._SL1500_.jpg', alt: 'OnePlus 12R Dual Cryo Cooling', isPrimary: false },
    ],
    specifications: [
      { key: 'Display', value: '6.78-inch 1.5K 120Hz ProXDR LTPO 4.0 AMOLED' },
      { key: 'Processor', value: 'Qualcomm Snapdragon 8 Gen 2' },
      { key: 'RAM / Storage', value: '8 GB LPDDR5X / 128 GB UFS 3.1' },
      { key: 'Rear Camera', value: '50MP Sony IMX890 with OIS + 8MP Ultra-Wide + 2MP Macro' },
      { key: 'Battery', value: '5500 mAh with 100W SUPERVOOC Charging' },
      { key: 'Operating System', value: 'OxygenOS 14 based on Android 14' },
      { key: 'Warranty', value: '1 Year Brand Warranty' },
    ],
    highlights: [
      'High-performance Snapdragon 8 Gen 2 processor with Cryo-velocity VC cooling',
      '1.5K 120Hz ProXDR AMOLED with 4th Gen LTPO technology',
      'Biggest OnePlus battery at 5500mAh with 100W SUPERVOOC charging',
      '50MP Sony IMX890 flagship camera with Optical Image Stabilization',
      'Dual stereo speakers with Dolby Atmos audio certification',
    ],
    tags: ['oneplus', 'oneplus 12r', 'performance phone', '5g phone', '100w fast charging'],
    keywords: ['oneplus 12r 5g', 'oneplus 12r cool blue', 'snapdragon 8 gen 2', 'dream electronics'],
    shipping: { weight: 0.207, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 9. OnePlus Nord CE4 5G
  {
    name: 'OnePlus Nord CE4 5G (Dark Chrome, 8GB RAM, 128GB Storage)',
    shortDescription: 'OnePlus Nord CE4 with Snapdragon 7 Gen 3, 100W SUPERVOOC, 5500mAh Battery, and 50MP Sony LYT-600 OIS',
    description: `Fast and smooth meets exceptional endurance in the OnePlus Nord CE4 5G. Running on Qualcomm's efficient Snapdragon 7 Gen 3 chipset and 8GB RAM with expandable virtual RAM up to an additional 8GB.

Experience rapid 100W SUPERVOOC wired charging that recharges the 5500mAh high-capacity battery to 100% in under 30 minutes. The 50MP Sony LYT-600 main sensor with Optical Image Stabilization delivers sharp, jitter-free photos and videos even in low light.`,
    brand: 'OnePlus',
    sku: 'DE-1PL-NORDCE4-128',
    pricing: {
      basePrice: 24999,
      salePrice: 21999,
      costPrice: 18500,
      discountPercentage: 12.0,
    },
    inventory: { stock: 10, lowStockThreshold: 2, reorderPoint: 5, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://m.media-amazon.com/images/I/61g1-3pd0hL._SL1500_.jpg', alt: 'OnePlus Nord CE4 Dark Chrome Front', isPrimary: true },
      { url: 'https://m.media-amazon.com/images/I/61S0hK7R8kL._SL1500_.jpg', alt: 'OnePlus Nord CE4 Back Panel', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/61j1rM4X9oL._SL1500_.jpg', alt: 'OnePlus Nord CE4 Camera Layout', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/71A9F4j5m7L._SL1500_.jpg', alt: 'OnePlus Nord CE4 100W Charger in Box', isPrimary: false },
    ],
    specifications: [
      { key: 'Display', value: '6.7-inch 120Hz Fluid AMOLED (FHD+)' },
      { key: 'Processor', value: 'Qualcomm Snapdragon 7 Gen 3' },
      { key: 'RAM / Storage', value: '8 GB LPDDR4X / 128 GB UFS 3.1 (Expandable to 1TB)' },
      { key: 'Rear Camera', value: '50MP Sony LYT-600 OIS + 8MP Ultra-Wide' },
      { key: 'Front Camera', value: '16MP Front Camera' },
      { key: 'Battery', value: '5500 mAh with 100W SUPERVOOC Flash Charge' },
      { key: 'Durability', value: 'IP54 Dust & Water Resistance' },
      { key: 'Warranty', value: '1 Year Brand Warranty' },
    ],
    highlights: [
      'Snapdragon 7 Gen 3 engine with AI-accelerated performance',
      'Ultra-fast 100W SUPERVOOC charging: 1-100% in 29 minutes',
      '50MP Sony LYT-600 camera with Optical Image Stabilization',
      '120Hz Fluid AMOLED screen with vibrant colors and HDR10+ support',
      'Aqua Touch technology for smooth touch operation with wet fingers',
    ],
    tags: ['oneplus', 'nord ce4', 'oneplus nord', '5g phone', '100w fast charging'],
    keywords: ['oneplus nord ce4 5g', 'nord ce4 dark chrome', '5500mah 100w', 'dream electronics'],
    shipping: { weight: 0.186, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 10. Xiaomi 14 5G
  {
    name: 'Xiaomi 14 5G (White, 12GB RAM, 512GB Storage)',
    shortDescription: 'Xiaomi 14 with Leica Summilux Optical Lens, Snapdragon 8 Gen 3, 1.5K 120Hz LTPO AMOLED, and 90W HyperCharge',
    description: `The Xiaomi 14 is a compact optical masterpiece. Co-engineered with legendary camera maker Leica, it features three 50MP Leica lenses covering 14mm to 75mm focal lengths, starring the custom Light Fusion 900 high-dynamic sensor with f/1.6 ultra-large aperture.

Powered by Qualcomm's flagship Snapdragon 8 Gen 3 chipset and Xiaomi's IceLoop cooling system, it delivers effortless pro-grade speed. The 6.36-inch 1.5K CrystalRes LTPO AMOLED screen boasts an astonishing 3000 nits peak brightness and razor-thin 1.61mm bezels. Supported by 90W wired HyperCharge and 50W wireless HyperCharge.`,
    brand: 'Xiaomi',
    sku: 'DE-XIA-14-512',
    pricing: {
      basePrice: 89999,
      salePrice: 69999,
      costPrice: 59000,
      discountPercentage: 22.22,
    },
    inventory: { stock: 10, lowStockThreshold: 2, reorderPoint: 5, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://m.media-amazon.com/images/I/71N-W9V5u9L._SL1500_.jpg', alt: 'Xiaomi 14 White Front View', isPrimary: true },
      { url: 'https://m.media-amazon.com/images/I/61lS4r0Y-KL._SL1500_.jpg', alt: 'Xiaomi 14 Leica Triple Camera', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/61k1qW0a3NL._SL1500_.jpg', alt: 'Xiaomi 14 Compact Form Factor', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/61hX4r3W+VL._SL1500_.jpg', alt: 'Xiaomi 14 90W HyperCharge and Box', isPrimary: false },
    ],
    specifications: [
      { key: 'Display', value: '6.36-inch 1.5K 120Hz LTPO AMOLED (3000 nits, Dolby Vision)' },
      { key: 'Processor', value: 'Qualcomm Snapdragon 8 Gen 3 (4nm)' },
      { key: 'RAM / Storage', value: '12 GB LPDDR5X / 512 GB UFS 4.0' },
      { key: 'Rear Camera', value: '50MP Leica Main (f/1.6, OIS) + 50MP Leica 75mm Floating Telephoto + 50MP Ultra-Wide' },
      { key: 'Battery & Charging', value: '4610 mAh with 90W Wired + 50W Wireless HyperCharge' },
      { key: 'Operating System', value: 'Xiaomi HyperOS based on Android 14' },
      { key: 'Water Resistance', value: 'IP68 Dust & Water Proof' },
      { key: 'Warranty', value: '1 Year Brand Warranty' },
    ],
    highlights: [
      'Leica Vario-Summilux optical lens system with Light Fusion 900 sensor',
      'Snapdragon 8 Gen 3 flagship platform with IceLoop thermal management',
      'Ultra-compact 6.36-inch ergonomic design with 1.61mm ultra-narrow bezels',
      '90W wired HyperCharge (0-100% in 31 mins) and 50W wireless HyperCharge',
      'Xiaomi HyperOS for ultra-fluid interconnectivity across smart devices',
    ],
    tags: ['xiaomi', 'xiaomi 14', 'leica camera', 'flagship phone', '5g phone', 'hyperos'],
    keywords: ['xiaomi 14 5g', 'xiaomi 14 leica', 'compact flagship', 'dream electronics'],
    shipping: { weight: 0.193, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 11. Redmi Note 13 Pro+ 5G
  {
    name: 'Redmi Note 13 Pro+ 5G (Fusion Black, 8GB RAM, 256GB Storage)',
    shortDescription: 'Redmi Note 13 Pro+ with 200MP OIS Camera, 3D Curved 1.5K 120Hz AMOLED, 120W HyperCharge, and IP68 Water Resistance',
    description: `Supercharge your photography with the Redmi Note 13 Pro+ 5G. Leading the category with a flagship-level 200MP Samsung ISOCELL HP3 camera with OIS + EIS and 4x in-sensor lossless zoom.

Designed with a stunning 3D curved 1.5K 120Hz CrystalRes AMOLED display protected by Corning Gorilla Glass Victus. Powered by the MediaTek Dimensity 7200-Ultra 4nm chipset and featuring lightning-fast 120W HyperCharge that powers the 5000mAh battery from zero to full in just 19 minutes. Complete with IP68 water and dust resistance.`,
    brand: 'Redmi',
    sku: 'DE-RED-NOTE13PP-256',
    pricing: {
      basePrice: 33999,
      salePrice: 27999,
      costPrice: 23500,
      discountPercentage: 17.65,
    },
    inventory: { stock: 10, lowStockThreshold: 2, reorderPoint: 5, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://m.media-amazon.com/images/I/71XNeka-BRL._SL1500_.jpg', alt: 'Redmi Note 13 Pro Plus Front Curved Display', isPrimary: true },
      { url: 'https://m.media-amazon.com/images/I/71zD9fW2YmL._SL1500_.jpg', alt: 'Redmi Note 13 Pro Plus 200MP Camera', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/61o4s-sK9KL._SL1500_.jpg', alt: 'Redmi Note 13 Pro Plus Curved Back', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/71h4l6Z1sAL._SL1500_.jpg', alt: 'Redmi Note 13 Pro Plus 120W In-box Charger', isPrimary: false },
    ],
    specifications: [
      { key: 'Display', value: '6.67-inch 3D Curved 1.5K 120Hz AMOLED (1800 nits peak, Dolby Vision)' },
      { key: 'Processor', value: 'MediaTek Dimensity 7200-Ultra (4nm Octa-Core)' },
      { key: 'RAM / Storage', value: '8 GB LPDDR5 / 256 GB UFS 3.1' },
      { key: 'Rear Camera', value: '200MP OIS Main + 8MP Ultra-Wide + 2MP Macro' },
      { key: 'Battery & Charging', value: '5000 mAh with 120W HyperCharge (100% in 19 mins)' },
      { key: 'Protection', value: 'IP68 Dust & Water Proof + Gorilla Glass Victus' },
      { key: 'Warranty', value: '1 Year Brand Warranty' },
    ],
    highlights: [
      'Pro-grade 200MP OIS camera with 4x lossless in-sensor zoom',
      'Vivid 3D Curved 1.5K 120Hz AMOLED display with in-screen fingerprint sensor',
      'Blazing 120W HyperCharge: reaches 100% battery in just 19 minutes',
      'IP68 certified water and dust resistance for worry-free durability',
      'MediaTek Dimensity 7200-Ultra processor with massive VC liquid cooling',
    ],
    tags: ['redmi', 'redmi note 13 pro plus', '200mp camera', '120w charging', '5g phone'],
    keywords: ['redmi note 13 pro+ 5g', 'redmi 200mp camera', 'curved amoled phone', 'dream electronics'],
    shipping: { weight: 0.204, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 12. Redmi 13C 5G
  {
    name: 'Redmi 13C 5G (Startrail Black, 4GB RAM, 128GB Storage)',
    shortDescription: 'Redmi 13C 5G with MediaTek Dimensity 6100+ 5G, 6.74" 90Hz Display, 50MP AI Dual Camera, and 5000mAh Battery',
    description: `Step into true 5G speed with the stylish Redmi 13C 5G. Featuring a shimmering Star Trail design that gleams from every angle, this smartphone runs on the power-efficient MediaTek Dimensity 6100+ 5G chipset.

Its expansive 6.74-inch 90Hz display delivers smooth animations for everyday browsing and social media scrolling. Capture everyday moments with the 50MP AI camera system with vintage film filters. Equipped with a reliable 5000mAh battery that easily powers through your busy workday.`,
    brand: 'Redmi',
    sku: 'DE-RED-13C5G-128',
    pricing: {
      basePrice: 13999,
      salePrice: 9999,
      costPrice: 8200,
      discountPercentage: 28.57,
    },
    inventory: { stock: 10, lowStockThreshold: 2, reorderPoint: 5, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://m.media-amazon.com/images/I/71d1ytcCntL._SL1500_.jpg', alt: 'Redmi 13C 5G Black Front', isPrimary: true },
      { url: 'https://m.media-amazon.com/images/I/61o3N54u8SL._SL1500_.jpg', alt: 'Redmi 13C 5G Star Trail Back Design', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/61hM7q2Z4TL._SL1500_.jpg', alt: 'Redmi 13C 5G 50MP AI Camera', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/71rB8j0L7dL._SL1500_.jpg', alt: 'Redmi 13C 5G Ports and Side Fingerprint', isPrimary: false },
    ],
    specifications: [
      { key: 'Display', value: '6.74-inch HD+ 90Hz Dot Drop Display (Corning Gorilla Glass)' },
      { key: 'Processor', value: 'MediaTek Dimensity 6100+ 6nm 5G' },
      { key: 'RAM / Storage', value: '4 GB RAM (+4GB Virtual RAM) / 128 GB Storage' },
      { key: 'Rear Camera', value: '50MP f/1.8 AI Dual Camera' },
      { key: 'Battery', value: '5000 mAh with 18W Fast Charging' },
      { key: 'Security', value: 'Fast Side-mounted Fingerprint Sensor' },
      { key: 'Warranty', value: '1 Year Brand Warranty' },
    ],
    highlights: [
      'Fast and reliable dual 5G connectivity with Dimensity 6100+ processor',
      'Fluid 6.74-inch 90Hz display for smooth browsing and multimedia',
      'Crisp 50MP AI camera with classic film camera picture modes',
      'Long-lasting 5000mAh battery with Type-C 18W fast charge support',
      'Premium Star Trail glitter finish with scratch-resistant Corning glass',
    ],
    tags: ['redmi', 'redmi 13c', 'budget 5g phone', '50mp camera', 'xiaomi'],
    keywords: ['redmi 13c 5g', 'redmi budget 5g phone', 'dimensity 6100+', 'dream electronics'],
    shipping: { weight: 0.192, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 13. Vivo X100 5G
  {
    name: 'Vivo X100 5G (Stargaze Blue, 12GB RAM, 256GB Storage)',
    shortDescription: 'Vivo X100 with ZEISS All Main Camera, Dimensity 9300 All-Big-Core Processor, 120W FlashCharge, and Sun Halo Design',
    description: `Designed for photography purists, the Vivo X100 5G is powered by the revolutionary MediaTek Dimensity 9300 All-Big-Core chipset and Vivo's custom V2 imaging chip.

Co-engineered with ZEISS, it features a 50MP VCS True Color main camera and 64MP ZEISS Telephoto lens with T* anti-reflective coating, capturing crisp sunset portraits and moon shots with zero ghosting. The 6.78-inch 120Hz LTPO curved screen shines brightly with 3000 nits peak brightness, supported by a 5000mAh battery and blazing 120W FlashCharge.`,
    brand: 'Vivo',
    sku: 'DE-VIV-X100-256',
    pricing: {
      basePrice: 69999,
      salePrice: 63999,
      costPrice: 55000,
      discountPercentage: 8.57,
    },
    inventory: { stock: 10, lowStockThreshold: 2, reorderPoint: 5, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://m.media-amazon.com/images/I/71eX4hP8S4L._SL1500_.jpg', alt: 'Vivo X100 Blue Front Curved Display', isPrimary: true },
      { url: 'https://m.media-amazon.com/images/I/61H4H64sPjL._SL1500_.jpg', alt: 'Vivo X100 ZEISS Sun Halo Camera Module', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/61o9F5s7LqL._SL1500_.jpg', alt: 'Vivo X100 Stargaze Blue Textured Back', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/71R2cK6a3sL._SL1500_.jpg', alt: 'Vivo X100 120W FlashCharge Adapter', isPrimary: false },
    ],
    specifications: [
      { key: 'Display', value: '6.78-inch 1.5K 120Hz LTPO AMOLED (3000 nits, 2160Hz PWM)' },
      { key: 'Processor', value: 'MediaTek Dimensity 9300 (4nm All-Big-Core) + Vivo V2 Chip' },
      { key: 'RAM / Storage', value: '12 GB LPDDR5T / 256 GB UFS 4.0' },
      { key: 'Rear Camera', value: '50MP ZEISS VCS OIS + 64MP ZEISS Telephoto + 50MP Ultra-Wide' },
      { key: 'Battery & Charging', value: '5000 mAh with 120W Dual-Cell FlashCharge (11 mins to 50%)' },
      { key: 'Protection', value: 'IP68 Dust & Water Resistant' },
      { key: 'Warranty', value: '1 Year Brand Warranty' },
    ],
    highlights: [
      'Flagship ZEISS optics with T* coating and dedicated telephoto portrait macro',
      'MediaTek Dimensity 9300 All-Big-Core architecture delivering top AnTuTu scores',
      'Vivid 1.5K LTPO curved AMOLED with 2160Hz high-frequency eye protection',
      'Lightning-fast 120W FlashCharge technology: 50% battery in 11 minutes',
      'IP68 flagship water and dust resistance with aerospace-grade build quality',
    ],
    tags: ['vivo', 'vivo x100', 'zeiss camera', 'dimensity 9300', 'flagship phone'],
    keywords: ['vivo x100 5g', 'vivo x100 stargaze blue', 'zeiss portrait phone', 'dream electronics'],
    shipping: { weight: 0.206, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 14. Vivo V40 Pro 5G
  {
    name: 'Vivo V40 Pro 5G (Ganges Blue, 8GB RAM, 256GB Storage)',
    shortDescription: 'Vivo V40 Pro with 50MP ZEISS Multifocal Portrait, Dimensity 9200+, 5500mAh BlueVolt Battery, and 80W FlashCharge',
    description: `The Vivo V40 Pro brings studio-grade ZEISS portraits to your pocket. Armed with a 50MP ZEISS OIS main camera, 50MP ZEISS telephoto portrait camera, and 50MP ZEISS ultra-wide camera, capture breathtaking multifocal portraits at 24mm, 35mm, 50mm, 85mm, and 100mm.

Powered by the flagship 4nm MediaTek Dimensity 9200+ processor, enjoy pro-tier gaming without battery anxiety thanks to the ultra-thin 5500mAh BlueVolt battery and 80W FlashCharge. Housed in a stunning 3D curved body that is just 7.58mm thin and certified IP68 water-resistant.`,
    brand: 'Vivo',
    sku: 'DE-VIV-V40PRO-256',
    pricing: {
      basePrice: 54999,
      salePrice: 49999,
      costPrice: 43000,
      discountPercentage: 9.09,
    },
    inventory: { stock: 10, lowStockThreshold: 2, reorderPoint: 5, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://m.media-amazon.com/images/I/71R3J1lGgLL._SL1500_.jpg', alt: 'Vivo V40 Pro Ganges Blue Front', isPrimary: true },
      { url: 'https://m.media-amazon.com/images/I/61kG1rP9tGL._SL1500_.jpg', alt: 'Vivo V40 Pro ZEISS Aura Light Camera', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/61pD7x8aP8L._SL1500_.jpg', alt: 'Vivo V40 Pro Slim Curved Edge', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/71k4qL3a6rL._SL1500_.jpg', alt: 'Vivo V40 Pro Box and 80W Charger', isPrimary: false },
    ],
    specifications: [
      { key: 'Display', value: '6.78-inch 1.5K 120Hz 3D Curved AMOLED (4500 nits peak)' },
      { key: 'Processor', value: 'MediaTek Dimensity 9200+ (4nm Flagship)' },
      { key: 'RAM / Storage', value: '8 GB LPDDR5X / 256 GB UFS 3.1' },
      { key: 'Rear Camera', value: '50MP ZEISS OIS Main + 50MP ZEISS Telephoto (2x optical) + 50MP ZEISS Ultra-Wide' },
      { key: 'Front Camera', value: '50MP ZEISS Group Selfie Camera with AF' },
      { key: 'Battery', value: '5500 mAh BlueVolt Battery with 80W FlashCharge' },
      { key: 'Durability', value: 'IP68 & IP69 Water and Dust Resistance' },
      { key: 'Warranty', value: '1 Year Brand Warranty' },
    ],
    highlights: [
      'Triple 50MP ZEISS camera system with studio-grade Aura Light Portrait',
      'MediaTek Dimensity 9200+ flagship processor with high frame rate gaming',
      'Ultra-large 5500mAh BlueVolt battery squeezed into a slim 7.58mm frame',
      'Industry-first IP68 and IP69 water and high-pressure steam resistance',
      '3D curved 1.5K 120Hz AMOLED with 4500 nits local peak brightness',
    ],
    tags: ['vivo', 'vivo v40 pro', 'zeiss portrait', 'dimensity 9200+', '5g phone'],
    keywords: ['vivo v40 pro 5g', 'vivo v40 pro ganges blue', 'zeiss aura light', 'dream electronics'],
    shipping: { weight: 0.192, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 15. Vivo T3x 5G
  {
    name: 'Vivo T3x 5G (Crimson Bliss, 4GB RAM, 128GB Storage)',
    shortDescription: 'Vivo T3x 5G with Snapdragon 6 Gen 1, 6000mAh Turbo Battery, 120Hz Display, and 50MP HD Camera',
    description: `Power up your digital life with the Vivo T3x 5G. Built around the segment-first 4nm Snapdragon 6 Gen 1 processor that delivers remarkable energy savings and smooth daily multitasking.

Featuring a colossal 6000mAh battery housed in an astonishingly sleek 7.99mm body. Dual stereo speakers equipped with a 300% Audio Booster provide booming sound for gaming and movies. The 6.72-inch 120Hz Ultra Vision Display keeps visuals vivid and crisp under any lighting.`,
    brand: 'Vivo',
    sku: 'DE-VIV-T3X-128',
    pricing: {
      basePrice: 17499,
      salePrice: 12999,
      costPrice: 10800,
      discountPercentage: 25.71,
    },
    inventory: { stock: 10, lowStockThreshold: 2, reorderPoint: 5, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://m.media-amazon.com/images/I/71Z11bTzFBL._SL1500_.jpg', alt: 'Vivo T3x Crimson Bliss Front', isPrimary: true },
      { url: 'https://m.media-amazon.com/images/I/61bB4e1qVWL._SL1500_.jpg', alt: 'Vivo T3x Circular Camera Island', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/61zJ8V3K1OL._SL1500_.jpg', alt: 'Vivo T3x 6000mAh Slim Body', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/71V2x8vL6lL._SL1500_.jpg', alt: 'Vivo T3x Audio Booster Features', isPrimary: false },
    ],
    specifications: [
      { key: 'Display', value: '6.72-inch FHD+ 120Hz Ultra Vision Display (1000 nits HBM)' },
      { key: 'Processor', value: 'Qualcomm Snapdragon 6 Gen 1 (4nm 5G)' },
      { key: 'RAM / Storage', value: '4 GB RAM (+4GB Extended RAM) / 128 GB Storage' },
      { key: 'Rear Camera', value: '50MP HD Main + 2MP Bokeh Camera' },
      { key: 'Battery & Charging', value: '6000 mAh Turbo Battery with 44W FlashCharge' },
      { key: 'Audio', value: 'Dual Stereo Speakers with 300% Ultra Volume' },
      { key: 'Warranty', value: '1 Year Brand Warranty' },
    ],
    highlights: [
      'Segment-leading 4nm Qualcomm Snapdragon 6 Gen 1 octa-core chipset',
      'Massive 6000mAh battery packaged into a feather-light 7.99mm frame',
      'Immersive dual stereo speakers with 300% Audio Booster amplifier',
      'Smooth 120Hz Ultra Vision Display with TÜV Rheinland low blue light certification',
      '44W FlashCharge adapter bundled directly in the retail box',
    ],
    tags: ['vivo', 'vivo t3x', '6000mah battery', 'snapdragon 6 gen 1', 'budget 5g'],
    keywords: ['vivo t3x 5g', 'vivo t3x crimson bliss', '6000mah slim phone', 'dream electronics'],
    shipping: { weight: 0.199, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 16. Realme GT 6T 5G
  {
    name: 'Realme GT 6T 5G (Fluid Silver, 8GB RAM, 256GB Storage)',
    shortDescription: 'Realme GT 6T with Snapdragon 7+ Gen 3, 6000 nits 8T LTPO AMOLED, 120W SUPERVOOC, and 50MP Sony OIS',
    description: `Unleash top-tier power with the Realme GT 6T 5G. Driven by the flagship Snapdragon 7+ Gen 3 processor with an enormous 9-layer Iceberg vapor cooling system.

Boasting the world's brightest smartphone screen: a 6000 nits 8T LTPO AMOLED display that provides pristine readability under blazing sunlight. Coupled with a 5500mAh battery and blazing 120W SUPERVOOC fast charging that takes you from 1% to 50% in just 10 minutes.`,
    brand: 'Realme',
    sku: 'DE-RLM-GT6T-256',
    pricing: {
      basePrice: 35999,
      salePrice: 28999,
      costPrice: 24000,
      discountPercentage: 19.44,
    },
    inventory: { stock: 10, lowStockThreshold: 2, reorderPoint: 5, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://m.media-amazon.com/images/I/71P4q8a1gFL._SL1500_.jpg', alt: 'Realme GT 6T Fluid Silver Front', isPrimary: true },
      { url: 'https://m.media-amazon.com/images/I/61L2oK3L9WL._SL1500_.jpg', alt: 'Realme GT 6T Nano Mirror Dual Tone Back', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/61eO9Z6rRkL._SL1500_.jpg', alt: 'Realme GT 6T 6000 nits LTPO Screen', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/71J2bO8L6lL._SL1500_.jpg', alt: 'Realme GT 6T 120W SUPERVOOC Charger', isPrimary: false },
    ],
    specifications: [
      { key: 'Display', value: '6.78-inch 1.5K 120Hz 8T LTPO AMOLED (6000 nits peak, Gorilla Glass Victus 2)' },
      { key: 'Processor', value: 'Qualcomm Snapdragon 7+ Gen 3 (4nm)' },
      { key: 'RAM / Storage', value: '8 GB LPDDR5X / 256 GB UFS 4.0' },
      { key: 'Rear Camera', value: '50MP Sony LYT-600 OIS + 8MP Ultra-Wide' },
      { key: 'Front Camera', value: '32MP Sony IMX615' },
      { key: 'Battery & Charging', value: '5500 mAh with 120W SUPERVOOC (50% in 10 mins)' },
      { key: 'Warranty', value: '1 Year Brand Warranty' },
    ],
    highlights: [
      'Snapdragon 7+ Gen 3 flagship processor matching 8 Gen-series performance',
      'World-record 6000 nits peak brightness 8T LTPO AMOLED with Victus 2 glass',
      'Ultra-fast 120W SUPERVOOC charging with 5500mAh high-density battery',
      '50MP Sony OIS camera with 4K 60fps video recording support',
      '9-layer 10014mm² Iceberg Vapor Chamber for cool high-FPS gaming',
    ],
    tags: ['realme', 'realme gt 6t', 'snapdragon 7+ gen 3', '6000 nits', '120w charging'],
    keywords: ['realme gt 6t 5g', 'realme gt 6t fluid silver', 'brightest display phone', 'dream electronics'],
    shipping: { weight: 0.191, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 17. Realme 12 Pro+ 5G
  {
    name: 'Realme 12 Pro+ 5G (Submarine Blue, 8GB RAM, 256GB Storage)',
    shortDescription: 'Realme 12 Pro+ with 64MP Periscope Portrait Camera, Luxury Watch Design, 120Hz Curved AMOLED, and 67W Charge',
    description: `Redefine portrait photography with the Realme 12 Pro+ 5G. Featuring a groundbreaking 64MP Periscope Telephoto camera with 3x optical zoom and 120x SuperZoom, powered by the flagship Sony IMX890 OIS main sensor.

Crafted in partnership with master luxury watchmaker Ollivier Savéo, featuring a golden fluted bezel, polished sunburst dial, and vegan leather back. The 120Hz Curved Vision AMOLED screen delivers flagship cinematic immersion with eye-protecting 2160Hz PWM dimming.`,
    brand: 'Realme',
    sku: 'DE-RLM-12PROP-256',
    pricing: {
      basePrice: 34999,
      salePrice: 29999,
      costPrice: 25000,
      discountPercentage: 14.28,
    },
    inventory: { stock: 10, lowStockThreshold: 2, reorderPoint: 5, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://m.media-amazon.com/images/I/71v1m4e3GPL._SL1500_.jpg', alt: 'Realme 12 Pro Plus Blue Front', isPrimary: true },
      { url: 'https://m.media-amazon.com/images/I/61j6L0eA3HL._SL1500_.jpg', alt: 'Realme 12 Pro Plus Vegan Leather Back', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/61tG9v7a1bL._SL1500_.jpg', alt: 'Realme 12 Pro Plus Periscope Lens', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/71Q2z9pL6jL._SL1500_.jpg', alt: 'Realme 12 Pro Plus Golden Bezel Dial', isPrimary: false },
    ],
    specifications: [
      { key: 'Display', value: '6.7-inch FHD+ 120Hz Curved AMOLED (2160Hz PWM)' },
      { key: 'Processor', value: 'Qualcomm Snapdragon 7s Gen 2 (4nm)' },
      { key: 'RAM / Storage', value: '8 GB RAM / 256 GB Storage' },
      { key: 'Rear Camera', value: '64MP Periscope (3x optical, 120x SuperZoom, OIS) + 50MP Sony IMX890 OIS + 8MP Ultra-Wide' },
      { key: 'Front Camera', value: '32MP Sony Selfie Camera' },
      { key: 'Battery', value: '5000 mAh with 67W SUPERVOOC Fast Charge' },
      { key: 'Design', value: 'Luxury Watch Vegan Leather Design' },
      { key: 'Warranty', value: '1 Year Brand Warranty' },
    ],
    highlights: [
      'Segment-first 64MP Periscope Telephoto camera with 120x SuperZoom',
      'Flagship 50MP Sony IMX890 sensor with Optical Image Stabilization',
      'Luxury Swiss watchmaker design with premium vegan leather casing',
      'Silky 120Hz Curved AMOLED display with 2160Hz high-frequency PWM',
      'Snapdragon 7s Gen 2 4nm chipset with 67W SUPERVOOC flash charge',
    ],
    tags: ['realme', 'realme 12 pro plus', 'periscope camera', 'vegan leather', '5g phone'],
    keywords: ['realme 12 pro+ 5g', 'periscope telephoto phone', 'luxury watch design', 'dream electronics'],
    shipping: { weight: 0.196, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 18. Realme Narzo 70 Pro 5G
  {
    name: 'Realme Narzo 70 Pro 5G (Glass Green, 8GB RAM, 128GB Storage)',
    shortDescription: 'Realme Narzo 70 Pro with Flagship Sony IMX890 OIS, Creative Air Gestures, 67W Charge, and Duo Touch Glass',
    description: `The Realme Narzo 70 Pro 5G is built to impress with its flagship 50MP Sony IMX890 camera sensor with OIS, delivering breathtaking clarity even in low light.

Control your phone without touching the screen using intuitive Air Gestures: scroll short videos, browse albums, and answer calls with hand waves. Featuring a premium Horizon Duo-Touch Glass back and a super-smooth 120Hz AMOLED screen.`,
    brand: 'Realme',
    sku: 'DE-RLM-NARZO70P-128',
    pricing: {
      basePrice: 24999,
      salePrice: 18999,
      costPrice: 15500,
      discountPercentage: 24.0,
    },
    inventory: { stock: 10, lowStockThreshold: 2, reorderPoint: 5, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://m.media-amazon.com/images/I/7161l6-2G2L._SL1500_.jpg', alt: 'Realme Narzo 70 Pro Front View', isPrimary: true },
      { url: 'https://m.media-amazon.com/images/I/61N3bK4L9vL._SL1500_.jpg', alt: 'Realme Narzo 70 Pro Duo Glass Back', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/61k9H8a0LAL._SL1500_.jpg', alt: 'Realme Narzo 70 Pro Sony IMX890 Sensor', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/71V2c8eL6dL._SL1500_.jpg', alt: 'Realme Narzo 70 Pro Air Gestures Demo', isPrimary: false },
    ],
    specifications: [
      { key: 'Display', value: '6.67-inch FHD+ 120Hz AMOLED (2000 nits peak, Rainwater Smart Touch)' },
      { key: 'Processor', value: 'MediaTek Dimensity 7050 5G (6nm)' },
      { key: 'RAM / Storage', value: '8 GB RAM (+8GB Dynamic RAM) / 128 GB Storage' },
      { key: 'Rear Camera', value: '50MP Sony IMX890 OIS + 8MP Ultra-Wide + 2MP Macro' },
      { key: 'Battery', value: '5000 mAh with 67W SUPERVOOC Charge' },
      { key: 'Smart Feature', value: 'Air Gestures (Touch-free navigation)' },
      { key: 'Warranty', value: '1 Year Brand Warranty' },
    ],
    highlights: [
      'Flagship 50MP Sony IMX890 OIS sensor bringing night photography to life',
      'Touch-free Air Gestures for scrolling, liking videos, and answering calls',
      'Dual-tone Horizon Glass back design with luxurious hand-feel',
      '120Hz Ultra Smooth AMOLED with Rainwater Smart Touch technology',
      '67W SUPERVOOC fast charging powering 50% battery in 19 minutes',
    ],
    tags: ['realme', 'narzo 70 pro', 'air gestures', 'sony imx890', '5g phone'],
    keywords: ['realme narzo 70 pro 5g', 'narzo 70 pro glass green', 'air gestures phone', 'dream electronics'],
    shipping: { weight: 0.195, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 19. Oppo Reno 12 Pro 5G
  {
    name: 'Oppo Reno 12 Pro 5G (Sunset Gold, 12GB RAM, 512GB Storage)',
    shortDescription: 'Oppo Reno 12 Pro with AI Portrait Studio, Dimensity 7300-Energy, 50MP Telephoto Portrait, and 80W SUPERVOOC',
    description: `Step into future intelligence with the Oppo Reno 12 Pro 5G. Packed with cutting-edge GenAI features including AI Eraser 2.0, AI Best Face, and AI Studio to turn snapshots into studio portraits.

Equipped with a flagship 50MP Sony Telephoto Portrait camera (2x optical zoom) and a 50MP ultra-clear selfie camera with autofocus. Powered by the customized 4nm MediaTek Dimensity 7300-Energy processor and an all-round Armour Shield that resists drops and impacts. Supported by 80W SUPERVOOC charging.`,
    brand: 'Oppo',
    sku: 'DE-OPP-RENO12P-512',
    pricing: {
      basePrice: 56999,
      salePrice: 42999,
      costPrice: 36000,
      discountPercentage: 24.56,
    },
    inventory: { stock: 10, lowStockThreshold: 2, reorderPoint: 5, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://m.media-amazon.com/images/I/71g4W1P-aGL._SL1500_.jpg', alt: 'Oppo Reno 12 Pro Sunset Gold Front', isPrimary: true },
      { url: 'https://m.media-amazon.com/images/I/61J2lK4L9rL._SL1500_.jpg', alt: 'Oppo Reno 12 Pro Dual Texture Gold Back', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/61y8G7a2LBL._SL1500_.jpg', alt: 'Oppo Reno 12 Pro 50MP Telephoto Lens', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/71M2z7eL6jL._SL1500_.jpg', alt: 'Oppo Reno 12 Pro Quad Curved Display', isPrimary: false },
    ],
    specifications: [
      { key: 'Display', value: '6.7-inch Quad-Curved Infinite View 120Hz AMOLED (Gorilla Glass Victus 2)' },
      { key: 'Processor', value: 'MediaTek Dimensity 7300-Energy (4nm)' },
      { key: 'RAM / Storage', value: '12 GB LPDDR4X / 512 GB UFS 3.1' },
      { key: 'Rear Camera', value: '50MP Sony LYT-600 OIS + 50MP Telephoto (2x) + 8MP Ultra-Wide' },
      { key: 'Front Camera', value: '50MP Ultra-Clear Selfie Camera with AF' },
      { key: 'Battery', value: '5000 mAh with 80W SUPERVOOC Flash Charge' },
      { key: 'AI Features', value: 'AI Eraser 2.0, AI Best Face, AI Clear Face, AI Summary' },
      { key: 'Warranty', value: '1 Year Brand Warranty' },
    ],
    highlights: [
      'Comprehensive GenAI toolkit: AI Eraser 2.0, AI Best Face, and AI Studio',
      'Dual 50MP portrait master system (Sony OIS main + 2x optical telephoto)',
      'Quad-Curved Infinite View AMOLED screen with Gorilla Glass Victus 2',
      'Sponge Bionic cushioning and High-Strength Alloy for drop durability',
      '80W SUPERVOOC charging: reaching 100% capacity in 46 minutes',
    ],
    tags: ['oppo', 'reno 12 pro', 'ai portrait', '5g phone', 'telephoto camera'],
    keywords: ['oppo reno 12 pro 5g', 'reno 12 pro sunset gold', 'ai eraser phone', 'dream electronics'],
    shipping: { weight: 0.18, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 20. Oppo F27 Pro+ 5G
  {
    name: 'Oppo F27 Pro+ 5G (Midnight Navy, 8GB RAM, 128GB Storage)',
    shortDescription: 'Oppo F27 Pro+ India\'s First IP69/IP68/IP66 Waterproof Smartphone with 360 Armour Body and 3D Curved 120Hz AMOLED',
    description: `Discover unprecedented durability with the Oppo F27 Pro+ 5G. India's first smartphone certified with triple water resistance ratings: IP69 (high-pressure steam jets), IP68 (submersion), and IP66 (powerful water spray).

Built with a 360-degree Armour Body and Swiss SGS 5-star drop resistance certification. Its breathtaking 3D curved 120Hz AMOLED screen is protected by Corning Gorilla Glass Victus 2. Armed with a 64MP AI camera, MediaTek Dimensity 7050 chipset, and 67W SUPERVOOC fast charging.`,
    brand: 'Oppo',
    sku: 'DE-OPP-F27PROP-128',
    pricing: {
      basePrice: 31999,
      salePrice: 27999,
      costPrice: 23500,
      discountPercentage: 12.5,
    },
    inventory: { stock: 10, lowStockThreshold: 2, reorderPoint: 5, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://m.media-amazon.com/images/I/71o0W2P-bHL._SL1500_.jpg', alt: 'Oppo F27 Pro Plus Navy Front', isPrimary: true },
      { url: 'https://m.media-amazon.com/images/I/61M2lK5L9sL._SL1500_.jpg', alt: 'Oppo F27 Pro Plus Leather Pattern Back', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/61z8G8a3LCL._SL1500_.jpg', alt: 'Oppo F27 Pro Plus IP69 Waterproof Test', isPrimary: false },
      { url: 'https://m.media-amazon.com/images/I/71N2z8eL6kL._SL1500_.jpg', alt: 'Oppo F27 Pro Plus 3D Curved Screen', isPrimary: false },
    ],
    specifications: [
      { key: 'Display', value: '6.7-inch 3D Curved 120Hz AMOLED (Corning Gorilla Glass Victus 2)' },
      { key: 'Processor', value: 'MediaTek Dimensity 7050 5G (6nm)' },
      { key: 'RAM / Storage', value: '8 GB RAM / 128 GB Storage' },
      { key: 'Rear Camera', value: '64MP Ultra-Clear Main + 2MP Portrait Camera' },
      { key: 'Front Camera', value: '8MP Selfie Camera' },
      { key: 'Battery', value: '5000 mAh with 67W SUPERVOOC Flash Charge' },
      { key: 'Water & Drop Resistance', value: 'IP69, IP68, IP66 Certified + Swiss SGS 5-star Drop Proof' },
      { key: 'Warranty', value: '1 Year Brand Warranty' },
    ],
    highlights: [
      'India\'s first smartphone featuring IP69, IP68, and IP66 extreme water resistance',
      '360-degree Armour Body certified by Swiss SGS 5-star premium drop test',
      'Splendid 3D Curved 120Hz AMOLED display with Victus 2 scratch defense',
      '64MP AI ultra-clear camera with underwater photography capabilities',
      'Fast 67W SUPERVOOC charging that refuels 56% battery in just 20 minutes',
    ],
    tags: ['oppo', 'oppo f27 pro plus', 'waterproof phone', 'ip69', '5g phone'],
    keywords: ['oppo f27 pro+ 5g', 'ip69 waterproof phone', 'oppo f27 pro navy', 'dream electronics'],
    shipping: { weight: 0.177, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },
];

async function seedPhones() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1. Find Seller (Dream Electronics)
    const Seller = mongoose.models.Seller || mongoose.model('Seller', new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      storeInfo: Object,
      businessInfo: Object
    }, { strict: false }));

    const seller = await Seller.findOne({
      $or: [
        { 'storeInfo.storeName': 'Dream Electronics' },
        { 'businessInfo.businessName': 'Dream Electronics' },
      ],
    });

    if (!seller) {
      console.error('❌ Dream Electronics seller account not found! Run seedDreamElectronicsTVs.js first.');
      process.exit(1);
    }

    console.log(`🏢 Sponsoring Seller: ${seller.storeInfo?.storeName || seller.businessInfo?.businessName} (${seller._id})\n`);

    // 2. Setup Category
    const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({}, { strict: false }));
    const smartphoneCat = await Category.findOne({ slug: 'smartphones' });
    const categoryName = smartphoneCat?.name || 'Smartphones';
    const categoryPath = smartphoneCat?.path || 'electronics/mobiles/smartphones';
    const subCategory = 'Mobile Phones';

    // 3. Upsert Products
    const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
    console.log(`📦 Upserting ${phoneProducts.length} Smartphone Products...\n`);

    let inserted = 0;
    let updated = 0;

    for (const phone of phoneProducts) {
      const payload = {
        ...phone,
        sellerId: seller._id,
        category: categoryName,
        categoryPath: categoryPath,
        subCategory: subCategory,
        isActive: true,
        isApproved: true,
        isFeatured: true,
        isDraft: false,
      };

      const existing = await Product.findOne({ sku: phone.sku });
      if (existing) {
        await Product.updateOne({ sku: phone.sku }, { $set: payload });
        console.log(`🔄 [UPDATED] ${phone.brand} - ${phone.name} (SKU: ${phone.sku})`);
        updated++;
      } else {
        await Product.create(payload);
        console.log(`✨ [INSERTED] ${phone.brand} - ${phone.name} (SKU: ${phone.sku})`);
        inserted++;
      }
    }

    console.log('\n=======================================');
    console.log('🎉 SMARTPHONE SEEDING COMPLETED!');
    console.log('=======================================');
    console.log(`🏢 Seller: Dream Electronics (${seller._id})`);
    console.log(`📱 Total Phones: ${phoneProducts.length} (Inserted: ${inserted}, Updated: ${updated})`);

    const brandCounts = {};
    phoneProducts.forEach((p) => {
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

seedPhones();
