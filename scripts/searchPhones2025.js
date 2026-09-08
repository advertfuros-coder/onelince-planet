// scripts/searchPhones2025.js
const https = require('https');

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
      req.setTimeout(10000, () => { req.destroy(); resolve({ statusCode: 408, body: '' }); });
    } catch (e) {
      resolve({ statusCode: 500, body: e.message });
    }
  });
}

async function getProductsForQuery(query) {
  const url = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
  const res = await fetchUrl(url);
  if (res.statusCode !== 200) return [];

  const items = [...res.body.matchAll(/data-asin="([A-Z0-9]{10})"[\s\S]*?<img[^>]+src="(https:\/\/m\.media-amazon\.com\/images\/I\/[^">]+)"[\s\S]*?<h2[^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/g)];
  return items.map(m => ({
    asin: m[1],
    img: m[2].replace(/\._.*_\.jpg/, '._SL1500_.jpg'),
    title: m[3].replace(/&amp;/g, '&').trim()
  }));
}

async function test() {
  const queries = [
    'OnePlus 13 5G',
    'OnePlus 13R 5G',
    'Samsung Galaxy S25 Ultra',
    'Samsung Galaxy S25',
    'iPhone 16 Pro Max',
    'iPhone 16',
    'iQOO 13 5G',
    'Realme GT 7 Pro',
    'Vivo X200 Pro',
    'Pixel 9 Pro XL',
    'Redmi Note 14 Pro Plus 5G',
    'Realme 14 Pro Plus 5G'
  ];

  const seen = new Set();
  const all = [];

  for (const q of queries) {
    const prods = await getProductsForQuery(q);
    console.log(`Query "${q}" -> ${prods.length} results`);
    for (const p of prods) {
      if (!seen.has(p.asin) && p.title.length > 20 && !/case|cover|tempered|glass|pouch|charger/i.test(p.title)) {
        seen.add(p.asin);
        all.push(p);
      }
    }
  }

  console.log(`\nTotal unique phones found: ${all.length}`);
  all.slice(0, 25).forEach((p, i) => {
    console.log(`${i+1}. [${p.asin}] ${p.title.substring(0, 75)}...`);
  });
}

test();
