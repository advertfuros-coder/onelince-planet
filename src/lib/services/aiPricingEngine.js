// lib/services/aiPricingEngine.js
import aiService from "./aiService";

export class AIPricingEngine {
  async getSmartPricingRecommendation(productData, marketData = {}) {
    const {
      currentPrice,
      costPrice,
      category,
      subcategory,
      salesHistory = [],
      viewCount = 0,
      stockLevel = 0,
      competitorPrices = [],
    } = productData;

    try {
      // Calculate market metrics
      const avgCompetitorPrice =
        competitorPrices.length > 0
          ? competitorPrices.reduce((sum, p) => sum + p, 0) /
            competitorPrices.length
          : currentPrice;

      const minCompetitorPrice = Math.min(...competitorPrices, currentPrice);
      const maxCompetitorPrice = Math.max(...competitorPrices, currentPrice);

      // Calculate sales velocity
      const recentSales = salesHistory.slice(-30); // Last 30 days
      const salesVelocity = recentSales.length / 30;
      const avgOrderValue =
        recentSales.length > 0
          ? recentSales.reduce((sum, s) => sum + s.quantity, 0) /
            recentSales.length
          : 0;

      // Calculate conversion rate
      const conversionRate =
        viewCount > 0 ? (recentSales.length / viewCount) * 100 : 0;

      // Get suggested margin
      const suggestedMargin = this.getSuggestedMargin(category, subcategory);

      // AI Analysis
      const prompt = `As an e-commerce pricing strategist, analyze this product and recommend an optimal price:

Product Details:
- Current Price: ₹${currentPrice}
- Cost Price: ₹${costPrice}
- Current Margin: ${(((currentPrice - costPrice) / currentPrice) * 100).toFixed(
        1,
      )}%

Market Analysis:
- Average Competitor Price: ₹${avgCompetitorPrice.toFixed(2)}
- Competitor Price Range: ₹${minCompetitorPrice} - ₹${maxCompetitorPrice}
- Category: ${category}${subcategory ? ` > ${subcategory}` : ""}

Performance Metrics:
- Sales Velocity: ${salesVelocity.toFixed(2)} units/day
- Conversion Rate: ${conversionRate.toFixed(2)}%
- View Count (30 days): ${viewCount}
- Stock Level: ${stockLevel} units
- Average Order Quantity: ${avgOrderValue.toFixed(1)}

Seasonal Context: ${this.getSeasonalContext()}

Provide pricing recommendation with reasoning. Return JSON:
{
  "recommendedPrice": number,
  "confidence": number (0-100),
  "expectedSalesIncrease": number (percentage),
  "expectedRevenueImpact": number (percentage),
  "reasoning": "string",
  "pricingStrategy": "competitive|premium|penetration|skimming",
  "timeframe": "immediate|3days|7days|14days",
  "risks": ["string"],
  "opportunities": ["string"]
}`;

      const schema = {
        recommendedPrice: "number",
        confidence: "number",
        expectedSalesIncrease: "number",
        expectedRevenueImpact: "number",
        reasoning: "string",
        pricingStrategy: "string",
        timeframe: "string",
        risks: ["string"],
        opportunities: ["string"],
      };

      const aiRecommendation = await aiService.generateStructuredData(
        prompt,
        schema,
      );

      // Validate recommendation
      const validatedPrice = this.validatePricing(
        aiRecommendation.recommendedPrice,
        costPrice,
        currentPrice,
        suggestedMargin,
      );

      return {
        success: true,
        current: {
          price: currentPrice,
          margin: (((currentPrice - costPrice) / currentPrice) * 100).toFixed(
            1,
          ),
          position: this.getMarketPosition(currentPrice, competitorPrices),
        },
        recommended: {
          price: validatedPrice,
          margin: (
            ((validatedPrice - costPrice) / validatedPrice) *
            100
          ).toFixed(1),
          change: (
            ((validatedPrice - currentPrice) / currentPrice) *
            100
          ).toFixed(1),
          changeAmount: (validatedPrice - currentPrice).toFixed(2),
        },
        analysis: {
          ...aiRecommendation,
          recommendedPrice: validatedPrice,
          marketStats: {
            avgCompetitorPrice,
            priceRange: { min: minCompetitorPrice, max: maxCompetitorPrice },
            yourPosition: this.getMarketPosition(
              currentPrice,
              competitorPrices,
            ),
          },
          performance: {
            salesVelocity: salesVelocity.toFixed(2),
            conversionRate: conversionRate.toFixed(2),
            avgOrderValue: avgOrderValue.toFixed(1),
          },
        },
        creditsUsed: 1,
      };
    } catch (error) {
      console.error("Pricing Engine Error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  validatePricing(aiPrice, costPrice, currentPrice, suggestedMargin) {
    // Ensure minimum margin
    const minPrice = costPrice * (1 + suggestedMargin.min / 100);
    const maxPrice = costPrice * (1 + suggestedMargin.max / 100);

    // Limit price change to ±30% of current price
    const maxChange = currentPrice * 0.3;
    const upperLimit = currentPrice + maxChange;
    const lowerLimit = currentPrice - maxChange;

    // Apply constraints
    let validatedPrice = aiPrice;

    if (validatedPrice < minPrice) validatedPrice = minPrice;
    if (validatedPrice > maxPrice) validatedPrice = maxPrice;
    if (validatedPrice < lowerLimit) validatedPrice = lowerLimit;
    if (validatedPrice > upperLimit) validatedPrice = upperLimit;

    // Round to nearest 0 or 9
    validatedPrice = Math.round(validatedPrice / 10) * 10 - 1;

    return Math.max(validatedPrice, minPrice);
  }

  getSuggestedMargin(category, subcategory) {
    const margins = {
      electronics: { min: 15, max: 35, optimal: 25 },
      fashion: { min: 40, max: 80, optimal: 60 },
      books: { min: 20, max: 40, optimal: 30 },
      homeandgarden: { min: 30, max: 60, optimal: 45 },
      beauty: { min: 35, max: 70, optimal: 50 },
      sports: { min: 25, max: 50, optimal: 35 },
      toys: { min: 30, max: 60, optimal: 40 },
      default: { min: 20, max: 50, optimal: 30 },
    };

    const categoryKey = category.toLowerCase().replace(/\s+/g, "");
    return margins[categoryKey] || margins.default;
  }

  getMarketPosition(price, competitorPrices) {
    if (competitorPrices.length === 0) return "unknown";

    const avgPrice =
      competitorPrices.reduce((sum, p) => sum + p, 0) / competitorPrices.length;
    const diff = ((price - avgPrice) / avgPrice) * 100;

    if (diff < -10) return "budget";
    if (diff < -5) return "competitive-low";
    if (diff < 5) return "competitive";
    if (diff < 15) return "premium";
    return "luxury";
  }

  getSeasonalContext() {
    const month = new Date().getMonth();
    const seasons = {
      0: "New Year Sale Season",
      1: "Post-Holiday",
      2: "Spring",
      3: "Spring",
      4: "Summer Start",
      5: "Mid-Year Sale",
      6: "Monsoon Sale",
      7: "Back to School",
      8: "Festive Prep",
      9: "Diwali/Festive",
      10: "Black Friday Prep",
      11: "Holiday Shopping",
    };
    return seasons[month];
  }

  async getDynamicPricingSchedule(productData, targetRevenue) {
    const prompt = `Create a 30-day dynamic pricing schedule to achieve revenue target:

Product: ${productData.name}
Current Price: ₹${productData.currentPrice}
Target Revenue: ₹${targetRevenue}
Current Stock: ${productData.stockLevel} units

Generate a day-by-day pricing strategy considering:
- Market demand patterns
- Competitor activity
- Stock depletion rate
- Seasonal trends

Return JSON with 4 weekly prices and reasoning:
{
  "week1": { "price": number, "reasoning": "string" },
  "week2": { "price": number, "reasoning": "string" },
  "week3": { "price": number, "reasoning": "string" },
  "week4": { "price": number, "reasoning": "string" },
  "projectedRevenue": number,
  "strategy": "string"
}`;

    try {
      const schema = {
        week1: { price: "number", reasoning: "string" },
        week2: { price: "number", reasoning: "string" },
        week3: { price: "number", reasoning: "string" },
        week4: { price: "number", reasoning: "string" },
        projectedRevenue: "number",
        strategy: "string",
      };

      const schedule = await aiService.generateStructuredData(prompt, schema);
      return { success: true, schedule };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

const aiPricingEngine = new AIPricingEngine();
export default aiPricingEngine;
