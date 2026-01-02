# Shopify Integration - Security Research & Architecture

## 🔍 Market Research Analysis

### How Major Platforms Handle Store Credentials

#### 1. **Shopify Custom Apps (Current Best Practice)**

- **Method**: OAuth 2.0 with per-store access tokens
- **Security**: Tokens are store-specific, can be revoked anytime
- **User Experience**: One-time authorization flow
- **Storage**: Encrypted tokens in database
- **Revocation**: Instant from Shopify admin panel

#### 2. **WooCommerce Integrations (Zapier, Printful)**

- **Method**: API Keys (Consumer Key + Consumer Secret)
- **Security**: Store-specific keys with limited scopes
- **User Experience**: Generate keys in WooCommerce settings
- **Storage**: Encrypted in integration platform
- **Rotation**: Manual regeneration recommended every 90 days

#### 3. **Amazon Seller Central**

- **Method**: MWS/SP-API credentials
- **Security**: Role-based access with specific permissions
- **User Experience**: Developer credentials + authorization
- **Storage**: Encrypted with AWS KMS
- **Monitoring**: Activity logs and anomaly detection

#### 4. **eBay Developer Program**

- **Method**: OAuth 2.0 with refresh tokens
- **Security**: Short-lived access tokens (2 hours)
- **User Experience**: OAuth consent screen
- **Storage**: Refresh tokens encrypted, access tokens in memory
- **Rotation**: Automatic token refresh

## 🏆 Best-in-Class Security Architecture

### Recommended Approach: **Shopify Admin API Access Tokens**

Instead of using OAuth (which requires a public Shopify app), we'll use **Custom App Access Tokens** that sellers generate themselves.

### How It Works:

```
┌─────────────────────────────────────────────────────────────┐
│                    SELLER WORKFLOW                          │
└─────────────────────────────────────────────────────────────┘

1. Seller goes to their Shopify Admin
   └─▶ Settings → Apps and sales channels → Develop apps

2. Creates a Custom App (one-time)
   └─▶ Names it "Online Planet Integration"
   └─▶ Configures API scopes (read_products, read_inventory, etc.)

3. Generates Admin API Access Token
   └─▶ Shopify shows token ONCE (copy to clipboard)

4. Pastes token in our platform
   └─▶ We validate it immediately
   └─▶ Store encrypted in database
   └─▶ Never show again (only last 4 chars)

5. Token is store-specific and revocable
   └─▶ Seller can revoke from Shopify admin anytime
   └─▶ We detect revocation and notify seller
```

## 🔐 Security Implementation

### 1. **Multi-Layer Encryption**

```javascript
// Layer 1: Application-level encryption (AES-256-GCM)
const crypto = require("crypto");

function encryptToken(token, sellerId) {
  const algorithm = "aes-256-gcm";
  const key = crypto.scryptSync(
    process.env.ENCRYPTION_KEY,
    sellerId, // Salt with seller ID
    32
  );
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(token, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
  };
}

// Layer 2: Database-level encryption (MongoDB field encryption)
// Layer 3: Disk encryption (server-level)
```

### 2. **Token Validation & Health Checks**

```javascript
// Validate token immediately upon entry
async function validateShopifyToken(shopDomain, accessToken) {
  try {
    const response = await fetch(
      `https://${shopDomain}/admin/api/2024-01/shop.json`,
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return {
        valid: true,
        shopInfo: data.shop,
        scopes: response.headers.get("X-Shopify-API-Version"),
      };
    }

    return { valid: false, error: "Invalid token" };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// Periodic health checks (every 24 hours)
async function checkTokenHealth(sellerId) {
  // Test API call
  // If fails, mark as invalid and notify seller
  // Log attempt for security monitoring
}
```

### 3. **Access Control & Monitoring**

```javascript
// Rate limiting per seller
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  keyGenerator: (req) => req.user.sellerId,
};

// Activity logging
async function logAPIActivity(sellerId, action, metadata) {
  await ActivityLog.create({
    sellerId,
    action, // 'sync_products', 'sync_inventory', etc.
    timestamp: new Date(),
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    metadata,
    status: "success", // or 'failed'
  });
}

