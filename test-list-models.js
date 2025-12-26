// test-list-models.js
import { config } from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '.env.local') });

const API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

async function listAvailableModels() {
  if (!API_KEY) {
    console.error("❌ GOOGLE_GEMINI_API_KEY not found in .env.local");
    console.log("\n💡 Make sure your .env.local file contains:");
    console.log("   GOOGLE_GEMINI_API_KEY=your_actual_key_here\n");
    return;
  }

  console.log("🔑 Testing API Key:", API_KEY.substring(0, 10) + "...");
  console.log("\n📋 Fetching available models...\n");

  try {
    // Method 1: Direct API call
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ HTTP ${response.status}:`, errorText);
      
      if (response.status === 400 || response.status === 403) {
        console.log("\n💡 Your API key might be invalid or restricted.");
        console.log("   Get a new key from: https://makersuite.google.com/app/apikey\n");
      }
      return;
    }

    const data = await response.json();

    if (!data.models || data.models.length === 0) {
      console.log("⚠️  No models found. Your API key might be invalid.");
      return;
    }

    console.log(`✅ Found ${data.models.length} available models:\n`);

    // Filter models that support generateContent
    const contentModels = data.models.filter((model) =>
      model.supportedGenerationMethods?.includes("generateContent")
    );

    console.log("🎯 Models that support generateContent:\n");
    contentModels.forEach((model) => {
      const modelName = model.name.replace("models/", "");
      console.log(`  ✓ ${modelName}`);
      console.log(`    Display: ${model.displayName}`);
      console.log(`    Methods: ${model.supportedGenerationMethods.join(", ")}`);
      console.log("");
    });

    if (contentModels.length === 0) {
      console.log("⚠️  No models support generateContent");
      return;
    }

    console.log("\n💡 Recommended models for your code:");
    const recommended = contentModels
      .filter(m => 
        m.name.includes("flash") || 
        m.name.includes("pro")
      )
      .slice(0, 3);
    
    recommended.forEach(m => {
      console.log(`   - ${m.name.replace("models/", "")}`);
    });

    // Test the first available model
    console.log("\n🧪 Testing first available model...");
    const testModelName = contentModels[0].name.replace("models/", "");

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: testModelName });

    const result = await model.generateContent("Say hello in one word");
    console.log(`\n✅ Test successful with "${testModelName}"!`);
    console.log(`   Response: ${result.response.text()}`);
    
    console.log("\n🎯 UPDATE YOUR CODE:");
    console.log(`   model: "${testModelName}"\n`);

  } catch (error) {
    console.error("❌ Error:", error.message);

    if (error.message.includes("API_KEY_INVALID")) {
      console.log(
        "\n💡 Your API key is invalid. Get a new one from: https://makersuite.google.com/app/apikey"
      );
    }
  }
}

listAvailableModels();
