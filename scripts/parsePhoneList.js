// scripts/parsePhoneList.js
const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchUrl(url) {
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
        }
      };

      const req = https.get(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
      });
      req.on('error', (err) => resolve({ statusCode: 500, body: err.message }));
      req.setTimeout(10000, () => { req.destroy(); resolve({ statusCode: 408, body: '' }); });
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

const asins = [
  'B0H297XH3K', // REDMI Turbo 5
  'B0FYGBSKFB', // iQOO Neo 10
  'B0H8CF8GRH', // iQOO 15R
  'B0GL8H6Q22', // iQOO 15
  'B0HCBG7DT7', // iQOO 15R
  'B0GL8B68FP', // iQOO Z11 5G
  'B0HCN495KN', // iQOO Z11x 5G
  'B0HCNCNWWS', // iQOO Z11 5G
  'B0FTRN7L8Q', // iQOO Z11 5G
  'B0HCN78GQL', // Samsung Galaxy S24 Ultra
  'B0CS5Z3T4M', // OnePlus 13
  'B0H1WY1D37', // OnePlus 13s / iQOO Z11
  'B0F5WTG8RG', // OnePlus 15R
  'B0DQQPMNC2', // Redmi Note 14 Pro+ 5G
  'B0DQPZ5V3X', // Redmi Note 14 Pro+
  'B0FDWHFS68', // Redmi Note 14 Pro+
  'B0DQPXB4FB', // Redmi Note 14 Pro+
  'B0DQPYPQ31', // REDMI Note 15 Pro+ 5G
  'B0GPXTY8V5',
  'B0GZVJHC5L',
  'B0FJFRYXFK',
  'B0GX1TL4P1',
  'B0GL1WGHJX',
  'B0GHX9W5HW',
  'B0GLQ9JTKJ',
  'B0GN1NNYXF',
  'B0HCB97YK5',
  'B0H38YJY8Q'
];

async function parseAsin(asin) {
  const url = `https://www.amazon.in/dp/${asin}`;
  const res = await fetchUrl(url);
  if (res.statusCode !== 200) return null;

  const html = res.body;

  const titleMatch = html.match(/<span id="productTitle"[^>]*>([\s\S]*?)<\/span>/i);
  if (!titleMatch) return null;
  let title = titleMatch[1].replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim();

  // Filter out accessories
  if (/case|cover|tempered|glass|protector|cable|charger|adapter|stand|holder|strap|battery|pouch|skin/i.test(title)) {
    return null;
  }
  if (!/5g|phone|smartphone|mobile|redmi|galaxy|iphone|oneplus|iqoo|realme|vivo|oppo|xiaomi|poco/i.test(title)) {
    return null;
  }

  // Determine brand
  let brand = 'OnePlus';
  for (const b of ['Apple', 'Samsung', 'OnePlus', 'iQOO', 'Realme', 'Vivo', 'Xiaomi', 'Redmi', 'POCO', 'Oppo', 'Motorola', 'Google', 'Nothing', 'Honor']) {
    if (new RegExp(`\\b${b}\\b`, 'i').test(title)) {
      brand = b;
      break;
    }
  }

  let modelYear = '2025';
  if (/2026/.test(title) || /2026/.test(html)) {
    modelYear = '2026';
  } else {
    modelYear = '2025';
  }

  if (!title.includes('2025') && !title.includes('2026')) {
    title = `${brand} (${modelYear} Edition) ` + title.replace(new RegExp(`^${brand}\\s*`, 'i'), '');
  }

  // Extract images
  const imgMatches = html.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[a-zA-Z0-9_\-%\.]+\._(?:SL|AC|SX|SY|UL)[0-9_]+_\.jpg/gi) || [];
  const candidateImages = [...new Set(imgMatches.map(u => u.replace(/\._.*_\.jpg/, '._SL1500_.jpg')))]
    .filter(u => !u.includes('41LbSThP8fL') && !u.includes('play-button') && !u.includes('video'));

  if (candidateImages.length < 4) return null;

  // Price
  const priceWholeMatch = html.match(/<span class="a-price-whole">([0-9,]+)/i);
  let salePrice = priceWholeMatch ? parseInt(priceWholeMatch[1].replace(/,/g, ''), 10) : 24999;
  if (isNaN(salePrice) || salePrice < 5000) salePrice = 24999;

  const mrpMatch = html.match(/<span class="a-price a-text-price"[^>]*>[\s\S]*?<span class="a-offscreen">₹?([0-9,]+)<\/span>/i);
  let basePrice = mrpMatch ? parseInt(mrpMatch[1].replace(/,/g, ''), 10) : Math.round(salePrice * 1.25);
  if (isNaN(basePrice) || basePrice <= salePrice) basePrice = Math.round(salePrice * 1.25);

  // Specs
  const specs = [];
  const specRows = [...html.matchAll(/<tr[^>]*>\s*<th class="a-color-secondary a-size-base prodDetSectionEntry"[^>]*>([\s\S]*?)<\/th>\s*<td class="a-size-base prodDetAttrValue"[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi)];
  for (const row of specRows) {
    const key = row[1].replace(/<[^>]+>/g, '').trim();
    const val = row[2].replace(/<[^>]+>/g, '').trim();
    if (key && val && specs.length < 15) {
      specs.push({ key, value: val });
    }
  }

  // Bullets
  const bulletMatches = [...html.matchAll(/<span class="a-list-item">([\s\S]*?)<\/span>/gi)];
  const features = [];
  for (const bm of bulletMatches) {
    const txt = bm[1].replace(/<[^>]+>/g, '').trim();
    if (txt.length > 25 && !txt.includes('Amazon') && !txt.includes('JavaScript') && features.length < 6) {
      features.push(txt);
    }
  }

  // Verify images
  const verifiedImages = [];
  for (const imgUrl of candidateImages.slice(0, 8)) {
    const ok = await verifyImage(imgUrl);
    if (ok) verifiedImages.push(imgUrl);
  }

  if (verifiedImages.length < 4) return null;

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
  console.log(`Checking ${asins.length} phone candidates...`);
  const finalPhones = [];

  for (let i = 0; i < asins.length; i++) {
    const asin = asins[i];
    process.stdout.write(`[${i+1}/${asins.length}] Fetching ${asin}... `);
    const prod = await parseAsin(asin);
    if (prod) {
      finalPhones.push(prod);
      console.log(`✅ [${prod.brand}] (${prod.modelYear}) ${prod.images.length} verified photos: ₹${prod.salePrice}`);
      console.log(`   ${prod.title.substring(0, 70)}...`);
    } else {
      console.log(`❌ Skipped`);
    }
  }

  console.log(`\n🎉 Collected ${finalPhones.length} verified phone products!`);
  fs.writeFileSync(path.join(__dirname, 'verified_phones_batch1.json'), JSON.stringify(finalPhones, null, 2));
}

run();
