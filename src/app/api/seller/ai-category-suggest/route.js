// API Route: /api/seller/ai-category-suggest/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import Category from "@/lib/db/models/Category";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * POST /api/seller/ai-category-suggest
 * AI-powered category suggestion based on product details
 *
 * Request Body:
 * {
 *   productName: string (required)
 *   description?: string
 *   brand?: string
 *   keywords?: string[]
 * }
 */
export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { productName, description = "", brand = "", keywords = [] } = body;

    if (!productName) {
      return NextResponse.json(
        { success: false, message: "Product name is required" },
        { status: 400 }
      );
    }

    // Fetch all categories to build taxonomy context
    const categories = await Category.find({ isActive: true })
      .select("name slug path level parentId")
      .lean();

    // Build a hierarchical taxonomy string for the AI
    const taxonomyMap = buildTaxonomyTree(categories);
    const taxonomyString = formatTaxonomyForAI(taxonomyMap);

    // Prepare the prompt for Gemini
    const prompt = `You are an expert e-commerce product categorization system for an online marketplace in Dubai (UAE).

PRODUCT DETAILS:
- Name: ${productName}
- Description: ${description || "Not provided"}
- Brand: ${brand || "Not provided"}
- Keywords: ${keywords.length > 0 ? keywords.join(", ") : "Not provided"}

AVAILABLE CATEGORY TAXONOMY:
${taxonomyString}

TASK:
Analyze the product details and suggest the TOP 3 most appropriate category paths from the taxonomy above.
For each suggestion, provide:
1. The complete category path (e.g., "fashion/men/t-shirts")
2. A confidence score (0-100)
3. A brief reason (one sentence explaining why this category fits)

Consider:
- Product type, purpose, and target audience
- Common shopping patterns in Dubai/UAE market
- Cultural context (modest fashion, local preferences)
- The most SPECIFIC category level possible (aim for level 3)

Respond ONLY with valid JSON in this exact format:
{
  "suggestions": [
    {
      "path": "fashion/men/t-shirts",
      "confidence": 92,
      "reason": "Product name indicates casual men's wear, t-shirt category most specific"
    },
    {
      "path": "fashion/men/shirts", 
      "confidence": 75,
      "reason": "Alternative if product is more formal than typical t-shirt"
    },
    {
      "path": "fashion/women/tops",
      "confidence": 45,
      "reason": "Possible if unisex or women's product not clearly specified"
    }
  ]
}`;

    // Call Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Clean the response (remove markdown code blocks if present)
    const cleanedText = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Parse AI response
    let aiResponse;
    try {
      aiResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", cleanedText);
      throw new Error("Invalid AI response format");
    }

    // Validate and enrich suggestions with full category details
    const enrichedSuggestions = [];
    for (const suggestion of aiResponse.suggestions) {
      const category = categories.find((cat) => cat.path === suggestion.path);

      if (category) {
        // Get full hierarchy
        const hierarchy = await getCategoryHierarchy(category, categories);

        enrichedSuggestions.push({
          categoryId: category._id,
          path: category.path,
          name: category.name,
          level: category.level,
          confidence: Math.min(100, Math.max(0, suggestion.confidence)), // Clamp 0-100
          reason: suggestion.reason,
          hierarchy: hierarchy,
          requiresApproval: category.requiresApproval || false,
        });
      }
    }

    // Sort by confidence
    enrichedSuggestions.sort((a, b) => b.confidence - a.confidence);

    return NextResponse.json({
      success: true,
      data: {
        suggestions: enrichedSuggestions.slice(0, 3), // Ensure max 3
        productAnalyzed: {
          name: productName,
          description: description
            ? description.substring(0, 100) + "..."
            : null,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        model: "gemini-2.0-flash-exp",
      },
    });
  } catch (error) {
    console.error("[API] /api/seller/ai-category-suggest error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to generate category suggestions",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Build a map of categories organized by parent
 */
function buildTaxonomyTree(categories) {
  const map = new Map();

  // Group by parent
  categories.forEach((cat) => {
    const parentKey = cat.parentId ? cat.parentId.toString() : "root";
    if (!map.has(parentKey)) {
      map.set(parentKey, []);
    }
    map.get(parentKey).push(cat);
  });

  return map;
}

/**
 * Format taxonomy as a readable string for AI
 */
function formatTaxonomyForAI(taxonomyMap) {
  let output = "";

  // Get root categories (level 1)
  const rootCategories = taxonomyMap.get("root") || [];

  rootCategories.forEach((level1) => {
    output += `\n● ${level1.name} (${level1.path})\n`;

    // Get level 2 children
    const level2Children = taxonomyMap.get(level1._id.toString()) || [];
    level2Children.forEach((level2) => {
      output += `  ○ ${level2.name} (${level2.path})\n`;

      // Get level 3 children
      const level3Children = taxonomyMap.get(level2._id.toString()) || [];
      level3Children.forEach((level3) => {
        output += `    - ${level3.name} (${level3.path})\n`;
      });
    });
  });

  return output;
}

/**
 * Get full hierarchy names for a category
 */
async function getCategoryHierarchy(category, allCategories) {
  const hierarchy = {
    level1: null,
    level2: null,
    level3: null,
  };

  if (category.level === 3) {
    hierarchy.level3 = category.name;
    const level2 = allCategories.find(
      (cat) => cat._id.toString() === category.parentId?.toString()
    );
    if (level2) {
      hierarchy.level2 = level2.name;
      const level1 = allCategories.find(
        (cat) => cat._id.toString() === level2.parentId?.toString()
      );
      if (level1) {
        hierarchy.level1 = level1.name;
      }
    }
  } else if (category.level === 2) {
    hierarchy.level2 = category.name;
    const level1 = allCategories.find(
      (cat) => cat._id.toString() === category.parentId?.toString()
    );
    if (level1) {
      hierarchy.level1 = level1.name;
    }
  } else {
    hierarchy.level1 = category.name;
  }

  return hierarchy;
}
