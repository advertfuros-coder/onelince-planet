// scripts/buildVerifiedTabletsList.js
const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchUrl(url, extraHeaders = {}) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const options = {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          ...extraHeaders
        }
      };

      const req = https.get(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
      });
      req.on('error', (err) => resolve({ statusCode: 500, body: err.message }));
      req.setTimeout(12000, () => { req.destroy(); resolve({ statusCode: 408, body: '' }); });
    } catch (e) {
      resolve({ statusCode: 500, body: e.message });
    }
  });
}

function verifyImage(url) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const req = https.request({
        method: 'HEAD',
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
      }, (res) => {
        resolve(res.statusCode >= 200 && res.statusCode < 400);
      });
      req.on('error', () => resolve(false));
      req.setTimeout(5000, () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    } catch {
      resolve(false);
    }
  });
}

// 22 Curated popular tablet ASINs across top brands
const candidateTabletAsins = [
  // Apple iPads
  'B0BJLDVX2S', // Apple iPad 10th Gen 10.9" (A14 Bionic)
  'B0D3J9M5J3', // Apple iPad Air 11″ (M2 chip)
  'B0D3J8QKYT', // Apple iPad Air 13″ (M2 chip)
  'B0D3J8HRLV', // Apple iPad Pro 11″ (M4 chip)
  'B0D3J5NGVG', // Apple iPad Pro 13″ (M4 chip)
  'B0DK3Z6NMQ', // Apple iPad mini (A17 Pro chip)

  // Samsung Galaxy Tabs
  'B0DHH8K3LC', // Samsung Galaxy Tab S10 Ultra 5G
  'B0DHH9PWHJ', // Samsung Galaxy Tab S10+ 12.4" Dynamic AMOLED
  'B0F29MZ848', // Samsung Galaxy Tab S10 FE+ 13.1"
  'B0CJ393D6H', // Samsung Galaxy Tab A9+ 11" Wi-Fi
  'B0CXJ6F1QM', // Samsung Galaxy Tab A9+ 11" 5G

  // OnePlus Pads
  'B0D7N23QKD', // OnePlus Pad 2 12.1" Snapdragon 8 Gen 3
  'B0G4QQ4FYB', // OnePlus Pad Go 2 12.1" 2.8K

  // Xiaomi & Redmi
  'B0C6R11QP5', // Xiaomi Pad 6 11" Snapdragon 870 144Hz
  'B0CC8QGXHL', // Xiaomi Pad 6 11" 8GB/256GB
  'B0F63PJ2HK', // Redmi Pad Pro 5G 12.1" 120Hz
  'B0F63L2TST', // Redmi Pad Pro 5G 12.1" 8GB/256GB

  // Lenovo
  'B0CJ3431XX', // Lenovo Tab P12 12.7" 3K Display
  'B0CKYQLX72', // Lenovo Tab P12 12.7" 256GB
  'B0D6Z3KHXN', // Lenovo Tab M11 with Pen LTE 11"
  'B0D54294K9', // Lenovo Tab M11 Wi-Fi 8GB/128GB

  // Realme
  'B0D29GV262', // realme Pad 2 11.5" 120Hz 2K
  'B0CD7PFWMH'  // realme Pad 2 4G 11.5" 8GB/256GB
];

