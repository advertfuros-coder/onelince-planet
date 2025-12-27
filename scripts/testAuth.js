// Direct SMTP authentication test
import nodemailer from "nodemailer";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, "../.env.local") });

async function testAuth() {
  console.log("🔐 Testing SMTP Authentication\n");

  const configs = [
    {
      name: "Current .env.local config",
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    {
      name: "Hardcoded Port 587",
      host: "smtp.hostinger.com",
      port: 587,
      secure: false,
      user: "info@onlineplanet.ae",
      pass: "Abid@1122##",
    },
  ];

  for (const config of configs) {
    console.log(`\n📋 Testing: ${config.name}`);
    console.log(`   Host: ${config.host}`);
    console.log(`   Port: ${config.port} (type: ${typeof config.port})`);
    console.log(`   Secure: ${config.secure} (type: ${typeof config.secure})`);
    console.log(`   User: ${config.user}`);
    console.log(`   Pass: ***${config.pass?.slice(-4)}`);

    try {
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
        debug: true, // Enable debug output
        logger: true, // Enable logging
      });

      console.log("\n   🔄 Verifying connection...");
      await transporter.verify();
      console.log("   ✅ Verification successful!");

      console.log("\n   📧 Sending test email...");
      const info = await transporter.sendMail({
        from: `"Test" <${config.user}>`,
        to: config.user,
        subject: "Auth Test",
        text: "Testing authentication",
      });

      console.log("   ✅ Email sent!");
      console.log("   Message ID:", info.messageId);
      console.log("\n   🎉 SUCCESS!\n");
      break;
    } catch (error) {
      console.log("   ❌ FAILED");
      console.log("   Error:", error.message);
      console.log("   Code:", error.code);
      console.log("   Response:", error.response);
      console.log("   Command:", error.command);
    }
  }
}

testAuth().catch(console.error);
