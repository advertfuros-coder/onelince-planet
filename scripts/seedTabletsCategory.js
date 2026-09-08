// scripts/seedTabletsCategory.js
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

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

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

async function seedCategory() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // 1. Find or verify Electronics root category
  let elec = await Category.findOne({ slug: 'electronics' });
  if (!elec) {
    elec = await Category.create({
      name: 'Electronics',
      slug: 'electronics',
      icon: 'Smartphone',
      level: 1,
      path: 'electronics',
      commissionRate: 5,
      requiresApproval: false,
      isActive: true,
    });
    console.log('Created Electronics category:', elec._id);
  } else {
    console.log('Found Electronics category:', elec._id);
  }

  // 2. Ensure Tablets & iPads category
  let tabletsCategory = await Category.findOne({ slug: 'tablets-pads' });
  if (!tabletsCategory) {
    tabletsCategory = await Category.create({
      name: 'Tablets & iPads',
      slug: 'tablets-pads',
      icon: 'Tablet',
      parentId: elec._id,
      level: 2,
      path: 'electronics/tablets-pads',
      commissionRate: 5,
      requiresApproval: false,
      isActive: true,
      sortOrder: 2,
    });
    console.log('✅ Created category "Tablets & iPads":', tabletsCategory._id);
  } else {
    tabletsCategory.isActive = true;
    tabletsCategory.name = 'Tablets & iPads';
    tabletsCategory.parentId = elec._id;
    tabletsCategory.path = 'electronics/tablets-pads';
    await tabletsCategory.save();
    console.log('ℹ️  Category "Tablets & iPads" already exists:', tabletsCategory._id);
  }

  await mongoose.connection.close();
  console.log('Finished Category Setup.');
}

seedCategory().catch(err => {
  console.error(err);
  process.exit(1);
});
