# 🛠️ Implementation Guide

## Step-by-Step Code Fixes

**Generated:** December 23, 2025

---

## 🎯 FIX #1: Add SEO Metadata (15 minutes)

### Current Issue

Root layout has no metadata, preventing SEO indexing.

### Step 1: Create New Layout Structure

**File:** `src/app/layout.jsx`

Replace entire file with:

```javascript
import { Inter } from "next/font/google";
import { Providers } from "./providers.jsx";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: {
    default: "Online Planet - Dubai's Premier Multi-Vendor Marketplace",
    template: "%s | Online Planet",
  },
  description:
    "Shop from thousands of verified sellers across Dubai. Best prices, quality products, fast delivery. Electronics, Fashion, Home & more.",
  keywords: [
    "e-commerce",
    "marketplace",
    "Dubai",
    "online shopping",
    "multi-vendor",
    "electronics",
    "fashion",
    "home decor",
  ],
  authors: [{ name: "Online Planet Team" }],
  creator: "Online Planet",
  publisher: "Online Planet",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://onlineplanet.ae"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_AE",
    url: "https://onlineplanet.ae",
    siteName: "Online Planet",
    title: "Online Planet - Dubai's Premier Multi-Vendor Marketplace",
    description:
      "Shop from thousands of verified sellers across Dubai. Best prices, quality products, fast delivery.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Online Planet Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Online Planet - Dubai's Premier Multi-Vendor Marketplace",
    description: "Shop from thousands of verified sellers across Dubai.",
    images: ["/twitter-image.jpg"],
    creator: "@onlineplanet",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Step 2: Create OG Image

Create a 1200x630px image at `public/og-image.jpg` with your branding.

### Step 3: Test

```bash
npm run dev
```

Visit http://localhost:3000 and view page source. You should see:

- `<title>` tag
- Meta description
- Open Graph tags
- Twitter Card tags

---

## 🎯 FIX #2: Secure Product Creation (20 minutes)

### Current Issue

Anyone can create products without authentication (line 84 TODO).

### Step 1: Update Product Route

**File:** `src/app/api/products/route.js`

Replace the POST function (lines 71-102) with:

```javascript
export async function POST(request) {
  try {
    await connectDB();

    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required. Please login to create products.",
        },
        { status: 401 }
      );
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid or expired authentication token. Please login again.",
        },
        { status: 401 }
      );
    }

    // Check if user is a seller
    if (decoded.role !== "seller") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only sellers can create products. Please register as a seller.",
        },
        { status: 403 }
      );
    }

    // Verify seller is approved
    const seller = await Seller.findOne({ userId: decoded.id });
    if (!seller || seller.verificationStatus !== "approved") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your seller account must be approved before creating products.",
        },
        { status: 403 }
      );
    }

    // Get and validate product data
    const productData = await request.json();

    // Add seller ID from authenticated user
    productData.sellerId = decoded.id;

    // Set initial approval status
    productData.isApproved = false; // Admin must approve
    productData.isActive = true;

    // Create product
    const product = await Product.create(productData);

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully. Pending admin approval.",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create product error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product data",
          errors: Object.values(error.errors).map((e) => e.message),
        },
        { status: 400 }
      );
    }

    // Handle duplicate SKU
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Product SKU already exists. Please use a unique SKU.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
```

### Step 2: Add Missing Import

At the top of the file, add:

```javascript
import Seller from "@/lib/db/models/Seller";
```

### Step 3: Test

```bash
# Test without token (should fail)
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product"}'

# Should return 401 Unauthorized
```

---

## 🎯 FIX #3: Remove Duplicate DB Connection (30 minutes)

### Step 1: Find All Imports

Run this command to find all files using the old dbConnect:

```bash
grep -r "from '@/lib/dbConnect'" src/
```

### Step 2: Replace Imports

For each file found, change:

```javascript
// OLD
import dbConnect from "@/lib/dbConnect";

// NEW
import connectDB from "@/lib/db/mongodb";
```

And change function calls:

```javascript
// OLD
await dbConnect();

