import axios from "axios";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env.local") });

const BASE_URL = "http://localhost:3000"; // Assuming dev server is on 3000
const TEST_EMAIL = "advertfuros@gmail.com";
const TEMP_PASS = "Temporary123!";
const NEW_PASS = "NewSecurePass123!";

async function runTest() {
  console.log("🧪 Starting Password Change Flow Test...");

  try {
    // 1. LOGIN
    console.log("\nStep 1: Logging in with temporary password...");
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEMP_PASS,
    });

    if (!loginRes.data.success) {
      throw new Error(`Login failed: ${loginRes.data.message}`);
    }

    const { token, user } = loginRes.data;
    console.log("✅ Login successful!");
    console.log(
      "📊 requirePasswordChange flag in response:",
      user.requirePasswordChange
    );

    if (user.requirePasswordChange !== true) {
      throw new Error(
        "Test failed: requirePasswordChange should be TRUE after login with temporary password"
      );
    }

    // 2. UPDATE PASSWORD
    console.log("\nStep 2: Updating password to new secret...");
    const updateRes = await axios.post(
      `${BASE_URL}/api/auth/update-password`,
      {
        currentPassword: TEMP_PASS,
        newPassword: NEW_PASS,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!updateRes.data.success) {
      throw new Error(`Update password failed: ${updateRes.data.message}`);
    }

    console.log("✅ Password update successful!");

    // 3. VERIFY DATABASE STATE
    console.log("\nStep 3: Verifying final state in database...");
    await mongoose.connect(process.env.MONGODB_URI);
    const User = (await import("../src/lib/db/models/User.js")).default;

    const dbUser = await User.findOne({ email: TEST_EMAIL });
    console.log(
      "📊 requirePasswordChange flag in DB:",
      dbUser.requirePasswordChange
    );

    if (dbUser.requirePasswordChange === false) {
      console.log("\n✨ TEST PASSED: Flow is working perfectly!");
    } else {
      throw new Error(
        "Test failed: requirePasswordChange flag was not cleared in database"
      );
    }
  } catch (err) {
    console.error(
      "\n❌ TEST FAILED:",
      err.response?.data?.message || err.message
    );
    if (err.message.includes("ECONNREFUSED")) {
      console.log(
        "💡 Note: Make sure your dev server (npm run dev) is running on port 3000"
      );
    }
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(0);
  }
}

runTest();
