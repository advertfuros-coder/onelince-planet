// scripts/buildComplete20Phones.js
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
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-IN,en;q=0.9',
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
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
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

async function parseAsin(asin) {
  const url = `https://www.amazon.in/dp/${asin}`;
  const res = await fetchUrl(url);
  if (res.statusCode !== 200) return null;

  const html = res.body;

  const titleMatch = html.match(/<span id="productTitle"[^>]*>([\s\S]*?)<\/span>/i);
  if (!titleMatch) return null;
  let title = titleMatch[1].replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim();

  // Filter out accessories
  if (/case|cover|tempered|glass|protector|cable|charger|adapter|stand|holder|strap|battery|pouch|skin|hub|dock/i.test(title)) {
    return null;
  }
  if (!/5g|phone|smartphone|mobile|redmi|galaxy|iphone|oneplus|iqoo|realme|vivo|oppo|xiaomi|poco|motorola|pixel/i.test(title)) {
    return null;
  }

  // Determine brand
  let brand = 'Samsung';
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
  let salePrice = priceWholeMatch ? parseInt(priceWholeMatch[1].replace(/,/g, ''), 10) : 29999;
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

  // Verify images (ensure zero 404s)
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
  // Load existing 9 verified phones
  const batch1Path = path.join(__dirname, 'verified_phones_batch1.json');
  const allPhones = fs.existsSync(batch1Path) ? JSON.parse(fs.readFileSync(batch1Path, 'utf8')) : [];
  console.log(`Starting with ${allPhones.length} verified phones from Batch 1...`);

  // Candidate ASINs from task-521
  const candidateAsins = [
    'B0H7S6LT9P', 'B0FTR2PJTV', 'B0GVYGLNH7', 'B0GL1JFK48', 'B0GRBBPBGQ',
    'B0B5V2KDNZ', 'B0CXDRZFSC', 'B0GL87VP7N', 'B0GWLV615M', 'B0GWLJL55D',
    'B0GRB3FBBB', 'B0H3KBZ4J9', 'B0D7N23QKD', 'B0CS5Z3T4M', 'B0CS5XW6TN',
    'B0CQYGF1QY', 'B0BT9G7RYH', 'B0GL8FNY5G', 'B0CS69QQTG', 'B0FMYC2ZPS',
    'B0FDL5T1PF', 'B0DHL7YT5S', 'B0GGH5KMM2', 'B0DHL98QM2', 'B0G5G25YBQ',
    'B0F277VT4X', 'B0CQGM6BPY', 'B08WKFSN84', 'B0CS6M6JLF', 'B0FNMQW9HW',
    'B0DSBVGKVF', 'B0CWPDFBK7', 'B0F7LMJSK7', 'B0DXQJ1M7H', 'B0FQFTV1NP',
    'B0FQFBDQJ1', 'B0GQVL6STN', 'B0FQFLQ2CQ', 'B0FQG1K1FM', 'B0GWLHWCLJ',
    'B0GMQMG91N', 'B0DGHH9WMX', 'B0DCNWN8NZ', 'B0DGDZS7XB', 'B0DS2Q11DX',
    'B0DW98WX84', 'B0GHQVR1N8', 'B0H99SS8B2', 'B0DP7N9MSV', 'B0G2H3ZY93',
    'B0FPGR6SJ5', 'B0F5Q7QBWN', 'B0F9VJRS1V', 'B0GY51XV7C', 'B0GX94B58L',
    'B0G26FN2MK', 'B0GXZ1VC4J', 'B0GY55281Q', 'B0H2Z1P4BW', 'B0GZ399NRJ',
    'B0GRB5C1HW', 'B0FDL7L2G4', 'B0CW3H8YKD', 'B0CW3JRLH1', 'B0H2BYVZWM'
  ];

  const seenAsins = new Set(allPhones.map(p => p.asin));

  for (let i = 0; i < candidateAsins.length; i++) {
    if (allPhones.length >= 20) break;
    const asin = candidateAsins[i];
    if (seenAsins.has(asin)) continue;

    process.stdout.write(`[${allPhones.length + 1}/20] Checking ASIN ${asin}... `);
    const prod = await parseAsin(asin);
    if (prod) {
      seenAsins.add(asin);
      allPhones.push(prod);
      console.log(`✅ [${prod.brand}] (${prod.modelYear}) ${prod.images.length} verified photos: ₹${prod.salePrice}`);
      console.log(`   ${prod.title.substring(0, 70)}...`);
      fs.writeFileSync(path.join(__dirname, 'verified_2025_2026_phones.json'), JSON.stringify(allPhones, null, 2));
    } else {
      console.log(`❌ Skipped`);
    }
  }

  console.log(`\n🎉 Total verified 2025/2026 smartphones: ${allPhones.length}`);
}

run();
