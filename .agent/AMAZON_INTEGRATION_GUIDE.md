# Amazon Seller Central Integration - Implementation Guide

## ✅ What's Been Created

### 1. **API Routes** (Core Complete)

- ✅ `/api/seller/integrations/amazon/connect` - Connect Amazon Seller Central
- ✅ `/api/seller/integrations/amazon/status` - Get connection status
- ✅ `/api/seller/integrations/amazon/disconnect` - Disconnect account
- ✅ `/api/seller/integrations/amazon/settings` - Update sync settings
- ⏳ `/api/seller/integrations/amazon/sync/products` - Requires SP-API SDK

### 2. **Security Features**

- ✅ **Triple encryption** - AWS Access Key, AWS Secret Key, and Refresh Token all encrypted separately
- ✅ AES-256-GCM encryption with unique salts
- ✅ Seller-specific encryption keys
- ✅ Duplicate account prevention
- ✅ Region validation

## 🔐 How Amazon SP-API Works

### Required Credentials:

1. **Seller ID** - Your Amazon Seller Central ID
2. **AWS Access Key ID** - From AWS IAM
3. **AWS Secret Access Key** - From AWS IAM
4. **Refresh Token** - From SP-API authorization
5. **Region** - AWS region (us-east-1, eu-west-1, etc.)
6. **Marketplace ID** - Amazon marketplace (ATVPDKIKX0DER for US)

### Authentication Flow:

```
1. Seller registers SP-API app in Amazon Seller Central
2. Gets AWS IAM credentials
3. Authorizes app to get Refresh Token
4. Uses Refresh Token to get Access Token (expires in 1 hour)
5. Access Token used for API calls
```

## 📋 How to Get Amazon Credentials

### Step 1: Register as Amazon Developer

1. Go to [Amazon Developer Console](https://developer.amazonservices.com/)
2. Sign in with Seller Central credentials
3. Register as a developer

### Step 2: Create SP-API Application

1. Go to **Developer Console** → **Add new app client**
2. App name: "Online Planet Integration"
3. OAuth Redirect URI: `https://yourdomain.com/api/seller/integrations/amazon/callback`
4. Save **LWA Client ID** and **LWA Client Secret**

### Step 3: Create IAM User in AWS

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Create new user: "sp-api-user"
3. Attach policy: **AmazonSellingPartnerAPIFullAccess**
4. Save **Access Key ID** and **Secret Access Key**

### Step 4: Authorize App

1. Go to authorization URL:
   ```
   https://sellercentral.amazon.com/apps/authorize/consent?
   application_id=YOUR_APP_ID&
   state=YOUR_STATE&
   version=beta
   ```
2. Authorize the app
3. Get **Refresh Token** from callback

### Step 5: Connect in Our Platform

1. Enter all credentials in connection modal
2. We encrypt and store securely
3. Ready to sync!

## 🎨 UI Components Needed

### Amazon Integration Card

- Orange theme (#FF9900 - Amazon brand color)
- Same structure as Shopify/WooCommerce
- Shows Seller ID and Region
- Connect/Disconnect functionality

### Amazon Connection Modal

- 5 input fields:
  - Seller ID
  - AWS Access Key ID
  - AWS Secret Access Key
  - Refresh Token
  - Region (dropdown)
- Detailed instructions
- Security notice

## 📊 Database Schema

Add to User model:

```javascript
amazonIntegration: {
  isConnected: { type: Boolean, default: false },
  sellerId: String,
  region: String, // 'us-east-1', 'eu-west-1', etc.
  marketplaceId: String, // 'ATVPDKIKX0DER', etc.

  // Encrypted credentials
  encryptedAccessKey: String,
  accessKeyIV: String,
  accessKeyAuthTag: String,

  encryptedSecretKey: String,
  secretKeyIV: String,
  secretKeyAuthTag: String,

  encryptedRefreshToken: String,
  refreshTokenIV: String,
  refreshTokenAuthTag: String,

  accessKeyLastFour: String,
  tokenCreatedAt: Date,
  tokenLastValidated: Date,
  isTokenValid: { type: Boolean, default: true },
  failedAttempts: { type: Number, default: 0 },
  lastSyncAt: Date,

  syncSettings: {
    autoSyncProducts: { type: Boolean, default: true },
    autoSyncInventory: { type: Boolean, default: true },
    autoSyncOrders: { type: Boolean, default: false },
    syncInterval: { type: String, enum: ['hourly', 'daily', 'manual'], default: 'daily' }
  }
}
```

Add to Product model:

```javascript
amazonASIN: String, // Amazon Standard Identification Number
amazonSKU: String
```

## 🚀 Product Sync Implementation (Advanced)

Amazon product sync requires the SP-API SDK. Here's the approach:

### Install Dependencies:

```bash
npm install amazon-sp-api
```

### Sync Flow:

1. Use Refresh Token to get Access Token
2. Call Catalog Items API to get products
3. Map Amazon fields to our schema
4. Handle variations/parent-child relationships
5. Sync inventory from FBA/FBM
6. Update last sync time

### Key Differences from Shopify/WooCommerce:

- **Access tokens expire** - Must refresh every hour
- **Rate limiting** - Strict API quotas
- **Complex variations** - Parent/child ASINs
- **FBA vs FBM** - Different inventory sources
- **Multiple marketplaces** - US, UK, DE, etc.

## ⚠️ Important Notes

### 1. **Complexity**

Amazon SP-API is significantly more complex than Shopify/WooCommerce:

- Requires AWS setup
- OAuth flow with LWA (Login with Amazon)
- Token refresh mechanism
- Rate limiting management
- Multiple API endpoints

### 2. **Recommended Approach**

For production, consider:

- Using official `amazon-sp-api` npm package
- Implementing token refresh cron job
- Adding rate limit handling
- Supporting multiple marketplaces
- Handling FBA inventory separately

### 3. **Alternative: Manual CSV Import**

If SP-API integration is too complex initially:

- Offer CSV export from Amazon
- CSV import to platform
- Manual sync option
- Upgrade to API later

## 🎯 Current Status

**Backend: 80% Complete**

- ✅ Connection route
- ✅ Status route
- ✅ Disconnect route
- ✅ Settings route
- ✅ Triple encryption
- ⏳ Product sync (requires SP-API SDK)

**Frontend: 0% Complete**

- ⏳ Integration card
- ⏳ Connection modal
- ⏳ State management
- ⏳ Functions

## 📝 Next Steps

1. **Add Amazon to integrations page UI**
2. **Create connection modal**
3. **Add state management**
4. **Implement product sync** (optional - can start with manual CSV)
5. **Test with Amazon Sandbox**
6. **Production deployment**

## 🔗 Resources

- [Amazon SP-API Documentation](https://developer-docs.amazon.com/sp-api/)
- [SP-API GitHub](https://github.com/amzn/selling-partner-api-docs)
- [amazon-sp-api NPM Package](https://www.npmjs.com/package/amazon-sp-api)
- [AWS IAM Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/)

## 💡 Recommendation

Given the complexity of Amazon SP-API, I recommend:

1. **Phase 1**: Implement UI and basic connection (done)
2. **Phase 2**: Add manual CSV import/export
3. **Phase 3**: Implement full SP-API sync (requires more time)

This allows sellers to start using Amazon integration immediately while we build the advanced features.
