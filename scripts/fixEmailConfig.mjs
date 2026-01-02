#!/usr/bin/env node

/**
 * Fix SMTP Configuration for Hostinger
 * This script will guide you to update your .env.local file
 */

console.log("\n🔧 SMTP Configuration Fix for Hostinger\n");
console.log("=".repeat(60));

console.log("\n⚠️  ISSUE DETECTED:");
console.log("   Your current configuration uses Port 465 (SSL)");
console.log("   This causes ETIMEDOUT errors with Hostinger SMTP.\n");

console.log("✅ SOLUTION:");
console.log("   Update your .env.local file with these settings:\n");

console.log("─".repeat(60));
console.log("SMTP_HOST=smtp.hostinger.com");
console.log("SMTP_PORT=587");
console.log("SMTP_SECURE=false");
console.log("SMTP_USER=info@onlineplanet.ae");
console.log("SMTP_PASS=Abid@1122##");
console.log("SMTP_FROM_EMAIL=info@onlineplanet.ae");
console.log("SMTP_FROM_NAME=Online Planet");
console.log("─".repeat(60));

console.log("\n📝 STEPS TO FIX:\n");
console.log("1. Open your .env.local file");
console.log("2. Change these two lines:");
console.log("   SMTP_PORT=465  →  SMTP_PORT=587");
console.log("   SMTP_SECURE=true  →  SMTP_SECURE=false");
console.log("3. Save the file");
console.log("4. Restart your dev server:");
console.log("   - Press Ctrl+C to stop");
console.log("   - Run: npm run dev");
console.log("5. Test the connection:");
console.log("   - Run: node scripts/testEmailConnection.mjs\n");

console.log("💡 WHY THIS WORKS:\n");
console.log("Port 465 (SMTPS):");
console.log("  - Uses SSL/TLS from the start");
console.log("  - Hostinger blocks/restricts this port for some accounts");
console.log("  - Results in ETIMEDOUT errors\n");

console.log("Port 587 (SMTP + STARTTLS):");
console.log("  - Starts as plain connection, upgrades to TLS");
console.log("  - Widely supported by Hostinger");
console.log("  - Recommended by modern email providers\n");

console.log("=".repeat(60));
console.log(
  "\n✨ After making these changes, emails will send successfully!\n"
);
