import mongoose from "mongoose";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import emailService from "../src/lib/email/emailService.js";
import { generateSellerApprovalEmail } from "../src/lib/email/templates/sellerApproval.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env.local") });

async function simulateApproval() {
  console.log("🚀 Simulating Seller Approval Flow...");

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Seller = (await import("../src/lib/db/models/Seller.js")).default;
    const User = (await import("../src/lib/db/models/User.js")).default;

    const sellerId = "6957e7eadc285d04893c3744";
    const seller = await Seller.findById(sellerId);

    if (!seller) throw new Error("Seller not found");
    console.log(
      `📍 Found Seller: ${seller.businessInfo?.businessName || "N/A"}`
    );

    // 1. Generate Temp Password
    const tempPassword = Math.random().toString(36).slice(-8).toUpperCase();
    console.log(`🔑 Generated Temp Password: ${tempPassword}`);

    // 2. Hash and Update User
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const user = await User.findById(seller.userId);
    if (!user) throw new Error("User not found");

    user.password = hashedPassword;
    user.requirePasswordChange = true;
    await user.save();
    console.log(`✅ User Updated: ${user.email} now requires password change`);

    // 3. Update Seller Status
    seller.verificationStatus = "approved";
    seller.isVerified = true;
    await seller.save();
    console.log(`✅ Seller Status Updated: approved`);

    // 4. Send Email
    console.log(`📧 Sending Approval Email to ${user.email}...`);
    const emailHtml = generateSellerApprovalEmail({
      sellerName: user.name,
      email: user.email,
      password: tempPassword,
      businessName: seller.businessInfo?.businessName || "Your Store",
      dashboardUrl: "http://localhost:3000/seller/login",
    });

    const result = await emailService.sendEmail({
      to: user.email,
      subject: "🎉 Your Seller Account is Approved - Start Selling Now!",
      html: emailHtml,
    });

    if (result.success) {
      console.log(`✨ SUCCESS: Email sent! MessageID: ${result.messageId}`);
    } else {
      console.error(`❌ FAILED: Email could not be sent.`);
    }
  } catch (err) {
    console.error(`💥 ERROR: ${err.message}`);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

simulateApproval();
