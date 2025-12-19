// lib/services/aiChatbot.js
import aiService from "./aiService";

const SYSTEM_PROMPTS = {
  customer: `You are a helpful AI shopping assistant for Online Planet Dubai, a multi-vendor e-commerce marketplace.

Your role:
- Help customers find products
- Answer questions about orders
- Provide sizing and product guidance
- Assist with returns and refunds
- Offer personalized recommendations
- Be friendly, professional, and concise

Always:
- Be helpful and empathetic
- Provide accurate information
- Suggest relevant products when appropriate
- If you don't know something, admit it and offer to connect with human support
- Use emojis sparingly for a friendly tone

Response format:
- Keep answers under 150 words
- Use bullet points for lists
- Include product links when relevant`,

  seller: `You are an AI business advisor for sellers on Online Planet Dubai marketplace.

Your role:
- Help sellers optimize their listings
- Provide marketing and pricing advice
- Answer policy questions
- Offer performance insights
- Give troubleshooting help
- Share best practices

Always:
- Be professional and constructive
- Provide actionable advice
- Use data when available
- Encourage growth and success
- If complex, suggest contacting seller support

Keep responses practical and under 200 words.`,

  admin: `You are an AI assistant for platform administrators of Online Planet Dubai.

Your role:
- Provide operational insights
- Help with seller management
- Assist with policy enforcement
- Generate reports and analytics
- Offer platform optimization suggestions

Be efficient, data-driven, and solution-focused.`,
};

export class AIChatbotService {
  constructor(userType = "customer") {
    this.userType = userType;
    this.systemPrompt = SYSTEM_PROMPTS[userType];
  }

  async chat(userMessage, context = {}) {
    try {
      // Build context-aware prompt
      let enhancedPrompt = this.systemPrompt + "\n\n";

      // Add user context
      if (context.user) {
        enhancedPrompt += `User: ${context.user.name}\n`;
        enhancedPrompt += `Member since: ${new Date(
          context.user.createdAt
        ).toLocaleDateString()}\n\n`;
      }

      // Add conversation history
      if (context.history && context.history.length > 0) {
        enhancedPrompt += "Previous conversation:\n";
        context.history.slice(-5).forEach((msg) => {
          enhancedPrompt += `${msg.role}: ${msg.content}\n`;
        });
        enhancedPrompt += "\n";
      }

      // Add specific context
      if (context.products && context.products.length > 0) {
        enhancedPrompt += `Recently viewed products: ${context.products
          .map((p) => p.name)
          .join(", ")}\n`;
      }

      if (context.orders && context.orders.length > 0) {
        enhancedPrompt += `Recent orders: ${context.orders.length}\n`;
      }

      if (context.cart && context.cart.items.length > 0) {
        enhancedPrompt += `Cart items: ${context.cart.items
          .map((i) => i.name)
          .join(", ")}\n`;
      }

      enhancedPrompt += `\nUser question: ${userMessage}\n\nYour response:`;

      const response = await aiService.generateText(enhancedPrompt, {
        temperature: 0.7,
        maxTokens: 500,
      });

      // Extract actions (if any)
      const actions = this.extractActions(response);

      return {
        success: true,
        message: response,
        actions,
        creditsUsed: 1,
      };
    } catch (error) {
      console.error("Chatbot Error:", error);
      return {
        success: false,
        error:
          "Sorry, I encountered an error. Please try again or contact support.",
        message:
          "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
      };
    }
  }

  extractActions(response) {
    const actions = [];

    // Check for product recommendations
    if (
      response.toLowerCase().includes("recommend") ||
      response.toLowerCase().includes("suggest")
    ) {
      actions.push({ type: "show_recommendations" });
    }

    // Check for order tracking
    if (
      response.toLowerCase().includes("track") ||
      response.toLowerCase().includes("order status")
    ) {
      actions.push({ type: "show_orders" });
    }

    // Check for contact support
    if (
      response.toLowerCase().includes("contact support") ||
      response.toLowerCase().includes("human agent")
    ) {
      actions.push({ type: "contact_support" });
    }

    return actions;
  }

  async generateQuickReplies(context = {}) {
    const { userType, recentActivity } = context;

    const suggestions = {
      customer: [
        "Track my order",
        "Find similar products",
        "Help with returns",
        "Product recommendations",
        "Size guide",
      ],
      seller: [
        "Optimize my listings",
        "View performance",
        "Pricing advice",
        "Marketing tips",
        "Policy questions",
      ],
      admin: [
        "Platform analytics",
        "Seller approval queue",
        "Revenue report",
        "User growth",
        "System health",
      ],
    };

    return suggestions[userType] || suggestions.customer;
  }

  async analyzeIntent(message) {
    const prompt = `Analyze the intent of this user message and categorize it:

Message: "${message}"

Classify into one of these categories:
- product_search: Looking for products
- order_tracking: Asking about order status
- return_refund: Return or refund inquiry
- product_question: Question about specific product
- size_fit: Sizing or fit question
- pricing: Price or discount question
- shipping: Delivery or shipping question
- account: Account related
- complaint: Issue or complaint
- general: General inquiry

Return JSON: { "intent": "category", "confidence": 0.0-1.0, "keywords": ["word1", "word2"] }`;

    try {
      const schema = {
        intent: "string",
        confidence: "number",
        keywords: ["string"],
      };

      const result = await aiService.generateStructuredData(prompt, schema);
      return { success: true, ...result };
    } catch (error) {
      return { success: false, intent: "general", confidence: 0.5 };
    }
  }
}

export async function generateChatSummary(conversation) {
  const messages = conversation
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const prompt = `Summarize this customer support conversation in 2-3 sentences:

${messages}

Focus on: Issue, Solution, Outcome`;

  try {
    const summary = await aiService.generateText(prompt, { maxTokens: 150 });
    return { success: true, summary };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export default AIChatbotService;
