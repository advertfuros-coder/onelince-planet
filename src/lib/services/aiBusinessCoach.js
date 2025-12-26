// lib/services/aiBusinessCoach.js
import aiService from "./aiService";

export class AIBusinessCoach {
  /**
   * Analyze seller performance with comprehensive insights
   */
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

    const trendAnalysis = this.analyzeTrend(monthlyTrends);

    const prompt = `As an expert business consultant, analyze this seller's e-commerce performance and provide actionable insights:

Business Overview:
- Business Name: ${businessName}
- Total Products: ${totalProducts}
- Total Orders: ${totalOrders}
- Total Revenue: ₹${totalRevenue.toLocaleString("en-IN")}
- Average Rating: ${averageRating}/5
- Response Time: ${responseTime} hours
- Fulfillment Rate: ${fulfillmentRate}%
- Return Rate: ${returnRate}%

Category Performance:
${
  categoryPerformance.length > 0
    ? categoryPerformance
        .map(
          (c) =>
            `- ${c.category}: ${c.orders} orders, ₹${c.revenue.toLocaleString(
              "en-IN"
            )} revenue`
        )
        .join("\n")
    : "No category data available"
}

Recent Trend: ${trendAnalysis}

Provide comprehensive analysis with:
1. Overall performance score (0-100)
2. 3-4 key strengths
3. 3-4 areas needing improvement
4. 3-5 growth opportunities
5. 2-3 potential threats
6. 3-5 priority actions with impact, effort, timeline, and expected outcomes
7. Category-specific insights (best performing, underperforming, recommendation)
8. Pricing strategy recommendations
9. Marketing advice tailored to the business
10. Inventory management tips
11. 3-4 customer service improvement tips
12. Growth projections for 30 days, 90 days, and 12 months

Be specific, actionable, and data-driven. Focus on practical recommendations.`;

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
      console.error("Business Coach Analysis Error:", error);

      // Check if it's a configuration issue
      const isConfigIssue =
        error.code === "AI_CONFIG_MISSING" ||
        error.message?.includes("not configured") ||
        error.message?.includes("API key");

      if (isConfigIssue) {
        return {
          success: false,
          needsSetup: true,
          message:
            "AI API key not configured. Please set GOOGLE_GEMINI_API_KEY in your environment variables.",
        };
      }

      // Check for model not found
      const isModelIssue =
        error.code === "AI_MODEL_NOT_FOUND" ||
        error.message?.includes("404") ||
        error.message?.includes("not found");

      // Check for quota issues
      const isQuotaIssue =
        error.code === "AI_QUOTA_EXCEEDED" ||
        error.message?.includes("429") ||
        error.message?.includes("quota") ||
        error.message?.includes("limit");

      // Check for parse issues
      const isParseIssue =
        error.code === "AI_PARSE_ERROR" ||
        error.message?.includes("JSON") ||
        error.message?.includes("parse");

      // Return fallback analysis
      const fallbackAnalysis = this.generateFallbackAnalysis(sellerData);

