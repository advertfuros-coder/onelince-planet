#!/usr/bin/env node

/**
 * Migration Script: Restructure Seller Data
 * This script migrates existing sellers from the old flat structure
 * to the new nested structure with personalDetails and businessInfo
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "..", ".env.local") });

async function migrateSellers() {
  try {
    console.log("\n🔄 Starting Seller Data Restructure Migration\n");
    console.log("=".repeat(60));

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Get the raw collection to work with both old and new structures
    const db = mongoose.connection.db;
    const sellersCollection = db.collection("sellers");

    // Find all sellers
    const sellers = await sellersCollection.find({}).toArray();
    console.log(`📊 Found ${sellers.length} sellers to migrate\n`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const seller of sellers) {
      try {
        // Check if already migrated (has personalDetails)
        if (seller.personalDetails && seller.businessInfo) {
          console.log(
            `⏭️  Skipping ${
              seller.businessName || seller.businessInfo?.businessName
            } - already migrated`
          );
          skipped++;
          continue;
        }

        // Prepare the update
        const update = {
          $set: {},
          $unset: {},
        };

        // Migrate to personalDetails if old structure exists
        if (!seller.personalDetails) {
          update.$set.personalDetails = {
            fullName: seller.contactName || "",
            email: seller.contactEmail || "",
            phone: seller.contactPhone || "",
            dateOfBirth: seller.dateOfBirth || null,
            residentialAddress: seller.residentialAddress || {
              addressLine1: "",
              addressLine2: "",
              city: "",
              state: "",
              pincode: "",
              country: "AE",
            },
          };

          // Mark old fields for removal
          if (seller.contactName) update.$unset.contactName = "";
          if (seller.contactEmail) update.$unset.contactEmail = "";
          if (seller.contactPhone) update.$unset.contactPhone = "";
          if (seller.dateOfBirth) update.$unset.dateOfBirth = "";
          if (seller.residentialAddress) update.$unset.residentialAddress = "";
        }

        // Migrate to businessInfo if old structure exists
        if (!seller.businessInfo) {
          update.$set.businessInfo = {
            businessName: seller.businessName || "",
            gstin: seller.gstin || "",
            pan: seller.pan || "",
            businessType: seller.businessType || "individual",
            businessCategory: seller.businessCategory || "retailer",
            establishedYear: seller.establishedYear || null,
          };

          // Mark old fields for removal
          if (seller.businessName) update.$unset.businessName = "";
          if (seller.gstin) update.$unset.gstin = "";
          if (seller.pan) update.$unset.pan = "";
          if (seller.businessType) update.$unset.businessType = "";
          if (seller.businessCategory) update.$unset.businessCategory = "";
          if (seller.establishedYear) update.$unset.establishedYear = "";
        }

        // Perform the update
        if (Object.keys(update.$set).length > 0) {
          await sellersCollection.updateOne({ _id: seller._id }, update);

          console.log(
            `✅ Migrated: ${
              seller.businessName || update.$set.businessInfo?.businessName
            }`
          );
          console.log(
            `   Personal: ${update.$set.personalDetails?.fullName} (${update.$set.personalDetails?.email})`
          );
          console.log(
            `   Business: ${update.$set.businessInfo?.businessName} (${update.$set.businessInfo?.gstin})\n`
          );
          migrated++;
        } else {
          skipped++;
        }
      } catch (error) {
        console.error(`❌ Error migrating seller:`, error.message);
        errors++;
      }
    }

    console.log("=".repeat(60));
    console.log("\n📊 Migration Summary:\n");
    console.log(`   ✅ Migrated: ${migrated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📊 Total: ${sellers.length}\n`);

    if (errors === 0) {
      console.log("🎉 Migration completed successfully!\n");
      console.log("📝 Next Steps:");
      console.log("   1. Restart your dev server: npm run dev");
      console.log("   2. Test seller onboarding");
      console.log("   3. Verify seller data in admin panel\n");
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
migrateSellers();
