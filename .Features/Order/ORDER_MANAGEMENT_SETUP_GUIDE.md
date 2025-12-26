# 🚀 Order Management System - Setup Guide

## MSG91 WhatsApp & SMS Integration Setup

This guide will help you set up MSG91 for WhatsApp and SMS notifications in your order management workflow.

---

## 📋 Prerequisites

1. MSG91 Account (Sign up at https://msg91.com/)
2. Email account with SMTP access (Gmail recommended)
3. MongoDB database
4. Node.js 18+ installed

---

## 🔧 Step 1: MSG91 Setup

### 1.1 Create MSG91 Account

1. Go to https://msg91.com/signup
2. Sign up with your email
3. Verify your email and phone number

### 1.2 Get API Credentials

1. Login to MSG91 Dashboard
2. Go to **APIs** → **Developer APIs**
3. Copy your **Auth Key**

### 1.3 Get Sender ID (for SMS)

1. In MSG91 Dashboard, go to **SMS** → **Sender ID**
2. Add a new sender ID (e.g., "ONLPLT" or "ONLINP")
3. Wait for approval (usually 24-48 hours)
4. Once approved, use this sender ID in your `.env.local`

### 1.4 Setup WhatsApp Business API

1. In MSG91 Dashboard, go to **WhatsApp** → **Get Started**
2. Follow the verification process to connect your WhatsApp Business account
3. Get your **Integrated Number** (sender number)
4. Note: This requires WhatsApp Business verification

### 1.5 Create WhatsApp Message Templates

WhatsApp requires pre-approved templates. Create these templates in MSG91:

**Template 1: Order Confirmation**

- **Name:** `order_confirmation_template`
- **Category:** Transactional
- **Language:** English
- **Content:**

```
🎉 Order Confirmed!

Hi {{1}},
Your order {{2}} of {{3}} has been placed successfully on {{4}}.

Track your order: [Link]

Thank you for choosing Online Planet! 🛍️
```

- **Variables:** customer_name, order_number, order_total, order_date

**Template 2: Order Shipped**

- **Name:** `order_shipped_template`
- **Category:** Transactional
- **Content:**

```
📦 Your Order is On Its Way!

Hi {{1}},
Order {{2}} shipped via {{4}}.
Tracking ID: {{3}}

Track: [Link]
```

- **Variables:** customer_name, order_number, tracking_id, courier_name

**Repeat for all templates:**

- `order_processing_template`
- `order_packed_template`
- `order_out_for_delivery_template`
- `order_delivered_template`
- `order_cancelled_template`
- `return_requested_template`
- `return_approved_template`
- `refund_processed_template`

**Important:** Wait for WhatsApp to approve each template (usually 24 hours).

---

## 📧 Step 2: Email Configuration

### Use Gmail (Recommended for Development)

1. **Enable 2-Step Verification:**

   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Create App Password:**

   - Go to https://myaccount.google.com/apppasswords
   - Select App: **Mail**
   - Select Device: **Other** (enter "Online Planet")
   - Copy the 16-character password

3. **Add to .env.local:**

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
```

### Use Other Email Providers

**SendGrid:**

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
```

**Mailgun:**

```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your_mailgun_username
EMAIL_PASSWORD=your_mailgun_password
```

---

## ⚙️ Step 3: Environment Variables Setup

1. **Copy environment template:**

```bash
# In your project root
cp .env.example .env.local
```

2. **Edit `.env.local` and add:**

```env
# MSG91 Configuration
MSG91_AUTH_KEY=your_actual_auth_key_from_msg91
MSG91_SENDER_ID=ONLPLT

# MSG91 WhatsApp Template IDs (use actual approved template names)
MSG91_TEMPLATE_ORDER_CONFIRMATION=order_confirmation_template
MSG91_TEMPLATE_ORDER_PROCESSING=order_processing_template
MSG91_TEMPLATE_ORDER_PACKED=order_packed_template
MSG91_TEMPLATE_ORDER_SHIPPED=order_shipped_template
MSG91_TEMPLATE_ORDER_OUT_FOR_DELIVERY=order_out_for_delivery_template
MSG91_TEMPLATE_ORDER_DELIVERED=order_delivered_template
MSG91_TEMPLATE_ORDER_CANCELLED=order_cancelled_template
MSG91_TEMPLATE_RETURN_REQUESTED=return_requested_template
MSG91_TEMPLATE_RETURN_APPROVED=return_approved_template
MSG91_TEMPLATE_REFUND_PROCESSED=refund_processed_template

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@onlineplanet.com
EMAIL_FROM_NAME=Online Planet

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🧪 Step 4: Testing

### Test MSG91 Connection

Create a test file `test-msg91.js`:

```javascript
import msg91Service from "./src/lib/services/msg91.js";

async function test() {
  // Test SMS
  const smsResult = await msg91Service.sendSMS(
    "9876543210",
    "Test message from Online Planet!"
  );
  console.log("SMS Result:", smsResult);

  // Test WhatsApp (requires approved template)
  const waResult = await msg91Service.sendWhatsAppMessage(
    "9876543210",
    "order_confirmation_template",
    {
      customer_name: "John Doe",
      order_number: "OP123456",
      order_total: "₹1999",
      order_date: "23-Dec-2024",
    }
  );
  console.log("WhatsApp Result:", waResult);
}

test();
```

Run:

```bash
node test-msg91.js
```

### Test Email Service

```javascript
import emailService from "./src/lib/services/emailService.js";

async function testEmail() {
  const result = await emailService.sendEmail({
    to: "your-email@gmail.com",
    subject: "Test Email - Online Planet",
    html: "<h1>It works!</h1><p>Email service is configured correctly.</p>",
  });
  console.log("Email Result:", result);
}

testEmail();
```

---

## 🎯 Step 5: Order Workflow Testing

### 1. Create Test Order

```bash
# Use Postman or curl
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": "...", "quantity": 1}],
    "shippingAddress": {
      "name": "Test User",
      "phone": "9876543210",
      "addressLine1": "123 Test St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    },
    "paymentMethod": "cod"
  }'
```

**Expected Notifications:**

- ✅ Customer receives WhatsApp
- ✅ Customer receives SMS
- ✅ Customer receives Email
- ✅ Seller receives SMS
- ✅ Seller receives Email

### 2. Update Order Status

```bash
curl -X PUT http://localhost:3000/api/orders/ORDER_ID/status \
  -H "Authorization: Bearer YOUR_SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "processing"
  }'
