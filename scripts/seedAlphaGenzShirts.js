// scripts/seedAlphaGenzShirts.js
/**
 * Seeding script for Men's Shirts
 * Scraped directly from Flipkart
 * Seller: Alpha GENZ Fashions
 */

const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

// Helper to generate shirt size variants (S, M, L, XL, XXL)
function generateShirtVariants(baseSku, salePrice) {
  const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
  return sizes.map((size) => ({
    name: `Size ${size}`,
    sku: `${baseSku}-${size}`,
    price: salePrice,
    stock: Math.floor(Math.random() * 20) + 12,
    attributes: { Size: size },
  }));
}

// 20 Curated Men's Shirts Products Scraped from Flipkart
const shirtProducts = [
  // 1. DEEMOON Mustard Brown Overshirt (Item 1 in screenshot)
  {
    name: "DEEMOON Men Regular Fit Solid Button Down Collar Mustard Casual Shirt",
    brand: "DEEMOON",
    sku: "AGF-SH-DM-MST-01",
    shortDescription: "Heavy cotton twill overshirt in warm mustard brown with dual utility chest pockets.",
    description: `### DEEMOON Urban Utility Casual Shirt / Overshirt
A standout contemporary overshirt tailored for layering over basic tees. Made from heavyweight premium combed cotton twill that holds structured drape throughout the day.

- **Collar:** Button-Down Spread Collar
- **Fit:** Regular Boxy Fit
- **Pockets:** Dual buttoned flap chest pockets
- **Styling:** Wear unbuttoned over a crisp white t-shirt with dark denim or cargo pants.
- **Fabric:** 100% Breathable Combed Cotton Twill
- **Care Instructions:** Machine wash gentle, tumble dry low, warm iron.`,
    pricing: {
      basePrice: 2499,
      salePrice: 429,
      costPrice: 260,
      discountPercentage: 82,
    },
    inventory: {
      stock: 85,
      lowStockThreshold: 10,
      reorderPoint: 15,
      trackInventory: true,
      soldCount: 64,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/shirt/6/f/f/s-dsaqp04-deelmo-resized-original-imahggsaywuvxxzp.jpeg?q=70",
        alt: "DEEMOON Men Regular Fit Solid Button Down Collar Mustard Casual Shirt",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Regular Fit" },
      { key: "Collar", value: "Button Down Collar" },
      { key: "Sleeve", value: "Full Sleeve" },
      { key: "Pattern", value: "Solid" },
      { key: "Fabric", value: "100% Cotton Twill" },
      { key: "Pocket", value: "2 Flap Chest Pockets" },
      { key: "Occasion", value: "Casual / Streetwear" },
      { key: "Hemline", value: "Curved Hem" },
    ],
    ratings: { average: 4.6, count: 240 },
    tags: ["deemoon", "overshirt", "mustard-shirt", "men-shirts", "flipkart-trending"],
    keywords: ["deemoon shirt", "mustard casual shirt", "mens overshirt", "cotton twill shirt"],
    highlights: ["82% Off Trending Deal", "Heavyweight Combed Cotton", "Dual Utility Flap Pockets"],
    isFeatured: true,
  },

  // 2. DEEMOON Slate Grey Casual Shirt (Item 2 in screenshot)
  {
    name: "DEEMOON Men Regular Fit Solid Button Down Collar Slate Grey Casual Shirt",
    brand: "DEEMOON",
    sku: "AGF-SH-DM-GRY-02",
    shortDescription: "Versatile slate grey utility overshirt crafted from soft-washed durable cotton.",
    description: `### DEEMOON Minimalist Slate Grey Utility Shirt
Engineered with understated urban aesthetics. The neutral slate grey tone pairs effortlessly with any bottomwear from blue jeans to black trousers.

- **Collar:** Button-Down Collar with contrast buttons
- **Fit:** Regular Comfort Fit
- **Fabric:** 100% Cotton Pre-Shrunk Weave
- **Features:** Reinforced shoulder yoke and box pleat for back mobility.`,
    pricing: {
      basePrice: 2499,
      salePrice: 429,
      costPrice: 260,
      discountPercentage: 82,
    },
    inventory: {
      stock: 80,
      lowStockThreshold: 10,
      reorderPoint: 15,
      trackInventory: true,
      soldCount: 58,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/shirt/q/i/z/m-dsaqp07-deelmo-resized-original-imahggsaqkgfhwbz.jpeg?q=70",
        alt: "DEEMOON Men Regular Fit Solid Button Down Collar Slate Grey Casual Shirt",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Regular Fit" },
      { key: "Collar", value: "Button Down Collar" },
      { key: "Sleeve", value: "Full Sleeve" },
      { key: "Color", value: "Slate Grey" },
      { key: "Fabric", value: "100% Cotton" },
      { key: "Pocket", value: "2 Pockets" },
    ],
    ratings: { average: 4.5, count: 195 },
    tags: ["deemoon", "grey-shirt", "casual-shirt", "layering-shirt"],
    keywords: ["grey casual shirt", "deemoon grey shirt", "mens utility shirt"],
    highlights: ["Modern Minimalist Colorway", "Dual Utility Chest Pockets", "Pre-Shrunk Bio-Washed Cotton"],
    isFeatured: true,
  },

  // 3. DEEMOON Jet Black Button Down Shirt
  {
    name: "DEEMOON Men Regular Fit Solid Button Down Collar Jet Black Casual Shirt",
    brand: "DEEMOON",
    sku: "AGF-SH-DM-BLK-03",
    shortDescription: "Essential jet black utility button-down shirt with structured silhouette.",
    description: `### DEEMOON Jet Black Everyday Overshirt
The black overshirt that every wardrobe needs. Built with rich saturation dye that resists fading through repeated wash cycles.

- **Fit:** Regular Fit.
- **Color:** Jet Pitch Black.
- **Occasion:** Night outings, concerts, casual workdays.`,
    pricing: {
      basePrice: 2499,
      salePrice: 429,
      costPrice: 260,
      discountPercentage: 82,
    },
    inventory: {
      stock: 90,
      lowStockThreshold: 12,
      reorderPoint: 18,
      trackInventory: true,
      soldCount: 78,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/shirt/v/b/o/xxl-dsaqp02-deelmo-resized-original-imahggsaz4uvhveh.jpeg?q=70",
        alt: "DEEMOON Men Regular Fit Solid Button Down Collar Jet Black Casual Shirt",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Regular Fit" },
      { key: "Collar", value: "Button Down Collar" },
      { key: "Color", value: "Jet Black" },
      { key: "Fabric", value: "100% Cotton" },
      { key: "Pockets", value: "2 Pockets" },
    ],
    ratings: { average: 4.7, count: 310 },
    tags: ["deemoon", "black-shirt", "black-overshirt", "alpha-genz"],
    keywords: ["black casual shirt", "mens black overshirt", "deemoon black"],
    highlights: ["Deep Pitch Black Dye", "All-Season Breathable Cotton", "Versatile Open Layering"],
    isFeatured: true,
  },

  // 4. vdlooks Candy Pink Striped Shirt (Item 3 in screenshot - Bestseller)
  {
    name: "vdlooks Men Regular Fit Striped Spread Collar Candy Pink Casual Shirt",
    brand: "vdlooks",
    sku: "AGF-SH-VDL-PNK-04",
    shortDescription: "Flipkart Bestseller! Fresh candy pink and white vertical stripe spread collar shirt.",
    description: `### vdlooks Bestseller Pink Striped Shirt
Turn heads with this vibrant candy pink vertical striped casual shirt. Tailored for comfort with breathable fine-spun cotton, offering a flattering vertical elongation effect.

- **Pattern:** Clean Vertical Banker Stripes
- **Collar:** Spread Collar with crisp interlining
- **Fit:** Regular Comfort Fit
- **Vibe:** Resort wear, brunch dates, and casual weekend events.`,
    pricing: {
      basePrice: 1999,
      salePrice: 398,
      costPrice: 220,
      discountPercentage: 80,
    },
    inventory: {
      stock: 120,
      lowStockThreshold: 15,
      reorderPoint: 25,
      trackInventory: true,
      soldCount: 140,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/shirt/g/4/b/s-lipi-lf-2-0-2-181-pink-vdlooks-original-imahnzrw5jeqg8kk.jpeg?q=70",
        alt: "vdlooks Men Regular Fit Striped Spread Collar Candy Pink Casual Shirt",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Regular Fit" },
      { key: "Pattern", value: "Vertical Striped" },
      { key: "Collar", value: "Spread Collar" },
      { key: "Sleeve", value: "Full Sleeve" },
      { key: "Fabric", value: "Cotton Blend Poplin" },
      { key: "Badge", value: "Bestseller" },
    ],
    ratings: { average: 4.6, count: 520 },
    tags: ["vdlooks", "pink-shirt", "striped-shirt", "bestseller", "flipkart-viral"],
    keywords: ["pink striped shirt", "vdlooks shirt", "mens striped casual shirt"],
    highlights: ["Official Flipkart Bestseller Badge", "80% Off Hot Deal", "Wrinkle-Resistant Cotton Blend"],
    isFeatured: true,
  },

  // 5. vdlooks Pastel Blue Striped Shirt
  {
    name: "vdlooks Men Regular Fit Striped Spread Collar Pastel Blue Casual Shirt",
    brand: "vdlooks",
    sku: "AGF-SH-VDL-BLU-05",
    shortDescription: "Classic coastal aesthetic in pastel blue vertical striped spread collar casual shirt.",
    description: `### vdlooks Coastal Blue Striped Shirt
Classic maritime charm meets modern casual comfort. The pastel blue vertical stripes deliver an easygoing yet sophisticated appearance.

- **Collar:** Spread Collar.
- **Fabric:** Fine Cotton Poplin Blend.
- **Pairing:** Ideal with beige chinos, white linen trousers, or light-wash denim.`,
    pricing: {
      basePrice: 1999,
      salePrice: 398,
      costPrice: 220,
      discountPercentage: 80,
    },
    inventory: {
      stock: 95,
      lowStockThreshold: 12,
      reorderPoint: 20,
      trackInventory: true,
      soldCount: 88,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/shirt/g/e/r/m-lipi-lf-2-0-2-180-blue-vdlooks-original-imahnzrxbkhzc8dg.jpeg?q=70",
        alt: "vdlooks Men Regular Fit Striped Spread Collar Pastel Blue Casual Shirt",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Regular Fit" },
      { key: "Pattern", value: "Vertical Striped" },
      { key: "Collar", value: "Spread Collar" },
      { key: "Color", value: "Pastel Blue & White" },
      { key: "Fabric", value: "Cotton Blend" },
    ],
    ratings: { average: 4.5, count: 340 },
    tags: ["vdlooks", "blue-striped", "coastal-style", "casual-shirt"],
    keywords: ["blue striped shirt men", "vdlooks blue shirt", "summer shirt men"],
    highlights: ["Airy Breathable Poplin", "Clean Vertical Stripes", "80% Off Value Deal"],
    isFeatured: true,
  },

  // 6. METRONAUT Dusty Mauve Solid Shirt (Item 4 in screenshot)
  {
    name: "METRONAUT Men Regular Fit Solid Spread Collar Dusty Mauve Casual Shirt",
    brand: "METRONAUT",
    sku: "AGF-SH-MET-MAV-06",
    shortDescription: "Trendsetting dusty mauve solid shirt by Metronaut with soft handfeel and modern spread collar.",
    description: `### Metronaut Solid Dusty Mauve Shirt
A refined modern palette designed for the confident dresser. The dusty mauve hue offers sophisticated charm that elevates daytime and evening looks.

- **Fit:** Regular Tailored Fit
- **Fabric:** Cotton Viscose Blend for smooth drape
- **Finish:** Silky smooth peach finish
- **Occasion:** Party wear, festive dinners, date nights.`,
    pricing: {
      basePrice: 1499,
      salePrice: 340,
      costPrice: 190,
      discountPercentage: 77,
    },
    inventory: {
      stock: 110,
      lowStockThreshold: 15,
      reorderPoint: 20,
      trackInventory: true,
      soldCount: 135,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/shirt/b/9/a/s-metro-palin01-casual-shirt-metronaut-original-imahmyzstaef8rh4.jpeg?q=70",
        alt: "METRONAUT Men Regular Fit Solid Spread Collar Dusty Mauve Casual Shirt",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Regular Fit" },
      { key: "Color", value: "Dusty Mauve" },
      { key: "Pattern", value: "Solid" },
      { key: "Collar", value: "Spread Collar" },
      { key: "Fabric", value: "Cotton Viscose Blend" },
      { key: "Sleeve", value: "Full Sleeve" },
    ],
    ratings: { average: 4.5, count: 420 },
    tags: ["metronaut", "mauve-shirt", "flipkart-assured", "solid-shirt"],
    keywords: ["metronaut shirt", "mauve shirt men", "dusty pink shirt men"],
    highlights: ["77% Off Hot Deal", "Flipkart Assured Quality", "Silky Peach-Finish Touch"],
    isFeatured: true,
  },

  // 7. METRONAUT Old School Checkered Shirt
  {
    name: "METRONAUT Men Regular Fit Checkered Spread Collar Old School Shirt",
    brand: "METRONAUT",
    sku: "AGF-SH-MET-CHK-07",
    shortDescription: "Vintage grunge checkered flannel-feel casual shirt in rustic earthy tones.",
    description: `### Metronaut Old School Plaid Check Shirt
Channel classic 90s indie vibes. Features a timeless multi-colored check pattern that pairs naturally with denim and combat boots.

- **Pattern:** Tartan Plaid Checks
- **Fabric:** 100% Brushed Cotton for cozy handfeel
- **Cut:** Regular Fit with curved hemline.`,
    pricing: {
      basePrice: 1799,
      salePrice: 395,
      costPrice: 230,
      discountPercentage: 78,
    },
    inventory: {
      stock: 70,
      lowStockThreshold: 10,
      reorderPoint: 15,
      trackInventory: true,
      soldCount: 52,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/shirt/3/g/c/m-oldschool-checks-metronaut-original-imahz7t2rmufywvy.jpeg?q=70",
        alt: "METRONAUT Men Regular Fit Checkered Spread Collar Casual Shirt",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Regular Fit" },
      { key: "Pattern", value: "Checkered / Plaid" },
      { key: "Collar", value: "Spread Collar" },
      { key: "Fabric", value: "100% Brushed Cotton" },
    ],
    ratings: { average: 4.4, count: 180 },
    tags: ["metronaut", "checkered-shirt", "plaid-shirt", "90s-grunge"],
    keywords: ["metronaut check shirt", "plaid shirt men", "mens checkered shirt"],
    highlights: ["Soft Brushed Cotton", "Timeless Tartan Palette", "78% Off Seasonal Promo"],
    isFeatured: false,
  },

  // 8. METRONAUT Sage Olive Formal Shirt
  {
    name: "METRONAUT Men Regular Fit Solid Spread Collar Sage Green Formal Shirt",
    brand: "METRONAUT",
    sku: "AGF-SH-MET-OLV-08",
    shortDescription: "Crisp and sophisticated sage green formal shirt crafted for boardroom elegance.",
    description: `### Metronaut Executive Sage Formal Shirt
Redefine executive dressing. The calming sage green tone breaks the monotony of standard white and blue office shirts with understated poise.

- **Fit:** Regular Formal Fit
- **Fabric:** Cotton Poly Blend with Easy-Iron finish
- **Collar:** Stiffened Spread Collar with removable collar stays.`,
    pricing: {
      basePrice: 999,
      salePrice: 309,
      costPrice: 180,
      discountPercentage: 69,
    },
    inventory: {
      stock: 85,
      lowStockThreshold: 12,
      reorderPoint: 18,
      trackInventory: true,
      soldCount: 94,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/shirt/l/i/y/m-02-formal-shirts-metronaut-original-imahmaprggg3jsap.jpeg?q=70",
        alt: "METRONAUT Men Regular Fit Solid Spread Collar Formal Shirt",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Regular Fit" },
      { key: "Color", value: "Sage Olive Green" },
      { key: "Pattern", value: "Solid" },
      { key: "Collar", value: "Spread Collar" },
      { key: "Fabric", value: "Cotton Polyester Blend" },
      { key: "Occasion", value: "Formal / Workwear" },
    ],
    ratings: { average: 4.3, count: 210 },
    tags: ["metronaut", "formal-shirt", "green-shirt", "office-wear"],
    keywords: ["sage green formal shirt", "metronaut formal", "mens office shirt"],
    highlights: ["Easy-Iron Anti-Wrinkle Fabric", "Reinforced Fused Collar", "Unbeatable Budget Price"],
    isFeatured: false,
  },

  // 9. METRONAUT Sky Blue Classic Shirt
  {
    name: "METRONAUT Men Regular Fit Solid Spread Collar Sky Blue Casual Shirt",
    brand: "METRONAUT",
    sku: "AGF-SH-MET-SBLU-09",
    shortDescription: "Evergreen sky blue solid shirt offering clean styling for both work and casual outings.",
    description: `### Metronaut Classic Sky Blue Shirt
The universal wardrobe essential. Crisp, clean, and effortlessly styled under a blazer or worn casually over chinos.

- **Fit:** Regular Fit.
- **Fabric:** 65% Cotton, 35% Polyester for breathable durability.`,
    pricing: {
      basePrice: 1499,
      salePrice: 340,
      costPrice: 190,
      discountPercentage: 77,
    },
    inventory: {
      stock: 90,
      lowStockThreshold: 15,
      reorderPoint: 20,
      trackInventory: true,
      soldCount: 115,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/shirt/u/i/h/s-metro-palin01-casual-shirt-metronaut-original-imahmyzs2n7sufev.jpeg?q=70",
        alt: "METRONAUT Men Regular Fit Solid Spread Collar Sky Blue Shirt",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Regular Fit" },
      { key: "Color", value: "Sky Blue" },
      { key: "Collar", value: "Spread Collar" },
      { key: "Fabric", value: "Cotton Poly Blend" },
    ],
    ratings: { average: 4.4, count: 320 },
    tags: ["metronaut", "sky-blue-shirt", "classic-shirt", "daily-wear"],
    keywords: ["sky blue shirt men", "metronaut blue shirt", "plain blue shirt"],
    highlights: ["Universal Everyday Tone", "Machine Washable Durability", "77% Off Value Deal"],
    isFeatured: false,
  },

  // 10. BLUE SQUAD Navy Formal Poplin Shirt
  {
    name: "BLUE SQUAD Men Slim Fit Solid Spread Collar Navy Formal Shirt",
    brand: "BLUE SQUAD",
    sku: "AGF-SH-BS-NVY-10",
    shortDescription: "Slim tailored navy poplin shirt with a lustrous smooth finish for executive authority.",
    description: `### Blue Squad Slim Fit Poplin Shirt
Designed for the modern professional. Tailored slim fit through the chest and waist with a high-density cotton poplin weave that resists wrinkles all day long.

- **Fit:** Slim Cut Fit
- **Fabric:** 100% Fine Long-Staple Cotton Poplin
- **Collar:** Modern Semi-Spread Collar.`,
    pricing: {
      basePrice: 1599,
      salePrice: 617,
      costPrice: 370,
      discountPercentage: 61,
    },
    inventory: {
      stock: 65,
      lowStockThreshold: 10,
      reorderPoint: 15,
      trackInventory: true,
      soldCount: 48,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/shirt/q/i/d/xl-bspop-blue-squad-original-imahkuhqqkh3rdpw.jpeg?q=70",
        alt: "BLUE SQUAD Men Slim Fit Solid Spread Collar Navy Formal Shirt",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Slim Fit" },
      { key: "Color", value: "Navy Blue" },
      { key: "Fabric", value: "100% Cotton Poplin" },
      { key: "Collar", value: "Spread Collar" },
      { key: "Occasion", value: "Formal" },
    ],
    ratings: { average: 4.5, count: 160 },
    tags: ["blue-squad", "navy-shirt", "formal-shirt", "poplin-cotton"],
    keywords: ["blue squad shirt", "navy formal shirt", "mens slim formal shirt"],
    highlights: ["100% Fine Cotton Poplin", "Slim Tapered Torso", "Subtle Natural Sheen"],
    isFeatured: true,
  },

  // 11. BLUE SQUAD Crisp White Executive Shirt
  {
    name: "BLUE SQUAD Men Slim Fit Solid Spread Collar Crisp White Formal Shirt",
    brand: "BLUE SQUAD",
    sku: "AGF-SH-BS-WHT-11",
    shortDescription: "The ultimate power shirt: pristine white slim fit dress shirt with mother-of-pearl buttons.",
    description: `### Blue Squad Crisp White Power Shirt
The foundational piece of any gentleman's wardrobe. Crisp white poplin that looks impeccable with tuxedos, suits, or solo with dress slacks.

- **Fit:** Slim Tailored Fit.
- **Fabric:** 100% Breathable Cotton.
- **Color:** Optical Bright White.`,
    pricing: {
      basePrice: 1599,
      salePrice: 632,
      costPrice: 380,
      discountPercentage: 60,
    },
    inventory: {
      stock: 75,
      lowStockThreshold: 10,
      reorderPoint: 15,
      trackInventory: true,
      soldCount: 65,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/shirt/q/0/o/xl-bspop-blue-squad-original-imahkuhtdqzwtchm.jpeg?q=70",
        alt: "BLUE SQUAD Men Slim Fit Solid Spread Collar White Formal Shirt",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Slim Fit" },
      { key: "Color", value: "Crisp White" },
      { key: "Fabric", value: "100% Cotton" },
      { key: "Occasion", value: "Formal / Wedding / Business" },
    ],
    ratings: { average: 4.6, count: 230 },
    tags: ["blue-squad", "white-shirt", "formal-dress-shirt", "classic-white"],
    keywords: ["white formal shirt men", "blue squad white shirt", "executive white shirt"],
    highlights: ["Optical Bright White Shade", "Fused Spread Collar", "Smooth 100% Cotton Feel"],
    isFeatured: true,
  },

  // 12. Nofilter Jacquard Waffle Popcorn Textured Shirt
  {
    name: "Nofilter Men Regular Fit Self Design Popcorn Waffle Casual Shirt",
    brand: "Nofilter",
    sku: "AGF-SH-NF-WFL-12",
    shortDescription: "High-fashion 3D waffle popcorn jacquard knit shirt in clean off-white ecru.",
    description: `### Nofilter Textured Jacquard Waffle Shirt
Step up your texture game. Crafted with raised popcorn waffle honeycomb knitting that gives rich tactile depth and modern fashion aesthetic.

- **Texture:** 3D Honeycomb Popcorn Jacquard
- **Fit:** Relaxed Streetwear Fit
- **Fabric:** Breathable Textured Cotton Poly Blend.`,
    pricing: {
      basePrice: 1499,
      salePrice: 383,
      costPrice: 220,
      discountPercentage: 74,
    },
    inventory: {
      stock: 90,
      lowStockThreshold: 12,
      reorderPoint: 18,
      trackInventory: true,
      soldCount: 82,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/shirt/q/l/c/m-shirt-jaqard-new-nofilter-original-imahdggahswxss5x.jpeg?q=70",
        alt: "Nofilter Men Regular Fit Textured Popcorn Waffle Casual Shirt",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Regular Fit" },
      { key: "Pattern", value: "Self Design / 3D Waffle" },
      { key: "Color", value: "Off-White / Ecru" },
      { key: "Fabric", value: "Jacquard Knit Cotton Blend" },
      { key: "Vibe", value: "Korean / Gen-Z Streetwear" },
    ],
    ratings: { average: 4.6, count: 280 },
    tags: ["nofilter", "waffle-shirt", "popcorn-shirt", "textured-shirt", "korean-fashion"],
    keywords: ["popcorn shirt men", "waffle texture shirt", "nofilter casual shirt"],
    highlights: ["Unique 3D Waffle Texture", "Soft-Touch Breathable Knit", "74% Off Super Value"],
    isFeatured: true,
  },

  // 13. VELLOSTA Warm Beige Minimalist Shirt
  {
    name: "VELLOSTA Men Regular Fit Solid Spread Collar Warm Beige Casual Shirt",
    brand: "VELLOSTA",
    sku: "AGF-SH-VEL-BGE-13",
    shortDescription: "Aesthetic warm beige earthy tone casual shirt with clean minimal lines.",
    description: `### VELLOSTA Earth Tone Beige Shirt
Embrace neutral aesthetics with VELLOSTA's warm beige shirt. Perfect for tonal monochromatic outfits when matched with brown, cream, or off-white pants.

- **Fit:** Regular Comfort Fit.
- **Fabric:** Soft Cotton Blend with matte finish.`,
    pricing: {
      basePrice: 1499,
      salePrice: 398,
      costPrice: 230,
      discountPercentage: 73,
    },
    inventory: {
      stock: 60,
      lowStockThreshold: 10,
      reorderPoint: 15,
      trackInventory: true,
      soldCount: 45,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/shirt/d/5/k/s-new-beige-plain-shirt-vellosta-original-imahqnyhbjqftxrf.jpeg?q=70",
        alt: "VELLOSTA Men Regular Fit Solid Spread Collar Beige Casual Shirt",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Regular Fit" },
      { key: "Color", value: "Warm Beige" },
      { key: "Pattern", value: "Solid" },
      { key: "Collar", value: "Spread Collar" },
      { key: "Fabric", value: "Cotton Rich" },
    ],
    ratings: { average: 4.4, count: 140 },
    tags: ["vellosta", "beige-shirt", "neutral-aesthetic", "earth-tone"],
    keywords: ["beige shirt men", "vellosta shirt", "cream casual shirt"],
    highlights: ["Trendy Earthy Neutral Tone", "Anti-Friction Breathable Fabric", "Matte Tonal Buttons"],
    isFeatured: false,
  },

  // 14. STIVERS Gingham Checkered Party Shirt
  {
    name: "STIVERS Men Regular Fit Checkered Cut Away Collar Party Shirt",
    brand: "STIVERS",
    sku: "AGF-SH-STV-CHK-14",
    shortDescription: "Vibrant anchor blue gingham check shirt with stylish cut-away collar styling.",
    description: `### STIVERS Anchor Blue Gingham Shirt
Energetic and sharp. The crisp micro-gingham check pattern pairs dynamically with jeans, blazers, and chinos.

- **Collar:** Modern Cut-Away Collar
- **Fabric:** Cotton Rich Blend with crisp crease retention.`,
    pricing: {
      basePrice: 999,
      salePrice: 419,
      costPrice: 250,
      discountPercentage: 58,
    },
    inventory: {
      stock: 55,
      lowStockThreshold: 8,
      reorderPoint: 12,
      trackInventory: true,
      soldCount: 38,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/shirt/g/d/s/m-ankr-blu-stivers-original-imahpz7dgda3rzwz.jpeg?q=70",
        alt: "STIVERS Men Regular Fit Checkered Cut Away Collar Party Shirt",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Regular Fit" },
      { key: "Pattern", value: "Gingham Checkered" },
      { key: "Collar", value: "Cut Away Collar" },
      { key: "Color", value: "Anchor Blue Check" },
      { key: "Fabric", value: "Cotton Blend" },
    ],
    ratings: { average: 4.3, count: 110 },
    tags: ["stivers", "checkered-shirt", "party-wear", "cut-away-collar"],
    keywords: ["stivers shirt", "gingham check shirt men", "blue check shirt"],
    highlights: ["Cut Away Modern Collar", "Crease-Resistant Weave", "58% Off Value"],
    isFeatured: false,
  },

  // 15. JACKBELLA Olive Striped Casual Shirt
  {
    name: "JACKBELLA Men Regular Fit Striped Spread Collar Casual Shirt",
    brand: "JACKBELLA",
    sku: "AGF-SH-JB-STR-15",
    shortDescription: "Subtle olive and beige retro vertical striped casual shirt with relaxed spread collar.",
    description: `### JACKBELLA Retro Striped Shirt
Inspired by vintage 70s aesthetics, this vertical striped shirt in muted olive and cream tones brings retro coolness to everyday wear.

- **Fit:** Regular Comfort Fit.
- **Fabric:** Breathable Lightweight Cotton Blend.`,
    pricing: {
      basePrice: 1499,
      salePrice: 333,
      costPrice: 190,
      discountPercentage: 77,
    },
    inventory: {
      stock: 65,
      lowStockThreshold: 10,
      reorderPoint: 15,
      trackInventory: true,
      soldCount: 42,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/shirt/b/i/k/xxl-rudiieezz-jackbella-original-imahzdjshunkcnhp.jpeg?q=70",
        alt: "JACKBELLA Men Regular Fit Striped Spread Collar Casual Shirt",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Regular Fit" },
      { key: "Pattern", value: "Vertical Striped" },
      { key: "Collar", value: "Spread Collar" },
      { key: "Color", value: "Olive & Cream" },
    ],
    ratings: { average: 4.4, count: 135 },
    tags: ["jackbella", "striped-shirt", "retro-shirt", "olive-shirt"],
    keywords: ["jackbella shirt", "mens retro striped shirt", "olive striped shirt"],
    highlights: ["Retro Vintage Striping", "Airy Lightweight Feel", "77% Off Mega Deal"],
    isFeatured: false,
  },

  // 16. JACKBELLA Emerald Green Solid Shirt
  {
    name: "JACKBELLA Men Regular Fit Solid Spread Collar Emerald Green Shirt",
    brand: "JACKBELLA",
    sku: "AGF-SH-JB-GRN-16",
    shortDescription: "Rich emerald green solid casual shirt that commands attention with deep jewel tones.",
    description: `### JACKBELLA Emerald Jewel Tone Shirt
Make a bold statement with deep emerald green. Richly pigmented fabric with subtle lustre for festive occasions and evening parties.

- **Fit:** Regular Fit.
- **Color:** Deep Emerald Green.
- **Fabric:** Fine Cotton Blend.`,
    pricing: {
      basePrice: 1499,
      salePrice: 548,
      costPrice: 320,
      discountPercentage: 63,
    },
    inventory: {
      stock: 50,
      lowStockThreshold: 8,
      reorderPoint: 12,
      trackInventory: true,
      soldCount: 36,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/shirt/8/g/h/m-lf-full-jackbella-original-imahpds9ukwzk9c5.jpeg?q=70",
        alt: "JACKBELLA Men Regular Fit Solid Spread Collar Green Shirt",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Regular Fit" },
      { key: "Color", value: "Emerald Green" },
      { key: "Pattern", value: "Solid" },
      { key: "Collar", value: "Spread Collar" },
      { key: "Fabric", value: "Cotton Blend" },
    ],
    ratings: { average: 4.5, count: 98 },
    tags: ["jackbella", "emerald-green", "party-shirt", "jewel-tones"],
    keywords: ["green shirt men", "jackbella green shirt", "emerald casual shirt"],
    highlights: ["Rich Jewel Colorway", "Comfortable All-Day Fit", "Tonal Matching Buttons"],
    isFeatured: false,
  },

  // 17. Tibra Collection Mandarin Collar Shirt
  {
    name: "Tibra Collection Men Regular Fit Checkered Mandarin Collar Casual Shirt",
    brand: "Tibra Collection",
    sku: "AGF-SH-TIB-MAN-17",
    shortDescription: "Contemporary Chinese / Mandarin band collar casual shirt in subtle micro-checks.",
    description: `### Tibra Mandarin Collar Micro-Check Shirt
Effortless Indo-Western fusion. The sleek mandarin collar offers a clean neckline that looks great without a necktie.

- **Collar:** Mandarin Band Collar
- **Pattern:** Micro Grid Checks
- **Fabric:** 100% Breathable Cotton.`,
    pricing: {
      basePrice: 599,
      salePrice: 298,
      costPrice: 170,
      discountPercentage: 50,
    },
    inventory: {
      stock: 70,
      lowStockThreshold: 10,
      reorderPoint: 15,
      trackInventory: true,
      soldCount: 54,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/shirt/v/y/y/m-short-001-tibra-collection-original-imahngwmgarmnqfc.jpeg?q=70",
        alt: "Tibra Collection Men Regular Fit Checkered Mandarin Collar Shirt",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Regular Fit" },
      { key: "Collar", value: "Mandarin / Band Collar" },
      { key: "Pattern", value: "Micro Check" },
      { key: "Fabric", value: "100% Cotton" },
    ],
    ratings: { average: 4.3, count: 165 },
    tags: ["tibra-collection", "mandarin-collar", "chinese-collar", "micro-check"],
    keywords: ["mandarin collar shirt", "chinese collar shirt men", "tibra collection"],
    highlights: ["Sleek Band Collar Neckline", "100% Cotton Comfort", "Great Budget Price ₹298"],
    isFeatured: false,
  },

  // 18. Solbiza Textured Sky Blue Striped Shirt
  {
    name: "Solbiza Men Regular Fit Textured Striped Spread Collar Casual Shirt",
    brand: "Solbiza",
    sku: "AGF-SH-SOL-STR-18",
    shortDescription: "Tactile slub textured sky blue vertical stripe casual shirt with spread collar.",
    description: `### Solbiza Textured Slub Stripe Shirt
Elevated texture meets classic stripes. Woven with subtle slub cotton yarns that create an organic, airy texture.

- **Collar:** Spread Collar.
- **Fabric:** Textured Slub Cotton Blend.`,
    pricing: {
      basePrice: 1299,
      salePrice: 312,
      costPrice: 180,
      discountPercentage: 76,
    },
    inventory: {
      stock: 65,
      lowStockThreshold: 10,
      reorderPoint: 15,
      trackInventory: true,
      soldCount: 46,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/shirt/e/f/r/xl-poop-solbiza-original-imahhe7fqqgnjbtu.jpeg?q=70",
        alt: "Solbiza Men Regular Fit Striped Spread Collar Casual Shirt",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Regular Fit" },
      { key: "Pattern", value: "Textured Striped" },
      { key: "Collar", value: "Spread Collar" },
      { key: "Color", value: "Sky Blue & White" },
      { key: "Fabric", value: "Slub Cotton Blend" },
    ],
    ratings: { average: 4.3, count: 120 },
    tags: ["solbiza", "textured-stripes", "slub-cotton", "sky-blue"],
    keywords: ["solbiza shirt", "slub stripe shirt men", "textured casual shirt"],
    highlights: ["Tactile Slub Weave", "76% Off Value Deal", "Breathable Summer Twill"],
    isFeatured: false,
  },

  // 19. COMBRAIDED White Jacquard Party Shirt
  {
    name: "COMBRAIDED Men Regular Fit Self Design Spread Collar White Party Shirt",
    brand: "COMBRAIDED",
    sku: "AGF-SH-COM-SLF-19",
    shortDescription: "Luxurious self-pattern jacquard weave white party wear shirt with premium luster.",
    description: `### COMBRAIDED Jacquard White Evening Shirt
Sophisticated evening luxury. The tone-on-tone self jacquard weave catches the light subtly, giving an unmistakably upscale look for receptions and parties.

- **Pattern:** Self Design Jacquard
- **Color:** Pristine White
- **Fabric:** Cotton Satin Blend.`,
    pricing: {
      basePrice: 1999,
      salePrice: 473,
      costPrice: 280,
      discountPercentage: 76,
    },
    inventory: {
      stock: 55,
      lowStockThreshold: 8,
      reorderPoint: 12,
      trackInventory: true,
      soldCount: 39,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/shirt/v/l/t/xxl-f300-combraided-original-imahjzhgskwentad.jpeg?q=70",
        alt: "COMBRAIDED Men Regular Fit Self Design Spread Collar White Shirt",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Regular Fit" },
      { key: "Pattern", value: "Self Design Jacquard" },
      { key: "Color", value: "White" },
      { key: "Collar", value: "Spread Collar" },
      { key: "Fabric", value: "Cotton Satin Blend" },
      { key: "Occasion", value: "Party / Festive" },
    ],
    ratings: { average: 4.6, count: 185 },
    tags: ["combraided", "white-party-shirt", "jacquard-shirt", "satin-cotton"],
    keywords: ["white jacquard shirt", "combraided shirt", "mens party shirt white"],
    highlights: ["Tone-on-Tone Jacquard Lustre", "Cotton Satin Softness", "76% Off Premium Deal"],
    isFeatured: true,
  },

  // 20. VeBNoR Maroon Wine Casual Shirt
  {
    name: "VeBNoR Men Regular Fit Solid Spread Collar Maroon Wine Casual Shirt",
    brand: "VeBNoR",
    sku: "AGF-SH-VBN-MRN-20",
    shortDescription: "Rich burgundy wine solid shirt with curved hem and spread collar.",
    description: `### VeBNoR Burgundy Wine Everyday Shirt
Deep, rich, and masculine. The deep maroon wine tone adds warmth and richness to your everyday apparel rotation.

- **Fit:** Regular Comfort Fit.
- **Color:** Maroon / Wine Burgundy.
- **Fabric:** Cotton Poly Twill.`,
    pricing: {
      basePrice: 999,
      salePrice: 326,
      costPrice: 190,
      discountPercentage: 67,
    },
    inventory: {
      stock: 75,
      lowStockThreshold: 10,
      reorderPoint: 15,
      trackInventory: true,
      soldCount: 62,
    },
    images: [
      {
        url: "https://rukminim2.flixcart.com/image/832/832/xif0q/shirt/x/q/g/s-st112-vebnor-original-imahndgyb5dzt5t7.jpeg?q=70",
        alt: "VeBNoR Men Regular Fit Solid Spread Collar Maroon Shirt",
        isPrimary: true,
      },
    ],
    specifications: [
      { key: "Fit", value: "Regular Fit" },
      { key: "Color", value: "Maroon Wine" },
      { key: "Pattern", value: "Solid" },
      { key: "Collar", value: "Spread Collar" },
      { key: "Fabric", value: "Cotton Poly Twill" },
    ],
    ratings: { average: 4.4, count: 190 },
    tags: ["vebnor", "maroon-shirt", "wine-shirt", "solid-shirt"],
    keywords: ["maroon shirt men", "vebnor shirt", "wine casual shirt"],
    highlights: ["Rich Burgundy Tone", "Anti-Fading Dye", "67% Off Super Deal"],
    isFeatured: false,
  },
];

