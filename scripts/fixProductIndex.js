// scripts/fixProductIndex.js
/**
 * Fix Product SKU Index Issue
 * Drops the problematic sku_1 unique index
 *
 * Run: node -r dotenv/config scripts/fixProductIndex.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

async function fixIndex() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected");

    const Product = mongoose.connection.collection("products");

    // Get all indexes
    const indexes = await Product.indexes();
    console.log(
      "\nCurrent indexes:",
      indexes.map((i) => i.name)
    );

    // Drop the problematic SKU index
    try {
      await Product.dropIndex("sku_1");
      console.log("✅ Dropped sku_1 index");
    } catch (e) {
      console.log("ℹ️  sku_1 index not found or already dropped");
    }

    // Delete all products with null SKU
    const result = await Product.deleteMany({ sku: null });
    console.log(`✅ Deleted ${result.deletedCount} products with null SKU`);

    console.log("\n✅ Fixed! You can now run the seeding script.");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
  }
}

fixIndex();
