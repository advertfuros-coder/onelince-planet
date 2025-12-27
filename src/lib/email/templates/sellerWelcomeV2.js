// lib/email/templates/sellerWelcomeV2.js

export function generateSellerWelcomeEmailV2({ sellerName, email, applicationId, businessName }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Online Planet</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
    }
    .email-wrapper {
      max-width: 650px;
      margin: 0 auto;
      background: white;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    /* Animated Confetti Header */
    .header {
      background: linear-gradient(135deg, #FFE5F1 0%, #E0C3FC 100%);
      padding: 60px 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .confetti {
      position: absolute;
      width: 10px;
      height: 10px;
      background: #FFD700;
      top: -10px;
      border-radius: 50%;
      animation: fall 3s linear infinite;
    }
    @keyframes fall {
      to { transform: translateY(600px) rotate(360deg); opacity: 0; }
    }
    .welcome-badge {
      display: inline-block;
      background: white;
      color: #667eea;
      padding: 8px 24px;
      border-radius: 50px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 2px;
      margin-bottom: 20px;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }
    .header h1 {
      font-size: 36px;
      color: #2D3748;
      margin-bottom: 12px;
      font-weight: 800;
    }
    .header p {
      font-size: 18px;
      color: #4A5568;
    }
    .celebration-img {
      width: 200px;
      height: 200px;
      margin: 20px auto;
      background: url('https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=400&h=400&fit=crop') center/cover;
      border-radius: 50%;
      border: 8px solid white;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
    }
    
    /* Content Section */
    .content {
      padding: 50px 40px;
    }
    .greeting {
      font-size: 24px;
      color: #1A202C;
      margin-bottom: 20px;
      font-weight: 700;
    }
    .message {
      color: #4A5568;
      line-height: 1.8;
      font-size: 16px;
      margin-bottom: 24px;
    }
    
    /* Application Card */
    .app-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      padding: 30px;
      margin: 30px 0;
      color: white;
      position: relative;
      overflow: hidden;
    }
    .app-card::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    }
    .app-card h3 {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .app-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      position: relative;
      z-index: 1;
    }
    .app-info-item {
      background: rgba(255, 255, 255, 0.15);
      padding: 15px;
      border-radius: 12px;
      backdrop-filter: blur(10px);
    }
    .app-info-label {
      font-size: 12px;
      opacity: 0.8;
      margin-bottom: 5px;
    }
    .app-info-value {
      font-size: 16px;
      font-weight: 700;
    }
    
    /* Steps Section */
    .steps-section {
      margin: 40px 0;
    }
    .section-title {
      text-align: center;
      font-size: 28px;
      color: #1A202C;
      margin-bottom: 40px;
      font-weight: 800;
    }
    .steps-grid {
      display: grid;
      gap: 24px;
    }
    .step-card {
      background: #F7FAFC;
      border-radius: 16px;
      padding: 30px;
      display: flex;
      gap: 24px;
      align-items: flex-start;
      transition: all 0.3s ease;
      border: 2px solid transparent;
    }
    .step-card:hover {
      border-color: #667eea;
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(102, 126, 234, 0.15);
    }
    .step-icon {
      flex-shrink: 0;
      width: 120px;
      height: 120px;
      border-radius: 16px;
      background-size: cover;
      background-position: center;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
    .step-content h4 {
      font-size: 20px;
      color: #1A202C;
      margin-bottom: 8px;
      font-weight: 700;
    }
    .step-content p {
      color: #4A5568;
      line-height: 1.6;
      margin-bottom: 12px;
    }
    .step-time {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    
    /* CTA Button */
    .cta-section {
      text-align: center;
      margin: 50px 0;
      padding: 40px;
      background: linear-gradient(135deg, #FFF5F7 0%, #E0C3FC 100%);
      border-radius: 20px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      text-decoration: none;
      padding: 18px 48px;
      border-radius: 50px;
      font-weight: 700;
      font-size: 18px;
      box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
      transition: all 0.3s ease;
    }
    .cta-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 40px rgba(102, 126, 234, 0.5);
    }
    
    /* Support Section */
    .support-section {
      background: #F7FAFC;
      border-left: 4px solid #667eea;
      padding: 30px;
      border-radius: 12px;
      margin-top: 40px;
    }
    .support-section h3 {
      color: #1A202C;
      font-size: 20px;
      margin-bottom: 12px;
      font-weight: 700;
    }
    
    /* App Download */
    .app-download {
      background: linear-gradient(135deg, #1A202C 0%, #2D3748 100%);
      padding: 50px 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .app-download::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=400&fit=crop') center/cover;
      opacity: 0.1;
    }
    .app-download h3 {
      color: white;
      font-size: 28px;
      margin-bottom: 16px;
      position: relative;
      z-index: 1;
      font-weight: 800;
    }
    .app-download p {
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 30px;
      position: relative;
      z-index: 1;
      font-size: 16px;
    }
    .app-buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
      position: relative;
      z-index: 1;
    }
    .app-button {
      background: white;
      color: #1A202C;
      padding: 14px 28px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 12px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }
    .app-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    }
    
    /* Footer */
    .footer {
      background: #F7FAFC;
      padding: 40px;
      text-align: center;
      border-top: 1px solid #E2E8F0;
    }
    .footer-links {
      margin: 20px 0;
    }
    .footer-link {
      color: #667eea;
      text-decoration: none;
      margin: 0 16px;
      font-weight: 600;
      font-size: 14px;
    }
    .social-links {
      margin: 24px 0;
    }
    .social-icon {
      display: inline-block;
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      margin: 0 8px;
      color: white;
      line-height: 44px;
      text-decoration: none;
      font-weight: 700;
      transition: all 0.3s ease;
    }
    .social-icon:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
    .copyright {
      color: #718096;
      font-size: 13px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <!-- Header with Celebration -->
    <div class="header">
      <div class="welcome-badge">🎉 WELCOME</div>
      <h1>Welcome to Online Planet!</h1>
      <p>Your seller journey starts here</p>
      <div class="celebration-img"></div>
    </div>

    <!-- Main Content -->
    <div class="content">
      <p class="greeting">Hi ${sellerName}! 👋</p>
      <p class="message">
        🎊 <strong>Congratulations!</strong> You've taken the first step towards building your online empire. 
        We're thrilled to have you join our community of successful sellers on Online Planet!
      </p>
      <p class="message">
        Your application has been received and our team is already reviewing your information. 
        Get ready to reach millions of customers across UAE and India! 🚀
      </p>

      <!-- Application Card -->
      <div class="app-card">
        <h3>📋 Your Application Details</h3>
        <div class="app-info">
          <div class="app-info-item">
            <div class="app-info-label">Application ID</div>
            <div class="app-info-value">${applicationId}</div>
          </div>
          <div class="app-info-item">
            <div class="app-info-label">Business Name</div>
            <div class="app-info-value">${businessName}</div>
          </div>
          <div class="app-info-item">
            <div class="app-info-label">Email</div>
            <div class="app-info-value">${email}</div>
          </div>
          <div class="app-info-item">
            <div class="app-info-label">Status</div>
            <div class="app-info-value">⏳ Pending Review</div>
          </div>
        </div>
      </div>

      <!-- Steps Section -->
      <div class="steps-section">
        <h2 class="section-title">🚀 What Happens Next?</h2>
        
        <div class="steps-grid">
          <!-- Step 1 -->
          <div class="step-card">
            <div class="step-icon" style="background-image: url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=300&h=300&fit=crop')"></div>
            <div class="step-content">
              <h4>📝 Document Verification</h4>
              <p>Our team will carefully review your submitted documents and business information to ensure everything is in order.</p>
              <span class="step-time">⏱ 24-48 hours</span>
            </div>
          </div>

          <!-- Step 2 -->
          <div class="step-card">
            <div class="step-icon" style="background-image: url('https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=300&h=300&fit=crop')"></div>
            <div class="step-content">
              <h4>✅ Account Approval</h4>
              <p>Once verified, you'll receive an email with your login credentials and full access to your seller dashboard.</p>
              <span class="step-time">⏱ 1-2 business days</span>
            </div>
          </div>

          <!-- Step 3 -->
          <div class="step-card">
            <div class="step-icon" style="background-image: url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=300&fit=crop')"></div>
            <div class="step-content">
              <h4>🎯 Start Selling</h4>
              <p>List your products, customize your store, and start reaching millions of customers. Your success story begins!</p>
              <span class="step-time">⏱ Instant after approval</span>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="cta-section">
        <h3 style="font-size: 24px; color: #1A202C; margin-bottom: 16px; font-weight: 800;">📚 Get Ready to Succeed</h3>
        <p style="color: #4A5568; margin-bottom: 24px;">Learn best practices and tips to maximize your sales</p>
        <a href="https://onlineplanet.com/seller-guide" class="cta-button">
          Read Seller Guide →
        </a>
      </div>

      <!-- Support Section -->
      <div class="support-section">
        <h3>💬 Need Help? We're Here!</h3>
        <p class="message">
          Our dedicated seller support team is ready to help you succeed. Have questions? Reach out anytime!
        </p>
        <p style="margin-top: 16px;">
          📧 Email: <a href="mailto:seller-support@onlineplanet.com" style="color: #667eea; font-weight: 700;">seller-support@onlineplanet.com</a><br>
          📱 WhatsApp: <a href="https://wa.me/971501234567" style="color: #667eea; font-weight: 700;">+971 50 123 4567</a>
        </p>
      </div>
    </div>

    <!-- App Download Section -->
    <div class="app-download">
      <h3>📱 Download Our Seller App</h3>
      <p>Manage your store on the go • Track orders • Update inventory</p>
      <div class="app-buttons">
        <a href="https://apps.apple.com" class="app-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 21.99 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 21.99C7.78997 22.03 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5Z"/>
          </svg>
          <span>App Store</span>
        </a>
        <a href="https://play.google.com" class="app-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
          </svg>
          <span>Google Play</span>
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-links">
        <a href="#" class="footer-link">Seller Terms</a>
        <a href="#" class="footer-link">Policies</a>
        <a href="#" class="footer-link">Help Center</a>
      </div>
      
      <div class="social-links">
        <a href="#" class="social-icon">f</a>
        <a href="#" class="social-icon">𝕏</a>
        <a href="#" class="social-icon">in</a>
        <a href="#" class="social-icon">📷</a>
      </div>

      <p class="copyright">
        © ${new Date().getFullYear()} Online Planet. All rights reserved.<br>
        Making dreams come true, one seller at a time 💜
      </p>
    </div>
  </div>
</body>
</html>
  `
}
