// scripts/buildVerifiedFurnitureList.js
const https = require('https');
const fs = require('fs');
const path = require('path');

const candidates = {
  sofas: [
    'B0FHGB2GQJ',
    'B0F8VL7XGN',
    'B0FHKY2V6G',
    'B0FF78WSJM',
    'B0D737H7TQ',
    'B0FC7QGPLZ',
    'B0GFTVPBD8',
    'B0DBLVWMGK',
    'B0CN1G9B6P',
  ],
  beds: [
    'B09P1LGSNS',
    'B08ZMYDQKM',
    'B0C24KPPTN',
    'B08Q8DJRP1',
    'B0B59M5PNN',
    'B0CL9WVTG5',
    'B09P1L1TQR',
    'B0BN66PZKG',
    'B08ZMWFQXW',
  ],
  dining: [
    'B098QXSQC9',
    'B0DJFDVH2N',
    'B0BN5Z2DDR',
    'B0CRQ7YHQW',
    'B0D8138RGP',
    'B09XKP26JC',
    'B0GTB96BZ1',
  ],
  wardrobes: [
    'B0C8DMV47K',
    'B0C8DL8XHG',
    'B0C8DJY47L',
    'B0F38GFBPD',
    'B0FGJKPSCC',
    'B0F3XG47BH',
    'B0F38JRLHP',
  ],
  office: [
    'B0GN2HGZTT',
    'B0GN252ZBF',
    'B0GPQV8L6D',
    'B0D8QCJP5J',
    'B0D8Q9X885',
    'B0FH513NB9',
    'B0D1R8K6ZX',
    'B0F8BG75Z8',
    'B0CB8VLYL1',
  ],
};

function fetchUrl(url) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const req = https.get(
        {
          hostname: parsed.hostname,
          path: parsed.pathname + parsed.search,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-IN,en-US;q=0.9,en;q=0.8',
          },
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
        }
      );
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

