// scripts/seedDreamElectronicsTVs.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

// Schemas
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
        default: 'proprietorship',
      },
      businessCategory: {
        type: String,
        enum: ['manufacturer', 'wholesaler', 'retailer', 'reseller', 'brand', 'electronics', 'fashion', 'home', 'beauty', 'others'],
        default: 'electronics',
      },
      establishedYear: { type: Number, default: 2021 },
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
      totalReviews: { type: Number, default: 124 },
    },
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
      count: { type: Number, default: 45 },
    },
    tags: [String],
    keywords: [String],
    highlights: [String],
    hsnCode: String,
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: true },
    isDraft: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    importedFrom: { type: String, default: 'manual' },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Seller = mongoose.models.Seller || mongoose.model('Seller', sellerSchema);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const tvProducts = [
  {
    name: 'Sony BRAVIA 3 Series 139 cm (55 inches) 4K Ultra HD AI Smart LED Google TV K-55S30B',
    shortDescription: 'Sony 55" 4K Google TV with 4K Processor X1, Triluminos Pro, Dolby Atmos and ALLM Gaming',
    description: `Experience cinematic home entertainment with the Sony BRAVIA 3 Series 55-inch 4K Ultra HD Smart LED Google TV. Powered by Sony's groundbreaking 4K Processor X1, every frame is analyzed and upscaled in real time to deliver unmatched clarity, lifelike contrast, and vibrant natural colors.

Featuring Triluminos PRO with an expansive color spectrum, movies and sports come alive with over a billion shades of precision color. The advanced 20W Bass Reflex speaker system with Dolby Atmos envelopes your living space in rich multidimensional audio.

Equipped with Google TV, your favorite content across Netflix, Prime Video, Disney+ Hotstar, and YouTube is organized seamlessly with personalized recommendations. Built-in Chromecast, Google Assistant voice search, Apple AirPlay 2, and Auto Low Latency Mode (ALLM) make this TV the ultimate centerpiece for movies, streaming, and gaming.`,
    brand: 'Sony',
    sku: 'DE-SONY-55S30B',
    pricing: {
      basePrice: 129900,
      salePrice: 74990,
      costPrice: 62000,
      discountPercentage: 42.27,
    },
    inventory: {
      stock: 10,
      lowStockThreshold: 2,
      reorderPoint: 5,
      trackInventory: true,
      soldCount: 0,
    },
    images: [
      {
        url: 'https://m.media-amazon.com/images/I/81lheSoBIYL._SL1500_.jpg',
        alt: 'Sony BRAVIA 3 Series 55 Inch Front View',
        isPrimary: true,
      },
      {
        url: 'https://m.media-amazon.com/images/I/71Lk8kC7p3L._SL1500_.jpg',
        alt: 'Sony BRAVIA 3 Series 55 Inch Display Angle',
        isPrimary: false,
      },
      {
        url: 'https://m.media-amazon.com/images/I/81W8m6EDtrL._SL1500_.jpg',
        alt: 'Sony BRAVIA 3 Series Sound and Features',
        isPrimary: false,
      },
      {
        url: 'https://m.media-amazon.com/images/I/71FXKRww1uL._SL1500_.jpg',
        alt: 'Sony BRAVIA 3 Series Bezel and Stand View',
        isPrimary: false,
      },
      {
        url: 'https://m.media-amazon.com/images/I/81bdr8FupRL._SL1500_.jpg',
        alt: 'Sony BRAVIA 3 Series Ports and Remote',
        isPrimary: false,
      },
    ],
    specifications: [
      { key: 'Screen Size', value: '55 Inches (139 cm)' },
      { key: 'Display Technology', value: '4K Ultra HD LED' },
      { key: 'Resolution', value: '3840 x 2160 Pixels' },
      { key: 'Refresh Rate', value: '60 Hz (Motionflow XR 100)' },
      { key: 'Image Processor', value: '4K HDR Processor X1' },
      { key: 'High Dynamic Range', value: 'HDR10, HLG, Dolby Vision' },
      { key: 'Audio Output', value: '20 Watts Bass Reflex with Dolby Atmos' },
      { key: 'Operating System', value: 'Google TV' },
      { key: 'HDMI Ports', value: '4 HDMI (eARC, ALLM supported)' },
      { key: 'USB Ports', value: '2 USB Ports' },
      { key: 'Wireless Connectivity', value: 'Dual-Band Wi-Fi (2.4/5GHz), Bluetooth 5.0' },
      { key: 'Smart Assistant', value: 'Google Assistant Built-in, Alexa Compatible, Apple AirPlay' },
      { key: 'Warranty', value: '1 Year Comprehensive Brand Warranty' },
    ],
    highlights: [
      '4K Ultra HD (3840 x 2160) display with Sony 4K HDR Processor X1',
      'Triluminos PRO technology bringing over a billion lifelike shades',
      '20W Bass Reflex Speakers fine-tuned with immersive Dolby Atmos',
      'Google TV with hands-free voice search and personalized curation',
      'Auto Low Latency Mode (ALLM) and eARC on HDMI 2.1 for gaming',
      'Apple AirPlay 2, Apple HomeKit, and Chromecast built-in',
    ],
    tags: ['sony', 'bravia', 'smart tv', '4k tv', '55 inch tv', 'google tv', 'dolby vision'],
    keywords: ['sony bravia', '55 inch 4k tv', 'smart led tv', 'google tv', 'k-55s30b', 'dream electronics'],
    shipping: { weight: 14.5, unit: 'kg', freeShipping: true, shippingFee: 0 },
    hsnCode: '85287200',
  },
  {
    name: 'Samsung 138 cm (55 inches) Crystal UHD 4K Samsung Vision AI Smart TV UA55UE85AHULXL',
    shortDescription: 'Samsung 55" Crystal UHD 4K Smart TV with Vision AI, PurColor, OTS Lite and 30W Sound',
    description: `Upgrade to smarter viewing with the Samsung 55-inch Crystal UHD 4K Smart TV. Powered by the intelligent Crystal Processor 4K, this television analyzes low-resolution media and upscales it into crisp, breathtaking 4K picture quality with deep contrasts and lifelike detail.

PurColor and HDR10+ support ensure exceptional color accuracy across every scene. With Samsung's innovative Vision AI Companion, your TV adapts brightness and picture dynamics automatically to ambient room lighting.

Enjoy theater-grade 30W audio with Object Tracking Sound (OTS Lite) and Q-Symphony, pairing your TV speakers harmoniously with Samsung soundbars. Access over 150+ live channels instantly through Samsung TV Plus with zero subscriptions required. Complete with a SolarCell eco-remote and Samsung SmartThings IoT integration.`,
    brand: 'Samsung',
    sku: 'DE-SAMS-55UE85',
    pricing: {
      basePrice: 68900,
      salePrice: 45990,
      costPrice: 38000,
      discountPercentage: 33.25,
    },
    inventory: {
      stock: 10,
      lowStockThreshold: 2,
      reorderPoint: 5,
      trackInventory: true,
      soldCount: 0,
    },
    images: [
      {
        url: 'https://m.media-amazon.com/images/I/81tilPzs7sL._SL1500_.jpg',
        alt: 'Samsung 55 Inch Crystal 4K Front View',
        isPrimary: true,
      },
      {
        url: 'https://m.media-amazon.com/images/I/91LzgoRcXTL._SL1500_.jpg',
        alt: 'Samsung 55 Inch Crystal 4K Side Profile',
        isPrimary: false,
      },
      {
        url: 'https://m.media-amazon.com/images/I/818yBmKgNpL._SL1500_.jpg',
        alt: 'Samsung Crystal Processor 4K Features',
        isPrimary: false,
      },
      {
        url: 'https://m.media-amazon.com/images/I/7148azBuroL._SL1500_.jpg',
        alt: 'Samsung 55 Inch Vision AI and Sound',
        isPrimary: false,
      },
      {
        url: 'https://m.media-amazon.com/images/I/71ptGzV9VzL._SL1500_.jpg',
        alt: 'Samsung Smart Remote and Ports',
        isPrimary: false,
      },
    ],
    specifications: [
      { key: 'Screen Size', value: '55 Inches (138 cm)' },
      { key: 'Display Technology', value: 'Crystal UHD 4K LED' },
      { key: 'Resolution', value: '3840 x 2160 Pixels' },
      { key: 'Refresh Rate', value: '50/60 Hz (Motion Xcelerator)' },
      { key: 'Image Processor', value: 'Crystal Processor 4K' },
      { key: 'High Dynamic Range', value: 'HDR10+, HLG Support' },
      { key: 'Audio Output', value: '30 Watts with OTS Lite & Q-Symphony' },
      { key: 'Operating System', value: 'Tizen OS Smart TV' },
      { key: 'HDMI Ports', value: '3 HDMI Ports (eARC, Anynet+ CEC)' },
      { key: 'USB Ports', value: '1 USB-A Port' },
      { key: 'Wireless Connectivity', value: 'Wi-Fi 5, Bluetooth 5.3' },
      { key: 'Energy Rating', value: '3 Star BEE Efficiency' },
      { key: 'Warranty', value: '1 Year Comprehensive + 1 Year Panel Warranty' },
    ],
    highlights: [
      'Crystal Processor 4K with AI Upscaling and dynamic PurColor',
      'Vision AI Companion for automatic scene and brightness optimization',
      'Powerful 30W Sound Output with Object Tracking Sound (OTS Lite)',
      'Samsung TV Plus offering 150+ free live streaming channels',
      'Motion Xcelerator with Auto Game Mode (ALLM) and VRR support',
      'Eco-friendly SolarCell Remote Control with voice assistance',
    ],
    tags: ['samsung', 'crystal 4k', 'smart tv', '55 inch tv', 'tizen', 'vision ai'],
    keywords: ['samsung crystal uhd', '55 inch 4k tv', 'ua55ue85ahulxl', 'samsung vision ai', 'dream electronics'],
    shipping: { weight: 13.8, unit: 'kg', freeShipping: true, shippingFee: 0 },
    hsnCode: '85287200',
  },
  {
    name: 'LG 108 cm (43 Inches) UR AI Series 4K Ultra HD Smart webOS LED TV 43UR7500PSC',
    shortDescription: 'LG 43" 4K Smart TV with α5 AI Processor Gen6, webOS, AI Sound 5.1 and Game Optimizer',
    description: `Immerse yourself in vivid details with the LG 43-inch UR AI Series 4K Ultra HD Smart TV. Engineered with LG's α5 AI Processor 4K Gen6, this television intelligently fine-tunes picture contrast and sound acoustics to deliver crisp detail and captivating clarity in every scene.

LG's webOS platform offers a fast, intuitive user experience featuring personalized Quick Cards, sports alerts, and easy switching between streaming services like Netflix, Prime Video, JioHotstar, Apple TV, and YouTube.

Experience virtual 5.1 surround sound driven by AI Sound, adapting voice dialogues and bass for crystal clarity. Designed with a sleek, minimalist bezel and featuring Game Optimizer with ALLM and HGiG support, this TV fits effortlessly into modern bedrooms and living areas.`,
    brand: 'LG',
    sku: 'DE-LG-43UR7500',
    pricing: {
      basePrice: 49990,
      salePrice: 24990,
      costPrice: 20500,
      discountPercentage: 50.01,
    },
    inventory: {
      stock: 10,
      lowStockThreshold: 2,
      reorderPoint: 5,
      trackInventory: true,
      soldCount: 0,
    },
    images: [
      {
        url: 'https://m.media-amazon.com/images/I/81sJLMJQYdL._SL1500_.jpg',
        alt: 'LG 43 Inch 4K Smart TV Front View',
        isPrimary: true,
      },
      {
        url: 'https://m.media-amazon.com/images/I/71UEnmwViCL._SL1500_.jpg',
        alt: 'LG 43 Inch 4K Display Angle',
        isPrimary: false,
      },
      {
        url: 'https://m.media-amazon.com/images/I/61tDktEggtL._SL1500_.jpg',
        alt: 'LG α5 AI Processor Gen6 Features',
        isPrimary: false,
      },
      {
        url: 'https://m.media-amazon.com/images/I/71rlzAFhoIL._SL1500_.jpg',
        alt: 'LG webOS Smart Interface',
        isPrimary: false,
      },
      {
        url: 'https://m.media-amazon.com/images/I/81dkfkN+b6L._SL1500_.jpg',
        alt: 'LG Remote and Connectivity Ports',
        isPrimary: false,
      },
    ],
    specifications: [
      { key: 'Screen Size', value: '43 Inches (108 cm)' },
      { key: 'Display Technology', value: '4K Ultra HD LED' },
      { key: 'Resolution', value: '3840 x 2160 Pixels' },
      { key: 'Refresh Rate', value: '60 Hz' },
      { key: 'Image Processor', value: 'α5 AI Processor 4K Gen6' },
      { key: 'High Dynamic Range', value: 'HDR10, HLG' },
      { key: 'Audio Output', value: '20 Watts (AI Sound Virtual 5.1 Up-mix)' },
      { key: 'Operating System', value: 'webOS Smart TV' },
      { key: 'RAM / Storage', value: '1.5 GB RAM / 8 GB Storage' },
      { key: 'HDMI Ports', value: '3 HDMI Ports (eARC, ALLM)' },
      { key: 'USB Ports', value: '2 USB Ports' },
      { key: 'Wireless Connectivity', value: 'Wi-Fi Built-in, Bluetooth 5.0' },
      { key: 'Warranty', value: '1 Year Comprehensive Warranty by LG' },
    ],
    highlights: [
      'Vibrant 4K Ultra HD LED panel with slim-bezel aesthetics',
      'α5 AI Processor 4K Gen6 for real-time picture and audio upscaling',
      'webOS platform with personalized profiles and unlimited OTT apps',
      'AI Sound with virtual 5.1 surround sound upmixing for crystal clear audio',
      'Game Optimizer dashboard with ALLM low-latency responsiveness',
      'Apple AirPlay 2, HomeKit, and ThinQ AI smart home ecosystem',
    ],
    tags: ['lg', '4k tv', 'smart tv', '43 inch tv', 'webos', 'ai sound'],
    keywords: ['lg 43 inch tv', '43ur7500psc', 'lg 4k led tv', 'webos tv', 'dream electronics'],
    shipping: { weight: 9.2, unit: 'kg', freeShipping: true, shippingFee: 0 },
    hsnCode: '85287200',
  },
  {
    name: 'Xiaomi 108 cm (43 inches) X Series 4K Ultra HD Smart Google LED TV L43M8-A2IN',
    shortDescription: 'Xiaomi 43" 4K Smart TV with Dolby Vision, 30W Dolby Audio, Google TV and Bezel-less Design',
    description: `Experience exceptional 4K entertainment with the Xiaomi 43-inch X Series Ultra HD Smart Google TV. Featuring 4K Dolby Vision, HDR10, and Xiaomi's proprietary Vivid Picture Engine, this TV delivers true-to-life color depth, brilliant highlights, and incredible contrast across over a billion colors.

Housed in a premium metallic bezel-less body with a 97% screen-to-body ratio, it transforms your living room into an immersive home cinema. The powerful 30W speaker array with Dolby Audio and DTS Virtual:X provides room-filling acoustic realism.

Powered by Google TV, it unites movies, shows, live TV, and your favorite subscription apps into a unified home screen. With 2GB RAM and 8GB high-speed internal storage, app switching is rapid and responsive. Complete with dual-band Wi-Fi, Chromecast built-in, and Bluetooth voice remote.`,
    brand: 'Xiaomi',
    sku: 'DE-MI-43XSERIES',
    pricing: {
      basePrice: 42999,
      salePrice: 24999,
      costPrice: 19800,
      discountPercentage: 41.86,
    },
    inventory: {
      stock: 10,
      lowStockThreshold: 2,
      reorderPoint: 5,
      trackInventory: true,
      soldCount: 0,
    },
    images: [
      {
        url: 'https://m.media-amazon.com/images/I/71O7sl0kWlL._SL1500_.jpg',
        alt: 'Xiaomi 43 Inch X Series 4K Front View',
        isPrimary: true,
      },
      {
        url: 'https://m.media-amazon.com/images/I/61KevfhN6GL._SL1100_.jpg',
        alt: 'Xiaomi 43 Inch X Series Bezel Less Design',
        isPrimary: false,
      },
      {
        url: 'https://m.media-amazon.com/images/I/61MgKK-M1dL._SL1100_.jpg',
        alt: 'Xiaomi 43 Inch Dolby Vision Features',
        isPrimary: false,
      },
      {
        url: 'https://m.media-amazon.com/images/I/51dFjd1RuxL._SL1100_.jpg',
        alt: 'Xiaomi 43 Inch Sound and Google TV',
        isPrimary: false,
      },
      {
        url: 'https://m.media-amazon.com/images/I/51qDt5UK40L._SL1100_.jpg',
        alt: 'Xiaomi Voice Remote and Ports',
        isPrimary: false,
      },
    ],
    specifications: [
      { key: 'Screen Size', value: '43 Inches (108 cm)' },
      { key: 'Display Technology', value: '4K Dolby Vision LED' },
      { key: 'Resolution', value: '3840 x 2160 Pixels' },
      { key: 'Refresh Rate', value: '60 Hz' },
      { key: 'Image Processor', value: 'Vivid Picture Engine with Quad Core A55' },
      { key: 'High Dynamic Range', value: 'Dolby Vision, HDR10, HLG' },
      { key: 'Audio Output', value: '30 Watts Dolby Audio & DTS Virtual:X' },
      { key: 'Operating System', value: 'Google TV' },
      { key: 'Memory & Storage', value: '2 GB RAM / 8 GB Storage' },
      { key: 'HDMI Ports', value: '3 HDMI Ports (eARC, ALLM)' },
      { key: 'USB Ports', value: '2 USB Ports' },
      { key: 'Wireless Connectivity', value: 'Dual Band Wi-Fi (2.4/5GHz), Bluetooth 5.0' },
      { key: 'Warranty', value: '1 Year Comprehensive + 1 Year Panel Warranty' },
    ],
    highlights: [
      '4K Dolby Vision & HDR10 with Xiaomi Vivid Picture Engine',
      'Sleek metallic bezel-less aesthetic with 97% screen-to-body ratio',
      '30W powerful stereo sound equipped with Dolby Audio and DTS-X',
      'Google TV with personalized watchlist, Kids Profile, and Google Assistant',
      'Smooth performance backed by 2GB RAM and 8GB high-speed ROM',
      'Dual-band Wi-Fi, Bluetooth 5.0, and Auto Low Latency Mode (ALLM)',
    ],
    tags: ['xiaomi', 'mi tv', 'x series', '4k tv', '43 inch tv', 'google tv', 'dolby vision'],
    keywords: ['xiaomi x series', 'mi 43 inch tv', 'l43m8-a2in', '4k google tv', 'dream electronics'],
    shipping: { weight: 7.6, unit: 'kg', freeShipping: true, shippingFee: 0 },
    hsnCode: '85287200',
  },
  {
    name: 'OnePlus 126 cm (50 inches) Y Series 4K Ultra HD Smart Android LED TV 50Y1S Pro',
    shortDescription: 'OnePlus 50" 4K Smart TV with 1 Billion Colors, Gamma Engine, MEMC, 24W Dolby Audio & OnePlus Connect',
    description: `Redefine your viewing experience with the OnePlus 50-inch Y Series 4K Ultra HD Smart Android LED TV (50Y1S Pro). Engineered to showcase 1 billion colors, its 10-bit color display breathes stunning realism into nature documentaries, blockbuster movies, and gaming.

Equipped with the intelligent Gamma Engine featuring MEMC (Motion Estimation, Motion Compensation), fast-paced sports and action sequences remain impeccably sharp without blur or judder. The 24W twin speaker setup features Dolby Audio and Dolby Atmos decoding for clear acoustics.

Seamlessly integrated with OnePlus Connect 2.0, you can effortlessly control your TV, share content, and activate smart sleep detection directly from your smartphone. Featuring Android TV with Google Assistant, Chromecast built-in, and full support for Netflix, Prime Video, and Disney+ Hotstar.`,
    brand: 'OnePlus',
    sku: 'DE-1PLUS-50Y1S',
    pricing: {
      basePrice: 45999,
      salePrice: 32999,
      costPrice: 26000,
      discountPercentage: 28.26,
    },
    inventory: {
      stock: 10,
      lowStockThreshold: 2,
      reorderPoint: 5,
      trackInventory: true,
      soldCount: 0,
    },
    images: [
      {
        url: 'https://m.media-amazon.com/images/I/81I5oICiIzL._SL1500_.jpg',
        alt: 'OnePlus 50 Inch Y Series 4K Front View',
        isPrimary: true,
      },
      {
        url: 'https://m.media-amazon.com/images/I/71dEDeL2WkL._SL1500_.jpg',
        alt: 'OnePlus 50 Inch Y Series Bezel Less Frame',
        isPrimary: false,
      },
      {
        url: 'https://m.media-amazon.com/images/I/71oVhKd-tTL._SL1500_.jpg',
        alt: 'OnePlus 50 Inch 1 Billion Colors Display',
        isPrimary: false,
      },
      {
        url: 'https://m.media-amazon.com/images/I/71va59Rm7HL._SL1500_.jpg',
        alt: 'OnePlus Connect and Audio Features',
        isPrimary: false,
      },
      {
        url: 'https://m.media-amazon.com/images/I/61QXH2faa3L._SL1500_.jpg',
        alt: 'OnePlus Smart Remote and HDMI Ports',
        isPrimary: false,
      },
    ],
    specifications: [
      { key: 'Screen Size', value: '50 Inches (126 cm)' },
      { key: 'Display Technology', value: '4K Ultra HD LED (10-bit, 1 Billion Colors)' },
      { key: 'Resolution', value: '3840 x 2160 Pixels' },
      { key: 'Refresh Rate', value: '60 Hz with MEMC' },
      { key: 'Image Processor', value: 'Gamma Engine with Dynamic Contrast' },
      { key: 'High Dynamic Range', value: 'HDR10+, HDR10, HLG' },
      { key: 'Audio Output', value: '24 Watts with Dolby Audio & Dolby Atmos Decoding' },
      { key: 'Operating System', value: 'Android TV with OxygenPlay 2.0' },
      { key: 'RAM / Storage', value: '2 GB RAM / 8 GB Storage' },
      { key: 'HDMI Ports', value: '3 HDMI Ports (HDMI 2.1 with ALLM)' },
      { key: 'USB Ports', value: '2 USB Ports' },
      { key: 'Wireless Connectivity', value: 'Dual Band Wi-Fi, Bluetooth 5.0' },
      { key: 'Warranty', value: '1 Year Comprehensive + 1 Year Panel Warranty' },
    ],
    highlights: [
      '10-bit 4K Ultra HD panel displaying over 1 billion vibrant colors',
      'Gamma Engine with MEMC technology for judder-free action sequences',
      '24W Box Speakers with Dolby Audio and Dolby Atmos decoding',
      'OnePlus Connect 2.0 for smartphone-driven TV control and tracking',
      'Auto Low Latency Mode (ALLM) with sub-10ms response for gaming',
      'Premium bezel-less craftsmanship with sleek, modern profile',
    ],
    tags: ['oneplus', 'y series', '50y1s pro', '4k tv', '50 inch tv', 'android tv', 'memc'],
    keywords: ['oneplus 50 inch tv', '50y1s pro', 'oneplus 4k led tv', 'android tv', 'dream electronics'],
    shipping: { weight: 11.2, unit: 'kg', freeShipping: true, shippingFee: 0 },
    hsnCode: '85287200',
  },
];

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1. Create or Find User
    const sellerEmail = 'dream.electronics@onlineplanet.com';
    let user = await User.findOne({ email: sellerEmail });

    if (!user) {
      console.log('👤 Creating User account for Dream Electronics...');
      const hashedPassword = await bcrypt.hash('DreamElectronics@2026', 10);
      user = await User.create({
        name: 'Dream Electronics',
        email: sellerEmail,
        password: hashedPassword,
        phone: '+91-9876543210',
        role: 'seller',
        isVerified: true,
      });
      console.log('✅ Created User account:', user._id);
    } else {
      console.log('ℹ️  Found existing User account:', user._id);
      user.role = 'seller';
      user.isVerified = true;
      await user.save();
    }

    // 2. Create or Find Seller Profile
    let seller = await Seller.findOne({ userId: user._id });

    if (!seller) {
      console.log('🏢 Creating Seller profile for Dream Electronics...');
      seller = await Seller.create({
        userId: user._id,
        personalDetails: {
          fullName: 'Dream Electronics',
          email: sellerEmail,
          phone: '+91-9876543210',
          residentialAddress: {
            addressLine1: 'Plot 42, Electronic City Phase 1',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560100',
            country: 'IN',
          },
        },
        businessInfo: {
          businessName: 'Dream Electronics',
          gstin: '29AADCD1234F1Z8',
          pan: 'AADCD1234F',
          businessType: 'proprietorship',
          businessCategory: 'electronics',
          establishedYear: 2021,
          country: 'IN',
        },
        pickupAddress: {
          addressLine1: 'Plot 42, Electronic City Phase 1',
          landmark: 'Near Tech Hub',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560100',
          country: 'IN',
          isDefault: true,
        },
        storeInfo: {
          storeName: 'Dream Electronics',
          storeSlug: 'dream-electronics',
          storeDescription:
            'Dream Electronics is an authorized premium retailer of high-definition Smart TVs, audio systems, and modern home entertainment solutions from top global brands like Sony, Samsung, LG, Xiaomi, and OnePlus.',
          storeCategories: ['Electronics', 'TV & Entertainment', 'Smart TV'],
          storeLogo: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=300',
          storeBanner: 'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=1200',
          customerSupportEmail: sellerEmail,
          customerSupportPhone: '+91-9876543210',
          returnPolicy: '7 Days replacement warranty for manufacturing defects.',
          shippingPolicy: 'Free express shipping across India with insured delivery.',
          termsAndConditions: 'Standard 1-year brand warranty on all electronics goods.',
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
          totalReviews: 124,
        },
      });
      console.log('✅ Created Seller profile:', seller._id);
    } else {
      console.log('ℹ️  Found existing Seller profile:', seller._id);
      seller.verificationStatus = 'approved';
      seller.verificationSteps = {
        emailVerified: true,
        phoneVerified: true,
        documentsVerified: true,
        bankVerified: true,
        addressVerified: true,
      };
      await seller.save();
    }

    // 3. Upsert 5 TV Products
    console.log('\n📦 Seeding 5 Smart TV Products...');

    const categoryName = 'Smart TV';
    const categoryPath = 'electronics/tv-entertainment/smart-tv';
    const subCategory = 'TV & Entertainment';

    for (const tv of tvProducts) {
      const productPayload = {
        ...tv,
        sellerId: seller._id,
        category: categoryName,
        categoryPath: categoryPath,
        subCategory: subCategory,
        isActive: true,
        isApproved: true,
        isFeatured: true,
        isDraft: false,
      };

      const existingProduct = await Product.findOne({ sku: tv.sku });
      if (existingProduct) {
        await Product.updateOne({ sku: tv.sku }, { $set: productPayload });
        console.log(`🔄 Updated product: ${tv.name} (SKU: ${tv.sku})`);
      } else {
        await Product.create(productPayload);
        console.log(`✨ Inserted product: ${tv.name} (SKU: ${tv.sku})`);
      }
    }

    console.log('\n=======================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=======================================');
    console.log(`👤 Seller: ${seller.storeInfo.storeName} (${sellerEmail})`);
    console.log(`🔑 Login Password: DreamElectronics@2026`);
    console.log(`🆔 Seller ID: ${seller._id}`);
    console.log(`🆔 User ID: ${user._id}`);
    console.log(`📺 TV Products Added: ${tvProducts.length}`);

    await mongoose.connection.close();
    console.log('🔌 Database connection closed\n');
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seed();
