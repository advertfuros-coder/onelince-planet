# 🔧 Subscription Upgrade Not Reflecting - Fix Guide

## ❌ Problem Identified

**Issue**: Payment successful but plan not updated

- Database shows: `starter` tier
- Should show: `professional` tier
- Payment completed but webhook didn't update subscription

---

## 🔍 Root Causes

### 1. **Webhook Not Configured**

The Razorpay webhook URL is not set up in Razorpay dashboard.

**Solution**: Configure webhook in Razorpay

### 2. **Webhook Failed Silently**

Webhook fired but encountered an error.

**Solution**: Check webhook logs

### 3. **Page Not Refreshing**

Frontend cached old data.

**Solution**: Force refresh after payment

---

## ✅ Immediate Fix

### Step 1: Manual Database Update

Run this script to manually upgrade the subscription:

\`\`\`javascript
// scripts/manualUpgrade.js
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function manualUpgrade() {
await mongoose.connect(process.env.MONGODB_URI);

const SellerSubscription = mongoose.model('SellerSubscription');
const SubscriptionPlan = mongoose.model('SubscriptionPlan');

// Get the professional plan features
const proPlan = await SubscriptionPlan.findOne({ name: 'professional' });

// Update the subscription
const subscription = await SellerSubscription.findOne({
sellerId: '694ff6d0cc843fd3ab3a79b3' // Your seller ID
});

if (subscription) {
subscription.tier = 'professional';
subscription.status = 'active';
subscription.features = proPlan.features;
subscription.billing.amount = proPlan.pricing.monthly;
subscription.billing.lastBillingDate = new Date();

    // Add to history
    subscription.history.push({
      tier: 'starter',
      startDate: subscription.createdAt,
      endDate: new Date(),
      amount: 999,
      status: 'completed'
    });

    await subscription.save();
    console.log('✅ Upgraded to Professional!');

}

process.exit(0);
}

manualUpgrade();
\`\`\`

### Step 2: Configure Razorpay Webhook

1. Go to Razorpay Dashboard
2. Navigate to Settings → Webhooks
3. Click "Add New Webhook"
4. Enter URL: \`https://yourdomain.com/api/webhooks/razorpay\`
5. Select events:
   - payment.captured
   - payment.failed
6. Copy the webhook secret
7. Update \`.env.local\`:
   \`\`\`
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
   \`\`\`

---

## 🔧 Long-term Fix

### Update Subscription Page to Force Refresh

\`\`\`javascript
// In handleUpgrade function, after payment success:
handler: async function (response) {
toast.success('Payment successful! Activating...')

// Wait for webhook to process (2-3 seconds)
await new Promise(resolve => setTimeout(resolve, 3000))

// Force reload to get updated data
window.location.reload()
}
\`\`\`

### Add Polling for Status Update

\`\`\`javascript
async function waitForActivation(orderId) {
const maxAttempts = 10
let attempts = 0

while (attempts < maxAttempts) {
const res = await axios.get('/api/seller/subscription', {
headers: { Authorization: \`Bearer \${token}\` }
})

    if (res.data.subscription?.tier === 'professional') {
      return true // Activated!
    }

    await new Promise(resolve => setTimeout(resolve, 1000))
    attempts++

}

return false // Timeout
}
\`\`\`

---

## 🧪 Testing Webhook Locally

Use ngrok to test webhooks locally:

\`\`\`bash

# Install ngrok

npm install -g ngrok

# Start your dev server

npm run dev

# In another terminal, start ngrok

ngrok http 3000

# Copy the ngrok URL (e.g., https://abc123.ngrok.io)

# Add to Razorpay webhook: https://abc123.ngrok.io/api/webhooks/razorpay

\`\`\`

---

## 📊 Check Webhook Status

Add logging to webhook handler:

\`\`\`javascript
// In /api/webhooks/razorpay/route.js
export async function POST(request) {
console.log('🔔 Webhook received at:', new Date().toISOString())

const signature = request.headers.get('x-razorpay-signature')
const body = await request.text()

console.log('📝 Webhook body:', body)
console.log('🔐 Signature:', signature)

// ... rest of code
}
\`\`\`

---

## 🎯 Quick Fix for You

Since you've already paid, I'll create a script to manually update your subscription:

\`\`\`bash
node scripts/manualUpgrade.js
\`\`\`

This will:

1. ✅ Update your tier to "professional"
2. ✅ Update features to professional limits
3. ✅ Update billing amount
4. ✅ Add history entry
5. ✅ Refresh the page to see changes

---

## 🔍 Verify the Fix

After running the script:

1. Refresh the subscription page
2. Should see "Professional" as current plan
3. Check features:
   - 5,000 products
   - 5 warehouses
   - API access enabled

---

## 📝 Prevention for Future

1. **Always configure webhook** before going live
2. **Test webhook** with test payments
3. **Add retry logic** in frontend
4. **Monitor webhook logs** in production
5. **Add fallback** manual verification

---

**Let me create the manual upgrade script for you now!**
