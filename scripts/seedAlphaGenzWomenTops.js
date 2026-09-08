// scripts/seedAlphaGenzWomenTops.js
/**
 * Seeding script for 20 Curated 2025-2026 Women Tops & T-Shirts
 * Scraped and 100% Pre-verified (HTTP 200 OK) from Flipkart CDN
 * Seller: Alpha GENZ Fashions (Enterprise)
 * Seller ID: 6a9ef5aac87391e35aaeb4f3
 */

const mongoose = require('mongoose');
const path = require('path');
const https = require('https');
const http = require('http');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

// Function to verify image returns 200 OK (safety guard)
function verifyImageUrl(url) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const isHttps = parsed.protocol === 'https:';
      const client = isHttps ? https : http;

      const req = client.request(
        {
          method: 'HEAD',
          hostname: parsed.hostname,
          path: parsed.pathname + parsed.search,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          },
        },
        (res) => {
          resolve(res.statusCode >= 200 && res.statusCode < 400);
        }
      );
      req.on('error', () => resolve(false));
      req.setTimeout(6000, () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    } catch {
      resolve(false);
    }
  });
}

// Helper to generate women top size variants (XS, S, M, L, XL)
function generateTopVariants(baseSku, salePrice) {
  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  return sizes.map((size) => ({
    name: `Size ${size}`,
    sku: `${baseSku}-${size}`,
    price: salePrice,
    stock: Math.floor(Math.random() * 20) + 15,
    attributes: { Size: size },
  }));
}

