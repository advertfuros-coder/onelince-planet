// lib/email/templates/otpEmail.js

export function generateOTPEmail({ name, otp, expiryMinutes = 10 }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Poppins', sans-serif;
      background: #FAFAFA;
      padding: 40px 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #FFFFFF;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .content {
      padding: 50px 40px;
    }
    .greeting {
      font-size: 20px;
      color: #1a1a1a;
      margin-bottom: 20px;
      font-weight: 600;
    }
    .message {
      color: #666;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .otp-box {
      background: linear-gradient(135deg, #F0F4FF 0%, #E8EDFF 100%);
      border: 2px dashed #667eea;
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      margin: 30px 0;
    }
    .otp-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 12px;
      font-weight: 500;
    }
    .otp-code {
      font-size: 42px;
      font-weight: 700;
      color: #667eea;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
    }
    .expiry {
      margin-top: 12px;
      font-size: 13px;
      color: #999;
    }
    .warning {
      background: #FEF3C7;
      border-left: 4px solid #F59E0B;
      padding: 20px;
      border-radius: 4px;
      margin: 30px 0;
    }
    .warning p {
      color: #92400E;
      font-size: 14px;
      margin: 0;
    }
    .footer {
      background: #F7FAFC;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #E5E7EB;
    }
    .footer p {
      color: #999;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Email Verification</h1>
      <p>One-Time Password</p>
    </div>
    
    <div class="content">
      <p class="greeting">Hi ${name},</p>
      
      <p class="message">
        You requested to change your password. Please use the following One-Time Password (OTP) to verify your email and proceed with the password update.
      </p>
      
      <div class="otp-box">
        <div class="otp-label">Your OTP Code</div>
        <div class="otp-code">${otp}</div>
        <div class="expiry">Valid for ${expiryMinutes} minutes</div>
      </div>
      
      <p class="message">
        Enter this code in the verification screen to continue. If you didn't request this, please ignore this email or contact support if you have concerns.
      </p>
      
      <div class="warning">
        <p>
          <strong>⚠️ Security Note:</strong> Never share this OTP with anyone. Online Planet will never ask for your OTP via email or phone.
        </p>
      </div>
    </div>
    
    <div class="footer">
      <p>
        © ${new Date().getFullYear()} Online Planet. All rights reserved.<br>
        This is an automated message, please do not reply.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