      return {
        success: true,
        isFallback: true,
        analysis: fallbackAnalysis,
        generatedAt: new Date().toISOString(),
        warning: isQuotaIssue
          ? "AI service quota temporarily exceeded. Showing standard analysis based on your data."
          : isModelIssue
          ? "AI model temporarily unavailable. Showing standard analysis based on your data."
          : isParseIssue
          ? "AI response format issue. Showing standard analysis based on your data."
          : "AI service temporarily unavailable. Showing standard analysis based on your data.",
        originalError: error.message,
      };
    }
  }

  /**
   * Generate high-quality fallback analysis when AI is unavailable
   */
  generateFallbackAnalysis(sellerData) {
    const {
      totalProducts,
      totalOrders,
      totalRevenue,
      averageRating,
      fulfillmentRate,
      returnRate,
      categoryPerformance = [],
      monthlyTrends = [],
    } = sellerData;

    // Calculate a basic performance score
    let score = 50;
    if (totalProducts >= 20) score += 10;
    else if (totalProducts >= 10) score += 5;

    if (totalOrders >= 100) score += 15;
    else if (totalOrders >= 50) score += 10;
    else if (totalOrders >= 10) score += 5;

    if (averageRating >= 4.5) score += 10;
    else if (averageRating >= 4.0) score += 7;
    else if (averageRating >= 3.5) score += 4;

    if (fulfillmentRate >= 95) score += 10;
    else if (fulfillmentRate >= 85) score += 5;

    if (returnRate <= 3) score += 5;
    else if (returnRate <= 5) score += 3;

    score = Math.min(score, 100);

    // Determine strengths based on metrics
    const strengths = [];
    if (totalProducts >= 10)
      strengths.push(
        `Active product catalog with ${totalProducts} listings showing market presence`
      );
    if (totalOrders >= 50)
      strengths.push(
        `Consistent order generation with ${totalOrders} total orders`
      );
    if (averageRating >= 4.0)
      strengths.push(
        `Good customer satisfaction reflected in ${averageRating}/5 rating`
      );
    if (fulfillmentRate >= 90)
      strengths.push(
        `Reliable order fulfillment at ${fulfillmentRate}% completion rate`
      );
    if (categoryPerformance.length > 0) {
      const topCategory = categoryPerformance.sort(
        (a, b) => b.revenue - a.revenue
      );
      strengths.push(
        `Strong performance in ${topCategory.category} category with ₹${topCategory.revenue.toLocaleString(
          "en-IN"
        )} revenue`
      );
    }

    if (strengths.length === 0) {
      strengths.push("Getting started with your e-commerce journey");
      strengths.push("Building foundation for future growth");
    }

    // Determine weaknesses
    const weaknesses = [];
    if (totalProducts < 10)
      weaknesses.push(
        "Limited product variety - expand catalog to attract more customers"
      );
    if (totalOrders < 20)
      weaknesses.push(
        "Low order volume - focus on marketing and customer acquisition"
      );
    if (averageRating < 4.0)
      weaknesses.push(
        "Customer satisfaction needs improvement - review feedback and address issues"
      );
    if (fulfillmentRate < 85)
      weaknesses.push(
        "Fulfillment rate below industry standard - streamline operations"
      );
    if (returnRate > 5)
      weaknesses.push(
        "High return rate - review product quality and descriptions"
      );

    if (weaknesses.length === 0) {
      weaknesses.push(
        "AI analysis temporarily unavailable for detailed insights"
      );
      weaknesses.push("Consider expanding into complementary product categories");
    }

    // Opportunities
    const opportunities = [
      "Expand product catalog to increase customer choice and market reach",
      "Implement targeted social media marketing campaigns to drive traffic",
      "Optimize product listings with better images and detailed descriptions",
      "Consider bundle offers and seasonal promotions to boost average order value",
      "Build customer loyalty program to encourage repeat purchases",
    ];

    // Threats
    const threats = [
      "Increasing competition in e-commerce requires continuous innovation",
      "Market demand fluctuations can impact sales consistency",
      "Rising customer acquisition costs affecting profit margins",
    ];

    // Priority actions based on current state
    const priorityActions = [];

    if (totalOrders < 50) {
      priorityActions.push({
        action: "Launch targeted marketing campaign to increase visibility",
        impact: "high",
        effort: "medium",
        timeline: "Next 2 weeks",
        expectedOutcome:
          "Increase traffic by 30-40% and generate 10-15 additional orders",
      });
    }

    if (totalProducts < 20) {
      priorityActions.push({
        action: "Add 5-10 new products in your best-performing categories",
        impact: "high",
        effort: "medium",
        timeline: "Next 7-10 days",
        expectedOutcome:
          "Broaden product range and capture additional customer segments",
      });
    }

    priorityActions.push(
      {
        action: "Review and optimize top 5 product listings",
        impact: "high",
        effort: "low",
        timeline: "Next 48 hours",
        expectedOutcome:
          "Improve conversion rate by 15-20% on key products",
      },
      {
        action: "Analyze competitor pricing and adjust strategy",
        impact: "high",
        effort: "medium",
        timeline: "Next 3-5 days",
        expectedOutcome:
          "Ensure competitive positioning and improve profit margins",
      },
      {
        action: "Implement customer feedback collection system",
        impact: "medium",
        effort: "low",
        timeline: "Next week",
        expectedOutcome:
          "Gather actionable insights for product and service improvement",
      }
    );

    // Category insights
    let categoryInsights = {
      bestPerforming: "Review your sales data to identify top categories",
      underperforming: "Identify categories with low conversion rates",
      recommendation:
        "Focus inventory and marketing efforts on proven bestsellers",
    };

    if (categoryPerformance.length > 0) {
      const sorted = [...categoryPerformance].sort(
        (a, b) => b.revenue - a.revenue
      );
      categoryInsights = {
        bestPerforming: `${sorted[0].category} leading with ₹${sorted[0].revenue.toLocaleString(
          "en-IN"
        )} revenue`,
        underperforming:
          sorted.length > 1
            ? `${sorted[sorted.length - 1].category} needs attention`
            : "Monitor emerging categories",
        recommendation: `Double down on ${sorted[0].category} while testing new subcategories`,
      };
    }

    // Growth projections based on trends
    let projections = {
      "30days":
        "Focus on operational excellence and customer satisfaction to build momentum",
      "90days":
        "Target 15-25% growth through expanded product range and marketing efforts",
      "12months":
        "Aim for 2-3x revenue growth through diversification and brand building",
    };

    if (monthlyTrends.length >= 2) {
      const latest = monthlyTrends[monthlyTrends.length - 1];
      const previous = monthlyTrends[monthlyTrends.length - 2];
      const growth = ((latest.revenue - previous.revenue) / previous.revenue) * 100;

      if (growth > 20) {
        projections = {
          "30days": `Maintain strong momentum with ${growth.toFixed(
            0
          )}% growth trend`,
          "90days":
            "Scale operations to support 30-40% quarterly growth trajectory",
          "12months": "Potential to achieve 3-4x revenue with sustained growth rate",
        };
      } else if (growth > 0) {
        projections = {
          "30days": `Continue positive trend with ${growth.toFixed(
            0
          )}% growth rate`,
          "90days":
            "Target 20-30% growth through optimized marketing and product expansion",
          "12months": "Achieve 2-3x revenue with consistent execution",
        };
      }
    }

    return {
      overallScore: score,
      strengths: strengths.slice(0, 4),
      weaknesses: weaknesses.slice(0, 4),
      opportunities: opportunities.slice(0, 5),
      threats: threats.slice(0, 3),
      priorityActions: priorityActions.slice(0, 5),
      categoryInsights,
      pricingRecommendation:
        totalRevenue > 100000
          ? "Monitor competitor prices weekly. Consider premium positioning for top products with 10-15% margin increase."
          : "Implement competitive pricing strategy. Offer introductory discounts (5-10%) on new products to gather reviews and build momentum.",
      marketingAdvice:
        totalOrders < 50
          ? "Focus on organic social media growth. Share product stories, customer testimonials, and behind-the-scenes content. Allocate ₹5,000-10,000 for targeted Facebook/Instagram ads."
          : "Scale marketing efforts with mix of paid ads (40%), influencer partnerships (30%), and content marketing (30%). Track ROI for each channel.",
      inventoryAdvice:
        totalProducts < 20
          ? "Maintain 3-4 week stock for all products. Prioritize restocking bestsellers within 24 hours of low-stock alerts."
          : "Implement ABC inventory analysis. Keep 4-week stock for A items (top 20% revenue), 2-week for B items, 1-week for C items.",
      customerServiceTips: [
        "Respond to all customer inquiries within 12 hours maximum",
        "Proactively request feedback 3-5 days after delivery",
        "Address negative reviews within 24 hours with solutions",
        "Create FAQ section addressing common customer questions",
      ],
      growthProjection: projections,
    };
  }

  /**
   * Analyze monthly revenue trends
   */
  analyzeTrend(monthlyTrends) {
    if (!monthlyTrends || monthlyTrends.length < 2) {
      return "Insufficient historical data for trend analysis. Continue building your sales history.";
    }

    const latest = monthlyTrends[monthlyTrends.length - 1];
    const previous = monthlyTrends[monthlyTrends.length - 2];

    if (latest.revenue === 0 && previous.revenue === 0) {
      return "Starting your revenue journey. Focus on first sales.";
    }

    if (previous.revenue === 0) {
      return `New revenue generation of ₹${latest.revenue.toLocaleString(
        "en-IN"
      )} this month.`;
    }

    const change = ((latest.revenue - previous.revenue) / previous.revenue) * 100;
    const absoluteChange = latest.revenue - previous.revenue;

    if (change > 50)
      return `Exceptional growth: +${change.toFixed(
        1
      )}% (₹${absoluteChange.toLocaleString(
        "en-IN"
      )}) vs previous month. Scale operations to maintain momentum.`;
    if (change > 20)
      return `Strong growth: +${change.toFixed(
        1
      )}% (₹${absoluteChange.toLocaleString(
        "en-IN"
      )}) vs previous month. Continue current strategies.`;
    if (change > 5)
      return `Positive growth: +${change.toFixed(
        1
      )}% (₹${absoluteChange.toLocaleString(
        "en-IN"
      )}) vs previous month. Steady progress.`;
    if (change > -5)
      return `Stable performance: ${change.toFixed(
        1
      )}% change. Focus on consistency and optimization.`;
    if (change > -20)
      return `Declining trend: ${change.toFixed(
        1
      )}% (₹${Math.abs(absoluteChange).toLocaleString(
        "en-IN"
      )}) vs previous month. Review strategy and address issues.`;
    return `Significant decline: ${change.toFixed(
      1
    )}% (₹${Math.abs(absoluteChange).toLocaleString(
      "en-IN"
    )}) vs previous month. Urgent action needed.`;
  }

  /**
   * Get current season for India
   */
  getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "Spring (Mar-May)";
    if (month >= 5 && month <= 8) return "Summer/Monsoon (Jun-Sep)";
    if (month >= 9 && month <= 10) return "Autumn/Festive (Oct-Nov)";
    return "Winter (Dec-Feb)";
  }

  /**
   * Suggest new products to add to catalog
   */
  async suggestNewProducts(sellerData) {
    const { categories, topProducts, customerDemographics } = sellerData;

    const prompt = `As a product sourcing consultant for Indian e-commerce, suggest 5 new products this seller should add:

Current Business:
- Top Categories: ${categories.join(", ")}
- Best Sellers: ${topProducts.map((p) => p.name).join(", ")}
- Current Season: ${this.getCurrentSeason()}

Suggest products that:
- Complement existing catalog
- Match seasonal demand in India
- Have proven market demand
- Offer good profit margins (30%+ markup)
- Are trending in e-commerce
- Can be sourced reliably

For each suggestion, be specific with product names and justify with market data.`;

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
      console.error("Product Suggestion Error:", error);

      // Fallback suggestions based on current categories
      const fallbackSuggestions = this.generateFallbackProductSuggestions(
        categories
      );

      return {
        success: true,
        isFallback: true,
        suggestions: fallbackSuggestions,
        warning: "AI service unavailable. Showing standard product suggestions.",
      };
    }
  }

  /**
   * Generate fallback product suggestions
   */
  generateFallbackProductSuggestions(categories) {
    const season = this.getCurrentSeason();

    // Default suggestions that work for most categories
    const suggestions = [
      {
        productName: "Premium Gift Set",
        category: categories || "General",
        reasoning: `High demand during festive season in India. Gift sets offer high perceived value and are perfect for ${season}.`,
        estimatedDemand: "high",
        profitPotential: "high",
        competitionLevel: "medium",
        suggestedPriceRange: "₹1,499 - ₹2,999",
        targetAudience: "Gifting customers, corporate buyers, festival shoppers",
      },
      {
        productName: "Eco-Friendly Product Line",
        category: categories || "General",
        reasoning:
          "Growing consumer preference for sustainable products. Premium pricing justified by eco-conscious buyers.",
        estimatedDemand: "medium",
        profitPotential: "high",
        competitionLevel: "low",
        suggestedPriceRange: "₹799 - ₹1,999",
        targetAudience: "Environmentally conscious millennials and Gen Z",
      },
      {
        productName: "Travel Essentials Kit",
        category: categories || "General",
        reasoning:
          "Post-pandemic travel boom continues. Compact, travel-friendly products have consistent demand.",
        estimatedDemand: "medium",
        profitPotential: "high",
        competitionLevel: "medium",
        suggestedPriceRange: "₹599 - ₹1,499",
        targetAudience: "Frequent travelers, working professionals, students",
      },
      {
        productName: "Premium Accessories Bundle",
        category: categories || "General",
        reasoning:
          "Bundled products increase average order value. Accessories have high margins and low return rates.",
        estimatedDemand: "high",
        profitPotential: "high",
        competitionLevel: "medium",
        suggestedPriceRange: "₹899 - ₹1,799",
        targetAudience: "Existing customers looking for add-ons",
      },
      {
        productName: "Personalized/Customizable Product",
        category: categories || "General",
        reasoning:
          "Personalization drives premium pricing and customer loyalty. Low competition in this segment.",
        estimatedDemand: "medium",
        profitPotential: "high",
        competitionLevel: "low",
        suggestedPriceRange: "₹1,299 - ₹2,499",
        targetAudience: "Gift buyers, customers seeking unique products",
      },
    ];

    return suggestions;
  }

  /**
   * Generate weekly performance report
   */
  async generateWeeklyReport(sellerData, weekData) {
    const prompt = `Generate an encouraging weekly performance summary for ${
      sellerData.businessName
    }:

This Week's Performance:
- Orders: ${weekData.orders} (${weekData.ordersChange > 0 ? "+" : ""}${
      weekData.ordersChange
    }% vs last week)
- Revenue: ₹${weekData.revenue.toLocaleString("en-IN")} (${
      weekData.revenueChange > 0 ? "+" : ""
    }${weekData.revenueChange}%)
- New Products Listed: ${weekData.newProducts}
- Average Rating: ${weekData.avgRating}/5
- Top Product: ${weekData.topProduct}

Create a friendly, motivational summary (150-200 words) that:
1. Celebrates wins and achievements
2. Highlights key performance metrics
3. Provides 2-3 actionable tips for next week
4. Ends with encouragement and motivation

Use appropriate emojis. Be personal, supportive, and energetic.`;

    try {
      const report = await aiService.generateText(prompt, { maxTokens: 400 });
      return { success: true, report };
    } catch (error) {
      console.error("Weekly Report Error:", error);

      // Fallback report
      const fallbackReport = this.generateFallbackWeeklyReport(
        sellerData,
        weekData
      );
      return {
        success: true,
        isFallback: true,
        report: fallbackReport,
      };
    }
  }

  /**
   * Generate fallback weekly report
   */
  generateFallbackWeeklyReport(sellerData, weekData) {
    const greeting =
      weekData.ordersChange > 0
        ? "🎉 Great week"
        : weekData.ordersChange === 0
        ? "📊 Steady progress"
        : "💪 Keep pushing";

    return `${greeting} for ${sellerData.businessName}!

You completed ${weekData.orders} orders this week${
      weekData.ordersChange > 0
        ? ` - that's ${weekData.ordersChange}% growth! 🚀`
        : `. Let's aim higher next week!`
    } Revenue reached ₹${weekData.revenue.toLocaleString("en-IN")}${
      weekData.revenueChange > 0 ? ` (+${weekData.revenueChange}%) 💰` : ``
    }.

${
  weekData.newProducts > 0
    ? `Added ${weekData.newProducts} new products - expanding your reach! 🌟`
    : ``
}
Maintaining a solid ${weekData.avgRating}/5 rating shows your commitment to quality.

**Tips for Next Week:**
1. Review your top performer "${weekData.topProduct}" - what makes it successful?
2. Engage with customers who left reviews to build relationships
3. Optimize listings with better images and descriptions

Remember: Every successful business started where you are. Keep learning, keep growing! 🎯`;
  }
}

const aiBusinessCoach = new AIBusinessCoach();
export default aiBusinessCoach;
