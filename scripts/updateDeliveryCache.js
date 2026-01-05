// scripts/updateDeliveryCache.js

/**
 * Nightly Delivery Cache Update Script
 * Runs at 3 AM to refresh eKart delivery estimates
 *
 * Usage:
 * node scripts/updateDeliveryCache.js
 *
 * Or with cron:
 * 0 3 * * * cd /path/to/app && node scripts/updateDeliveryCache.js
 */

import cron from "node-cron";
import DeliveryCache from "../src/lib/db/models/DeliveryCache.js";
import { shippingHubs } from "../src/lib/config/shipping Hubs.js";
import districtMapping from "../src/lib/config/districtMapping.js";
import {
  getBatchDeliveryEstimates,
  validateConfig,
} from "../src/lib/services/ekart.js";
import connectDB from "../src/lib/db/mongoose.js";

// Configuration
const BATCH_SIZE = 50; // Process 50 routes at a time
const UPDATE_THRESHOLD = 0.7; // Update if confidence < 70%
const CACHE_EXPIRY_DAYS = 7; // Cache valid for 7 days

/**
 * Main update function
 */
async function updateDeliveryCache() {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 Starting Delivery Cache Update");
  console.log(
    "   Time:",
    new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
  );
  console.log("=".repeat(60) + "\n");

  try {
    // Connect to database
    await connectDB();
    console.log("✅ Database connected");

    // Validate eKart API config
    if (!validateConfig()) {
      console.error("❌ eKart API not configured. Using fallback estimates.");
      // Continue with fallback mode
    }

    // Get all routes that need updating
    const routesToUpdate = await getRoutesToUpdate();
    console.log(`📊 Found ${routesToUpdate.length} routes to update\n`);

    if (routesToUpdate.length === 0) {
      console.log("✅ All routes are up to date!");
      return {
        success: true,
        updated: 0,
        failed: 0,
        skipped: routesToUpdate.length,
        message: "No updates needed",
      };
    }

    // Process in batches
    const stats = {
      total: routesToUpdate.length,
      updated: 0,
      failed: 0,
      skipped: 0,
      apiCalls: 0,
    };

    for (let i = 0; i < routesToUpdate.length; i += BATCH_SIZE) {
      const batch = routesToUpdate.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(routesToUpdate.length / BATCH_SIZE);

      console.log(
        `\n📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} routes)...`
      );

      try {
        const estimates = await getBatchDeliveryEstimates(batch);
        stats.apiCalls += batch.length;

        // Update cache with results
        for (const estimate of estimates) {
          try {
            if (estimate.success) {
              await DeliveryCache.updateOne(
                {
                  fromHub: estimate.fromHub,
                  toDistrict: estimate.toDistrict,
                },
                {
                  $set: {
                    estimate: estimate.estimate,
                    logistics: estimate.logistics,
                    toPincodes: estimate.toPincodes || [],
                    "metadata.lastUpdated": new Date(),
                    "metadata.expiresAt": new Date(
                      Date.now() + CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000
                    ),
                    "metadata.confidence": estimate.metadata?.confidence || 0.9,
                  },
                  $inc: {
                    "metadata.apiCallCount": 1,
                  },
                },
                { upsert: true }
              );
              stats.updated++;
              process.stdout.write(".");
            } else {
              stats.failed++;
              process.stdout.write("x");
            }
          } catch (error) {
            console.error(
              `\n   ❌ Failed to save: ${estimate.fromHub} → ${estimate.toDistrict}`
            );
            stats.failed++;
          }
        }

        console.log(` Done!`);

        // Rate limiting between batches
        if (i + BATCH_SIZE < routesToUpdate.length) {
          await sleep(200); // 200ms between batches
        }
      } catch (error) {
        console.error(`\n   ❌ Batch ${batchNum} failed:`, error.message);
        stats.failed += batch.length;
      }
    }

    // Print summary
    printSummary(stats);

    return stats;
  } catch (error) {
    console.error("\n❌ Update failed:", error);
    throw error;
  }
}

/**
 * Get routes that need updating
 */
async function getRoutesToUpdate() {
  const routes = [];

  // Get all districts
  const allDistricts = [];
  Object.values(districtMapping).forEach((districts) => {
    allDistricts.push(...districts);
  });

  console.log(
    `📍 ${shippingHubs.length} hubs × ${allDistricts.length} districts = ${
      shippingHubs.length * allDistricts.length
    } total routes`
  );

  // Check each route
  for (const hub of shippingHubs) {
    for (const district of allDistricts) {
      const cached = await DeliveryCache.findOne({
        fromHub: hub.code,
        toDistrict: district.code,
      });

      // Add to update list if:
      // 1. Not cached
      // 2. Expired
      // 3. Low confidence
      if (
        !cached ||
        cached.metadata.expiresAt < new Date() ||
        cached.metadata.confidence < UPDATE_THRESHOLD
      ) {
        routes.push({
          fromHub: hub.code,
          toDistrict: district.code,
          fromPincode: hub.pincode,
          toPincode: district.pincodes[0], // Use first pincode as representative
          toPincodes: district.pincodes,
        });
      }
    }
  }

  return routes;
}

/**
 * Print summary statistics
 */
function printSummary(stats) {
  console.log("\n" + "=".repeat(60));
  console.log("📊 Update Summary");
  console.log("=".repeat(60));
  console.log(`   Total Routes:    ${stats.total}`);
  console.log(
    `   ✅ Updated:      ${stats.updated} (${(
      (stats.updated / stats.total) *
      100
    ).toFixed(1)}%)`
  );
  console.log(
    `   ❌ Failed:       ${stats.failed} (${(
      (stats.failed / stats.total) *
      100
    ).toFixed(1)}%)`
  );
  console.log(
    `   ⏭️  Skipped:      ${stats.skipped} (${(
      (stats.skipped / stats.total) *
      100
    ).toFixed(1)}%)`
  );
  console.log(`   📞 API Calls:    ${stats.apiCalls}`);
  console.log(
    `   ⏱️  Duration:     ${((Date.now() - startTime) / 1000 / 60).toFixed(
      2
    )} minutes`
  );
  console.log("=".repeat(60) + "\n");
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Schedule cron job (3 AM IST daily)
 */
function scheduleCronJob() {
  // Cron format: second minute hour day month weekday
  // 0 3 * * * = Every day at 3:00 AM
  cron.schedule(
    "0 3 * * *",
    async () => {
      console.log("\n⏰ Cron job triggered at 3 AM");
      try {
        await updateDeliveryCache();
        console.log("✅ Cron job completed successfully\n");
      } catch (error) {
        console.error("❌ Cron job failed:", error);
        // TODO: Send email alert to admin
      }
    },
    {
      timezone: "Asia/Kolkata", // IST timezone
    }
  );

  console.log("⏰ Cron job scheduled for 3:00 AM IST daily");
  console.log("   Cron expression: 0 3 * * *");
  console.log("   Timezone: Asia/Kolkata\n");
}

// Track start time
let startTime = Date.now();

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  // Run immediately if executed directly
  updateDeliveryCache()
    .then((stats) => {
      console.log("✅ Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Script failed:", error);
      process.exit(1);
    });
} else {
  // Schedule cron if imported
  scheduleCronJob();
}

export { updateDeliveryCache, scheduleCronJob };
