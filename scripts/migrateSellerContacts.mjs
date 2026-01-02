#!/usr/bin/env node

/**
 * Migration Script: Add Contact Information to Existing Sellers
 * This script populates contactEmail, contactPhone, and contactName
 * for existing sellers by fetching data from their linked User records
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
import User from "../src/lib/db/models/User.js";

async function migrateSellerContacts() {
  try {
    console.log("\n🔄 Starting Seller Contact Information Migration\n");
    console.log("=".repeat(60));

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find all sellers
    const sellers = await Seller.find({}).populate("userId");
    console.log(`📊 Found ${sellers.length} sellers\n`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const seller of sellers) {
      try {
        // Check if contact info already exists
        if (seller.contactEmail && seller.contactPhone && seller.contactName) {
          console.log(
            `⏭️  Skipping ${seller.businessName} - already has contact info`
          );
          skipped++;
          continue;
        }

        // Get user data
        const user = seller.userId;
        if (!user) {
          console.log(
            `⚠️  Warning: Seller ${seller.businessName} has no linked user`
          );
          errors++;
          continue;
        }

        // Update seller with contact information
        seller.contactEmail = seller.contactEmail || user.email;
        seller.contactPhone = seller.contactPhone || user.phone;
        seller.contactName = seller.contactName || user.name;

        await seller.save();

        console.log(`✅ Updated ${seller.businessName}`);
        console.log(`   Email: ${seller.contactEmail}`);
        console.log(`   Phone: ${seller.contactPhone}`);
        console.log(`   Name: ${seller.contactName}\n`);

        updated++;
      } catch (error) {
        console.error(
          `❌ Error updating ${seller.businessName}:`,
          error.message
        );
        errors++;
      }
    }

    console.log("=".repeat(60));
    console.log("\n📊 Migration Summary:\n");
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📊 Total: ${sellers.length}\n`);

    if (errors === 0) {
      console.log("🎉 Migration completed successfully!\n");
    } else {
      console.log("⚠️  Migration completed with some errors.\n");
    }
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB\n");
  }
}

// Run migration
migrateSellerContacts();
