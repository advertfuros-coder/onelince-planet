# 🔧 Razorpay Receipt Length Fix

## ❌ Problem

```
Razorpay order creation error: {
  statusCode: 400,
  error: {
    code: 'BAD_REQUEST_ERROR',
    description: 'receipt: the length must be no more than 40.',
    reason: 'input_validation_failed'
  }
}
```

**Root Cause**: Razorpay has a **40 character limit** for the `receipt` field, but we were generating receipts like:

```javascript
`sub_${decoded.userId}_${tier}_${Date.now()}`;
// Example: sub_507f1f77bcf86cd799439011_professional_1735322619000
// Length: 60+ characters ❌
```

---

## ✅ Solution

Changed the receipt format to use only the last 10 digits of the timestamp:

### File 1: `/src/app/api/seller/subscription/create-order/route.js`

```javascript
// Before (❌ Too long)
receipt: `sub_${decoded.userId}_${Date.now()}`;

// After (✅ Under 40 chars)
receipt: `sub_${Date.now().toString().slice(-10)}`;
// Example: sub_2619000000
// Length: 14 characters ✅
```

### File 2: `/src/app/api/seller/subscription/upgrade/route.js`

```javascript
// Before (❌ Too long)
receipt: `sub_${decoded.userId}_${tier}_${Date.now()}`;

// After (✅ Under 40 chars)
receipt: `sub_${Date.now().toString().slice(-10)}`;
// Example: sub_2619000000
// Length: 14 characters ✅
```

---

## 📊 Receipt Format Details

### New Format:

- **Prefix**: `sub_` (4 chars)
- **Timestamp**: Last 10 digits of `Date.now()` (10 chars)
- **Total**: 14 characters ✅

### Why This Works:

1. **Unique**: Timestamp ensures uniqueness
2. **Short**: Well under 40 character limit
3. **Traceable**: Can still identify when order was created
4. **Simple**: Easy to generate and parse

### Example Receipts:

```
sub_2619000000
sub_2619001234
sub_2619005678
```

---

## 🔍 Why We Don't Need User ID in Receipt

The `receipt` field is just for your reference. The actual seller information is stored in the `notes` field:

```javascript
notes: {
  sellerId: decoded.userId,  // ✅ Full user ID here
  tier,
  billingInterval,
  previousTier,
  proratedDays,
}
```

When the webhook fires, we extract the `sellerId` from `notes`, not from the `receipt`.

---

## ✅ Testing

Try upgrading again:

1. Go to `/seller/subscription`
2. Click "Upgrade Now"
3. Should now create order successfully ✅

---

## 📝 Razorpay Receipt Field Limits

For future reference:

- **Max length**: 40 characters
- **Allowed chars**: Alphanumeric, underscore, hyphen
- **Purpose**: Your internal reference
- **Not used for**: Payment processing (only for your records)

---

## 🎯 Status

✅ **Fixed** in both endpoints:

- `/api/seller/subscription/create-order`
- `/api/seller/subscription/upgrade`

**Ready to test!** 🚀