// NEW
await connectDB();
```

### Step 3: Delete Old File

```bash
rm src/lib/dbConnect.js
```

### Step 4: Verify

```bash
# Should return no results
grep -r "dbConnect" src/
```

---

## 🎯 FIX #4: Add Rate Limiting (45 minutes)

### Step 1: Create Rate Limiter

**File:** `src/lib/middleware/rateLimit.js` (NEW FILE)

```javascript
import { NextResponse } from "next/server";

// In-memory store (use Redis in production)
const rateLimit = new Map();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, requests] of rateLimit.entries()) {
    const validRequests = requests.filter((time) => time > now - 60000);
    if (validRequests.length === 0) {
      rateLimit.delete(key);
    } else {
      rateLimit.set(key, validRequests);
    }
  }
}, 300000);

export function createRateLimiter(options = {}) {
  const {
    windowMs = 60000, // 1 minute
    max = 100, // 100 requests per window
    message = "Too many requests from this IP, please try again later.",
    skipSuccessfulRequests = false,
  } = options;

  return async (request) => {
    // Get client IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create request log for this IP
    if (!rateLimit.has(ip)) {
      rateLimit.set(ip, []);
    }

    // Filter out old requests
    const requests = rateLimit.get(ip).filter((time) => time > windowStart);

    // Check if limit exceeded
    if (requests.length >= max) {
      const retryAfter = Math.ceil((requests[0] + windowMs - now) / 1000);

      return NextResponse.json(
        {
          success: false,
          message,
          retryAfter: `${retryAfter} seconds`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Limit": max.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(requests[0] + windowMs).toISOString(),
          },
        }
      );
    }

    // Add current request
    requests.push(now);
    rateLimit.set(ip, requests);

    // Return null to continue to next handler
    return null;
  };
}

// Preset rate limiters
export const authRateLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 5, // 5 login attempts per minute
  message: "Too many login attempts. Please try again in a minute.",
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 100, // 100 API calls per minute
  message: "API rate limit exceeded. Please slow down.",
});

