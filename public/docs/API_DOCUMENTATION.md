# 📚 Inventory Management API Documentation

## Overview

Complete API documentation for integrating with Online Planet's advanced inventory management system. This includes inventory alerts, predictive analytics, auto-restock, and supplier management.

---

## 🔐 Authentication

All API requests require JWT authentication.

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

**Get Your Token:**

```javascript
POST /api/auth/login
{
  "email": "seller@example.com",
  "password": "your_password"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

---

## 📦 Inventory Alerts API

### 1. Get All Inventory Alerts

```http
GET /api/seller/inventory-alerts
```

**Query Parameters:**

- `status` (optional): `active`, `acknowledged`, `resolved`, `dismissed`
- `priority` (optional): `low`, `medium`, `high`, `critical`
- `alertType` (optional): `low_stock`, `out_of_stock`, `restock_needed`, `overstock`

**Response:**

```json
{
  "success": true,
  "alerts": [
    {
      "_id": "alert123",
      "sellerId": "seller456",
      "productId": {
        "_id": "prod789",
        "name": "Product Name",
        "sku": "SKU-001",
        "images": ["url"],
        "inventory": {
          "stock": 5,
          "lowStockThreshold": 10
        }
      },
      "alertType": "low_stock",
      "currentStock": 5,
      "threshold": 10,
      "recommendedRestock": 15,
      "status": "active",
      "priority": "high",
      "notificationSent": true,
      "createdAt": "2025-12-19T08:00:00.000Z"
    }
  ],
  "stats": {
    "total": 10,
    "active": 5,
    "critical": 2,
    "high": 3,
    "byType": {
      "out_of_stock": 2,
      "low_stock": 3,
      "restock_needed": 5,
      "overstock": 0
    }
  }
}
```

---

### 2. Check All Inventory

Scans all products and creates alerts for low stock items. **Sends email notifications automatically.**

```http
POST /api/seller/inventory-alerts
Content-Type: application/json

{
  "action": "check_all"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Checked 150 products",
  "alertsCreated": 12,
  "alerts": [ ... ]
}
```

**Email Sent:** Yes, for each new alert created

---

### 3. Check Single Product Inventory

```http
POST /api/seller/inventory-alerts
Content-Type: application/json

{
  "action": "check_inventory",
  "productId": "prod789"
}
```

---

### 4. Check Warehouse-Specific Inventory

```http
POST /api/seller/inventory-alerts
Content-Type: application/json

{
  "action": "check_warehouse",
  "data": {
    "warehouseId": "warehouse123"
  }
}
```

---

### 5. Calculate Predictive Analytics

Get AI-powered predictions based on sales velocity. **Sends email if stock-out predicted within 7 days.**

```http
POST /api/seller/inventory-alerts
Content-Type: application/json

{
  "action": "calculate_prediction",
  "productId": "prod789"
}
```

**Response:**

```json
{
  "success": true,
  "prediction": {
    "salesVelocity": 2.5,
    "predictedStockOutDays": 4,
    "confidence": 85,
    "currentStock": 10,
    "recommendedQuantity": 75
  }
}
```

**Calculation Logic:**

- Analyzes last 30 days of sales
- Sales Velocity = Total Units Sold / 30 days
- Predicted Stock Out = Current Stock / Sales Velocity
- Confidence = Based on order count (more orders = higher confidence)
- Recommended Quantity = Sales Velocity × 30 (30 days worth)

**Email Sent:** Yes, if `predictedStockOutDays <= 7`

---

### 6. Trigger Auto-Restock

Automatically orders from preferred supplier. **Sends confirmation email to seller and order email to supplier.**

```http
POST /api/seller/inventory-alerts
Content-Type: application/json

{
  "action": "trigger_auto_restock",
  "alertId": "alert123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Auto-restock triggered",
  "result": {
    "success": true,
    "supplier": {
      "_id": "supplier456",
      "name": "ABC Suppliers",
      "email": "orders@abcsuppliers.com"
    },
    "quantity": 20
  }
}
```

**Email Sent:**

- To Supplier: Restock order details
- To Seller: Confirmation email

---

### 7. Acknowledge Alert

```http
POST /api/seller/inventory-alerts
Content-Type: application/json

