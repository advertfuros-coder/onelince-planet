/**
 * CSV Export Utilities
 * Convert data to CSV and trigger download
 */

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV(data, columns = null) {
  if (!data || data.length === 0) {
    return "";
  }

  // Get columns (either provided or from first object)
  const headers = columns || Object.keys(data[0]);

  // Create header row
  const headerRow = headers.map((header) => escapeCSVValue(header)).join(",");

  // Create data rows
  const dataRows = data.map((row) => {
    return headers
      .map((header) => {
        const value = getNestedValue(row, header);
        return escapeCSVValue(value);
      })
      .join(",");
  });

  return [headerRow, ...dataRows].join("\n");
}

/**
 * Get nested value from object using dot notation
 * e.g., 'user.name' => obj.user.name
 */
function getNestedValue(obj, path) {
  if (typeof path === "function") {
    return path(obj);
  }

  return path.split(".").reduce((current, key) => {
    return current?.[key];
  }, obj);
}

/**
 * Escape CSV value (handle commas, quotes, newlines)
 */
function escapeCSVValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  // Convert to string
  const stringValue = String(value);

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent, filename = "export.csv") {
  // Create blob
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  // Create download link
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV (one-liner)
 */
export function exportToCSV(data, filename, columns = null) {
  const csv = arrayToCSV(data, columns);
  downloadCSV(csv, filename);
}

/**
 * Format data for export (common transformations)
 */
export function formatForExport(data, config = {}) {
  const {
    dateFormat = "YYYY-MM-DD",
    currencySymbol = "₹",
    excludeFields = [],
    customFormatters = {},
  } = config;

  return data.map((item) => {
    const formatted = { ...item };

    // Remove excluded fields
    excludeFields.forEach((field) => {
      delete formatted[field];
    });

    // Apply custom formatters
    Object.entries(customFormatters).forEach(([field, formatter]) => {
      if (formatted[field] !== undefined) {
        formatted[field] = formatter(formatted[field]);
      }
    });

    // Format dates
    Object.keys(formatted).forEach((key) => {
      const value = formatted[key];
      if (value instanceof Date) {
        formatted[key] = value.toISOString().split("T")[0]; // Simple YYYY-MM-DD
      }
    });

    return formatted;
  });
}

/**
 * Quick export presets for common entities
 */
export const exportPresets = {
  orders: (orders) => {
    return formatForExport(orders, {
      excludeFields: ["_id", "__v", "updatedAt"],
      customFormatters: {
        createdAt: (date) => new Date(date).toLocaleDateString(),
        "pricing.total": (val) => `₹${val}`,
        status: (val) => val.toUpperCase(),
      },
    });
  },

  products: (products) => {
    return formatForExport(products, {
      excludeFields: ["_id", "__v", "images", "specifications"],
      customFormatters: {
        createdAt: (date) => new Date(date).toLocaleDateString(),
        "pricing.selling": (val) => `₹${val}`,
        "pricing.mrp": (val) => `₹${val}`,
      },
    });
  },

  sellers: (sellers) => {
    return formatForExport(sellers, {
      excludeFields: ["_id", "__v", "documents", "bankDetails.accountNumber"],
      customFormatters: {
        createdAt: (date) => new Date(date).toLocaleDateString(),
        isVerified: (val) => (val ? "Yes" : "No"),
        isActive: (val) => (val ? "Active" : "Inactive"),
      },
    });
  },

  users: (users) => {
    return formatForExport(users, {
      excludeFields: ["_id", "__v", "password", "wishlist"],
      customFormatters: {
        createdAt: (date) => new Date(date).toLocaleDateString(),
        isVerified: (val) => (val ? "Yes" : "No"),
      },
    });
  },
};