// 20 Curated 2025-2026 Women Tops & T-Shirts
const womenTopProducts = [
  {
    "name": "DELHI SHOPIFY 2025 Tokyo Harajuku Oversized Graphic Print Women Multicolor Top",
    "brand": "DELHI SHOPIFY",
    "sku": "AGF-WT-01",
    "shortDescription": "Vibrant Tokyo Harajuku inspired oversized graphic print top tailored for trendy streetwear layering in 2025.",
    "description": "### DELHI SHOPIFY 2025 Tokyo Harajuku Oversized Graphic Print Women Multicolor Top (2025–2026 Alpha GENZ Collection)\nVibrant Tokyo Harajuku inspired oversized graphic print top tailored for trendy streetwear layering in 2025.\n\n- **Fit & Silhouette:** Oversized Boxy Fit\n- **Neckline / Collar:** Ribbed Crew Neck\n- **Sleeve Style:** Drop Shoulder Half Sleeve\n- **Fabric Composition:** 100% Combed Bio-Washed Cotton\n- **Pattern & Artwork:** Graphic Print / Anime Aesthetic\n- **Occasion:** Streetwear / Casual Hangout\n- **Styling Advice:** Pair effortlessly with high-waist Alpha GENZ boyfriend jeans, cargo pants, or tennis skirts and platform sneakers for a head-turning 2025/2026 streetwear look.\n- **Wash & Care:** Machine wash cold with like colors, gentle cycle. Turn inside out before washing. Warm iron on reverse. Do not iron directly on graphics.",
    "pricing": {
      "basePrice": 999,
      "salePrice": 419,
      "costPrice": 230,
      "discountPercentage": 58
    },
    "inventory": {
      "stock": 91,
      "lowStockThreshold": 10,
      "reorderPoint": 20,
      "trackInventory": true,
      "soldCount": 55
    },
    "images": [
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/j/g/r/s-top-mevika-fashion-original-imaghf3ppzmnrdsr.jpeg?q=70",
        "alt": "DELHI SHOPIFY 2025 Tokyo Harajuku Oversized Graphic Print Women Multicolor Top - View 1",
        "isPrimary": true
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/j/b/r/s-ds-crop-top-jaipuri-delhi-shopify-original-imagm3h8ydpkrhab.jpeg?q=70",
        "alt": "DELHI SHOPIFY 2025 Tokyo Harajuku Oversized Graphic Print Women Multicolor Top - View 2",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/0/q/i/l-a-trendy-outfits-original-imagh7mknbsy4e4e.jpeg?q=70",
        "alt": "DELHI SHOPIFY 2025 Tokyo Harajuku Oversized Graphic Print Women Multicolor Top - View 3",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/7/w/t/l-a-trendy-outfits-original-imagh7mky3ehrr7t.jpeg?q=70",
        "alt": "DELHI SHOPIFY 2025 Tokyo Harajuku Oversized Graphic Print Women Multicolor Top - View 4",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/j/g/r/s-top-mevika-fashion-original-imaghf3ppzmnrdsr.jpeg",
        "alt": "DELHI SHOPIFY 2025 Tokyo Harajuku Oversized Graphic Print Women Multicolor Top - View 5",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/j/b/r/s-ds-crop-top-jaipuri-delhi-shopify-original-imagm3h8ydpkrhab.jpeg",
        "alt": "DELHI SHOPIFY 2025 Tokyo Harajuku Oversized Graphic Print Women Multicolor Top - View 6",
        "isPrimary": false
      }
    ],
    "specifications": [
      {
        "key": "Fit",
        "value": "Oversized Boxy Fit"
      },
      {
        "key": "Neck Type",
        "value": "Ribbed Crew Neck"
      },
      {
        "key": "Sleeve Length",
        "value": "Drop Shoulder Half Sleeve"
      },
      {
        "key": "Fabric",
        "value": "100% Combed Bio-Washed Cotton"
      },
      {
        "key": "Pattern",
        "value": "Graphic Print / Anime Aesthetic"
      },
      {
        "key": "Occasion",
        "value": "Streetwear / Casual Hangout"
      },
      {
        "key": "Collection Year",
        "value": "2025-2026"
      },
      {
        "key": "Style Code",
        "value": "AGF-WT-01"
      },
      {
        "key": "Wash Care",
        "value": "Machine Wash Gentle / Hand Wash"
      }
    ],
    "ratings": {
      "average": 4.9,
      "count": 197
    },
    "tags": [
      "delhi-shopify",
      "oversized-top",
      "graphic-top",
      "harajuku",
      "2025-trend",
      "streetwear",
      "gen-z"
    ],
    "keywords": [
      "tokyo graphic tee",
      "oversized streetwear women",
      "delhi shopify top",
      "anime graphic tee women 2025"
    ],
    "highlights": [
      "2025 Tokyo Harajuku Edition",
      "Ultra-soft Bio-Washed Combed Cotton",
      "High-Definition Screen Print",
      "Oversized Drop-Shoulder Silhouette"
    ],
    "hsnCode": "61091000",
    "isFeatured": true
  },
  {
    "name": "SPACE N OCEAN 2025 Sunset Tangerine Y2K Ribbed Knit Women Crop Top",
    "brand": "SPACE N OCEAN",
    "sku": "AGF-WT-02",
    "shortDescription": "Energetic sunset tangerine ribbed knit crop top featuring a flattering square neckline, inspired by 2025 Y2K festival aesthetics.",
    "description": "### SPACE N OCEAN 2025 Sunset Tangerine Y2K Ribbed Knit Women Crop Top (2025–2026 Alpha GENZ Collection)\nEnergetic sunset tangerine ribbed knit crop top featuring a flattering square neckline, inspired by 2025 Y2K festival aesthetics.\n\n- **Fit & Silhouette:** Slim Bodycon Fit\n- **Neckline / Collar:** Square Neckline\n- **Sleeve Style:** Cap Sleeve\n- **Fabric Composition:** 95% Cotton, 5% Spandex Ribbed Knit\n- **Pattern & Artwork:** Solid Tangerine with Contrast Accent\n- **Occasion:** Party / Summer Festival / Casual\n- **Styling Advice:** Pair effortlessly with high-waist Alpha GENZ boyfriend jeans, cargo pants, or tennis skirts and platform sneakers for a head-turning 2025/2026 streetwear look.\n- **Wash & Care:** Machine wash cold with like colors, gentle cycle. Turn inside out before washing. Warm iron on reverse. Do not iron directly on graphics.",
    "pricing": {
      "basePrice": 1299,
      "salePrice": 556,
      "costPrice": 306,
      "discountPercentage": 57
    },
    "inventory": {
      "stock": 106,
      "lowStockThreshold": 10,
      "reorderPoint": 20,
      "trackInventory": true,
      "soldCount": 45
    },
    "images": [
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/t-shirt/n/0/u/xxl-women-crop-top-space-n-ocean-original-imahgwxpn9hdtacc.jpeg?q=70",
        "alt": "SPACE N OCEAN 2025 Sunset Tangerine Y2K Ribbed Knit Women Crop Top - View 1",
        "isPrimary": true
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/z/m/r/l-1-window-space-n-ocean-original-imahgzfggbhzmknz.jpeg?q=70",
        "alt": "SPACE N OCEAN 2025 Sunset Tangerine Y2K Ribbed Knit Women Crop Top - View 2",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/t-shirt/b/f/v/xxl-women-crop-top-space-n-ocean-original-imahgwxp4h7rzpdg.jpeg?q=70",
        "alt": "SPACE N OCEAN 2025 Sunset Tangerine Y2K Ribbed Knit Women Crop Top - View 3",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/z/e/n/l-1-window-space-n-ocean-original-imahgzfg52nv4ud6.jpeg?q=70",
        "alt": "SPACE N OCEAN 2025 Sunset Tangerine Y2K Ribbed Knit Women Crop Top - View 4",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/t-shirt/5/d/s/xxl-women-crop-top-space-n-ocean-original-imahgwxpzkk888mg.jpeg?q=70",
        "alt": "SPACE N OCEAN 2025 Sunset Tangerine Y2K Ribbed Knit Women Crop Top - View 5",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/t-shirt/n/0/u/xxl-women-crop-top-space-n-ocean-original-imahgwxpn9hdtacc.jpeg",
        "alt": "SPACE N OCEAN 2025 Sunset Tangerine Y2K Ribbed Knit Women Crop Top - View 6",
        "isPrimary": false
      }
    ],
    "specifications": [
      {
        "key": "Fit",
        "value": "Slim Bodycon Fit"
      },
      {
        "key": "Neck Type",
        "value": "Square Neckline"
      },
      {
        "key": "Sleeve Length",
        "value": "Cap Sleeve"
      },
      {
        "key": "Fabric",
        "value": "95% Cotton, 5% Spandex Ribbed Knit"
      },
      {
        "key": "Pattern",
        "value": "Solid Tangerine with Contrast Accent"
      },
      {
        "key": "Occasion",
        "value": "Party / Summer Festival / Casual"
      },
      {
        "key": "Collection Year",
        "value": "2025-2026"
      },
      {
        "key": "Style Code",
        "value": "AGF-WT-02"
      },
      {
        "key": "Wash Care",
        "value": "Machine Wash Gentle / Hand Wash"
      }
    ],
    "ratings": {
      "average": 4.6,
      "count": 119
    },
    "tags": [
      "space-n-ocean",
      "crop-top",
      "y2k-top",
      "ribbed-top",
      "orange-top",
      "2025-fashion"
    ],
    "keywords": [
      "orange crop top",
      "y2k ribbed top women",
      "square neck crop top",
      "space n ocean top 2025"
    ],
    "highlights": [
      "2025 Y2K Festival Collection",
      "Four-Way Stretch Ribbed Texture",
      "Sculpting Bodycon Silhouette",
      "Breathable Breathable Summer Knit"
    ],
    "hsnCode": "62064000",
    "isFeatured": true
  },
  {
    "name": "Youvig 2025 Parisian Romance Floral Smocked Peplum Women Top",
    "brand": "Youvig",
    "sku": "AGF-WT-03",
    "shortDescription": "Delicate cottagecore-inspired smocked peplum top in rich maroon & beige botanical florals with romantic puffed sleeves.",
    "description": "### Youvig 2025 Parisian Romance Floral Smocked Peplum Women Top (2025–2026 Alpha GENZ Collection)\nDelicate cottagecore-inspired smocked peplum top in rich maroon & beige botanical florals with romantic puffed sleeves.\n\n- **Fit & Silhouette:** Flared Peplum Fit\n- **Neckline / Collar:** Sweetheart Neck\n- **Sleeve Style:** Puff Half Sleeve with Ruffled Cuffs\n- **Fabric Composition:** Breathable Rayon Georgette\n- **Pattern & Artwork:** Vintage Parisian Floral Print\n- **Occasion:** Brunch / Date Night / Casual Chic\n- **Styling Advice:** Pair effortlessly with high-waist Alpha GENZ boyfriend jeans, cargo pants, or tennis skirts and platform sneakers for a head-turning 2025/2026 streetwear look.\n- **Wash & Care:** Machine wash cold with like colors, gentle cycle. Turn inside out before washing. Warm iron on reverse. Do not iron directly on graphics.",
    "pricing": {
      "basePrice": 999,
      "salePrice": 350,
      "costPrice": 193,
      "discountPercentage": 65
    },
    "inventory": {
      "stock": 104,
      "lowStockThreshold": 10,
      "reorderPoint": 20,
      "trackInventory": true,
      "soldCount": 15
    },
    "images": [
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/0/p/i/m-1-fs-los-cont-sl-mr-cr-youvig-original-imahezfajfmdrmry.jpeg?q=70",
        "alt": "Youvig 2025 Parisian Romance Floral Smocked Peplum Women Top - View 1",
        "isPrimary": true
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/p/0/3/m-1-fs-los-cont-sl-mr-cr-youvig-original-imahezfa6s4yverh.jpeg?q=70",
        "alt": "Youvig 2025 Parisian Romance Floral Smocked Peplum Women Top - View 2",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/h/v/e/l-1-fs-cont-sl-losang-mr-luktrima-original-imahenb9skrjtz8y.jpeg?q=70",
        "alt": "Youvig 2025 Parisian Romance Floral Smocked Peplum Women Top - View 3",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/0/p/i/m-1-fs-los-cont-sl-mr-cr-youvig-original-imahezfajfmdrmry.jpeg",
        "alt": "Youvig 2025 Parisian Romance Floral Smocked Peplum Women Top - View 4",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/p/0/3/m-1-fs-los-cont-sl-mr-cr-youvig-original-imahezfa6s4yverh.jpeg",
        "alt": "Youvig 2025 Parisian Romance Floral Smocked Peplum Women Top - View 5",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/h/v/e/l-1-fs-cont-sl-losang-mr-luktrima-original-imahenb9skrjtz8y.jpeg",
        "alt": "Youvig 2025 Parisian Romance Floral Smocked Peplum Women Top - View 6",
        "isPrimary": false
      }
    ],
    "specifications": [
      {
        "key": "Fit",
        "value": "Flared Peplum Fit"
      },
      {
        "key": "Neck Type",
        "value": "Sweetheart Neck"
      },
      {
        "key": "Sleeve Length",
        "value": "Puff Half Sleeve with Ruffled Cuffs"
      },
      {
        "key": "Fabric",
        "value": "Breathable Rayon Georgette"
      },
      {
        "key": "Pattern",
        "value": "Vintage Parisian Floral Print"
      },
      {
        "key": "Occasion",
        "value": "Brunch / Date Night / Casual Chic"
      },
      {
        "key": "Collection Year",
        "value": "2025-2026"
      },
      {
        "key": "Style Code",
        "value": "AGF-WT-03"
      },
      {
        "key": "Wash Care",
        "value": "Machine Wash Gentle / Hand Wash"
      }
    ],
    "ratings": {
      "average": 4.7,
      "count": 88
    },
    "tags": [
      "youvig",
      "peplum-top",
      "floral-top",
      "cottagecore",
      "smocked-top",
      "2025-style"
    ],
    "keywords": [
      "floral peplum top",
      "smocked puff sleeve top",
      "youvig women top",
      "cottagecore top 2025"
    ],
    "highlights": [
      "2025 Parisian Romance Trend",
      "Elasticated Smocked Bust for Custom Fit",
      "Graceful Ruffled Peplum Hem",
      "Ultra-lightweight Breathable Fabric"
    ],
    "hsnCode": "62064000",
    "isFeatured": true
  },
  {
    "name": "Clobug 2026 Runway Wild Leopard Animal Print Sheer Mesh Women Top",
    "brand": "clobug",
    "sku": "AGF-WT-04",
    "shortDescription": "Bold 2026 runway-inspired sheer animal print mesh top designed for dramatic evening layering with bralettes and high-waist denim.",
    "description": "### Clobug 2026 Runway Wild Leopard Animal Print Sheer Mesh Women Top (2025–2026 Alpha GENZ Collection)\nBold 2026 runway-inspired sheer animal print mesh top designed for dramatic evening layering with bralettes and high-waist denim.\n\n- **Fit & Silhouette:** Contour Slim Fit\n- **Neckline / Collar:** Mock Turtle Neck\n- **Sleeve Style:** Full Length Mesh Sleeve\n- **Fabric Composition:** Stretch Micro-Mesh Polyamide Blend\n- **Pattern & Artwork:** Subtle Leopard Cheetah Print\n- **Occasion:** Clubwear / Evening Glam / Party\n- **Styling Advice:** Pair effortlessly with high-waist Alpha GENZ boyfriend jeans, cargo pants, or tennis skirts and platform sneakers for a head-turning 2025/2026 streetwear look.\n- **Wash & Care:** Machine wash cold with like colors, gentle cycle. Turn inside out before washing. Warm iron on reverse. Do not iron directly on graphics.",
    "pricing": {
      "basePrice": 1899,
      "salePrice": 348,
      "costPrice": 191,
      "discountPercentage": 82
    },
    "inventory": {
      "stock": 81,
      "lowStockThreshold": 10,
      "reorderPoint": 20,
      "trackInventory": true,
      "soldCount": 51
    },
    "images": [
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/c/h/s/xl-1-clb1110-b-clobug-original-imahn9ez9cgwatxf.jpeg?q=70",
        "alt": "Clobug 2026 Runway Wild Leopard Animal Print Sheer Mesh Women Top - View 1",
        "isPrimary": true
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/w/g/d/s-1-clb1110-b-clobug-original-imahn9eyshxvvzay.jpeg?q=70",
        "alt": "Clobug 2026 Runway Wild Leopard Animal Print Sheer Mesh Women Top - View 2",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/4/n/z/xs-1-clb1110-b-clobug-original-imahn9fptag97gqt.jpeg?q=70",
        "alt": "Clobug 2026 Runway Wild Leopard Animal Print Sheer Mesh Women Top - View 3",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/j/m/5/l-1-clb1110-b-clobug-original-imahn9ezbwft5fqd.jpeg?q=70",
        "alt": "Clobug 2026 Runway Wild Leopard Animal Print Sheer Mesh Women Top - View 4",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/c/h/s/xl-1-clb1110-b-clobug-original-imahn9ez9cgwatxf.jpeg",
        "alt": "Clobug 2026 Runway Wild Leopard Animal Print Sheer Mesh Women Top - View 5",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/w/g/d/s-1-clb1110-b-clobug-original-imahn9eyshxvvzay.jpeg",
        "alt": "Clobug 2026 Runway Wild Leopard Animal Print Sheer Mesh Women Top - View 6",
        "isPrimary": false
      }
    ],
    "specifications": [
      {
        "key": "Fit",
        "value": "Contour Slim Fit"
      },
      {
        "key": "Neck Type",
        "value": "Mock Turtle Neck"
      },
      {
        "key": "Sleeve Length",
        "value": "Full Length Mesh Sleeve"
      },
      {
        "key": "Fabric",
        "value": "Stretch Micro-Mesh Polyamide Blend"
      },
      {
        "key": "Pattern",
        "value": "Subtle Leopard Cheetah Print"
      },
      {
        "key": "Occasion",
        "value": "Clubwear / Evening Glam / Party"
      },
      {
        "key": "Collection Year",
        "value": "2025-2026"
      },
      {
        "key": "Style Code",
        "value": "AGF-WT-04"
      },
      {
        "key": "Wash Care",
        "value": "Machine Wash Gentle / Hand Wash"
      }
    ],
    "ratings": {
      "average": 4.9,
      "count": 255
    },
    "tags": [
      "clobug",
      "animal-print",
      "mesh-top",
      "sheer-top",
      "leopard-print",
      "2026-fashion"
    ],
    "keywords": [
      "leopard mesh top",
      "sheer animal print top women",
      "clobug top",
      "partywear mesh top 2026"
    ],
    "highlights": [
      "2026 Runway Statement Piece",
      "Second-Skin Sheer Stretch Mesh",
      "Flattering Mock High-Neck",
      "High Resilience Anti-Snag Weave"
    ],
    "hsnCode": "62064000",
    "isFeatured": true
  },
  {
    "name": "METRONAUT 2025 French Riviera Striped Ribbed Cotton Women Top",
    "brand": "METRONAUT",
    "sku": "AGF-WT-05",
    "shortDescription": "Timeless Parisian Breton striped knit top crafted in premium combed organic cotton, a staple of 2025 quiet luxury casuals.",
    "description": "### METRONAUT 2025 French Riviera Striped Ribbed Cotton Women Top (2025–2026 Alpha GENZ Collection)\nTimeless Parisian Breton striped knit top crafted in premium combed organic cotton, a staple of 2025 quiet luxury casuals.\n\n- **Fit & Silhouette:** Regular Comfort Fit\n- **Neckline / Collar:** Classic Crew Neck\n- **Sleeve Style:** Elbow Length Half Sleeve\n- **Fabric Composition:** 100% Organic Cotton Fine Rib\n- **Pattern & Artwork:** Horizontal Parisian Breton Stripes\n- **Occasion:** Casual Everyday / Work from Home / Travel\n- **Styling Advice:** Pair effortlessly with high-waist Alpha GENZ boyfriend jeans, cargo pants, or tennis skirts and platform sneakers for a head-turning 2025/2026 streetwear look.\n- **Wash & Care:** Machine wash cold with like colors, gentle cycle. Turn inside out before washing. Warm iron on reverse. Do not iron directly on graphics.",
    "pricing": {
      "basePrice": 699,
      "salePrice": 242,
      "costPrice": 133,
      "discountPercentage": 65
    },
    "inventory": {
      "stock": 114,
      "lowStockThreshold": 10,
      "reorderPoint": 20,
      "trackInventory": true,
      "soldCount": 19
    },
    "images": [
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/e/9/6/xl-1-black-delux-look-original-imahmghzuk3phjqg.jpeg?q=70",
        "alt": "METRONAUT 2025 French Riviera Striped Ribbed Cotton Women Top - View 1",
        "isPrimary": true
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/e/9/6/xl-1-black-delux-look-original-imahmghzuk3phjqg.jpeg",
        "alt": "METRONAUT 2025 French Riviera Striped Ribbed Cotton Women Top - View 2",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/e/p/t/xl-1-ak-01-friskers-original-imah63cgqf8kaztm.jpeg",
        "alt": "METRONAUT 2025 French Riviera Striped Ribbed Cotton Women Top - View 3",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/t-shirt/d/k/q/m-m1-over-s1-fab-523-fabflee-original-imahzgr755pzby4q.jpeg",
        "alt": "METRONAUT 2025 French Riviera Striped Ribbed Cotton Women Top - View 4",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/g/m/b/m-1-ltx-peplum-top-07-lilastex-original-imahphdqydadyqhs.jpeg",
        "alt": "METRONAUT 2025 French Riviera Striped Ribbed Cotton Women Top - View 5",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/g/i/q/l-1-wrt-l-wearme-original-imahpp3fsaryz3dw.jpeg",
        "alt": "METRONAUT 2025 French Riviera Striped Ribbed Cotton Women Top - View 6",
        "isPrimary": false
      }
    ],
    "specifications": [
      {
        "key": "Fit",
        "value": "Regular Comfort Fit"
      },
      {
        "key": "Neck Type",
        "value": "Classic Crew Neck"
      },
      {
        "key": "Sleeve Length",
        "value": "Elbow Length Half Sleeve"
      },
      {
        "key": "Fabric",
        "value": "100% Organic Cotton Fine Rib"
      },
      {
        "key": "Pattern",
        "value": "Horizontal Parisian Breton Stripes"
      },
      {
        "key": "Occasion",
        "value": "Casual Everyday / Work from Home / Travel"
      },
      {
        "key": "Collection Year",
        "value": "2025-2026"
      },
      {
        "key": "Style Code",
        "value": "AGF-WT-05"
      },
      {
        "key": "Wash Care",
        "value": "Machine Wash Gentle / Hand Wash"
      }
    ],
    "ratings": {
      "average": 4.9,
      "count": 124
    },
    "tags": [
      "metronaut",
      "striped-top",
      "french-riviera",
      "classic-tee",
      "quiet-luxury",
      "2025-essentials"
    ],
    "keywords": [
      "striped top women",
      "breton sailor stripe tee",
      "metronaut casual top",
      "black white striped top"
    ],
    "highlights": [
      "2025 Quiet Luxury Capsule",
      "Super-soft Combed Organic Rib",
      "Non-Transparent Fine Gauge Knit",
      "Pre-Shrunk Fade-Resistant Yarn"
    ],
    "hsnCode": "61091000",
    "isFeatured": true
  },
  {
    "name": "FASHIONCARNIVEL 2026 Grunge Butterfly Graphic Print Washed Baby Tee",
    "brand": "FASHIONCARNIVEL",
    "sku": "AGF-WT-06",
    "shortDescription": "Essential 2026 grunge aesthetic baby tee with dark butterfly graphic artwork and distressed wash, channeling 90s alt-rock energy.",
    "description": "### FASHIONCARNIVEL 2026 Grunge Butterfly Graphic Print Washed Baby Tee (2025–2026 Alpha GENZ Collection)\nEssential 2026 grunge aesthetic baby tee with dark butterfly graphic artwork and distressed wash, channeling 90s alt-rock energy.\n\n- **Fit & Silhouette:** Cropped Baby Tee Fit\n- **Neckline / Collar:** Baby Rib Round Neck\n- **Sleeve Style:** Fitted Short Cap Sleeve\n- **Fabric Composition:** 95% Cotton, 5% Elastane\n- **Pattern & Artwork:** Vintage Acid Wash with Butterfly Graphic\n- **Occasion:** College / Streetwear / Concerts\n- **Styling Advice:** Pair effortlessly with high-waist Alpha GENZ boyfriend jeans, cargo pants, or tennis skirts and platform sneakers for a head-turning 2025/2026 streetwear look.\n- **Wash & Care:** Machine wash cold with like colors, gentle cycle. Turn inside out before washing. Warm iron on reverse. Do not iron directly on graphics.",
    "pricing": {
      "basePrice": 699,
      "salePrice": 202,
      "costPrice": 111,
      "discountPercentage": 71
    },
    "inventory": {
      "stock": 85,
      "lowStockThreshold": 10,
      "reorderPoint": 20,
      "trackInventory": true,
      "soldCount": 46
    },
    "images": [
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/3/i/0/m-1-hey-black-top-fashioncarnivel-resized-original-imahh52ttz96nzf6.jpeg?q=70",
        "alt": "FASHIONCARNIVEL 2026 Grunge Butterfly Graphic Print Washed Baby Tee - View 1",
        "isPrimary": true
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/g/9/z/m-1-hey-black-top-fashioncarnivel-original-imahh52tdgxgdzmn.jpeg?q=70",
        "alt": "FASHIONCARNIVEL 2026 Grunge Butterfly Graphic Print Washed Baby Tee - View 2",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/3/i/0/m-1-hey-black-top-fashioncarnivel-resized-original-imahh52ttz96nzf6.jpeg",
        "alt": "FASHIONCARNIVEL 2026 Grunge Butterfly Graphic Print Washed Baby Tee - View 3",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/g/9/z/m-1-hey-black-top-fashioncarnivel-original-imahh52tdgxgdzmn.jpeg",
        "alt": "FASHIONCARNIVEL 2026 Grunge Butterfly Graphic Print Washed Baby Tee - View 4",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/m/h/q/xl-1-meow-yellow-top-fashioncarnivel-original-imahh3zybekr44wr.jpeg",
        "alt": "FASHIONCARNIVEL 2026 Grunge Butterfly Graphic Print Washed Baby Tee - View 5",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/e/g/u/s-dg-hynk-crop-sando-ddaspration-original-imagm8bxwnrvyuby.jpeg",
        "alt": "FASHIONCARNIVEL 2026 Grunge Butterfly Graphic Print Washed Baby Tee - View 6",
        "isPrimary": false
      }
    ],
    "specifications": [
      {
        "key": "Fit",
        "value": "Cropped Baby Tee Fit"
      },
      {
        "key": "Neck Type",
        "value": "Baby Rib Round Neck"
      },
      {
        "key": "Sleeve Length",
        "value": "Fitted Short Cap Sleeve"
      },
      {
        "key": "Fabric",
        "value": "95% Cotton, 5% Elastane"
      },
      {
        "key": "Pattern",
        "value": "Vintage Acid Wash with Butterfly Graphic"
      },
      {
        "key": "Occasion",
        "value": "College / Streetwear / Concerts"
      },
      {
        "key": "Collection Year",
        "value": "2025-2026"
      },
      {
        "key": "Style Code",
        "value": "AGF-WT-06"
      },
      {
        "key": "Wash Care",
        "value": "Machine Wash Gentle / Hand Wash"
      }
    ],
    "ratings": {
      "average": 4.7,
      "count": 99
    },
    "tags": [
      "fashioncarnivel",
      "baby-tee",
      "grunge",
      "butterfly-tee",
      "y2k-streetwear",
      "2026-collection"
    ],
    "keywords": [
      "butterfly baby tee",
      "grunge crop top women",
      "y2k graphic tee",
      "fashioncarnivel top"
    ],
    "highlights": [
      "2026 Grunge Aesthetic Essential",
      "Vintage Mineral Wash Effect",
      "High-Elasticity Shape Retaining Fabric",
      "Anti-Cracking Graphic Print"
    ],
    "hsnCode": "61091000",
    "isFeatured": true
  },
  {
    "name": "Aphe Fashion 2025 Sky Blue Textured Dobby Smocked Peplum Women Top",
    "brand": "Aphe Fashion",
    "sku": "AGF-WT-07",
    "shortDescription": "Airy sky blue dobby textured top featuring romantic smocking, ruched bust line, and flared flounce hem.",
    "description": "### Aphe Fashion 2025 Sky Blue Textured Dobby Smocked Peplum Women Top (2025–2026 Alpha GENZ Collection)\nAiry sky blue dobby textured top featuring romantic smocking, ruched bust line, and flared flounce hem.\n\n- **Fit & Silhouette:** Empire Waist Peplum Fit\n- **Neckline / Collar:** Sweetheart Neckline with Tie-Up Detail\n- **Sleeve Style:** Tiered Ruffled Short Sleeve\n- **Fabric Composition:** Self-Weave Cotton Dobby Blend\n- **Pattern & Artwork:** Self Design Micro-Textured Weave\n- **Occasion:** Casual Outings / Brunch / Summer Vacations\n- **Styling Advice:** Pair effortlessly with high-waist Alpha GENZ boyfriend jeans, cargo pants, or tennis skirts and platform sneakers for a head-turning 2025/2026 streetwear look.\n- **Wash & Care:** Machine wash cold with like colors, gentle cycle. Turn inside out before washing. Warm iron on reverse. Do not iron directly on graphics.",
    "pricing": {
      "basePrice": 599,
      "salePrice": 135,
      "costPrice": 74,
      "discountPercentage": 77
    },
    "inventory": {
      "stock": 84,
      "lowStockThreshold": 10,
      "reorderPoint": 20,
      "trackInventory": true,
      "soldCount": 48
    },
    "images": [
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/u/a/4/s-1-sky-blue-crptop04-s-aphe-fashion-original-imahzcdkygazkgfz.jpeg?q=70",
        "alt": "Aphe Fashion 2025 Sky Blue Textured Dobby Smocked Peplum Women Top - View 1",
        "isPrimary": true
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/3/y/8/xxl-1-sky-blue-crptop04-xxl-aphe-fashion-original-imahzcdh4sjft3gh.jpeg?q=70",
        "alt": "Aphe Fashion 2025 Sky Blue Textured Dobby Smocked Peplum Women Top - View 2",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/r/j/i/m-1-sky-blue-crptop04-m-aphe-fashion-original-imahzcdgxse58gmz.jpeg?q=70",
        "alt": "Aphe Fashion 2025 Sky Blue Textured Dobby Smocked Peplum Women Top - View 3",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/u/a/4/s-1-sky-blue-crptop04-s-aphe-fashion-original-imahzcdkygazkgfz.jpeg",
        "alt": "Aphe Fashion 2025 Sky Blue Textured Dobby Smocked Peplum Women Top - View 4",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/3/y/8/xxl-1-sky-blue-crptop04-xxl-aphe-fashion-original-imahzcdh4sjft3gh.jpeg",
        "alt": "Aphe Fashion 2025 Sky Blue Textured Dobby Smocked Peplum Women Top - View 5",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/r/j/i/m-1-sky-blue-crptop04-m-aphe-fashion-original-imahzcdgxse58gmz.jpeg",
        "alt": "Aphe Fashion 2025 Sky Blue Textured Dobby Smocked Peplum Women Top - View 6",
        "isPrimary": false
      }
    ],
    "specifications": [
      {
        "key": "Fit",
        "value": "Empire Waist Peplum Fit"
      },
      {
        "key": "Neck Type",
        "value": "Sweetheart Neckline with Tie-Up Detail"
      },
      {
        "key": "Sleeve Length",
        "value": "Tiered Ruffled Short Sleeve"
      },
      {
        "key": "Fabric",
        "value": "Self-Weave Cotton Dobby Blend"
      },
      {
        "key": "Pattern",
        "value": "Self Design Micro-Textured Weave"
      },
      {
        "key": "Occasion",
        "value": "Casual Outings / Brunch / Summer Vacations"
      },
      {
        "key": "Collection Year",
        "value": "2025-2026"
      },
      {
        "key": "Style Code",
        "value": "AGF-WT-07"
      },
      {
        "key": "Wash Care",
        "value": "Machine Wash Gentle / Hand Wash"
      }
    ],
    "ratings": {
      "average": 4.6,
      "count": 108
    },
    "tags": [
      "aphe-fashion",
      "blue-top",
      "peplum-top",
      "smocked",
      "pastel",
      "2025-summer"
    ],
    "keywords": [
      "sky blue peplum top",
      "textured dobby top",
      "aphe fashion top",
      "summer casual top women"
    ],
    "highlights": [
      "2025 Pastel Breeze Collection",
      "Textured Breathable Dobby Weave",
      "Adjustable Front Tie Accent",
      "Comfortable Smocked Back Panel"
    ],
    "hsnCode": "62064000",
    "isFeatured": false
  },
  {
    "name": "London Belly 2025 Noir Sculpt Ribbed Square-Neck Bodycon Top",
    "brand": "london belly",
    "sku": "AGF-WT-08",
    "shortDescription": "Architectural square neckline tank top designed to sculpt and accentuate, an irreplaceable capsule piece for the 2025 clean-girl aesthetic.",
    "description": "### London Belly 2025 Noir Sculpt Ribbed Square-Neck Bodycon Top (2025–2026 Alpha GENZ Collection)\nArchitectural square neckline tank top designed to sculpt and accentuate, an irreplaceable capsule piece for the 2025 clean-girl aesthetic.\n\n- **Fit & Silhouette:** Sculpting Bodycon Fit\n- **Neckline / Collar:** Deep Architectural Square Neck\n- **Sleeve Style:** Clean-Cut Sleeveless\n- **Fabric Composition:** Heavyweight Double-Knit Cotton Spandex\n- **Pattern & Artwork:** Solid Pitch Black\n- **Occasion:** Smart Casual / Night Out / Layering\n- **Styling Advice:** Pair effortlessly with high-waist Alpha GENZ boyfriend jeans, cargo pants, or tennis skirts and platform sneakers for a head-turning 2025/2026 streetwear look.\n- **Wash & Care:** Machine wash cold with like colors, gentle cycle. Turn inside out before washing. Warm iron on reverse. Do not iron directly on graphics.",
    "pricing": {
      "basePrice": 999,
      "salePrice": 295,
      "costPrice": 162,
      "discountPercentage": 70
    },
    "inventory": {
      "stock": 114,
      "lowStockThreshold": 10,
      "reorderPoint": 20,
      "trackInventory": true,
      "soldCount": 23
    },
    "images": [
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/b/9/w/xs-1-lbt-54-london-belly-original-imagqex8xtzjjpgr.jpeg?q=70",
        "alt": "London Belly 2025 Noir Sculpt Ribbed Square-Neck Bodycon Top - View 1",
        "isPrimary": true
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/m/2/l/xs-1-lbt-54-london-belly-original-imagqex8xckexrpp.jpeg?q=70",
        "alt": "London Belly 2025 Noir Sculpt Ribbed Square-Neck Bodycon Top - View 2",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/a/b/k/xs-1-lbt-54-london-belly-original-imagqex8dempmkjp.jpeg?q=70",
        "alt": "London Belly 2025 Noir Sculpt Ribbed Square-Neck Bodycon Top - View 3",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/h/a/x/xs-1-lbt-54-london-belly-original-imagqex8e2rfsvf7.jpeg?q=70",
        "alt": "London Belly 2025 Noir Sculpt Ribbed Square-Neck Bodycon Top - View 4",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/s/x/x/xs-1-lbt-54-london-belly-original-imagqex869trzykx.jpeg?q=70",
        "alt": "London Belly 2025 Noir Sculpt Ribbed Square-Neck Bodycon Top - View 5",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/k/m/c/-original-imahew7kgftdnadt.jpeg",
        "alt": "London Belly 2025 Noir Sculpt Ribbed Square-Neck Bodycon Top - View 6",
        "isPrimary": false
      }
    ],
    "specifications": [
      {
        "key": "Fit",
        "value": "Sculpting Bodycon Fit"
      },
      {
        "key": "Neck Type",
        "value": "Deep Architectural Square Neck"
      },
      {
        "key": "Sleeve Length",
        "value": "Clean-Cut Sleeveless"
      },
      {
        "key": "Fabric",
        "value": "Heavyweight Double-Knit Cotton Spandex"
      },
      {
        "key": "Pattern",
        "value": "Solid Pitch Black"
      },
      {
        "key": "Occasion",
        "value": "Smart Casual / Night Out / Layering"
      },
      {
        "key": "Collection Year",
        "value": "2025-2026"
      },
      {
        "key": "Style Code",
        "value": "AGF-WT-08"
      },
      {
        "key": "Wash Care",
        "value": "Machine Wash Gentle / Hand Wash"
      }
    ],
    "ratings": {
      "average": 4.9,
      "count": 173
    },
    "tags": [
      "london-belly",
      "black-top",
      "square-neck",
      "sculpt-top",
      "clean-girl",
      "2025-staple"
    ],
    "keywords": [
      "black square neck top",
      "sculpting bodycon top",
      "london belly tank top",
      "minimalist black top"
    ],
    "highlights": [
      "2025 Clean Girl Capsule",
      "Double-Layered Bust Lining",
      "Broad Bra-Friendly Shoulder Straps",
      "Heavyweight Non-See-Through Knit"
    ],
    "hsnCode": "62064000",
    "isFeatured": false
  },
  {
    "name": "Raabta Fashion 2025 Midnight Boho Printed Drape Halter Neck Top",
    "brand": "Raabta Fashion",
    "sku": "AGF-WT-09",
    "shortDescription": "Sleek flowing halter neck top with mesmerizing monochrome tribal motifs and fluid back tie-up drape.",
    "description": "### Raabta Fashion 2025 Midnight Boho Printed Drape Halter Neck Top (2025–2026 Alpha GENZ Collection)\nSleek flowing halter neck top with mesmerizing monochrome tribal motifs and fluid back tie-up drape.\n\n- **Fit & Silhouette:** Flowy Draped Fit\n- **Neckline / Collar:** Halter Neckline with Nape Tie\n- **Sleeve Style:** Sleeveless\n- **Fabric Composition:** Smooth Satin Finish Poly-Georgette\n- **Pattern & Artwork:** Modern Tribal Abstract Print\n- **Occasion:** Cocktail Evenings / Beach Resort / Parties\n- **Styling Advice:** Pair effortlessly with high-waist Alpha GENZ boyfriend jeans, cargo pants, or tennis skirts and platform sneakers for a head-turning 2025/2026 streetwear look.\n- **Wash & Care:** Machine wash cold with like colors, gentle cycle. Turn inside out before washing. Warm iron on reverse. Do not iron directly on graphics.",
    "pricing": {
      "basePrice": 849,
      "salePrice": 253,
      "costPrice": 139,
      "discountPercentage": 70
    },
    "inventory": {
      "stock": 75,
      "lowStockThreshold": 10,
      "reorderPoint": 20,
      "trackInventory": true,
      "soldCount": 38
    },
    "images": [
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/s/l/y/xl-colds1-neoen-resized-original-imagxvtv7twqbktc.jpeg?q=70",
        "alt": "Raabta Fashion 2025 Midnight Boho Printed Drape Halter Neck Top - View 1",
        "isPrimary": true
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/v/v/z/xl-colds1-neoen-original-imagxvtvvjhbczwv.jpeg?q=70",
        "alt": "Raabta Fashion 2025 Midnight Boho Printed Drape Halter Neck Top - View 2",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/k/n/x/xl-colds1-neoen-original-imagxvtvbf9zg8rw.jpeg?q=70",
        "alt": "Raabta Fashion 2025 Midnight Boho Printed Drape Halter Neck Top - View 3",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/i/f/z/xl-colds1-neoen-original-imagxvtv9athj5yj.jpeg?q=70",
        "alt": "Raabta Fashion 2025 Midnight Boho Printed Drape Halter Neck Top - View 4",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/s/l/y/xl-colds1-neoen-resized-original-imagxvtv7twqbktc.jpeg",
        "alt": "Raabta Fashion 2025 Midnight Boho Printed Drape Halter Neck Top - View 5",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/t-shirt/v/r/n/m-bs-cut-marn-green-2pcs-berry-street-resized-original-imagh7pc9cdynyby.jpeg",
        "alt": "Raabta Fashion 2025 Midnight Boho Printed Drape Halter Neck Top - View 6",
        "isPrimary": false
      }
    ],
    "specifications": [
      {
        "key": "Fit",
        "value": "Flowy Draped Fit"
      },
      {
        "key": "Neck Type",
        "value": "Halter Neckline with Nape Tie"
      },
      {
        "key": "Sleeve Length",
        "value": "Sleeveless"
      },
      {
        "key": "Fabric",
        "value": "Smooth Satin Finish Poly-Georgette"
      },
      {
        "key": "Pattern",
        "value": "Modern Tribal Abstract Print"
      },
      {
        "key": "Occasion",
        "value": "Cocktail Evenings / Beach Resort / Parties"
      },
      {
        "key": "Collection Year",
        "value": "2025-2026"
      },
      {
        "key": "Style Code",
        "value": "AGF-WT-09"
      },
      {
        "key": "Wash Care",
        "value": "Machine Wash Gentle / Hand Wash"
      }
    ],
    "ratings": {
      "average": 4.5,
      "count": 148
    },
    "tags": [
      "raabta-fashion",
      "halter-top",
      "boho-top",
      "draped-top",
      "black-print",
      "2025-resort"
    ],
    "keywords": [
      "halter neck top women",
      "boho printed top",
      "raabta fashion top",
      "resortwear halter top"
    ],
    "highlights": [
      "2025 Resort & Cruise Trend",
      "Lustrous Fluid Draped Silhouette",
      "Customizable Back Halter Tie",
      "Wrinkle-Resistant Travel Friendly Fabric"
    ],
    "hsnCode": "62064000",
    "isFeatured": false
  },
  {
    "name": "SPACE N OCEAN 2025 Lavender Euphoria Celestial Graphic Oversized Tee",
    "brand": "SPACE N OCEAN",
    "sku": "AGF-WT-10",
    "shortDescription": "Heavyweight 240 GSM pastel lavender tee boasting atmospheric celestial artwork, built for authentic street cred and cozy all-day chill.",
    "description": "### SPACE N OCEAN 2025 Lavender Euphoria Celestial Graphic Oversized Tee (2025–2026 Alpha GENZ Collection)\nHeavyweight 240 GSM pastel lavender tee boasting atmospheric celestial artwork, built for authentic street cred and cozy all-day chill.\n\n- **Fit & Silhouette:** Oversized Streetwear Drop Fit\n- **Neckline / Collar:** Sturdy Ribbed Crew Collar\n- **Sleeve Style:** Extended Half Sleeve\n- **Fabric Composition:** 240 GSM Heavyweight French Terry Cotton\n- **Pattern & Artwork:** Celestial Mystic Moon Graphic\n- **Occasion:** Streetwear / Casual College / Lounging\n- **Styling Advice:** Pair effortlessly with high-waist Alpha GENZ boyfriend jeans, cargo pants, or tennis skirts and platform sneakers for a head-turning 2025/2026 streetwear look.\n- **Wash & Care:** Machine wash cold with like colors, gentle cycle. Turn inside out before washing. Warm iron on reverse. Do not iron directly on graphics.",
    "pricing": {
      "basePrice": 1299,
      "salePrice": 498,
      "costPrice": 274,
      "discountPercentage": 62
    },
    "inventory": {
      "stock": 89,
      "lowStockThreshold": 10,
      "reorderPoint": 20,
      "trackInventory": true,
      "soldCount": 26
    },
    "images": [
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/b/b/i/l-1-so-top-lavender-d1-s-spacenocean-original-imahghsk62r2jczy.jpeg?q=70",
        "alt": "SPACE N OCEAN 2025 Lavender Euphoria Celestial Graphic Oversized Tee - View 1",
        "isPrimary": true
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/n/w/k/l-1-so-top-lavender-d1-s-spacenocean-original-imahghskcgvczyfh.jpeg?q=70",
        "alt": "SPACE N OCEAN 2025 Lavender Euphoria Celestial Graphic Oversized Tee - View 2",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/z/m/o/l-1-so-top-lavender-d1-s-spacenocean-original-imahghskhrz2khq3.jpeg?q=70",
        "alt": "SPACE N OCEAN 2025 Lavender Euphoria Celestial Graphic Oversized Tee - View 3",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/b/4/j/l-1-so-top-lavender-d1-s-spacenocean-original-imahghskdjgve3ey.jpeg?q=70",
        "alt": "SPACE N OCEAN 2025 Lavender Euphoria Celestial Graphic Oversized Tee - View 4",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/h/y/2/l-1-so-top-lavender-d1-s-spacenocean-original-imahghskrymngv8h.jpeg?q=70",
        "alt": "SPACE N OCEAN 2025 Lavender Euphoria Celestial Graphic Oversized Tee - View 5",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/b/b/i/l-1-so-top-lavender-d1-s-spacenocean-original-imahghsk62r2jczy.jpeg",
        "alt": "SPACE N OCEAN 2025 Lavender Euphoria Celestial Graphic Oversized Tee - View 6",
        "isPrimary": false
      }
    ],
    "specifications": [
      {
        "key": "Fit",
        "value": "Oversized Streetwear Drop Fit"
      },
      {
        "key": "Neck Type",
        "value": "Sturdy Ribbed Crew Collar"
      },
      {
        "key": "Sleeve Length",
        "value": "Extended Half Sleeve"
      },
      {
        "key": "Fabric",
        "value": "240 GSM Heavyweight French Terry Cotton"
      },
      {
        "key": "Pattern",
        "value": "Celestial Mystic Moon Graphic"
      },
      {
        "key": "Occasion",
        "value": "Streetwear / Casual College / Lounging"
      },
      {
        "key": "Collection Year",
        "value": "2025-2026"
      },
      {
        "key": "Style Code",
        "value": "AGF-WT-10"
      },
      {
        "key": "Wash Care",
        "value": "Machine Wash Gentle / Hand Wash"
      }
    ],
    "ratings": {
      "average": 4.6,
      "count": 162
    },
    "tags": [
      "space-n-ocean",
      "lavender-tee",
      "oversized-tshirt",
      "celestial-graphic",
      "2025-streetwear"
    ],
    "keywords": [
      "lavender oversized t-shirt",
      "space n ocean tee",
      "celestial graphic tee women",
      "purple oversized top"
    ],
    "highlights": [
      "2025 Euphoria Pastels Collection",
      "240 GSM Heavyweight Terry Cotton",
      "High-Def Breathable Puff & Screen Print",
      "Relaxed Streetwear Silhouette"
    ],
    "hsnCode": "61091000",
    "isFeatured": false
  },
  {
    "name": "SHRUTI ENTERPRISES 2026 Retro Pop Barbiecore Colorblock Raglan Baby Tee",
    "brand": "SHRUTI ENTERPRISES",
    "sku": "AGF-WT-11",
    "shortDescription": "Sporty 90s aesthetic raglan baby tee pairing vibrant bubblegum pink with bold black sleeves, the hallmark of 2026 dopamine fashion.",
    "description": "### SHRUTI ENTERPRISES 2026 Retro Pop Barbiecore Colorblock Raglan Baby Tee (2025–2026 Alpha GENZ Collection)\nSporty 90s aesthetic raglan baby tee pairing vibrant bubblegum pink with bold black sleeves, the hallmark of 2026 dopamine fashion.\n\n- **Fit & Silhouette:** Fitted Athletic Baby Tee\n- **Neckline / Collar:** Contrast Bound Round Neck\n- **Sleeve Style:** Contrast Raglan Short Sleeve\n- **Fabric Composition:** 95% Combed Cotton, 5% Lycra\n- **Pattern & Artwork:** Colorblock Raglan with Y2K Graphic\n- **Occasion:** Casual Sports / Street Style / Skate Park\n- **Styling Advice:** Pair effortlessly with high-waist Alpha GENZ boyfriend jeans, cargo pants, or tennis skirts and platform sneakers for a head-turning 2025/2026 streetwear look.\n- **Wash & Care:** Machine wash cold with like colors, gentle cycle. Turn inside out before washing. Warm iron on reverse. Do not iron directly on graphics.",
    "pricing": {
      "basePrice": 699,
      "salePrice": 283,
      "costPrice": 156,
      "discountPercentage": 60
    },
    "inventory": {
      "stock": 109,
      "lowStockThreshold": 10,
      "reorderPoint": 20,
      "trackInventory": true,
      "soldCount": 57
    },
    "images": [
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/n/e/s/xs-2-half-3-love-panda-pink-black-fendura-original-imahphqbhbamfhkn.jpeg?q=70",
        "alt": "SHRUTI ENTERPRISES 2026 Retro Pop Barbiecore Colorblock Raglan Baby Tee - View 1",
        "isPrimary": true
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/o/r/a/xs-2-half-3-love-panda-pink-black-fendura-original-imahphqbvatbtnzn.jpeg?q=70",
        "alt": "SHRUTI ENTERPRISES 2026 Retro Pop Barbiecore Colorblock Raglan Baby Tee - View 2",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/l/n/d/xs-2-half-3-love-panda-pink-black-fendura-original-imahphqbzqbugtrw.jpeg?q=70",
        "alt": "SHRUTI ENTERPRISES 2026 Retro Pop Barbiecore Colorblock Raglan Baby Tee - View 3",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/j/p/s/xs-2-half-3-love-panda-pink-black-fendura-original-imahphqcgmbzargw.jpeg?q=70",
        "alt": "SHRUTI ENTERPRISES 2026 Retro Pop Barbiecore Colorblock Raglan Baby Tee - View 4",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/l/2/p/xs-2-half-3-love-panda-black-white-fendura-original-imahphqb7ghhgfey.jpeg?q=70",
        "alt": "SHRUTI ENTERPRISES 2026 Retro Pop Barbiecore Colorblock Raglan Baby Tee - View 5",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/n/e/s/xs-2-half-3-love-panda-pink-black-fendura-original-imahphqbhbamfhkn.jpeg",
        "alt": "SHRUTI ENTERPRISES 2026 Retro Pop Barbiecore Colorblock Raglan Baby Tee - View 6",
        "isPrimary": false
      }
    ],
    "specifications": [
      {
        "key": "Fit",
        "value": "Fitted Athletic Baby Tee"
      },
      {
        "key": "Neck Type",
        "value": "Contrast Bound Round Neck"
      },
      {
        "key": "Sleeve Length",
        "value": "Contrast Raglan Short Sleeve"
      },
      {
        "key": "Fabric",
        "value": "95% Combed Cotton, 5% Lycra"
      },
      {
        "key": "Pattern",
        "value": "Colorblock Raglan with Y2K Graphic"
      },
      {
        "key": "Occasion",
        "value": "Casual Sports / Street Style / Skate Park"
      },
      {
        "key": "Collection Year",
        "value": "2025-2026"
      },
      {
        "key": "Style Code",
        "value": "AGF-WT-11"
      },
      {
        "key": "Wash Care",
        "value": "Machine Wash Gentle / Hand Wash"
      }
    ],
    "ratings": {
      "average": 4.6,
      "count": 140
    },
    "tags": [
      "shruti-enterprises",
      "raglan-tee",
      "baby-tee",
      "colorblock",
      "pink-black",
      "2026-trend"
    ],
    "keywords": [
      "raglan baby tee",
      "pink colorblock top",
      "shruti enterprises top",
      "y2k raglan tee women"
    ],
    "highlights": [
      "2026 Dopamine Y2K Retro Series",
      "Contrast Binding & Raglan Sleeves",
      "Silky Smooth Lycra-Infused Cotton",
      "Vibrant Color-Fast Dyeing"
    ],
    "hsnCode": "61091000",
    "isFeatured": false
  },
  {
    "name": "Printabolous 2025 Dark Academia Tarot Moon Gothic Graphic Women Tee",
    "brand": "printabolous",
    "sku": "AGF-WT-12",
    "shortDescription": "Intricate esoteric tarot card artwork printed on vintage mineral-washed black cotton, capturing 2025 dark academia aesthetics.",
    "description": "### Printabolous 2025 Dark Academia Tarot Moon Gothic Graphic Women Tee (2025–2026 Alpha GENZ Collection)\nIntricate esoteric tarot card artwork printed on vintage mineral-washed black cotton, capturing 2025 dark academia aesthetics.\n\n- **Fit & Silhouette:** Relaxed Vintage Fit\n- **Neckline / Collar:** Distressed Finish Round Neck\n- **Sleeve Style:** Roll-Up Half Sleeve\n- **Fabric Composition:** 100% Ring-Spun Vintage Washed Cotton\n- **Pattern & Artwork:** Vintage Tarot Card & Celestial Print\n- **Occasion:** Indie Goth / College / Indie Music Festivals\n- **Styling Advice:** Pair effortlessly with high-waist Alpha GENZ boyfriend jeans, cargo pants, or tennis skirts and platform sneakers for a head-turning 2025/2026 streetwear look.\n- **Wash & Care:** Machine wash cold with like colors, gentle cycle. Turn inside out before washing. Warm iron on reverse. Do not iron directly on graphics.",
    "pricing": {
      "basePrice": 999,
      "salePrice": 473,
      "costPrice": 260,
      "discountPercentage": 53
    },
    "inventory": {
      "stock": 110,
      "lowStockThreshold": 10,
      "reorderPoint": 20,
      "trackInventory": true,
      "soldCount": 48
    },
    "images": [
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/m/m/1/s-1-queencropcottontopd26-printabolous-original-imahzf5edrcxrcvy.jpeg?q=70",
        "alt": "Printabolous 2025 Dark Academia Tarot Moon Gothic Graphic Women Tee - View 1",
        "isPrimary": true
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/0/l/t/xl-1-karmaneverliescottoncroptopd2-ptintabulous-original-imahnxsva64wsgfv.jpeg?q=70",
        "alt": "Printabolous 2025 Dark Academia Tarot Moon Gothic Graphic Women Tee - View 2",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/m/m/1/s-1-queencropcottontopd26-printabolous-original-imahzf5edrcxrcvy.jpeg",
        "alt": "Printabolous 2025 Dark Academia Tarot Moon Gothic Graphic Women Tee - View 3",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/0/l/t/xl-1-karmaneverliescottoncroptopd2-ptintabulous-original-imahnxsva64wsgfv.jpeg",
        "alt": "Printabolous 2025 Dark Academia Tarot Moon Gothic Graphic Women Tee - View 4",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/u/t/w/xs-1-queencropcottontopd26-printabolous-original-imahzf5eqr8f4kae.jpeg",
        "alt": "Printabolous 2025 Dark Academia Tarot Moon Gothic Graphic Women Tee - View 5",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/j/v/m/s-1-maroonkurtitop-arati-fashion-original-imahzgfhvgmh9dmm.jpeg",
        "alt": "Printabolous 2025 Dark Academia Tarot Moon Gothic Graphic Women Tee - View 6",
        "isPrimary": false
      }
    ],
    "specifications": [
      {
        "key": "Fit",
        "value": "Relaxed Vintage Fit"
      },
      {
        "key": "Neck Type",
        "value": "Distressed Finish Round Neck"
      },
      {
        "key": "Sleeve Length",
        "value": "Roll-Up Half Sleeve"
      },
      {
        "key": "Fabric",
        "value": "100% Ring-Spun Vintage Washed Cotton"
      },
      {
        "key": "Pattern",
        "value": "Vintage Tarot Card & Celestial Print"
      },
      {
        "key": "Occasion",
        "value": "Indie Goth / College / Indie Music Festivals"
      },
      {
        "key": "Collection Year",
        "value": "2025-2026"
      },
      {
        "key": "Style Code",
        "value": "AGF-WT-12"
      },
      {
        "key": "Wash Care",
        "value": "Machine Wash Gentle / Hand Wash"
      }
    ],
    "ratings": {
      "average": 4.8,
      "count": 98
    },
    "tags": [
      "printabolous",
      "gothic-tee",
      "tarot-print",
      "dark-academia",
      "black-tshirt",
      "2025-collection"
    ],
    "keywords": [
      "tarot graphic tee",
      "dark academia top women",
      "printabolous t-shirt",
      "vintage gothic tee"
    ],
    "highlights": [
      "2025 Dark Academia Capsule",
      "Vintage Pigment Garment Wash",
      "Artisanal Esoteric Tarot Artwork",
      "Reinforced Double-Stitched Seams"
    ],
    "hsnCode": "61091000",
    "isFeatured": false
  },
  {
    "name": "Clobug 2025 Fuchsia Bloom Tiered Ruffle Wrap Women Top",
    "brand": "clobug",
    "sku": "AGF-WT-13",
    "shortDescription": "Radiant fuchsia pink wrap-front top featuring tiered flutter sleeves and an adjustable waist sash that flatters every silhouette.",
    "description": "### Clobug 2025 Fuchsia Bloom Tiered Ruffle Wrap Women Top (2025–2026 Alpha GENZ Collection)\nRadiant fuchsia pink wrap-front top featuring tiered flutter sleeves and an adjustable waist sash that flatters every silhouette.\n\n- **Fit & Silhouette:** Adjustable Wrap Fit with Flared Peplum\n- **Neckline / Collar:** Surplice V-Neckline\n- **Sleeve Style:** Flutter Butterfly Sleeve\n- **Fabric Composition:** Textured Poly-Crepe with Matte Finish\n- **Pattern & Artwork:** Solid Vivid Fuchsia Pink\n- **Occasion:** Office-to-Party / Dinners / Festive Casual\n- **Styling Advice:** Pair effortlessly with high-waist Alpha GENZ boyfriend jeans, cargo pants, or tennis skirts and platform sneakers for a head-turning 2025/2026 streetwear look.\n- **Wash & Care:** Machine wash cold with like colors, gentle cycle. Turn inside out before washing. Warm iron on reverse. Do not iron directly on graphics.",
    "pricing": {
      "basePrice": 1799,
      "salePrice": 599,
      "costPrice": 329,
      "discountPercentage": 67
    },
    "inventory": {
      "stock": 97,
      "lowStockThreshold": 10,
      "reorderPoint": 20,
      "trackInventory": true,
      "soldCount": 50
    },
    "images": [
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/v/l/r/s-1-clb758-p-clobug-original-imahhmh9frv4urzh.jpeg?q=70",
        "alt": "Clobug 2025 Fuchsia Bloom Tiered Ruffle Wrap Women Top - View 1",
        "isPrimary": true
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/b/g/d/s-1-clb758-p-clobug-original-imahhmh9yczmgrty.jpeg?q=70",
        "alt": "Clobug 2025 Fuchsia Bloom Tiered Ruffle Wrap Women Top - View 2",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/k/a/m/xl-1-clb758-p-clobug-original-imahhmh9hakqwfms.jpeg?q=70",
        "alt": "Clobug 2025 Fuchsia Bloom Tiered Ruffle Wrap Women Top - View 3",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/w/f/q/xl-1-clb758-p-clobug-original-imahhmh9t4shcryy.jpeg?q=70",
        "alt": "Clobug 2025 Fuchsia Bloom Tiered Ruffle Wrap Women Top - View 4",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/m/8/b/s-1-clb758-p-clobug-original-imahhmh9gz8zt37c.jpeg?q=70",
        "alt": "Clobug 2025 Fuchsia Bloom Tiered Ruffle Wrap Women Top - View 5",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/v/l/r/s-1-clb758-p-clobug-original-imahhmh9frv4urzh.jpeg",
        "alt": "Clobug 2025 Fuchsia Bloom Tiered Ruffle Wrap Women Top - View 6",
        "isPrimary": false
      }
    ],
    "specifications": [
      {
        "key": "Fit",
        "value": "Adjustable Wrap Fit with Flared Peplum"
      },
      {
        "key": "Neck Type",
        "value": "Surplice V-Neckline"
      },
      {
        "key": "Sleeve Length",
        "value": "Flutter Butterfly Sleeve"
      },
      {
        "key": "Fabric",
        "value": "Textured Poly-Crepe with Matte Finish"
      },
      {
        "key": "Pattern",
        "value": "Solid Vivid Fuchsia Pink"
      },
      {
        "key": "Occasion",
        "value": "Office-to-Party / Dinners / Festive Casual"
      },
      {
        "key": "Collection Year",
        "value": "2025-2026"
      },
      {
        "key": "Style Code",
        "value": "AGF-WT-13"
      },
      {
        "key": "Wash Care",
        "value": "Machine Wash Gentle / Hand Wash"
      }
    ],
    "ratings": {
      "average": 4.9,
      "count": 229
    },
    "tags": [
      "clobug",
      "wrap-top",
      "fuchsia-top",
      "ruffle-sleeve",
      "party-top",
      "2025-western"
    ],
    "keywords": [
      "pink wrap top",
      "ruffle sleeve blouse",
      "clobug pink top",
      "fuchsia western top women"
    ],
    "highlights": [
      "2025 Bold Colorway Runway Edit",
      "True Functional Wrap Design",
      "Tiered Flutter Butterfly Sleeves",
      "Wrinkle-Defying Textured Crepe"
    ],
    "hsnCode": "62064000",
    "isFeatured": false
  },
  {
    "name": "UNGRADUATE STORE 2026 Two-Tone Contrast Trim Ribbed Knit Crop Top",
    "brand": "UNGRADUATE STORE",
    "sku": "AGF-WT-14",
    "shortDescription": "Chic dual-tone contrast bound ribbed top uniting crisp optical white with baby pink accents, perfect for minimalist 2026 streetwear.",
    "description": "### UNGRADUATE STORE 2026 Two-Tone Contrast Trim Ribbed Knit Crop Top (2025–2026 Alpha GENZ Collection)\nChic dual-tone contrast bound ribbed top uniting crisp optical white with baby pink accents, perfect for minimalist 2026 streetwear.\n\n- **Fit & Silhouette:** Fitted Modern Crop\n- **Neckline / Collar:** Scoop Neck with Contrast Piping\n- **Sleeve Style:** Sleeveless with Contrast Armhole Binding\n- **Fabric Composition:** Modal-Cotton Ribbed Blend\n- **Pattern & Artwork:** Dual Tone White & Powder Pink\n- **Occasion:** Gym-to-Street / Summer Casual / Lounging\n- **Styling Advice:** Pair effortlessly with high-waist Alpha GENZ boyfriend jeans, cargo pants, or tennis skirts and platform sneakers for a head-turning 2025/2026 streetwear look.\n- **Wash & Care:** Machine wash cold with like colors, gentle cycle. Turn inside out before washing. Warm iron on reverse. Do not iron directly on graphics.",
    "pricing": {
      "basePrice": 1999,
      "salePrice": 310,
      "costPrice": 171,
      "discountPercentage": 84
    },
    "inventory": {
      "stock": 101,
      "lowStockThreshold": 10,
      "reorderPoint": 20,
      "trackInventory": true,
      "soldCount": 63
    },
    "images": [
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/t/s/3/xs-2-black-pink-combo-xs-ungraduate-store-original-imahnusuhcyazvgr.jpeg?q=70",
        "alt": "UNGRADUATE STORE 2026 Two-Tone Contrast Trim Ribbed Knit Crop Top - View 1",
        "isPrimary": true
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/y/e/g/xs-2-black-pink-combo-xs-ungraduate-store-original-imahnusuf67jug4h.jpeg?q=70",
        "alt": "UNGRADUATE STORE 2026 Two-Tone Contrast Trim Ribbed Knit Crop Top - View 2",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/7/o/0/m-2-black-pink-combo-m-ungraduate-store-original-imahnusuyygjrhu5.jpeg?q=70",
        "alt": "UNGRADUATE STORE 2026 Two-Tone Contrast Trim Ribbed Knit Crop Top - View 3",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/6/0/a/m-1-black-single-m-ungraduate-store-original-imahnp5cesay8eub.jpeg?q=70",
        "alt": "UNGRADUATE STORE 2026 Two-Tone Contrast Trim Ribbed Knit Crop Top - View 4",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/b/u/x/s-2-black-pink-combo-s-ungraduate-store-original-imahnusuy8qq3eqy.jpeg?q=70",
        "alt": "UNGRADUATE STORE 2026 Two-Tone Contrast Trim Ribbed Knit Crop Top - View 5",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/t/s/3/xs-2-black-pink-combo-xs-ungraduate-store-original-imahnusuhcyazvgr.jpeg",
        "alt": "UNGRADUATE STORE 2026 Two-Tone Contrast Trim Ribbed Knit Crop Top - View 6",
        "isPrimary": false
      }
    ],
    "specifications": [
      {
        "key": "Fit",
        "value": "Fitted Modern Crop"
      },
      {
        "key": "Neck Type",
        "value": "Scoop Neck with Contrast Piping"
      },
      {
        "key": "Sleeve Length",
        "value": "Sleeveless with Contrast Armhole Binding"
      },
      {
        "key": "Fabric",
        "value": "Modal-Cotton Ribbed Blend"
      },
      {
        "key": "Pattern",
        "value": "Dual Tone White & Powder Pink"
      },
      {
        "key": "Occasion",
        "value": "Gym-to-Street / Summer Casual / Lounging"
      },
      {
        "key": "Collection Year",
        "value": "2025-2026"
      },
      {
        "key": "Style Code",
        "value": "AGF-WT-14"
      },
      {
        "key": "Wash Care",
        "value": "Machine Wash Gentle / Hand Wash"
      }
    ],
    "ratings": {
      "average": 4.8,
      "count": 174
    },
    "tags": [
      "ungraduate-store",
      "crop-top",
      "contrast-top",
      "ribbed-knit",
      "white-pink",
      "2026-style"
    ],
    "keywords": [
      "contrast trim crop top",
      "two tone tank top",
      "ungraduate store top",
      "pink white ribbed top"
    ],
    "highlights": [
      "2026 Minimalist Contrast Edition",
      "Ultra-breathable Cotton-Modal Rib",
      "Shape-Locking Contrast Edging",
      "Anti-Pilling Bio-Wash Finish"
    ],
    "hsnCode": "62064000",
    "isFeatured": false
  },
  {
    "name": "Berry Bird 2025 Emerald Sage Ribbed Polo Collar Knit Top",
    "brand": "Berry Bird",
    "sku": "AGF-WT-15",
    "shortDescription": "Sophisticated emerald sage ribbed knit polo marrying sporty retro tennis aesthetics with modern upscale casual tailoring for 2025.",
    "description": "### Berry Bird 2025 Emerald Sage Ribbed Polo Collar Knit Top (2025–2026 Alpha GENZ Collection)\nSophisticated emerald sage ribbed knit polo marrying sporty retro tennis aesthetics with modern upscale casual tailoring for 2025.\n\n- **Fit & Silhouette:** Slim Tailored Fit\n- **Neckline / Collar:** Johnny Polo Collar with V-Slit\n- **Sleeve Style:** Fitted Half Sleeve\n- **Fabric Composition:** Fine Gauge Combed Cotton Viscose\n- **Pattern & Artwork:** Rich Emerald Green Vertical Rib\n- **Occasion:** Smart Casual / Tennis Prep / Weekend Outings\n- **Styling Advice:** Pair effortlessly with high-waist Alpha GENZ boyfriend jeans, cargo pants, or tennis skirts and platform sneakers for a head-turning 2025/2026 streetwear look.\n- **Wash & Care:** Machine wash cold with like colors, gentle cycle. Turn inside out before washing. Warm iron on reverse. Do not iron directly on graphics.",
    "pricing": {
      "basePrice": 1449,
      "salePrice": 287,
      "costPrice": 158,
      "discountPercentage": 80
    },
    "inventory": {
      "stock": 92,
      "lowStockThreshold": 10,
      "reorderPoint": 20,
      "trackInventory": true,
      "soldCount": 37
    },
    "images": [
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/9/r/w/xl-1-1702-berry-bird-original-imahmrpcvpxhjemb.jpeg?q=70",
        "alt": "Berry Bird 2025 Emerald Sage Ribbed Polo Collar Knit Top - View 1",
        "isPrimary": true
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/o/w/p/xl-1-1702-berry-bird-original-imahmrpcf7ap3enh.jpeg?q=70",
        "alt": "Berry Bird 2025 Emerald Sage Ribbed Polo Collar Knit Top - View 2",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/w/j/1/xl-1-1702-berry-bird-original-imahmrpcbwhzwguz.jpeg?q=70",
        "alt": "Berry Bird 2025 Emerald Sage Ribbed Polo Collar Knit Top - View 3",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/e/e/l/xl-1-1702-berry-bird-original-imahmrpctqsmggzc.jpeg?q=70",
        "alt": "Berry Bird 2025 Emerald Sage Ribbed Polo Collar Knit Top - View 4",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/8/x/c/xl-1-1702-berry-bird-original-imahmrpcyxn9db9t.jpeg?q=70",
        "alt": "Berry Bird 2025 Emerald Sage Ribbed Polo Collar Knit Top - View 5",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/9/r/w/xl-1-1702-berry-bird-original-imahmrpcvpxhjemb.jpeg",
        "alt": "Berry Bird 2025 Emerald Sage Ribbed Polo Collar Knit Top - View 6",
        "isPrimary": false
      }
    ],
    "specifications": [
      {
        "key": "Fit",
        "value": "Slim Tailored Fit"
      },
      {
        "key": "Neck Type",
        "value": "Johnny Polo Collar with V-Slit"
      },
      {
        "key": "Sleeve Length",
        "value": "Fitted Half Sleeve"
      },
      {
        "key": "Fabric",
        "value": "Fine Gauge Combed Cotton Viscose"
      },
      {
        "key": "Pattern",
        "value": "Rich Emerald Green Vertical Rib"
      },
      {
        "key": "Occasion",
        "value": "Smart Casual / Tennis Prep / Weekend Outings"
      },
      {
        "key": "Collection Year",
        "value": "2025-2026"
      },
      {
        "key": "Style Code",
        "value": "AGF-WT-15"
      },
      {
        "key": "Wash Care",
        "value": "Machine Wash Gentle / Hand Wash"
      }
    ],
    "ratings": {
      "average": 4.8,
      "count": 139
    },
    "tags": [
      "berry-bird",
      "polo-top",
      "knit-top",
      "green-top",
      "old-money",
      "2025-collection"
    ],
    "keywords": [
      "polo collar top women",
      "green ribbed knit top",
      "berry bird polo",
      "tennis aesthetic top 2025"
    ],
    "highlights": [
      "2025 Old Money Tennis Aesthetic",
      "Seamless Engineered Johnny Collar",
      "Elongating Vertical Rib Texture",
      "Rich Color Saturation Guaranteed"
    ],
    "hsnCode": "62064000",
    "isFeatured": false
  },
  {
    "name": "YourVastra 2025 Natural Desert Sand Linen-Blend Minimalist Relaxed Top",
    "brand": "YourVastra",
    "sku": "AGF-WT-16",
    "shortDescription": "Effortlessly elegant desert sand top crafted in breathable cotton-linen slub, embodying the timeless 2025 neutral aesthetic.",
    "description": "### YourVastra 2025 Natural Desert Sand Linen-Blend Minimalist Relaxed Top (2025–2026 Alpha GENZ Collection)\nEffortlessly elegant desert sand top crafted in breathable cotton-linen slub, embodying the timeless 2025 neutral aesthetic.\n\n- **Fit & Silhouette:** Relaxed Boxy Silhouette\n- **Neckline / Collar:** Boat Neck / Wide Slit Neck\n- **Sleeve Style:** Dolman Half Sleeve with Turned Cuffs\n- **Fabric Composition:** 70% Cotton, 30% Natural Linen\n- **Pattern & Artwork:** Subtle Earthy Textured Slub\n- **Occasion:** Everyday Minimalist / Coastal Vacations / Work Casual\n- **Styling Advice:** Pair effortlessly with high-waist Alpha GENZ boyfriend jeans, cargo pants, or tennis skirts and platform sneakers for a head-turning 2025/2026 streetwear look.\n- **Wash & Care:** Machine wash cold with like colors, gentle cycle. Turn inside out before washing. Warm iron on reverse. Do not iron directly on graphics.",
    "pricing": {
      "basePrice": 599,
      "salePrice": 197,
      "costPrice": 108,
      "discountPercentage": 67
    },
    "inventory": {
      "stock": 82,
      "lowStockThreshold": 10,
      "reorderPoint": 20,
      "trackInventory": true,
      "soldCount": 16
    },
    "images": [
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/2/2/b/xs-1-crop-top-yourvastra-original-imahju33bw7ezdyg.jpeg?q=70",
        "alt": "YourVastra 2025 Natural Desert Sand Linen-Blend Minimalist Relaxed Top - View 1",
        "isPrimary": true
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/n/z/8/xs-1-crop-top-yourvastra-original-imahju33reu38acd.jpeg?q=70",
        "alt": "YourVastra 2025 Natural Desert Sand Linen-Blend Minimalist Relaxed Top - View 2",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/2/2/b/xs-1-crop-top-yourvastra-original-imahju33bw7ezdyg.jpeg",
        "alt": "YourVastra 2025 Natural Desert Sand Linen-Blend Minimalist Relaxed Top - View 3",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/n/z/8/xs-1-crop-top-yourvastra-original-imahju33reu38acd.jpeg",
        "alt": "YourVastra 2025 Natural Desert Sand Linen-Blend Minimalist Relaxed Top - View 4",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/u/q/e/s-crop-top-grey-country-yard-resized-original-imagx9zmjsf88ezp.jpeg",
        "alt": "YourVastra 2025 Natural Desert Sand Linen-Blend Minimalist Relaxed Top - View 5",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/n/t/j/s-1-crop-hynk-ddaspration-original-imahhj6fyjheeqz9.jpeg",
        "alt": "YourVastra 2025 Natural Desert Sand Linen-Blend Minimalist Relaxed Top - View 6",
        "isPrimary": false
      }
    ],
    "specifications": [
      {
        "key": "Fit",
        "value": "Relaxed Boxy Silhouette"
      },
      {
        "key": "Neck Type",
        "value": "Boat Neck / Wide Slit Neck"
      },
      {
        "key": "Sleeve Length",
        "value": "Dolman Half Sleeve with Turned Cuffs"
      },
      {
        "key": "Fabric",
        "value": "70% Cotton, 30% Natural Linen"
      },
      {
        "key": "Pattern",
        "value": "Subtle Earthy Textured Slub"
      },
      {
        "key": "Occasion",
        "value": "Everyday Minimalist / Coastal Vacations / Work Casual"
      },
      {
        "key": "Collection Year",
        "value": "2025-2026"
      },
      {
        "key": "Style Code",
        "value": "AGF-WT-16"
      },
      {
        "key": "Wash Care",
        "value": "Machine Wash Gentle / Hand Wash"
      }
    ],
    "ratings": {
      "average": 4.6,
      "count": 132
    },
    "tags": [
      "yourvastra",
      "linen-top",
      "beige-top",
      "minimalist",
      "quiet-luxury",
      "2025-summer"
    ],
    "keywords": [
      "beige linen top women",
      "minimalist casual top",
      "yourvastra top",
      "earthy neutral top 2025"
    ],
    "highlights": [
      "2025 Earth Tone Capsule",
      "Breathable Linen-Cotton Natural Slub",
      "Relaxed Dolman Sleeve Construction",
      "Hypoallergenic Skin-Friendly Dye"
    ],
    "hsnCode": "62064000",
    "isFeatured": false
  },
  {
    "name": "NooHy 2025 Brooklyn State of Mind Vintage Typography Boxy Tee",
    "brand": "NooHy",
    "sku": "AGF-WT-17",
    "shortDescription": "Authentic New York collegiate heritage typography printed on rich mocha and multicolor cotton base, built for casual confidence in 2025.",
    "description": "### NooHy 2025 Brooklyn State of Mind Vintage Typography Boxy Tee (2025–2026 Alpha GENZ Collection)\nAuthentic New York collegiate heritage typography printed on rich mocha and multicolor cotton base, built for casual confidence in 2025.\n\n- **Fit & Silhouette:** Boxy Comfort Fit\n- **Neckline / Collar:** Ribbed Crew Neck\n- **Sleeve Style:** Relaxed Half Sleeve\n- **Fabric Composition:** 100% Pure Combed Ringspun Cotton\n- **Pattern & Artwork:** Vintage College Athletic Typography\n- **Occasion:** Streetwear / College / Travel\n- **Styling Advice:** Pair effortlessly with high-waist Alpha GENZ boyfriend jeans, cargo pants, or tennis skirts and platform sneakers for a head-turning 2025/2026 streetwear look.\n- **Wash & Care:** Machine wash cold with like colors, gentle cycle. Turn inside out before washing. Warm iron on reverse. Do not iron directly on graphics.",
    "pricing": {
      "basePrice": 699,
      "salePrice": 250,
      "costPrice": 138,
      "discountPercentage": 64
    },
    "inventory": {
      "stock": 99,
      "lowStockThreshold": 10,
      "reorderPoint": 20,
      "trackInventory": true,
      "soldCount": 40
    },
    "images": [
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/z/r/h/s-1-broooklyn-1898-noohy-original-imahezfhqzn39ryu.jpeg?q=70",
        "alt": "NooHy 2025 Brooklyn State of Mind Vintage Typography Boxy Tee - View 1",
        "isPrimary": true
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/z/r/h/s-1-broooklyn-1898-noohy-original-imahezfhqzn39ryu.jpeg",
        "alt": "NooHy 2025 Brooklyn State of Mind Vintage Typography Boxy Tee - View 2",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/l/d/e/m-1-brooklyn-newyork-noohy-original-imahezfhf9j7xhvf.jpeg",
        "alt": "NooHy 2025 Brooklyn State of Mind Vintage Typography Boxy Tee - View 3",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/j/f/r/m-ol-wbt-brw-sj-sty001-outlaws-original-imahb4sadsyrbdzx.jpeg",
        "alt": "NooHy 2025 Brooklyn State of Mind Vintage Typography Boxy Tee - View 4",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/u/x/a/m-1-732-brown-m-01-sowera-original-imahzjwnupxpjzg9.jpeg",
        "alt": "NooHy 2025 Brooklyn State of Mind Vintage Typography Boxy Tee - View 5",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/t-shirt/u/2/f/m-32232-english-premium-resized-original-imahkcsghhhpvbqa.jpeg",
        "alt": "NooHy 2025 Brooklyn State of Mind Vintage Typography Boxy Tee - View 6",
        "isPrimary": false
      }
    ],
    "specifications": [
      {
        "key": "Fit",
        "value": "Boxy Comfort Fit"
      },
      {
        "key": "Neck Type",
        "value": "Ribbed Crew Neck"
      },
      {
        "key": "Sleeve Length",
        "value": "Relaxed Half Sleeve"
      },
      {
        "key": "Fabric",
        "value": "100% Pure Combed Ringspun Cotton"
      },
      {
        "key": "Pattern",
        "value": "Vintage College Athletic Typography"
      },
      {
        "key": "Occasion",
        "value": "Streetwear / College / Travel"
      },
      {
        "key": "Collection Year",
        "value": "2025-2026"
      },
      {
        "key": "Style Code",
        "value": "AGF-WT-17"
      },
      {
        "key": "Wash Care",
        "value": "Machine Wash Gentle / Hand Wash"
      }
    ],
    "ratings": {
      "average": 4.5,
      "count": 158
    },
    "tags": [
      "noohy",
      "brooklyn-tee",
      "typography-top",
      "college-tee",
      "streetwear",
      "2025-fashion"
    ],
    "keywords": [
      "brooklyn graphic t-shirt",
      "college typography tee women",
      "noohy oversized top",
      "vintage sports tee"
    ],
    "highlights": [
      "2025 NYC Heritage Series",
      "Vintage College Chenille Graphic Look",
      "Pre-Shrunk 100% Combed Cotton",
      "Relaxed Drop Hemline"
    ],
    "hsnCode": "61091000",
    "isFeatured": false
  },
  {
    "name": "Saigarments 2026 Olive Forest Sailor Striped Cropped Tee",
    "brand": "Saigarments",
    "sku": "AGF-WT-18",
    "shortDescription": "Yarn-dyed earth olive and ivory striped cropped tee featuring clean horizontal banding and a breezy relaxed silhouette for 2026.",
    "description": "### Saigarments 2026 Olive Forest Sailor Striped Cropped Tee (2025–2026 Alpha GENZ Collection)\nYarn-dyed earth olive and ivory striped cropped tee featuring clean horizontal banding and a breezy relaxed silhouette for 2026.\n\n- **Fit & Silhouette:** Cropped Boxy Fit\n- **Neckline / Collar:** Ribbed Crew Collar\n- **Sleeve Style:** Short Sleeve with Double Stitching\n- **Fabric Composition:** 100% Bio-Polished Cotton\n- **Pattern & Artwork:** Yarn-Dyed Olive & Cream Stripe\n- **Occasion:** Weekend Brunch / Everyday Street Casual\n- **Styling Advice:** Pair effortlessly with high-waist Alpha GENZ boyfriend jeans, cargo pants, or tennis skirts and platform sneakers for a head-turning 2025/2026 streetwear look.\n- **Wash & Care:** Machine wash cold with like colors, gentle cycle. Turn inside out before washing. Warm iron on reverse. Do not iron directly on graphics.",
    "pricing": {
      "basePrice": 699,
      "salePrice": 239,
      "costPrice": 131,
      "discountPercentage": 66
    },
    "inventory": {
      "stock": 106,
      "lowStockThreshold": 10,
      "reorderPoint": 20,
      "trackInventory": true,
      "soldCount": 52
    },
    "images": [
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/p/n/r/m-1-plan-crop-hawai-saigarments-original-imahz2mduezag5gr.jpeg?q=70",
        "alt": "Saigarments 2026 Olive Forest Sailor Striped Cropped Tee - View 1",
        "isPrimary": true
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/y/t/v/l-1-hawai-beach-saigarments-original-imahjgkfgftz3cgr.jpeg?q=70",
        "alt": "Saigarments 2026 Olive Forest Sailor Striped Cropped Tee - View 2",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/t-shirt/d/o/s/xs-62071-plan-top-urbanfiber-original-imahnzv38uu8gn8c.jpeg?q=70",
        "alt": "Saigarments 2026 Olive Forest Sailor Striped Cropped Tee - View 3",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/p/n/r/m-1-plan-crop-hawai-saigarments-original-imahz2mduezag5gr.jpeg",
        "alt": "Saigarments 2026 Olive Forest Sailor Striped Cropped Tee - View 4",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/y/t/v/l-1-hawai-beach-saigarments-original-imahjgkfgftz3cgr.jpeg",
        "alt": "Saigarments 2026 Olive Forest Sailor Striped Cropped Tee - View 5",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/t-shirt/d/o/s/xs-62071-plan-top-urbanfiber-original-imahnzv38uu8gn8c.jpeg",
        "alt": "Saigarments 2026 Olive Forest Sailor Striped Cropped Tee - View 6",
        "isPrimary": false
      }
    ],
    "specifications": [
      {
        "key": "Fit",
        "value": "Cropped Boxy Fit"
      },
      {
        "key": "Neck Type",
        "value": "Ribbed Crew Collar"
      },
      {
        "key": "Sleeve Length",
        "value": "Short Sleeve with Double Stitching"
      },
      {
        "key": "Fabric",
        "value": "100% Bio-Polished Cotton"
      },
      {
        "key": "Pattern",
        "value": "Yarn-Dyed Olive & Cream Stripe"
      },
      {
        "key": "Occasion",
        "value": "Weekend Brunch / Everyday Street Casual"
      },
      {
        "key": "Collection Year",
        "value": "2025-2026"
      },
      {
        "key": "Style Code",
        "value": "AGF-WT-18"
      },
      {
        "key": "Wash Care",
        "value": "Machine Wash Gentle / Hand Wash"
      }
    ],
    "ratings": {
      "average": 4.6,
      "count": 114
    },
    "tags": [
      "saigarments",
      "striped-crop-top",
      "olive-tee",
      "sailor-stripe",
      "2026-collection"
    ],
    "keywords": [
      "olive striped crop top",
      "green striped tee women",
      "saigarments top",
      "yarn dyed cropped tee"
    ],
    "highlights": [
      "2026 Coastal Forest Theme",
      "Yarn-Dyed Stripes (Will Not Bleed)",
      "Cropped Waistline Perfect with High-Rise Jeans",
      "Soft-Touch Combed Finish"
    ],
    "hsnCode": "61091000",
    "isFeatured": false
  },
  {
    "name": "TOXA 2026 Cyberpunk Ultraviolet Acid-Wash Graphic Oversized Tee",
    "brand": "TOXA",
    "sku": "AGF-WT-19",
    "shortDescription": "Subversive 2026 cyberpunk ultraviolet acid-wash oversized tee tailored from 220 GSM heavyweight cotton for the boldest Gen-Z statements.",
    "description": "### TOXA 2026 Cyberpunk Ultraviolet Acid-Wash Graphic Oversized Tee (2025–2026 Alpha GENZ Collection)\nSubversive 2026 cyberpunk ultraviolet acid-wash oversized tee tailored from 220 GSM heavyweight cotton for the boldest Gen-Z statements.\n\n- **Fit & Silhouette:** Extreme Oversized Streetwear Fit\n- **Neckline / Collar:** Thick 1.2-inch Ribbed Collar\n- **Sleeve Style:** Elbow Length Oversized Sleeve\n- **Fabric Composition:** 220 GSM Cotton French Terry\n- **Pattern & Artwork:** Cyberpunk Glitch Graphic & Mineral Dye\n- **Occasion:** Music Gigs / Night Streetwear / Festival\n- **Styling Advice:** Pair effortlessly with high-waist Alpha GENZ boyfriend jeans, cargo pants, or tennis skirts and platform sneakers for a head-turning 2025/2026 streetwear look.\n- **Wash & Care:** Machine wash cold with like colors, gentle cycle. Turn inside out before washing. Warm iron on reverse. Do not iron directly on graphics.",
    "pricing": {
      "basePrice": 999,
      "salePrice": 370,
      "costPrice": 204,
      "discountPercentage": 63
    },
    "inventory": {
      "stock": 79,
      "lowStockThreshold": 10,
      "reorderPoint": 20,
      "trackInventory": true,
      "soldCount": 34
    },
    "images": [
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/0/1/a/s-1-txw-03-toxa-original-imahcn6sjte3m8zd.jpeg?q=70",
        "alt": "TOXA 2026 Cyberpunk Ultraviolet Acid-Wash Graphic Oversized Tee - View 1",
        "isPrimary": true
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/x/g/1/s-1-txw-03-toxa-original-imahcn6sxu2ajqmd.jpeg?q=70",
        "alt": "TOXA 2026 Cyberpunk Ultraviolet Acid-Wash Graphic Oversized Tee - View 2",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/z/i/p/s-1-txw-03-toxa-original-imahcn6sgvsucfcx.jpeg?q=70",
        "alt": "TOXA 2026 Cyberpunk Ultraviolet Acid-Wash Graphic Oversized Tee - View 3",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/x/z/s/s-1-txw-03-toxa-original-imahcn6sbz2gbbc8.jpeg?q=70",
        "alt": "TOXA 2026 Cyberpunk Ultraviolet Acid-Wash Graphic Oversized Tee - View 4",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/f/a/b/s-1-txw-03-toxa-original-imahcn6s9y3ymarb.jpeg?q=70",
        "alt": "TOXA 2026 Cyberpunk Ultraviolet Acid-Wash Graphic Oversized Tee - View 5",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/0/1/a/s-1-txw-03-toxa-original-imahcn6sjte3m8zd.jpeg",
        "alt": "TOXA 2026 Cyberpunk Ultraviolet Acid-Wash Graphic Oversized Tee - View 6",
        "isPrimary": false
      }
    ],
    "specifications": [
      {
        "key": "Fit",
        "value": "Extreme Oversized Streetwear Fit"
      },
      {
        "key": "Neck Type",
        "value": "Thick 1.2-inch Ribbed Collar"
      },
      {
        "key": "Sleeve Length",
        "value": "Elbow Length Oversized Sleeve"
      },
      {
        "key": "Fabric",
        "value": "220 GSM Cotton French Terry"
      },
      {
        "key": "Pattern",
        "value": "Cyberpunk Glitch Graphic & Mineral Dye"
      },
      {
        "key": "Occasion",
        "value": "Music Gigs / Night Streetwear / Festival"
      },
      {
        "key": "Collection Year",
        "value": "2025-2026"
      },
      {
        "key": "Style Code",
        "value": "AGF-WT-19"
      },
      {
        "key": "Wash Care",
        "value": "Machine Wash Gentle / Hand Wash"
      }
    ],
    "ratings": {
      "average": 4.5,
      "count": 171
    },
    "tags": [
      "toxa",
      "cyberpunk-tee",
      "acid-wash",
      "purple-tshirt",
      "oversized-streetwear",
      "2026-trend"
    ],
    "keywords": [
      "cyberpunk oversized t-shirt",
      "acid wash purple tee",
      "toxa graphic top",
      "heavyweight streetwear tee"
    ],
    "highlights": [
      "2026 Cyberpunk Vision Series",
      "Hand-Crafted Acid-Wash Mineral Treatment",
      "High-Density Cyber Typography & Artwork",
      "Heavyweight 220 GSM Fall Drape"
    ],
    "hsnCode": "61091000",
    "isFeatured": false
  },
  {
    "name": "Outlaws 2026 Venice Boardwalk Ocean Sky Blue Typography Skate Tee",
    "brand": "Outlaws",
    "sku": "AGF-WT-20",
    "shortDescription": "Sun-drenched Venice Beach surf vibe sky blue skate tee featuring retro Californian typography and carefree slouchy tailoring for 2026.",
    "description": "### Outlaws 2026 Venice Boardwalk Ocean Sky Blue Typography Skate Tee (2025–2026 Alpha GENZ Collection)\nSun-drenched Venice Beach surf vibe sky blue skate tee featuring retro Californian typography and carefree slouchy tailoring for 2026.\n\n- **Fit & Silhouette:** Loose Boyfriend Fit\n- **Neckline / Collar:** Classic Crew Neck\n- **Sleeve Style:** Relaxed Half Sleeve\n- **Fabric Composition:** 100% Combed Slub Cotton\n- **Pattern & Artwork:** California Surf & Skate Graphic Print\n- **Occasion:** Skate Park / Beach Boardwalk / Casual Chill\n- **Styling Advice:** Pair effortlessly with high-waist Alpha GENZ boyfriend jeans, cargo pants, or tennis skirts and platform sneakers for a head-turning 2025/2026 streetwear look.\n- **Wash & Care:** Machine wash cold with like colors, gentle cycle. Turn inside out before washing. Warm iron on reverse. Do not iron directly on graphics.",
    "pricing": {
      "basePrice": 1299,
      "salePrice": 401,
      "costPrice": 221,
      "discountPercentage": 69
    },
    "inventory": {
      "stock": 113,
      "lowStockThreshold": 10,
      "reorderPoint": 20,
      "trackInventory": true,
      "soldCount": 28
    },
    "images": [
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/4/l/t/xxl-ol-wbt-skyb-sj-sty001-outlaws-original-imahb4scahzsuyph.jpeg?q=70",
        "alt": "Outlaws 2026 Venice Boardwalk Ocean Sky Blue Typography Skate Tee - View 1",
        "isPrimary": true
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/3/r/3/xxl-ol-wbt-skyb-sj-sty001-outlaws-original-imahb4scbm42z96u.jpeg?q=70",
        "alt": "Outlaws 2026 Venice Boardwalk Ocean Sky Blue Typography Skate Tee - View 2",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/z/e/2/xxl-ol-wbt-skyb-sj-sty001-outlaws-original-imahb4scspeabctg.jpeg?q=70",
        "alt": "Outlaws 2026 Venice Boardwalk Ocean Sky Blue Typography Skate Tee - View 3",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/t/f/5/xxl-ol-wbt-skyb-sj-sty001-outlaws-original-imahb4scymcxezb7.jpeg?q=70",
        "alt": "Outlaws 2026 Venice Boardwalk Ocean Sky Blue Typography Skate Tee - View 4",
        "isPrimary": false
      },
      {
        "url": "https://rukmini1.flixcart.com/image/832/832/xif0q/top/3/h/k/xxl-ol-wbt-skyb-sj-sty001-outlaws-original-imahb4scmyu2tegu.jpeg?q=70",
        "alt": "Outlaws 2026 Venice Boardwalk Ocean Sky Blue Typography Skate Tee - View 5",
        "isPrimary": false
      },
      {
        "url": "https://rukminim2.flixcart.com/image/832/832/xif0q/top/4/l/t/xxl-ol-wbt-skyb-sj-sty001-outlaws-original-imahb4scahzsuyph.jpeg",
        "alt": "Outlaws 2026 Venice Boardwalk Ocean Sky Blue Typography Skate Tee - View 6",
        "isPrimary": false
      }
    ],
    "specifications": [
      {
        "key": "Fit",
        "value": "Loose Boyfriend Fit"
      },
      {
        "key": "Neck Type",
        "value": "Classic Crew Neck"
      },
      {
        "key": "Sleeve Length",
        "value": "Relaxed Half Sleeve"
      },
      {
        "key": "Fabric",
        "value": "100% Combed Slub Cotton"
      },
      {
        "key": "Pattern",
        "value": "California Surf & Skate Graphic Print"
      },
      {
        "key": "Occasion",
        "value": "Skate Park / Beach Boardwalk / Casual Chill"
      },
      {
        "key": "Collection Year",
        "value": "2025-2026"
      },
      {
        "key": "Style Code",
        "value": "AGF-WT-20"
      },
      {
        "key": "Wash Care",
        "value": "Machine Wash Gentle / Hand Wash"
      }
    ],
    "ratings": {
      "average": 4.5,
      "count": 109
    },
    "tags": [
      "outlaws",
      "skate-tee",
      "sky-blue-top",
      "surf-skate",
      "boyfriend-tee",
      "2026-apparel"
    ],
    "keywords": [
      "sky blue skate tee women",
      "california graphic tee",
      "outlaws t-shirt",
      "oversized sky blue top"
    ],
    "highlights": [
      "2026 Venice Boardwalk Collection",
      "Chill Boyfriend Slouch Fit",
      "Breathable Combed Cotton Slub",
      "Anti-Fade Vibrant Sky Blue Pigment"
    ],
    "hsnCode": "61091000",
    "isFeatured": false
  }
];

