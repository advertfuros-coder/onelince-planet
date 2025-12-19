// lib/services/aiService.js
// Central AI Service Manager

class AIService {
  constructor() {
    this.geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.cloudinaryConfig = {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    };
  }

  async fetchWithRetry(url, options, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);

        // If successful, return immediately
        if (response.ok) {
          return response;
        }

        const errorData = await response.json().catch(() => ({}));
        const status = response.status;
        const message = errorData.error?.message || response.statusText;

        // Retry only on 503 (Service Unavailable) or 429 (Too Many Requests)
        if (status === 503 || status === 429) {
          console.warn(
            `Attempt ${i + 1} failed: ${message}. Retrying in ${delay}ms...`
          );
          if (i === retries - 1) {
            throw new Error(`API Error (${status}): ${message}`);
          }
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff: 1s, 2s, 4s...
          continue;
        }

        // For other errors, throw immediately
        throw new Error(`API Error (${status}): ${message}`);
      } catch (error) {
        // If it's a network error (fetch failed), retry
        if (i === retries - 1) throw error;
        console.warn(
          `Network attempt ${i + 1} failed: ${error.message}. Retrying...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  }

  async generateText(prompt, options = {}) {
    // Check if API key exists
    if (!this.geminiApiKey) {
      console.warn(
        "⚠️ Gemini API key not configured. Please add GOOGLE_GEMINI_API_KEY to .env.local"
      );
      throw new Error(
        "AI service not configured. Please add GOOGLE_GEMINI_API_KEY to your environment variables."
      );
    }

    try {
      const response = await this.fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: options.temperature || 0.7,
              topK: options.topK || 40,
              topP: options.topP || 0.95,
              maxOutputTokens: options.maxTokens || 2048,
            },
          }),
        }
      );

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("AI Text Generation Error:", error);
      throw error;
    }
  }

  async analyzeImage(imageUrl) {
    try {
      const response = await this.fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: "Analyze this product image and describe it in detail.",
                  },
                  {
                    inlineData: {
                      mimeType: "image/jpeg",
                      data: imageUrl,
                    },
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("AI Image Analysis Error:", error);
      throw new Error("Failed to analyze image");
    }
  }

  async chat(messages, systemPrompt = "") {
    try {
      const formattedMessages = messages.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      if (systemPrompt) {
        formattedMessages.unshift({
          role: "user",
          parts: [{ text: systemPrompt }],
        });
      }

      const response = await this.fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: formattedMessages,
          }),
        }
      );

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("AI Chat Error:", error);
      throw new Error("Failed to get AI response");
    }
  }

  async generateStructuredData(prompt, schema) {
    try {
      const enhancedPrompt = `${prompt}\n\nRespond ONLY with valid JSON matching this schema:\n${JSON.stringify(
        schema,
        null,
        2
      )}\n\nIMPORTANT: Return ONLY the JSON object, no other text.`;

      const response = await this.generateText(enhancedPrompt);

      console.log("AI Response (first 500 chars):", response.substring(0, 500));

      // Try multiple JSON extraction strategies
      let jsonData = null;

      // Strategy 1: Try to parse response directly
      try {
        jsonData = JSON.parse(response);
      } catch (e) {
        // Strategy 2: Extract JSON from markdown code blocks
        const codeBlockMatch = response.match(
          /```(?:json)?\s*([\s\S]*?)\s*```/
        );
        if (codeBlockMatch) {
          try {
            jsonData = JSON.parse(codeBlockMatch[1]);
          } catch (e2) {
            // Strategy 3: Find first { and last }
            const firstBrace = response.indexOf("{");
            const lastBrace = response.lastIndexOf("}");

            if (
              firstBrace !== -1 &&
              lastBrace !== -1 &&
              lastBrace > firstBrace
            ) {
              const jsonString = response.substring(firstBrace, lastBrace + 1);
              try {
                jsonData = JSON.parse(jsonString);
              } catch (e3) {
                console.error("All JSON parsing strategies failed");
                console.error("Response:", response);
                throw new Error(
                  "Could not extract valid JSON from AI response"
                );
              }
            }
          }
        } else {
          // Strategy 4: Try to find any JSON-like structure
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              jsonData = JSON.parse(jsonMatch[0]);
            } catch (e4) {
              console.error("Failed to parse matched JSON");
              throw new Error("Could not parse JSON structure");
            }
          }
        }
      }

      if (!jsonData) {
        throw new Error("No valid JSON found in response");
      }

      return jsonData;
    } catch (error) {
      console.error("AI Structured Data Error:", error);
      console.error("Error details:", error.message);
      throw new Error(`Failed to generate structured data: ${error.message}`);
    }
  }
}

export default new AIService();
