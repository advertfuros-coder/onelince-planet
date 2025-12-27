// scripts/sendActualWelcomeEmail.mjs
// Send the exact seller welcome email that will be sent after onboarding

import emailService from "../src/lib/email/emailService.js";
import { generateSellerWelcomeEmail } from "../src/lib/email/templates/sellerWelcome.js";

async function sendActualEmail() {
  console.log("📧 Sending Actual Seller Welcome Email...\n");

  // Exact data format that will be used in production
  const sellerData = {
    sellerName: "Harsh Rao",
    email: "harshurao058@gmail.com",
    applicationId: "ONP-ABC12345",
    businessName: "Harsh Trading Company LLC",
  };

  console.log("Generating production email template...");
  const emailHtml = generateSellerWelcomeEmail(sellerData);

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
      console.log("✅ Email sent successfully!");
      console.log("Message ID:", result.messageId);

      if (result.previewUrl) {
        console.log("\n📧 Email Preview URL:");
        console.log(result.previewUrl);
        console.log(
          "\n💡 Open this URL in your browser to see the exact email UI"
        );
        console.log(
          "📌 This is the EXACT email that sellers will receive after onboarding!"
        );
      }
    } else {
      console.error("❌ Failed to send email:", result.error);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  }

  process.exit(0);
}

sendActualEmail();