export const strictRateLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  max: 3, // 3 requests per minute (for sensitive operations)
  message: "Rate limit exceeded for this operation.",
});
```

### Step 2: Apply to Auth Routes

**File:** `src/app/api/auth/login/route.js`

Add at the top:

```javascript
import { authRateLimiter } from "@/lib/middleware/rateLimit";
```

Update POST function:

```javascript
export async function POST(request) {
  // Apply rate limiting
  const rateLimitResponse = await authRateLimiter(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    // ... rest of your code
```

### Step 3: Apply to Register Route

**File:** `src/app/api/auth/register/route.js`

Same pattern as login route.

### Step 4: Test

```bash
# Try logging in 6 times quickly
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
  echo ""
done

# 6th request should return 429 Too Many Requests
```

---

## 🎯 FIX #5: Validate Environment Variables (20 minutes)

### Step 1: Create Validation File

**File:** `src/lib/config/validateEnv.js` (NEW FILE)

```javascript
const requiredEnvVars = {
  // Database
  MONGODB_URI: "MongoDB connection string",

  // Authentication
  JWT_SECRET: "Secret key for JWT tokens",

  // Email
  SMTP_HOST: "SMTP server host",
  SMTP_PORT: "SMTP server port",
  SMTP_USER: "SMTP username",
  SMTP_PASS: "SMTP password",
  SMTP_FROM: "Email sender address",

  // Payment
  RAZORPAY_KEY_ID: "Razorpay API key ID",
  RAZORPAY_KEY_SECRET: "Razorpay API secret",

  // Cloud Storage
  CLOUDINARY_CLOUD_NAME: "Cloudinary cloud name",
  CLOUDINARY_API_KEY: "Cloudinary API key",
  CLOUDINARY_API_SECRET: "Cloudinary API secret",

  // AI
  GEMINI_API_KEY: "Google Gemini API key",

  // App
  NEXT_PUBLIC_API_URL: "Public API URL",
};

const optionalEnvVars = {
  // Shipping
  SHIPROCKET_EMAIL: "Shiprocket account email",
  SHIPROCKET_PASSWORD: "Shiprocket account password",

  // WhatsApp
  WATI_API_KEY: "WATI API key",
  WATI_API_URL: "WATI API URL",

  // Analytics
  NEXT_PUBLIC_GA_ID: "Google Analytics ID",

  // Monitoring
  SENTRY_DSN: "Sentry DSN for error tracking",
};

export function validateEnv() {
  console.log("🔍 Validating environment variables...");

  const missing = [];
  const warnings = [];

  // Check required variables
  for (const [key, description] of Object.entries(requiredEnvVars)) {
    if (!process.env[key]) {
      missing.push(`  ❌ ${key} - ${description}`);
    } else {
      console.log(`  ✅ ${key}`);
    }
  }

  // Check optional variables
  for (const [key, description] of Object.entries(optionalEnvVars)) {
    if (!process.env[key]) {
      warnings.push(`  ⚠️  ${key} - ${description} (optional)`);
    } else {
      console.log(`  ✅ ${key}`);
    }
  }

  // Report results
  if (missing.length > 0) {
    console.error("\n❌ Missing required environment variables:\n");
    console.error(missing.join("\n"));
    console.error("\nPlease add these to your .env.local file\n");

    // In production, throw error
    if (process.env.NODE_ENV === "production") {
      throw new Error("Missing required environment variables");
    }

    // In development, just warn
    console.warn("⚠️  Running in development mode with missing variables\n");
  }

  if (warnings.length > 0) {
    console.warn("\n⚠️  Optional environment variables not set:\n");
    console.warn(warnings.join("\n"));
    console.warn("\nSome features may not work without these\n");
  }

  if (missing.length === 0 && warnings.length === 0) {
    console.log("\n✅ All environment variables are properly configured!\n");
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
}

// Auto-validate on import in development
if (process.env.NODE_ENV !== "production") {
  validateEnv();
}
```

### Step 2: Create .env.example

**File:** `.env.example` (NEW FILE)

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/onlineplanet

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this

# Email Configuration
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=info@onlineplanet.ae
SMTP_PASS=your-email-password
SMTP_FROM=info@onlineplanet.ae

# Payment Gateway
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your-razorpay-secret

# Cloud Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# AI Services
GEMINI_API_KEY=your-gemini-api-key

# Application
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development

# Optional Services
SHIPROCKET_EMAIL=your-shiprocket-email
SHIPROCKET_PASSWORD=your-shiprocket-password
WATI_API_KEY=your-wati-key
WATI_API_URL=https://live-server.wati.io
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### Step 3: Import in Layout

**File:** `src/app/layout.jsx`

Add at the top:

```javascript
import { validateEnv } from "@/lib/config/validateEnv";

// Validate environment variables on startup
if (process.env.NODE_ENV !== "production") {
  validateEnv();
}
```

### Step 4: Test

```bash
# Temporarily rename .env.local to test
mv .env.local .env.local.backup

# Run dev server - should show missing variables
npm run dev

# Restore .env.local
mv .env.local.backup .env.local
```

---

## 📝 VERIFICATION CHECKLIST

After implementing all fixes, verify:

- [ ] Page source shows proper `<title>` and meta tags
- [ ] Product creation requires authentication
- [ ] Only one database connection file exists
- [ ] Login rate limit triggers after 5 attempts
- [ ] Environment validation runs on startup
- [ ] All tests pass
- [ ] No console errors in browser
- [ ] No server errors in terminal

---

## 🚀 DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] All environment variables set in production
- [ ] Rate limiting tested under load
- [ ] Database indexes created
- [ ] Error monitoring configured
- [ ] Backup strategy in place
- [ ] Security headers verified
- [ ] SSL certificate active
- [ ] Domain DNS configured

---

## 📞 NEED HELP?

If you encounter issues:

1. Check the main CODEBASE_ANALYSIS.md for detailed explanations
2. Review the QUICK_FIXES_CHECKLIST.md for priorities
3. Search for similar issues in the codebase
4. Create an issue with error details

---

**Document Version:** 1.0  
**Last Updated:** December 23, 2025
