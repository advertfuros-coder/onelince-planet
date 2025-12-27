// scripts/sendApprovalEmail.mjs
// Send seller account approval email with credentials

import emailService from "../src/lib/email/emailService.js";
import { generateSellerApprovalEmail } from "../src/lib/email/templates/sellerApproval.js";

async function sendApprovalEmail() {
  console.log("✅ Sending Seller Account Approval Email...\n");

  const approvalData = {
    sellerName: "Harsh Rao",
    email: "harshurao058@gmail.com",
    password: "123456", // This would be the temporary password from registration
    businessName: "Harsh Trading Company LLC",
    dashboardUrl: "https://onlineplanet.com/seller/dashboard",
  };

  console.log("📧 Approval Email Details:");
  console.log("   • Seller:", approvalData.sellerName);
  console.log("   • Email:", approvalData.email);
  console.log("   • Password:", approvalData.password);
  console.log("   • Business:", approvalData.businessName);
  console.log("");

  const emailHtml = generateSellerApprovalEmail(approvalData);

  console.log("Sending to:", approvalData.email);
  console.log(
    "Subject: 🎉 Your Seller Account is Approved - Start Selling Now!\n"
  );

  try {
    const result = await emailService.sendEmail({
      to: approvalData.email,
      subject: "🎉 Your Seller Account is Approved - Start Selling Now!",
      html: emailHtml,
    });

    if (result.success) {
      console.log("✅ Approval email sent successfully!");
      console.log("Message ID:", result.messageId);

      if (result.previewUrl) {
        console.log("\n" + "═".repeat(70));
        console.log("📧 PREVIEW THE APPROVAL EMAIL:");
        console.log(result.previewUrl);
        console.log("═".repeat(70));
        console.log("\n✨ This email includes:");
        console.log("   ✓ Green success header");
        console.log("   ✓ Login credentials (email & password)");
        console.log("   ✓ Security warning");
        console.log("   ✓ Login button");
        console.log("   ✓ 5-step quick start guide");
        console.log("   ✓ Resource links");
        console.log("   ✓ Support contact info");
        console.log("\n🎯 Seller receives this after admin approval!");
      }
    } else {
      console.error("❌ Failed to send email:", result.error);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }

  process.exit(0);
}

sendApprovalEmail();
