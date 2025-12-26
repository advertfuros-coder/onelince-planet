// scripts/get-auth-token.js
import axios from "axios";

const API_URL = "http://localhost:3000/api";

async function login(email, password) {
  try {
    console.log("🔐 Logging in...");
    console.log(`Email: ${email}`);

    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });

    if (response.data.success && response.data.token) {
      console.log("\n✅ Login successful!");
      console.log("\n📋 Your auth token:");
      console.log("─".repeat(80));
      console.log(response.data.token);
      console.log("─".repeat(80));

      console.log("\n🔧 To use this token, run:");
      console.log(`export AUTH_TOKEN="${response.data.token}"`);
      console.log("\n📝 Or copy and paste this complete command:");
      console.log(
        `\nexport AUTH_TOKEN="${response.data.token}" && node scripts/test-order-apis.js\n`
      );

      return response.data.token;
    } else {
      console.error("❌ Login failed:", response.data.message);
      return null;
    }
  } catch (error) {
    console.error(
      "❌ Login error:",
      error.response?.data?.message || error.message
    );
    if (error.response?.data) {
      console.error("Details:", error.response.data);
    }
    return null;
  }
}

// Get credentials from command line arguments or use defaults
const email = process.argv[2] || "seller@onlineplanet.ae";
const password = process.argv[3] || "Seller@123456";

console.log("🚀 Getting Auth Token for Order Management Tests\n");

login(email, password).then((token) => {
  if (token) {
    process.exit(0);
  } else {
    console.error(
      "\n❌ Failed to get auth token. Please check your credentials."
    );
    process.exit(1);
  }
});
