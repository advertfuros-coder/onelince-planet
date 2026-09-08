// scripts/testScrapePhonesLive.js
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

async function testFlipkart() {
  console.log('Testing Flipkart Mobiles...');
  const res = await fetchUrl('https://www.flipkart.com/search?q=5g+mobiles+2025');
  console.log('Flipkart status:', res.statusCode, 'len:', res.body.length);

  // Extract links and images
  const cards = [...res.body.matchAll(/href="(\/[^"]+?\/p\/itm[a-zA-Z0-9]+[^"]*?)"[\s\S]*?<img[^>]+src="([^">]+rukminim2\.flixcart\.com\/image\/[^">]+)"[^>]*alt="([^">]+)"/g)];
  console.log('Cards with image and title found on Flipkart:', cards.length);
  cards.slice(0, 10).forEach((c, idx) => {
    console.log(`${idx+1}. Title: ${c[3]}`);
    console.log(`   Img: ${c[2]}`);
    console.log(`   Path: ${c[1].split('?')[0]}`);
  });
}

async function testAmazon() {
  console.log('\nTesting Amazon Mobiles...');
  const res = await fetchUrl('https://www.amazon.in/s?k=5g+smartphone+2025+model');
  console.log('Amazon status:', res.statusCode, 'len:', res.body.length);

  const asinRegex = /data-asin="([A-Z0-9]{10})"/g;
  const asins = [];
  let m;
  while ((m = asinRegex.exec(res.body)) !== null) {
    if (m[1] && !asins.includes(m[1])) asins.push(m[1]);
  }
  console.log('Amazon ASINs found:', asins.length);
  console.log('Sample ASINs:', asins.slice(0, 10));
}

async function main() {
  await testFlipkart();
  await testAmazon();
}

main();
