// scripts/sendNewEmailV2.mjs
// Send the NEW visually stunning email template

import emailService from "../src/lib/email/emailService.js";
import { generateSellerWelcomeEmailV2 } from "../src/lib/email/templates/sellerWelcomeV2.js";

async function sendNewEmail() {
  console.log("📧 Sending NEW Stunning Email Template V2...\n");

  const sellerData = {
    sellerName: "Harsh Rao",
    email: "harshurao058@gmail.com",
    applicationId: "ONP-ABC12345",
    businessName: "Harsh Trading Company LLC",
  };

  console.log("✨ Generating NEW email with:");
  console.log("   - Unsplash images");
  console.log("   - Gradient cards");
  console.log("   - Interactive hover effects");
  console.log("   - Modern visual design\n");

  const emailHtml = generateSellerWelcomeEmailV2(sellerData);

  console.log("Sending to:", sellerData.email);
  console.log(
    "Subject: 🎉 Welcome to Online Planet - Your Seller Journey Begins!\n"
  );

  try {
    const result = await emailService.sendEmail({
      to: sellerData.email,
      subject: "🎉 Welcome to Online Planet - Your Seller Journey Begins!",
      html: emailHtml,
    });

    if (result.success) {
      console.log("✅ NEW Email sent successfully!");
      console.log("Message ID:", result.messageId);

      if (result.previewUrl) {
        console.log("\n" + "=".repeat(60));
        console.log("📧 PREVIEW THE NEW STUNNING EMAIL HERE:");
        console.log(result.previewUrl);
        console.log("=".repeat(60));
        console.log("\n💡 Features in this email:");
        console.log("   ✨ Beautiful gradient header with celebration theme");
        console.log("   🖼️  High-quality Unsplash images for each step");
        console.log("   🎨 Colorful application info card");
        console.log("   📱 Interactive hover effects on cards");
        console.log("   🚀 Modern, engaging visual design");
        console.log("   📲 App download section with background image");
        console.log(
          "\n🎯 This is MUCH more engaging than the previous version!"
        );
      }
    } else {
      console.error("❌ Failed to send email:", result.error);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }

  process.exit(0);
}

sendNewEmail();
