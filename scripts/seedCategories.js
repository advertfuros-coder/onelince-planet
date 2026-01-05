// scripts/seedCategories.js - Seed hierarchical categories
import dotenv from 'dotenv';
import mongoose from "mongoose";
import Category from "../src/lib/db/models/Category.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

const categoriesData = [
  // LEVEL 1: Main Categories
  {
    name: "Fashion",
    slug: "fashion",
    icon: "Tag",
    level: 1,
    parentId: null,
    children: [
      // LEVEL 2: Departments
      {
        name: "Men",
        slug: "men",
        icon: "User",
        level: 2,
        children: [
          // LEVEL 3: Product Types
          { name: "T-Shirts", slug: "t-shirts", level: 3 },
          { name: "Shirts", slug: "shirts", level: 3 },
          { name: "Jeans", slug: "jeans", level: 3 },
          { name: "Shorts", slug: "shorts", level: 3 },
          { name: "Kurtas", slug: "kurtas-men", level: 3 },
          { name: "Shoes", slug: "shoes-men", level: 3 },
        ],
      },
      {
        name: "Women",
        slug: "women",
        icon: "User",
        level: 2,
        children: [
          { name: "Dresses", slug: "dresses", level: 3 },
          { name: "Tops", slug: "tops", level: 3 },
          { name: "Kurtas", slug: "kurtas-women", level: 3 },
          { name: "Sarees", slug: "sarees", level: 3 },
          { name: "Handbags", slug: "handbags", level: 3 },
          { name: "Shoes", slug: "shoes-women", level: 3 },
        ],
      },
      {
        name: "Kids",
        slug: "kids",
        icon: "Baby",
        level: 2,
        children: [
          { name: "Boys", slug: "boys", level: 3 },
          { name: "Girls", slug: "girls", level: 3 },
          { name: "Infants", slug: "infants", level: 3 },
        ],
      },
    ],
  },
  {
    name: "Electronics",
    slug: "electronics",
    icon: "Zap",
    level: 1,
    parentId: null,
    requiresApproval: true, // Electronics require approval
    children: [
      {
        name: "Headphones",
        slug: "headphones",
        level: 2,
        children: [
          { name: "TWS (True Wireless)", slug: "tws", level: 3 },
          { name: "In-Ear", slug: "in-ear", level: 3 },
          { name: "Wired", slug: "wired-headphones", level: 3 },
          { name: "Over-Ear", slug: "over-ear", level: 3 },
        ],
      },
      {
        name: "Smartphones",
        slug: "smartphones",
        level: 2,
        children: [
          { name: "Android", slug: "android", level: 3 },
          { name: "iPhone", slug: "iphone", level: 3 },
          { name: "Gaming Phones", slug: "gaming-phones", level: 3 },
        ],
      },
      {
        name: "Laptops",
        slug: "laptops",
        level: 2,
        children: [
          { name: "Gaming Laptops", slug: "gaming-laptops", level: 3 },
          { name: "Business Laptops", slug: "business-laptops", level: 3 },
          { name: "Ultrabooks", slug: "ultrabooks", level: 3 },
        ],
      },
      {
        name: "Accessories",
        slug: "accessories-electronics",
        level: 2,
        children: [
          { name: "Chargers", slug: "chargers", level: 3 },
          { name: "Cases & Covers", slug: "cases-covers", level: 3 },
          { name: "Screen Protectors", slug: "screen-protectors", level: 3 },
        ],
      },
    ],
  },
  {
    name: "Home & Decor",
    slug: "home",
    icon: "Home",
    level: 1,
    parentId: null,
    children: [
      {
        name: "Furniture",
        slug: "furniture",
        level: 2,
        children: [
          { name: "Sofas", slug: "sofas", level: 3 },
          { name: "Beds", slug: "beds", level: 3 },
          { name: "Tables", slug: "tables", level: 3 },
          { name: "Chairs", slug: "chairs", level: 3 },
        ],
      },
      {
        name: "Decor",
        slug: "decor",
        level: 2,
        children: [
          { name: "Wall Art", slug: "wall-art", level: 3 },
          { name: "Lighting", slug: "lighting", level: 3 },
          { name: "Rugs & Carpets", slug: "rugs-carpets", level: 3 },
        ],
      },
      {
        name: "Kitchen",
        slug: "kitchen",
        level: 2,
        children: [
          { name: "Cookware", slug: "cookware", level: 3 },
          { name: "Appliances", slug: "kitchen-appliances", level: 3 },
          { name: "Dinnerware", slug: "dinnerware", level: 3 },
        ],
      },
    ],
  },
  {
    name: "Beauty & Skin",
    slug: "beauty",
    icon: "Sparkles",
    level: 1,
    parentId: null,
    children: [
      {
        name: "Skincare",
        slug: "skincare",
        level: 2,
        children: [
          { name: "Face Wash", slug: "face-wash", level: 3 },
          { name: "Moisturizers", slug: "moisturizers", level: 3 },
          { name: "Serums", slug: "serums", level: 3 },
        ],
      },
      {
        name: "Makeup",
        slug: "makeup",
        level: 2,
        children: [
          { name: "Lipstick", slug: "lipstick", level: 3 },
          { name: "Foundation", slug: "foundation", level: 3 },
          { name: "Eyeshadow", slug: "eyeshadow", level: 3 },
        ],
      },
      {
        name: "Haircare",
        slug: "haircare",
        level: 2,
        children: [
          { name: "Shampoo", slug: "shampoo", level: 3 },
          { name: "Conditioner", slug: "conditioner", level: 3 },
          { name: "Hair Oil", slug: "hair-oil", level: 3 },
        ],
      },
    ],
  },
  {
    name: "Books",
    slug: "books",
    icon: "BookOpen",
    level: 1,
    parentId: null,
    children: [
      {
        name: "Fiction",
        slug: "fiction",
        level: 2,
        children: [
          { name: "Mystery & Thriller", slug: "mystery-thriller", level: 3 },
          { name: "Romance", slug: "romance", level: 3 },
          { name: "Sci-Fi & Fantasy", slug: "sci-fi-fantasy", level: 3 },
        ],
      },
      {
        name: "Non-Fiction",
        slug: "non-fiction",
        level: 2,
        children: [
          { name: "Business", slug: "business-books", level: 3 },
          { name: "Self-Help", slug: "self-help", level: 3 },
          { name: "History", slug: "history-books", level: 3 },
        ],
      },
      {
        name: "Children",
        slug: "children-books",
        level: 2,
        children: [
          { name: "Picture Books", slug: "picture-books", level: 3 },
          { name: "Young Adult", slug: "young-adult", level: 3 },
        ],
      },
    ],
  },
  {
    name: "Health & Fitness",
    slug: "health",
    icon: "Heart",
    level: 1,
    parentId: null,
    children: [
      {
        name: "Supplements",
        slug: "supplements",
        level: 2,
        children: [
          { name: "Protein", slug: "protein", level: 3 },
          { name: "Vitamins", slug: "vitamins", level: 3 },
          { name: "Pre-Workout", slug: "pre-workout", level: 3 },
        ],
      },
      {
        name: "Equipment",
        slug: "equipment",
        level: 2,
        children: [
          { name: "Dumbbells", slug: "dumbbells", level: 3 },
          { name: "Yoga Mats", slug: "yoga-mats", level: 3 },
          { name: "Resistance Bands", slug: "resistance-bands", level: 3 },
        ],
      },
      {
        name: "Wearables",
        slug: "wearables",
        level: 2,
        children: [
          { name: "Fitness Trackers", slug: "fitness-trackers", level: 3 },
          { name: "Smart Watches", slug: "smart-watches", level: 3 },
        ],
      },
    ],
  },
];