{
  "action": "acknowledge",
  "alertId": "alert123"
}
```

---

### 8. Resolve Alert

```http
POST /api/seller/inventory-alerts
Content-Type: application/json

{
  "action": "resolve",
  "alertId": "alert123",
  "actionTaken": "Restocked 20 units"
}
```

---

### 9. Dismiss Alert

```http
POST /api/seller/inventory-alerts
Content-Type: application/json

{
  "action": "dismiss",
  "alertId": "alert123"
}
```

---

## 🏭 Suppliers API

### 1. Get All Suppliers

```http
GET /api/seller/suppliers
```

**Response:**

```json
{
  "success": true,
  "suppliers": [
    {
      "_id": "supplier123",
      "sellerId": "seller456",
      "name": "ABC Suppliers",
      "companyName": "ABC Supply Co.",
      "email": "orders@abcsuppliers.com",
      "phone": "+1234567890",
      "address": {
        "street": "123 Main St",
        "city": "Dubai",
        "state": "Dubai",
        "country": "UAE",
        "zipCode": "12345"
      },
      "products": [
        {
          "productId": "prod789",
          "sku": "SKU-001",
          "supplierSKU": "SUP-SKU-001",
          "unitPrice": 100,
          "minOrderQuantity": 50,
          "leadTimeDays": 7,
          "isPreferred": true
        }
      ],
      "autoRestock": {
        "enabled": true,
        "method": "email",
        "apiEndpoint": "",
        "apiKey": ""
      },
      "paymentTerms": "net_30",
      "metrics": {
        "totalOrders": 25,
        "onTimeDeliveryRate": 95,
        "averageLeadTime": 7,
        "rating": 4.5
      },
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 2. Create Supplier

```http
POST /api/seller/suppliers
Content-Type: application/json

{
  "name": "ABC Suppliers",
  "companyName": "ABC Supply Co.",
  "email": "orders@abcsuppliers.com",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "Dubai",
    "country": "UAE"
  },
  "autoRestock": {
    "enabled": true,
    "method": "email"
  },
  "paymentTerms": "net_30"
}
```

**Auto-Restock Methods:**

- `email`: Sends email to supplier
- `api`: Calls supplier's API endpoint
- `manual`: Creates notification only

---

### 3. Update Supplier

```http
PUT /api/seller/suppliers/{supplierId}
Content-Type: application/json

{
  "name": "Updated Supplier Name",
  "autoRestock": {
    "enabled": true,
    "method": "api",
    "apiEndpoint": "https://supplier.com/api/orders",
    "apiKey": "your_api_key"
  }
}
```

---

### 4. Delete Supplier

```http
DELETE /api/seller/suppliers/{supplierId}
```

---

## 🔌 Third-Party Integration Guide

### For Inventory Management Systems

If you're building an inventory management system that wants to integrate with Online Planet:

#### 1. Webhook Integration

**Setup:**

```javascript
// Your system receives inventory updates
POST https://your-system.com/webhooks/inventory
{
  "event": "inventory.low_stock",
  "productId": "prod789",
  "currentStock": 5,
  "threshold": 10,
  "timestamp": "2025-12-19T08:00:00.000Z"
}
```

**Implementation:**

```javascript
// In your system
app.post("/webhooks/inventory", async (req, res) => {
  const { event, productId, currentStock } = req.body;

  if (event === "inventory.low_stock") {
    // Trigger your restock logic
    await triggerRestock(productId, currentStock);
  }

  res.json({ success: true });
});
```

---

#### 2. API Integration (Pull Model)

**Periodically check inventory:**

```javascript
// Every hour, check inventory
setInterval(async () => {
  const response = await fetch(
    "https://onlineplanet.ae/api/seller/inventory-alerts",
    {
      headers: {
        Authorization: `Bearer ${YOUR_TOKEN}`,
      },
    }
  );

  const { alerts } = await response.json();

  // Process alerts in your system
  for (const alert of alerts) {
    if (alert.priority === "critical") {
      await handleCriticalAlert(alert);
    }
  }
}, 3600000); // Every hour
```

---

#### 3. Supplier API Integration

**If you're a supplier, implement this API:**

```javascript
// Your API endpoint
POST https://your-supplier-api.com/api/orders
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "sellerEmail": "seller@example.com",
  "products": [
    {
      "sku": "SKU-001",
      "quantity": 20,
      "urgency": "high"
    }
  ]
}

// Your response
{
  "success": true,
  "orderId": "ORDER-123",
  "estimatedDelivery": "2025-12-26",
  "totalCost": 2000
}
```

**Register your API with Online Planet:**

```javascript
PUT /api/seller/suppliers/{supplierId}
{
  "autoRestock": {
    "enabled": true,
    "method": "api",
    "apiEndpoint": "https://your-supplier-api.com/api/orders",
    "apiKey": "your_api_key_here"
  }
}
```

---

## 📧 Email Notifications

### Automatic Email Triggers

| Event                       | Recipient | Template               |
| --------------------------- | --------- | ---------------------- |
| Low Stock Alert Created     | Seller    | Inventory Alert Email  |
| Out of Stock Alert          | Seller    | Critical Alert Email   |
| Predictive Alert (< 7 days) | Seller    | Predictive Alert Email |
| Auto-Restock Triggered      | Seller    | Confirmation Email     |
| Auto-Restock Order          | Supplier  | Order Email            |

### Email Configuration

**SMTP Settings (Already Configured):**

```env
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@onlineplanet.ae
SMTP_FROM_NAME=Online Planet
```

---

## 🎯 Use Cases

### Use Case 1: Automated Inventory Monitoring

```javascript
// Daily cron job
const checkInventory = async () => {
  const response = await fetch("/api/seller/inventory-alerts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "check_all",
    }),
  });

  const { alertsCreated } = await response.json();
  console.log(`${alertsCreated} alerts created and emails sent`);
};

// Run daily at 9 AM
cron.schedule("0 9 * * *", checkInventory);
```

---

### Use Case 2: Predictive Restock

```javascript
// Check predictions for top products
const topProducts = await getTopProducts();

for (const product of topProducts) {
  const response = await fetch("/api/seller/inventory-alerts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "calculate_prediction",
      productId: product._id,
    }),
  });

  const { prediction } = await response.json();

  if (prediction.predictedStockOutDays < 7) {
    console.log(
      `⚠️ ${product.name} will run out in ${prediction.predictedStockOutDays} days`
    );
    // Auto-restock logic here
  }
}
```

---

### Use Case 3: Auto-Restock Workflow

```javascript
// 1. Get critical alerts
const alerts = await getAlerts({ priority: "critical" });

// 2. Trigger auto-restock for each
for (const alert of alerts) {
  const response = await fetch("/api/seller/inventory-alerts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "trigger_auto_restock",
      alertId: alert._id,
    }),
  });

  const { result } = await response.json();

  if (result.success) {
    console.log(
      `✅ Ordered ${result.quantity} units from ${result.supplier.name}`
    );
  }
}
```

---

## 🔒 Security Best Practices

1. **API Keys:** Store securely in environment variables
2. **HTTPS Only:** All API calls must use HTTPS
3. **Rate Limiting:** Max 100 requests per minute
4. **Token Expiry:** JWT tokens expire after 24 hours
5. **Webhook Verification:** Verify webhook signatures

---

## 📊 Response Codes

| Code | Meaning      |
| ---- | ------------ |
| 200  | Success      |
| 201  | Created      |
| 400  | Bad Request  |
| 401  | Unauthorized |
| 403  | Forbidden    |
| 404  | Not Found    |
| 500  | Server Error |

---

## 🆘 Support

**Email:** developers@onlineplanet.ae
**Documentation:** https://docs.onlineplanet.ae
**API Status:** https://status.onlineplanet.ae

---

## 📝 Changelog

### v1.0.0 (2025-12-19)

- Initial release
- Inventory alerts API
- Predictive analytics
- Auto-restock integration
- Supplier management
- Email notifications

---

**Built with ❤️ by Online Planet**
