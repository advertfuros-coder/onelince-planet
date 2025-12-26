// lib/services/aiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

class AIService {
  constructor() {
    this.apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    this.genAI = null;

    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    }
  }

  checkConfiguration() {
    if (!this.apiKey || !this.genAI) {
      const error = new Error("Google Gemini API key not configured");
      error.code = "AI_CONFIG_MISSING";
      throw error;
    }
  }

  /**
   * Clean and parse JSON response from AI
   */
  parseAIResponse(text) {
    try {
      // Try direct parse first
      return JSON.parse(text);
    } catch (error) {
      console.log("⚠️ Direct JSON parse failed, attempting cleanup...");
      console.log("Raw response:", text.substring(0, 500));

      try {
        // Remove markdown code blocks if present
        let cleaned = text.trim();

        // Remove `````` markers
        cleaned = cleaned.replace(/^```/i, "");
        cleaned = cleaned.replace(/^```\s*/i, "");
        cleaned = cleaned.replace(/\s*```/i, "");

        // Try parsing cleaned version
        return JSON.parse(cleaned);
      } catch (secondError) {
        console.error(
          "❌ JSON cleanup failed. Response excerpt:",
          text.substring(0, 300)
        );
        throw new Error(
          `Invalid JSON response from AI: ${secondError.message}`
        );
      }
    }
  }

  /**
   * Generate structured JSON output following a schema
   */
  async generateStructuredData(prompt, schema) {
    this.checkConfiguration();

    const models = [
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-2.0-flash-exp",
    ];
    let lastError = null;

    for (const modelName of models) {
      try {
        const model = this.genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: this.convertToGeminiSchema(schema),
            temperature: 0.7,
            maxOutputTokens: 4096,
          },
        });

        const response = await result.response;
        return this.parseAIResponse(response.text());
      } catch (error) {
        lastError = error;
        console.warn(
          `⚠️ Model ${modelName} failed, trying next... Error: ${error.message}`
        );

        if (
          error.message?.includes("429") ||
          error.message?.includes("quota")
        ) {
          const quotaError = new Error("AI service quota exceeded");
          quotaError.code = "AI_QUOTA_EXCEEDED";
          lastError = quotaError;
          continue;
        }

        if (
          error.message?.includes("404") ||
          error.message?.includes("not found")
        ) {
          const modelError = new Error("AI model not available");
          modelError.code = "AI_MODEL_NOT_FOUND";
          lastError = modelError;
          continue;
        }

        if (error.message?.includes("400")) throw error;
      }
    }

    throw lastError || new Error("All AI models failed");
  }

  /**
   * Generate plain text response
   */
  async generateText(prompt, options = {}) {
    this.checkConfiguration();

    const models = [
      "gemini-1.5-flash",
      "gemini-1.5-pro",
      "gemini-2.0-flash-exp",
    ];
    let lastError = null;

    for (const modelName of models) {
      try {
        const model = this.genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: options.temperature || 0.8,
            maxOutputTokens: options.maxTokens || 1024,
          },
        });

        const response = await result.response;
        return response.text();
      } catch (error) {
        lastError = error;
        console.warn(
          `⚠️ Model ${modelName} failed during text gen: ${error.message}`
        );
        if (error.message?.includes("429") || error.message?.includes("404"))
          continue;
        throw error;
      }
    }

    throw lastError || new Error("All AI models failed");
  }

  /**
   * Convert simple schema object to Gemini JSON Schema format
   */
  convertToGeminiSchema(schema) {
    const convertType = (value) => {
      if (Array.isArray(value)) {
        return {
          type: "array",
          items: convertType(value[0]), // Fixed: use first element to define item type
        };
      }

      if (typeof value === "object" && value !== null) {
        const properties = {};
        const required = [];

        for (const [key, val] of Object.entries(value)) {
          properties[key] = convertType(val);
          required.push(key);
        }

        return {
          type: "object",
          properties,
          required,
        };
      }

      // Primitive types
      if (value === "string") return { type: "string" };
      if (value === "number") return { type: "number" };
      if (value === "integer") return { type: "integer" };
      if (value === "boolean") return { type: "boolean" };

      return { type: "string" }; // fallback
    };

    return convertType(schema);
  }
}

const aiService = new AIService();
export default aiService;
