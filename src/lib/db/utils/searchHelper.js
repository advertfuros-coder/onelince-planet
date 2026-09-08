/**
 * Search Helper Utility
 * Standardized search filtering & relevance ranking across product search APIs
 */

let cachedBrands = null;
let lastCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Escapes regex special characters
 */
export function escapeRegex(string) {
  if (!string || typeof string !== "string") return "";
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Fetches distinct active brands from the database with in-memory caching
 */
export async function getKnownBrands(ProductModel) {
  const now = Date.now();
  if (cachedBrands && now - lastCacheTime < CACHE_TTL) {
    return cachedBrands;
  }
  try {
    const brands = await ProductModel.distinct("brand", {
      isActive: true,
      isApproved: true,
    });
    cachedBrands = brands.filter(Boolean);
    lastCacheTime = now;
    return cachedBrands;
  } catch (err) {
    console.error("Error fetching known brands in searchHelper:", err);
    return cachedBrands || [];
  }
}

/**
 * Parses a search term to see if it targets a specific brand.
 * Supports exact brand queries ("samsung", "apple", "iqoo")
 * as well as brand + keyword queries ("samsung phone", "apple macbook", "carrier ac").
 */
export function parseBrandFromQuery(searchTerm, knownBrands = []) {
  if (!searchTerm || typeof searchTerm !== "string" || !searchTerm.trim()) {
    return { detectedBrand: null, remainingQuery: "" };
  }

  const raw = searchTerm.trim();
  const lower = raw.toLowerCase();

  const brandMap = new Map();
  knownBrands.forEach((b) => {
    if (b) brandMap.set(b.toLowerCase().trim(), b);
  });

  // 1. Exact match with brand
  if (brandMap.has(lower)) {
    return { detectedBrand: brandMap.get(lower), remainingQuery: "" };
  }

  // 2. Query starts with a known brand name (sorted descending by length so longer names match first)
  const sortedBrands = Array.from(brandMap.keys()).sort((a, b) => b.length - a.length);
  for (const bLower of sortedBrands) {
    // Only match as prefix if brand has length >= 2
    if (bLower.length < 2) continue;
    const brandRegex = new RegExp("^" + escapeRegex(bLower) + "(\\s+|$)", "i");
    if (brandRegex.test(lower)) {
      const remaining = raw.replace(brandRegex, "").trim();
      return { detectedBrand: brandMap.get(bLower), remainingQuery: remaining };
    }
  }

  return { detectedBrand: null, remainingQuery: raw };
}

/**
 * Builds an intelligent search filter for products.
 * Searches across name, brand (if not explicitly filtered), keywords, tags, category, and sku.
 * Uses word boundaries for short terms (<= 3 chars) to avoid false substring matches (e.g. 'ac' in 'black').
 * Excludes description and highlights to avoid false positives like "Apple AirPlay" in Sony/LG TVs.
 * 
 * If a known brand is detected in the query or passed explicitly:
 * - Locks the brand field to that brand so products of other brands (like iQOO phones with Samsung display) are excluded!
 * 
 * @param {string} searchTerm 
 * @param {string} explicitBrand 
 * @param {Array<string>} knownBrands 
 * @returns {{ brandFilter: object|null, textFilter: object|null, detectedBrand: string|null }}
 */
export function buildProductSearchFilter(searchTerm, explicitBrand = "", knownBrands = []) {
  if (!searchTerm || typeof searchTerm !== "string" || !searchTerm.trim()) {
    return { brandFilter: null, textFilter: null, detectedBrand: null };
  }

  // Detect brand if not explicitly provided
  let detectedBrand = explicitBrand || null;
  let remainingQuery = searchTerm.trim();

  if (!explicitBrand && knownBrands.length > 0) {
    const parsed = parseBrandFromQuery(searchTerm, knownBrands);
    if (parsed.detectedBrand) {
      detectedBrand = parsed.detectedBrand;
      remainingQuery = parsed.remainingQuery;
    }
  }

  const brandFilter = detectedBrand
    ? { brand: { $regex: new RegExp(`^${escapeRegex(detectedBrand)}$`, "i") } }
    : null;

  if (!remainingQuery) {
    return { brandFilter, textFilter: null, detectedBrand };
  }

  const terms = remainingQuery.split(/\s+/).filter(Boolean);
  if (terms.length === 0) {
    return { brandFilter, textFilter: null, detectedBrand };
  }

  const termConditions = terms.map((term) => {
    const escaped = escapeRegex(term);
    const isShort = term.length <= 3;
    const termRegex = isShort
      ? new RegExp(`\\b${escaped}\\b`, "i")
      : new RegExp(escaped, "i");

    const fields = [
      { name: termRegex },
      { keywords: termRegex },
      { tags: termRegex },
      { category: termRegex },
      { sku: termRegex },
    ];

    // If no brand is detected/specified, allow searching the brand field too
    if (!detectedBrand) {
      fields.push({ brand: termRegex });
    }

    return { $or: fields };
  });

  const textFilter = termConditions.length === 1 ? termConditions[0] : { $and: termConditions };

  return { brandFilter, textFilter, detectedBrand };
}

/**
 * Builds relevance score calculation stages for MongoDB aggregation.
 */
export function buildRelevanceAddFields(searchTerm) {
  if (!searchTerm || typeof searchTerm !== "string" || !searchTerm.trim()) {
    return null;
  }

  const escaped = escapeRegex(searchTerm.trim());
  const searchRegex = new RegExp(escaped, "i");

  return {
    $addFields: {
      relevanceScore: {
        $add: [
          // Exact brand match (+100)
          {
            $cond: [
              {
                $regexMatch: {
                  input: { $ifNull: ["$brand", ""] },
                  regex: new RegExp(`^${escaped}$`, "i"),
                },
              },
              100,
              0,
            ],
          },
          // Brand contains (+40)
          {
            $cond: [
              {
                $regexMatch: {
                  input: { $ifNull: ["$brand", ""] },
                  regex: searchRegex,
                },
              },
              40,
              0,
            ],
          },
          // Name starts with (+80)
          {
            $cond: [
              {
                $regexMatch: {
                  input: { $ifNull: ["$name", ""] },
                  regex: new RegExp(`^${escaped}`, "i"),
                },
              },
              80,
              0,
            ],
          },
          // Name whole word match (+60)
          {
            $cond: [
              {
                $regexMatch: {
                  input: { $ifNull: ["$name", ""] },
                  regex: new RegExp(`\\b${escaped}\\b`, "i"),
                },
              },
              60,
              0,
            ],
          },
          // Name contains (+30)
          {
            $cond: [
              {
                $regexMatch: {
                  input: { $ifNull: ["$name", ""] },
                  regex: searchRegex,
                },
              },
              30,
              0,
            ],
          },
          // Rating boost (up to 10 points)
          { $multiply: [{ $ifNull: ["$ratings.average", 0] }, 2] },
        ],
      },
    },
  };
}
