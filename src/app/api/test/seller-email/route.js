import { NextResponse } from "next/server";
import emailService from "@/lib/email/emailService";
import { generateSellerApprovalEmail } from "@/lib/email/templates/sellerApproval";

export async function GET() {
  try {
    console.log("\n🧪 Testing seller approval email...\n");

    // Test data
    const testData = {
      sellerName: "Test Seller",
      email: process.env.SMTP_USER, // Send to yourself for testing
      password: "TEST123",
      businessName: "Test Business",
      dashboardUrl: `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/seller/dashboard`,
    };

    console.log("📧 Generating email for:", testData.email);

    const emailHtml = generateSellerApprovalEmail(testData);

    console.log("📤 Sending email...");

    const emailResult = await emailService.sendEmail({
      to: testData.email,
      subject: "🎉 TEST: Your Seller Account is Approved",
      html: emailHtml,
    });

    console.log("✅ Email result:", emailResult);

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      result: emailResult,
      sentTo: testData.email,
    });
  } catch (error) {
    console.error("❌ Test email error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        response: error.response,
      },
      { status: 500 }
    );
  }
}
