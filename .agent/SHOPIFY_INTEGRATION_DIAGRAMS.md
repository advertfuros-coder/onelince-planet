# Shopify Integration Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SHOPIFY INTEGRATION ARCHITECTURE                      │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐                                           ┌──────────────┐
│              │                                           │              │
│   SELLER     │                                           │   SHOPIFY    │
│   PANEL      │                                           │    STORE     │
│              │                                           │              │
└──────┬───────┘                                           └──────┬───────┘
       │                                                          │
       │ 1. Click "Connect Shopify"                             │
       │────────────────────────────────────────────────────────▶│
       │                                                          │
       │ 2. Redirect to Shopify OAuth                           │
       │◀────────────────────────────────────────────────────────│
       │                                                          │
       │ 3. Seller authorizes app                               │
       │────────────────────────────────────────────────────────▶│
       │                                                          │
       │ 4. Callback with auth code                             │
       │◀────────────────────────────────────────────────────────│
       │                                                          │
       │ 5. Exchange code for access token                      │
       │────────────────────────────────────────────────────────▶│
       │                                                          │
       │ 6. Store encrypted token in DB                         │
       │                                                          │
       │ 7. Click "Sync Products"                               │
       │────────────────────────────────────────────────────────▶│
       │                                                          │
       │ 8. Fetch products via API                              │
       │◀────────────────────────────────────────────────────────│
       │                                                          │
       │ 9. Import products to platform                         │
       │                                                          │
       │ 10. Sync inventory levels                              │
       │────────────────────────────────────────────────────────▶│
       │                                                          │
       │ 11. Update stock in platform                           │
       │                                                          │
       └──────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA FLOW DIAGRAM                                │
└─────────────────────────────────────────────────────────────────────────┘

    Shopify Product                     Platform Product
    ┌──────────────┐                   ┌──────────────┐
    │ id           │──────────────────▶│ shopifyProductId
    │ title        │──────────────────▶│ name         │
    │ body_html    │──────────────────▶│ description  │
    │ vendor       │──────────────────▶│ brand        │
    │ product_type │──────────────────▶│ category     │
    │ images[]     │──────────────────▶│ images[]     │
    │ variants[]   │──────────────────▶│ pricing      │
    │   - price    │                   │ inventory    │
    │   - inventory│                   │ sku          │
    │ tags         │──────────────────▶│ tags         │
    │ status       │──────────────────▶│ isActive     │
    └──────────────┘                   └──────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                         SYNC SETTINGS                                    │
└─────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────┐
    │  Auto-Sync Products:     ☑ Enabled                     │
    │  Auto-Sync Inventory:    ☑ Enabled                     │
    │  Auto-Sync Orders:       ☐ Disabled                    │
    │  Sync Frequency:         ⚙ Daily                       │
    └─────────────────────────────────────────────────────────┘
                            │
                            ▼
    ┌─────────────────────────────────────────────────────────┐
    │         BACKGROUND JOB (Cron/Scheduled)                 │
    │  - Runs at configured interval                          │
    │  - Fetches latest data from Shopify                     │
    │  - Updates products and inventory                       │
    │  - Logs sync results                                    │
    └─────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                      SECURITY MEASURES                                   │
└─────────────────────────────────────────────────────────────────────────┘

    1. OAuth 2.0 Authentication
       └─▶ Secure authorization flow

    2. HMAC Verification
       └─▶ Validates callback authenticity

    3. Encrypted Token Storage
       └─▶ Access tokens stored encrypted in DB

    4. JWT Authentication
       └─▶ API routes protected with JWT

    5. State Parameter
       └─▶ Prevents CSRF attacks

    6. HTTPS Only
       └─▶ All API calls over secure connection


┌─────────────────────────────────────────────────────────────────────────┐
│                      ERROR HANDLING                                      │
└─────────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │  Sync Attempt    │
    └────────┬─────────┘
             │
             ▼
    ┌────────────────────┐      Success      ┌──────────────┐
    │  API Call to       │──────────────────▶│ Update DB    │
    │  Shopify           │                    │ Log Success  │
    └────────┬───────────┘                    └──────────────┘
             │
             │ Error
             ▼
    ┌────────────────────┐
    │  Error Handling    │
    │  - Log error       │
    │  - Notify seller   │
    │  - Retry logic     │
    │  - Fallback        │
    └────────────────────┘
```
