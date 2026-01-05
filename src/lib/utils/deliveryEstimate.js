// lib/utils/deliveryEstimate.js

/**
 * Calculate estimated delivery date range
 * @param {Object} product - Product with deliveryEstimate field
 * @param {String} userCountry - User's country code (e.g., 'AE', 'IN')
 * @param {String} sellerCountry - Seller's country code
 * @returns {Object} - {minDate, maxDate, label}
 */
export function calculateDeliveryEstimate(
  product,
  userCountry = "AE",
  sellerCountry = "AE"
) {
  // Determine if international shipping
  const isInternational = userCountry !== sellerCountry;

  // Get estimate from product or use defaults
  const estimate = product?.deliveryEstimate || {
    domestic: { min: 2, max: 5 },
    international: { min: 7, max: 14 },
  };

  const { min, max } = isInternational
    ? estimate.international
    : estimate.domestic;

  // Calculate dates
  const today = new Date();
  const minDate = addBusinessDays(today, min);
  const maxDate = addBusinessDays(today, max);

  return {
    minDate,
    maxDate,
    minDays: min,
    maxDays: max,
    label: formatDeliveryRange(minDate, maxDate),
    isInternational,
  };
}

/**
 * Add business days (excluding weekends)
 */
function addBusinessDays(date, days) {
  const result = new Date(date);
  let addedDays = 0;

  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      addedDays++;
    }
  }

  return result;
}

/**
 * Format delivery date range for display
 */
function formatDeliveryRange(minDate, maxDate) {
  const options = { month: "short", day: "numeric" };

  // If same month, show "Jan 15 - 18"
  if (minDate.getMonth() === maxDate.getMonth()) {
    return `${minDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} - ${maxDate.getDate()}`;
  }

  // Different months: "Jan 30 - Feb 2"
  return `${minDate.toLocaleDateString(
    "en-US",
    options
  )} - ${maxDate.toLocaleDateString("en-US", options)}`;
}

/**
 * Get delivery message for display
 */
export function getDeliveryMessage(deliveryEstimate) {
  const { minDays, maxDays, label, isInternational } = deliveryEstimate;

  if (minDays === maxDays) {
    return `Delivery by ${label}`;
  }

  if (maxDays <= 2) {
    return `Express delivery by ${label}`;
  }

  if (maxDays <= 5) {
    return `Fast delivery by ${label}`;
  }

  if (isInternational) {
    return `International delivery by ${label}`;
  }

  return `Delivery by ${label}`;
}
