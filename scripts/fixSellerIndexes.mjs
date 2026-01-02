#!/usr/bin/env node

/**
 * Drop and Recreate Seller Indexes
 * This script drops all existing indexes and recreates them to fix duplicates
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "..", ".env.local") });

async function fixIndexes() {
  try {
    console.log("\n🔄 Fixing Seller Indexes\n");
    console.log("=".repeat(60));

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    const db = mongoose.connection.db;
    const sellersCollection = db.collection("sellers");

    // Get current indexes
    console.log("📋 Current Indexes:");
    const indexes = await sellersCollection.indexes();
    indexes.forEach((index) => {
      console.log(`   - ${JSON.stringify(index.key)}`);
    });
    console.log("");

    // Drop all indexes except _id
    console.log("🗑️  Dropping all indexes (except _id)...");
    await sellersCollection.dropIndexes();
    console.log("✅ Indexes dropped\n");

    // Recreate indexes
    console.log("🔨 Creating new indexes...");

    await sellersCollection.createIndex({ userId: 1 }, { unique: true });
    console.log("   ✅ userId (unique)");

    await sellersCollection.createIndex(
      { "businessInfo.gstin": 1 },
      { unique: true }
    );
    console.log("   ✅ businessInfo.gstin (unique)");

    await sellersCollection.createIndex({ verificationStatus: 1 });
    console.log("   ✅ verificationStatus");

    await sellersCollection.createIndex({ isActive: 1 });
    console.log("   ✅ isActive");

    await sellersCollection.createIndex({ "personalDetails.email": 1 });
    console.log("   ✅ personalDetails.email");

    await sellersCollection.createIndex({ "personalDetails.phone": 1 });
    console.log("   ✅ personalDetails.phone");

    await sellersCollection.createIndex({
      "personalDetails.fullName": "text",
      "businessInfo.businessName": "text",
    });
    console.log(
      "   ✅ personalDetails.fullName + businessInfo.businessName (compound text)"
    );

    console.log("\n📋 New Indexes:");
    const newIndexes = await sellersCollection.indexes();
    newIndexes.forEach((index) => {
      console.log(`   - ${JSON.stringify(index.key)}`);
    });

    console.log("\n" + "=".repeat(60));
    console.log("\n🎉 Indexes recreated successfully!\n");
    console.log("📝 Next Steps:");
    console.log("   1. Restart your dev server");
    console.log("   2. The duplicate index warnings should be gone\n");
  } catch (error) {
    console.error("\n❌ Failed to fix indexes:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB\n");
  }
}

// Run fix
fixIndexes();
