#!/usr/bin/env node

/**
 * Quick SMTP Configuration Checker
 * Run this to verify your email settings are correct
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "..", ".env.local") });

console.log("\n🔍 SMTP Configuration Check\n");
console.log("=".repeat(50));

const config = {
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_SECURE: process.env.SMTP_SECURE,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS
    ? `***${process.env.SMTP_PASS.slice(-4)}`
    : "NOT SET",
  SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL,
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME,
};

let hasErrors = false;

// Check each configuration
for (const [key, value] of Object.entries(config)) {
  const status = value ? "✅" : "❌";
  console.log(`${status} ${key}: ${value || "NOT SET"}`);
  if (!value && key !== "SMTP_FROM_NAME") {
    hasErrors = true;
  }
}

console.log("=".repeat(50));

// Specific checks
console.log("\n📋 Configuration Analysis:\n");

// Check port
const port = parseInt(process.env.SMTP_PORT);
if (port === 465) {
  console.log("⚠️  WARNING: Using Port 465 (SSL)");
  console.log("   Hostinger often has issues with this port.");
  console.log("   Recommended: Change to Port 587 with SMTP_SECURE=false");
} else if (port === 587) {
  console.log("✅ Using Port 587 (STARTTLS) - Recommended for Hostinger");
  if (process.env.SMTP_SECURE === "true") {
    console.log('⚠️  WARNING: SMTP_SECURE should be "false" for Port 587');
    hasErrors = true;
  }
} else {
  console.log(`❌ Unusual port: ${port}`);
  hasErrors = true;
}

// Check secure setting
if (process.env.SMTP_SECURE === "true" && port !== 465) {
  console.log("⚠️  SMTP_SECURE=true is only for Port 465");
  console.log("   For Port 587, use SMTP_SECURE=false");
}

console.log("\n" + "=".repeat(50));

if (hasErrors) {
  console.log(
    "\n❌ Configuration has issues. Please fix the above warnings.\n"
  );
  console.log("📝 Recommended Configuration for Hostinger:\n");
  console.log("SMTP_HOST=smtp.hostinger.com");
  console.log("SMTP_PORT=587");
  console.log("SMTP_SECURE=false");
  console.log("SMTP_USER=info@onlineplanet.ae");
  console.log("SMTP_PASS=your_password");
  console.log("SMTP_FROM_EMAIL=info@onlineplanet.ae");
  console.log("SMTP_FROM_NAME=Online Planet\n");
} else {
  console.log("\n✅ Configuration looks good!\n");
  console.log("If you're still experiencing issues:");
  console.log("1. Restart your dev server (npm run dev)");
  console.log("2. Check your firewall/network settings");
  console.log("3. Verify credentials with your email provider");
  console.log("4. Run: node scripts/testEmailConnection.mjs\n");
}
