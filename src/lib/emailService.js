import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendEmail({ to, subject, html, attachments = [] }) {
    try {
      const mailOptions = {
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to,
        subject,
        html,
        attachments
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email send error:', error);
      throw error;
    }
  }

  // ========================================
  // CUSTOMER EMAILS
  // ========================================

  // 1. Email Verification
  async sendVerificationEmail(user, verificationToken) {
    const verificationUrl = `${process.env.NEXT_PUBLIC_URL}/verify-email?token=${verificationToken}`;
    
    const html = `
      ${this.getEmailHeader('Verify Your Email')}
      <div class="content">
        <h2>Welcome to Online Planet! 🎉</h2>
        <p>Hi ${user.name},</p>
        <p>Thank you for signing up! Please verify your email address to get started.</p>
        
        <div class="button-container">
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
        </div>
        
        <p class="small">Or copy and paste this link in your browser:</p>
        <p class="small" style="word-break: break-all;">${verificationUrl}</p>
        
        <div class="info-box">
          <p><strong>Note:</strong> This link will expire in 24 hours.</p>
        </div>
      </div>
      ${this.getEmailFooter()}
    `;

    return await this.sendEmail({
      to: user.email,
      subject: 'Verify Your Email - Online Planet',
      html
    });
  }

  // 2. Welcome Email (After Verification)
  async sendWelcomeEmail(user) {
    const html = `
      ${this.getEmailHeader('Welcome to Online Planet!')}
      <div class="content">
        <h2>Welcome Aboard! 🎊</h2>
        <p>Hi ${user.name},</p>
        <p>Your email has been verified successfully. Welcome to Online Planet!</p>
        
        <div class="info-box" style="background: #e3f2fd;">
          <h3>Get Started:</h3>
          <ul style="text-align: left; margin-left: 20px;">
            <li>Browse our amazing products</li>
            <li>Complete your profile</li>
            <li>Set up your delivery addresses</li>
            <li>Start shopping!</li>
          </ul>
        </div>
        
        <div class="button-container">
          <a href="${process.env.NEXT_PUBLIC_URL}/products" class="button">Start Shopping</a>
        </div>
      </div>
      ${this.getEmailFooter()}
    `;

    return await this.sendEmail({
      to: user.email,
      subject: 'Welcome to Online Planet!',
      html
    });
  }

  // 3. Password Reset
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${process.env.NEXT_PUBLIC_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      ${this.getEmailHeader('Reset Your Password')}
      <div class="content">
        <h2>Password Reset Request</h2>
        <p>Hi ${user.name},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        
        <div class="button-container">
          <a href="${resetUrl}" class="button">Reset Password</a>
        </div>
        
        <p class="small">Or copy and paste this link:</p>
        <p class="small" style="word-break: break-all;">${resetUrl}</p>
        
        <div class="warning-box">
          <p><strong>⚠️ Important:</strong></p>
          <ul style="text-align: left; margin-left: 20px;">
            <li>This link expires in 1 hour</li>
            <li>If you didn't request this, please ignore this email</li>
            <li>Your password won't change until you create a new one</li>
          </ul>
        </div>
      </div>
      ${this.getEmailFooter()}
    `;

    return await this.sendEmail({
      to: user.email,
      subject: 'Reset Your Password - Online Planet',
      html
    });
  }

  // 4. Order Confirmation
  async sendOrderConfirmation(order) {
    const html = `
      ${this.getEmailHeader('Order Confirmed!')}
      <div class="content">
        <h2>Thank You for Your Order! 🎉</h2>
        <p>Hi ${order.shippingAddress.name},</p>
        <p>Your order has been confirmed and is being processed.</p>
        
        <div class="order-summary">
          <h3>Order Summary</h3>
          <table style="width: 100%;">
            <tr>
              <td><strong>Order Number:</strong></td>
              <td>#${order.orderNumber}</td>
            </tr>
            <tr>
              <td><strong>Order Date:</strong></td>
              <td>${new Date(order.createdAt).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td><strong>Total Amount:</strong></td>
              <td><strong>₹${order.pricing.total.toLocaleString()}</strong></td>
            </tr>
            <tr>
              <td><strong>Payment Method:</strong></td>
              <td>${order.payment.method.toUpperCase()}</td>
            </tr>
          </table>
        </div>
        
        <h3>Items Ordered:</h3>
        <div class="items-table">
          ${order.items.map(item => `
            <div class="item-row">
              <div class="item-info">
                <strong>${item.name}</strong><br>
                <small>Quantity: ${item.quantity}</small>
              </div>
              <div class="item-price">₹${(item.price * item.quantity).toLocaleString()}</div>
            </div>
          `).join('')}
        </div>
        
        <div class="button-container">
          <a href="${process.env.NEXT_PUBLIC_URL}/orders/${order.orderNumber}" class="button">Track Order</a>
        </div>
      </div>
      ${this.getEmailFooter()}
    `;

    return await this.sendEmail({
      to: order.shippingAddress.email,
      subject: `Order Confirmation - #${order.orderNumber}`,
      html
    });
  }

  // 5. Order Status Update
  async sendOrderStatusUpdate(order, newStatus, message) {
    const statusEmojis = {
      confirmed: '✅',
      processing: '⚙️',
      ready_for_pickup: '📦',
      pickup: '🚚',
      shipped: '🚀',
      delivered: '🎉',
      cancelled: '❌',
      returned: '↩️'
    };

    const html = `
      ${this.getEmailHeader('Order Status Update')}
      <div class="content">
        <h2>Order Status Updated ${statusEmojis[newStatus] || '📋'}</h2>
        <p>Hi ${order.shippingAddress.name},</p>
        <p>${message || `Your order status has been updated to: <strong>${newStatus.replace(/_/g, ' ').toUpperCase()}</strong>`}</p>
        
        <div class="order-summary">
          <table style="width: 100%;">
            <tr>
              <td><strong>Order Number:</strong></td>
              <td>#${order.orderNumber}</td>
            </tr>
            <tr>
              <td><strong>Current Status:</strong></td>
              <td><strong>${newStatus.replace(/_/g, ' ').toUpperCase()}</strong></td>
            </tr>
            ${order.shiprocket?.awbCode ? `
              <tr>
                <td><strong>Tracking Number:</strong></td>
                <td>${order.shiprocket.awbCode}</td>
              </tr>
            ` : ''}
          </table>
        </div>
        
        <div class="button-container">
          <a href="${process.env.NEXT_PUBLIC_URL}/orders/${order.orderNumber}" class="button">View Order Details</a>
        </div>
      </div>
      ${this.getEmailFooter()}
    `;

    return await this.sendEmail({
      to: order.shippingAddress.email,
      subject: `Order Update - #${order.orderNumber}`,
      html
    });
  }

  // 6. Order Shipped
  async sendOrderShipped(order) {
    const html = `
      ${this.getEmailHeader('Order Shipped!')}
      <div class="content">
        <h2>Your Order is On The Way! 🚀</h2>
        <p>Hi ${order.shippingAddress.name},</p>
        <p>Great news! Your order has been shipped and is on its way to you.</p>
        
        <div class="order-summary" style="background: #e8f5e9;">
          <h3>Shipping Details</h3>
          <table style="width: 100%;">
            <tr>
              <td><strong>Order Number:</strong></td>
              <td>#${order.orderNumber}</td>
            </tr>
            <tr>
              <td><strong>Courier:</strong></td>
              <td>${order.shiprocket?.courierName || 'N/A'}</td>
            </tr>
            <tr>
              <td><strong>Tracking Number:</strong></td>
              <td><strong>${order.shiprocket?.awbCode || 'N/A'}</strong></td>
            </tr>
            <tr>
              <td><strong>Expected Delivery:</strong></td>
              <td>3-5 business days</td>
            </tr>
          </table>
        </div>
        
        <div class="button-container">
          <a href="https://shiprocket.co/tracking/${order.shiprocket?.awbCode}" class="button">Track Shipment</a>
        </div>
      </div>
      ${this.getEmailFooter()}
    `;

    return await this.sendEmail({
      to: order.shippingAddress.email,
      subject: `Order Shipped - #${order.orderNumber}`,
      html
    });
  }

  // 7. Order Delivered with Invoice
  async sendOrderDelivered(order, invoiceHTML) {
    const html = `
      ${this.getEmailHeader('Order Delivered!')}
      <div class="content">
        <h2>Order Delivered Successfully! 🎉</h2>
        <p>Hi ${order.shippingAddress.name},</p>
        <p>Your order has been delivered. We hope you love your purchase!</p>
        
        <div class="order-summary" style="background: #e8f5e9;">
          <h3>Delivery Confirmation</h3>
          <table style="width: 100%;">
            <tr>
              <td><strong>Order Number:</strong></td>
              <td>#${order.orderNumber}</td>
            </tr>
            <tr>
              <td><strong>Delivered On:</strong></td>
              <td>${new Date(order.shipping.deliveredAt).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td><strong>Total Amount:</strong></td>
              <td><strong>₹${order.pricing.total.toLocaleString()}</strong></td>
            </tr>
          </table>
        </div>
        
        <div class="info-box" style="background: #fff3e0;">
          <p><strong>📄 Invoice Attached</strong></p>
          <p>Your invoice is included in this email. You can also download it from your order details page.</p>
        </div>
        
        <div class="button-container">
          <a href="${process.env.NEXT_PUBLIC_URL}/orders/${order.orderNumber}" class="button">View Order Details</a>
        </div>
        
        <div class="info-box" style="background: #e3f2fd;">
          <p><strong>💬 Share Your Feedback</strong></p>
          <p>We'd love to hear about your experience! Please take a moment to rate your purchase.</p>
        </div>
      </div>
      ${this.getEmailFooter()}
    `;

    return await this.sendEmail({
      to: order.shippingAddress.email,
      subject: `Order Delivered - #${order.orderNumber}`,
      html
    });
  }

  // ========================================
  // SELLER EMAILS
  // ========================================

  // 8. Seller Registration Confirmation
  async sendSellerRegistrationConfirmation(seller) {
    const html = `
      ${this.getEmailHeader('Seller Registration Received')}
      <div class="content">
        <h2>Thank You for Registering! 🎊</h2>
        <p>Hi ${seller.businessName},</p>
        <p>We've received your seller registration application. Our team will review your application and get back to you within 24-48 hours.</p>
        
        <div class="info-box">
          <h3>What's Next?</h3>
          <ul style="text-align: left; margin-left: 20px;">
            <li>Our team will verify your documents</li>
            <li>You'll receive an approval email once verified</li>
            <li>After approval, you can start listing products</li>
            <li>We'll help you set up your seller dashboard</li>
          </ul>
        </div>
        
        <div class="order-summary">
          <h3>Application Details</h3>
          <table style="width: 100%;">
            <tr>
              <td><strong>Business Name:</strong></td>
              <td>${seller.businessName}</td>
            </tr>
            <tr>
              <td><strong>Email:</strong></td>
              <td>${seller.email}</td>
            </tr>
            <tr>
              <td><strong>Phone:</strong></td>
              <td>${seller.phone}</td>
            </tr>
            <tr>
              <td><strong>Application Date:</strong></td>
              <td>${new Date().toLocaleDateString()}</td>
            </tr>
          </table>
        </div>
        
        <div class="info-box" style="background: #fff3e0;">
          <p><strong>📝 Need Help?</strong></p>
          <p>If you have any questions, feel free to contact our seller support team at seller-support@onlineplanet.ae</p>
        </div>
      </div>
      ${this.getEmailFooter()}
    `;

    return await this.sendEmail({
      to: seller.email,
      subject: 'Seller Registration Received - Online Planet',
      html
    });
  }

  // 9. Seller Approval
  async sendSellerApproval(seller) {
    const loginUrl = `${process.env.NEXT_PUBLIC_URL}/seller/login`;
    
    const html = `
      ${this.getEmailHeader('Congratulations! You\'re Approved!')}
      <div class="content">
        <h2>🎉 Welcome to Online Planet Seller Network!</h2>
        <p>Hi ${seller.businessName},</p>
        <p>Congratulations! Your seller account has been approved. You can now start selling on Online Planet.</p>
        
        <div class="info-box" style="background: #e8f5e9;">
          <h3>✅ Your Account is Active</h3>
          <p>You now have full access to the seller dashboard where you can:</p>
          <ul style="text-align: left; margin-left: 20px;">
            <li>Add and manage products</li>
            <li>Track orders and sales</li>
            <li>Manage inventory</li>
            <li>View analytics and reports</li>
            <li>Handle customer queries</li>
          </ul>
        </div>
        
        <div class="button-container">
          <a href="${loginUrl}" class="button">Access Seller Dashboard</a>
        </div>
        
        <div class="order-summary">
          <h3>Seller Information</h3>
          <table style="width: 100%;">
            <tr>
              <td><strong>Business Name:</strong></td>
              <td>${seller.businessName}</td>
            </tr>
            <tr>
              <td><strong>Store Name:</strong></td>
              <td>${seller.storeInfo?.storeName || 'Not set'}</td>
            </tr>
            <tr>
              <td><strong>Email:</strong></td>
              <td>${seller.email}</td>
            </tr>
            <tr>
              <td><strong>Approval Date:</strong></td>
              <td>${new Date().toLocaleDateString()}</td>
            </tr>
          </table>
        </div>
        
        <div class="info-box" style="background: #e3f2fd;">
          <h3>📚 Getting Started Resources</h3>
          <p>Check out our seller guide to make the most of your store:</p>
          <ul style="text-align: left; margin-left: 20px;">
            <li>Product listing best practices</li>
            <li>Order fulfillment guidelines</li>
            <li>Pricing and commission structure</li>
            <li>Marketing tools and promotions</li>
          </ul>
        </div>
      </div>
      ${this.getEmailFooter()}
    `;

    return await this.sendEmail({
      to: seller.email,
      subject: 'Congratulations! Your Seller Account is Approved - Online Planet',
      html
    });
  }

  // 10. Seller Rejection
  async sendSellerRejection(seller, reason) {
    const html = `
      ${this.getEmailHeader('Seller Application Update')}
      <div class="content">
        <h2>Application Status Update</h2>
        <p>Hi ${seller.businessName},</p>
        <p>Thank you for your interest in selling on Online Planet. After careful review, we are unable to approve your seller account at this time.</p>
        
        <div class="warning-box">
          <h3>Reason for Rejection:</h3>
          <p>${reason}</p>
        </div>
        
        <div class="info-box">
          <h3>What You Can Do:</h3>
          <ul style="text-align: left; margin-left: 20px;">
            <li>Review the rejection reason above</li>
            <li>Address the issues mentioned</li>
            <li>Reapply after 30 days</li>
            <li>Contact our support team for clarification</li>
          </ul>
        </div>
        
        <p>If you have any questions or need assistance, please contact us at seller-support@onlineplanet.ae</p>
      </div>
      ${this.getEmailFooter()}
    `;

    return await this.sendEmail({
      to: seller.email,
      subject: 'Seller Application Status - Online Planet',
      html
    });
  }

  // 11. New Order Notification to Seller
  async sendNewOrderNotificationToSeller(seller, order) {
    const html = `
      ${this.getEmailHeader('New Order Received!')}
      <div class="content">
        <h2>🎉 You Have a New Order!</h2>
        <p>Hi ${seller.storeInfo?.storeName || seller.businessName},</p>
        <p>You have received a new order. Please prepare the items for shipment.</p>
        
        <div class="order-summary" style="background: #e8f5e9;">
          <h3>Order Details</h3>
          <table style="width: 100%;">
            <tr>
              <td><strong>Order Number:</strong></td>
              <td>#${order.orderNumber}</td>
            </tr>
            <tr>
              <td><strong>Order Date:</strong></td>
              <td>${new Date(order.createdAt).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td><strong>Total Amount:</strong></td>
              <td><strong>₹${order.pricing.total.toLocaleString()}</strong></td>
            </tr>
            <tr>
              <td><strong>Payment Method:</strong></td>
              <td>${order.payment.method.toUpperCase()}</td>
            </tr>
          </table>
        </div>
        
        <h3>Items to Prepare:</h3>
        <div class="items-table">
          ${order.items.map(item => `
            <div class="item-row">
              <div class="item-info">
                <strong>${item.name}</strong><br>
                <small>SKU: ${item.sku || 'N/A'} | Quantity: ${item.quantity}</small>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="info-box" style="background: #fff3e0;">
          <p><strong>⚠️ Action Required:</strong></p>
          <ul style="text-align: left; margin-left: 20px;">
            <li>Verify inventory availability</li>
            <li>Prepare items for shipment</li>
            <li>Mark order as ready for pickup within 24 hours</li>
          </ul>
        </div>
        
        <div class="button-container">
          <a href="${process.env.NEXT_PUBLIC_URL}/seller/orders/${order._id}" class="button">View Order Details</a>
        </div>
      </div>
      ${this.getEmailFooter()}
    `;

    return await this.sendEmail({
      to: seller.email,
      subject: `New Order Received - #${order.orderNumber}`,
      html
    });
  }

  // 12. Low Stock Alert to Seller
  async sendLowStockAlert(seller, product) {
    const html = `
      ${this.getEmailHeader('Low Stock Alert')}
      <div class="content">
        <h2>⚠️ Low Stock Alert</h2>
        <p>Hi ${seller.storeInfo?.storeName || seller.businessName},</p>
        <p>One of your products is running low on stock. Please restock soon to avoid losing sales.</p>
        
        <div class="warning-box">
          <h3>Product Details</h3>
          <table style="width: 100%;">
            <tr>
              <td><strong>Product Name:</strong></td>
              <td>${product.name}</td>
            </tr>
            <tr>
              <td><strong>SKU:</strong></td>
              <td>${product.sku || 'N/A'}</td>
            </tr>
            <tr>
              <td><strong>Current Stock:</strong></td>
              <td><strong style="color: #f44336;">${product.inventory?.stock || 0} units</strong></td>
            </tr>
            <tr>
              <td><strong>Low Stock Threshold:</strong></td>
              <td>${product.inventory?.lowStockThreshold || 10} units</td>
            </tr>
          </table>
        </div>
        
        <div class="info-box">
          <p><strong>💡 Recommended Actions:</strong></p>
          <ul style="text-align: left; margin-left: 20px;">
            <li>Update inventory immediately</li>
            <li>Contact your supplier</li>
            <li>Consider disabling the product if out of stock</li>
            <li>Set up automatic reorder points</li>
          </ul>
        </div>
        
        <div class="button-container">
          <a href="${process.env.NEXT_PUBLIC_URL}/seller/products/${product._id}/edit" class="button">Update Stock</a>
        </div>
      </div>
      ${this.getEmailFooter()}
    `;

    return await this.sendEmail({
      to: seller.email,
      subject: `Low Stock Alert - ${product.name}`,
      html
    });
  }

  // 13. Out of Stock Alert
  async sendOutOfStockAlert(seller, product) {
    const html = `
      ${this.getEmailHeader('Out of Stock Alert')}
      <div class="content">
        <h2>❌ Product Out of Stock</h2>
        <p>Hi ${seller.storeInfo?.storeName || seller.businessName},</p>
        <p>One of your products is now out of stock. The product has been automatically disabled from the storefront.</p>
        
        <div class="warning-box" style="background: #ffebee;">
          <h3>Product Details</h3>
          <table style="width: 100%;">
            <tr>
              <td><strong>Product Name:</strong></td>
              <td>${product.name}</td>
            </tr>
            <tr>
              <td><strong>SKU:</strong></td>
              <td>${product.sku || 'N/A'}</td>
            </tr>
            <tr>
              <td><strong>Current Stock:</strong></td>
              <td><strong style="color: #f44336;">0 units</strong></td>
            </tr>
            <tr>
              <td><strong>Status:</strong></td>
              <td><strong style="color: #f44336;">Disabled</strong></td>
            </tr>
          </table>
        </div>
        
        <div class="info-box">
          <p><strong>⚡ Action Required:</strong></p>
          <ul style="text-align: left; margin-left: 20px;">
            <li>Restock the product immediately</li>
            <li>Update inventory in seller dashboard</li>
            <li>Product will be automatically re-enabled after stock update</li>
          </ul>
        </div>
        
        <div class="button-container">
          <a href="${process.env.NEXT_PUBLIC_URL}/seller/products/${product._id}/edit" class="button">Restock Now</a>
        </div>
      </div>
      ${this.getEmailFooter()}
    `;

    return await this.sendEmail({
      to: seller.email,
      subject: `Out of Stock Alert - ${product.name}`,
      html
    });
  }

  // 14. Product Approved
  async sendProductApproved(seller, product) {
    const html = `
      ${this.getEmailHeader('Product Approved!')}
      <div class="content">
        <h2>✅ Your Product is Live!</h2>
        <p>Hi ${seller.storeInfo?.storeName || seller.businessName},</p>
        <p>Great news! Your product has been approved and is now live on Online Planet.</p>
        
        <div class="info-box" style="background: #e8f5e9;">
          <h3>Product Details</h3>
          <table style="width: 100%;">
            <tr>
              <td><strong>Product Name:</strong></td>
              <td>${product.name}</td>
            </tr>
            <tr>
              <td><strong>SKU:</strong></td>
              <td>${product.sku || 'N/A'}</td>
            </tr>
            <tr>
              <td><strong>Price:</strong></td>
              <td>₹${product.pricing?.salePrice || product.pricing?.basePrice}</td>
            </tr>
            <tr>
              <td><strong>Approval Date:</strong></td>
              <td>${new Date().toLocaleDateString()}</td>
            </tr>
          </table>
        </div>
        
        <div class="button-container">
          <a href="${process.env.NEXT_PUBLIC_URL}/products/${product._id}" class="button">View Product</a>
        </div>
        
        <div class="info-box" style="background: #e3f2fd;">
          <p><strong>📈 Tips to Boost Sales:</strong></p>
          <ul style="text-align: left; margin-left: 20px;">
            <li>Add high-quality product images</li>
            <li>Write detailed descriptions</li>
            <li>Set competitive prices</li>
            <li>Offer promotions and discounts</li>
          </ul>
        </div>
      </div>
      ${this.getEmailFooter()}
    `;

    return await this.sendEmail({
      to: seller.email,
      subject: `Product Approved - ${product.name}`,
      html
    });
  }

  // 15. Product Rejected
  async sendProductRejected(seller, product, reason) {
    const html = `
      ${this.getEmailHeader('Product Review Update')}
      <div class="content">
        <h2>Product Needs Revision</h2>
        <p>Hi ${seller.storeInfo?.storeName || seller.businessName},</p>
        <p>Your product submission requires some changes before it can be approved.</p>
        
        <div class="order-summary">
          <h3>Product Details</h3>
          <table style="width: 100%;">
            <tr>
              <td><strong>Product Name:</strong></td>
              <td>${product.name}</td>
            </tr>
            <tr>
              <td><strong>SKU:</strong></td>
              <td>${product.sku || 'N/A'}</td>
            </tr>
          </table>
        </div>
        
        <div class="warning-box">
          <h3>Reason for Rejection:</h3>
          <p>${reason}</p>
        </div>
        
        <div class="info-box">
          <p><strong>📝 Next Steps:</strong></p>
          <ul style="text-align: left; margin-left: 20px;">
            <li>Review the feedback above</li>
            <li>Make necessary changes to your product</li>
            <li>Resubmit for approval</li>
          </ul>
        </div>
        
        <div class="button-container">
          <a href="${process.env.NEXT_PUBLIC_URL}/seller/products/${product._id}/edit" class="button">Edit Product</a>
        </div>
      </div>
      ${this.getEmailFooter()}
    `;

    return await this.sendEmail({
      to: seller.email,
      subject: `Product Review Required - ${product.name}`,
      html
    });
  }

  // ========================================
  // ADMIN NOTIFICATIONS
  // ========================================

  // 16. New Seller Registration (Admin)
  async notifyAdminNewSellerRegistration(seller) {
    const html = `
      ${this.getEmailHeader('New Seller Registration')}
      <div class="content">
        <h2>📝 New Seller Application</h2>
        <p>A new seller has registered and is awaiting approval.</p>
        
        <div class="order-summary">
          <h3>Seller Details</h3>
          <table style="width: 100%;">
            <tr>
              <td><strong>Business Name:</strong></td>
              <td>${seller.businessName}</td>
            </tr>
            <tr>
              <td><strong>Email:</strong></td>
              <td>${seller.email}</td>
            </tr>
            <tr>
              <td><strong>Phone:</strong></td>
              <td>${seller.phone}</td>
            </tr>
            <tr>
              <td><strong>Registration Date:</strong></td>
              <td>${new Date().toLocaleDateString()}</td>
            </tr>
          </table>
        </div>
        
        <div class="button-container">
          <a href="${process.env.NEXT_PUBLIC_URL}/admin/sellers/${seller._id}" class="button">Review Application</a>
        </div>
      </div>
      ${this.getEmailFooter()}
    `;

    return await this.sendEmail({
      to: process.env.ADMIN_EMAIL || process.env.SMTP_FROM_EMAIL,
      subject: 'New Seller Registration - Action Required',
      html
    });
  }

  // 17. New Order (Admin)
  async notifyAdminNewOrder(order) {
    const html = `
      ${this.getEmailHeader('New Order Placed')}
      <div class="content">
        <h2>🛒 New Order Received</h2>
        <p>A new order has been placed on Online Planet.</p>
        
        <div class="order-summary">
          <h3>Order Details</h3>
          <table style="width: 100%;">
            <tr>
              <td><strong>Order Number:</strong></td>
              <td>#${order.orderNumber}</td>
            </tr>
            <tr>
              <td><strong>Customer:</strong></td>
              <td>${order.shippingAddress.name}</td>
            </tr>
            <tr>
              <td><strong>Total Amount:</strong></td>
              <td>₹${order.pricing.total.toLocaleString()}</td>
            </tr>
            <tr>
              <td><strong>Payment Method:</strong></td>
              <td>${order.payment.method.toUpperCase()}</td>
            </tr>
            <tr>
              <td><strong>Items:</strong></td>
              <td>${order.items.length}</td>
            </tr>
          </table>
        </div>
        
        <div class="button-container">
          <a href="${process.env.NEXT_PUBLIC_URL}/admin/orders/${order._id}" class="button">View Order</a>
        </div>
      </div>
      ${this.getEmailFooter()}
    `;

    return await this.sendEmail({
      to: process.env.ADMIN_EMAIL || process.env.SMTP_FROM_EMAIL,
      subject: `New Order - #${order.orderNumber}`,
      html
    });
  }

  // ========================================
  // EMAIL TEMPLATES
  // ========================================

  getEmailHeader(title) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
          }
          .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .logo {
            max-width: 180px;
            margin-bottom: 20px;
            background: white;
            padding: 15px;
            border-radius: 10px;
          }
          .header h1 {
            font-size: 28px;
            margin: 0;
            font-weight: 600;
          }
          .content {
            padding: 40px 30px;
            background: #ffffff;
          }
          .content h2 {
            color: #667eea;
            margin-bottom: 20px;
            font-size: 24px;
          }
          .content h3 {
            color: #333;
            margin: 20px 0 10px 0;
            font-size: 18px;
          }
          .content p {
            margin-bottom: 15px;
            color: #555;
            font-size: 15px;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .button {
            display: inline-block;
            padding: 15px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s;
          }
          .button:hover {
            transform: translateY(-2px);
          }
          .info-box {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .warning-box {
            background: #fff3e0;
            border-left: 4px solid #ff9800;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .order-summary {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .order-summary table {
            width: 100%;
            border-collapse: collapse;
          }
          .order-summary table tr {
            border-bottom: 1px solid #e0e0e0;
          }
          .order-summary table tr:last-child {
            border-bottom: none;
          }
          .order-summary table td {
            padding: 12px 0;
            font-size: 14px;
          }
          .order-summary table td:first-child {
            color: #666;
          }
          .order-summary table td:last-child {
            text-align: right;
            font-weight: 500;
          }
          .items-table {
            margin: 20px 0;
          }
          .item-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: #f8f9fa;
            margin-bottom: 10px;
            border-radius: 8px;
          }
          .item-info {
            flex: 1;
          }
          .item-price {
            font-weight: bold;
            font-size: 16px;
            color: #667eea;
          }
          .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 3px solid #667eea;
          }
          .footer p {
            color: #666;
            font-size: 13px;
            margin: 5px 0;
          }
          .small {
            font-size: 13px;
            color: #666;
          }
          ul {
            margin: 10px 0;
          }
          li {
            margin: 8px 0;
            color: #555;
          }
          @media only screen and (max-width: 600px) {
            .content { padding: 20px; }
            .header { padding: 30px 20px; }
            .header h1 { font-size: 24px; }
            .button { padding: 12px 30px; font-size: 14px; }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <img src="https://res.cloudinary.com/dnhak76jd/image/upload/v1760463244/WhatsApp_Image_2025-10-14_at_23.03.45_xuucfw.jpg" alt="Online Planet" class="logo">
            <h1>${title}</h1>
          </div>
    `;
  }

  getEmailFooter() {
    return `
          <div class="footer">
            <p><strong>Online Planet</strong></p>
            <p>Your trusted online marketplace</p>
            <p style="margin-top: 15px;">
              📧 info@onlineplanet.ae<br>
              🌐 www.onlineplanet.ae
            </p>
            <p style="margin-top: 15px; font-size: 12px;">
              © ${new Date().getFullYear()} Online Planet. All rights reserved.
            </p>
            <p style="font-size: 11px; color: #999;">
              You're receiving this email because you have an account with Online Planet.<br>
              If you have any questions, please contact us at info@onlineplanet.ae
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export default new EmailService();