```

### 3. Ship Order

```bash
curl -X PUT http://localhost:3000/api/orders/ORDER_ID/status \
  -H "Authorization: Bearer YOUR_SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shipped",
    "trackingId": "TRACK123",
    "carrier": "Delhivery"
  }'
```

### 4. Test Cancellation

```bash
curl -X POST http://localhost:3000/api/orders/ORDER_ID/cancel \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Changed my mind"
  }'
```

### 5. Test Return Request

```bash
curl -X POST http://localhost:3000/api/orders/ORDER_ID/return \
  -H "Authorization: Bearer YOUR_CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Damaged product",
    "title": "Product was damaged",
    "description": "The product arrived with scratches"
  }'
```

---

## 📱 MSG91 Dashboard Monitoring

1. **Check SMS Delivery:**

   - Go to MSG91 Dashboard → **SMS** → **Reports**
   - View delivery status, failures, and logs

2. **Check WhatsApp Delivery:**

   - Go to MSG91 Dashboard → **WhatsApp** → **Reports**
   - Monitor message status and delivery rates

3. **Credit Balance:**
   - Keep an eye on your MSG91 credits
   - Set up auto-recharge to avoid service interruption

---

## 💰 MSG91 Pricing (India - Approximate)

- **SMS:** ₹0.15 - ₹0.25 per SMS
- **WhatsApp:** ₹0.35 - ₹0.50 per message
- **Recommendation:** Start with ₹1000 credits for testing

---

## 🔒 Security Best Practices

1. **Never commit `.env.local` to git**

   - Already in `.gitignore`

2. **Use environment-specific keys:**

   - Test keys for development
   - Production keys for live environment

3. **Rotate keys regularly:**

   - Change MSG91 auth key every 3-6 months
   - Update email passwords periodically

4. **Monitor usage:**
   - Set up alerts for unusual activity
   - Track notification costs

---

## 🐛 Troubleshooting

### MSG91 WhatsApp Not Sending

**Problem:** WhatsApp messages not delivered
**Solutions:**

1. Verify template is approved in MSG91 dashboard
2. Check phone number format: `91XXXXXXXXXX` (with country code)
3. Ensure template parameter count matches
4. Check MSG91 credits balance
5. Review MSG91 logs for error messages

### SMS Not Delivered

**Problem:** SMS not reaching customers
**Solutions:**

1. Verify sender ID is approved
2. Check phone number is valid Indian mobile (10 digits)
3. Ensure DND (Do Not Disturb) settings allow transactional SMS
4. Check MSG91 SMS reports for delivery status

### Email Not Sending

**Problem:** Emails not being sent
**Solutions:**

1. Verify Gmail App Password is correct (16 characters, no spaces)
2. Check 2-Step Verification is enabled
3. Try with a different email provider
4. Check spam folder
5. Review console logs for SMTP errors

### Notifications Failing but Order Created

**Problem:** Order creates successfully but no notifications
**Solution:** This is by design! Notifications are non-blocking, so order creation won't fail even if notifications fail. Check:

1. Console logs for notification errors
2. Network connectivity
3. API credentials validity

---

## 📊 Monitoring Order Workflow

### Check Order Timeline

```javascript
// In your frontend or admin panel
const order = await fetch("/api/orders/ORDER_ID");
console.log(order.timeline);

