// lib/email/templates/sellerApproval.js

export function generateSellerApprovalEmail({
  sellerName,
  email,
  password,
  businessName,
  dashboardUrl,
}) {
  const loginUrl = dashboardUrl || "https://onlineplanet.com/seller/login";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Approved - Start Selling</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #FAFAFA;
      padding: 40px 20px;
      line-height: 1.6;
    }
    .email-container {
      max-width: 680px;
      margin: 0 auto;
      background: #FFFFFF;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
    }
    
    /* Success Header */
    .header {
      background: linear-gradient(135deg, #059669 0%, #10B981 100%);
      padding: 60px 50px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.05) 100%);
    }
    .success-icon {
      width: 80px;
      height: 80px;
      background: #FFFFFF;
      border-radius: 50%;
      margin: 0 auto 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      position: relative;
      z-index: 1;
    }
    .status-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #FFFFFF;
      padding: 8px 20px;
      border-radius: 30px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 24px;
      position: relative;
      z-index: 1;
    }
    .header h1 {
      font-size: 36px;
      color: #FFFFFF;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 12px;
      position: relative;
      z-index: 1;
    }
    .header p {
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      font-weight: 400;
      position: relative;
      z-index: 1;
    }
    .divider {
      height: 4px;
      background: linear-gradient(90deg, #10B981 0%, #34D399 50%, #10B981 100%);
    }
    
    /* Content */
    .content {
      padding: 60px 50px;
    }
    .greeting {
      font-size: 28px;
      color: #1a1a1a;
      font-weight: 600;
      margin-bottom: 24px;
      letter-spacing: -0.3px;
    }
    .message {
      color: #4a4a4a;
      font-size: 16px;
      line-height: 1.8;
      margin-bottom: 24px;
      font-weight: 400;
    }
    .message strong {
      color: #1a1a1a;
      font-weight: 600;
    }
    
    /* Credentials Card */
    .credentials-card {
      background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
      border: 2px solid #10B981;
      border-radius: 12px;
      padding: 40px;
      margin: 40px 0;
      position: relative;
    }
    .credentials-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
    }
    .credentials-icon {
      width: 40px;
      height: 40px;
      background: #10B981;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
      font-weight: 700;
    }
    .credentials-title {
      font-size: 18px;
      color: #1a1a1a;
      font-weight: 700;
    }
    .credential-item {
      background: #FFFFFF;
      border: 1px solid #10B981;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 16px;
    }
    .credential-item:last-child {
      margin-bottom: 0;
    }
    .credential-label {
      font-size: 12px;
      color: #059669;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .credential-value {
      font-size: 18px;
      color: #1a1a1a;
      font-weight: 700;
      font-family: 'Courier New', monospace;
      word-break: break-all;
    }
    .security-note {
      margin-top: 20px;
      padding: 16px;
      background: #FEF3C7;
      border-left: 4px solid #F59E0B;
      border-radius: 4px;
    }
    .security-note p {
      color: #92400E;
      font-size: 13px;
      margin: 0;
      line-height: 1.6;
    }
    
    /* CTA Button */
    .cta-section {
      text-align: center;
      margin: 50px 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #059669 0%, #10B981 100%);
      color: #FFFFFF !important;
      text-decoration: none;
      padding: 18px 48px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 16px;
      box-shadow: 0 8px 30px rgba(16, 185, 129, 0.3);
      transition: all 0.3s ease;
      letter-spacing: 0.3px;
    }
    .cta-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 40px rgba(16, 185, 129, 0.4);
    }
    
    /* Quick Start Guide */
    .quick-start {
      background: #FAFAFA;
      border: 1px solid #E8E8E8;
      border-radius: 12px;
      padding: 40px;
      margin: 40px 0;
    }
    .quick-start h3 {
      font-size: 20px;
      color: #1a1a1a;
      font-weight: 700;
      margin-bottom: 24px;
      letter-spacing: -0.2px;
    }
    .steps-list {
      list-style: none;
    }
    .step-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #E8E8E8;
    }
    .step-item:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    .step-num {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      background: #10B981;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
    }
    .step-text {
      color: #4a4a4a;
      font-size: 15px;
      line-height: 1.6;
    }
    
    /* Resources Section */
    .resources {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 40px 0;
    }
    .resource-card {
      background: #FFFFFF;
      border: 1px solid #E8E8E8;
      border-radius: 8px;
      padding: 24px;
      text-align: center;
      transition: all 0.3s ease;
    }
    .resource-card:hover {
      border-color: #10B981;
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.08);
    }
    .resource-icon {
      font-size: 32px;
      margin-bottom: 12px;
    }
    .resource-title {
      font-size: 16px;
      color: #1a1a1a;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .resource-link {
      color: #10B981;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
    }
    
    /* Support Box */
    .support-box {
      background: #F8F9FA;
      border-left: 4px solid #10B981;
      padding: 30px;
      margin: 40px 0;
      border-radius: 4px;
    }
    .support-box h3 {
      font-size: 18px;
      color: #1a1a1a;
      font-weight: 600;
      margin-bottom: 12px;
    }
    .support-box p {
      color: #666;
      font-size: 15px;
      line-height: 1.6;
    }
    .support-box a {
      color: #10B981;
      text-decoration: none;
      font-weight: 600;
      border-bottom: 2px solid #10B981;
    }
    
    /* Footer */
    .footer {
      background: #FAFAFA;
      padding: 50px;
      text-align: center;
      border-top: 1px solid #E8E8E8;
    }
    .footer-links {
      margin-bottom: 30px;
    }
    .footer-link {
      color: #666;
      text-decoration: none;
      margin: 0 16px;
      font-size: 14px;
      font-weight: 500;
    }
    .copyright {
      color: #999;
      font-size: 13px;
      margin-top: 24px;
    }
    .signature {
      margin-top: 50px;
      padding-top: 30px;
      border-top: 1px solid #E8E8E8;
    }
    .signature-text {
      color: #666;
      font-size: 14px;
      margin-bottom: 8px;
    }
    .signature-name {
      color: #1a1a1a;
      font-size: 16px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Success Header -->
    <div class="header">
      <div class="success-icon">✓</div>
      <div class="status-badge">Account Approved</div>
      <h1>You're All Set!</h1>
      <p>Your seller account has been approved</p>
    </div>
    <div class="divider"></div>

    <!-- Main Content -->
    <div class="content">
      <p class="greeting">Congratulations, ${sellerName}! 🎉</p>
      
      <p class="message">
        <strong>Great news!</strong> Your seller account for <strong>${businessName}</strong> has been approved. 
        You're now ready to start selling on Online Planet and reach millions of customers across UAE and India.
      </p>

      <!-- Login Credentials -->
      <div class="credentials-card">
        <div class="credentials-header">
          <div class="credentials-icon">🔑</div>
          <div class="credentials-title">Your Login Credentials</div>
        </div>
        
        <div class="credential-item">
          <div class="credential-label">Email / Username</div>
          <div class="credential-value">${email}</div>
        </div>
        
        <div class="credential-item">
          <div class="credential-label">Temporary Password</div>
          <div class="credential-value">${password}</div>
        </div>
        
        <div class="security-note">
          <p>
            <strong>⚠️ Security Notice:</strong> Please change your password immediately after your first login. 
            Never share your password with anyone. Online Planet will never ask for your password via email or phone.
          </p>
        </div>
      </div>

      <!-- CTA Button -->
      <div class="cta-section">
        <a href="${loginUrl}" class="cta-button">
          Login to Seller Dashboard →
        </a>
        <p style="margin-top: 16px; color: #666; font-size: 14px;">${loginUrl}</p>
      </div>

      <!-- Quick Start Guide -->
      <div class="quick-start">
        <h3>🚀 Quick Start Guide</h3>
        <ul class="steps-list">
          <li class="step-item">
            <div class="step-num">1</div>
            <div class="step-text">
              <strong>Login to your dashboard</strong> using the credentials above and change your password
            </div>
          </li>
          <li class="step-item">
            <div class="step-num">2</div>
            <div class="step-text">
              <strong>Complete your store profile</strong> by adding your store logo, banner, and description
            </div>
          </li>
          <li class="step-item">
            <div class="step-num">3</div>
            <div class="step-text">
              <strong>Add your first product</strong> with high-quality images, detailed description, and competitive pricing
            </div>
          </li>
          <li class="step-item">
            <div class="step-num">4</div>
            <div class="step-text">
              <strong>Configure shipping & payments</strong> to ensure smooth order fulfillment
            </div>
          </li>
          <li class="step-item">
            <div class="step-num">5</div>
            <div class="step-text">
              <strong>Go live and start selling!</strong> Your products will be visible to millions of buyers
            </div>
          </li>
        </ul>
      </div>

      <!-- Resources -->
      <div class="resources">
        <div class="resource-card">
          <div class="resource-icon">📚</div>
          <div class="resource-title">Seller Guide</div>
          <a href="#" class="resource-link">Learn Best Practices</a>
        </div>
        <div class="resource-card">
          <div class="resource-icon">📹</div>
          <div class="resource-title">Video Tutorials</div>
          <a href="#" class="resource-link">Watch & Learn</a>
        </div>
        <div class="resource-card">
          <div class="resource-icon">💬</div>
          <div class="resource-title">Community Forum</div>
          <a href="#" class="resource-link">Join Discussion</a>
        </div>
        <div class="resource-card">
          <div class="resource-icon">📊</div>
          <div class="resource-title">Analytics</div>
          <a href="#" class="resource-link">Track Performance</a>
        </div>
      </div>

      <!-- Support Section -->
      <div class="support-box">
        <h3>Need Assistance?</h3>
        <p>
          Our seller success team is here to help you every step of the way. 
          If you have any questions or need support, don't hesitate to reach out.
        </p>
        <p style="margin-top: 16px;">
          📧 <a href="mailto:seller-support@onlineplanet.com">seller-support@onlineplanet.com</a><br>
          📱 <a href="tel:+971501234567">+971 50 123 4567</a>
        </p>
      </div>

      <!-- Signature -->
      <div class="signature">
        <p class="signature-text">Welcome to the family,</p>
        <p class="signature-name">The Online Planet Team</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-links">
        <a href="#" class="footer-link">Seller Dashboard</a>
        <a href="#" class="footer-link">Help Center</a>
        <a href="#" class="footer-link">Policies</a>
      </div>

      <p class="copyright">
        © ${new Date().getFullYear()} Online Planet. All rights reserved.<br>
        Dubai, United Arab Emirates
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
