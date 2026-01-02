// scripts/setSellerCountries.mjs
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "..", ".env.local") });

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in environment variables");
  process.exit(1);
}

// Define Seller schema (minimal version for migration)
const SellerSchema = new mongoose.Schema({}, { strict: false });
const Seller = mongoose.models.Seller || mongoose.model("Seller", SellerSchema);

async function setSellerCountries() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Get all sellers
    const sellers = await Seller.find({});
    console.log(`📊 Found ${sellers.length} sellers\n`);

    let updated = 0;
    let skipped = 0;

    for (const seller of sellers) {
      // Check if businessInfo.country already exists
      if (seller.businessInfo?.country) {
        console.log(
          `⏭️  Skipping ${seller.businessInfo.businessName} - already has country: ${seller.businessInfo.country}`
        );
        skipped++;
        continue;
      }

      // Determine country from pickupAddress or default to IN
      let country = "IN"; // Default to India

      if (seller.pickupAddress?.country) {
        // If pickupAddress has country, use it
        if (
          seller.pickupAddress.country === "AE" ||
          seller.pickupAddress.country.includes("UAE") ||
          seller.pickupAddress.country.includes("Emirates")
        ) {
          country = "AE";
        }
      }

      // Update seller
      await Seller.updateOne(
        { _id: seller._id },
        {
          $set: {
            "businessInfo.country": country,
          },
        }
      );

      console.log(
        `✅ Updated ${
          seller.businessInfo?.businessName || seller._id
        } → ${country}`
      );
      updated++;
    }

    console.log("\n📊 Migration Summary:");
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   📦 Total: ${sellers.length}`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

// Run migration
setSellerCountries();
