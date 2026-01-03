// lib/services/emailService.js
import nodemailer from "nodemailer";

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    this.fromEmail = process.env.EMAIL_FROM || "noreply@onlineplanet.com";
    this.fromName = process.env.EMAIL_FROM_NAME || "Online Planet";
  }

  /**
   * Send email helper
   */
  async sendEmail({ to, subject, html, text }) {
    try {
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for plain text
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent:", { to, subject, messageId: info.messageId });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error("Email send error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Order Confirmation Email
   */
  async sendOrderConfirmation(order, customer) {
    const itemsHtml = order.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          ${item.name} (x${item.quantity})
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ₹${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .table { width: 100%; border-collapse: collapse; }
          .total-row { font-weight: bold; font-size: 18px; background: #f0f0f0; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Confirmed!</h1>
            <p>Thank you for your order, ${
              customer.name || "Valued Customer"
            }!</p>
          </div>
          <div class="content">
            <div class="order-details">
              <h2>Order #${order.orderNumber}</h2>
              <p><strong>Order Date:</strong> ${new Date(
                order.createdAt
              ).toLocaleDateString("en-IN", { dateStyle: "full" })}</p>
              <p><strong>Payment Method:</strong> ${order.payment.method.toUpperCase()}</p>
              <p><strong>Payment Status:</strong> ${order.payment.status}</p>
              
              <h3 style="margin-top: 30px;">Order Items</h3>
              <table class="table">
                ${itemsHtml}
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">Subtotal</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${order.pricing.subtotal.toFixed(
                    2
                  )}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">Shipping</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${order.pricing.shipping.toFixed(
                    2
                  )}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">Tax (GST)</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${order.pricing.tax.toFixed(
                    2
                  )}</td>
                </tr>
                ${
                  order.pricing.discount > 0
                    ? `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">Discount</td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; color: green;">-₹${order.pricing.discount.toFixed(
                    2
                  )}</td>
                </tr>
                `
                    : ""
                }
                <tr class="total-row">
                  <td style="padding: 15px;">Total</td>
                  <td style="padding: 15px; text-align: right;">₹${order.pricing.total.toFixed(
                    2
                  )}</td>
                </tr>
              </table>

              <h3 style="margin-top: 30px;">Shipping Address</h3>
              <p>
                ${order.shippingAddress.name}<br>
                ${order.shippingAddress.addressLine1}<br>
                ${
                  order.shippingAddress.addressLine2
                    ? `${order.shippingAddress.addressLine2}<br>`
                    : ""
                }
                ${order.shippingAddress.city}, ${
      order.shippingAddress.state
    } - ${order.shippingAddress.pincode}<br>
                Phone: ${order.shippingAddress.phone}
              </p>

              <center>
                <a href="${
                  order.isGuestOrder
                    ? `${process.env.NEXT_PUBLIC_APP_URL}/track-order/${
                        order.orderNumber
                      }?email=${encodeURIComponent(
                        customer.email || order.shippingAddress.email
                      )}`
                    : `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order._id}`
                }" class="button">
                  Track Your Order
                </a>
              </center>
            </div>

            <p style="margin-top: 30px; color: #666;">
              <strong>What's Next?</strong><br>
              • We'll process your order within 24 hours<br>
              • You'll receive shipping updates via WhatsApp & Email<br>
              • Track your order anytime using the link above${
                order.isGuestOrder
                  ? "<br>• <strong>Create an account</strong> to manage all your orders easily"
                  : ""
              }
            </p>

            <p style="margin-top: 20px; color: #999; font-size: 12px;">
              If you have any questions, reply to this email or contact our support at support@onlineplanet.com
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: customer.email || order.shippingAddress.email,
      subject: `Order Confirmed #${order.orderNumber} - Online Planet`,
      html,
    });
  }

  /**
   * Order Shipped Email
   */
  async sendOrderShipped(order, customer) {
    const trackingUrl = order.shipping?.trackingUrl || "#";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .tracking-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .button { display: inline-block; padding: 12px 30px; background: #11998e; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Your Order is On Its Way!</h1>
            <p>Hi ${customer.name || "Valued Customer"},</p>
          </div>
          <div class="content">
            <div class="tracking-box">
              <h2>Order #${order.orderNumber}</h2>
              <p><strong>Shipped Via:</strong> ${
                order.shipping?.carrier ||
                order.shiprocket?.courierName ||
                "Courier Partner"
              }</p>
              <p><strong>Tracking ID:</strong> ${
                order.shipping?.trackingId ||
                order.shiprocket?.awbCode ||
                "Will be updated soon"
              }</p>
              ${
                order.shipping?.estimatedDelivery
                  ? `
                <p><strong>Expected Delivery:</strong> ${new Date(
                  order.shipping.estimatedDelivery
                ).toLocaleDateString("en-IN", { dateStyle: "full" })}</p>
              `
                  : ""
              }
              
              <a href="${trackingUrl}" class="button">
                Track Your Package
              </a>
            </div>

            <p style="margin-top: 30px;">
              <strong>Delivery Address:</strong><br>
              ${order.shippingAddress.name}<br>
              ${order.shippingAddress.addressLine1}, ${
      order.shippingAddress.city
    }<br>
              ${order.shippingAddress.state} - ${order.shippingAddress.pincode}
            </p>

            <p style="margin-top: 20px; color: #666;">
              Please be available at the delivery address. You'll receive updates as your package moves.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: customer.email || order.shippingAddress.email,
      subject: `Order Shipped #${order.orderNumber} - Track Your Package`,
      html,
    });
  }

  /**
   * Order Delivered Email
   */
  async sendOrderDelivered(order, customer) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Order Delivered!</h1>
            <p>Hope you love your purchase, ${
              customer.name || "Valued Customer"
            }!</p>
          </div>
          <div class="content">
            <h2 style="text-align: center;">Order #${order.orderNumber}</h2>
            <p style="text-align: center; color: #666;">
              Delivered on ${new Date(
                order.shipping?.deliveredAt || Date.now()
              ).toLocaleDateString("en-IN", { dateStyle: "full" })}
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${
      order._id
    }/review" class="button">
                ⭐ Rate Your Purchase
              </a>
              <a href="${
                process.env.NEXT_PUBLIC_APP_URL
              }/orders" class="button">
                View Order Details
              </a>
            </div>

            <p style="margin-top: 30px; color: #666;">
              <strong>Not satisfied?</strong><br>
              You can return your order within 7 days. No questions asked!
            </p>

            <p style="text-align: center; margin-top: 30px;">
              Thank you for shopping with Online Planet! 🎉
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: customer.email || order.shippingAddress.email,
      subject: `Order Delivered #${order.orderNumber} - Rate Your Experience`,
      html,
    });
  }

  /**
   * Order Cancelled Email
   */
  async sendOrderCancelled(order, customer, reason) {
    const willRefund =
      order.payment.status === "paid" && order.payment.method !== "cod";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6c757d; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Cancelled</h1>
          </div>
          <div class="content">
            <p>Dear ${customer.name || "Customer"},</p>
            
            <p>Your order <strong>#${
              order.orderNumber
            }</strong> has been cancelled.</p>
            
            <p><strong>Reason:</strong> ${reason || "As per your request"}</p>
            
            ${
              willRefund
                ? `
              <div style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0;">
                <strong>Refund Information</strong><br>
                Amount: ₹${order.pricing.total.toFixed(2)}<br>
                Your refund will be processed within 5-7 business days to your original payment method.
              </div>
            `
                : ""
            }

            <p>We're sorry to see you go! If there's anything we can do better, please let us know.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: customer.email || order.shippingAddress.email,
      subject: `Order Cancelled #${order.orderNumber}`,
      html,
    });
  }

  /**
   * Seller New Order Email
   */
  async sendSellerNewOrder(order, seller) {
    if (!seller.email) return;

    const sellerItems = order.items.filter(
      (item) => item.seller.toString() === seller._id.toString()
    );

    const itemsHtml = sellerItems
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${
          item.name
        }</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${
          item.quantity
        }</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(
          item.price * item.quantity
        ).toFixed(2)}</td>
      </tr>
    `
      )
      .join("");

    const totalAmount = sellerItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .table { width: 100%; border-collapse: collapse; }
          .button { display: inline-block; padding: 12px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 New Order Received!</h1>
          </div>
          <div class="content">
            <p>Hi ${seller.businessInfo?.businessName || seller.name},</p>
            
            <h2>Order #${order.orderNumber}</h2>
            <p><strong>Order Date:</strong> ${new Date(
              order.createdAt
            ).toLocaleDateString("en-IN")}</p>
            <p><strong>Payment Method:</strong> ${order.payment.method.toUpperCase()}</p>
            
            <table class="table" style="background: white; margin: 20px 0;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 10px; text-align: left;">Product</th>
                  <th style="padding: 10px; text-align: center;">Qty</th>
                  <th style="padding: 10px; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr style="font-weight: bold; background: #f8f9fa;">
                  <td colspan="2" style="padding: 15px;">Total</td>
                  <td style="padding: 15px; text-align: right;">₹${totalAmount.toFixed(
                    2
                  )}</td>
                </tr>
              </tbody>
            </table>

            <h3>Shipping Address</h3>
            <p>
              ${order.shippingAddress.name}<br>
              ${order.shippingAddress.phone}<br>
              ${order.shippingAddress.addressLine1}, ${
      order.shippingAddress.city
    }<br>
              ${order.shippingAddress.state} - ${order.shippingAddress.pincode}
            </p>

            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/seller/orders/${
      order._id
    }" class="button">
                Process This Order
              </a>
            </center>

            <p style="margin-top: 30px; color: #999; font-size: 14px;">
              <strong>Action Required:</strong><br>
              Please process this order within 24 hours to maintain good seller ratings.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: seller.email,
      subject: `🎉 New Order #${order.orderNumber} - Action Required`,
      html,
    });
  }
  /**
   * Seller New Order Email (Alias for sendNewOrderNotificationToSeller)
   */
  async sendNewOrderNotificationToSeller(seller, order) {
    return await this.sendSellerNewOrder(order, seller);
  }

  /**
   * Admin New Order Notification
   */
  async notifyAdminNewOrder(order) {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@onlineplanet.com";

    const itemsHtml = order.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${
          item.name
        }</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${
          item.quantity
        }</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(
          item.price * item.quantity
        ).toFixed(2)}</td>
      </tr>
    `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .table { width: 100%; border-collapse: collapse; }
          .button { display: inline-block; padding: 12px 30px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 New Order Alert!</h1>
          </div>
          <div class="content">
            <h2>Order #${order.orderNumber}</h2>
            <p><strong>Order Date:</strong> ${new Date(
              order.createdAt
            ).toLocaleDateString("en-IN", { dateStyle: "full" })}</p>
            <p><strong>Customer:</strong> ${
              order.customer?.name || order.shippingAddress.name
            }</p>
            <p><strong>Email:</strong> ${
              order.customer?.email ||
              order.guestEmail ||
              order.shippingAddress.email
            }</p>
            <p><strong>Phone:</strong> ${order.shippingAddress.phone}</p>
            <p><strong>Payment Method:</strong> ${order.payment.method.toUpperCase()}</p>
            <p><strong>Payment Status:</strong> ${order.payment.status}</p>
            ${
              order.isGuestOrder
                ? '<p style="background: #fff3cd; padding: 10px; border-radius: 5px;"><strong>⚠️ Guest Order</strong> - Customer not registered</p>'
                : ""
            }
            
            <table class="table" style="background: white; margin: 20px 0;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 10px; text-align: left;">Product</th>
                  <th style="padding: 10px; text-align: center;">Qty</th>
                  <th style="padding: 10px; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr style="font-weight: bold; background: #f8f9fa;">
                  <td colspan="2" style="padding: 15px;">Total</td>
                  <td style="padding: 15px; text-align: right;">₹${order.pricing.total.toFixed(
                    2
                  )}</td>
                </tr>
              </tbody>
            </table>

            <h3>Shipping Address</h3>
            <p>
              ${order.shippingAddress.name}<br>
              ${order.shippingAddress.phone}<br>
              ${order.shippingAddress.addressLine1}<br>
              ${
                order.shippingAddress.addressLine2
                  ? `${order.shippingAddress.addressLine2}<br>`
                  : ""
              }
              ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${
      order.shippingAddress.pincode
    }<br>
              ${order.shippingAddress.country}
            </p>

            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders/${
      order._id
    }" class="button">
                View Order Details
              </a>
            </center>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: adminEmail,
      subject: `🔔 New Order #${
        order.orderNumber
      } - ${order.payment.method.toUpperCase()}`,
      html,
    });
  }
}

const emailService = new EmailService();
export default emailService;
