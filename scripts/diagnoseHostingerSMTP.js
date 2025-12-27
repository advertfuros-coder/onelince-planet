// Comprehensive Hostinger SMTP Diagnostic Script
import nodemailer from "nodemailer";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, "../.env.local") });

async function diagnoseHostingerSMTP() {
  console.log("🔍 Hostinger SMTP Diagnostic Tool\n");
  console.log("=" .repeat(60));

  // 1. Check environment variables
  console.log("\n1️⃣ Environment Variables Check:");
  console.log("   SMTP_HOST:", process.env.SMTP_HOST || "❌ NOT SET");
  console.log("   SMTP_PORT:", process.env.SMTP_PORT || "❌ NOT SET");
  console.log("   SMTP_SECURE:", process.env.SMTP_SECURE || "❌ NOT SET");
  console.log("   SMTP_USER:", process.env.SMTP_USER || "❌ NOT SET");
  console.log("   SMTP_PASS:", process.env.SMTP_PASS ? "✅ SET (***)" : "❌ NOT SET");
  console.log("   SMTP_FROM_EMAIL:", process.env.SMTP_FROM_EMAIL || "❌ NOT SET");

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("\n❌ Missing required environment variables!");
    return;
  }

  console.log("\n" + "=".repeat(60));

  // 2. Test different port and security combinations
  const configurations = [
    {
      name: "Port 465 with SSL (Implicit TLS)",
      port: 465,
      secure: true,
      tls: { rejectUnauthorized: false },
    },
    {
      name: "Port 587 with STARTTLS (Explicit TLS)",
      port: 587,
      secure: false,
      tls: { rejectUnauthorized: false },
    },
    {
      name: "Port 465 with SSL + ciphers",
      port: 465,
      secure: true,
      tls: {
        rejectUnauthorized: false,
        ciphers: "SSLv3",
      },
    },
    {
      name: "Port 587 with requireTLS",
      port: 587,
      secure: false,
      requireTLS: true,
      tls: { rejectUnauthorized: false },
    },
  ];

  for (const config of configurations) {
    console.log(`\n2️⃣ Testing: ${config.name}`);
    console.log("   Configuration:", JSON.stringify(config, null, 2));

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: config.port,
        secure: config.secure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: config.tls,
        requireTLS: config.requireTLS,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
        debug: false, // Set to true for verbose logging
        logger: false,
      });

      // Verify connection
      console.log("   🔄 Verifying connection...");
      await transporter.verify();
      console.log("   ✅ Connection verified successfully!");

      // Try sending a test email
      console.log("   📧 Attempting to send test email...");
      const info = await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || "Test"}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: process.env.SMTP_USER,
        subject: "Hostinger SMTP Test - " + config.name,
        text: `This is a test email sent using ${config.name}`,
        html: `<h1>Test Email</h1><p>This is a test email sent using <strong>${config.name}</strong></p>`,
      });

      console.log("   ✅ Email sent successfully!");
      console.log("   📬 Message ID:", info.messageId);
      console.log("   📊 Response:", info.response);
      console.log("\n   🎉 SUCCESS! This configuration works!\n");
      
      // If we found a working config, stop testing
      break;
    } catch (error) {
      console.log("   ❌ Failed:", error.message);
      if (error.code) {
        console.log("   📋 Error Code:", error.code);
      }
      if (error.response) {
        console.log("   📋 Server Response:", error.response);
      }
      if (error.responseCode) {
        console.log("   📋 Response Code:", error.responseCode);
      }
      if (error.command) {
        console.log("   📋 Failed Command:", error.command);
      }
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("\n3️⃣ Additional Diagnostics:");

  // Test with explicit authentication type
  console.log("\n   Testing with explicit AUTH LOGIN...");
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true,
      auth: {
        type: "login",
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.verify();
    console.log("   ✅ AUTH LOGIN works!");
  } catch (error) {
    console.log("   ❌ AUTH LOGIN failed:", error.message);
  }

  // Test DNS resolution
  console.log("\n   Testing DNS resolution for smtp.hostinger.com...");
  try {
    const dns = await import("dns");
    const { promisify } = await import("util");
    const resolve4 = promisify(dns.resolve4);
    const addresses = await resolve4("smtp.hostinger.com");
    console.log("   ✅ DNS resolved to:", addresses.join(", "));
  } catch (error) {
    console.log("   ❌ DNS resolution failed:", error.message);
  }

  console.log("\n" + "=".repeat(60));
  console.log("\n4️⃣ Recommendations:");
  console.log("\n   Based on Hostinger documentation:");
  console.log("   • Recommended: Port 465 with SSL (secure: true)");
  console.log("   • Alternative: Port 587 with STARTTLS (secure: false)");
  console.log("   • Ensure your email account is active in Hostinger control panel");
  console.log("   • Check if 2FA is enabled (may require app password)");
  console.log("   • Verify email account has SMTP access enabled");
  console.log("   • Check Hostinger server status: https://www.hostinger.com/status");
  console.log("\n   If all tests fail:");
  console.log("   1. Log into Hostinger control panel");
  console.log("   2. Check email account settings");
  console.log("   3. Verify SMTP is enabled for this account");
  console.log("   4. Try resetting the email password");
  console.log("   5. Contact Hostinger support");

  console.log("\n" + "=".repeat(60));
}

diagnoseHostingerSMTP().catch((error) => {
  console.error("\n❌ Diagnostic script error:", error);
  process.exit(1);
});