// Anomaly detection
async function detectAnomalies(sellerId) {
  // Check for unusual patterns:
  // - Sudden spike in API calls
  // - Access from new IP/location
  // - Failed authentication attempts
  // - Large data exports
}
```

### 4. **Token Rotation & Expiration**

```javascript
// Recommend rotation every 90 days
async function checkTokenAge(sellerId) {
  const seller = await User.findById(sellerId);
  const tokenAge = Date.now() - seller.shopifyIntegration.tokenCreatedAt;
  const ninetyDays = 90 * 24 * 60 * 60 * 1000;

  if (tokenAge > ninetyDays) {
    // Send notification to rotate token
    await sendRotationReminder(seller);
  }
}
```

### 5. **Secure Storage Schema**

```javascript
shopifyIntegration: {
  isConnected: Boolean,
  shopDomain: String, // e.g., "mystore.myshopify.com"

  // Encrypted token storage
  encryptedToken: String,
  tokenIV: String,
  tokenAuthTag: String,
  tokenLastFour: String, // Only last 4 chars for display

  // Token metadata
  tokenCreatedAt: Date,
  tokenLastValidated: Date,
  tokenScopes: [String], // ['read_products', 'write_inventory']

  // Health & monitoring
  isTokenValid: { type: Boolean, default: true },
  lastSyncAt: Date,
  lastSyncStatus: String, // 'success', 'failed', 'partial'
  failedAttempts: { type: Number, default: 0 },

  // Sync settings
  syncSettings: {
    autoSyncProducts: Boolean,
    autoSyncInventory: Boolean,
    syncInterval: String
  },

  // Security
  allowedIPs: [String], // Optional IP whitelist
  require2FA: { type: Boolean, default: false }
}
```

## 🚀 Additional Security Features (Beyond Competition)

### 1. **IP Whitelisting (Optional)**

- Sellers can specify allowed IPs for API access
- Blocks requests from unauthorized locations

### 2. **2FA for Sensitive Operations**

- Require 2FA for:
  - Adding/updating Shopify credentials
  - Bulk product imports
  - Disconnecting integration

### 3. **Webhook Signature Verification**

- If using webhooks, verify HMAC signatures
- Prevents spoofed webhook attacks

### 4. **Data Minimization**

- Only request necessary scopes
- Don't store sensitive customer data
- Auto-delete old sync logs (90 days)

### 5. **Breach Detection**

- Monitor for leaked tokens on GitHub, pastebin
- Automatic revocation if detected
- Immediate seller notification

### 6. **Audit Trail**

- Complete log of all API operations
- Exportable for compliance
- Immutable (append-only)

### 7. **Graceful Degradation**

- If token is revoked, don't break the panel
- Show clear error messages
- Easy re-connection flow

### 8. **Compliance**

- GDPR compliant (data deletion on request)
- SOC 2 Type II ready
- PCI DSS compliant (no card data storage)

## 📊 Comparison Matrix

| Feature          | Our Platform  | Shopify OAuth    | WooCommerce | Amazon MWS              |
| ---------------- | ------------- | ---------------- | ----------- | ----------------------- |
| Setup Complexity | ⭐⭐ (Medium) | ⭐⭐⭐ (Complex) | ⭐ (Simple) | ⭐⭐⭐⭐ (Very Complex) |
| Security Level   | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐⭐       | ⭐⭐⭐⭐    | ⭐⭐⭐⭐⭐              |
| Seller Control   | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐         | ⭐⭐⭐⭐⭐  | ⭐⭐⭐                  |
| Revocation       | Instant       | Instant          | Instant     | 24 hours                |
| Token Rotation   | Manual        | N/A              | Manual      | Automatic               |
| Monitoring       | Real-time     | Limited          | Limited     | Advanced                |
| IP Whitelisting  | ✅            | ❌               | ❌          | ✅                      |
| 2FA Support      | ✅            | ✅               | ❌          | ✅                      |
| Audit Logs       | ✅            | ✅               | ❌          | ✅                      |

## 🎯 Implementation Priority

### Phase 1: Core Security (Week 1)

- ✅ AES-256-GCM encryption
- ✅ Token validation on entry
- ✅ Secure storage schema
- ✅ Basic activity logging

### Phase 2: Monitoring (Week 2)

- ✅ Health checks (24-hour intervals)
- ✅ Failed attempt tracking
- ✅ Token age monitoring
- ✅ Rotation reminders

### Phase 3: Advanced Features (Week 3)

- ✅ IP whitelisting
- ✅ 2FA for sensitive ops
- ✅ Anomaly detection
- ✅ Breach monitoring

### Phase 4: Compliance (Week 4)

- ✅ Audit trail export
- ✅ GDPR compliance
- ✅ Data retention policies
- ✅ Security documentation

## 💡 Key Advantages Over Competition

1. **No Platform-Level App Required**: Sellers use their own custom app
2. **Full Seller Control**: They can revoke access instantly
3. **Enhanced Security**: Multi-layer encryption + monitoring
4. **Better UX**: Simple copy-paste flow
5. **Compliance Ready**: Built-in audit trails and data controls
6. **Proactive Monitoring**: Detect issues before they impact sellers
7. **Transparent**: Sellers see exactly what permissions we need

## 🔒 Security Guarantees

1. **Tokens never logged in plain text**
2. **Encrypted at rest with AES-256-GCM**
3. **Encrypted in transit with TLS 1.3**
4. **Seller-specific encryption keys**
5. **Automatic detection of revoked tokens**
6. **Complete audit trail**
7. **GDPR-compliant data deletion**
8. **No third-party access to credentials**
9. **Regular security audits**
10. **Incident response plan**
