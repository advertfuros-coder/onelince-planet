// Test email configuration
// Run with: node scripts/testEmail.js

async function testEmailConfig() {
  console.log("🔍 Checking email configuration...\n");

  const requiredVars = {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM_NAME: process.env.SMTP_FROM_NAME,
    SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL,
  };

  let allConfigured = true;

  for (const [key, value] of Object.entries(requiredVars)) {
    const status = value ? "✅" : "❌";
    const displayValue = value
      ? key.includes("PASS")
        ? "***"
        : value
      : "NOT SET";
    console.log(`${status} ${key}: ${displayValue}`);
    if (!value && !key.includes("FROM")) {
      allConfigured = false;
    }
  }

  console.log("\n" + "=".repeat(50));

  if (allConfigured) {
    console.log("✅ All required SMTP variables are configured!");
    console.log("\n📧 Testing email send...\n");

    try {
      const emailService = (await import("../src/lib/email/emailService.js"))
        .default;

      const result = await emailService.sendEmail({
        to: process.env.SMTP_USER || "test@example.com",
        subject: "Test Email - Configuration Check",
        html: "<h1>Email Configuration Test</h1><p>If you received this, your email is configured correctly!</p>",
      });

      if (result.success) {
        console.log("✅ Email sent successfully!");
        if (result.previewUrl) {
          console.log("📧 Preview URL:", result.previewUrl);
        }
      } else {
        console.log("❌ Email failed to send:", result.error);
      }
    } catch (error) {
      console.error("❌ Error testing email:", error.message);
    }
  } else {
    console.log("❌ Some SMTP variables are missing!");
    console.log(
      "\n💡 Solution: Add the missing variables to your .env.local file"
    );
    console.log("\nExample .env.local configuration:");
    console.log(
      `
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Online Planet
SMTP_FROM_EMAIL=noreply@onlineplanet.com
    `.trim()
    );
  }
}

// Load environment variables
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, "../.env.local") });

testEmailConfig().catch(console.error);
