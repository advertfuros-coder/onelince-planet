// lib/services/deliveryCache.js

/**
 * Delivery Cache Service
 * Handles caching and retrieval of delivery estimates
 */

import DeliveryCache from "../db/models/DeliveryCache";
import { shippingHubs, findNearestHub } from "../config/shippingHubs";
import { getDistrictFromPincode } from "../config/districtMapping";
import { getDeliveryEstimate as getEKartEstimate } from "./ekart";
import connectDB from "../db/mongoose";

/**
 * Get delivery estimate for a route (with caching)
 * @param {String} sellerLocation - Seller's city/state/pincode
 * @param {String} customerPincode - Customer's pincode
 * @returns {Promise<Object>} - Delivery estimate
 */
export async function getDeliveryEstimate(sellerLocation, customerPincode) {
  await connectDB();

  // 1. Find nearest shipping hub to seller
  const sellerHub = findNearestHub(
    sellerLocation.pincode,
    sellerLocation.state
  );
  if (!sellerHub) {
    throw new Error("No shipping hub found for seller location");
  }

  // 2. Get customer district from pincode
  const customerDistrict = getDistrictFromPincode(customerPincode);
  if (!customerDistrict) {
    throw new Error(`Pincode ${customerPincode} not found in district mapping`);
  }

  // 3. Check cache
  const cached = await DeliveryCache.findOne({
    fromHub: sellerHub.code,
    toDistrict: customerDistrict.code,
    "metadata.expiresAt": { $gt: new Date() },
  });

  if (cached && cached.isValid()) {
    return {
      ...cached.estimate,
      source: "cached",
      cachedAt: cached.metadata.lastUpdated,
      confidence: cached.metadata.confidence,
    };
  }

  // 4. Cache miss or expired - fetch from API
  console.log(`Cache miss: ${sellerHub.code} → ${customerDistrict.code}`);

  try {
    const apiResult = await getEKartEstimate({
      fromPincode: sellerHub.pincode,
      toPincode: customerPincode,
    });

    // 5. Update cache
    await DeliveryCache.updateOne(
      {
        fromHub: sellerHub.code,
        toDistrict: customerDistrict.code,
      },
      {
        $set: {
          toPincodes: [customerPincode], // Will be expanded by cron job
          estimate: apiResult.estimate,
          logistics: apiResult.logistics,
          metadata: {
            lastUpdated: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            confidence: apiResult.metadata.confidence,
            apiCallCount: 1,
          },
        },
        $inc: {
          "metadata.apiCallCount": 1,
        },
      },
      { upsert: true }
    );

    return {
      ...apiResult.estimate,
      source: "api",
      fresh: true,
    };
  } catch (error) {
    console.error("Failed to fetch estimate:", error);

    // Return zone-based fallback
    return getZoneBasedEstimate(sellerHub.zone, customerDistrict.zone);
  }
}

/**
 * Zone-based estimate fallback
 */
function getZoneBasedEstimate(fromZone, toZone) {
  // Same zone
  if (fromZone === toZone) {
    if (fromZone === "Metro") {
      return {
        min: 1,
        max: 2,
        average: 1,
        provider: "Zone-Based",
        source: "fallback",
      };
    }
    return {
      min: 2,
      max: 4,
      average: 3,
      provider: "Zone-Based",
      source: "fallback",
    };
  }

  // Metro to Tier1 or vice versa
  if (
    (fromZone === "Metro" && toZone === "Tier1") ||
    (fromZone === "Tier1" && toZone === "Metro")
  ) {
    return {
      min: 2,
      max: 4,
      average: 3,
      provider: "Zone-Based",
      source: "fallback",
    };
  }

  // Metro to Tier2
  if (fromZone === "Metro" && toZone === "Tier2") {
    return {
      min: 3,
      max: 6,
      average: 4,
      provider: "Zone-Based",
      source: "fallback",
    };
  }

  // Default inter-zone
  return {
    min: 4,
    max: 8,
    average: 6,
    provider: "Zone-Based",
    source: "fallback",
  };
}

/**
 * Get cache statistics
 */
export async function getCacheStats() {
  await connectDB();

  const total = await DeliveryCache.countDocuments();
  const valid = await DeliveryCache.countDocuments({
    "metadata.expiresAt": { $gt: new Date() },
  });
  const expired = await DeliveryCache.countDocuments({
    "metadata.expiresAt": { $lte: new Date() },
  });

  const avgConfidence = await DeliveryCache.aggregate([
    {
      $group: {
        _id: null,
        avgConfidence: { $avg: "$metadata.confidence" },
        avgDays: { $avg: "$estimate.average" },
      },
    },
  ]);

  return {
    total,
    valid,
    expired,
    hitRate: total > 0 ? ((valid / total) * 100).toFixed(2) + "%" : "0%",
    avgConfidence: avgConfidence[0]?.avgConfidence?.toFixed(2) || 0,
    avgDeliveryDays: avgConfidence[0]?.avgDays?.toFixed(1) || 0,
  };
}

/**
 * Clear expired cache entries
 */
export async function clearExpiredCache() {
  await connectDB();

  const result = await DeliveryCache.deleteMany({
    "metadata.expiresAt": { $lte: new Date() },
  });

  return {
    deleted: result.deletedCount,
    message: `Cleared ${result.deletedCount} expired cache entries`,
  };
}

/**
 * Bulk update cache (used by cron job)
 * @param {Array} routes - Array of route objects
 * @returns {Promise<Object>} - Update statistics
 */
export async function bulkUpdateCache(routes) {
  await connectDB();

  let updated = 0;
  let failed = 0;
  let skipped = 0;

  for (const route of routes) {
    try {
      const existing = await DeliveryCache.findOne({
        fromHub: route.fromHub,
        toDistrict: route.toDistrict,
      });

      // Skip if cache is still valid
      if (
        existing &&
        existing.isValid() &&
        existing.metadata.confidence > 0.8
      ) {
        skipped++;
        continue;
      }

      // Update cache
      await DeliveryCache.updateOne(
        { fromHub: route.fromHub, toDistrict: route.toDistrict },
        {
          $set: {
            ...route.data,
            metadata: {
              ...route.data.metadata,
              lastUpdated: new Date(),
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
        { upsert: true }
      );

      updated++;
    } catch (error) {
      console.error(
        `Failed to update ${route.fromHub} → ${route.toDistrict}:`,
        error
      );
      failed++;
    }
  }

  return {
    updated,
    failed,
    skipped,
    total: routes.length,
  };
}

export default {
  getDeliveryEstimate,
  getCacheStats,
  clearExpiredCache,
  bulkUpdateCache,
};
