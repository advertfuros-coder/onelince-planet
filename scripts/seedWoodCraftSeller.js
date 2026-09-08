// scripts/seedWoodCraftSeller.js
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
        default: 'pvt_ltd',
      },
      businessCategory: {
        type: String,
        default: 'furniture',
      },
      establishedYear: { type: Number, default: 2020 },
      country: { type: String, default: 'IN' },
    },
    storeInfo: {
      storeName: { type: String, required: true, trim: true },
      storeDescription: { type: String, default: '' },
      storeLogo: { type: String, default: '' },
      storeBanner: { type: String, default: '' },
      storeSlug: { type: String, required: true, unique: true, lowercase: true },
      storeCategories: [String],
      returnPolicy: { type: String, default: '10-day replacement for damaged or defective items.' },
      shippingPolicy: { type: String, default: 'Pan-India white glove doorstep delivery with free professional assembly.' },
      termsAndConditions: { type: String, default: 'All furniture crafted from seasoned hardwood with standard 3-5 year structural warranty.' },
      customerSupportEmail: String,
      customerSupportPhone: String,
    },
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      branchName: String,
      accountType: { type: String, enum: ['savings', 'current'], default: 'current' },
      isVerified: { type: Boolean, default: true },
    },
    verification: {
      status: {
        type: String,
        enum: ['pending', 'in_review', 'approved', 'rejected', 'suspended'],
        default: 'approved',
      },
      emailVerified: { type: Boolean, default: true },
      phoneVerified: { type: Boolean, default: true },
      documentsVerified: { type: Boolean, default: true },
      bankVerified: { type: Boolean, default: true },
      addressVerified: { type: Boolean, default: true },
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'starter', 'professional', 'enterprise'],
        default: 'enterprise',
      },
      status: {
        type: String,
        enum: ['active', 'cancelled', 'expired', 'trial'],
        default: 'active',
      },
      startDate: { type: Date, default: Date.now },
      endDate: { type: Date, default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
      autoRenew: { type: Boolean, default: true },
    },
    subscriptionPlan: { type: String, default: 'enterprise' },
    verificationStatus: { type: String, default: 'approved' },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Seller = mongoose.models.Seller || mongoose.model('Seller', sellerSchema);

async function seedSeller() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    const sellerEmail = 'woodcraft.living@onlineplanet.com';
    const rawPassword = 'WoodCraft@2026';

    // 1. Ensure User
    let user = await User.findOne({ email: sellerEmail });
    const hashedPassword = await bcrypt.hash(rawPassword, 12);

    if (!user) {
      user = await User.create({
        name: 'WoodCraft Living',
        email: sellerEmail,
        password: hashedPassword,
        phone: '+91-9876543222',
        role: 'seller',
        isVerified: true,
      });
      console.log('✅ Created User:', user._id);
    } else {
      user.password = hashedPassword;
      user.role = 'seller';
      user.isVerified = true;
      await user.save();
      console.log('ℹ️ Updated existing User:', user._id);
    }

    // 2. Ensure Seller Profile
    let seller = await Seller.findOne({ userId: user._id });
    const sellerData = {
      userId: user._id,
      personalDetails: {
        fullName: 'WoodCraft Living',
        email: sellerEmail,
        phone: '+91-9876543222',
        residentialAddress: {
          addressLine1: 'Plot 108, Furnishing Valley Industrial Estate',
          addressLine2: 'Whitefield Main Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560066',
          country: 'IN',
        },
      },
      businessInfo: {
        businessName: 'WoodCraft Living Pvt. Ltd.',
        gstin: '29AAACW9876K1Z2',
        pan: 'AAACW9876K',
        businessType: 'pvt_ltd',
        businessCategory: 'furniture',
        establishedYear: 2020,
        country: 'IN',
      },
      storeInfo: {
        storeName: 'WoodCraft Living',
        storeDescription: 'WoodCraft Living is an artisanal and modern furniture studio crafting premium solid wood sofas, luxury king and queen beds, ergonomic work desks, and designer dining sets for contemporary Indian homes.',
        storeLogo: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
        storeBanner: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200',
        storeSlug: 'woodcraft-living',
        storeCategories: ['Home & Decor', 'Furniture', 'Sofas & Couches', 'Beds', 'Dining Tables', 'Wardrobes', 'Office Furniture'],
        returnPolicy: '10-day replacement for transit damage or manufacturing defects.',
        shippingPolicy: 'Free insured white-glove doorstep delivery and free assembly across all major tier 1 and tier 2 cities in India.',
        termsAndConditions: 'All solid Sheesham and teak furniture comes with a 5-year structural warranty against termite infestation and wood warping.',
        customerSupportEmail: 'woodcraft.living@onlineplanet.com',
        customerSupportPhone: '+91-9876543222',
      },
      bankDetails: {
        accountHolderName: 'WoodCraft Living Pvt. Ltd.',
        accountNumber: '98765432109876',
        ifscCode: 'HDFC0001234',
        bankName: 'HDFC Bank',
        branchName: 'Whitefield Bengaluru',
        accountType: 'current',
        isVerified: true,
      },
      verification: {
        status: 'approved',
        emailVerified: true,
        phoneVerified: true,
        documentsVerified: true,
        bankVerified: true,
        addressVerified: true,
      },
      subscription: {
        plan: 'enterprise',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        autoRenew: true,
      },
      subscriptionPlan: 'enterprise',
      verificationStatus: 'approved',
    };

    if (!seller) {
      seller = await Seller.create(sellerData);
      console.log('✅ Created Seller Profile:', seller._id);
    } else {
      Object.assign(seller, sellerData);
      await seller.save();
      console.log('ℹ️ Updated existing Seller Profile:', seller._id);
    }

    console.log('\n=======================================');
    console.log('🎉 SELLER SETUP SUCCESSFUL!');
    console.log('=======================================');
    console.log(`Store Name: ${seller.storeInfo.storeName}`);
    console.log(`Email (Login ID): ${user.email}`);
    console.log(`Password: ${rawPassword}`);
    console.log(`Seller ID: ${seller._id}`);
    console.log(`User ID: ${user._id}`);
    console.log(`Status: ${seller.verification.status}`);
    console.log(`Plan: ${seller.subscription.plan}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error seeding seller:', err);
    process.exit(1);
  }
}

seedSeller();
