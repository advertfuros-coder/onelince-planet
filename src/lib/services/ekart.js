// lib/services/ekart.js

/**
 * eKart API Service
 * Handles all eKart API interactions for delivery estimates
 */

import axios from "axios";

const EKART_API_BASE_URL = process.env.EKART_API_URL || "https://api.ekart.com";
const EKART_API_KEY = process.env.EKART_API_KEY;
const EKART_API_SECRET = process.env.EKART_API_SECRET;

/**
 * Get delivery estimate from eKart API
 * @param {Object} params - { fromPincode, toPincode, weight, codAmount }
 * @returns {Promise<Object>} - Delivery estimate data
 */
export async function getDeliveryEstimate(params) {
  const {
    fromPincode,
    toPincode,
    weight = 1, // kg
    codAmount = 0,
    shipmentType = "FORWARD",
  } = params;

  try {
    const response = await axios.post(
      `${EKART_API_BASE_URL}/v1/serviceability/estimate`,
      {
        origin_pincode: fromPincode,
        destination_pincode: toPincode,
        weight: weight,
        cod_amount: codAmount,
        shipment_type: shipmentType,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": EKART_API_KEY,
          "X-API-Secret": EKART_API_SECRET,
        },
        timeout: 10000, // 10 second timeout
      }
    );

    if (response.data && response.data.success) {
      return {
        success: true,
        estimate: {
          min: response.data.min_days || response.data.expected_days - 1,
          max: response.data.max_days || response.data.expected_days + 1,
          average: response.data.expected_days,
          provider: "eKart",
        },
        logistics: {
          distance: response.data.distance_km,
          zone: response.data.zone_type,
          serviceability: response.data.service_type,
          codAvailable: response.data.cod_available || false,
          weight: {
            min: response.data.min_weight_kg,
            max: response.data.max_weight_kg,
          },
        },
        metadata: {
          confidence: response.data.confidence_score || 0.9,
          lastUpdated: new Date(),
        },
      };
    }

    throw new Error("Invalid response from eKart API");
  } catch (error) {
    console.error("eKart API Error:", error.message);

    // Return fallback estimate based on zone
    return getFallbackEstimate(fromPincode, toPincode, error);
  }
}

/**
 * Batch delivery estimates (for cron job)
 * @param {Array} routes - Array of {fromPincode, toPincode} objects
 * @returns {Promise<Array>} - Array of estimates
 */
export async function getBatchDeliveryEstimates(routes) {
  const estimates = [];
  const batchSize = 10; // Process 10 at a time

  for (let i = 0; i < routes.length; i += batchSize) {
    const batch = routes.slice(i, i + batchSize);

    const batchPromises = batch.map((route) =>
      getDeliveryEstimate(route)
        .then((result) => ({
          ...route,
          ...result,
          success: true,
        }))
        .catch((error) => ({
          ...route,
          success: false,
          error: error.message,
        }))
    );

    const batchResults = await Promise.allSettled(batchPromises);
    estimates.push(...batchResults.map((r) => r.value || r.reason));

    // Rate limiting: Wait 100ms between batches
    if (i + batchSize < routes.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return estimates;
}

/**
 * Check serviceability for a pincode
 * @param {String} pincode
 * @returns {Promise<Boolean>}
 */
export async function checkServiceability(pincode) {
  try {
    const response = await axios.get(
      `${EKART_API_BASE_URL}/v1/serviceability/check/${pincode}`,
      {
        headers: {
          "X-API-Key": EKART_API_KEY,
          "X-API-Secret": EKART_API_SECRET,
        },
        timeout: 5000,
      }
    );

    return response.data?.serviceable || false;
  } catch (error) {
    console.error("Serviceability check failed:", error.message);
    return true; // Default to serviceable
  }
}

/**
 * Fallback estimate when API fails
 * Uses zone-based calculation
 */
function getFallbackEstimate(fromPincode, toPincode, error) {
  // Simple zone-based fallback
  const fromZone = Math.floor(fromPincode / 100000);
  const toZone = Math.floor(toPincode / 100000);

  let estimate;
  if (fromZone === toZone) {
    // Same zone (e.g., both in Maharashtra)
    estimate = { min: 2, max: 4, average: 3 };
  } else if (Math.abs(fromZone - toZone) <= 2) {
    // Nearby zones
    estimate = { min: 3, max: 6, average: 4 };
  } else {
    // Far zones
    estimate = { min: 5, max: 10, average: 7 };
  }

  return {
    success: false,
    estimate: {
      ...estimate,
      provider: "eKart-Fallback",
    },
    logistics: {
      zone: "Unknown",
      serviceability: "Standard",
      codAvailable: true,
    },
    metadata: {
      confidence: 0.6,
      fallback: true,
      error: error.message,
      lastUpdated: new Date(),
    },
  };
}

/**
 * Validate API configuration
 */
export function validateConfig() {
  if (!EKART_API_KEY || !EKART_API_SECRET) {
    console.warn("⚠️  eKart API credentials not configured");
    console.warn("   Set EKART_API_KEY and EKART_API_SECRET in .env.local");
    return false;
  }
  return true;
}

export default {
  getDeliveryEstimate,
  getBatchDeliveryEstimates,
  checkServiceability,
  validateConfig,
};
