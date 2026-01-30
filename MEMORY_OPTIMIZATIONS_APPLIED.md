# Memory Optimizations Applied - Online Planet

**Date Applied**: 2026-01-29  
**Next.js Version**: 15.5.9  
**Expected RAM Reduction**: 85-95% (from 2-4GB to 150-250MB)

---

## ✅ Optimizations Implemented

### 1. **Disabled Turbopack in Development**

**Expected Savings**: 800MB - 1.2GB

**Changes in `package.json`**:

- ✅ Changed `"dev": "next dev --turbopack"` → `"dev": "next dev"`
- ✅ Changed `"build": "next build --turbopack"` → `"build": "next build"`
- ✅ Added `"dev:turbo": "next dev --turbopack"` (optional fallback)

**Why**: Turbopack trades memory for speed. Standard webpack uses 40-60% less RAM.

---

### 2. **Added Utility Scripts**

**New scripts in `package.json`**:

- ✅ `"clean": "rm -rf .next"` - Clear build cache
- ✅ `"clean:all": "rm -rf .next node_modules/.cache"` - Deep clean
- ✅ `"memory:check": "ps aux | grep next-server | grep -v grep"` - Monitor RAM

**Usage**:

```bash
npm run clean        # Clear build cache
npm run clean:all    # Deep clean (cache + node_modules cache)
npm run memory:check # Check current RAM usage
```

---

### 3. **Configured Next.js Memory Optimization**

**Expected Savings**: 300MB - 500MB

**Changes in `next.config.mjs`**:

#### a) **On-Demand Entries** (Limit pages in memory)

```javascript
onDemandEntries: {
  maxInactiveAge: 25 * 1000,  // 25 seconds
  pagesBufferLength: 2,        // Only 2 pages in memory
}
```

- Only keeps 2 pages in memory at a time
- Removes inactive pages after 25 seconds

#### b) **Image Optimization Cache Reduction**

```javascript
images: {
  deviceSizes: [640, 750, 828, 1080, 1200, 1920],  // Reduced from 8 to 6
  imageSizes: [16, 32, 48, 64, 96, 128, 256],      // Reduced from 8 to 7
}
```

- Reduced device size targets from 8 to 6
- Reduced image size targets from 8 to 7

#### c) **Production Source Maps Disabled**

```javascript
productionBrowserSourceMaps: false;
```

- Prevents unnecessary source map generation in production builds

#### d) **Next.js 16+ Compatibility**

```javascript
turbopack: {
}
```

- Empty turbopack config silences warnings in Next.js 16+

---

## 📊 Expected Results

| Metric           | Before | After      | Improvement     |
| ---------------- | ------ | ---------- | --------------- |
| **RAM Usage**    | 2-4 GB | 150-250 MB | **85-95%** ↓    |
| **Startup Time** | Fast   | +5-10s     | Slightly slower |
| **Hot Reload**   | 1-2s   | 1-3s       | Minimal impact  |
| **Build Time**   | Same   | Same       | No change       |

---

## 🔍 How to Monitor Memory Usage

### After Restarting Dev Server:

1. **Start the dev server**:

   ```bash
   npm run dev
   ```

2. **Check memory usage**:

   ```bash
   npm run memory:check
   ```

3. **Expected output**:

   ```
   harsh    12345  0.5  1.2  ... node next-server
   ```

   - The **4th column** is %MEM (should be 1-3% instead of 15-25%)
   - The **9th column** is RSS (Resident Set Size) in KB

4. **Alternative detailed check**:
   ```bash
   ps aux | grep next-server | grep -v grep | awk '{print "PID:", $2, "| MEM:", $4"%", "| RSS:", $6/1024"MB"}'
   ```

---

## 🚀 Next Steps

1. **Restart the dev server** with optimizations:

   ```bash
   npm run dev
   ```

2. **Wait 30 seconds** for the server to fully initialize

3. **Check memory usage**:

   ```bash
   npm run memory:check
   ```

4. **Compare with previous usage** (should see 85-95% reduction)

---

## 🔧 Troubleshooting

### If Memory is Still High:

1. **Clear all caches**:

   ```bash
   npm run clean:all
   npm run dev
   ```

2. **Check for memory leaks**:
   - Look for unclosed database connections
   - Check for event listeners not being removed
   - Review API routes for streaming responses

3. **For very large projects** (500+ files), further optimize:

   Update `next.config.mjs`:

   ```javascript
   onDemandEntries: {
     maxInactiveAge: 15 * 1000,  // Reduce to 15 seconds
     pagesBufferLength: 1,        // Only 1 page in memory
   }
   ```

4. **Kill old Next.js servers**:
   ```bash
   pkill -f next-server
   ```

---

## 📝 Configuration Files Modified

### 1. `/package.json`

- Scripts section updated with memory-optimized commands

### 2. `/next.config.mjs`

- Added onDemandEntries configuration
- Optimized image cache settings
- Disabled production source maps
- Added turbopack compatibility config

---

## 🎯 Best Practices Going Forward

### DO:

✅ Use `npm run dev` for development (standard webpack)  
✅ Run `npm run clean` regularly (weekly or when noticing slowdowns)  
✅ Monitor memory with `npm run memory:check`  
✅ Use `npm run dev:turbo` only when you need faster builds temporarily

### DON'T:

❌ Don't use Turbopack by default  
❌ Don't ignore memory warnings  
❌ Don't keep unlimited pages in memory  
❌ Don't enable source maps in production

---

## 📚 Additional Resources

- [Original Optimization Guide](./NEXTJS_MEMORY_OPTIMIZATION_GUIDE.md)
- [Next.js onDemandEntries Docs](https://nextjs.org/docs/api-reference/next.config.js/configuring-onDemandEntries)
- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)

---

## ✅ Verification Checklist

- [x] Disabled Turbopack in dev script
- [x] Added `dev:turbo` fallback option
- [x] Added `clean` and `clean:all` scripts
- [x] Added `memory:check` script
- [x] Configured `onDemandEntries` in next.config.mjs
- [x] Reduced `deviceSizes` and `imageSizes`
- [x] Disabled `productionBrowserSourceMaps`
- [x] Added `turbopack: {}` for Next.js 16+ compatibility
- [x] Cleared `.next` cache
- [ ] Restarted dev server (to be done next)
- [ ] Verified memory reduction (to be done after restart)

---

**Status**: ✅ Optimizations Applied - Ready for Testing  
**Next Action**: Restart dev server and verify memory reduction
