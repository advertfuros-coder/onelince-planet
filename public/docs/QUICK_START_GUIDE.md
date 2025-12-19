# 🚀 Quick Start Guide - Inventory Management Features

## Overview

This guide will help you quickly set up and use all the advanced inventory management features.

---

## ✅ Setup Checklist

### 1. Environment Variables

Ensure these are in your `.env.local`:

```env
# SMTP Email (Already configured)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@onlineplanet.ae
SMTP_PASS=Abid@1122##
SMTP_FROM_NAME=Online Planet
SMTP_FROM_EMAIL=info@onlineplanet.ae

# App URL
NEXT_PUBLIC_APP_URL=https://onlineplanet.ae
```

### 2. Database Models

All models are created and ready:

- ✅ InventoryAlert
- ✅ Supplier
- ✅ Product (updated with reorderPoint)

### 3. API Endpoints

All endpoints are live:

- ✅ `/api/seller/inventory-alerts`
- ✅ `/api/seller/suppliers`
- ✅ `/api/seller/suppliers/[id]`

### 4. UI Pages

All pages are created:

- ✅ `/seller/inventory-alerts`
- ✅ `/seller/suppliers`

---

## 📋 Step-by-Step Usage

### Step 1: Add a Supplier

1. Go to **Suppliers** page
2. Click **"Add Supplier"**
3. Fill in details:
   ```
   Name: ABC Suppliers
   Email: supplier@example.com
   Phone: +971-xxx-xxxx
   City: Dubai
   Country: UAE
   ```
4. Enable **Auto-Restock**:
   - Method: Email (or API if supplier has API)
   - Payment Terms: Net 30
5. Click **"Add Supplier"**

**Result:** Supplier is now ready for auto-restock

---

### Step 2: Link Products to Supplier

Currently, products are linked when you create a supplier. In the future, you can add products to existing suppliers via the UI.

**Manual linking (via database):**

```javascript
// Update supplier with products
await Supplier.findByIdAndUpdate(supplierId, {
  $push: {
    products: {
      productId: "your_product_id",
      sku: "SKU-001",
      supplierSKU: "SUP-SKU-001",
      unitPrice: 100,
      minOrderQuantity: 50,
      leadTimeDays: 7,
      isPreferred: true,
    },
  },
});
```

---

### Step 3: Check Inventory & Get Alerts

1. Go to **Inventory Alerts** page
2. Click **"Check All Inventory"**
3. System will:
   - Scan all products
   - Create alerts for low stock
   - **Send email notifications automatically**

**What gets checked:**

- Out of Stock (stock = 0)
- Low Stock (stock ≤ lowStockThreshold)
- Restock Needed (stock ≤ reorderPoint)

---

### Step 4: View & Manage Alerts

**Alert Card shows:**

- Product name, SKU, image
- Alert type & priority
- Current stock vs threshold
- Recommended restock quantity
- Visual progress bar

**Actions available:**

1. **Acknowledge** - Mark as seen
2. **Dismiss** - Ignore alert
3. **Auto-Restock from Supplier** - Trigger automatic order
4. **Mark as Restocked** - Manually mark as resolved

---

### Step 5: Use Auto-Restock

1. Find an alert with low stock
2. Click **"Auto-Restock from Supplier"**
3. System will:
   - Find preferred supplier for that product
   - Send order email to supplier
   - Send confirmation email to you
   - Mark alert as "auto-restock triggered"

**Email to Supplier contains:**

- Product name & SKU
- Quantity needed
- Urgency level
- Your contact info

---

### Step 6: Get Predictive Analytics

**Automatic (via API):**

```javascript
// Calculate prediction for a product
const response = await axios.post(
  "/api/seller/inventory-alerts",
  {
    action: "calculate_prediction",
    productId: "your_product_id",
  },
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);

const { prediction } = response.data;
console.log(`Stock will run out in ${prediction.predictedStockOutDays} days`);
```

**What you get:**

- Sales velocity (units/day)
- Predicted stock-out date
- Confidence level (%)
- Recommended restock quantity

**Email Alert:** Sent automatically if stock-out predicted within 7 days

---

### Step 7: Warehouse-Specific Alerts

```javascript
// Check specific warehouse
const response = await axios.post(
  "/api/seller/inventory-alerts",
  {
    action: "check_warehouse",
    data: { warehouseId: "warehouse_id" },
  },
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);
```

**Use Case:**

- You have warehouses in Dubai, Abu Dhabi, Sharjah
- Check each warehouse separately
- Get location-specific alerts

---

## 🎯 Common Workflows

### Workflow 1: Daily Inventory Check

**Setup a daily cron job:**

```javascript
// Run every day at 9 AM
cron.schedule("0 9 * * *", async () => {
  await axios.post(
    "/api/seller/inventory-alerts",
    {
      action: "check_all",
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  console.log("✅ Daily inventory check complete");
});
```

**Result:**

- Automatic daily checks
- Email alerts for new issues
- No manual intervention needed

---

### Workflow 2: Predictive Restock

**For your top 10 products:**

