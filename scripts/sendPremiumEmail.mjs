// scripts/sendPremiumEmail.mjs
// Send the PREMIUM classy professional email

import emailService from "../src/lib/email/emailService.js";
import { generateSellerWelcomePremium } from "../src/lib/email/templates/sellerWelcomePremium.js";

async function sendPremiumEmail() {
  console.log("✨ Sending PREMIUM Professional Email...\n");

  const sellerData = {
    sellerName: "Harsh Rao",
    email: "harshurao058@gmail.com",
    applicationId: "ONP-ABC12345",
    businessName: "Harsh Trading Company LLC",
  };

  console.log("🎨 Premium Design Features:");
  console.log("   ✓ Poppins Font Family");
  console.log("   ✓ Clean White Background");
  console.log("   ✓ Black & Gold Theme");
  console.log("   ✓ Professional Typography");
  console.log("   ✓ Minimal & Classy");
  console.log("   ✓ Corporate Premium Look\n");

  const emailHtml = generateSellerWelcomePremium(sellerData);

  console.log("Sending to:", sellerData.email);
  console.log("Subject: Welcome to Online Planet - Seller Account\n");

  try {
    const result = await emailService.sendEmail({
      to: sellerData.email,
      subject: "Welcome to Online Planet - Seller Account",
      html: emailHtml,
    });

    if (result.success) {
      console.log("✅ PREMIUM Email sent successfully!");
      console.log("Message ID:", result.messageId);

      if (result.previewUrl) {
        console.log("\n" + "═".repeat(70));
        console.log("📧 VIEW THE PREMIUM PROFESSIONAL EMAIL:");
        console.log(result.previewUrl);
        console.log("═".repeat(70));
        console.log("\n🏆 Premium Features:");
        console.log("   • Poppins font throughout");
        console.log("   • Clean white background (no blue)");
        console.log("   • Sophisticated black header");
        console.log("   • Gold accent divider");
        console.log("   • Professional grid layout");
        console.log("   • Minimal, classy design");
        console.log("   • Corporate email signature");
        console.log("\n✨ This is a PREMIUM, PROFESSIONAL email template!");
      }
    } else {
      console.error("❌ Failed to send email:", result.error);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }

  process.exit(0);
}

sendPremiumEmail();