// Expected output:
// [
//   { status: 'pending', description: 'Order placed', timestamp: '...' },
//   { status: 'processing', description: 'Processing started', timestamp: '...' },
//   { status: 'shipped', description: 'Order shipped', timestamp: '...' },
//   ...
// ]
```

### Order Status Flow

```
pending → confirmed → processing → packed →
shipped → out_for_delivery → delivered

OR

pending → cancelled (with automatic refund if paid)

OR

delivered → return_requested → returned → refunded
```

---

## 🎓 Additional Resources

1. **MSG91 Documentation:** https://docs.msg91.com/
2. **WhatsApp Business API:** https://docs.msg91.com/docs/whatsapp
3. **Nodemailer Guide:** https://nodemailer.com/
4. **Next.js API Routes:** https://nextjs.org/docs/api-routes/introduction

---

## ✅ Checklist Before Going Live

- [ ] MSG91 Auth Key configured
- [ ] Sender ID approved by MSG91
- [ ] WhatsApp Business verified
- [ ] All WhatsApp templates approved
- [ ] Email SMTP working
- [ ] Test order created and notifications received
- [ ] Test all status transitions
- [ ] Test cancellation workflow
- [ ] Test return workflow
- [ ] Monitor logs for errors
- [ ] Add sufficient credits to MSG91 account
- [ ] Set up production environment variables
- [ ] Enable error monitoring (Sentry/LogRocket)

---

## 🚀 You're All Set!

Your comprehensive order management system with MSG91 WhatsApp & SMS integration is ready!

**What you can do now:**

- ✅ Create orders with automatic notifications
- ✅ Track order status changes
- ✅ Handle cancellations with automatic refunds
- ✅ Process returns with approval workflow
- ✅ Generate invoices and packing slips
- ✅ Send real-time updates via WhatsApp, SMS & Email

---

**Need Help?**

- MSG91 Support: support@msg91.com
- Check console logs for detailed error messages
- Review API documentation in `README.md`

**Happy Selling! 🎉**
