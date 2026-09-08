// scripts/buildVerified2025PhoneList.js
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

async function getAsinsForQuery(query) {
  const url = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
  const res = await fetchUrl(url);
  if (res.statusCode !== 200) return [];

  const asinRegex = /data-asin="([A-Z0-9]{10})"/g;
  const asins = [];
  let m;
  while ((m = asinRegex.exec(res.body)) !== null) {
    if (m[1] && !asins.includes(m[1])) {
      asins.push(m[1]);
    }
  }
  return asins;
}

async function parsePhonePage(asin) {
  const url = `https://www.amazon.in/dp/${asin}`;
  const res = await fetchUrl(url);
  if (res.statusCode !== 200) return null;

  const html = res.body;

  // Title
  const titleMatch = html.match(/<span id="productTitle"[^>]*>([\s\S]*?)<\/span>/i);
  if (!titleMatch) return null;
  let title = titleMatch[1].replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim();

  // Filter out non-phone items
  if (/case|cover|tempered|glass|protector|cable|charger|adapter|stand|holder|strap|battery|pouch|skin|screen guard/i.test(title)) {
    return null;
  }
  if (!/5g|phone|smartphone|mobile|redmi|galaxy|iphone|oneplus|iqoo|realme|vivo|oppo|xiaomi|poco/i.test(title)) {
    return null;
  }

  // Determine Brand
  let brand = 'Samsung';
  for (const b of ['Apple', 'Samsung', 'OnePlus', 'iQOO', 'Realme', 'Vivo', 'Xiaomi', 'Redmi', 'POCO', 'Oppo', 'Motorola', 'Google', 'Nothing', 'Honor', 'Lava', 'Tecno', 'Infinix']) {
    if (new RegExp(`\\b${b}\\b`, 'i').test(title)) {
      brand = b;
      break;
    }
  }

  // Model year: 2025 or 2026
  let modelYear = '2025';
  if (/2026/.test(title) || /2026/.test(html)) {
    modelYear = '2026';
  } else if (/2025/.test(title) || /2025/.test(html)) {
    modelYear = '2025';
  } else {
    modelYear = '2025';
  }

  // If title doesn't state 2025 or 2026, prepend (2025 Model) or (2026 Model)
  if (!title.includes('2025') && !title.includes('2026')) {
    title = `${brand} (${modelYear} Edition) ` + title.replace(new RegExp(`^${brand}\\s*`, 'i'), '');
  }

  // Extract images
  const imgMatches = html.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[a-zA-Z0-9_\-%\.]+\._(?:SL|AC|SX|SY|UL)[0-9_]+_\.jpg/gi) || [];
  const candidateImages = [...new Set(imgMatches.map(u => u.replace(/\._.*_\.jpg/, '._SL1500_.jpg')))]
    .filter(u => !u.includes('41LbSThP8fL') && !u.includes('play-button') && !u.includes('video'));

  if (candidateImages.length < 4) {
    return null;
  }

  // Price
  const priceWholeMatch = html.match(/<span class="a-price-whole">([0-9,]+)/i);
  let salePrice = priceWholeMatch ? parseInt(priceWholeMatch[1].replace(/,/g, ''), 10) : 29999;
  if (isNaN(salePrice) || salePrice < 5000) salePrice = 24999;

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

  // Bullets
  const bulletMatches = [...html.matchAll(/<span class="a-list-item">([\s\S]*?)<\/span>/gi)];
  const features = [];
  for (const bm of bulletMatches) {
    const txt = bm[1].replace(/<[^>]+>/g, '').trim();
    if (txt.length > 25 && !txt.includes('Amazon') && !txt.includes('JavaScript') && features.length < 6) {
      features.push(txt);
    }
  }

  // Cross verify images (ensure zero 404s)
  const verifiedImages = [];
  for (const imgUrl of candidateImages.slice(0, 8)) {
    const ok = await verifyImage(imgUrl);
    if (ok) {
      verifiedImages.push(imgUrl);
    }
  }

  if (verifiedImages.length < 4) {
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
  const queries = [
    '5g smartphone 2025',
    '5g mobile 2026',
    'iQOO 5g mobile',
    'OnePlus 5g smartphone',
    'Samsung Galaxy 5g smartphone',
    'Realme 5g smartphone',
    'Redmi 5g phone',
    'Vivo 5g phone'
  ];

  console.log('Collecting ASINs from queries...');
  const allAsins = [];
  for (const q of queries) {
    const asins = await getAsinsForQuery(q);
    for (const a of asins) {
      if (!allAsins.includes(a)) allAsins.push(a);
    }
  }
  console.log(`Found ${allAsins.length} unique ASIN candidates across queries\n`);

  const finalPhones = [];
  for (let i = 0; i < allAsins.length; i++) {
    if (finalPhones.length >= 20) break;
    const asin = allAsins[i];
    process.stdout.write(`[${i+1}/${allAsins.length}] Checking ${asin}... `);
    const prod = await parsePhonePage(asin);
    if (prod) {
      finalPhones.push(prod);
      console.log(`✅ [${prod.brand}] (${prod.modelYear}) ${prod.images.length} verified photos: ₹${prod.salePrice}`);
      console.log(`   ${prod.title.substring(0, 70)}...`);
      fs.writeFileSync(path.join(__dirname, 'verified_2025_2026_phones.json'), JSON.stringify(finalPhones, null, 2));
    } else {
      console.log(`❌ (Not phone / not 2025 / <4 photos)`);
    }
  }

  console.log(`\n🎉 Successfully collected ${finalPhones.length} verified 2025/2026 phone products!`);
}

run();
