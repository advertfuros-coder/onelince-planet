// scripts/scrapeAndVerifyWomenTops.js
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

function fetchUrl(url, redirectCount = 0) {
  return new Promise((resolve) => {
    if (redirectCount > 5) return resolve({ statusCode: 500, body: '' });
    try {
      const parsed = new URL(url);
      const isHttps = parsed.protocol === 'https:';
      const client = isHttps ? https : http;

      const options = {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept':
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-IN,en-US;q=0.9,en;q=0.8',
        },
      };

      const req = client.get(options, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          let loc = res.headers.location;
          if (!loc.startsWith('http')) {
            loc = parsed.origin + loc;
          }
          return resolve(fetchUrl(loc, redirectCount + 1));
        }

        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
      });

      req.on('error', (err) => resolve({ statusCode: 500, body: err.message }));
      req.setTimeout(12000, () => {
        req.destroy();
        resolve({ statusCode: 408, body: '' });
      });
    } catch (e) {
      resolve({ statusCode: 500, body: e.message });
    }
  });
}

function verifyImage(url) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const isHttps = parsed.protocol === 'https:';
      const client = isHttps ? https : http;

      const req = client.request(
        {
          method: 'HEAD',
          hostname: parsed.hostname,
          path: parsed.pathname + parsed.search,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          },
        },
        (res) => {
          resolve(res.statusCode >= 200 && res.statusCode < 400);
        }
      );
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

async function scrapeCandidateProducts() {
  const searchQueries = [
    'women+crop+tops+stylish+2025',
    'women+oversized+tshirt+korean+aesthetic',
    'women+stylish+western+top+trendy',
    'women+ribbed+crop+top+casual',
    'women+cotton+printed+tshirt+streetwear',
    'women+peplum+floral+top+summer',
  ];

  const candidateUrls = new Set();

  for (const q of searchQueries) {
    const searchUrl = `https://www.flipkart.com/search?q=${q}`;
    console.log(`🔎 Searching: ${searchUrl}`);
    const res = await fetchUrl(searchUrl);
    if (res.statusCode === 200) {
      const matches = [...res.body.matchAll(/href="(\/[^"]+?\/p\/itm[a-zA-Z0-9]+[^"]*?)"/g)];
      for (const m of matches) {
        const clean = m[1].split('?')[0];
        candidateUrls.add('https://www.flipkart.com' + clean);
      }
    }
    await new Promise((r) => setTimeout(r, 600));
  }

  console.log(`\n📌 Total candidate product URLs collected: ${candidateUrls.size}`);

  const verifiedProducts = [];

  for (const prodUrl of candidateUrls) {
    if (verifiedProducts.length >= 25) break;

    console.log(`\n📦 Checking (${verifiedProducts.length + 1}/20): ${prodUrl}`);
    const res = await fetchUrl(prodUrl);
    if (res.statusCode !== 200 || !res.body) {
      console.log('❌ Failed to fetch page, skipping');
      continue;
    }

    const stateMatch = res.body.match(/window\.__INITIAL_STATE__\s*=\s*({[\s\S]+?});\s*<\/script>/);
    if (!stateMatch) {
      console.log('❌ No __INITIAL_STATE__ found, skipping');
      continue;
    }

    let state;
    try {
      state = JSON.parse(stateMatch[1]);
    } catch (e) {
      console.log('❌ Failed to parse state JSON');
      continue;
    }

    const schemaProduct = state.multiWidgetState?.pageDataResponse?.seoData?.schema?.find(
      (s) => s['@type'] === 'Product'
    );

    if (!schemaProduct) {
      console.log('❌ No schema Product found');
      continue;
    }

    const name = schemaProduct.name;
    const rawBrand = schemaProduct.brand?.name || 'GENZ Trend';
    const salePrice = Number(schemaProduct.offers?.price) || 499;
    let basePrice = Math.round(salePrice * (1.8 + Math.random() * 0.7)); // Realistic MRP
    if (schemaProduct.description) {
      const mrpMatch = schemaProduct.description.match(/(?:Rs\.|₹|Rs)\s*([0-9]+(?:\.[0-9]+)?)/i);
      if (mrpMatch && Number(mrpMatch[1]) > salePrice) {
        basePrice = Math.round(Number(mrpMatch[1]));
      }
    }

    // Collect all candidate images
    let rawImages = Array.isArray(schemaProduct.image) ? schemaProduct.image : [schemaProduct.image];
    // Also look for other image URLs in the page body matching rukminim
    const bodyImages = [
      ...res.body.matchAll(
        /(https:\/\/(?:rukminim1|rukminim2)\.flixcart\.com\/image\/[^\s"'\\]+?\.(?:jpeg|jpg|png))/g
      ),
    ].map((m) => m[1]);

    const allImgCandidates = [
      ...rawImages,
      ...bodyImages,
    ]
      .filter(Boolean)
      .map((u) => u.replace(/\\/g, '').replace(/\/image\/[0-9]+\/[0-9]+\//, '/image/832/832/'));

    // Unique URLs
    const uniqueCandidates = [...new Set(allImgCandidates)];

    // Filter out common site icons / placeholders
    const productImgs = uniqueCandidates.filter(
      (u) =>
        !u.includes('placeholder') &&
        !u.includes('logo') &&
        !u.includes('sprite') &&
        !u.includes('fk-cp-zion') &&
        (u.includes('/top/') || u.includes('/t-shirt/') || u.includes('/shirt/'))
    );

    console.log(`🖼️ Candidate product images found: ${productImgs.length}`);

    // Verify image URLs with HEAD request
    const validImages = [];
    for (const imgUrl of productImgs) {
      if (validImages.length >= 6) break;
      const isValid = await verifyImage(imgUrl);
      if (isValid) {
        validImages.push(imgUrl);
        console.log(`  ✅ 200 OK: ${imgUrl.slice(0, 75)}...`);
      } else {
        console.log(`  ❌ 404/Failed: ${imgUrl.slice(0, 75)}...`);
      }
    }

    if (validImages.length < 4) {
      console.log(`⚠️ Only ${validImages.length} verified images (< 4 required). Skipping product.`);
      continue;
    }

    const discountPercentage = Math.round(((basePrice - salePrice) / basePrice) * 100);
    const costPrice = Math.round(salePrice * 0.55);

    const productData = {
      name: name,
      brand: rawBrand,
      sourceUrl: prodUrl,
      basePrice: basePrice,
      salePrice: salePrice,
      costPrice: costPrice,
      discountPercentage: discountPercentage,
      images: validImages.map((u, idx) => ({
        url: u,
        alt: `${name} - View ${idx + 1}`,
        isPrimary: idx === 0,
      })),
      verifiedImageCount: validImages.length,
      rawSchema: {
        color: schemaProduct.color || 'Multicolor',
        category: schemaProduct.category || 'top',
        description: schemaProduct.description,
      },
    };

    verifiedProducts.push(productData);
    console.log(
      `🎉 Successfully verified product #${verifiedProducts.length}: "${name}" with ${validImages.length} verified images!`
    );

    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n======================================================`);
  console.log(`Total verified products with >= 4 live photos: ${verifiedProducts.length}`);
  console.log(`======================================================`);

  fs.writeFileSync(
    path.join(__dirname, 'verified_women_tops.json'),
    JSON.stringify(verifiedProducts, null, 2),
    'utf-8'
  );
  console.log('Saved to scripts/verified_women_tops.json');
}

scrapeCandidateProducts().catch(console.error);
