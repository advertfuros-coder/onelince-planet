// lib/email/templates/sellerWelcomePremium.js

export function generateSellerWelcomePremium({
  sellerName,
  email,
  applicationId,
  businessName,
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Online Planet</title>
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
    
    /* Premium Header */
    .header {
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
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
      background: linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.03) 100%);
    }
    .logo {
      font-size: 28px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.5px;
      margin-bottom: 30px;
      position: relative;
      z-index: 1;
    }
    .welcome-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
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
      color: rgba(255, 255, 255, 0.8);
      font-size: 16px;
      font-weight: 400;
      position: relative;
      z-index: 1;
    }
    .divider {
      height: 4px;
      background: linear-gradient(90deg, #D4AF37 0%, #F4D03F 50%, #D4AF37 100%);
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
    
    /* Premium Card */
    .info-card {
      background: #FAFAFA;
      border: 1px solid #E8E8E8;
      border-radius: 12px;
      padding: 40px;
      margin: 40px 0;
    }
    .info-card-header {
      font-size: 14px;
      color: #666;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #E8E8E8;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .info-item {
      background: #FFFFFF;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #F0F0F0;
    }
    .info-label {
      font-size: 12px;
      color: #999;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .info-value {
      font-size: 16px;
      color: #1a1a1a;
      font-weight: 600;
    }
    
    /* Steps Section */
    .section-title {
      font-size: 24px;
      color: #1a1a1a;
      font-weight: 700;
      margin: 50px 0 30px 0;
      letter-spacing: -0.3px;
    }
    .steps {
      margin: 30px 0;
    }
    .step {
      display: flex;
      gap: 24px;
      margin-bottom: 32px;
      padding-bottom: 32px;
      border-bottom: 1px solid #F0F0F0;
    }
    .step:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .step-number {
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      background: #1a1a1a;
      color: #FFFFFF;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 700;
    }
    .step-content h3 {
      font-size: 18px;
      color: #1a1a1a;
      font-weight: 600;
      margin-bottom: 8px;
      letter-spacing: -0.2px;
    }
    .step-content p {
      color: #666;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 12px;
    }
    .step-time {
      display: inline-block;
      background: #F5F5F5;
      color: #1a1a1a;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    
    /* CTA Section */
    .cta-section {
      background: #1a1a1a;
      padding: 50px;
      text-align: center;
      margin: 50px 0;
      border-radius: 8px;
    }
    .cta-section h3 {
      color: #FFFFFF;
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 12px;
      letter-spacing: -0.3px;
    }
    .cta-section p {
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 30px;
      font-size: 15px;
    }
    .cta-button {
      display: inline-block;
      background: #FFFFFF;
      color: #1a1a1a !important;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 15px;
      transition: all 0.3s ease;
      letter-spacing: 0.3px;
    }
    .cta-button:hover {
      background: #F5F5F5;
      transform: translateY(-2px);
    }
    
    /* Support Box */
    .support-box {
      background: #F8F9FA;
      border-left: 4px solid #1a1a1a;
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
      color: #1a1a1a;
      text-decoration: none;
      font-weight: 600;
      border-bottom: 2px solid #1a1a1a;
      transition: opacity 0.3s;
    }
    .support-box a:hover {
      opacity: 0.7;
    }
    
    /* Contact Info */
    .contact-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 20px;
    }
    .contact-item {
      background: #FFFFFF;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #E8E8E8;
    }
    .contact-item strong {
      display: block;
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
      font-weight: 600;
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
      transition: color 0.3s;
    }
    .footer-link:hover {
      color: #1a1a1a;
    }
    .social-links {
      margin: 30px 0;
    }
    .social-link {
      display: inline-block;
      width: 40px;
      height: 40px;
      background: #1a1a1a;
      color: #FFFFFF;
      border-radius: 50%;
      margin: 0 6px;
      line-height: 40px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    .social-link:hover {
      background: #333;
      transform: translateY(-3px);
    }
    .copyright {
      color: #999;
      font-size: 13px;
      margin-top: 24px;
      font-weight: 400;
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
    .signature-title {
      color: #999;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Premium Header -->
    <div class="header">
      <div class="logo">ONLINE PLANET</div>
      <div class="welcome-badge">Welcome Aboard</div>
      <h1>Welcome to Online Planet</h1>
      <p>Your seller journey starts here</p>
    </div>
    <div class="divider"></div>

    <!-- Main Content -->
    <div class="content">
      <p class="greeting">Hi ${sellerName},</p>
      
      <p class="message">
        <strong>Congratulations on taking the first step!</strong> We're delighted to welcome you to Online Planet's exclusive community of successful sellers.
      </p>
      
      <p class="message">
        Your application has been received and is currently under review by our verification team. We take pride in maintaining the highest standards, and your patience during this process is appreciated.
      </p>

      <!-- Application Details Card -->
      <div class="info-card">
        <div class="info-card-header">Application Details</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Application ID</div>
            <div class="info-value">${applicationId}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Business Name</div>
            <div class="info-value">${businessName}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Email Address</div>
            <div class="info-value">${email}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Status</div>
            <div class="info-value">Under Review</div>
          </div>
        </div>
      </div>

      <!-- Next Steps -->
      <h2 class="section-title">What Happens Next</h2>
      
      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h3>Document Verification</h3>
            <p>Our compliance team will thoroughly review your submitted documents and business information to ensure authenticity and compliance with our standards.</p>
            <span class="step-time">24-48 hours</span>
          </div>
        </div>

        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h3>Account Activation</h3>
            <p>Upon successful verification, you'll receive your login credentials via email. Your seller dashboard will be fully configured and ready for use.</p>
            <span class="step-time">1-2 business days</span>
          </div>
        </div>

        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h3>Begin Selling</h3>
            <p>Start listing your products, customize your storefront, and reach millions of customers across UAE and India. Your success journey begins here.</p>
            <span class="step-time">Immediate access</span>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="cta-section">
        <h3>Prepare for Success</h3>
        <p>Learn best practices and strategies from our comprehensive seller guide</p>
        <a href="https://onlineplanet.com/seller-guide" class="cta-button">Access Seller Guide</a>
      </div>

      <!-- Support Section -->
      <div class="support-box">
        <h3>We're Here to Support You</h3>
        <p>
          Our dedicated seller success team is committed to helping you thrive on Online Planet. 
          Whether you have questions about the onboarding process or need assistance with your store setup, 
          we're here to help.
        </p>
        
        <div class="contact-info">
          <div class="contact-item">
            <strong>Email Support</strong>
            <a href="mailto:seller-support@onlineplanet.com">seller-support@onlineplanet.com</a>
          </div>
          <div class="contact-item">
            <strong>Phone Support</strong>
            <a href="tel:+971501234567">+971 50 123 4567</a>
          </div>
        </div>
      </div>

      <!-- Signature -->
      <div class="signature">
        <p class="signature-text">Best regards,</p>
        <p class="signature-name">The Online Planet Team</p>
        <p class="signature-title">Seller Success Department</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-links">
        <a href="#" class="footer-link">Seller Agreement</a>
        <a href="#" class="footer-link">Privacy Policy</a>
        <a href="#" class="footer-link">Help Center</a>
      </div>
      
      <div class="social-links">
        <a href="#" class="social-link">f</a>
        <a href="#" class="social-link">𝕏</a>
        <a href="#" class="social-link">in</a>
        <a href="#" class="social-link">IG</a>
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
