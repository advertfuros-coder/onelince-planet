---
description: How to integrate Shopify with the seller panel
---

# Shopify Integration with Seller Panel

## Overview

This guide explains how to connect Shopify stores with your seller panel, allowing sellers to sync products, inventory, and orders between platforms.

## Architecture

### Integration Flow

1. Seller connects their Shopify store via OAuth
2. Store credentials are securely saved
3. Products/inventory sync automatically or on-demand
4. Orders can be imported from Shopify
5. Inventory updates sync bidirectionally

## Implementation Steps

### 1. Create Shopify App (One-time Setup)

**Prerequisites:**

- Shopify Partner account
- Create a custom app in Shopify Partner Dashboard

**Required Scopes:**

- `read_products`
- `write_products`
- `read_inventory`
- `write_inventory`
- `read_orders`
- `read_customers`

**Environment Variables to Add:**

```env
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_SCOPES=read_products,write_products,read_inventory,write_inventory,read_orders
SHOPIFY_REDIRECT_URI=https://yourdomain.com/api/seller/integrations/shopify/callback
```

### 2. Database Schema

Add Shopify integration fields to Seller model:

```javascript
shopifyIntegration: {
  isConnected: Boolean,
  shopDomain: String,
  accessToken: String (encrypted),
  lastSyncAt: Date,
  syncSettings: {
    autoSyncProducts: Boolean,
    autoSyncInventory: Boolean,
    autoSyncOrders: Boolean,
    syncInterval: String // 'hourly', 'daily', 'manual'
  }
}
```

### 3. Create Integration Page

File: `/seller/integrations/page.jsx`

- Display connected integrations
- Shopify connect button
- Sync settings
- Manual sync triggers
- Sync history/logs

### 4. API Routes to Create

**OAuth Flow:**

- `GET /api/seller/integrations/shopify/auth` - Initiate OAuth
- `GET /api/seller/integrations/shopify/callback` - Handle callback
- `DELETE /api/seller/integrations/shopify/disconnect` - Disconnect store

**Sync Operations:**

- `POST /api/seller/integrations/shopify/sync/products` - Sync products
- `POST /api/seller/integrations/shopify/sync/inventory` - Sync inventory
- `POST /api/seller/integrations/shopify/sync/orders` - Import orders
- `GET /api/seller/integrations/shopify/status` - Get sync status

### 5. Sync Logic

**Product Sync (Shopify → Your Platform):**

- Map Shopify product fields to your schema
- Handle variants as separate products or options
- Sync images, pricing, descriptions
- Set products as "Imported from Shopify"

**Inventory Sync (Bidirectional):**

- Update stock levels based on sales
- Handle low stock alerts
- Sync across multiple warehouses

**Order Import:**

- Import Shopify orders
- Mark as "Shopify Order"
- Update inventory accordingly

### 6. Webhook Setup (Optional but Recommended)

Register webhooks for real-time updates:

- `products/create`
- `products/update`
- `products/delete`
- `inventory_levels/update`
- `orders/create`

Webhook endpoint: `POST /api/webhooks/shopify`

### 7. Error Handling

- Rate limiting (Shopify API limits)
- Token expiration handling
- Sync conflict resolution
- Failed sync retry mechanism

### 8. Testing

1. Test OAuth flow
2. Test product import (small batch first)
3. Test inventory sync
4. Test order import
5. Test disconnect/reconnect

## Security Considerations

1. Encrypt Shopify access tokens in database
2. Use HTTPS for all API calls
3. Validate webhook signatures
4. Implement rate limiting
5. Log all sync operations for audit

## User Experience

**For Sellers:**

1. Go to Integrations page
2. Click "Connect Shopify"
3. Authorize on Shopify
4. Configure sync settings
5. Trigger initial sync
6. Monitor sync status

## Maintenance

- Monitor sync success rates
- Handle API version updates
- Update scopes as needed
- Regular security audits

## Alternative: Manual CSV Import

If full integration is complex, offer:

- CSV export from Shopify
- CSV import to your platform
- Field mapping interface
- Bulk product creation

## Resources

- [Shopify API Documentation](https://shopify.dev/docs/api)
- [Shopify OAuth Guide](https://shopify.dev/docs/apps/auth/oauth)
- [Shopify Webhooks](https://shopify.dev/docs/apps/webhooks)