async function parseTabletAsin(asin) {
  const url = `https://www.amazon.in/dp/${asin}`;
  const res = await fetchUrl(url);
  if (res.statusCode !== 200) return null;

  const html = res.body;

  // Title
  const titleMatch = html.match(/<span id="productTitle"[^>]*>([\s\S]*?)<\/span>/i);
  if (!titleMatch) return null;
  let title = titleMatch[1].replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim();

  // Determine brand
  let brand = 'Other';
  for (const b of ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Redmi', 'Lenovo', 'realme', 'Honor', 'Motorola']) {
    if (new RegExp(`\\b${b}\\b`, 'i').test(title)) {
      brand = b.toLowerCase() === 'realme' ? 'Realme' : b;
      break;
    }
  }

  // Images - filter out small icons/badges
  const imgMatches = html.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[a-zA-Z0-9_\-%\.]+\._(?:SL|AC|SX|SY|UL)[0-9_]+_\.jpg/gi) || [];
  const candidateImages = [...new Set(imgMatches.map(u => u.replace(/\._.*_\.jpg/, '._SL1500_.jpg')))]
    .filter(u => !u.includes('41LbSThP8fL') && !u.includes('31r-'));

  // Price
  const priceWholeMatch = html.match(/<span class="a-price-whole">([0-9,]+)/i);
  let salePrice = priceWholeMatch ? parseInt(priceWholeMatch[1].replace(/,/g, ''), 10) : 29999;
  if (isNaN(salePrice) || salePrice < 5000) salePrice = 29999;

  const mrpMatch = html.match(/<span class="a-price a-text-price"[^>]*>[\s\S]*?<span class="a-offscreen">₹?([0-9,]+)<\/span>/i);
  let basePrice = mrpMatch ? parseInt(mrpMatch[1].replace(/,/g, ''), 10) : Math.round(salePrice * 1.25);
  if (isNaN(basePrice) || basePrice <= salePrice) basePrice = Math.round(salePrice * 1.25);

  // Specifications
  const specs = [];
  const specRows = [...html.matchAll(/<tr[^>]*>\s*<th class="a-color-secondary a-size-base prodDetSectionEntry"[^>]*>([\s\S]*?)<\/th>\s*<td class="a-size-base prodDetAttrValue"[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi)];
  for (const row of specRows) {
    const key = row[1].replace(/<[^>]+>/g, '').trim();
    const val = row[2].replace(/<[^>]+>/g, '').trim();
    if (key && val && specs.length < 15) {
      specs.push({ key, value: val });
    }
  }

  // Fallback specs if table is empty
  if (specs.length === 0) {
    specs.push({ key: 'Brand', value: brand });
    specs.push({ key: 'Product Category', value: 'Tablet / Pad' });
    specs.push({ key: 'Connectivity', value: title.includes('5G') || title.includes('LTE') ? 'Wi-Fi + Cellular' : 'Wi-Fi' });
  }

  // Feature bullets
  const bulletMatches = [...html.matchAll(/<span class="a-list-item">([\s\S]*?)<\/span>/gi)];
  const features = [];
  for (const bm of bulletMatches) {
    const txt = bm[1].replace(/<[^>]+>/g, '').trim();
    if (txt.length > 25 && !txt.includes('Amazon') && !txt.includes('JavaScript') && features.length < 7) {
      features.push(txt);
    }
  }

  // Cross verify images (HTTP HEAD check, ensure no 404s)
  const verifiedImages = [];
  for (const imgUrl of candidateImages.slice(0, 8)) {
    const ok = await verifyImage(imgUrl);
    if (ok) {
      verifiedImages.push(imgUrl);
    } else {
      console.log(`⚠️ Image 404 or failed: ${imgUrl}`);
    }
  }

  if (verifiedImages.length < 4) {
    console.log(`❌ ASIN ${asin} has only ${verifiedImages.length} images (< 4)`);
    return null;
  }

  return {
    asin,
    brand,
    title,
    salePrice,
    basePrice,
    images: verifiedImages,
    specs,
    features
  };
}

async function run() {
  console.log(`🚀 Scraping and verifying 20 tablets from ${candidateTabletAsins.length} candidate ASINs...`);
  const finalProducts = [];

  for (let i = 0; i < candidateTabletAsins.length; i++) {
    if (finalProducts.length >= 20) break;
    const asin = candidateTabletAsins[i];
    process.stdout.write(`[${i+1}/${candidateTabletAsins.length}] Fetching ${asin}... `);
    const prod = await parseTabletAsin(asin);
    if (prod) {
      finalProducts.push(prod);
      console.log(`✅ [${prod.brand}] ${prod.images.length} verified photos: ₹${prod.salePrice}`);
    }
  }

  console.log(`\n🎉 Successfully gathered ${finalProducts.length} verified tablet products!`);
  const outputPath = path.join(__dirname, 'verified_tablets.json');
  fs.writeFileSync(outputPath, JSON.stringify(finalProducts, null, 2));
  console.log(`📁 Saved to: ${outputPath}`);
}

run();