async function seedCategories() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    console.log("🗑️  Clearing existing categories...");
    await Category.deleteMany({});

    console.log("🌱 Seeding categories...");

    // Helper function to create categories recursively
    async function createCategoryTree(categoryData, parentId = null) {
      const { children, ...categoryFields } = categoryData;

      // Calculate path based on parent
      let path = categoryFields.slug;
      if (parentId) {
        const parent = await Category.findById(parentId);
        if (parent) {
          path = `${parent.path}/${categoryFields.slug}`;
          categoryFields.level = parent.level + 1;
        }
      }

      const category = await Category.create({
        ...categoryFields,
        parentId,
        path,
        isActive: true,
        sortOrder: 0,
      });

      console.log(
        `  ✓ Created: ${category.name} (Level ${category.level}) - ${category.path}`
      );

      // Recursively create children
      if (children && children.length > 0) {
        for (const child of children) {
          await createCategoryTree(child, category._id);
        }
      }

      return category;
    }

    for (const mainCategory of categoriesData) {
      await createCategoryTree(mainCategory);
    }

    const count = await Category.countDocuments();
    console.log(`\n✅ Successfully seeded ${count} categories!`);

    // Display summary
    const level1 = await Category.countDocuments({ level: 1 });
    const level2 = await Category.countDocuments({ level: 2 });
    const level3 = await Category.countDocuments({ level: 3 });

    console.log(`\n📊 Category Breakdown:`);
    console.log(`   Level 1 (Main): ${level1}`);
    console.log(`   Level 2 (Department): ${level2}`);
    console.log(`   Level 3 (Product Type): ${level3}`);
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

seedCategories()
  .then(() => {
    console.log("\n✅ Category seeding completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Category seeding failed:", error);
    process.exit(1);
  });
