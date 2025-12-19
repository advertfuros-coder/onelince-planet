// lib/services/aiBusinessCoach.js
import aiService from "./aiService";

export class AIBusinessCoach {
  async analyzeSellerPerformance(sellerData) {
    const {
      sellerId,
      businessName,
      totalProducts,
      totalOrders,
      totalRevenue,
      averageRating,
      responseTime,
      fulfillmentRate,
      returnRate,
      categoryPerformance = [],
      monthlyTrends = [],
      competitorData = {},
    } = sellerData;

    const prompt = `As a business consultant, analyze this seller's performance and provide actionable insights:

Business Overview:
- Business Name: ${businessName}
- Total Products: ${totalProducts}
- Total Orders: ${totalOrders}
- Total Revenue: ₹${totalRevenue}
- Average Rating: ${averageRating}/5
- Response Time: ${responseTime} hours
- Fulfillment Rate: ${fulfillmentRate}%
- Return Rate: ${returnRate}%

Category Performance:
${categoryPerformance
  .map((c) => `- ${c.category}: ${c.orders} orders, ₹${c.revenue} revenue`)
  .join("\n")}

Recent Trend: ${this.analyzeTrend(monthlyTrends)}

Provide comprehensive analysis with actionable recommendations. Return JSON:
{
  "overallScore": number (0-100),
  "strengths": ["string"],
  "weaknesses": ["string"],
  "opportunities": ["string"],
  "threats": ["string"],
  "priorityActions": [
    {
      "action": "string",
      "impact": "high|medium|low",
      "effort": "high|medium|low",
      "timeline": "string",
      "expectedOutcome": "string"
    }
  ],
  "categoryInsights": {
    "bestPerforming": "string",
    "underperforming": "string",
    "recommendation": "string"
  },
  "pricingRecommendation": "string",
  "marketingAdvice": "string",
  "inventoryAdvice": "string",
  "customerServiceTips": ["string"],
  "growthProjection": {
    "30days": "string",
    "90days": "string",
    "12months": "string"
  }
}`;

    try {
      const schema = {
        overallScore: "number",
        strengths: ["string"],
        weaknesses: ["string"],
        opportunities: ["string"],
        threats: ["string"],
        priorityActions: [
          {
            action: "string",
            impact: "string",
            effort: "string",
            timeline: "string",
            expectedOutcome: "string",
          },
        ],
        categoryInsights: {
          bestPerforming: "string",
          underperforming: "string",
          recommendation: "string",
        },
        pricingRecommendation: "string",
        marketingAdvice: "string",
        inventoryAdvice: "string",
        customerServiceTips: ["string"],
        growthProjection: {
          "30days": "string",
          "90days": "string",
          "12months": "string",
        },
      };

      const analysis = await aiService.generateStructuredData(prompt, schema);

      return {
        success: true,
        analysis,
        generatedAt: new Date().toISOString(),
        creditsUsed: 2,
      };
    } catch (error) {
      console.error("Business Coach Error:", error);

      // Check if it's an API key issue
      if (
        error.message.includes("not configured") ||
        error.message.includes("API key")
      ) {
        return {
          success: false,
          needsSetup: true,
          message:
            "AI features need setup. Please add your Gemini API key to enable AI Business Coach.",
          setupInstructions:
            "Get a free API key at https://makersuite.google.com/app/apikey and add it to your .env.local file as GOOGLE_GEMINI_API_KEY",
        };
      }

      return {
        success: false,
        error: error.message || "Failed to analyze performance",
      };
    }
  }

