# Multi-Country E-commerce Implementation Plan

## Overview

Implement country-based pricing, currency display, and seller filtering for India (IN) and UAE (AE) markets.

## Requirements

### 1. Currency Display

- **India (IN)**: Show prices in ₹ (INR)
- **UAE (AE)**: Show prices in AED
- Currency should match the selected country in header

### 2. Seller Filtering

- **India (IN)**: Show only Indian sellers (country: 'IN')
- **UAE (AE)**: Show only UAE sellers (country: 'AE')
- Filter applies to:
  - Product listing page
  - Search results
  - Category pages
  - Related products

### 3. Geolocation on Load

- Detect user's country on first visit using:
  1. Browser Geolocation API
  2. IP-based geolocation (fallback)
- Ask for location permission
- Auto-set country based on detection
- Save to localStorage

## Implementation Steps

### Phase 1: Currency Context & Display

**Files to Create:**

- `src/lib/context/CurrencyContext.jsx` - Manage currency state globally

**Files to Modify:**

- `src/components/customer/Header.jsx` - Add geolocation on mount
- `src/components/customer/ProductCard.jsx` - Use currency context
- `src/app/(customer)/products/[id]/page.jsx` - Use currency context
- `src/app/(customer)/cart/page.jsx` - Use currency context
- `src/app/(customer)/checkout/page.jsx` - Use currency context

**Currency Conversion:**

```javascript
const EXCHANGE_RATES = {
  INR_TO_AED: 0.044, // 1 INR = 0.044 AED
  AED_TO_INR: 22.73, // 1 AED = 22.73 INR
};
```

### Phase 2: Seller Country Filtering

**Files to Modify:**

- `src/app/api/products/route.js` - Add country filter to query
- `src/app/api/products/search/route.js` - Add country filter
- `src/lib/db/models/Seller.js` - Ensure country field exists

**Query Logic:**

```javascript
// Filter products by seller's country
const query = {
  status: "active",
  isApproved: true,
};

// Add seller country filter
const sellers = await Seller.find({
  "businessInfo.country": userCountry,
}).select("_id");

query.sellerId = { $in: sellers.map((s) => s._id) };
```

### Phase 3: Geolocation Implementation

**Add to Header.jsx:**

```javascript
useEffect(() => {
  // Check if country already set
  const savedCountry = localStorage.getItem("userCountry");
  if (savedCountry) {
    setCountry(savedCountry);
    return;
  }

  // Request geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // Use reverse geocoding to get country
        const country = await getCountryFromCoords(latitude, longitude);
        setCountry(country);
        localStorage.setItem("userCountry", country);
      },
      () => {
        // Fallback to IP-based detection
        detectCountryByIP();
      }
    );
  } else {
    detectCountryByIP();
  }
}, []);
```

### Phase 4: Price Storage Strategy

**Option A: Store in Base Currency (Recommended)**

- Store all prices in INR in database
- Convert to AED on frontend based on user's country
- Pros: Single source of truth, easy to update exchange rates
- Cons: Requires conversion on every display

**Option B: Store Both Currencies**

- Add `pricing.inr` and `pricing.aed` fields
- Display based on user's country
- Pros: No conversion needed, faster
- Cons: Harder to maintain, exchange rate changes require DB updates

**Recommended: Option A**

## Database Schema Updates

### Seller Model

```javascript
businessInfo: {
  country: {
    type: String,
    enum: ['IN', 'AE'],
    required: true,
    default: 'IN'
  }
}
```

### Product Model

```javascript
pricing: {
  basePrice: Number,      // Store in INR
  salePrice: Number,      // Store in INR
  currency: {
    type: String,
    default: 'INR'
  }
}
```

## API Changes

### Products API (`/api/products`)

Add country filter parameter:

```javascript
GET /api/products?country=IN
GET /api/products?country=AE
```

### Response Format

```javascript
{
  products: [...],
  currency: 'INR',  // or 'AED' based on request
  exchangeRate: 1   // or 0.044 for AED
}
```

## Frontend Components

### Currency Display Component

```javascript
// src/components/ui/Price.jsx
export function Price({ amount, country }) {
  const symbol = country === "IN" ? "₹" : "AED";
  const converted = country === "AE" ? (amount * 0.044).toFixed(2) : amount;

  return (
    <span>
      {symbol} {converted}
    </span>
  );
}
```

## Testing Checklist

- [ ] Currency displays correctly for IN
- [ ] Currency displays correctly for AE
- [ ] Changing country updates all prices
- [ ] Only Indian sellers shown when IN selected
- [ ] Only UAE sellers shown when AE selected
- [ ] Geolocation asks for permission
- [ ] Geolocation sets correct country
- [ ] IP fallback works when geolocation denied
- [ ] Cart prices update when country changes
- [ ] Checkout shows correct currency
- [ ] Orders save with correct currency

## Migration Script

Create script to set seller countries:

```javascript
// scripts/setSellerCountries.mjs
// Set all existing sellers to 'IN' by default
// Admin can update individual sellers to 'AE'
```

## Next Steps

1. Create CurrencyContext
2. Add geolocation to Header
3. Update all price displays
4. Add country filter to product APIs
5. Test thoroughly
6. Deploy

## Estimated Time

- Phase 1: 2-3 hours
- Phase 2: 2-3 hours
- Phase 3: 1-2 hours
- Phase 4: 1 hour
- Testing: 2 hours
  **Total: 8-11 hours**
