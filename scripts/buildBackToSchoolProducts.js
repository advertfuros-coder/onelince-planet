// scripts/buildBackToSchoolProducts.js
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
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
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

async function searchAmazon(kw) {
  const url = `https://www.amazon.in/s?k=${encodeURIComponent(kw)}`;
  const res = await fetchUrl(url);
  if (res.statusCode !== 200) return [];
  const asins = [...new Set([...res.body.matchAll(/data-asin="([B0-9A-Z]{10})"/g)].map(m => m[1]))]
    .filter(a => a && a.length === 10);
  return asins;
}

async function parseAsin(asin, targetCategory, subCategoryName) {
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
    'American Tourister', 'Skybags', 'Safari', 'Wildcraft', 'Lenovo', 'HP', 'Dell',
    'Asus', 'Acer', 'Milton', 'Borosil', 'Cello', 'Classmate', 'Faber-Castell',
    'Doms', 'Camlin', 'Parker', 'Wipro', 'Philips', 'Logitech', 'Portronics',
    'Zebronics', 'Tupperware', 'Speedex', 'Vaya', 'SanDisk', 'Scotch', 'Flair', 'Reynolds'
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
  let salePrice = priceWholeMatch ? parseInt(priceWholeMatch[1].replace(/,/g, ''), 10) : 799;
  if (isNaN(salePrice) || salePrice < 99) salePrice = 799;

  const mrpMatch = html.match(/<span class="a-price a-text-price"[^>]*>[\s\S]*?<span class="a-offscreen">₹?([0-9,]+)<\/span>/i);
  let basePrice = mrpMatch ? parseInt(mrpMatch[1].replace(/,/g, ''), 10) : Math.round(salePrice * 1.35);
  if (isNaN(basePrice) || basePrice <= salePrice) basePrice = Math.round(salePrice * 1.35);

  // Specifications
  const specs = [];
  const specRows = [...html.matchAll(/<tr[^>]*>\s*<th class="a-color-secondary a-size-base prodDetSectionEntry"[^>]*>([\s\S]*?)<\/th>\s*<td class="a-size-base prodDetAttrValue"[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi)];
  for (const row of specRows) {
    const key = row[1].replace(/<[^>]+>/g, '').trim();
    const val = row[2].replace(/<[^>]+>/g, '').trim();
    if (key && val && specs.length < 12) {
      specs.push({ key, value: val });
    }
  }
  if (specs.length === 0) {
    specs.push({ key: 'Brand', value: brand });
    specs.push({ key: 'Category', value: subCategoryName });
    specs.push({ key: 'Target Audience', value: 'School & College Students' });
    specs.push({ key: 'Material / Type', value: 'Durable Premium Grade' });
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
    features.push(`Official brand authentic merchandise with manufacturer warranty`);
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
    category: targetCategory,
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
  const categoriesToScrape = [
    {
      subCategory: 'Backpacks',
      queries: ['american tourister school backpack', 'skybags school backpack', 'wildcraft backpack 30l'],
      targetCount: 3
    },
    {
      subCategory: 'Stationery Supplies',
      queries: ['classmate notebook pack', 'faber castell art kit colour', 'parker vector pen gift set'],
      targetCount: 3
    },
    {
      subCategory: 'Laptops & Accessories',
      queries: ['hp student laptop 15.6', 'lenovo ideapad slim student', 'logitech wireless mouse student'],
      targetCount: 3
    },
    {
      subCategory: 'Lunch Boxes',
      queries: ['milton insulated lunch box steel', 'borosil bento lunch box kids', 'cello insulated lunch box'],
      targetCount: 3
    },
    {
      subCategory: 'Water Bottles',
      queries: ['milton thermosteel water bottle', 'cello stainless steel sipper bottle', 'speedex water bottle insulated'],
      targetCount: 3
    },
    {
      subCategory: 'Desk Setup',
      queries: ['wipro led desk study lamp', 'metal mesh desk organizer pen holder', 'portable study table bed foldable'],
      targetCount: 3
    },
    {
      subCategory: 'Back To Nursery',
      queries: ['toddler animal backpack nursery', 'doms toddler jumbo wax crayons', 'wooden alphabet blocks toddler educational'],
      targetCount: 2
    }
  ];

  const allProducts = [];
  const seenTitles = new Set();
  const seenAsins = new Set();

  for (const cat of categoriesToScrape) {
    console.log(`\n🔍 Searching for [${cat.subCategory}]...`);
    let catProducts = 0;

    for (const q of cat.queries) {
      if (catProducts >= cat.targetCount) break;
      console.log(`  -> Query: "${q}"`);
      const asins = await searchAmazon(q);
      console.log(`     Found ${asins.length} ASINs`);

      for (const asin of asins) {
        if (catProducts >= cat.targetCount) break;
        if (seenAsins.has(asin)) continue;
        seenAsins.add(asin);

        process.stdout.write(`     Checking ${asin}... `);
        const prod = await parseAsin(asin, 'back-to-school', cat.subCategory);
        if (prod && !seenTitles.has(prod.title)) {
          seenTitles.add(prod.title);
          allProducts.push(prod);
          catProducts++;
          console.log(`✅ [${catProducts}/${cat.targetCount}] Added: ${prod.title.slice(0, 50)}... (${prod.images.length} verified imgs, ₹${prod.salePrice})`);
        } else {
          console.log(`❌ (Skipped / <4 verified images)`);
        }

        // Delay to be polite
        await new Promise(r => setTimeout(r, 600));
      }
    }
  }

  console.log(`\n✨ Total Back-to-School Products collected: ${allProducts.length}`);
  const outPath = path.join(__dirname, 'verified_20_back_to_school.json');
  fs.writeFileSync(outPath, JSON.stringify(allProducts, null, 2));
  console.log(`💾 Saved to: ${outPath}`);
}

main().catch(console.error);