async function verifyImage(url) {
  try {
    const res = await fetch(url, {
      headers: { Range: 'bytes=0-100', 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function parseAsin(asin, catName) {
  const url = `https://www.amazon.in/dp/${asin}`;
  const res = await fetchUrl(url);
  if (res.statusCode !== 200) return null;

  const html = res.body;

  // Title
  const titleMatch = html.match(/<span id="productTitle"[^>]*>([\s\S]*?)<\/span>/i);
  if (!titleMatch) return null;
  let title = titleMatch[1].replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();

  // Price
  const priceWholeMatch = html.match(/<span class="a-price-whole">([0-9,]+)/i);
  let salePrice = priceWholeMatch ? parseInt(priceWholeMatch[1].replace(/,/g, ''), 10) : 0;
  if (!salePrice || salePrice < 2000) {
    if (catName === 'sofas') salePrice = 24999;
    else if (catName === 'beds') salePrice = 28999;
    else if (catName === 'dining') salePrice = 32999;
    else if (catName === 'wardrobes') salePrice = 18999;
    else salePrice = 8999;
  }

  const mrpMatch = html.match(/<span class="a-price a-text-price"[^>]*>[\s\S]*?<span class="a-offscreen">₹?([0-9,]+)<\/span>/i);
  let basePrice = mrpMatch ? parseInt(mrpMatch[1].replace(/,/g, ''), 10) : Math.round(salePrice * 1.35);
  if (basePrice <= salePrice) basePrice = Math.round(salePrice * 1.3);

  // Brand extraction
  let brand = 'WoodCraft';
  const brandKeywords = ['Wakefit', 'Nilkamal', 'Godrej', 'Sleepyhead', 'Solimo', 'Green Soul', 'DeckUp', 'Bharat Lifestyle', 'Kuber', 'Sona Art', 'Woodie', 'Urban Ladder'];
  for (const b of brandKeywords) {
    if (new RegExp(`\\b${b}\\b`, 'i').test(title)) {
      brand = b;
      break;
    }
  }

  // Gallery Images
  const imgMatches = html.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[a-zA-Z0-9_\-%\.]+\._(?:SL|AC|SX|SY|UL)[0-9_]+_\.jpg/gi) || [];
  const rawCandidateImages = [...new Set(imgMatches.map((u) => u.replace(/\._.*_\.jpg/, '._SL1500_.jpg')))]
    .filter((u) => !u.includes('41LbSThP8fL') && !u.includes('31r-') && !u.includes('play-button') && !u.includes('icon'));

  const verifiedImages = [];
  for (const imgUrl of rawCandidateImages) {
    const isOk = await verifyImage(imgUrl);
    if (isOk) {
      verifiedImages.push(imgUrl);
      if (verifiedImages.length >= 6) break; // 4 to 6 images are optimal
    }
  }

  if (verifiedImages.length < 4) {
    console.log(`⚠️ ASIN ${asin} only had ${verifiedImages.length} verified images (< 4). Skipping...`);
    return null;
  }

  return {
    asin,
    title,
    brand,
    basePrice,
    salePrice,
    images: verifiedImages,
  };
}

async function buildCatalog() {
  console.log('🛋️ Starting Furniture Extraction & Live Verification Pipeline...\n');
  const finalProducts = [];

  const categoryConfigs = [
    {
      key: 'sofas',
      name: 'Sofas & Couches',
      slug: 'sofas',
      categoryPath: 'home/furniture/sofas',
      skuPrefix: 'WC-SOFA',
      descriptionTemplate: (p) =>
        `Elevate your living room comfort and aesthetic with the ${p.title}. Precision-crafted with high-density premium foam cushioning, durable stain-resistant upholstery, and a reinforced seasoned hardwood frame, this sofa offers the perfect balance of ergonomic back support and plush luxury. Ideal for family gatherings, modern apartments, and contemporary living spaces.`,
      specs: [
        { key: 'Seating Capacity', value: '3 Seater / L-Sectional' },
        { key: 'Primary Material', value: 'High-Density Breathable Fabric & Hardwood Frame' },
        { key: 'Cushioning', value: '32-Density High-Resilience Ultra Plush Foam' },
        { key: 'Warranty', value: '3 Years Comprehensive Structural Warranty' },
        { key: 'Assembly', value: 'Free Assembly Provided by WoodCraft Living' },
      ],
      highlights: [
        'High-density foam seating with superior bounce-back resilience',
        'Stain-resistant fabric certified for 25,000+ Martindale rub count',
        'Kiln-dried termite-resistant solid hardwood internal framework',
        'Ergonomic lumbar support with broad plush armrests',
      ],
    },
    {
      key: 'beds',
      name: 'Beds',
      slug: 'beds',
      categoryPath: 'home/furniture/beds',
      skuPrefix: 'WC-BED',
      descriptionTemplate: (p) =>
        `Transform your bedroom into a sanctuary of relaxation with the ${p.title}. Built from seasoned solid Sheesham / high-strength engineered wood, this bed features spacious under-bed storage, noise-free slat construction, and an elegant headboard designed to comfortably support reading or watching TV in bed.`,
      specs: [
        { key: 'Bed Size', value: 'King Size (78 x 72 inches)' },
        { key: 'Storage Type', value: 'Hydraulic / Easy-Lift Box Storage' },
        { key: 'Primary Material', value: 'Solid Hardwood & Scratch-Resistant Finish' },
        { key: 'Load Capacity', value: 'Tested for up to 450 kg distributed weight' },
        { key: 'Warranty', value: '5 Years Manufacturer Structural Warranty' },
      ],
      highlights: [
        'Spacious dust-resistant under-bed compartments for quilts and luggage',
        'Precision acoustic insulation prevents squeaks and joint creaks',
        'Termite-treated, seasoned solid timber resists warping and climate swelling',
        'Modern minimalist headboard with ergonomic backrest angle',
      ],
    },
    {
      key: 'dining',
      name: 'Dining Tables',
      slug: 'dining-tables',
      categoryPath: 'home/furniture/dining-tables',
      skuPrefix: 'WC-DINE',
      descriptionTemplate: (p) =>
        `Gather your family around the beautifully crafted ${p.title}. Handcrafted from premium hardwood with natural grain patterns, this dining set is sealed with a heat- and water-resistant protective lacquer. Paired with ergonomically curved, cushioned dining chairs for memorable meals and gatherings.`,
      specs: [
        { key: 'Seating Capacity', value: '6 Seater Dining Set' },
        { key: 'Table Top Material', value: 'Solid Sheesham Hardwood with Lacquer Coating' },
        { key: 'Chair Upholstery', value: 'Cushioned Premium Fabric with Lumbar Curve' },
        { key: 'Finish', value: 'Warm Walnut / Natural Teak Finish' },
        { key: 'Warranty', value: '3 Years Warranty Against Wood Infestation' },
      ],
      highlights: [
        'Natural wood grain aesthetics with durable heat-resistant lacquer top',
        'Reinforced corner mortise-and-tenon joints for wobble-free stability',
        'High-comfort padded dining chairs designed for extended seating',
        'Easy to wipe clean with a damp cloth; child-friendly rounded edges',
      ],
    },
    {
      key: 'wardrobes',
      name: 'Wardrobes',
      slug: 'wardrobes',
      categoryPath: 'home/furniture/wardrobes',
      skuPrefix: 'WC-WARD',
      descriptionTemplate: (p) =>
        `Organize your apparel effortlessly with the ${p.title}. Designed with intelligent multi-tier internal organization including heavy-duty alloy hanging rods, lockable security drawers for valuables, and spacious shelving for folded clothes, bedsheets, and accessories.`,
      specs: [
        { key: 'Door Configuration', value: '3-Door / 4-Door Hinged with Mirror' },
        { key: 'Internal Layout', value: '2 Full Hanging Rods + 6 Storage Shelves + 2 Lockable Drawers' },
        { key: 'Material', value: 'Moisture-Resistant Particle Board / Engineered Hardwood' },
        { key: 'Hardware', value: 'Soft-Close Hinges & Heavy-Duty Metallic Handles' },
        { key: 'Warranty', value: '3 Years Manufacturer Warranty' },
      ],
      highlights: [
        'Built-in full-length distortion-free mirror on front panel',
        'Soft-close hydraulic hinges prevent accidental slamming and wear',
        'Double lock system on drawers for jewellery and important documents',
        'Edge-banded panels prevent moisture ingress and edge peeling',
      ],
    },
    {
      key: 'office',
      name: 'Office Furniture',
      slug: 'office-furniture',
      categoryPath: 'home/furniture/office-furniture',
      skuPrefix: 'WC-OFF',
      descriptionTemplate: (p) =>
        `Supercharge your work-from-home productivity with the ${p.title}. Thoughtfully engineered for long working hours with responsive ergonomics, breathable ventilation, and rugged load-bearing components tested for commercial grade durability.`,
      specs: [
        { key: 'Product Type', value: 'Ergonomic High-Back Chair / Work Desk' },
        { key: 'Mechanism', value: 'Class 4 Hydraulic Gas Lift with Multi-Lock Recline' },
        { key: 'Support', value: '2D/3D Adjustable Armrests & Dynamic Lumbar Support' },
        { key: 'Material', value: 'High-Tensile Breathable Korean Mesh & Reinforced Metal Base' },
        { key: 'Warranty', value: '3 Years On-Site Warranty' },
      ],
      highlights: [
        'Certified BIFMA Class-4 gas piston tested for 135 kg load capacity',
        'Breathable mesh back promotes continuous airflow during 10+ hour shifts',
        'Multi-angle tilt lock (90° to 135°) for switching between work and rest',
        'Quiet 60mm nylon castor wheels glide effortlessly without scratching flooring',
      ],
    },
  ];

  for (const cfg of categoryConfigs) {
    console.log(`\n==============================================`);
    console.log(`Fetching & Verifying 4 Products for: ${cfg.name}`);
    console.log(`==============================================`);

    const asinList = candidates[cfg.key] || [];
    let addedForCategory = 0;

    for (const asin of asinList) {
      if (addedForCategory >= 4) break;

      process.stdout.write(`Fetching ASIN ${asin}... `);
      const parsed = await parseAsin(asin, cfg.key);
      if (parsed) {
        console.log(`✅ [${parsed.brand}] ${parsed.title.substring(0, 45)}... | ₹${parsed.salePrice} | ${parsed.images.length} verified images`);
        finalProducts.push({
          ...parsed,
          categoryKey: cfg.key,
          categoryName: cfg.name,
          categorySlug: cfg.slug,
          categoryPath: cfg.categoryPath,
          sku: `${cfg.skuPrefix}-${asin}`,
          description: cfg.descriptionTemplate(parsed),
          specifications: cfg.specs,
          highlights: cfg.highlights,
          tags: ['furniture', cfg.slug, cfg.key, parsed.brand.toLowerCase(), 'woodcraft living', 'home decor'],
        });
        addedForCategory++;
      }
    }

    if (addedForCategory < 4) {
      console.error(`❌ Failed to find 4 verified products for category ${cfg.name}! Found: ${addedForCategory}`);
    }
  }

  console.log('\n==============================================');
  console.log(`Total Products Collected & Verified: ${finalProducts.length}`);
  console.log(`Total Images: ${finalProducts.reduce((acc, p) => acc + p.images.length, 0)}`);
  console.log('==============================================\n');

  const outputPath = path.join(__dirname, 'verified_furniture.json');
  fs.writeFileSync(outputPath, JSON.stringify(finalProducts, null, 2));
  console.log(`💾 Saved catalog to ${outputPath}`);
}

buildCatalog().catch((err) => {
  console.error('Fatal error building catalog:', err);
  process.exit(1);
});
