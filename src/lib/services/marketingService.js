// lib/services/marketingService.js
import msg91Service from './msg91';
import emailService from './emailService';

class MarketingService {
  
  /**
   * Send abandoned cart reminder
   */
  async sendAbandonedCartEmail(user, cart, hoursAfter = 1) {
    const subject = hoursAfter === 1 
      ? '🛒 You left something in your cart!'
      : hoursAfter === 24
      ? '⏰ Your cart is waiting - Complete your purchase!'
      : '🎁 Last chance! Your cart items are waiting';

    const items Html = cart.items.map(item => `
      <div style="border: 1px solid #eee; padding: 15px; margin: 10px 0; border-radius: 8px;">
        <div style="display: flex; gap: 15px;">
          <img src="${item.image || '/placeholder.png'}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;">
          <div>
            <h3 style="margin: 0 0 5px 0;">${item.name}</h3>
            <p style="margin: 0; color: #666;">Quantity: ${item.quantity}</p>
            <p style="margin: 5px 0 0 0; font-weight: bold; color: #667eea;">₹${item.price}</p>
          </div>
        </div>
      </div>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Don't forget your items!</h1>
          </div>
          <div class="content">
            <p>Hi ${user.name},</p>
            <p>You left these items in your cart. Complete your purchase now!</p>
            
            ${itemsHtml}
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <div style="display: flex; justify-between; font-size: 18px; font-weight: bold;">
                <span>Total:</span>
                <span style="color: #667eea;">₹${cart.total}</span>
              </div>
            </div>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/cart" class="button">
                Complete Your Purchase
              </a>
            </center>
            
            ${hoursAfter === 72 ? `
              <p style="margin-top: 20px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                <strong>⚠️ Last Chance!</strong><br>
                Your cart will expire soon. Don't miss out on these items!
              </p>
            ` : ''}
          </div>
        </div>
      </body>
      </html>
    `;

    return await emailService.sendEmail({
      to: user.email,
      subject,
      html
    });
  }

  /**
   * Send abandoned cart SMS
   */
  async sendAbandonedCartSMS(user, cart) {
    const message = `Hi ${user.name}! You have ${cart.items.length} item(s) worth ₹${cart.total} in your cart. Complete your purchase: ${process.env.NEXT_PUBLIC_APP_URL}/cart`;
    
    return await msg91Service.sendSMS(user.phone, message);
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(user) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .feature { padding: 15px; margin: 10px 0; background: white; border-radius: 8px; }
          .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Online Planet!</h1>
            <p>We're thrilled to have you here</p>
          </div>
          <div class="content">
            <p>Hi ${user.name},</p>
            <p>Thank you for joining Online Planet! Get ready for an amazing shopping experience.</p>
            
            <h3>What you get with us:</h3>
            
            <div class="feature">
              <strong>✨ Exclusive Deals</strong>
              <p style="margin: 5px 0 0 0; color: #666;">Access to flash sales and member-only discounts</p>
            </div>
            
            <div class="feature">
              <strong>🚚 Fast Delivery</strong>
              <p style="margin: 5px 0 0 0; color: #666;">Quick and reliable shipping across India</p>
            </div>
            
            <div class="feature">
              <strong>🎁 Loyalty Rewards</strong>
              <p style="margin: 5px 0 0 0; color: #666;">Earn points on every purchase and redeem for discounts</p>
            </div>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/products" class="button">
                Start Shopping
              </a>
            </center>
            
            <p style="margin-top: 30px; padding: 15px; background: #e7f3ff; border-left: 4px solid #2196F3; border-radius: 4px;">
              <strong>🎁 Special Welcome Offer!</strong><br>
              Use code <strong style="font-size: 18px; color: #667eea;">WELCOME10</strong> for 10% off your first order!
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await emailService.sendEmail({
      to: user.email,
      subject: '🎉 Welcome to Online Planet - Get 10% OFF!',
      html
    });
  }

  /**
   * Send review request email
   */
  async sendReviewRequestEmail(user, order) {
    const itemsHtml = order.items.map(item => `
      <div style="text-align: center; padding: 15px; border: 1px solid #eee; border-radius: 8px; margin: 10px;">
        <img src="${item.images?.[0] || '/placeholder.png'}" alt="${item.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">
        <h4 style="margin: 10px 0;">${item.name}</h4>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order._id}/review?product=${item.productId}" style="display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          Rate This Product
        </a>
      </div>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⭐ How was your experience?</h1>
          </div>
          <div class="content">
            <p>Hi ${user.name},</p>
            <p>We hope you're enjoying your recent purchase! We'd love to hear your feedback.</p>
            
            <h3 style="text-align: center;">Rate your products:</h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0;">
              ${itemsHtml}
            </div>
            
            <p style="margin-top: 30px; text-align: center; color: #666;">
              Your feedback helps other shoppers make informed decisions!
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await emailService.sendEmail({
      to: user.email,
      subject: '⭐ Rate Your Recent Purchase - Help Others Shop Better!',
      html
    });
  }

  /**
   * Send win-back campaign
   */
  async sendWinBackEmail(user, lastOrder Date) {
    const daysSince = Math.floor((new Date() - new Date(lastOrderDate)) / (1000 * 60 * 60 * 24));

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>We Miss You! 💔</h1>
          </div>
          <div class="content">
            <p>Hi ${user.name},</p>
            <p>It's been ${daysSince} days since we last saw you, and we're eager to have you back!</p>
            
            <p style="margin: 30px 0; padding: 20px; background: white; border-radius: 8px; text-align: center;">
              <strong style="font-size: 20px; color: #f5576c;">🎁 SPECIAL OFFER JUST FOR YOU!</strong><br>
              <span style="font-size: 32px; color: #667eea; font-weight: bold;">20% OFF</span><br>
              <span style="font-size: 14px; color: #666;">on your next purchase</span><br>
              <strong style="font-size: 18px; margin-top: 15px; display: inline-block; padding: 10px 20px; background: #fff3cd; border-radius: 5px;">Code: COMEBACK20</strong>
            </p>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/products" class="button">
                Start Shopping Now
              </a>
            </center>
            
            <p style="margin-top: 20px; text-align: center; color: #666; font-size: 14px;">
              Offer valid for 7 days only!
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await emailService.sendEmail({
      to: user.email,
      subject: `We Miss You! Get 20% OFF Your Next Order 🎁`,
      html
    });
  }

  /**
   * Send promotional SMS campaign
   */
  async sendPromotionalSMS(phones, message) {
    // Send bulk SMS via MSG91
    for (const phone of phones) {
      try {
        await msg91Service.sendSMS(phone, message);
      } catch (error) {
        console.error(`Failed to send SMS to ${phone}:`, error);
      }
    }
  }
}

const marketingService = new MarketingService();
export default marketingService;
