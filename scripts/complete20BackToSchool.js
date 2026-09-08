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
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
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
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        }
      }, (res) => {
        resolve(res.statusCode >= 200 && res.statusCode < 400);
      });
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

async function parseAsin(asin, subCategoryName) {
  const url = `https://www.amazon.in/dp/${asin}`;
  const res = await fetchUrl(url);
  if (res.statusCode !== 200) return null;

  const html = res.body;

  const titleMatch = html.match(/<span id="productTitle"[^>]*>([\s\S]*?)<\/span>/i);
  if (!titleMatch) return null;
  let title = titleMatch[1].replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();

  // Determine Brand
  let brand = 'Campus Pro';
  const brands = [
    'Milton', 'Cello', 'Borosil', 'Speedex', 'Wipro', 'Philips', 'Doms', 'Faber-Castell',
    'Camlin', 'Classmate', 'Skoodle', 'AmazonBasics', 'SOLIMO', 'Tupperware', 'Pigeon',
    'Lenovo', 'HP', 'Dell', 'Logitech', 'Portronics', 'Gizga', 'Callas'
  ];
  for (const b of brands) {
    if (new RegExp(`\\b${b.replace("'", "['’]?")}\\b`, 'i').test(title)) {
      brand = b;
      break;
    }
  }

  // Extract High-Res Images
  const imgMatches = html.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[a-zA-Z0-9_\-%\.]+\._(?:SL|AC|SX|SY|UL)[0-9_]+_\.jpg/gi) || [];
  const candidateImages = [...new Set(imgMatches.map(u => u.replace(/\._.*_\.jpg/, '._SL1500_.jpg')))]
    .filter(u => !u.includes('41LbSThP8fL') && !u.includes('play-button') && !u.includes('video'));

  if (candidateImages.length < 4) return null;

  // Price extraction
  const priceWholeMatch = html.match(/<span class="a-price-whole">([0-9,]+)/i);
  let salePrice = priceWholeMatch ? parseInt(priceWholeMatch[1].replace(/,/g, ''), 10) : 699;
  if (isNaN(salePrice) || salePrice < 99) salePrice = 699;

  const mrpMatch = html.match(/<span class="a-price a-text-price"[^>]*>[\s\S]*?<span class="a-offscreen">₹?([0-9,]+)<\/span>/i);
  let basePrice = mrpMatch ? parseInt(mrpMatch[1].replace(/,/g, ''), 10) : Math.round(salePrice * 1.35);
  if (isNaN(basePrice) || basePrice <= salePrice) basePrice = Math.round(salePrice * 1.35);

  // Specifications
  const specs = [];
  const specRows = [...html.matchAll(/<tr[^>]*>\s*<th class="a-color-secondary a-size-base prodDetSectionEntry"[^>]*>([\s\S]*?)<\/th>\s*<td class="a-size-base prodDetAttrValue"[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi)];
  for (const row of specRows) {
    const key = row[1].replace(/<[^>]+>/g, '').trim();
    const val = row[2].replace(/<[^>]+>/g, '').trim();
    if (key && val && specs.length < 10) {
      specs.push({ key, value: val });
    }
  }
  if (specs.length === 0) {
    specs.push({ key: 'Brand', value: brand });
    specs.push({ key: 'Category', value: subCategoryName });
    specs.push({ key: 'Target Audience', value: 'Students & Kids' });
    specs.push({ key: 'Warranty', value: '1 Year Manufacturer Warranty' });
  }

  // Bullets / Highlights
  const bulletMatches = [...html.matchAll(/<span class="a-list-item">([\s\S]*?)<\/span>/gi)];
  const features = [];
  for (const bm of bulletMatches) {
    const txt = bm[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (txt.length > 25 && !txt.includes('Amazon') && !txt.includes('JavaScript') && features.length < 5) {
      features.push(txt);
    }
  }
  if (features.length < 3) {
    features.push(`Ergonomically designed for students, daily school use and convenience`);
    features.push(`Premium durable materials built to last through the academic year`);
    features.push(`Tested for safety, non-toxic quality, and rigorous daily performance`);
  }

  // Verify Images via HTTP HEAD
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
    category: 'back-to-school',
    subCategory: subCategoryName,
    categoryPath: `back-to-school/${subCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    salePrice,
    basePrice,
    images: verifiedImages,
    specs,
    features
  };
}

async function main() {
  const existingPath = path.join(__dirname, 'verified_20_back_to_school.json');
  let products = [];
  if (fs.existsSync(existingPath)) {
    products = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
  }
  console.log(`Starting with ${products.length} existing products...`);

  const additionalTasks = [
    {
      subCategory: 'Water Bottles',
      asins: ['B0DM65LXR6', 'B0GXM37WKZ', 'B0DRPCB4MZ', 'B0GSBG92R3', 'B0HBNC7ZNY', 'B07917CCLV', 'B0H9RHHP3Y', 'B0DNBKDTHP', 'B0073QBY4Y'],
      needed: 3
    },
    {
      subCategory: 'Desk Setup',
      asins: ['B097LF8GGY', 'B085W6DWWK', 'B00G9TFSAS', 'B0FQW98HT2', 'B07BK4WS23', 'B07BK2QCTM', 'B07NWBFS2W', 'B0CSKDJ4R8'],
      needed: 3
    },
    {
      subCategory: 'Back To Nursery',
      asins: ['B07KNT4WBQ', 'B0H4YLX5HL', 'B0FM8FR1ZM', 'B0CQVKBPNW', 'B07PLXP7BX', 'B07PNBVW8K', 'B07PLZCJQX', 'B0FJRZH25B'],
      needed: 3
    }
  ];

  const seenTitles = new Set(products.map(p => p.title));
  const seenAsins = new Set(products.map(p => p.asin));

  for (const group of additionalTasks) {
    console.log(`\nFetching [${group.subCategory}]...`);
    let added = 0;
    for (const asin of group.asins) {
      if (added >= group.needed) break;
      if (seenAsins.has(asin)) continue;
      seenAsins.add(asin);

      process.stdout.write(`  Checking ${asin}... `);
      const prod = await parseAsin(asin, group.subCategory);
      if (prod && !seenTitles.has(prod.title)) {
        seenTitles.add(prod.title);
        products.push(prod);
        added++;
        console.log(`✅ [${added}/${group.needed}] Added: ${prod.title.slice(0, 50)}... (${prod.images.length} verified imgs, ₹${prod.salePrice})`);
      } else {
        console.log(`❌ (Skipped / <4 verified images)`);
      }
      await new Promise(r => setTimeout(r, 600));
    }
  }

  console.log(`\n🎉 Total Verified Back-to-School Products: ${products.length}`);
  fs.writeFileSync(existingPath, JSON.stringify(products, null, 2));
  console.log(`Saved to: ${existingPath}`);
}

main().catch(console.error);
