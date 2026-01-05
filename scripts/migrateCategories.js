// scripts/migrateCategories.js - Drop old indexes and prepare for new schema
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in environment variables");
  process.exit(1);
}

async function migrateCategories() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection("categories");

    console.log("📋 Listing existing indexes...");
    const indexes = await collection.indexes();
    console.log("Current indexes:", indexes.map((idx) => idx.name).join(", "));

    // Drop the name_1 unique index if it exists
    try {
      console.log("\n🗑️  Dropping old name_1 unique index...");
      await collection.dropIndex("name_1");
      console.log("✅ name_1 index dropped successfully");
    } catch (error) {
      if (error.code === 27) {
        console.log("ℹ️  name_1 index does not exist (this is fine)");
      } else {
        throw error;
      }
    }

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

migrateCategories()
  .then(() => {
    console.log("\n✅ All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Failed:", error);
    process.exit(1);
  });
