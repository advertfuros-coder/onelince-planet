// scripts/cleanAndSeed.js
/**
 * Clean and Seed Database
 * Removes existing test data and creates fresh data
 *
 * Run: node -r dotenv/config scripts/cleanAndSeed.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found");
  process.exit(1);
}

async function cleanAndSeed() {
  console.log("🧹 Cleaning and seeding database...\n");

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to:", mongoose.connection.name);

    // Clean existing data for seller
    console.log("\n🗑️  Cleaning existing test data...");
    const User = mongoose.connection.collection("users");
    const Seller = mongoose.connection.collection("sellers");
    const Product = mongoose.connection.collection("products");

    const existingUser = await User.findOne({
      email: "seller@onlineplanet.ae",
    });
    if (existingUser) {
      await Product.deleteMany({
        sellerId: new mongoose.Types.ObjectId(existingUser._id),
      });
      await Seller.deleteOne({
        userId: new mongoose.Types.ObjectId(existingUser._id),
      });
      await User.deleteOne({ email: "seller@onlineplanet.ae" });
      console.log("✅ Cleaned old data");
    }

    // Create Seller User
    console.log("\n👤 Creating seller user...");
    const hash = await bcrypt.hash("Seller@123456", 10);

    const userResult = await User.insertOne({
      name: "Premium Electronics Store",
      email: "seller@onlineplanet.ae",
      password: hash,
      phone: "+971501234567",
      role: "seller",
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("✅ Created seller user");

    // Create Seller Profile
    console.log("\n🏪 Creating seller profile...");
    const sellerResult = await Seller.insertOne({
      userId: userResult.insertedId,
      businessName: "Premium Electronics Store",
      businessCategory: "electronics",
      businessType: "partnership",
      gstin: "AE12345678901",
      panNumber: "ABCDE1234F",
      bankDetails: {
        accountHolderName: "Premium Electronics",
        accountNumber: "1234567890",
        bankName: "Emirates NBD",
        ifscCode: "ENBD0001234",
        accountType: "current",
      },
      pickupAddress: {
        addressLine1: "Shop 123, Electronics Souk",
        addressLine2: "Deira",
        city: "Dubai",
        state: "Dubai",
        pincode: "00000",
        country: "UAE",
        phone: "+971501234567",
      },
      storeInfo: {
        storeName: "Premium Electronics",
        storeDescription: "Premium electronics in UAE",
        storeLogo: "https://placehold.co/200x200/3B82F6/white?text=PE",
        storeBanner:
          "https://placehold.co/1200x300/1E40AF/white?text=Premium+Electronics",
      },
      isVerified: true,
      verificationStatus: "approved",
      isActive: true,
      subscriptionPlan: "premium",
      commissionRate: 5,
      ratings: { average: 4.5, totalReviews: 150 },
      performance: {
        orderFulfillmentRate: 95,
        customerSatisfactionScore: 4.5,
        responseTime: 24,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("✅ Created seller profile");

    // Create Products
    console.log("\n📦 Creating products...");
    const products = [
      {
        name: "iPhone 15 Pro Max 256GB",
        description:
          "Latest Apple iPhone with A17 Pro chip, titanium design, advanced camera system with 5x optical zoom",
        category: "Smartphones",
        subcategory: "Apple",
        pricing: { mrp: 5499, selling: 5199, costPrice: 4500 },
        inventory: {
          stock: 50,
          sku: `IPH15PM-${Date.now()}`,
          lowStockThreshold: 10,
        },
        images: [
          {
            url: "https://images.unsplash.com/photo-1696446702584-e582fed1e8e8?w=800",
            alt: "iPhone 15 Pro Max",
          },
          {
            url: "https://images.unsplash.com/photo-1678652197950-1c52587e8974?w=800",
            alt: "iPhone 15 Pro Back",
          },
        ],
        specifications: {
          Display: '6.7" Super Retina XDR',
          Processor: "A17 Pro chip",
          Camera: "48MP Main, 12MP Ultra Wide, 12MP Telephoto",
          Storage: "256GB",
          Material: "Titanium",
        },
      },
      {
        name: "Samsung Galaxy S24 Ultra 512GB",
        description:
          "Premium flagship with S Pen, AI-powered camera, stunning AMOLED display, and all-day battery",
        category: "Smartphones",
        subcategory: "Samsung",
        pricing: { mrp: 5299, selling: 4999, costPrice: 4300 },
        inventory: {
          stock: 35,
          sku: `SGS24U-${Date.now()}`,
          lowStockThreshold: 10,
        },
        images: [
          {
            url: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800",
            alt: "Samsung Galaxy S24 Ultra",
          },
          {
            url: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800",
            alt: "Samsung Galaxy Detail",
          },
        ],
        specifications: {
          Display: '6.8" Dynamic AMOLED 2X',
          Processor: "Snapdragon 8 Gen 3",
          Camera: "200MP Main + AI features",
          Storage: "512GB",
          "S Pen": "Included",
        },
      },
      {
        name: "MacBook Air M3 16GB/512GB",
        description:
          "Apple MacBook Air with revolutionary M3 chip, liquid retina display, all-day battery life, incredibly thin and light",
        category: "Laptops",
        subcategory: "Apple",
        pricing: { mrp: 5999, selling: 5699, costPrice: 5000 },
        inventory: {
          stock: 20,
          sku: `MBA-M3-${Date.now()}`,
          lowStockThreshold: 5,
        },
        images: [
          {
            url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
            alt: "MacBook Air M3",
          },
          {
            url: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800",
            alt: "MacBook Air Side View",
          },
        ],
        specifications: {
          Processor: "Apple M3 chip",
          RAM: "16GB Unified Memory",
          Storage: "512GB SSD",
          Display: '13.6" Liquid Retina',
          Battery: "Up to 18 hours",
        },
      },
      {
        name: "Sony WH-1000XM5 Headphones",
        description:
          "Premium wireless noise-canceling headphones with exceptional sound quality, 30-hour battery, and crystal-clear calls",
        category: "Audio",
        subcategory: "Headphones",
        pricing: { mrp: 1499, selling: 1299, costPrice: 1000 },
        inventory: {
          stock: 75,
          sku: `SONY-XM5-${Date.now()}`,
          lowStockThreshold: 15,
        },
        images: [
          {
            url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800",
            alt: "Sony WH-1000XM5",
          },
          {
            url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800",
            alt: "Headphones Detail",
          },
        ],
        specifications: {
          Type: "Over-ear Wireless",
          "Noise Cancellation": "Industry-leading ANC",
          Battery: "Up to 30 hours",
          Connectivity: "Bluetooth 5.2",
          Weight: "250g",
        },
      },
      {
        name: 'iPad Pro 12.9" M2 256GB',
        description:
          "Apple iPad Pro with M2 chip, Liquid Retina XDR display, perfect for creative professionals and productivity",
        category: "Tablets",
        subcategory: "Apple",
        pricing: { mrp: 4899, selling: 4599, costPrice: 4000 },
        inventory: {
          stock: 15,
          sku: `IPADPRO-${Date.now()}`,
          lowStockThreshold: 5,
        },
        images: [
          {
            url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800",
            alt: 'iPad Pro 12.9"',
          },
          {
            url: "https://images.unsplash.com/photo-1585790050230-5dd28404f1d3?w=800",
            alt: "iPad Pro with Pencil",
          },
        ],
        specifications: {
          Display: '12.9" Liquid Retina XDR',
          Processor: "Apple M2 chip",
          Storage: "256GB",
          Camera: "12MP Wide + 10MP Ultra Wide",
          Connectivity: "Wi-Fi 6E + 5G",
        },
      },
      {
        name: "Dell XPS 15 i7/32GB/1TB RTX4050",
        description:
          "Premium Windows laptop with stunning OLED display, powerful performance, perfect for creators and developers",
        category: "Laptops",
        subcategory: "Dell",
        pricing: { mrp: 7999, selling: 7499, costPrice: 6500 },
        inventory: {
          stock: 8,
          sku: `DELLXPS15-${Date.now()}`,
          lowStockThreshold: 3,
        },
        images: [
          {
            url: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800",
            alt: "Dell XPS 15",
          },
          {
            url: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800",
            alt: "Laptop Keyboard",
          },
        ],
        specifications: {
          Processor: "Intel Core i7-13700H",
          RAM: "32GB DDR5",
          Storage: "1TB NVMe SSD",
          Display: '15.6" 4K OLED Touch',
          GPU: "NVIDIA RTX 4050 6GB",
        },
      },
      {
        name: "AirPods Pro (2nd Gen)",
        description:
          "Apple AirPods Pro with active noise cancellation, adaptive transparency, and personalized spatial audio",
        category: "Audio",
        subcategory: "Earbuds",
        pricing: { mrp: 999, selling: 899, costPrice: 750 },
        inventory: {
          stock: 100,
          sku: `AIRPODSPRO2-${Date.now()}`,
          lowStockThreshold: 20,
        },
        images: [
          {
            url: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800",
            alt: "AirPods Pro",
          },
          {
            url: "https://images.unsplash.com/photo-1625738276804-cf412c78e11e?w=800",
            alt: "AirPods Case",
          },
        ],
        specifications: {
          Type: "In-ear Wireless",
          "Noise Cancellation": "Active ANC",
          Battery: "Up to 6 hours",
          Chip: "H2 chip",
          Features: "Adaptive Audio",
        },
      },
      {
        name: 'Samsung 55" 4K QLED Smart TV',
        description:
          "55-inch QLED 4K Smart TV with quantum HDR, object tracking sound, and gaming hub",
        category: "Electronics",
        subcategory: "TV & Home Theater",
        pricing: { mrp: 3999, selling: 3599, costPrice: 3000 },
        inventory: {
          stock: 12,
          sku: `SAMQLED55-${Date.now()}`,
          lowStockThreshold: 3,
        },
        images: [
          {
            url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800",
            alt: "Samsung QLED TV",
          },
          {
            url: "https://images.unsplash.com/photo-1593078165-1fc93e6868d8?w=800",
            alt: "Smart TV Display",
          },
        ],
        specifications: {
          "Screen Size": "55 inches",
          Resolution: "4K UHD (3840x2160)",
          Technology: "QLED",
          "Smart Features": "Tizen OS, Gaming Hub",
          HDR: "Quantum HDR",
        },
      },
    ];

    for (const p of products) {
      await Product.insertOne({
        ...p,
        sellerId: sellerResult.insertedId,
        shipping: {
          weight: 0.5,
          dimensions: { length: 20, width: 15, height: 5 },
          freeShipping: true,
        },
        isActive: true,
        tags: [p.category.toLowerCase()],
        ratings: {
          average: 4 + Math.random(),
          totalReviews: Math.floor(Math.random() * 50) + 10,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`✅ ${p.name}`);
    }

    console.log("\n🎉 Seeding complete!");
    console.log("\n📊 Summary:");
    console.log("   - 1 Seller account");
    console.log("   - 6 Products");
    console.log("\n🔐 Login Credentials:");
    console.log("   Email: seller@onlineplanet.ae");
    console.log("   Password: Seller@123456");
    console.log("\n✨ Ready to test!");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log("\n👋 Done!\n");
  }
}

cleanAndSeed();