async function seedAlphaGenzShirts() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected successfully to MongoDB!\n');

    // Find Alpha GENZ Fashions Seller
    const Seller = mongoose.models.Seller || mongoose.model('Seller', new mongoose.Schema({
      storeInfo: Object,
      businessInfo: Object,
    }, { strict: false }));

    const seller = await Seller.findOne({
      $or: [
        { 'storeInfo.storeSlug': 'alpha-genz-fashions' },
        { 'storeInfo.storeName': 'Alpha GENZ Fashions' },
      ],
    });

    if (!seller) {
      console.error('❌ Seller Alpha GENZ Fashions not found! Please run seedAlphaGenzJeans.js first.');
      process.exit(1);
    }

    console.log(`🏢 Sponsoring Seller: ${seller.storeInfo?.storeName} (${seller._id})\n`);

    // Verify / Get Category: Shirts
    const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({}, { strict: false }));
    const shirtCat = await Category.findOne({ slug: 'men-shirts' });
    const categoryName = shirtCat?.name || 'Shirts';
    const categoryPath = shirtCat?.path || 'fashion/mens-clothing/men-shirts';
    const subCategory = "Men's Clothing";

    console.log(`📂 Category: ${categoryName} (${categoryPath})\n`);

    // Schema for Product
    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
      sellerId: mongoose.Schema.Types.ObjectId,
      name: String,
      description: String,
      shortDescription: String,
      category: mongoose.Schema.Types.Mixed,
      categoryPath: String,
      subCategory: String,
      brand: String,
      sku: { type: String, unique: true },
      pricing: Object,
      inventory: Object,
      options: Array,
      variants: Array,
      images: Array,
      specifications: Array,
      shipping: Object,
      returnPolicy: Object,
      deliveryEstimate: Object,
      ratings: Object,
      tags: [String],
      keywords: [String],
      highlights: [String],
      hsnCode: String,
      isActive: Boolean,
      isApproved: Boolean,
      isFeatured: Boolean,
      isDraft: Boolean,
      viewCount: Number,
      importedFrom: String,
    }, { timestamps: true }));

    console.log(`📦 Upserting ${shirtProducts.length} Men's Shirt Products...\n`);

    let inserted = 0;
    let updated = 0;

    for (const item of shirtProducts) {
      const variants = generateShirtVariants(item.sku, item.pricing.salePrice);
      const options = [
        {
          name: 'Size',
          values: ['S', 'M', 'L', 'XL', 'XXL'],
        },
      ];

      const productPayload = {
        ...item,
        sellerId: seller._id,
        category: categoryName,
        categoryPath: categoryPath,
        subCategory: subCategory,
        options: options,
        variants: variants,
        shipping: {
          weight: 0.3,
          unit: 'kg',
          freeShipping: true,
          shippingFee: 0,
        },
        returnPolicy: {
          isReturnable: true,
          returnDuration: 7,
          isReplaceable: true,
          replacementDuration: 7,
        },
        deliveryEstimate: {
          domestic: { min: 2, max: 4 },
          international: { min: 7, max: 12 },
          lastUpdated: new Date(),
        },
        hsnCode: '62052000', // Standard HSN for men's cotton shirts
        isActive: true,
        isApproved: true,
        isDraft: false,
        importedFrom: 'flipkart',
      };

      const existing = await Product.findOne({ sku: item.sku });
      if (existing) {
        await Product.updateOne({ sku: item.sku }, { $set: productPayload });
        console.log(`🔄 [UPDATED] ${item.brand.padEnd(16)} | ${item.name} (SKU: ${item.sku})`);
        updated++;
      } else {
        await Product.create(productPayload);
        console.log(`✨ [INSERTED] ${item.brand.padEnd(16)} | ${item.name} (SKU: ${item.sku})`);
        inserted++;
      }
    }

    console.log('\n======================================================');
    console.log('🎉 ALPHA GENZ FASHIONS MEN SHIRTS SEEDING COMPLETED!');
    console.log('======================================================');
    console.log(`🏢 Seller: ${seller.storeInfo?.storeName} (${seller._id})`);
    console.log(`👔 Total Shirts: ${shirtProducts.length} (Inserted: ${inserted}, Updated: ${updated})`);

    const brandCounts = {};
    shirtProducts.forEach((p) => {
      brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
    });
    console.log('📊 Brand Breakdown:', brandCounts);

    const totalSellerProducts = await Product.countDocuments({ sellerId: seller._id });
    console.log(`🏪 Total Products in Alpha GENZ Fashions Store: ${totalSellerProducts} (Jeans + Shirts)`);

    await mongoose.connection.close();
    console.log('🔌 Database connection closed\n');
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedAlphaGenzShirts();
