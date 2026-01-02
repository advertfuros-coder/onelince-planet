#!/usr/bin/env node

/**
 * Verify Seller Contact Information
 * Quick script to check if sellers have contact information saved
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "..", ".env.local") });

// Import models
import Seller from "../src/lib/db/models/Seller.js";

async function verifySellers() {
  try {
    console.log("\n🔍 Verifying Seller Contact Information\n");
    console.log("=".repeat(60));

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find all sellers
    const sellers = await Seller.find({}).select(
      "businessName contactEmail contactPhone contactName"
    );

    console.log(`📊 Total Sellers: ${sellers.length}\n`);

    if (sellers.length === 0) {
      console.log("ℹ️  No sellers found in the database.\n");
      return;
    }

    let complete = 0;
    let incomplete = 0;

    sellers.forEach((seller, index) => {
      console.log(`${index + 1}. ${seller.businessName}`);

      const hasEmail = !!seller.contactEmail;
      const hasPhone = !!seller.contactPhone;
      const hasName = !!seller.contactName;

      console.log(
        `   Email: ${hasEmail ? "✅" : "❌"} ${
          seller.contactEmail || "NOT SET"
        }`
      );
      console.log(
        `   Phone: ${hasPhone ? "✅" : "❌"} ${
          seller.contactPhone || "NOT SET"
        }`
      );
      console.log(
        `   Name:  ${hasName ? "✅" : "❌"} ${seller.contactName || "NOT SET"}`
      );

      if (hasEmail && hasPhone && hasName) {
        console.log(`   Status: ✅ Complete\n`);
        complete++;
      } else {
        console.log(`   Status: ❌ Incomplete\n`);
        incomplete++;
      }
    });

    console.log("=".repeat(60));
    console.log("\n📊 Summary:\n");
    console.log(`   ✅ Complete: ${complete}`);
    console.log(`   ❌ Incomplete: ${incomplete}`);
    console.log(`   📊 Total: ${sellers.length}\n`);

    if (incomplete > 0) {
      console.log("⚠️  Some sellers are missing contact information.");
      console.log("   Run: node scripts/migrateSellerContacts.mjs\n");
    } else {
      console.log("🎉 All sellers have complete contact information!\n");
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
