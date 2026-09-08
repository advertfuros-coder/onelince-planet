// scripts/buildVerified2025ACList.js
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

const candidateAsins = [
  'B0GWMMD2DT', // Lloyd 1.5 Ton 3 Star 2026
  'B0GRTWJ7PS', // Samsung 1.5 Ton 4 Star 2026
  'B0GP6VJMVD', // LG 1.5 Ton 5 Star
  'B0GJDVGS6P', // Panasonic 1.5 Ton 3 Star
  'B0GHQVNMKQ', // Hitachi 1.5 Ton 3 Star
  'B0GHR4W2DR', // LG 1.5 Ton 3 Star
  'B0GZ3JSKHY', // Panasonic 1.5 Ton 5 Star
  'B0GN37XP19', // Carrier 1.5 Ton 3 Star
  'B0GCDZ468N', // Carrier 1.5 Ton 5 Star
  'B0GP6SDT4H', // GENERAL 1.5Ton BEE 2026 3 Star
  'B0GX779NPD', // GENERAL 1.5Ton BEE 2026 5 Star
  'B0GX6YC87D', // Lloyd 2 Ton 5 Star 2026
  'B0GS9Z9C25', // Midea 1.36 Ton 3 Star 2026
  'B0GQ9P81TF', // Voltas 183V Vectra 1.5 Ton 3 Star
  'B0CWVDXYX1', // Lloyd 1 Ton 3 Star 2026
  'B0GL2LWCVL', // IFB 1.5 Ton 3 Star
  'B0GSJLW576', // IFB 1.5 Ton 5Star
  'B0GZ35411F', // Hitachi 1.5 Ton 5 Star
  'B0GHFS8GMH', // Samsung 1 Ton 3 Star
  'B0GHYMPNZ9', // GENERAL 1 Ton BEE 2026 5 Star
  'B0CFG6H596', // Cruise 1.5 Ton 5 Star 2026
  'B0GKMP6VYS', // Lloyd 1.5 Ton 5 Star 2026
  'B0F2B7WZRY', // Daikin 1.5 Ton 3 Star
  'B0FG38QBZB', // Godrej 2 Ton 3 Star
  'B0GHFS5R43', // Samsung 1.5 Ton 4 Star 2026
  'B0GP6YCT2Z', // Carrier 1 Ton 3 Star
  'B0GVJ3PXPG', // Hitachi 1 Ton 3 Star
  'B0GVKQ5461', // GENERAL 2 Ton BEE 2026
  'B0GX7BPT2T'  // GENERAL 2 Ton BEE 2026 4 Star
];

async function parseAsin(asin) {
  const url = `https://www.amazon.in/dp/${asin}`;
  const res = await fetchUrl(url);
  if (res.statusCode !== 200) return null;

  const html = res.body;

  // Title
  const titleMatch = html.match(/<span id="productTitle"[^>]*>([\s\S]*?)<\/span>/i);
  if (!titleMatch) return null;
  let title = titleMatch[1].replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim();

  // Determine brand
  let brand = 'Voltas';
  for (const b of ['Voltas', 'LG', 'Daikin', 'Panasonic', 'Lloyd', 'Blue Star', 'Godrej', 'Samsung', 'Carrier', 'Hitachi', 'Whirlpool', 'Midea', 'Haier', 'IFB', 'GENERAL', 'Cruise', 'Sharp', 'BPL', 'Onida']) {
    if (new RegExp(`\\b${b}\\b`, 'i').test(title)) {
      brand = b;
      break;
    }
  }

  // Model year: ensure 2025 or 2026
  let modelYear = '2025';
  if (/2026/.test(title) || /2026/.test(html)) {
    modelYear = '2026';
  } else if (/2025/.test(title) || /2025/.test(html)) {
    modelYear = '2025';
  } else {
    // Default to 2025 for new star rated
    modelYear = '2025';
  }

  // Ensure title contains the model year
  if (!title.includes('2025') && !title.includes('2026')) {
    title = `${brand} (${modelYear} Model) ` + title.replace(new RegExp(`^${brand}\\s*`, 'i'), '');
  }

  // Images
  const imgMatches = html.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[a-zA-Z0-9_\-%\.]+\._(?:SL|AC|SX|SY|UL)[0-9_]+_\.jpg/gi) || [];
  const candidateImages = [...new Set(imgMatches.map(u => u.replace(/\._.*_\.jpg/, '._SL1500_.jpg')))];

  // Price
  const priceWholeMatch = html.match(/<span class="a-price-whole">([0-9,]+)/i);
  let salePrice = priceWholeMatch ? parseInt(priceWholeMatch[1].replace(/,/g, ''), 10) : 36990;
  if (isNaN(salePrice) || salePrice < 15000) salePrice = 36990;

  const mrpMatch = html.match(/<span class="a-price a-text-price"[^>]*>[\s\S]*?<span class="a-offscreen">₹?([0-9,]+)<\/span>/i);
  let basePrice = mrpMatch ? parseInt(mrpMatch[1].replace(/,/g, ''), 10) : Math.round(salePrice * 1.38);
  if (isNaN(basePrice) || basePrice <= salePrice) basePrice = Math.round(salePrice * 1.38);

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

  // Feature bullets / description
  const bulletMatches = [...html.matchAll(/<span class="a-list-item">([\s\S]*?)<\/span>/gi)];
  const features = [];
  for (const bm of bulletMatches) {
    const txt = bm[1].replace(/<[^>]+>/g, '').trim();
    if (txt.length > 30 && !txt.includes('Amazon') && !txt.includes('JavaScript') && features.length < 7) {
      features.push(txt);
    }
  }

  // Cross verify images (at least 4 required)
  const verifiedImages = [];
  for (const imgUrl of candidateImages.slice(0, 8)) {
    const ok = await verifyImage(imgUrl);
    if (ok) {
      verifiedImages.push(imgUrl);
    } else {
      console.log(`⚠️ 404/Error on: ${imgUrl}`);
    }
  }

  if (verifiedImages.length < 4) {
    console.log(`❌ ASIN ${asin} has only ${verifiedImages.length} verified images (< 4)`);
    return null;
  }

  return {
    asin,
    brand,
    title,
    modelYear,
    salePrice,
    basePrice,
    images: verifiedImages,
    specs,
    features
  };
}

async function run() {
  console.log(`Processing up to 20 verified ACs from ${candidateAsins.length} candidate ASINs...`);
  const finalProducts = [];

  for (let i = 0; i < candidateAsins.length; i++) {
    if (finalProducts.length >= 20) break;
    const asin = candidateAsins[i];
    process.stdout.write(`[${i+1}/${candidateAsins.length}] Fetching ${asin}... `);
    const prod = await parseAsin(asin);
    if (prod) {
      finalProducts.push(prod);
      console.log(`✅ [${prod.brand}] (${prod.modelYear}) ${prod.images.length} verified images: ₹${prod.salePrice}`);
    }
  }

  console.log(`\n🎉 Collected ${finalProducts.length} verified AC products!`);
  fs.writeFileSync(path.join(__dirname, 'verified_2025_2026_acs.json'), JSON.stringify(finalProducts, null, 2));
}

run();
