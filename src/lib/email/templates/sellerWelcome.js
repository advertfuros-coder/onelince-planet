// lib/email/templates/sellerWelcome.js

export function generateSellerWelcomeEmail({
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
  <title>Welcome to Online Planet - Seller Registration</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f8f9fa;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
      position: relative;
    }
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    }
    .envelope-icon {
      width: 80px;
      height: 80px;
      background: white;
      border-radius: 50%;
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      position: relative;
      z-index: 1;
    }
    .welcome-badge {
      background: white;
      color: #667eea;
      padding: 12px 24px;
      border-radius: 50px;
      font-size: 14px;
      font-weight: 600;
      display: inline-block;
      margin-bottom: 16px;
      position: relative;
      z-index: 1;
    }
    .header h1 {
      color: white;
      font-size: 28px;
      margin-bottom: 8px;
      position: relative;
      z-index: 1;
    }
    .header p {
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      position: relative;
      z-index: 1;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 20px;
      color: #1a202c;
      margin-bottom: 16px;
      font-weight: 600;
    }
    .message {
      color: #4a5568;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .info-box {
      background: linear-gradient(135deg, #f0f4ff 0%, #e8edff 100%);
      border-left: 4px solid #667eea;
      padding: 20px;
      border-radius: 8px;
      margin: 24px 0;
    }
    .info-box h3 {
      color: #667eea;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(102, 126, 234, 0.1);
    }
    .info-item:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #4a5568;
      font-size: 14px;
    }
    .info-value {
      color: #1a202c;
      font-weight: 600;
      font-size: 14px;
    }
    .steps-section {
      margin: 30px 0;
    }
    .steps-header {
      text-align: center;
      margin-bottom: 30px;
    }
    .steps-header h2 {
      color: #1a202c;
      font-size: 24px;
      margin-bottom: 8px;
    }
    .steps-header p {
      color: #718096;
      font-size: 14px;
    }
    .step-card {
      background: #ffffff;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 16px;
      transition: all 0.3s ease;
    }
    .step-card:hover {
      border-color: #667eea;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
    }
    .step-header {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
    }
    .step-number {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 18px;
      margin-right: 16px;
      flex-shrink: 0;
    }
    .step-title {
      color: #1a202c;
      font-size: 18px;
      font-weight: 600;
    }
    .step-description {
      color: #4a5568;
      font-size: 14px;
      line-height: 1.6;
      margin-left: 56px;
    }
    .step-time {
      color: #667eea;
      font-size: 12px;
      font-weight: 600;
      margin-left: 56px;
      margin-top: 8px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      margin: 20px 0;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    }
    .app-section {
      background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
      padding: 30px;
      text-align: center;
      margin-top: 30px;
    }
    .app-section h3 {
      color: white;
      font-size: 20px;
      margin-bottom: 16px;
    }
    .app-section p {
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 20px;
    }
    .app-buttons {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .app-button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: white;
      color: #1a202c;
      text-decoration: none;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;
    }
    .app-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
    }
    .footer {
      background: #f7fafc;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .footer-links {
      margin: 20px 0;
    }
    .footer-link {
      color: #667eea;
      text-decoration: none;
      margin: 0 12px;
      font-size: 14px;
    }
    .social-icons {
      margin: 20px 0;
    }
    .social-icon {
      display: inline-block;
      width: 36px;
      height: 36px;
      background: #e2e8f0;
      border-radius: 50%;
      margin: 0 6px;
      line-height: 36px;
      color: #4a5568;
      text-decoration: none;
    }
    .copyright {
      color: #718096;
      font-size: 12px;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="envelope-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="#667eea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="welcome-badge">WELCOME</div>
      <h1>Welcome to Online Planet!</h1>
      <p>Your seller journey starts here</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">Hi ${sellerName},</p>
      <p class="message">
        Thank you for choosing Online Planet to grow your business! We're excited to have you join our community of successful sellers.
      </p>
      <p class="message">
        Your seller application has been received and is currently under review. Our team will verify your documents and business information within 24-48 hours.
      </p>

      <!-- Application Info -->
      <div class="info-box">
        <h3>📋 Application Details</h3>
        <div class="info-item">
          <span class="info-label">Application ID</span>
          <span class="info-value">${applicationId}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Business Name</span>
          <span class="info-value">${businessName}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Email</span>
          <span class="info-value">${email}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Status</span>
          <span class="info-value" style="color: #f59e0b;">Pending Review</span>
        </div>
      </div>

      <!-- What's Next Section -->
      <div class="steps-section">
        <div class="steps-header">
          <h2>🚀 What Happens Next?</h2>
          <p>Follow these simple steps to get started</p>
        </div>

        <div class="step-card">
          <div class="step-header">
            <div class="step-number">1</div>
            <div class="step-title">Document Verification</div>
          </div>
          <p class="step-description">
            Our team will review your submitted documents and business information to ensure everything is in order.
          </p>
          <div class="step-time">⏱ 24-48 hours</div>
        </div>

        <div class="step-card">
          <div class="step-header">
            <div class="step-number">2</div>
            <div class="step-title">Account Approval</div>
          </div>
          <p class="step-description">
            Once verified, you'll receive an email with your login credentials and access to your seller dashboard.
          </p>
          <div class="step-time">⏱ 1-2 business days</div>
        </div>

        <div class="step-card">
          <div class="step-header">
            <div class="step-number">3</div>
            <div class="step-title">Start Selling</div>
          </div>
          <p class="step-description">
            List your products, set up your store, and start reaching millions of customers across UAE and India!
          </p>
          <div class="step-time">⏱ Instant after approval</div>
        </div>
      </div>

      <center>
        <a href="https://onlineplanet.com/seller-guide" class="cta-button">
          📚 Read Seller Guide
        </a>
      </center>

      <p class="message" style="margin-top: 30px;">
        <strong>Need help?</strong><br>
        Our seller support team is here to help you succeed. Email us at 
        <a href="mailto:seller-support@onlineplanet.com" style="color: #667eea;">seller-support@onlineplanet.com</a>
      </p>
    </div>

    <!-- App Download Section -->
    <div class="app-section">
      <h3>📱 Download Our Seller App</h3>
      <p>Manage your store on the go with our mobile app</p>
      <div class="app-buttons">
        <a href="https://apps.apple.com/app/online-planet-seller" class="app-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 21.99 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 21.99C7.78997 22.03 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
          </svg>
          App Store
        </a>
        <a href="https://play.google.com/store/apps/details?id=com.onlineplanet.seller" class="app-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
          </svg>
          Google Play
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-links">
        <a href="https://onlineplanet.com/seller-terms" class="footer-link">Seller Terms</a>
        <a href="https://onlineplanet.com/policies" class="footer-link">Policies</a>
        <a href="https://onlineplanet.com/support" class="footer-link">Support</a>
      </div>
      
      <div class="social-icons">
        <a href="https://facebook.com/onlineplanet" class="social-icon">f</a>
        <a href="https://twitter.com/onlineplanet" class="social-icon">𝕏</a>
        <a href="https://instagram.com/onlineplanet" class="social-icon">📷</a>
        <a href="https://linkedin.com/company/onlineplanet" class="social-icon">in</a>
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
