// scripts/seedCategories.js - Seed hierarchical categories
import dotenv from "dotenv";
import mongoose from "mongoose";
import Category from "../src/lib/db/models/Category.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in environment variables");
  process.exit(1);
}

const categoriesData = [
  // LEVEL 1: Fashion
  {
    name: "Fashion",
    slug: "fashion",
    icon: "ShoppingBag",
    level: 1,
    children: [
      {
        name: "Men's Clothing",
        slug: "mens-clothing",
        level: 2,
        children: [
          { name: "T-Shirts", slug: "men-tshirts", level: 3 },
          { name: "Shirts", slug: "men-shirts", level: 3 },
          { name: "Jeans", slug: "men-jeans", level: 3 },
          { name: "Trousers", slug: "men-trousers", level: 3 },
          { name: "Jackets", slug: "men-jackets", level: 3 },
          { name: "Suits", slug: "men-suits", level: 3 },
        ],
      },
      {
        name: "Women's Clothing",
        slug: "womens-clothing",
        level: 2,
        children: [
          { name: "Dresses", slug: "women-dresses", level: 3 },
          { name: "Tops & Tees", slug: "women-tops", level: 3 },
          { name: "Jeans", slug: "women-jeans", level: 3 },
          { name: "Skirts", slug: "women-skirts", level: 3 },
          { name: "Sarees", slug: "women-sarees", level: 3 },
          { name: "Kurtas", slug: "women-kurtas", level: 3 },
        ],
      },
      {
        name: "Footwear",
        slug: "footwear",
        level: 2,
        children: [
          { name: "Men's Shoes", slug: "men-shoes", level: 3 },
          { name: "Women's Shoes", slug: "women-shoes", level: 3 },
          { name: "Sneakers", slug: "sneakers", level: 3 },
          { name: "Formal Shoes", slug: "formal-shoes", level: 3 },
          { name: "Sandals", slug: "sandals", level: 3 },
        ],
      },
      {
        name: "Watches",
        slug: "watches",
        level: 2,
        children: [
          { name: "Luxury", slug: "luxury-watches", level: 3 },
          { name: "Smartwatches", slug: "smart-smartwatches", level: 3 },
          { name: "Casual", slug: "casual-watches", level: 3 },
        ],
      },
      {
        name: "Jewelry",
        slug: "jewelry",
        level: 2,
        children: [
          { name: "Necklaces", slug: "necklaces", level: 3 },
          { name: "Earrings", slug: "earrings", level: 3 },
          { name: "Rings", slug: "rings", level: 3 },
          { name: "Bracelets", slug: "bracelets", level: 3 },
        ],
      },
    ],
  },
  // LEVEL 1: Electronics
  {
    name: "Electronics",
    slug: "electronics",
    icon: "Smartphone",
    level: 1,
    requiresApproval: true,
    children: [
      {
        name: "Mobile Phones",
        slug: "mobiles",
        level: 2,
        children: [
          { name: "Smartphones", slug: "smartphones", level: 3 },
          { name: "Feature Phones", slug: "feature-phones", level: 3 },
          { name: "Renewed Mobiles", slug: "renewed-mobiles", level: 3 },
        ],
      },
      {
        name: "Laptops",
        slug: "laptops",
        level: 2,
        children: [
          { name: "Gaming Laptops", slug: "gaming-laptops", level: 3 },
          { name: "Business Laptops", slug: "business-laptops", level: 3 },
          { name: "Thin & Light", slug: "thin-light-laptops", level: 3 },
          { name: "2-in-1 Laptops", slug: "2-in-1-laptops", level: 3 },
        ],
      },
      {
        name: "TV & Entertainment",
        slug: "tv-entertainment",
        level: 2,
        children: [
          { name: "Televisions", slug: "televisions", level: 3 },
          { name: "Smart TV", slug: "smart-tv", level: 3 },
          { name: "Streaming Devices", slug: "streaming-devices", level: 3 },
          { name: "Home Theater", slug: "home-theater", level: 3 },
        ],
      },
      {
        name: "Audio",
        slug: "audio",
        level: 2,
        children: [
          { name: "Headphones", slug: "headphones-all", level: 3 },
          { name: "Speakers", slug: "speakers", level: 3 },
          { name: "TWS Earbuds", slug: "tws-earbuds", level: 3 },
          { name: "Soundbars", slug: "soundbars", level: 3 },
        ],
      },
      {
        name: "Cameras",
        slug: "cameras",
        level: 2,
        children: [
          { name: "DSLR", slug: "dslr-cameras", level: 3 },
          { name: "Mirrorless", slug: "mirrorless-cameras", level: 3 },
          { name: "Action Cameras", slug: "action-cameras", level: 3 },
          { name: "Lenses", slug: "camera-lenses", level: 3 },
        ],
      },
    ],
  },
  // LEVEL 1: Home & Kitchen
  {
    name: "Home & Decor",
    slug: "home",
    icon: "Home",
    level: 1,
    children: [
      {
        name: "Furniture",
        slug: "furniture",
        level: 2,
        children: [
          { name: "Sofas & Couches", slug: "sofas", level: 3 },
          { name: "Beds", slug: "beds", level: 3 },
          { name: "Dining Tables", slug: "dining-tables", level: 3 },
          { name: "Wardrobes", slug: "wardrobes", level: 3 },
          { name: "Office Furniture", slug: "office-furniture", level: 3 },
        ],
      },
      {
        name: "Home Decor",
        slug: "home-decor",
        level: 2,
        children: [
          { name: "Wall Art", slug: "wall-art", level: 3 },
          { name: "Vases", slug: "vases", level: 3 },
          { name: "Clocks", slug: "clocks", level: 3 },
          { name: "Mirrors", slug: "mirrors", level: 3 },
          { name: "Candles", slug: "candles", level: 3 },
        ],
      },
      {
        name: "Kitchen & Dining",
        slug: "kitchen",
        level: 2,
        children: [
          { name: "Cookware", slug: "cookware", level: 3 },
          { name: "Bakeware", slug: "bakeware", level: 3 },
          { name: "Dinnerware", slug: "dinnerware", level: 3 },
          { name: "Cutlery", slug: "cutlery", level: 3 },
          { name: "Storage & Containers", slug: "kitchen-storage", level: 3 },
        ],
      },
      {
        name: "Home Appliances",
        slug: "home-appliances",
        level: 2,
        children: [
          { name: "Vacuum Cleaners", slug: "vacuums", level: 3 },
          { name: "Air Purifiers", slug: "air-purifiers", level: 3 },
          { name: "Fans", slug: "fans", level: 3 },
          { name: "Humidifiers", slug: "humidifiers", level: 3 },
        ],
      },
    ],
  },
  // LEVEL 1: Beauty & Skin
  {
    name: "Beauty & Skin",
    slug: "beauty",
    icon: "Sparkles",
    level: 1,
    children: [
      {
        name: "Skincare",
        slug: "skincare",
        level: 2,
        children: [
          { name: "Face Moisturizers", slug: "face-moisturizers", level: 3 },
          { name: "Cleansers & Toners", slug: "cleansers-toners", level: 3 },
          { name: "Serums & Treatments", slug: "serums-treatments", level: 3 },
          { name: "Sunscreen & SPF", slug: "sunscreen-spf", level: 3 },
          { name: "Face Masks & Peels", slug: "face-masks-peels", level: 3 },
          { name: "Eye Care", slug: "eye-care", level: 3 },
          { name: "Lip Care", slug: "lip-care", level: 3 },
          { name: "Anti-Aging", slug: "anti-aging", level: 3 },
        ],
      },
      {
        name: "Makeup",
        slug: "makeup",
        level: 2,
        children: [
          { name: "Face Makeup", slug: "face-makeup", level: 3 },
          { name: "Eye Makeup", slug: "eye-makeup", level: 3 },
          { name: "Lipsticks & Lip Colors", slug: "lipsticks-lip-colors", level: 3 },
          { name: "Nail Polish & Care", slug: "nail-polish-care", level: 3 },
          { name: "Makeup Tools & Brushes", slug: "makeup-tools", level: 3 },
        ],
      },
      {
        name: "Haircare",
        slug: "haircare",
        level: 2,
        children: [
          { name: "Shampoo & Conditioner", slug: "shampoo-conditioner", level: 3 },
          { name: "Hair Oil & Serum", slug: "hair-oil-serum", level: 3 },
          { name: "Hair Styling Gels & Wax", slug: "hair-styling", level: 3 },
          { name: "Hair Color", slug: "hair-color", level: 3 },
          { name: "Hair & Scalp Treatments", slug: "hair-treatments", level: 3 },
          { name: "Hair Styling Tools", slug: "hair-tools", level: 3 },
        ],
      },
      {
        name: "Fragrances",
        slug: "fragrances",
        level: 2,
        children: [
          { name: "Perfumes (EDP/EDT)", slug: "perfumes", level: 3 },
          { name: "Body Sprays & Deodorants", slug: "deodorants", level: 3 },
          { name: "Colognes & Aftershaves", slug: "colognes", level: 3 },
          { name: "Attars & Oils", slug: "attars", level: 3 },
        ],
      },
      {
        name: "Bath & Body",
        slug: "bath-body",
        level: 2,
        children: [
          { name: "Body Lotions & Creams", slug: "body-lotions", level: 3 },
          { name: "Bath & Shower Gels", slug: "shower-gels", level: 3 },
          { name: "Soaps & Body Scrubs", slug: "soaps-scrubs", level: 3 },
          { name: "Hand & Foot Care", slug: "hand-foot-care", level: 3 },
        ],
      },
      {
        name: "Men's Grooming",
        slug: "mens-grooming",
        level: 2,
        children: [
          { name: "Beard & Moustache Care", slug: "beard-care", level: 3 },
          { name: "Shaving Essentials", slug: "shaving-essentials", level: 3 },
          { name: "Men's Skincare", slug: "mens-skincare", level: 3 },
        ],
      },
      {
        name: "Oral Care",
        slug: "oral-care-dept",
        level: 2,
        children: [
          { name: "Toothpaste", slug: "toothpaste", level: 3 },
          { name: "Toothbrushes", slug: "toothbrushes", level: 3 },
          { name: "Mouthwash", slug: "mouthwash", level: 3 },
          { name: "Floss & Interdental", slug: "floss", level: 3 },
        ],
      },
    ],
  },
  // LEVEL 1: Sports & Fitness
  {
    name: "Sports & Fitness",
    slug: "health",
    icon: "Heart",
    level: 1,
    children: [
      {
        name: "Fitness Equipment",
        slug: "fitness-equipment",
        level: 2,
        children: [
          { name: "Treadmills", slug: "treadmills", level: 3 },
          { name: "Dumbbells", slug: "dumbbells", level: 3 },
          { name: "Yoga Mats", slug: "yoga-mats", level: 3 },
          { name: "Resistance Bands", slug: "resistance-bands", level: 3 },
        ],
      },
      {
        name: "Outdoor Sports",
        slug: "outdoor-sports",
        level: 2,
        children: [
          { name: "Cycling", slug: "cycling", level: 3 },
          { name: "Camping & Hiking", slug: "camping-hiking", level: 3 },
          { name: "Running", slug: "running", level: 3 },
          { name: "Swimming", slug: "swimming", level: 3 },
        ],
      },
      {
        name: "Team Sports",
        slug: "team-sports",
        level: 2,
        children: [
          { name: "Cricket", slug: "cricket", level: 3 },
          { name: "Football", slug: "football", level: 3 },
          { name: "Basketball", slug: "basketball", level: 3 },
          { name: "Badminton", slug: "badminton", level: 3 },
        ],
      },
      {
        name: "Sports Nutrition",
        slug: "sports-nutrition",
        level: 2,
        children: [
          { name: "Whey Protein", slug: "whey-protein", level: 3 },
          { name: "Vitamins", slug: "vitamins-supplements", level: 3 },
          { name: "Creatine", slug: "creatine", level: 3 },
        ],
      },
    ],
  },
  // LEVEL 1: Baby & Toys
  {
    name: "Baby & Toys",
    slug: "baby-toys",
    icon: "Baby",
    level: 1,
    children: [
      {
        name: "Baby Care",
        slug: "baby-care",
        level: 2,
        children: [
          { name: "Diapers", slug: "diapers", level: 3 },
          { name: "Baby Wipes", slug: "baby-wipes", level: 3 },
          { name: "Baby Bath", slug: "baby-bath", level: 3 },
          { name: "Baby Food", slug: "baby-food", level: 3 },
        ],
      },
      {
        name: "Toys",
        slug: "toys",
        level: 2,
        children: [
          { name: "Action Figures", slug: "action-figures", level: 3 },
          { name: "Dolls", slug: "dolls", level: 3 },
          { name: "Puzzles", slug: "puzzles", level: 3 },
          { name: "Education Toys", slug: "education-toys", level: 3 },
          { name: "Remote Control", slug: "rc-toys", level: 3 },
        ],
      },
      {
        name: "Baby Gear",
        slug: "baby-gear",
        level: 2,
        children: [
          { name: "Strollers", slug: "strollers", level: 3 },
          { name: "Car Seats", slug: "car-seats", level: 3 },
          { name: "Baby Carriers", slug: "baby-carriers", level: 3 },
        ],
      },
    ],
  },
  // LEVEL 1: Groceries
  {
    name: "Groceries",
    slug: "groceries",
    icon: "ShoppingCart",
    level: 1,
    children: [
      {
        name: "Beverages",
        slug: "beverages",
        level: 2,
        children: [
          { name: "Coffee", slug: "coffee", level: 3 },
          { name: "Tea", slug: "tea", level: 3 },
          { name: "Soft Drinks", slug: "soft-drinks", level: 3 },
          { name: "Juices", slug: "juices", level: 3 },
        ],
      },
      {
        name: "Snacks",
        slug: "snacks",
        level: 2,
        children: [
          { name: "Chips & Crisps", slug: "chips", level: 3 },
          { name: "Biscuits", slug: "biscuits", level: 3 },
          { name: "Chocolates", slug: "chocolates", level: 3 },
          { name: "Nuts & Seeds", slug: "nuts-seeds", level: 3 },
        ],
      },
      {
        name: "Pantry Staples",
        slug: "pantry-staples",
        level: 2,
        children: [
          { name: "Rice & Grains", slug: "rice-grains", level: 3 },
          { name: "Cooking Oil", slug: "cooking-oil", level: 3 },
          { name: "Spices", slug: "spices", level: 3 },
          { name: "Pasta & Noodles", slug: "pasta-noodles", level: 3 },
        ],
      },
    ],
  },
  // LEVEL 1: Automotive
  {
    name: "Automotive",
    slug: "automotive",
    icon: "Zap",
    level: 1,
    children: [
      {
        name: "Car Accessories",
        slug: "car-accessories",
        level: 2,
        children: [
          { name: "Interior Accessories", slug: "car-interior", level: 3 },
          { name: "Exterior Accessories", slug: "car-exterior", level: 3 },
          { name: "Car Electronics", slug: "car-electronics", level: 3 },
        ],
      },
      {
        name: "Car Care",
        slug: "car-care",
        level: 2,
        children: [
          { name: "Cleaning Kits", slug: "car-cleaning", level: 3 },
          { name: "Polishes & Wax", slug: "car-polish", level: 3 },
        ],
      },
      {
        name: "Tools & Equipment",
        slug: "auto-tools",
        level: 2,
        children: [
          { name: "Tire Gauges", slug: "tire-gauges", level: 3 },
          { name: "Jump Starters", slug: "jump-starters", level: 3 },
        ],
      },
    ],
  },
  // LEVEL 1: Books
  {
    name: "Books",
    slug: "books",
    icon: "BookOpen",
    level: 1,
    children: [
      {
        name: "Literature & Fiction",
        slug: "fiction",
        level: 2,
        children: [
          { name: "Contemporary Fiction", slug: "contemporary-fiction", level: 3 },
          { name: "Classics", slug: "classics", level: 3 },
          { name: "Mystery & Thriller", slug: "mystery-thriller", level: 3 },
        ],
      },
      {
        name: "Academic & Science",
        slug: "academic",
        level: 2,
        children: [
          { name: "Textbooks", slug: "textbooks", level: 3 },
          { name: "Engineering", slug: "engineering-books", level: 3 },
          { name: "Medicine", slug: "medicine-books", level: 3 },
        ],
      },
      {
        name: "Self-Help",
        slug: "self-help",
        level: 2,
        children: [
          { name: "Personal Finance", slug: "personal-finance-books", level: 3 },
          { name: "Spirituality", slug: "spirituality-books", level: 3 },
        ],
      },
    ],
  },
  // LEVEL 1: Pet Supplies
  {
    name: "Pet Supplies",
    slug: "pets",
    icon: "Heart",
    level: 1,
    children: [
      {
        name: "Dogs",
        slug: "dog-supplies",
        level: 2,
        children: [
          { name: "Dog Food", slug: "dog-food", level: 3 },
          { name: "Dog Toys", slug: "dog-toys", level: 3 },
          { name: "Beds & Furniture", slug: "dog-beds", level: 3 },
        ],
      },
      {
        name: "Cats",
        slug: "cat-supplies",
        level: 2,
        children: [
          { name: "Cat Food", slug: "cat-food", level: 3 },
          { name: "Cat Litter", slug: "cat-litter", level: 3 },
        ],
      },
    ],
  },
  // LEVEL 1: Office Supplies
  {
    name: "Office Supplies",
    slug: "office",
    icon: "BookOpen",
    level: 1,
    children: [
      {
        name: "Stationery",
        slug: "stationery",
        level: 2,
        children: [
          { name: "Pens & Pencils", slug: "pens-pencils", level: 3 },
          { name: "Notebooks", slug: "notebooks", level: 3 },
        ],
      },
      {
        name: "Office Electronics",
        slug: "office-electronics",
        level: 2,
        children: [
          { name: "Printers", slug: "printers", level: 3 },
          { name: "Scanners", slug: "scanners", level: 3 },
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
        `  ✓ Created: ${category.name} (Level ${category.level}) - ${category.path}`,
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
