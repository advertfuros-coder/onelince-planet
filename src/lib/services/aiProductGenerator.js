// lib/services/aiProductGenerator.js
import aiService from "./aiService";

export async function generateProductDescription(productData) {
  const {
    name,
    category,
    subcategory,
    features = [],
    specifications = {},
    images = [],
  } = productData;

  const prompt = `You are an expert e-commerce copywriter. Create compelling, SEO-optimized product content for:

Product Name: ${name}
Category: ${category}${subcategory ? ` > ${subcategory}` : ""}
Key Features: ${features.join(", ") || "Not specified"}
Specifications: ${JSON.stringify(specifications)}

Generate a comprehensive product description that includes:
1. A catchy, SEO-optimized title (max 80 characters)
2. A compelling product description (150-250 words) that highlights benefits, not just features
3. 5-7 bullet points for key features
4. 10 relevant SEO keywords
5. 5-8 product tags for categorization

Format the response as JSON with this exact structure:
{
  "title": "string",
  "description": "string",
  "bulletPoints": ["string"],
  "keywords": ["string"],
  "tags": ["string"],
  "seoMetaDescription": "string (max 160 chars)"
}

Make it persuasive, benefit-focused, and optimized for search engines and conversions.`;

  const schema = {
    title: "string",
    description: "string",
    bulletPoints: ["string"],
    keywords: ["string"],
    tags: ["string"],
    seoMetaDescription: "string",
  };

  try {
    const result = await aiService.generateStructuredData(prompt, schema);
    return {
      success: true,
      data: result,
      creditsUsed: 1,
    };
  } catch (error) {
    console.error("Product Description Generation Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function enhanceProductTitle(currentTitle, category) {
  const prompt = `Improve this product title for better SEO and conversion:

Current Title: "${currentTitle}"
Category: ${category}

Create 3 alternative titles that are:
- SEO-optimized
- Include relevant keywords
- Max 80 characters
- More appealing to buyers

Return as JSON array: ["title1", "title2", "title3"]`;

  try {
    const response = await aiService.generateText(prompt);
    const titlesMatch = response.match(/\[(.*?)\]/s);

    if (titlesMatch) {
      const titles = JSON.parse(titlesMatch[0]);
      return { success: true, titles };
    }

    return { success: false, error: "Failed to parse titles" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function generateFromImages(images) {
  if (!images || images.length === 0) {
    return { success: false, error: "No images provided" };
  }

  try {
    const imageAnalysis = await aiService.analyzeImage(images[0]);

    const prompt = `Based on this image analysis, create a product listing:

Image Analysis: ${imageAnalysis}

Generate:
1. Product name
2. Category
3. Brief description
4. Key features (3-5 points)

Format as JSON:
{
  "name": "string",
  "category": "string",
  "description": "string",
  "features": ["string"]
}`;

    const schema = {
      name: "string",
      category: "string",
      description: "string",
      features: ["string"],
    };

    const result = await aiService.generateStructuredData(prompt, schema);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function translateDescription(description, targetLanguage) {
  const prompt = `Translate this product description to ${targetLanguage}. Maintain the persuasive tone and SEO keywords:

${description}

Return only the translated text.`;

  try {
    const translation = await aiService.generateText(prompt);
    return { success: true, translation };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function generateSocialMediaCaptions(productData) {
  const { name, description, price } = productData;

  const prompt = `Create engaging social media captions for this product:

Product: ${name}
Description: ${description}
Price: ${price}

Generate 3 captions for:
1. Instagram (with emojis, max 150 chars)
2. Twitter/X (max 280 chars)
3. Facebook (longer form, max 300 chars)

Format as JSON:
{
  "instagram": "string",
  "twitter": "string",
  "facebook": "string",
  "hashtags": ["string"]
}`;

  try {
    const schema = {
      instagram: "string",
      twitter: "string",
      facebook: "string",
      hashtags: ["string"],
    };

    const result = await aiService.generateStructuredData(prompt, schema);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
