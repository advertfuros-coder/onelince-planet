const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const searchTerms = [
  { sku: 'DE-APL-IP16-128', query: 'Apple iPhone 16 128 GB Black' },
  { sku: 'DE-APL-IP15-128', query: 'Apple iPhone 15 128 GB Black' },
  { sku: 'DE-APL-IP13-128', query: 'Apple iPhone 13 128 GB Midnight' },
  { sku: 'DE-SAM-S24U-256', query: 'Samsung Galaxy S24 Ultra 5G Titanium Gray 256 GB' },
  { sku: 'DE-SAM-S23FE-128', query: 'Samsung Galaxy S23 FE 5G Mint 128 GB' },
  { sku: 'DE-SAM-M35-128', query: 'Samsung Galaxy M35 5G Daybreak Blue 128 GB' },
  { sku: 'DE-1PL-12-256', query: 'OnePlus 12 5G Silky Black 256 GB' },
  { sku: 'DE-1PL-12R-128', query: 'OnePlus 12R 5G Cool Blue 128 GB' },
  { sku: 'DE-1PL-NORDCE4-128', query: 'OnePlus Nord CE4 5G Dark Chrome 128 GB' },
  { sku: 'DE-XIA-14-512', query: 'Xiaomi 14 5G 512 GB' },
  { sku: 'DE-RED-NOTE13PP-256', query: 'Redmi Note 13 Pro+ 5G Fusion 256 GB' },
  { sku: 'DE-RED-13C5G-128', query: 'Redmi 13C 5G Starlight Black 128 GB' },
  { sku: 'DE-VIV-X100-256', query: 'Vivo X100 5G Stargaze Blue 256 GB' },
  { sku: 'DE-VIV-V40PRO-256', query: 'Vivo V40 Pro 5G Ganges Blue 256 GB' },
  { sku: 'DE-VIV-T3X-128', query: 'Vivo T3x 5G Crimson Bliss 128 GB' },
  { sku: 'DE-RLM-GT6T-256', query: 'Realme GT 6T 5G Fluid Silver 256 GB' },
  { sku: 'DE-RLM-12PROP-256', query: 'Realme 12 Pro+ 5G Submarine Blue 256 GB' },
  { sku: 'DE-RLM-NARZO70P-128', query: 'Realme Narzo 70 Pro 5G Glass Green 128 GB' },
  { sku: 'DE-OPP-RENO12P-512', query: 'Oppo Reno 12 Pro 5G Sunset Gold 512 GB' },
  { sku: 'DE-OPP-F27PROP-128', query: 'Oppo F27 Pro+ 5G Midnight Navy 128 GB' }
];

async function fetchWithRetry(url, headers = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers });
      if (res.ok) return res;
      if (res.status === 429) {
        await new Promise(r => setTimeout(r, 2000 * (i + 1)));
      }
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  return null;
}

async function scrapeFlipkartImages(query) {
  const searchUrl = 'https://www.flipkart.com/search?q=' + encodeURIComponent(query);
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  };

  const res = await fetchWithRetry(searchUrl, headers);
  if (!res) return [];

  const html = await res.text();
  // Find top product links
  const productMatches = [...html.matchAll(/\/[-a-z0-9]+\/p\/itm[a-z0-9]+/g)].map(m => 'https://www.flipkart.com' + m[0]);
  const productUrl = productMatches[0];
  if (!productUrl) {
    // If no /p/ link, fallback to searching direct images in the search results
    const directMatches = [...html.matchAll(/https:\/\/rukminim\d?\.flixcart\.com\/image\/\d+\/\d+\/(xif0q\/mobile\/[^\s\"\'\<\>]+?\.(?:jpeg|jpg|png|webp))/g)];
    const rawPaths = [...new Set(directMatches.map(m => m[1].split('?')[0]))];
    return rawPaths.slice(0, 5).map(p => `https://rukminim2.flixcart.com/image/832/832/${p}?q=70`);
  }

  // Fetch product page
  const prodRes = await fetchWithRetry(productUrl, headers);
  if (!prodRes) return [];
  const prodHtml = await prodRes.text();

  const regex = /https:\/\/rukminim\d?\.flixcart\.com\/image\/\d+\/\d+\/(xif0q\/mobile\/[^\s\"\'\<\>]+?\.(?:jpeg|jpg|png|webp))/g;
  const matches = [...prodHtml.matchAll(regex)];
  let rawPaths = [...new Set(matches.map(m => m[1].split('?')[0]))];

  // If no xif0q/mobile paths, check any image path on flixcart
  if (rawPaths.length === 0) {
    const generalRegex = /https:\/\/rukminim\d?\.flixcart\.com\/image\/\d+\/\d+\/([^\s\"\'\<\>]+?\.(?:jpeg|jpg|png|webp))/g;
    const generalMatches = [...prodHtml.matchAll(generalRegex)];
    rawPaths = [...new Set(generalMatches.map(m => m[1].split('?')[0]))];
  }

  const highRes = rawPaths.map(p => `https://rukminim2.flixcart.com/image/832/832/${p}?q=70`);
  return highRes;
}

async function run() {
  console.log('Testing scraping for 20 smartphones...');
  for (const item of searchTerms) {
    try {
      const imgs = await scrapeFlipkartImages(item.query);
      console.log(`\n[${item.sku}] Query: "${item.query}" -> Found ${imgs.length} images`);
      if (imgs.length > 0) {
        // Test first image HEAD
        const head = await fetch(imgs[0], { method: 'HEAD' });
        console.log(`Primary HEAD Status: ${head.status} | URL: ${imgs[0]}`);
      } else {
        console.log(`WARNING: 0 images found for ${item.sku}`);
      }
      await new Promise(r => setTimeout(r, 400));
    } catch (e) {
      console.error(`Error for ${item.sku}:`, e.message);
    }
  }
}

run();
