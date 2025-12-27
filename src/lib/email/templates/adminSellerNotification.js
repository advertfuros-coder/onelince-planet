// lib/email/templates/adminSellerNotification.js

export function generateAdminSellerNotification({
  sellerName,
  email,
  businessName,
  applicationId,
  sellerId,
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Seller Registration - Admin Notification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      padding: 30px 20px;
      text-align: center;
      color: white;
    }
    .content {
      padding: 30px 20px;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .info-table td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-table td:first-child {
      font-weight: 600;
      color: #6b7280;
      width: 40%;
    }
    .cta-button {
      display: inline-block;
      background: #3b82f6;
      color: white !important;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .alert {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 New Seller Registration</h1>
      <p>Action required: Review and approve seller application</p>
    </div>
    
    <div class="content">
      <div class="alert">
        <strong>⏰ Pending Review</strong>
        <p style="margin: 8px 0 0 0;">A new seller has registered and is awaiting approval.</p>
      </div>

      <h2>Seller Information</h2>
      <table class="info-table">
        <tr>
          <td>Application ID</td>
          <td><strong>${applicationId}</strong></td>
        </tr>
        <tr>
          <td>Seller Name</td>
          <td>${sellerName}</td>
        </tr>
        <tr>
          <td>Business Name</td>
          <td>${businessName}</td>
        </tr>
        <tr>
          <td>Email</td>
          <td>${email}</td>
        </tr>
        <tr>
          <td>Seller ID</td>
          <td><code>${sellerId}</code></td>
        </tr>
        <tr>
          <td>Submitted</td>
          <td>${new Date().toLocaleString()}</td>
        </tr>
      </table>

      <center>
        <a href="${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"
        }/admin/sellers/${sellerId}" class="cta-button">
          Review Application →
        </a>
      </center>

      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
        Please review the seller's documents and business information within 24-48 hours.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
