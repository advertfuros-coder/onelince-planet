// lib/utils/emailService.js
import nodemailer from "nodemailer";

// Create transporter
const smtpPort = parseInt(process.env.SMTP_PORT) || 587;
const isSecure = process.env.SMTP_SECURE === "true";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: isSecure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("SMTP server is ready to send emails");
  }
});

// Email templates
export const emailTemplates = {
  inventoryAlert: (alert, product, seller) => ({
    subject: `🚨 Inventory Alert: ${alert.alertType
      .replace(/_/g, " ")
      .toUpperCase()} - ${product.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert-box { background: white; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .priority-critical { border-left-color: #dc2626; background: #fee2e2; }
          .priority-high { border-left-color: #f97316; background: #ffedd5; }
          .priority-medium { border-left-color: #eab308; background: #fef9c3; }
          .stats { display: flex; justify-content: space-around; margin: 20px 0; }
          .stat { text-align: center; padding: 15px; background: white; border-radius: 8px; }
          .stat-value { font-size: 32px; font-weight: bold; color: #ef4444; }
          .stat-label { font-size: 14px; color: #6b7280; }
          .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Inventory Alert</h1>
            <p>Immediate attention required for your inventory</p>
          </div>
          <div class="content">
            <div class="alert-box priority-${alert.priority}">
              <h2 style="margin-top: 0;">${alert.alertType
                .replace(/_/g, " ")
                .toUpperCase()}</h2>
              <p><strong>Product:</strong> ${product.name}</p>
              <p><strong>SKU:</strong> ${product.sku}</p>
              <p><strong>Priority:</strong> ${alert.priority.toUpperCase()}</p>
            </div>
            
            <div class="stats">
              <div class="stat">
                <div class="stat-value">${alert.currentStock}</div>
                <div class="stat-label">Current Stock</div>
              </div>
              <div class="stat">
                <div class="stat-value">${alert.threshold}</div>
                <div class="stat-label">Threshold</div>
              </div>
              ${
                alert.recommendedRestock
                  ? `
                <div class="stat">
                  <div class="stat-value" style="color: #10b981;">${alert.recommendedRestock}</div>
                  <div class="stat-label">Recommended Restock</div>
                </div>
              `
                  : ""
              }
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Action Required:</h3>
              ${
                alert.alertType === "out_of_stock"
                  ? "<p>⚠️ <strong>URGENT:</strong> This product is completely out of stock. Immediate restocking is required to avoid lost sales.</p>"
                  : alert.alertType === "low_stock"
                  ? "<p>⚠️ Stock levels are critically low. Please restock soon to maintain availability.</p>"
                  : "<p>ℹ️ Stock levels are approaching reorder point. Plan your restocking accordingly.</p>"
              }
            </div>
            
            <center>
              <a href="${
                process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
              }/seller/inventory-alerts" class="button">
                View Alert Dashboard
              </a>
            </center>
          </div>
          <div class="footer">
            <p>This is an automated alert from Online Planet</p>
            <p>You're receiving this because you have inventory alerts enabled</p>
            <p>&copy; ${new Date().getFullYear()} Online Planet. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      INVENTORY ALERT - ${alert.alertType.replace(/_/g, " ").toUpperCase()}
      
      Product: ${product.name}
      SKU: ${product.sku}
      Priority: ${alert.priority.toUpperCase()}
      
      Current Stock: ${alert.currentStock}
      Threshold: ${alert.threshold}
      ${
        alert.recommendedRestock
          ? `Recommended Restock: ${alert.recommendedRestock}`
          : ""
      }
      
      Action Required:
      ${
        alert.alertType === "out_of_stock"
          ? "URGENT: This product is completely out of stock. Immediate restocking is required."
          : alert.alertType === "low_stock"
          ? "Stock levels are critically low. Please restock soon."
          : "Stock levels are approaching reorder point. Plan your restocking accordingly."
      }
      
      View your alerts: ${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/seller/inventory-alerts
    `,
  }),

  autoRestockConfirmation: (product, quantity, supplier) => ({
    subject: `✅ Auto-Restock Order Created - ${product.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Auto-Restock Order Created</h1>
            <p>Your inventory has been automatically restocked</p>
          </div>
          <div class="content">
            <div class="success-box">
              <h2 style="margin-top: 0;">Restock Order Confirmed</h2>
              <p>An automatic restock order has been created for low inventory.</p>
            </div>
            
            <div class="order-details">
              <h3>Order Details:</h3>
              <p><strong>Product:</strong> ${product.name}</p>
              <p><strong>SKU:</strong> ${product.sku}</p>
              <p><strong>Quantity:</strong> ${quantity} units</p>
              ${
                supplier
                  ? `<p><strong>Supplier:</strong> ${supplier.name}</p>`
                  : ""
              }
              <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Online Planet. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  predictiveAlert: (product, prediction) => ({
    subject: `📊 Predictive Alert: ${product.name} - Stock Out Predicted`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .prediction-box { background: #ede9fe; border-left: 4px solid #8b5cf6; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Predictive Inventory Alert</h1>
            <p>AI-powered stock prediction</p>
          </div>
          <div class="content">
            <div class="prediction-box">
              <h2 style="margin-top: 0;">Stock Out Prediction</h2>
              <p><strong>Product:</strong> ${product.name}</p>
              <p><strong>Current Stock:</strong> ${
                prediction.currentStock
              } units</p>
              <p><strong>Predicted Stock Out:</strong> ${
                prediction.predictedDays
              } days</p>
              <p><strong>Confidence:</strong> ${prediction.confidence}%</p>
              <p><strong>Recommended Action:</strong> Order ${
                prediction.recommendedQuantity
              } units now</p>
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Online Planet. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

// Send email function
export async function sendEmail({ to, subject, html, text }) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      html,
      text,
    });

    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }
}

// Send inventory alert email
export async function sendInventoryAlertEmail(alert, product, seller) {
  const template = emailTemplates.inventoryAlert(alert, product, seller);
  return sendEmail({
    to: seller.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

// Send auto-restock confirmation email
export async function sendAutoRestockEmail(
  product,
  quantity,
  supplier,
  seller
) {
  const template = emailTemplates.autoRestockConfirmation(
    product,
    quantity,
    supplier
  );
  return sendEmail({
    to: seller.email,
    subject: template.subject,
    html: template.html,
  });
}

// Send predictive alert email
export async function sendPredictiveAlertEmail(product, prediction, seller) {
  const template = emailTemplates.predictiveAlert(product, prediction);
  return sendEmail({
    to: seller.email,
    subject: template.subject,
    html: template.html,
  });
}
