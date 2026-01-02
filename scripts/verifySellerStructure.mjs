#!/usr/bin/env node

/**
 * Verify Seller Data Structure
 * Checks if sellers have the new nested structure
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "..", ".env.local") });

async function verifySellers() {
  try {
    console.log("\n🔍 Verifying Seller Data Structure\n");
    console.log("=".repeat(60));

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    const db = mongoose.connection.db;
    const sellersCollection = db.collection("sellers");

    // Find all sellers
    const sellers = await sellersCollection.find({}).toArray();

    console.log(`📊 Total Sellers: ${sellers.length}\n`);

    if (sellers.length === 0) {
      console.log("ℹ️  No sellers found in the database.\n");
      return;
    }

    let newStructure = 0;
    let oldStructure = 0;

    sellers.forEach((seller, index) => {
      const hasNewStructure = seller.personalDetails && seller.businessInfo;
      const hasOldStructure = seller.contactEmail || seller.businessName;

      console.log(`${index + 1}. Seller ID: ${seller._id}`);

      if (hasNewStructure) {
        console.log(`   ✅ NEW STRUCTURE`);
        console.log(`   Personal Details:`);
        console.log(`      Name: ${seller.personalDetails.fullName}`);
        console.log(`      Email: ${seller.personalDetails.email}`);
        console.log(`      Phone: ${seller.personalDetails.phone}`);
        console.log(`   Business Info:`);
        console.log(`      Business: ${seller.businessInfo.businessName}`);
        console.log(`      GSTIN: ${seller.businessInfo.gstin}`);
        console.log(`      Type: ${seller.businessInfo.businessType}\n`);
        newStructure++;
      } else if (hasOldStructure) {
        console.log(`   ⚠️  OLD STRUCTURE (needs migration)`);
        console.log(`      Contact: ${seller.contactName || "N/A"}`);
        console.log(`      Email: ${seller.contactEmail || "N/A"}`);
        console.log(`      Business: ${seller.businessName || "N/A"}\n`);
        oldStructure++;
      } else {
        console.log(`   ❌ INCOMPLETE DATA\n`);
      }
    });

    console.log("=".repeat(60));
    console.log("\n📊 Summary:\n");
    console.log(`   ✅ New Structure: ${newStructure}`);
    console.log(`   ⚠️  Old Structure: ${oldStructure}`);
    console.log(`   📊 Total: ${sellers.length}\n`);

    if (oldStructure > 0) {
      console.log("⚠️  Some sellers still have the old structure.");
      console.log("   Run: node scripts/migrateSellerStructure.mjs\n");
    } else {
      console.log("🎉 All sellers have the new structure!\n");
      console.log("📝 You can now search sellers using:");
      console.log("   - personalDetails.email");
      console.log("   - personalDetails.phone");
      console.log("   - personalDetails.fullName");
      console.log("   - businessInfo.businessName");
      console.log("   - businessInfo.gstin\n");
    }
  } catch (error) {
    console.error("\n❌ Verification failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB\n");
  }
}

// Run verification
verifySellers();