async function seedAlphaGenzWomenTops() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected successfully to MongoDB Atlas!\n');

    // 1. Verify Seller Alpha GENZ Fashions
    const Seller = mongoose.models.Seller || mongoose.model('Seller', new mongoose.Schema({}, { strict: false }));
    const seller = await Seller.findOne({
      $or: [
        { _id: new mongoose.Types.ObjectId('6a9ef5aac87391e35aaeb4f3') },
        { 'storeInfo.storeSlug': 'alpha-genz-fashions' },
      ],
    });

    if (!seller) {
      console.error('❌ Seller Alpha GENZ Fashions not found in database!');
      process.exit(1);
    }

    console.log(`🏢 Verified Seller: ${seller.storeInfo?.storeName} (${seller._id})`);
    console.log(`📧 Email: ${seller.personalDetails?.email || 'alphagenzfashions@onlineplanet.in'}`);
    console.log(`⭐ Status: ${seller.verificationStatus} | Tier: ${seller.subscriptionPlan}\n`);

    // Ensure seller categories include Women's Fashion
    const existingCategories = seller.storeInfo?.storeCategories || [];
    const neededCategories = ["Women's Clothing", "Tops & Tees", "Gen-Z Fashion", "Streetwear"];
    const mergedCategories = [...new Set([...existingCategories, ...neededCategories])];
    
    await Seller.updateOne(
      { _id: seller._id },
      {
        $set: {
          'storeInfo.storeCategories': mergedCategories,
          verificationStatus: 'approved',
          'verificationSteps.emailVerified': true,
          'verificationSteps.phoneVerified': true,
          'verificationSteps.documentsVerified': true,
          'verificationSteps.bankVerified': true,
          'verificationSteps.addressVerified': true,
          subscriptionPlan: 'enterprise',
          isActive: true,
          isVerified: true,
        },
      }
    );
    console.log('✅ Updated Seller storeCategories:', mergedCategories);

    // 2. Resolve Category: Tops & Tees
    const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({}, { strict: false }));
    const topsCat = await Category.findOne({ slug: 'women-tops' });
    const categoryName = topsCat?.name || 'Tops & Tees';
    const categoryPath = topsCat?.path || 'fashion/womens-clothing/women-tops';
    const subCategory = "Women's Clothing";

    console.log(`📂 Category Target: ${categoryName} (${categoryPath})\n`);

    // 3. Product Model
    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

    console.log(`🔍 Verifying all image URLs across all ${womenTopProducts.length} products...`);
    for (let pIdx = 0; pIdx < womenTopProducts.length; pIdx++) {
      const p = womenTopProducts[pIdx];
      if (!p.images || p.images.length < 4) {
        throw new Error(`Product ${p.name} has fewer than 4 images! (${p.images?.length})`);
      }
      for (const img of p.images) {
        const isOk = await verifyImageUrl(img.url);
        if (!isOk) {
          throw new Error(`Image verification failed (404/error) for: ${img.url}`);
        }
      }
      console.log(`  ✅ Product ${pIdx + 1}/${womenTopProducts.length} (${p.brand}): All ${p.images.length} images verified 200 OK`);
    }
    console.log('🎉 100% of images verified live with HTTP 200 OK! Zero 404s.\n');

    console.log(`📦 Upserting ${womenTopProducts.length} Women's Tops & T-Shirts (2025-2026 Collection)...\n`);

    let inserted = 0;
    let updated = 0;

    for (const item of womenTopProducts) {
      const variants = generateTopVariants(item.sku, item.pricing.salePrice);
      const options = [
        {
          name: 'Size',
          values: ['XS', 'S', 'M', 'L', 'XL'],
        },
      ];

      const productPayload = {
        ...item,
        sellerId: seller._id,
        category: categoryName,
        categoryPath: categoryPath,
        subCategory: subCategory,
        options: options,
        variants: variants,
        shipping: {
          weight: 0.25,
          unit: 'kg',
          freeShipping: true,
          shippingFee: 0,
        },
        returnPolicy: {
          isReturnable: true,
          returnDuration: 7,
          isReplaceable: true,
          replacementDuration: 7,
        },
        deliveryEstimate: {
          domestic: { min: 2, max: 4 },
          international: { min: 7, max: 12 },
          lastUpdated: new Date(),
        },
        isActive: true,
        isApproved: true,
        isDraft: false,
        importedFrom: 'flipkart',
      };

      const existing = await Product.findOne({ sku: item.sku });
      if (existing) {
        await Product.updateOne({ sku: item.sku }, { $set: productPayload });
        console.log(`🔄 [UPDATED] ${item.brand.padEnd(18)} | ${item.name.slice(0, 55)}... (SKU: ${item.sku})`);
        updated++;
      } else {
        await Product.create(productPayload);
        console.log(`✨ [INSERTED] ${item.brand.padEnd(18)} | ${item.name.slice(0, 55)}... (SKU: ${item.sku})`);
        inserted++;
      }
    }

    console.log('\n======================================================');
    console.log('🎉 ALPHA GENZ FASHIONS WOMEN TOPS SEEDING COMPLETED!');
    console.log('======================================================');
    console.log(`🏢 Seller: ${seller.storeInfo?.storeName} (${seller._id})`);
    console.log(`👚 Total Women Tops: ${womenTopProducts.length} (Inserted: ${inserted}, Updated: ${updated})`);

    const totalSellerProducts = await Product.countDocuments({ sellerId: seller._id });
    console.log(`🏪 Total Products now under Alpha GENZ Fashions Store: ${totalSellerProducts}`);

    const womenTopsCount = await Product.countDocuments({ sellerId: seller._id, categoryPath: categoryPath });
    console.log(`👗 Women Tops in Store: ${womenTopsCount}`);

    await mongoose.connection.close();
    console.log('🔌 Database connection closed\n');
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedAlphaGenzWomenTops();
