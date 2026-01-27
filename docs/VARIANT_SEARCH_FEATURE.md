# Variant-Aware Search Feature

## Overview

The search functionality has been enhanced to show **individual product variants** as separate search results. This means when a customer searches for "pineapple", they will see specific results like:

- "Pineapple Moisturizer Cold Cream"
- "Mango Moisturizer Cold Cream"
- "Green Apple Moisturizer Cold Cream"

Each variant appears as its own searchable item with its specific image, price, and stock information.

## How It Works

### 1. **Backend Search API** (`/api/search/suggestions`)

The search API now:

- Searches within variant names in addition to product names
- Expands products with variants into individual search results
- Each variant result includes:
  - Combined name format: `{Variant Name} {Product Name}`
  - Variant-specific image (falls back to product image)
  - Variant-specific price
  - Variant SKU for direct linking
  - Stock information

**Example API Response:**

```json
{
  "success": true,
  "query": "pineapple",
  "suggestions": {
    "categories": [],
    "products": [
      {
        "type": "product",
        "id": "507f1f77bcf86cd799439011_MOIST-PINE-001",
        "parentId": "507f1f77bcf86cd799439011",
        "variantSku": "MOIST-PINE-001",
        "variantName": "Pineapple",
        "name": "Pineapple Moisturizer Cold Cream",
        "slug": "moisturizer-cold-cream",
        "image": "https://...",
        "price": 299,
        "stock": 45,
        "category": "Beauty",
        "rating": 4.5
      }
    ]
  }
}
```

### 2. **Search Autocomplete Component**

The `SearchAutocomplete` component now:

- Displays a "Variant" badge for variant results
- Shows stock information for variants
- Links directly to the product with the variant pre-selected

**Visual Indicators:**

- Purple "Variant" badge next to variant results
- Stock count displayed (e.g., "45 in stock" or "Out of stock")
- Variant-specific thumbnail image

### 3. **Product Detail Page Integration**

When a user clicks on a variant from search results:

- URL format: `/products/product-name-{id}?v={variantSku}`
- The product page automatically selects that variant
- The variant's specific images and details are displayed
- Other variants remain visible for easy switching

**Example Flow:**

1. User searches "pineapple"
2. Clicks "Pineapple Moisturizer Cold Cream"
3. Redirected to: `/products/moisturizer-cold-cream-507f1f77bcf86cd799439011?v=MOIST-PINE-001`
4. Product page loads with "Pineapple" variant pre-selected
5. User can see other variants (Mango, Green Apple) and switch if desired

## Key Features

### ✅ Variant Name Searchability

- Searches match against both product name AND variant names
- Example: Searching "mango" will find "Mango Moisturizer Cold Cream" even if the base product is just "Moisturizer Cold Cream"

### ✅ Individual Variant Results

- Each variant appears as a separate, clickable result
- No confusion about which variant you're selecting

### ✅ Direct Variant Selection

- Clicking a variant result takes you directly to that specific variant
- No need to select options after landing on the product page

### ✅ Stock Visibility

- See stock levels directly in search results
- Avoid clicking on out-of-stock variants

### ✅ Variant-Specific Images

- Each variant shows its own image in search results
- Visual confirmation of what you're selecting

## Technical Implementation

### Files Modified

1. **`/src/app/api/search/suggestions/route.js`**
   - Added `variants.name` to search query
   - Implemented variant expansion logic
   - Added stock and variant metadata to results

2. **`/src/components/customer/SearchAutocomplete.jsx`**
   - Added variant badge display
   - Added stock information display
   - Enhanced visual distinction for variants

3. **`/src/lib/utils/productUrl.js`** (Already supported)
   - Handles variant SKU in URL parameters
   - Format: `?v={variantSku}`

4. **`/src/app/(customer)/products/[id]/page.jsx`** (Already supported)
   - Reads `?v` parameter from URL
   - Auto-selects the specified variant on page load

## Testing the Feature

### Manual Testing Steps

1. **Create a product with variants:**
   - Go to Seller Panel → Products → New Product
   - Add product name: "Moisturizer Cold Cream"
   - Add variants: Pineapple, Mango, Green Apple
   - Upload different images for each variant
   - Set different prices/stock for each

2. **Test search functionality:**
   - Open the search bar
   - Type "pineapple"
   - Verify "Pineapple Moisturizer Cold Cream" appears
   - Check for variant badge and stock info

3. **Test variant selection:**
   - Click on the variant result
   - Verify URL contains `?v=VARIANT-SKU`
   - Verify correct variant is pre-selected
   - Verify correct images are shown

4. **Test variant switching:**
   - On product page, select a different variant
   - Verify images and details update
   - Verify all variants remain accessible

### API Testing

```bash
# Test variant search
curl "http://localhost:3000/api/search/suggestions?q=pineapple&limit=10"

# Expected: Returns expanded variant results with variantSku field
```

## Benefits

1. **Better User Experience**: Users find exactly what they're looking for
2. **Reduced Friction**: No need to manually select variants after clicking
3. **Increased Conversions**: Direct path from search to specific product variant
4. **Stock Transparency**: Users see availability before clicking
5. **Visual Clarity**: Variant badges and images prevent confusion

## Future Enhancements

- [ ] Add variant attributes to search results (e.g., "Size: Large, Color: Red")
- [ ] Implement variant filtering in main products page
- [ ] Add "Similar Variants" suggestions
- [ ] Track variant-specific search analytics
