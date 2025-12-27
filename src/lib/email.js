import nodemailer from "nodemailer";

class EmailService {
  constructor() {
    const smtpPort = parseInt(process.env.SMTP_PORT) || 587;
    const isSecure = process.env.SMTP_SECURE === "true";

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: isSecure, // true for 465 (SSL), false for other ports (use STARTTLS)
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
  }

  async sendEmail({ to, subject, html, attachments = [] }) {
    try {
      const mailOptions = {
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to,
        subject,
        html,
        attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent:", info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Email send error:", error);
      throw error;
    }
  }

  async sendOrderConfirmation(order) {
    const subject = `Order Confirmation - #${order.orderNumber}`;
    const html = this.generateOrderConfirmationEmail(order);

    return await this.sendEmail({
      to: order.shippingAddress.email,
      subject,
      html,
    });
  }

  async sendDeliveryConfirmation(order) {
    const subject = `Order Delivered - #${order.orderNumber}`;
    const html = this.generateDeliveryEmail(order);

    return await this.sendEmail({
      to: order.shippingAddress.email,
      subject,
      html,
    });
  }

  async sendInvoice(order, invoiceHtml) {
    const subject = `Invoice - Order #${order.orderNumber}`;

    return await this.sendEmail({
      to: order.shippingAddress.email,
      subject,
      html: invoiceHtml,
    });
  }

  generateOrderConfirmationEmail(order) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .logo { max-width: 150px; margin-bottom: 20px; }
          .content { background: #f9f9f9; padding: 30px; }
          .order-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://res.cloudinary.com/dnhak76jd/image/upload/v1760463244/WhatsApp_Image_2025-10-14_at_23.03.45_xuucfw.jpg" alt="Online Planet" class="logo">
            <h1>Order Confirmed!</h1>
            <p>Thank you for your order</p>
          </div>
          
          <div class="content">
            <h2>Hi ${order.shippingAddress.name},</h2>
            <p>Your order has been confirmed and is being processed.</p>
            
            <div class="order-info">
              <h3>Order Details</h3>
              <p><strong>Order Number:</strong> #${order.orderNumber}</p>
              <p><strong>Order Date:</strong> ${new Date(
                order.createdAt
              ).toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> ₹${order.pricing.total.toLocaleString()}</p>
              
              <h3 style="margin-top: 20px;">Items Ordered:</h3>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.items
                    .map(
                      (item) => `
                    <tr>
                      <td>${item.name}</td>
                      <td>${item.quantity}</td>
                      <td>₹${(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
              
              <h3 style="margin-top: 20px;">Delivery Address:</h3>
              <p>
                ${order.shippingAddress.name}<br>
                ${order.shippingAddress.addressLine1}<br>
                ${
                  order.shippingAddress.addressLine2
                    ? order.shippingAddress.addressLine2 + "<br>"
                    : ""
                }
                ${order.shippingAddress.city}, ${
      order.shippingAddress.state
    } - ${order.shippingAddress.pincode}<br>
                ${order.shippingAddress.phone}
              </p>
            </div>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_URL}/orders/${
      order.orderNumber
    }" class="button">Track Your Order</a>
            </center>
          </div>
          
          <div class="footer">
            <p>© 2025 Online Planet. All rights reserved.</p>
            <p>Contact us: ${process.env.SMTP_FROM_EMAIL}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateDeliveryEmail(order) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .logo { max-width: 150px; margin-bottom: 20px; }
          .content { background: #f9f9f9; padding: 30px; }
          .success-icon { font-size: 60px; margin: 20px 0; }
          .order-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://res.cloudinary.com/dnhak76jd/image/upload/v1760463244/WhatsApp_Image_2025-10-14_at_23.03.45_xuucfw.jpg" alt="Online Planet" class="logo">
            <div class="success-icon">✓</div>
            <h1>Order Delivered!</h1>
            <p>Your order has been successfully delivered</p>
          </div>
          
          <div class="content">
            <h2>Hi ${order.shippingAddress.name},</h2>
            <p>Great news! Your order has been delivered successfully.</p>
            
            <div class="order-info">
              <h3>Order Summary</h3>
              <p><strong>Order Number:</strong> #${order.orderNumber}</p>
              <p><strong>Delivered On:</strong> ${new Date(
                order.shipping.deliveredAt
              ).toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> ₹${order.pricing.total.toLocaleString()}</p>
              
              <p style="margin-top: 20px;">Please find your invoice attached with this email.</p>
            </div>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_URL}/orders/${
      order.orderNumber
    }" class="button">View Order Details</a>
            </center>
            
            <p style="text-align: center; margin-top: 20px;">
              We hope you enjoy your purchase! If you have any questions or concerns, please don't hesitate to contact us.
            </p>
          </div>
          
          <div class="footer">
            <p>© 2025 Online Planet. All rights reserved.</p>
            <p>Contact us: ${process.env.SMTP_FROM_EMAIL}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export default new EmailService();
