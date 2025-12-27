// scripts/testEmailSimple.mjs
// Simple test script using pure ES modules

import nodemailer from "nodemailer";

async function sendTestEmail() {
  console.log("📧 Testing Email Service...\n");
  console.log("Nodemailer loaded:", typeof nodemailer.createTransporter);

  try {
    // Create test account
    console.log("Creating test account...");
    const testAccount = await nodemailer.createTestAccount();
    console.log("Test account created:", testAccount.user);

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log("Transporter created successfully\n");

    // Simple HTML email
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 30px; border-radius: 10px; }
    h1 { color: #667eea; }
    .button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎉 Welcome to Online Planet!</h1>
    <p>Hi Harsh Rao,</p>
    <p>Thank you for registering as a seller on Online Planet!</p>
    <p><strong>Application ID:</strong> ONP-TEST1234</p>
    <p><strong>Business:</strong> Harsh Trading Company</p>
    <a href="#" class="button">View Application</a>
    <p style="margin-top: 30px; color: #666; font-size: 14px;">
      This is a test email from Online Planet Seller Onboarding System.
    </p>
  </div>
</body>
</html>
    `;

    // Send email
    console.log("Sending email to: harshurao058@gmail.com");
    const info = await transporter.sendMail({
      from: '"Online Planet" <noreply@onlineplanet.com>',
      to: "harshurao058@gmail.com",
      subject: "🎉 Welcome to Online Planet - Test Email",
      html: htmlContent,
    });

    console.log("\n✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log("\n📧 Email Preview URL:");
    console.log(previewUrl);
    console.log("\n💡 Click the URL above to view the email in your browser");
    console.log(
      "(Note: This is a test email using Ethereal - check the preview URL, not your actual inbox)"
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  }
}

sendTestEmail();