  async generateWeeklyReport(sellerData, weekData) {
    const prompt = `Generate a weekly performance summary for ${
      sellerData.businessName
    }:

This Week:
- Orders: ${weekData.orders} (${weekData.ordersChange > 0 ? "+" : ""}${
      weekData.ordersChange
    }% vs last week)
- Revenue: ₹${weekData.revenue} (${weekData.revenueChange > 0 ? "+" : ""}${
      weekData.revenueChange
    }%)
- New Products Listed: ${weekData.newProducts}
- Average Rating: ${weekData.avgRating}/5
- Top Product: ${weekData.topProduct}

Create a friendly, motivational summary (150-200 words) that:
1. Celebrates wins
2. Highlights key metrics
3. Provides 2-3 actionable tips for next week
4. Ends with encouragement

Use emojis appropriately. Be personal and supportive.`;

    try {
      const report = await aiService.generateText(prompt, { maxTokens: 400 });
      return { success: true, report };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async suggestNewProducts(sellerData) {
    const { categories, topProducts, customerDemographics, seasonalTrends } =
      sellerData;

    const prompt = `Based on this seller's performance, suggest 5 new products they should add:

Current Success:
- Top Categories: ${categories.join(", ")}
- Best Sellers: ${topProducts.map((p) => p.name).join(", ")}
- Customer Demographics: ${JSON.stringify(customerDemographics)}
- Season: ${this.getCurrentSeason()}

Suggest products that:
- Complement existing catalog
- Match customer demand
- Have good profit margins
- Are trending in the market
- Are seasonal winners

Return JSON:
{
  "suggestions": [
    {
      "productName": "string",
      "category": "string",
      "reasoning": "string",
      "estimatedDemand": "high|medium|low",
      "profitPotential": "high|medium|low",
      "competitionLevel": "high|medium|low",
      "suggestedPriceRange": "string",
      "targetAudience": "string"
    }
  ]
}`;

    try {
      const schema = {
        suggestions: [
          {
            productName: "string",
            category: "string",
            reasoning: "string",
            estimatedDemand: "string",
            profitPotential: "string",
            competitionLevel: "string",
            suggestedPriceRange: "string",
            targetAudience: "string",
          },
        ],
      };

      const result = await aiService.generateStructuredData(prompt, schema);
      return { success: true, ...result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async optimizeListings(products) {
    const lowPerformers = products.filter(
      (p) => p.views > 100 && p.orders / p.views < 0.02
    );

    if (lowPerformers.length === 0) {
      return {
        success: true,
        message: "All products are performing well!",
        recommendations: [],
      };
    }

    const recommendations = [];

    for (const product of lowPerformers.slice(0, 5)) {
      const prompt = `Analyze why this product isn't converting and suggest improvements:

Product: ${product.name}
Category: ${product.category}
Price: ₹${product.price}
Views: ${product.views}
Orders: ${product.orders}
Conversion Rate: ${((product.orders / product.views) * 100).toFixed(2)}%

Current Description: ${product.description?.slice(0, 200)}

Provide specific, actionable improvements for:
1. Title optimization
2. Description enhancement  
3. Pricing strategy
4. Images/visuals
5. Keywords/SEO

Return JSON:
{
  "issues": ["string"],
  "improvements": [
    {
      "area": "string",
      "current": "string",
      "suggested": "string",
      "impact": "high|medium|low"
    }
  ],
  "priority": "high|medium|low"
}`;

      try {
        const schema = {
          issues: ["string"],
          improvements: [
            {
              area: "string",
              current: "string",
              suggested: "string",
              impact: "string",
            },
          ],
          priority: "string",
        };

        const analysis = await aiService.generateStructuredData(prompt, schema);
        recommendations.push({
          productId: product._id,
          productName: product.name,
          ...analysis,
        });
      } catch (error) {
        console.error(`Error analyzing product ${product._id}:`, error);
      }
    }

    return {
      success: true,
      productsAnalyzed: recommendations.length,
      recommendations,
      creditsUsed: recommendations.length,
    };
  }

  async generateMarketingStrategy(sellerData, budget, goals) {
    const prompt = `Create a marketing strategy for ${sellerData.businessName}:

Budget: ₹${budget}/month
Goals: ${goals.join(", ")}

Current Stats:
- Monthly Revenue: ₹${sellerData.monthlyRevenue}
- Products: ${sellerData.totalProducts}
- Average Order Value: ₹${sellerData.avgOrderValue}
- Customer Base: ${sellerData.customers}

Create a comprehensive marketing plan. Return JSON:
{
  "channels": [
    {
      "channel": "string",
      "budget": number,
      "activities": ["string"],
      "expectedROI": "string",
      "timeline": "string"
    }
  ],
  "contentStrategy": {
    "postingFrequency": "string",
    "contentTypes": ["string"],
    "platforms": ["string"]
  },
  "campaignIdeas": ["string"],
  "kpis": ["string"],
  "timeline": {
    "week1": "string",
    "week2": "string",
    "week3": "string",
    "week4": "string"
  },
  "expectedResults": "string"
}`;

    try {
      const schema = {
        channels: [
          {
            channel: "string",
            budget: "number",
            activities: ["string"],
            expectedROI: "string",
            timeline: "string",
          },
        ],
        contentStrategy: {
          postingFrequency: "string",
          contentTypes: ["string"],
          platforms: ["string"],
        },
        campaignIdeas: ["string"],
        kpis: ["string"],
        timeline: {
          week1: "string",
          week2: "string",
          week3: "string",
          week4: "string",
        },
        expectedResults: "string",
      };

      const strategy = await aiService.generateStructuredData(prompt, schema);
      return { success: true, strategy, creditsUsed: 2 };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  analyzeTrend(monthlyData) {
    if (monthlyData.length < 2) return "Insufficient data";

    const recent = monthlyData.slice(-3);
    const growth = recent.map((m, i) =>
      i > 0
        ? (
            ((m.revenue - recent[i - 1].revenue) / recent[i - 1].revenue) *
            100
          ).toFixed(1)
        : 0
    );

    const avgGrowth =
      growth.slice(1).reduce((sum, g) => sum + parseFloat(g), 0) /
      (growth.length - 1);

    if (avgGrowth > 10) return "Strong growth trajectory";
    if (avgGrowth > 5) return "Steady growth";
    if (avgGrowth > 0) return "Slight growth";
    if (avgGrowth > -5) return "Slight decline";
    return "Concerning decline";
  }

  getCurrentSeason() {
    const month = new Date().getMonth();
    const seasons = [
      "Winter",
      "Winter",
      "Spring",
      "Spring",
      "Summer",
      "Summer",
      "Monsoon",
      "Monsoon",
      "Fall",
      "Fall",
      "Winter",
      "Winter",
    ];
    return seasons[month];
  }
}

export default new AIBusinessCoach();
