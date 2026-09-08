// scripts/seedDreamElectronicsAC.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
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
        default: 'pvt_ltd',
      },
      businessCategory: {
        type: String,
        default: 'electronics',
      },
      establishedYear: { type: Number, default: 2021 },
      country: { type: String, default: 'IN' },
    },
    storeInfo: {
      storeName: { type: String, required: true, trim: true },
      storeSlug: { type: String, required: true, unique: true, lowercase: true },
      storeDescription: String,
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
      totalReviews: { type: Number, default: 142 },
    },
  },
  { timestamps: true }
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    icon: String,
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    level: { type: Number, default: 1 },
    path: { type: String, required: true },
    commissionRate: { type: Number, default: 5 },
    requiresApproval: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    productCount: { type: Number, default: 0 },
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
      lowStockThreshold: { type: Number, default: 3 },
      reorderPoint: { type: Number, default: 5 },
      trackInventory: { type: Boolean, default: true },
      soldCount: { type: Number, default: 0 },
    },
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
    highlights: [String],
    shipping: {
      weight: Number,
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
      average: { type: Number, default: 4.6 },
      count: { type: Number, default: 84 },
    },
    tags: [String],
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: true },
    isDraft: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Seller = mongoose.models.Seller || mongoose.model('Seller', sellerSchema);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    const sellerEmail = 'dream.electronics@onlineplanet.com';
    const rawPassword = 'DreamElectronics@2026';

    // 1. Ensure User
    let user = await User.findOne({ email: sellerEmail });
    const hashedPassword = await bcrypt.hash(rawPassword, 12);

    if (!user) {
      user = await User.create({
        name: 'Dream Electronics',
        email: sellerEmail,
        password: hashedPassword,
        phone: '+91-9876543210',
        role: 'seller',
        isVerified: true,
      });
      console.log('✅ Created User:', user._id);
    } else {
      user.password = hashedPassword;
      user.role = 'seller';
      user.isVerified = true;
      await user.save();
      console.log('ℹ️  Updated existing User:', user._id);
    }

    // 2. Ensure Seller Profile
    let seller = await Seller.findOne({ userId: user._id });
    if (!seller) {
      seller = await Seller.create({
        userId: user._id,
        personalDetails: {
          fullName: 'Dream Electronics',
          email: sellerEmail,
          phone: '+91-9876543210',
          residentialAddress: {
            addressLine1: 'Shop 42, Electronic City Commercial Complex',
            addressLine2: 'Phase 1, Hosur Road',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560100',
            country: 'IN',
          },
        },
        businessInfo: {
          businessName: 'Dream Electronics Pvt. Ltd.',
          gstin: '29AABCD1234E1Z5',
          pan: 'AABCD1234E',
          businessType: 'pvt_ltd',
          businessCategory: 'electronics',
          establishedYear: 2021,
          country: 'IN',
        },
        storeInfo: {
          storeName: 'Dream Electronics',
          storeSlug: 'dream-electronics',
          storeDescription: 'Your premier destination for next-generation smart home appliances, 2025 & 2026 energy-efficient inverter air conditioners, smart TVs, and premium electronics.',
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
          average: 4.9,
          totalReviews: 142,
        },
      });
      console.log('✅ Created Seller profile:', seller._id);
    } else {
      seller.storeInfo.storeName = 'Dream Electronics';
      seller.storeInfo.storeSlug = 'dream-electronics';
      seller.verificationStatus = 'approved';
      seller.subscriptionPlan = 'enterprise';
      seller.verificationSteps = {
        emailVerified: true,
        phoneVerified: true,
        documentsVerified: true,
        bankVerified: true,
        addressVerified: true,
      };
      await seller.save();
      console.log('ℹ️  Updated Seller profile:', seller._id);
    }

    // 3. Ensure Category
    let acCategory = await Category.findOne({ slug: 'air-conditioners' });
    const homeAppCategory = await Category.findOne({ slug: 'home-appliances' });

    if (!acCategory) {
      acCategory = await Category.create({
        name: 'Air Conditioners',
        slug: 'air-conditioners',
        path: 'home/home-appliances/air-conditioners',
        parentId: homeAppCategory ? homeAppCategory._id : null,
        level: 3,
        commissionRate: 5,
        requiresApproval: false,
        isActive: true,
        sortOrder: 1,
        productCount: 20,
      });
      console.log('✅ Created Category "Air Conditioners":', acCategory._id);
    } else {
      console.log('ℹ️  Found Category "Air Conditioners":', acCategory._id);
    }

    // 4. Load Verified 2025/2026 AC Products
    const verifiedDataPath = path.join(__dirname, 'verified_2025_2026_acs.json');
    if (!fs.existsSync(verifiedDataPath)) {
      throw new Error('verified_2025_2026_acs.json not found! Run scraper first.');
    }
    const rawProducts = JSON.parse(fs.readFileSync(verifiedDataPath, 'utf8'));
    console.log(`\n📦 Seeding ${rawProducts.length} verified 2025 & 2026 Air Conditioners...`);

    let seededCount = 0;

    for (const [idx, p] of rawProducts.entries()) {
      // Filter out badge/icon images, ensure high quality
      const cleanImageUrls = p.images.filter(img => !img.includes('41LbSThP8fL'));
      
      const formattedImages = cleanImageUrls.map((url, imgIdx) => ({
        url,
        alt: `${p.title} - Official View ${imgIdx + 1}`,
        isPrimary: imgIdx === 0,
      }));

      // High-converting product description
      const description = `Experience peak cooling performance and revolutionary energy savings with the ${p.title}. Designed for extreme Indian summers, this ${p.modelYear} flagship split air conditioner combines advanced inverter technology with smart convertible cooling modes to keep your living space comfortably chilled even at scorching ambient temperatures up to 55°C.

### Key Highlights & Innovations:
* **${p.modelYear} Next-Gen Energy Efficiency**: Certified under the latest Bureau of Energy Efficiency (BEE) standards with ultra-efficient power consumption and high ISEER ratings.
* **100% Pure Inner Grooved Copper Condenser**: Ensures superior heat transfer efficiency, rust resistance, and exceptional durability in high-humidity coastal and urban environments.
* **Advanced Dual Filtration System**: Equipped with high-density anti-bacterial and PM 2.5 air filtration that traps microscopic airborne dust, allergens, and pet dander for crisp, clean indoor air.
* **Convertible Multi-Stage Cooling Modes**: Flexibly adjust cooling tonnage (from 40% to 110% capacity) to optimize electricity consumption based on room occupancy and weather.
* **Stabilizer-Free Operation & Extreme Temperature Cooling**: Engineered to run smoothly across voltage fluctuations (145V - 290V) with heavy-duty twin rotary inverter compressor.
* **Eco-Friendly R32 Green Refrigerant**: Zero ozone depletion potential (ODP) and significantly lower global warming potential (GWP) for responsible cooling.

### What's in the Box:
1 x Indoor Unit (IDU), 1 x Outdoor Unit (ODU), 1 x Ergonomic Backlit Remote Controller with AAA Batteries, 1 x Pure Copper Interconnecting Pipe Kit (3 Meters), 1 x Heavy Duty Installation Plate, 1 x Detailed User Manual & Warranty Card.`;

      const shortDescription = `${p.brand} ${p.modelYear} Split Inverter Air Conditioner with 100% Copper Coil, Multi-Stage Convertible Cooling, High Ambient Performance & Anti-Dust Filtration.`;

      // Brand-specific and feature tags
      const tags = [
        'ac',
        'air conditioner',
        'split ac',
        'inverter ac',
        p.brand.toLowerCase(),
        `${p.brand.toLowerCase()} ac`,
        `${p.modelYear} model`,
        '2026 model ac',
        '2025 model ac',
        'home appliances',
        'copper condenser',
        'convertible ac',
        'dream electronics'
      ];

      const discountPercentage = Math.round(((p.basePrice - p.salePrice) / p.basePrice) * 100);

      const productPayload = {
        sellerId: seller._id,
        name: p.title,
        description: description,
        shortDescription: shortDescription,
        category: acCategory ? acCategory._id : 'Air Conditioners',
        categoryPath: 'home/home-appliances/air-conditioners',
        subCategory: 'Air Conditioners',
        brand: p.brand,
        sku: `DE-AC-${p.asin}`,
        pricing: {
          basePrice: p.basePrice,
          salePrice: p.salePrice,
          costPrice: Math.round(p.salePrice * 0.82),
          discountPercentage: discountPercentage > 0 ? discountPercentage : 25,
        },
        inventory: {
          stock: 12 + (idx % 6),
          lowStockThreshold: 3,
          reorderPoint: 5,
          trackInventory: true,
          soldCount: 8 + (idx * 3),
        },
        images: formattedImages,
        specifications: p.specs && p.specs.length > 0 ? p.specs : [
          { key: 'Brand', value: p.brand },
          { key: 'Model Year', value: p.modelYear },
          { key: 'Cooling Technology', value: 'Inverter Split AC' },
          { key: 'Condenser Coil', value: '100% Copper' },
          { key: 'Special Features', value: 'Convertible Modes, PM 2.5 Filter, High Ambient Cooling' },
          { key: 'Refrigerant', value: 'R-32 Eco Friendly' }
        ],
        highlights: p.features && p.features.length >= 3 ? p.features : [
          `${p.modelYear} New BEE Star Rated Split Inverter AC`,
          '100% Copper Condenser with Anti-Corrosive Protection',
          'Heavy Duty Cooling even at 52°C+ Ambient Temperature',
          'Multi-Stage Convertible Energy Saving Modes',
          'High-Density Dust and Anti-Microbial Air Filtration'
        ],
        shipping: {
          weight: 35,
          unit: 'kg',
          freeShipping: true,
          shippingFee: 0,
        },
        returnPolicy: {
          isReturnable: true,
          returnDuration: 10,
          isReplaceable: true,
          replacementDuration: 10,
        },
        ratings: {
          average: Number((4.4 + ((idx % 6) * 0.1)).toFixed(1)),
          count: 45 + (idx * 14),
        },
        tags: tags,
        isActive: true,
        isApproved: true,
        isFeatured: true,
        isDraft: false,
      };

      const existing = await Product.findOne({ sku: productPayload.sku });
      if (existing) {
        await Product.updateOne({ sku: productPayload.sku }, { $set: productPayload });
        console.log(`🔄 [${idx + 1}/20] Updated: ${p.title.substring(0, 50)}... (${formattedImages.length} photos)`);
      } else {
        await Product.create(productPayload);
        console.log(`✨ [${idx + 1}/20] Inserted: ${p.title.substring(0, 50)}... (${formattedImages.length} photos)`);
      }
      seededCount++;
    }

    console.log('\n=======================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=======================================');
    console.log(`👤 Store: ${seller.storeInfo.storeName} (${sellerEmail})`);
    console.log(`🔑 Login Password: ${rawPassword}`);
    console.log(`🆔 Seller ID: ${seller._id}`);
    console.log(`🏷️ Category: Air Conditioners (home/home-appliances/air-conditioners)`);
    console.log(`❄️ Total AC Products Seeded: ${seededCount}`);
    console.log('=======================================\n');

    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seed();