```javascript
const topProducts = await getTopSellingProducts(10);

for (const product of topProducts) {
  const { prediction } = await calculatePrediction(product._id);

  if (prediction.predictedStockOutDays < 14) {
    // Proactively restock before running out
    await triggerAutoRestock(product._id);
  }
}
```

**Benefit:** Never run out of best-sellers

---

### Workflow 3: Multi-Warehouse Management

```javascript
const warehouses = await getWarehouses();

for (const warehouse of warehouses) {
  const alerts = await checkWarehouse(warehouse._id);

  if (alerts.length > 0) {
    console.log(`${warehouse.name}: ${alerts.length} alerts`);
    // Transfer stock or restock
  }
}
```

---

## 📧 Email Examples

### 1. Inventory Alert Email

**Subject:** 🚨 Inventory Alert: LOW STOCK - Product Name

**Content:**

- Product details
- Current stock: 5
- Threshold: 10
- Recommended restock: 15 units
- "View Alert Dashboard" button

---

### 2. Auto-Restock Confirmation

**Subject:** ✅ Auto-Restock Order Created - Product Name

**Content:**

- Order confirmed
- Quantity: 20 units
- Supplier: ABC Suppliers
- Order date

---

### 3. Predictive Alert

**Subject:** 📊 Predictive Alert: Product Name - Stock Out Predicted

**Content:**

- Current stock: 10 units
- Predicted stock out: 4 days
- Confidence: 85%
- Recommended action: Order 75 units now

---

## 🔧 Troubleshooting

### Issue: Emails not sending

**Check:**

1. SMTP credentials in `.env.local`
2. Email service logs: `console.log` in emailService.js
3. Firewall blocking port 465

**Fix:**

```javascript
// Test email connection
import { sendEmail } from "@/lib/utils/emailService";

await sendEmail({
  to: "test@example.com",
  subject: "Test Email",
  html: "<h1>Test</h1>",
});
```

---

### Issue: Auto-restock not working

**Check:**

1. Supplier has `autoRestock.enabled = true`
2. Product is linked to supplier
3. Supplier is marked as `isPreferred = true`

**Fix:**

```javascript
// Verify supplier setup
const supplier = await Supplier.findById(supplierId);
console.log("Auto-restock enabled:", supplier.autoRestock.enabled);
console.log("Products:", supplier.products.length);
```

---

### Issue: Predictions not accurate

**Reason:** Not enough sales data

**Solution:**

- Predictions require at least 30 days of sales history
- More orders = higher confidence
- Confidence < 50% = not enough data

---

## 📊 Best Practices

### 1. Set Appropriate Thresholds

```javascript
// For fast-moving products
product.inventory.lowStockThreshold = 50;
product.inventory.reorderPoint = 100;

// For slow-moving products
product.inventory.lowStockThreshold = 5;
product.inventory.reorderPoint = 10;
```

---

### 2. Use Multiple Suppliers

```javascript
// Primary supplier
{
  name: "Primary Supplier",
  products: [{ productId: "xxx", isPreferred: true }]
}

// Backup supplier
{
  name: "Backup Supplier",
  products: [{ productId: "xxx", isPreferred: false }]
}
```

---

### 3. Monitor Supplier Performance

```javascript
// Track metrics
supplier.metrics = {
  totalOrders: 25,
  onTimeDeliveryRate: 95, // %
  averageLeadTime: 7, // days
  rating: 4.5, // 1-5 stars
};
```

---

### 4. Regular Inventory Audits

**Weekly:**

- Check all alerts
- Review predictions
- Verify stock levels

**Monthly:**

- Analyze supplier performance
- Adjust thresholds
- Review auto-restock effectiveness

---

## 🎓 Advanced Features

### Custom Webhooks

**Receive alerts in your system:**

```javascript
// Your webhook endpoint
app.post("/webhooks/inventory", (req, res) => {
  const { alert } = req.body;

  // Your custom logic
  if (alert.priority === "critical") {
    sendSlackNotification(alert);
  }

  res.json({ success: true });
});
```

---

### API Integration

**Supplier with API:**

```javascript
// Supplier setup
{
  autoRestock: {
    enabled: true,
    method: "api",
    apiEndpoint: "https://supplier.com/api/orders",
    apiKey: "your_api_key"
  }
}

// Auto-restock will POST to supplier's API
POST https://supplier.com/api/orders
Authorization: Bearer your_api_key
{
  "sku": "SKU-001",
  "quantity": 20,
  "urgency": "high"
}
```

---

## 📈 Success Metrics

**Track these KPIs:**

- Stock-out rate (should decrease)
- Email open rate (alerts)
- Auto-restock success rate
- Prediction accuracy
- Supplier on-time delivery

**Goal:**

- 0% stock-outs on top products
- 90%+ prediction accuracy
- 95%+ supplier on-time delivery

---

## 🆘 Need Help?

**Documentation:** `/public/docs/API_DOCUMENTATION.md`
**Email:** support@onlineplanet.ae
**Phone:** +971-xxx-xxxx

---

**🎉 You're all set! Start managing inventory like a pro!**
