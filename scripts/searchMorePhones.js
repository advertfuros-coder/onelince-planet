// scripts/searchMorePhones.js
const https = require('https');

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

async function search(q) {
  const res = await fetchUrl(`https://www.amazon.in/s?k=${encodeURIComponent(q)}`);
  if (res.statusCode !== 200) {
    console.log(`Query "${q}" failed with status: ${res.statusCode}`);
    return [];
  }
  const asins = [];
  const asinRegex = /data-asin="([A-Z0-9]{10})"/g;
  let m;
  while ((m = asinRegex.exec(res.body)) !== null) {
    if (m[1] && !asins.includes(m[1])) asins.push(m[1]);
  }
  return asins;
}

async function main() {
  const queries = [
    'OnePlus 12 5G',
    'Samsung Galaxy S24 Ultra',
    'Samsung Galaxy S24',
    'Apple iPhone 16',
    'Vivo V40 Pro',
    'Xiaomi 14',
    'Nothing Phone 2a',
    'Motorola Edge 50 Pro',
    'Google Pixel 9',
    'POCO X6 Pro'
  ];

  const seen = new Set();
  const allAsins = [];
  for (const q of queries) {
    const asins = await search(q);
    console.log(`Query "${q}" found ${asins.length} ASINs`);
    for (const a of asins) {
      if (!seen.has(a)) {
        seen.add(a);
        allAsins.push(a);
      }
    }
  }
  console.log(`\nTotal unique ASINs: ${allAsins.length}`);
  console.log(allAsins);
}

main();
