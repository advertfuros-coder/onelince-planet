#!/usr/bin/env node

/**
 * Test Email Connection with Retry Logic
 * This script tests the actual SMTP connection and email sending
 */

import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "..", ".env.local") });

console.log("\n📧 Testing Email Connection with Retry Logic\n");
console.log("=".repeat(60));

async function testConnection() {
  const smtpPort = parseInt(process.env.SMTP_PORT) || 587;
  const isSecure = process.env.SMTP_SECURE === "true";

  console.log("\n🔧 Configuration:");
  console.log(`   Host: ${process.env.SMTP_HOST}`);
  console.log(`   Port: ${smtpPort}`);
  console.log(`   Secure: ${isSecure}`);
  console.log(`   User: ${process.env.SMTP_USER}`);
  console.log(`   From: ${process.env.SMTP_FROM_EMAIL}\n`);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: isSecure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 30000, // 30 seconds
    greetingTimeout: 30000,
    socketTimeout: 30000,
    pool: true,
    maxConnections: 5,
  });

  // Test 1: Verify connection
  console.log("🔍 Test 1: Verifying SMTP connection...");
  try {
    await transporter.verify();
    console.log("✅ SMTP connection verified successfully!\n");
  } catch (error) {
    console.error("❌ Connection verification failed:", error.message);
    console.error("   Error code:", error.code);
    console.error("\n💡 Troubleshooting:");
    if (error.code === "ETIMEDOUT") {
      console.error("   - Connection timed out. Check:");
      console.error("     1. Your internet connection");
      console.error("     2. Firewall settings");
      console.error("     3. SMTP host and port are correct");
      console.error("     4. Try Port 587 with SMTP_SECURE=false");
    } else if (error.code === "EAUTH") {
      console.error("   - Authentication failed. Check:");
      console.error("     1. SMTP_USER and SMTP_PASS are correct");
      console.error("     2. Email account is active");
    }
    console.log("\n");
    process.exit(1);
  }

  // Test 2: Send test email with retry
  console.log("📨 Test 2: Sending test email with retry logic...");

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || "Online Planet"}" <${
      process.env.SMTP_FROM_EMAIL
    }>`,
    to: process.env.SMTP_USER, // Send to self for testing
    subject: "✅ Test Email - Connection Successful",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">✅ Email Connection Test Successful!</h2>
        <p>This is a test email from your Online Planet application.</p>
        <p><strong>Configuration Details:</strong></p>
        <ul>
          <li>Host: ${process.env.SMTP_HOST}</li>
          <li>Port: ${smtpPort}</li>
          <li>Secure: ${isSecure}</li>
          <li>From: ${process.env.SMTP_FROM_EMAIL}</li>
        </ul>
        <p>Timestamp: ${new Date().toISOString()}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          If you received this email, your SMTP configuration is working correctly!
        </p>
      </div>
    `,
  };

  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`   Attempt ${attempt}/${maxRetries}...`);
      const info = await transporter.sendMail(mailOptions);

      console.log("\n✅ Email sent successfully!");
      console.log(`   Message ID: ${info.messageId}`);
      console.log(`   Response: ${info.response}`);
      console.log(`\n📬 Check your inbox at: ${process.env.SMTP_USER}\n`);

      transporter.close();
      return;
    } catch (error) {
      lastError = error;
      console.error(`   ❌ Attempt ${attempt} failed: ${error.message}`);

      if (
        attempt < maxRetries &&
        (error.code === "ETIMEDOUT" || error.code === "ECONNECTION")
      ) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.log(`   ⏳ Retrying in ${delay}ms...\n`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed
  console.error("\n❌ All retry attempts failed!");
  console.error("Last error:", lastError.message);
  console.error("Error code:", lastError.code);
  console.log("\n💡 Next Steps:");
  console.log("1. Run: node scripts/checkEmailConfig.mjs");
  console.log("2. Verify your .env.local has the correct settings");
  console.log("3. For Hostinger, use: SMTP_PORT=587 and SMTP_SECURE=false");
  console.log("4. Check if your email provider has any restrictions\n");

  transporter.close();
  process.exit(1);
}

testConnection().catch((error) => {
  console.error("\n❌ Unexpected error:", error);
  process.exit(1);
});
