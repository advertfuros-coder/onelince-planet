#!/usr/bin/env node

/**
 * Fix Seller Country - Update from AE to IN
 * Updates existing sellers to have correct country code
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "..", ".env.local") });

async function fixSellerCountry() {
  try {
    console.log("\n🔄 Fixing Seller Country Codes\n");
    console.log("=".repeat(60));

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    const db = mongoose.connection.db;
    const sellersCollection = db.collection("sellers");

    // Find all sellers with AE country
    const sellers = await sellersCollection
      .find({
        $or: [
          { "personalDetails.residentialAddress.country": "AE" },
          { "pickupAddress.country": { $in: ["AE", "India"] } },
        ],
      })
      .toArray();

    console.log(`📊 Found ${sellers.length} sellers to update\n`);

    let updated = 0;

    for (const seller of sellers) {
      try {
        const updates = {};

        // Update residential address country
        if (seller.personalDetails?.residentialAddress?.country === "AE") {
          updates["personalDetails.residentialAddress.country"] = "IN";
        }

        // Update pickup address country (from both 'AE' and 'India' to 'IN')
        if (
          seller.pickupAddress?.country === "AE" ||
          seller.pickupAddress?.country === "India"
        ) {
          updates["pickupAddress.country"] = "IN";
        }

        if (Object.keys(updates).length > 0) {
          await sellersCollection.updateOne(
            { _id: seller._id },
            { $set: updates }
          );

          console.log(
            `✅ Updated: ${seller.businessInfo?.businessName || seller._id}`
          );
          console.log(
            `   Residential: ${seller.personalDetails?.residentialAddress?.country} → IN`
          );
          console.log(`   Pickup: ${seller.pickupAddress?.country} → IN\n`);
          updated++;
        }
      } catch (error) {
        console.error(`❌ Error updating seller:`, error.message);
      }
    }

    console.log("=".repeat(60));
    console.log("\n📊 Update Summary:\n");
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   📊 Total: ${sellers.length}\n`);

    if (updated > 0) {
      console.log("🎉 Country codes updated successfully!\n");
      console.log("All sellers now have country code: IN (India)\n");
    } else {
      console.log("ℹ️  No sellers needed updating.\n");
    }
  } catch (error) {
    console.error("\n❌ Update failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB\n");
  }
}

// Run update
fixSellerCountry();
