import { NextResponse } from "next/server";
import emailService from "@/lib/email/emailService";

export async function POST(request) {
  try {
    const { to } = await request.json();

    console.log("\n📧 Sending test email to:", to);

    const result = await emailService.sendEmail({
      to: to || "harshurao058@gmail.com",
      subject: "✅ Test Email - Please Check Your Inbox",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Email System Working!</h1>
            </div>
            <div class="content">
              <div class="success">
                <h2>Success!</h2>
                <p>If you're reading this, your email system is working perfectly!</p>
              </div>
              <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>From:</strong> info@onlineplanet.ae</p>
              <p><strong>SMTP Server:</strong> smtp.hostinger.com:587</p>
              <hr>
              <p style="color: #666; font-size: 12px;">
                This is a test email from Online Planet. If you received this in your spam folder, 
                please mark it as "Not Spam" to ensure future emails arrive in your inbox.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: "Test email - If you're reading this, your email system is working!",
    });

    console.log("📬 Email result:", result);

    return NextResponse.json({
      success: true,
      result,
      message: "Email sent! Check your inbox (and spam folder)",
      sentTo: to || "harshurao058@gmail.com",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST(
    new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ to: "harshurao058@gmail.com" }),
    })
  );
}
