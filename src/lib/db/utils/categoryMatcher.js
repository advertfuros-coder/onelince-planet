// lib/db/utils/categoryMatcher.js
import mongoose from "mongoose";
import Category from "@/lib/db/models/Category";

/**
 * Build a robust MongoDB filter object that matches products by category and/or subcategory.
 * Works across hierarchical categoryPaths (e.g. "electronics/mobiles/smartphones"),
 * direct category ObjectIds / strings, and category slugs / names.
 *
 * @param {string} categoryParam - Category slug or name (e.g. "electronics", "mobiles")
 * @param {string} subcategoryParam - Optional subcategory (e.g. "mobiles", "tv", "tops")
 * @returns {Promise<Object|null>} MongoDB filter object or null if no category specified
 */
export async function buildCategoryFilter(categoryParam, subcategoryParam = "") {
  const cat = (categoryParam || "").trim();
  const sub = (subcategoryParam || "").trim();

  // If both are empty, return null
  if (!cat && !sub) return null;

  // The primary target is subcategory if provided, otherwise category
  const target = sub || cat;

  // 1. If hex ObjectId (24 characters)
  if (/^[0-9a-fA-F]{24}$/.test(target)) {
    return {
      $or: [
        { category: target },
        { category: new mongoose.Types.ObjectId(target) },
      ],
    };
  }

  // 2. Query matching categories in categories collection
  let matchedCategories = [];
  try {
    const CategoryModel = mongoose.models.Category || Category;
    if (CategoryModel) {
      matchedCategories = await CategoryModel.find({
        $or: [
          { slug: new RegExp(`^${target}$`, "i") },
          { name: new RegExp(`^${target}$`, "i") },
          { path: new RegExp(`(^|/)${target}(/|$)`, "i") },
        ],
      })
        .select("_id slug path name")
        .lean();
    }
  } catch (err) {
    console.error("Category lookup error in buildCategoryFilter:", err);
  }

  // 3. Base product match conditions
  const conditions = [
    { category: new RegExp(`(^|/)${target}(/|$)`, "i") },
    { categoryPath: new RegExp(`(^|/)${target}(/|$)`, "i") },
    { subCategory: new RegExp(`(^|/)${target}(/|$)`, "i") },
  ];

  // Smart aliases & word boundary regexes
  if (/^mobiles?$/i.test(target) || /^smartphones?$/i.test(target)) {
    conditions.push({
      categoryPath: /(?:^|\/|\b)(?:mobiles?|smartphones?)(?:$|\/|\b)/i,
    });
  } else if (/^electronics?$/i.test(target)) {
    conditions.push({ categoryPath: /^electronics(?:\/|$)/i });
  } else if (/^(?:headphone|earbud|tws|audio)s?$/i.test(target)) {
    conditions.push({ categoryPath: /(?:audio|headphone|earbud|tws)/i });
  } else if (/^(?:tv|television|smart-tv)s?$/i.test(target)) {
    conditions.push({ categoryPath: /(?:tv|television)/i });
    conditions.push({ category: /(?:tv|television)/i });
  } else if (/^(?:ac|air-conditioner|appliance|home-appliances)s?$/i.test(target)) {
    conditions.push({ categoryPath: /(?:air-conditioner|appliance)/i });
  } else if (/^(?:women-tops|tops|top|tees|t-shirts)$/i.test(target)) {
    conditions.push({ categoryPath: /(?:women-tops|tops)/i });
  } else if (/^fashion$/i.test(target)) {
    conditions.push({ categoryPath: /^fashion(?:\/|$)/i });
  }

  // Add DB matched categories
  matchedCategories.forEach((c) => {
    conditions.push({ category: c._id });
    conditions.push({ category: c._id.toString() });
    conditions.push({ category: c.name });
    if (c.path) {
      conditions.push({ categoryPath: new RegExp(`(^|/)${c.path}(/|$)`, "i") });
    }
    if (c.slug) {
      conditions.push({ categoryPath: new RegExp(`(^|/)${c.slug}(/|$)`, "i") });
    }
  });

  return { $or: conditions };
}
