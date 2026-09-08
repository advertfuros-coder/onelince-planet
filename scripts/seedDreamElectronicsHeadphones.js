// scripts/seedDreamElectronicsHeadphones.js
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

const headphoneProducts = [
  // 1. Sony WH-1000XM5
  {
    name: 'Sony WH-1000XM5 Wireless Active Noise Cancelling Headphones - Black',
    shortDescription: 'Sony WH-1000XM5 with Dual Processor V1/QN1, 8 Microphones, Auto NC Optimizer, and 30H Playtime',
    description: `The Sony WH-1000XM5 headphones rewrite the rules for distraction-free listening. With two processors controlling 8 microphones, Auto NC Optimizer for automatically optimizing noise cancelling based on your wearing conditions and environment, and a specially designed 30mm driver unit, industry-leading noise cancellation takes another massive leap forward.

Equipped with 4 beamforming microphones and advanced audio signal processing, your voice will come through crystal clear on phone calls even in noisy surroundings. Enjoy high-resolution audio wireless with LDAC and DSEE Extreme upscaling, delivering breathtaking music clarity.

The lightweight design is finished in newly developed soft fit leather that fits snugly around the head with less pressure on ears while keeping external sounds out. With up to 30 hours of battery life and fast charging (3 min charge for 3 hours playback), the WH-1000XM5 is built for true audiophiles and business travelers.`,
    brand: 'Sony',
    sku: 'DE-HP-SONY-XM5-BLK',
    pricing: {
      basePrice: 34990,
      salePrice: 28990,
      costPrice: 24000,
      discountPercentage: 17.15,
    },
    inventory: { stock: 15, lowStockThreshold: 3, reorderPoint: 5, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/o/g/7/-original-imahgr29hqgfsmww.jpeg?q=80', alt: 'Sony WH-1000XM5 Black Front', isPrimary: true },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/g/j/k/-original-imahgr29hggpahcg.jpeg?q=80', alt: 'Sony WH-1000XM5 Side Profile and Earcups', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/u/9/s/-original-imahgr29rxdzhpxb.jpeg?q=80', alt: 'Sony WH-1000XM5 Foldable Case and Accessories', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/z/k/w/-original-imahgr29wgeuhwkq.jpeg?q=80', alt: 'Sony WH-1000XM5 Soft Fit Headband', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/4/3/x/-original-imahgr29pfmyxfex.jpeg?q=80', alt: 'Sony WH-1000XM5 Touch Sensor Controls', isPrimary: false },
    ],
    specifications: [
      { key: 'Headphone Type', value: 'Over the Ear (Circumaural)' },
      { key: 'Noise Cancellation', value: 'Industry-Leading Active Noise Cancelling (Dual Processor V1 + HD QN1)' },
      { key: 'Driver Unit', value: '30 mm Carbon Fiber Composite Dome' },
      { key: 'Frequency Response', value: '4 Hz - 40,000 Hz' },
      { key: 'Bluetooth Version', value: 'v5.2 (Multipoint Support)' },
      { key: 'Supported Codecs', value: 'LDAC, AAC, SBC' },
      { key: 'Battery Life', value: 'Up to 30 Hours (NC ON) / 40 Hours (NC OFF)' },
      { key: 'Quick Charge', value: '3 mins charge for 3 hours playtime (USB-PD)' },
      { key: 'Microphones', value: '8 Microphones with AI Beamforming Call Technology' },
      { key: 'Warranty', value: '1 Year Manufacturer Brand Warranty' },
    ],
    highlights: [
      'Dual Processor V1 & HD Noise Cancelling Processor QN1 for peerless silence',
      'High-Resolution Audio Wireless supporting LDAC and DSEE Extreme upscaling',
      '4 Beamforming microphones calibrated with AI noise reduction for pristine call quality',
      'Up to 30 hours of continuous battery life with USB-PD super-fast charging',
      'Multipoint connection allows effortless switching between smartphone and laptop',
    ],
    tags: ['sony', 'headphones', 'wh-1000xm5', 'anc', 'wireless headphones', 'bluetooth', 'ldac'],
    shipping: { weight: 0.25, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 2. Apple AirPods Max
  {
    name: 'Apple AirPods Max Wireless Over-Ear Headphones - Space Grey',
    shortDescription: 'Apple AirPods Max with Active Noise Cancellation, Transparency Mode, Spatial Audio, and Apple H1 Chips',
    description: `Introducing AirPods Max — a perfect balance of exhilarating high-fidelity audio and the effortless magic of AirPods. The ultimate personal listening experience is here.

The Apple-designed dynamic driver provides wide frequency response that reveals the rich detail in every sound. From deep, rich bass to accurate mids and crisp, clean highs, you’ll hear each note with an extraordinary sense of clarity.

With computational audio powered by an Apple-designed H1 chip in each cup, custom acoustic design, and advanced software, AirPods Max delivers a breakthrough listening experience. Active Noise Cancellation blocks outside noise, while Transparency mode lets sounds from the outside in so you can hear and interact with your environment.`,
    brand: 'Apple',
    sku: 'DE-HP-APL-MAX-GRY',
    pricing: {
      basePrice: 59900,
      salePrice: 54900,
      costPrice: 48000,
      discountPercentage: 8.35,
    },
    inventory: { stock: 10, lowStockThreshold: 2, reorderPoint: 4, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/v/g/z/mgyj3hn-a-apple-enriched-transparent-original-imafy8whg2wxcygt.png?q=90', alt: 'Apple AirPods Max Space Grey Front', isPrimary: true },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/kigbjbk0-0/headphone/d/s/t/mgyj3hn-a-apple-original-imafy8whfhhthw8b.jpeg?q=90', alt: 'Apple AirPods Max Canopy Headband', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/kigbjbk0-0/headphone/b/9/e/mgyj3hn-a-apple-original-imafy8whbghhfuge.jpeg?q=90', alt: 'Apple AirPods Max Anodized Aluminum Earcups', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/kigbjbk0-0/headphone/4/u/h/mgyj3hn-a-apple-original-imafy8whmspajzsa.jpeg?q=90', alt: 'Apple AirPods Max Digital Crown and Buttons', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/kirr24w0-0/headphone/g/5/q/mgyn3hn-a-apple-original-imafyhgzchjwpzyh.jpeg?q=90', alt: 'Apple AirPods Max Smart Case', isPrimary: false },
    ],
    specifications: [
      { key: 'Headphone Type', value: 'Over the Ear' },
      { key: 'Processor', value: 'Dual Apple H1 Headphone Chips (1 in each earcup)' },
      { key: 'Noise Cancellation', value: 'Pro-level Active Noise Cancellation with Transparency Mode' },
      { key: 'Audio Technology', value: 'Personalized Spatial Audio with Dynamic Head Tracking' },
      { key: 'Battery Life', value: 'Up to 20 Hours on a single charge with ANC/Spatial Audio' },
      { key: 'Charging', value: 'Lightning to USB-C Cable (5 min charge = 1.5 hrs playback)' },
      { key: 'Sensors', value: 'Optical Sensor, Position Sensor, Case-detect Sensor, Accelerometer, Gyroscope' },
      { key: 'Ear Cushions', value: 'Acoustically engineered memory foam' },
      { key: 'Warranty', value: '1 Year Apple Brand Warranty' },
    ],
    highlights: [
      'Apple-designed dynamic driver delivers high-fidelity sound with ultra-low distortion',
      'Computational audio powered by Apple H1 chips in each earcup for groundbreaking clarity',
      'Personalized Spatial Audio with dynamic head tracking brings theatre-like sound',
      'Breathable knit mesh canopy and memory foam ear cushions for unmatched comfort',
      'Digital Crown for volume precision, track control, phone calls, and Siri activation',
    ],
    tags: ['apple', 'airpods max', 'headphones', 'anc', 'spatial audio', 'over ear', 'luxury audio'],
    shipping: { weight: 0.384, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 3. Bose QuietComfort Ultra
  {
    name: 'Bose QuietComfort Ultra Wireless Noise Cancelling Headphones - Black',
    shortDescription: 'Bose QC Ultra with World-Class Noise Cancelling, Spatial Immersive Audio, and CustomTune Tech',
    description: `High-fidelity audio and world-class noise cancellation come together in Bose QuietComfort Ultra Headphones. Breakthrough Bose Immersive Audio spatializes what you’re hearing, taking it out of your head and placing it in front of you for the most natural-sounding music you’ve ever experienced.

CustomTune technology personalizes sound performance to the unique shape of your ears, giving you pristine tonal balance and tailored acoustic response. Quiet Mode delivers complete focus with legendary Bose noise cancellation, while Aware Mode keeps you connected to your surroundings.

Up to 24 hours of play time ensures the beat goes on even throughout long-haul flights. Soft ear cushions embrace your ears in sumptuous luxury, and an ergonomic headband evenly distributes weight for fatigue-free listening.`,
    brand: 'Bose',
    sku: 'DE-HP-BOSE-QCULTRA-BLK',
    pricing: {
      basePrice: 35900,
      salePrice: 32900,
      costPrice: 28000,
      discountPercentage: 8.36,
    },
    inventory: { stock: 12, lowStockThreshold: 3, reorderPoint: 5, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/5/i/c/880066-0100-bose-enriched-transparent-original-imagwzzfprea2hhw.png?q=80', alt: 'Bose QC Ultra Black Front', isPrimary: true },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/v/v/f/-original-imahfcgwgahhb7uk.jpeg?q=80', alt: 'Bose QC Ultra Earcups Angle', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/8/p/6/880066-0100-bose-original-imagwzzft8zvqjrp.jpeg?q=80', alt: 'Bose QC Ultra Luxury Headband', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/4/u/t/880066-0100-bose-original-imagwzzf4cswjska.jpeg?q=80', alt: 'Bose QC Ultra Protective Case', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/r/e/g/880066-0100-bose-original-imagwzzfqbkd4hsp.jpeg?q=80', alt: 'Bose QC Ultra Folded Flat Profile', isPrimary: false },
    ],
    specifications: [
      { key: 'Headphone Type', value: 'Over the Ear' },
      { key: 'Noise Cancellation', value: 'World-Class Bose Active Noise Cancelling (Quiet, Aware & Immersion Modes)' },
      { key: 'Sound Technology', value: 'Bose Immersive Audio with Spatial Soundstage' },
      { key: 'Calibration', value: 'CustomTune Personal Audio Technology' },
      { key: 'Battery Life', value: 'Up to 24 Hours (Up to 18 Hours with Immersive Audio)' },
      { key: 'Bluetooth Version', value: 'v5.3 with Snapdragon Sound & aptX Adaptive' },
      { key: 'Microphone Array', value: 'Noise-rejecting microphones for ultra-clear calls' },
      { key: 'Warranty', value: '1 Year Brand Warranty' },
    ],
    highlights: [
      'Revolutionary Bose Immersive Audio brings spatialized three-dimensional music realism',
      'World-class noise cancellation eliminates environmental chatter and engine rumble',
      'CustomTune audio calibration customizes frequency response directly to your ear shape',
      'Ultra-plush synthetic leather ear cushions for all-day continuous wear',
      'Snapdragon Sound certification with low-latency Bluetooth 5.3 connectivity',
    ],
    tags: ['bose', 'quietcomfort ultra', 'qc ultra', 'headphones', 'spatial audio', 'noise cancelling'],
    shipping: { weight: 0.252, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 4. Sennheiser Momentum True Wireless 4
  {
    name: 'Sennheiser Momentum True Wireless 4 Earbuds - Metallic Silver',
    shortDescription: 'Sennheiser MTW4 with TrueResponse Transducer, Lossless Audio, Auracast, and Adaptive ANC',
    description: `Discover next-generation audio with Sennheiser MOMENTUM True Wireless 4. Built for sound connoisseurs, these flagship earbuds combine cutting-edge technology with the timeless signature Sennheiser sound.

Experience uncompressed, bit-for-bit lossless audio streaming powered by Qualcomm S5 Sound Gen 2 and Snapdragon Sound. With future-proof Bluetooth 5.4, LE Audio, and Auracast broadcast capabilities, you are equipped for tomorrow’s wireless landscape.

The adaptive ANC system continuously analyzes ambient noise to maintain immersive isolation without auditory fatigue. Enjoy up to 30 hours of playback with the textile-clad wireless charging case.`,
    brand: 'Sennheiser',
    sku: 'DE-HP-SENN-MTW4-SLV',
    pricing: {
      basePrice: 29990,
      salePrice: 24990,
      costPrice: 20000,
      discountPercentage: 16.67,
    },
    inventory: { stock: 10, lowStockThreshold: 2, reorderPoint: 4, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/0/l/i/-enriched-transparent-original-imah4rktfac5bhsg.png?q=80', alt: 'Sennheiser MTW4 Silver Buds and Case', isPrimary: true },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/p/9/b/-original-imahag6epd6dtmbq.jpeg?q=80', alt: 'Sennheiser MTW4 In-Ear Fit', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/e/o/1/momentum-sennheiser-original-imahy75wqyqgxpj7.jpeg?q=80', alt: 'Sennheiser MTW4 Metallic Touch Interface', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/c/f/u/momentum-sennheiser-original-imahy75wagzyprbp.jpeg?q=80', alt: 'Sennheiser MTW4 Premium Textile Charging Case', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/f/f/g/momentum-sennheiser-original-imahy75wyperxhz6.jpeg?q=80', alt: 'Sennheiser MTW4 Acoustic Architecture', isPrimary: false },
    ],
    specifications: [
      { key: 'Headphone Type', value: 'True Wireless In-Ear Earbuds' },
      { key: 'Driver System', value: '7mm TrueResponse Dynamic Transducers' },
      { key: 'Noise Cancellation', value: 'Hybrid Adaptive ANC with Transparency Mode' },
      { key: 'Codecs', value: 'aptX Lossless, aptX Adaptive, LE Audio, LC3, AAC, SBC' },
      { key: 'Bluetooth Version', value: 'v5.4 with Auracast Broadcast' },
      { key: 'Battery Life', value: '7.5 Hours (Earbuds) + 22.5 Hours (Case) = 30 Hours' },
      { key: 'Water Resistance', value: 'IP54 Splash and Dust Resistant' },
      { key: 'Warranty', value: '2 Years International Sennheiser Warranty' },
    ],
    highlights: [
      'TrueResponse 7mm dynamic drivers deliver legendary audiophile-grade bass and precision',
      'Supports bit-for-bit Lossless Audio streaming via Qualcomm Snapdragon Sound',
      'Adaptive Hybrid Active Noise Cancelling automatically matches ambient disturbance',
      'Next-gen Bluetooth 5.4 with Auracast broadcast audio sharing support',
      'Textile-wrapped charging case with Qi wireless charging and battery protection mode',
    ],
    tags: ['sennheiser', 'momentum', 'mtw4', 'tws', 'earbuds', 'lossless', 'audiophile'],
    shipping: { weight: 0.072, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 5. Apple AirPods Pro (2nd Gen, USB-C)
  {
    name: 'Apple AirPods Pro (2nd Generation) with MagSafe Case (USB-C)',
    shortDescription: 'Apple AirPods Pro 2 with H2 Chip, 2x Stronger Active Noise Cancellation, and Adaptive Audio',
    description: `AirPods Pro (2nd generation) with USB-C have been re-engineered for even richer audio quality. Next-level Active Noise Cancellation and Adaptive Audio reduce more external noise. Spatial Audio takes immersion to a remarkably personal level. Touch control now lets you adjust volume with a swipe. And a leap in battery life delivers 6 hours of listening time from a single charge.

The upgraded H2 chip powers smarter noise cancellation and three-dimensional sound. Adaptive EQ tunes music to your ears in real time to deliver crisp, clean high notes and deep, rich bass in stunning clarity.

The MagSafe Charging Case (USB-C) features the U1 chip with Precision Finding, a built-in speaker, and a lanyard loop. It can be charged using an Apple Watch or MagSafe charger, USB-C connector, or Qi-certified charger.`,
    brand: 'Apple',
    sku: 'DE-HP-APL-APP2-USBC',
    pricing: {
      basePrice: 24900,
      salePrice: 20999,
      costPrice: 17500,
      discountPercentage: 15.67,
    },
    inventory: { stock: 15, lowStockThreshold: 3, reorderPoint: 5, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/a/q/r/-original-imahahbzbyazrwxj.jpeg?q=90', alt: 'AirPods Pro 2 USB-C Front Case and Buds', isPrimary: true },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/h/b/o/airpods-pro-2nd-generation-with-magsafe-case-deep-bass-clear-original-imahgzyrubvb9bk4.jpeg?q=80', alt: 'AirPods Pro 2 In-Ear Stem with Touch Control', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/c/x/j/airpods-pro-2nd-generation-with-magsafe-case-deep-bass-clear-original-imahgzyrn3ybzuqy.jpeg?q=80', alt: 'AirPods Pro 2 MagSafe USB-C Charging Port', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/g/k/a/airpods-pro-2nd-generation-with-magsafe-case-deep-bass-clear-original-imahgzyrkghsgjfu.jpeg?q=80', alt: 'AirPods Pro 2 Silicone Ear Tips (4 sizes)', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/t/n/j/airpods-pro-2nd-generation-with-magsafe-case-deep-bass-clear-original-imahgzyr4nrvhsuv.jpeg?q=80', alt: 'AirPods Pro 2 Speaker and Lanyard Loop', isPrimary: false },
    ],
    specifications: [
      { key: 'Headphone Type', value: 'True Wireless In-Ear' },
      { key: 'Chipset', value: 'Apple H2 Headphone Chip + U1 Chip in Charging Case' },
      { key: 'Noise Cancellation', value: 'Up to 2x more Active Noise Cancellation + Adaptive Audio' },
      { key: 'Audio Features', value: 'Personalized Spatial Audio with Dynamic Head Tracking, Adaptive EQ' },
      { key: 'Battery Life', value: 'Up to 6 Hours per charge (Up to 30 Hours with MagSafe Case)' },
      { key: 'Charging Case', value: 'MagSafe USB-C Case with Speaker and Precision Finding' },
      { key: 'Resistance', value: 'IP54 Dust, Sweat, and Water Resistant' },
      { key: 'Warranty', value: '1 Year Apple Brand Warranty' },
    ],
    highlights: [
      'Next-generation Apple H2 chip delivers twice as much active noise cancellation',
      'Adaptive Audio dynamically blends Transparency mode and Active Noise Cancellation',
      'Personalized Spatial Audio tailors acoustic soundfield to your head and ears',
      'Touch control stem lets you swipe up or down to adjust volume instantly',
      'MagSafe Charging Case with USB-C, built-in speaker for Find My, and IP54 rating',
    ],
    tags: ['apple', 'airpods pro', 'airpods pro 2', 'tws', 'usb-c', 'noise cancellation', 'h2 chip'],
    shipping: { weight: 0.051, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 6. JBL Tune 770NC
  {
    name: 'JBL Tune 770NC Wireless Over-Ear Active Noise Cancelling Headphones - Black',
    shortDescription: 'JBL Tune 770NC with Adaptive Noise Cancelling, Smart Ambient, JBL Pure Bass, and 70H Playtime',
    description: `When your music is on, nothing else matters. The JBL Tune 770NC Adaptive Noise Cancelling wireless headphones deliver on that promise all day long — and longer, while sparing you the unwanted noises.

With up to 70 hours of battery life, you’ll easily get through a busy week of using them and still have enough JBL Pure Bass Sound to get you through the weekend. And if you do need a quick recharge, 5 minutes gets you an extra 3 hours of music.

Lightweight, and flat-folding, the JBL Tune 770NC can also connect with two Bluetooth devices simultaneously, so you’ll never miss a call while watching a movie on your tablet. With the free JBL Headphones app, you can tailor the sound to suit your taste.`,
    brand: 'JBL',
    sku: 'DE-HP-JBL-T770NC-BLK',
    pricing: {
      basePrice: 8999,
      salePrice: 5999,
      costPrice: 4200,
      discountPercentage: 33.34,
    },
    inventory: { stock: 20, lowStockThreshold: 4, reorderPoint: 6, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/4/m/0/-enriched-transparent-original-imahgfuk5rzgprzz.png?q=90', alt: 'JBL Tune 770NC Black Front', isPrimary: true },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/n/a/u/-original-imahgfukfygjardg.jpeg?q=90', alt: 'JBL Tune 770NC Plush Earcups', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/l/g/u/-original-imahgfukbz2mggt7.jpeg?q=90', alt: 'JBL Tune 770NC Foldable Compact Design', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/h/s/q/-original-imahgfukf49dkfhy.jpeg?q=90', alt: 'JBL Tune 770NC Control Buttons and USB-C', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/a/k/w/-original-imahgfukpdctheez.jpeg?q=90', alt: 'JBL Tune 770NC On-Head Fit Profile', isPrimary: false },
    ],
    specifications: [
      { key: 'Headphone Type', value: 'Over the Ear (Foldable)' },
      { key: 'Noise Cancellation', value: 'Adaptive Noise Cancelling with Smart Ambient & TalkThru' },
      { key: 'Driver Size', value: '40 mm JBL Pure Bass Drivers' },
      { key: 'Bluetooth Version', value: 'v5.3 with LE Audio' },
      { key: 'Battery Life', value: 'Up to 70 Hours (NC OFF) / Up to 44 Hours (NC ON)' },
      { key: 'Speed Charge', value: '5 Minutes = 3 Hours Playtime' },
      { key: 'App Support', value: 'JBL Headphones App with Custom EQ' },
      { key: 'Warranty', value: '1 Year Brand Warranty' },
    ],
    highlights: [
      'Adaptive Noise Cancelling with Smart Ambient eliminates unwanted background distractions',
      'Massive 70-hour battery life with 5-minute speed charging for 3 extra hours',
      'Signature JBL Pure Bass Sound powered by precision 40mm dynamic drivers',
      'Multi-point connection allows switching seamlessly between tablet and mobile calls',
      'Lightweight, foldable ergonomic design with plush memory foam ear cushions',
    ],
    tags: ['jbl', 'tune 770nc', 'headphones', 'anc', 'wireless', 'pure bass', 'long battery'],
    shipping: { weight: 0.232, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 7. JBL Live 770NC (Black)
  {
    name: 'JBL Live 770NC Wireless Over-Ear Headphones with True Adaptive ANC - Black',
    shortDescription: 'JBL Live 770NC with True Adaptive ANC, JBL Spatial Sound, Personi-Fi 2.0, and 65H Battery',
    description: `Immerse yourself in high-energy acoustics with the JBL Live 770NC headphones. Equipped with True Adaptive Noise Cancelling that automatically adjusts to eliminate real-time external disturbance, these premium headphones deliver deep musical focus wherever life takes you.

Powered by 40mm dynamic drivers tuned to JBL Signature Sound, the Live 770NC features immersive JBL Spatial Sound that turns any stereo content into virtual surround sound. Personi-Fi 2.0 customizes your listening profile based on your personal hearing response.

Stay powered for days with up to 65 hours of playback time (50 hours with ANC activated). A lightweight fabric headband and soft ear cushions provide luxurious, stress-free comfort from morning till night.`,
    brand: 'JBL',
    sku: 'DE-HP-JBL-L770NC-BLK',
    pricing: {
      basePrice: 14999,
      salePrice: 11999,
      costPrice: 9000,
      discountPercentage: 20,
    },
    inventory: { stock: 12, lowStockThreshold: 2, reorderPoint: 4, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/y/i/y/-enriched-transparent-original-imagtmt6cerf8zsr.png?q=80', alt: 'JBL Live 770NC Black Front Profile', isPrimary: true },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/v/x/o/-original-imahzy4tgdhyrzyw.jpeg?q=80', alt: 'JBL Live 770NC Fabric Headband', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/h/3/j/-original-imahzy4thbhztk6p.jpeg?q=80', alt: 'JBL Live 770NC Earcups and Control Dials', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/y/m/j/-original-imahzy4tjnahhygy.jpeg?q=80', alt: 'JBL Live 770NC Foldable Hinge', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/l/r/z/-original-imahzy4ty7hrcpnd.jpeg?q=80', alt: 'JBL Live 770NC Side View with Metal Accents', isPrimary: false },
    ],
    specifications: [
      { key: 'Headphone Type', value: 'Over the Ear' },
      { key: 'Noise Cancellation', value: 'True Adaptive Noise Cancelling with Smart Ambient' },
      { key: 'Soundstage', value: 'JBL Spatial Sound with Personi-Fi 2.0 Sound Tailoring' },
      { key: 'Battery Life', value: 'Up to 65 Hours (ANC OFF) / 50 Hours (ANC ON)' },
      { key: 'Driver Size', value: '40 mm JBL Signature Sound Drivers' },
      { key: 'Bluetooth Version', value: 'v5.3 with LE Audio support' },
      { key: 'Microphones', value: '2 Beamforming microphones for clear call handling' },
      { key: 'Warranty', value: '1 Year JBL Domestic Warranty' },
    ],
    highlights: [
      'True Adaptive Noise Cancelling with 4 noise-sensing mics continuously adjusts to silence',
      'JBL Spatial Sound transforms any stereo playlist into immersive 3D surround sound',
      'Personi-Fi 2.0 automatically tailors the acoustic curve to match your unique hearing profile',
      'Up to 65 hours total playback with quick-charge capabilities (5 mins = 4 hours)',
      'Comfort-fit fabric headband with metallic slider and memory foam ear cushions',
    ],
    tags: ['jbl', 'live 770nc', 'anc', 'spatial audio', 'over ear', 'headphones', 'bluetooth 5.3'],
    shipping: { weight: 0.256, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 8. JBL Live 770NC (Blue)
  {
    name: 'JBL Live 770NC Wireless Over-Ear Headphones with True Adaptive ANC - Blue',
    shortDescription: 'JBL Live 770NC in Denim Blue with True Adaptive ANC, Spatial Sound, and 65H Runtime',
    description: `Elevate your listening style with the JBL Live 770NC in striking Denim Blue. Featuring True Adaptive Noise Cancelling, these headphones adapt to your environment in real time, eliminating background interruptions whether you are on a busy commuter train or working in a crowded cafe.

Engineered with 40mm drivers for punchy JBL Signature Sound, you also get JBL Spatial Sound for cinematic virtual surround audio. With Bluetooth 5.3 and LE Audio capability, enjoy high-fidelity wireless streaming with ultra-low power consumption.

Auto play/pause sensors automatically pause playback when you take the headphones off and resume immediately when placed back on. Enjoy up to 65 hours of battery life and rapid charging via USB-C.`,
    brand: 'JBL',
    sku: 'DE-HP-JBL-L770NC-BLU',
    pricing: {
      basePrice: 14999,
      salePrice: 11999,
      costPrice: 9000,
      discountPercentage: 20,
    },
    inventory: { stock: 12, lowStockThreshold: 2, reorderPoint: 4, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/e/n/g/-enriched-transparent-original-imagtnwtjunyfhdz.png?q=80', alt: 'JBL Live 770NC Blue Front View', isPrimary: true },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/b/u/o/-original-imahzy4tjhssvh8s.jpeg?q=80', alt: 'JBL Live 770NC Blue Textured Headband', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/x/5/d/-original-imahzy4tzymsyh2s.jpeg?q=80', alt: 'JBL Live 770NC Blue Earcups and Controls', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/y/g/i/-original-imahzy4thvfe64tp.jpeg?q=80', alt: 'JBL Live 770NC Blue Foldable Hinge', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/4/0/k/-original-imahzy4tffavdqfg.jpeg?q=80', alt: 'JBL Live 770NC Blue Profile Angle', isPrimary: false },
    ],
    specifications: [
      { key: 'Headphone Type', value: 'Over the Ear' },
      { key: 'Noise Cancellation', value: 'True Adaptive Noise Cancelling with Smart Ambient' },
      { key: 'Soundstage', value: 'JBL Spatial Sound with Personi-Fi 2.0 Sound Tailoring' },
      { key: 'Battery Life', value: 'Up to 65 Hours (ANC OFF) / 50 Hours (ANC ON)' },
      { key: 'Driver Size', value: '40 mm JBL Signature Sound Drivers' },
      { key: 'Bluetooth Version', value: 'v5.3 with LE Audio' },
      { key: 'Auto Play/Pause', value: 'Built-in On-Head Wear Sensors' },
      { key: 'Warranty', value: '1 Year JBL Domestic Warranty' },
    ],
    highlights: [
      'Stunning Denim Blue colorway with premium breathable fabric headband',
      'True Adaptive Noise Cancelling with real-time room acoustic compensation',
      'JBL Spatial Sound creates virtual multidirectional surround audio',
      'Auto Play/Pause sensor triggers playback automatically on wear',
      'Up to 65 hours of battery life with quick charge (5 min charge = 4 hours playback)',
    ],
    tags: ['jbl', 'live 770nc blue', 'anc', 'wireless headphones', 'spatial audio', 'bluetooth'],
    shipping: { weight: 0.256, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 9. boAt Rockerz 650 Pro (2025/2026 Edition)
  {
    name: 'boAt Rockerz 650 Pro Wireless Bluetooth Headphones (2025/2026 Edition)',
    shortDescription: 'boAt Rockerz 650 Pro with 60H Playtime, ASAP Charge, Dual EQ Modes, and ENx Technology',
    description: `Elevate your audio thrills with the boAt Rockerz 650 Pro (2025/2026 Edition). Boasting powerful 40mm dynamic drivers calibrated with boAt Signature Sound, every track hits with bone-rattling bass and pristine vocal clarity.

Stay powered through the longest playlists and study marathons with up to 60 hours of uninterrupted playback. Equipped with ASAP Charge technology, a lightning-fast 10-minute charge delivers a massive 10 hours of playtime.

Switch effortlessly between Dual EQ Modes (Signature Bass Mode and Balanced Vocal Mode) to match your listening preferences. With ENx environmental noise cancellation for crystal-clear calls and ultra-soft plush ear cushions, the Rockerz 650 Pro is engineered for all-day daily wear.`,
    brand: 'boAt',
    sku: 'DE-HP-BOAT-R650PRO',
    pricing: {
      basePrice: 3990,
      salePrice: 2199,
      costPrice: 1400,
      discountPercentage: 44.89,
    },
    inventory: { stock: 25, lowStockThreshold: 5, reorderPoint: 8, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/j/n/a/-original-imah9pg5ckx3wvz2.jpeg?q=80', alt: 'boAt Rockerz 650 Pro Black Front View', isPrimary: true },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/z/t/6/-original-imah9pg5hcw2ysmy.jpeg?q=80', alt: 'boAt Rockerz 650 Pro Foldable Hinge and Controls', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/0/f/t/-original-imahqcnyatuvhtwz.jpeg?q=90', alt: 'boAt Rockerz 650 Pro Cushioned Earcups', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/f/n/j/-original-imahdyu7sxsjzwpk.jpeg?q=90', alt: 'boAt Rockerz 650 Pro USB-C and Aux Ports', isPrimary: false },
    ],
    specifications: [
      { key: 'Headphone Type', value: 'Over the Ear (Foldable)' },
      { key: 'Battery Playback', value: 'Up to 60 Hours non-stop' },
      { key: 'Charging Tech', value: 'ASAP Charge (10 Mins = 10 Hours)' },
      { key: 'Drivers', value: '40 mm Dynamic Bass Boost Drivers' },
      { key: 'EQ Modes', value: 'Dual EQ Modes (boAt Signature Sound / Balanced Mode)' },
      { key: 'Microphone', value: 'ENx Call Noise Reduction Technology' },
      { key: 'Connectivity', value: 'Bluetooth v5.3 + 3.5mm AUX Cable' },
      { key: 'Warranty', value: '1 Year Brand Warranty' },
    ],
    highlights: [
      'Massive 60 Hours playback time for uninterrupted music and movie streaming',
      'ASAP Charge technology gives up to 10 hours of playtime with just 10 minutes charging',
      'Dual EQ Modes allow toggling between deep thumping bass and balanced vocals',
      'ENx environmental noise reduction ensures loud and clear hands-free calls',
      'Lightweight ergonomic over-ear design with soft memory foam ear cushions',
    ],
    tags: ['boat', 'rockerz 650 pro', 'headphones', 'bluetooth', 'asap charge', '60 hours battery'],
    shipping: { weight: 0.22, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 10. boAt Nirvanaa 751 ANC
  {
    name: 'boAt Nirvanaa 751 ANC Hybrid Active Noise Cancellation Wireless Headphones - Sterling Silver',
    shortDescription: 'boAt Nirvanaa 751 ANC with 33dB Hybrid ANC, 65H Battery, ASAP Charge, and Ambient Mode',
    description: `Experience complete tranquility and unmatched acoustic richness with the boAt Nirvanaa 751 ANC headphones. Featuring Hybrid Active Noise Cancellation up to 33dB, it actively filters out ambient disturbance so you can immerse yourself in pure sound.

Powered by 40mm drivers delivering the iconic boAt Signature Sound, every beat lands with deep impact and crisp highs. Turn on Ambient Sound Mode when you need to be aware of your environment without removing your headphones.

With an astonishing playback time of up to 65 hours (54 hours with ANC enabled) and ASAP Charge that delivers 10 hours of playback in 10 minutes, the Nirvanaa 751 ANC keeps pace with your most demanding travel schedules.`,
    brand: 'boAt',
    sku: 'DE-HP-BOAT-N751ANC',
    pricing: {
      basePrice: 7990,
      salePrice: 2399,
      costPrice: 1600,
      discountPercentage: 70,
    },
    inventory: { stock: 20, lowStockThreshold: 4, reorderPoint: 6, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/l/e/o/-enriched-transparent-original-imagb7bmyuqxzwfe.png?q=80', alt: 'boAt Nirvanaa 751 ANC Sterling Silver Front', isPrimary: true },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/j/y/w/-original-imah579yfpkpsczh.jpeg?q=80', alt: 'boAt Nirvanaa 751 ANC Plush Silver Earcups', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/p/k/u/-original-imah579yzavjjryh.jpeg?q=80', alt: 'boAt Nirvanaa 751 ANC Button Controls and ANC Toggle', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/w/l/z/-original-imah579yqssuz9yj.jpeg?q=80', alt: 'boAt Nirvanaa 751 ANC Foldable Design', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/k/a/w/-original-imah579ymyu5dscr.jpeg?q=80', alt: 'boAt Nirvanaa 751 ANC Carry Pouch and Cables', isPrimary: false },
    ],
    specifications: [
      { key: 'Headphone Type', value: 'Over the Ear (Circumaural)' },
      { key: 'Noise Cancellation', value: 'Hybrid Active Noise Cancellation (Up to 33dB)' },
      { key: 'Battery Life', value: 'Up to 65 Hours (ANC OFF) / 54 Hours (ANC ON)' },
      { key: 'Fast Charging', value: 'ASAP Charge (10 Mins = 10 Hours Playtime)' },
      { key: 'Driver Size', value: '40 mm Dynamic Neodymium Drivers' },
      { key: 'Sound Modes', value: 'Active Noise Cancellation / Ambient Sound Mode' },
      { key: 'Bluetooth Version', value: 'v5.0 + 3.5mm AUX Cable' },
      { key: 'Warranty', value: '1 Year Manufacturer Brand Warranty' },
    ],
    highlights: [
      'Hybrid Active Noise Cancellation up to 33dB for total listening immersion',
      'Massive 65 hours playback time (54 hours with continuous ANC activated)',
      'ASAP Charge provides 10 hours of musical playtime with a quick 10-minute top-up',
      'Ambient Sound Mode lets you stay alert to announcements and surroundings',
      'Premium Sterling Silver finish with foldable ergonomic headband and plush earcups',
    ],
    tags: ['boat', 'nirvanaa 751 anc', 'hybrid anc', 'headphones', 'silver', 'ambient mode'],
    shipping: { weight: 0.26, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 11. OnePlus Buds Pro 3
  {
    name: 'OnePlus Buds Pro 3 True Wireless Earbuds with Dynaudio Sound - Lunar Radiance',
    shortDescription: 'OnePlus Buds Pro 3 with Dynaudio Co-Creation, Dual Drivers & Dual DACs, 50dB Adaptive ANC',
    description: `OnePlus Buds Pro 3 redefines flagship wireless audio with sound mastery co-created with Dynaudio. Featuring an innovative dual-driver acoustic architecture (11mm woofer + 6mm planar tweeter) powered by dedicated Dual DACs, you experience unparalleled tonal separation and concert-hall realism.

Enjoy up to 50dB of real-time Adaptive Noise Cancellation that smartly adjusts to the acoustic noise levels of your environment. Certified for Hi-Res Audio Wireless with LHDC 5.0, you can stream studio-grade 24-bit/192kHz music wirelessly.

Crafted in an ergonomic pebble case wrapped in vegan leather, the Buds Pro 3 delivers up to 43 hours of total playback time with fast charging and Qi wireless charging support.`,
    brand: 'OnePlus',
    sku: 'DE-HP-1PLUS-BP3-LUNAR',
    pricing: {
      basePrice: 13999,
      salePrice: 11999,
      costPrice: 9500,
      discountPercentage: 14.29,
    },
    inventory: { stock: 15, lowStockThreshold: 3, reorderPoint: 5, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/z/u/o/buds-pro-3-lunar-rediance-oneplus-enriched-transparent-original-imah3czthuutkqy9.png?q=80', alt: 'OnePlus Buds Pro 3 Lunar Radiance Case and Buds', isPrimary: true },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/z/4/y/buds-pro-3-true-wireless-in-ear-buds-oneplus-enriched-transparent-original-imah7m24xz6xhh9h.png?q=80', alt: 'OnePlus Buds Pro 3 Dual Drivers In-Ear Fit', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/x/q/q/-original-imahhdjmqrj7gzgv.jpeg?q=80', alt: 'OnePlus Buds Pro 3 Vegan Leather Case Texture', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/x/n/m/-enriched-transparent-original-imahhhfzafguvh56.png?q=80', alt: 'OnePlus Buds Pro 3 Touch and Slide Controls', isPrimary: false },
    ],
    specifications: [
      { key: 'Headphone Type', value: 'True Wireless In-Ear Earbuds' },
      { key: 'Acoustic Architecture', value: 'Co-created with Dynaudio (Dual Drivers: 11mm woofer + 6mm planar tweeter)' },
      { key: 'DAC', value: 'Dual DACs (Digital-to-Analog Converters) per bud' },
      { key: 'Noise Cancellation', value: 'Up to 50dB Real-time Adaptive ANC' },
      { key: 'Hi-Res Audio', value: 'LHDC 5.0 (24-bit/192kHz) Hi-Res Audio Wireless Certified' },
      { key: 'Battery Life', value: 'Up to 43 Hours Total Playback (Case + Buds)' },
      { key: 'Charging', value: 'Fast USB-C Charging + Qi Wireless Charging' },
      { key: 'Water Resistance', value: 'IP55 Dust and Water Resistant' },
      { key: 'Warranty', value: '1 Year OnePlus Domestic Warranty' },
    ],
    highlights: [
      'Co-created with legendary audio pioneer Dynaudio with Dual Drivers & Dual DACs',
      '50dB Real-time Adaptive Active Noise Cancellation with voice-enhancing mics',
      'LHDC 5.0 certified for high-fidelity 24-bit/192kHz master quality audio streaming',
      'Up to 43 hours total playtime with convenient Qi wireless charging support',
      'Tactile squeeze and slide stem controls with Google Fast Pair and dual connection',
    ],
    tags: ['oneplus', 'buds pro 3', 'dynaudio', 'tws', 'earbuds', 'anc', 'lhdc'],
    shipping: { weight: 0.061, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 12. OnePlus Nord Buds 3 Pro (Starry Black)
  {
    name: 'OnePlus Nord Buds 3 Pro Truly Wireless Earbuds - Starry Black',
    shortDescription: 'OnePlus Nord Buds 3 Pro with 49dB Hybrid ANC, 12.4mm Titanized Driver, and 44H Battery',
    description: `Turn down the noise and turn up the bass with the OnePlus Nord Buds 3 Pro in Starry Black. Packing flagship-grade 49dB Hybrid Active Noise Cancellation, these earbuds let you focus strictly on what matters — your music, podcasts, and calls.

Equipped with extra-large 12.4mm titanized dynamic drivers and BassWave 2.0 algorithm, the Nord Buds 3 Pro delivers heart-thumping low end without compromising treble fidelity. 

With Bluetooth 5.4, dual-device connection, and up to 44 hours of battery life, you can listen through the week without recharging anxiety. Ultra-fast charging gives you 11 hours of playtime from a 10-minute top-up.`,
    brand: 'OnePlus',
    sku: 'DE-HP-1PLUS-NB3P-BLK',
    pricing: {
      basePrice: 3699,
      salePrice: 3099,
      costPrice: 2200,
      discountPercentage: 16.22,
    },
    inventory: { stock: 20, lowStockThreshold: 4, reorderPoint: 6, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/l/x/x/nord-buds-3-pro-oneplus-enriched-transparent-original-imah2ax8jjdyxyv3.png?q=80', alt: 'OnePlus Nord Buds 3 Pro Starry Black Case and Buds', isPrimary: true },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/h/t/k/nord-buds-3-pro-oneplus-original-imah2ax8fdzzgqsn.jpeg?q=80', alt: 'OnePlus Nord Buds 3 Pro Starry Black In-Ear Fit', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/h/b/1/-original-imah32ufd2swdeet.jpeg?q=80', alt: 'OnePlus Nord Buds 3 Pro Charging Port & LED', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/f/i/k/nord-buds-3-pro-oneplus-original-imah2ax894hhbcgg.jpeg?q=80', alt: 'OnePlus Nord Buds 3 Pro Titanium Driver Architecture', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/w/j/6/nord-buds-3-pro-oneplus-original-imah2ax8krkhmfga.jpeg?q=80', alt: 'OnePlus Nord Buds 3 Pro Touch Sensor Stems', isPrimary: false },
    ],
    specifications: [
      { key: 'Headphone Type', value: 'True Wireless In-Ear Earbuds' },
      { key: 'Noise Cancellation', value: '49dB Hybrid Active Noise Cancellation' },
      { key: 'Driver Unit', value: '12.4mm Titanized Dynamic Drivers with BassWave 2.0' },
      { key: 'Bluetooth Version', value: 'v5.4 with Dual Device Connection' },
      { key: 'Battery Life', value: 'Up to 44 Hours (Case + Buds) / 12 Hours per charge' },
      { key: 'Fast Charging', value: '10 Mins Charge = 11 Hours Playtime' },
      { key: 'Call Tech', value: '3-Mic System with AI Noise Reduction' },
      { key: 'Water Resistance', value: 'IP55 Dust and Water Resistant' },
      { key: 'Warranty', value: '1 Year Brand Domestic Warranty' },
    ],
    highlights: [
      '49dB Hybrid Active Noise Cancellation creates an ultra-quiet listening bubble',
      'Massive 12.4mm titanized diaphragm drivers deliver rich bass and clear acoustics',
      'Up to 44 hours of total battery life with ultra-fast 10-min for 11-hours charging',
      '3-mic system with AI algorithm captures crisp vocal clarity on phone calls',
      'IP55 water and dust resistance with Bluetooth 5.4 dual-device connection',
    ],
    tags: ['oneplus', 'nord buds 3 pro', 'tws', 'anc', '49db', 'bluetooth 5.4'],
    shipping: { weight: 0.047, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 13. OnePlus Nord Buds 3 Pro (Soft Jade)
  {
    name: 'OnePlus Nord Buds 3 Pro Truly Wireless Earbuds - Soft Jade',
    shortDescription: 'OnePlus Nord Buds 3 Pro in Soft Jade with 49dB Hybrid ANC and 12.4mm Titanized Driver',
    description: `Experience aesthetic elegance and deep acoustic bliss with the OnePlus Nord Buds 3 Pro in Soft Jade. Featuring a distinctive dual-tone finish with jade hues, these earbuds look as extraordinary as they sound.

Enjoy cutting-edge 49dB Hybrid Active Noise Cancellation, keeping chatter, commute drone, and wind noise away. The 12.4mm titanized dynamic drivers paired with BassWave 2.0 deliver punchy bass and crystalline treble.

With an incredible 44 hours of playback, seamless dual-device switching, and an IP55 rating, the Nord Buds 3 Pro is your ideal daily audio companion.`,
    brand: 'OnePlus',
    sku: 'DE-HP-1PLUS-NB3P-JAD',
    pricing: {
      basePrice: 3699,
      salePrice: 2999,
      costPrice: 2100,
      discountPercentage: 18.92,
    },
    inventory: { stock: 20, lowStockThreshold: 4, reorderPoint: 6, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/2/l/x/nrd-bds-3-pro-oneplus-enriched-transparent-original-imahe6hbkc5jqzmv.png?q=80', alt: 'OnePlus Nord Buds 3 Pro Soft Jade Case and Buds', isPrimary: true },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/6/r/l/nrd-bds-3-pro-oneplus-original-imahe6hby6askqts.jpeg?q=80', alt: 'OnePlus Nord Buds 3 Pro Soft Jade In-Ear Buds', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/7/u/p/nrd-bds-3-pro-oneplus-original-imahe6hbxgnpc983.jpeg?q=80', alt: 'OnePlus Nord Buds 3 Pro Soft Jade Charging Case', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/t/j/9/nrd-bds-3-pro-oneplus-original-imahe6hbj88a9hpw.jpeg?q=80', alt: 'OnePlus Nord Buds 3 Pro Soft Jade Angle View', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/m/5/8/nrd-bds-3-pro-oneplus-original-imahe6hbvj6qe55v.jpeg?q=80', alt: 'OnePlus Nord Buds 3 Pro Soft Jade Ear Tips Included', isPrimary: false },
    ],
    specifications: [
      { key: 'Headphone Type', value: 'True Wireless In-Ear' },
      { key: 'Color', value: 'Soft Jade' },
      { key: 'Noise Cancellation', value: '49dB Hybrid Active Noise Cancellation' },
      { key: 'Driver Unit', value: '12.4mm Titanized Diaphragm with BassWave 2.0' },
      { key: 'Bluetooth Version', value: 'v5.4' },
      { key: 'Battery Life', value: 'Up to 44 Hours Total Playtime' },
      { key: 'Call Clarity', value: '3-Mic AI Call Noise Cancellation' },
      { key: 'Water Resistance', value: 'IP55 Rated' },
      { key: 'Warranty', value: '1 Year Brand Domestic Warranty' },
    ],
    highlights: [
      'Refined Soft Jade aesthetic with sleek organic pebble finish',
      '49dB Hybrid Active Noise Cancellation silences ambient commotion',
      'Large 12.4mm titanized drivers tuned for high-impact bass response',
      '44-hour battery endurance with 10-min ultra-rapid top-up charging',
      'Bluetooth 5.4 with seamless dual-device switching and low-latency gaming',
    ],
    tags: ['oneplus', 'nord buds 3 pro jade', 'tws', 'anc', 'earbuds', 'bluetooth'],
    shipping: { weight: 0.047, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 14. Sony WF-1000XM5
  {
    name: 'Sony WF-1000XM5 Truly Wireless Noise Canceling Earbuds - Black',
    shortDescription: 'Sony WF-1000XM5 with Dual Processors V2/QN2e, Dynamic Driver X, and AI Noise Reduction',
    description: `The WF-1000XM5 features cutting-edge technology to deliver premium sound quality and the best noise-cancelling performance on the market. Real-time noise cancelling processors can be optimized to provide the best performance for your environment, hearing a big difference especially in airplanes, trains, or buses.

Dynamic Driver X specially designed for wide frequency reproduction brings you richer vocals and enhanced details. The sound quality is simply sublime, with richer vocals and deeper bass on your favorite tracks.

Bone conduction sensors and an AI-based noise reduction algorithm pick up your voice with high fidelity even in wind or crowd noise. With up to 24 hours of battery life and wireless Qi charging, you get seamless, premium listening everywhere.`,
    brand: 'Sony',
    sku: 'DE-HP-SONY-WFXM5-BLK',
    pricing: {
      basePrice: 24990,
      salePrice: 21990,
      costPrice: 17500,
      discountPercentage: 12,
    },
    inventory: { stock: 12, lowStockThreshold: 3, reorderPoint: 5, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/8/m/r/wh-1000xm4-sony-enriched-transparent-original-imagcywfzfwjmvbr.png?q=80', alt: 'Sony WF-1000XM5 Earbuds Front', isPrimary: true },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/v/d/g/-original-imahgr295uvptwq7.jpeg?q=80', alt: 'Sony WF-1000XM5 Compact Charging Case', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/i/x/v/-original-imahgr29cddeazsx.jpeg?q=80', alt: 'Sony WF-1000XM5 Glossy and Matte Texture', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/d/5/v/-original-imahgr29e7fzcfgn.jpeg?q=80', alt: 'Sony WF-1000XM5 Noise Isolation Earbud Tips', isPrimary: false },
    ],
    specifications: [
      { key: 'Headphone Type', value: 'True Wireless In-Ear Earbuds' },
      { key: 'Processors', value: 'Integrated Processor V2 + HD Noise Cancelling Processor QN2e' },
      { key: 'Driver Unit', value: '8.4mm Dynamic Driver X' },
      { key: 'Noise Cancellation', value: 'Flagship Real-time Active Noise Cancelling' },
      { key: 'Audio Formats', value: 'LDAC, DSEE Extreme, LC3, AAC, SBC' },
      { key: 'Battery Life', value: '8 Hours (Buds) + 16 Hours (Case) = 24 Hours with ANC' },
      { key: 'Call Tech', value: 'Bone Conduction Sensors + AI DNN Noise Reduction' },
      { key: 'Water Resistance', value: 'IPX4 Water Resistant' },
      { key: 'Warranty', value: '1 Year Brand Warranty' },
    ],
    highlights: [
      'The best noise cancelling with dual proprietary processors V2 and QN2e',
      'Astonishing sound quality with specially designed 8.4mm Dynamic Driver X',
      'Sony’s best-ever call quality with bone conduction sensors and deep neural network AI',
      'Small, lightweight ergonomic shape that fits securely and comfortably in the ear',
      'Multipoint connection allows connecting two devices simultaneously with seamless switching',
    ],
    tags: ['sony', 'wf-1000xm5', 'tws', 'earbuds', 'anc', 'ldac', 'audiophile'],
    shipping: { weight: 0.059, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 15. Sony WH-CH720N (Blue)
  {
    name: 'Sony WH-CH720N Noise Canceling Wireless Over-Ear Headphones - Blue',
    shortDescription: 'Sony WH-CH720N with Integrated Processor V1, Dual Noise Sensors, 35H Battery, and DSEE',
    description: `Experience the power of Sony's Integrated Processor V1 in a featherweight design with the WH-CH720N wireless noise cancelling headphones. Dual Noise Sensor technology and the V1 processor bring noise cancelling to the next level, allowing you to shut out the world and immerse yourself in music.

Whether you're working from home or taking a break with your favorite album, the ergonomic lightweight structure (only 192g) offers supreme comfort. DSEE (Digital Sound Enhancement Engine) restores high-frequency harmonics lost during compression.

Enjoy up to 35 hours of battery life with noise cancelling on, or up to 50 hours with noise cancelling off. Multi-point connection allows smooth switching between your smartphone and laptop.`,
    brand: 'Sony',
    sku: 'DE-HP-SONY-CH720N-BLU',
    pricing: {
      basePrice: 14990,
      salePrice: 9990,
      costPrice: 7500,
      discountPercentage: 33.36,
    },
    inventory: { stock: 15, lowStockThreshold: 3, reorderPoint: 5, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/m/q/s/-enriched-transparent-original-imagz2d82zhzwpvy.png?q=80', alt: 'Sony WH-CH720N Blue Front Profile', isPrimary: true },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/k/a/x/-original-imahfcgyxfjhhh7r.jpeg?q=80', alt: 'Sony WH-CH720N Blue Earcups Angle', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/9/5/m/-original-imagz2d8ypggakxb.jpeg?q=80', alt: 'Sony WH-CH720N Blue Controls and USB-C', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/d/m/k/-original-imagz2d8ssrvywkg.jpeg?q=80', alt: 'Sony WH-CH720N Blue Headband Fit', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/e/2/s/-original-imagz2d8hknwdw3g.jpeg?q=80', alt: 'Sony WH-CH720N Blue Folded Flat', isPrimary: false },
    ],
    specifications: [
      { key: 'Headphone Type', value: 'Over the Ear' },
      { key: 'Processor', value: 'Integrated Processor V1' },
      { key: 'Noise Cancellation', value: 'Dual Noise Sensor Active Noise Cancelling' },
      { key: 'Driver Unit', value: '30 mm Dynamic Drivers' },
      { key: 'Audio Upscaling', value: 'DSEE (Digital Sound Enhancement Engine)' },
      { key: 'Battery Life', value: 'Up to 35 Hours (ANC ON) / Up to 50 Hours (ANC OFF)' },
      { key: 'Weight', value: 'Ultra-light 192 Grams' },
      { key: 'Multipoint Connection', value: 'Supported (Connect to 2 devices simultaneously)' },
      { key: 'Warranty', value: '1 Year Brand Domestic Warranty' },
    ],
    highlights: [
      'Integrated Processor V1 provides outstanding noise cancelling performance',
      'Ultra-comfortable lightweight 192g build allows fatigue-free listening for hours',
      'Up to 35 hours battery life with ANC on, with 3-minute quick charge for 1 hour playback',
      'DSEE restores high frequency details for faithful musical reproduction',
      'Crystal-clear hands-free calls with beamforming microphones and wind noise reduction',
    ],
    tags: ['sony', 'wh-ch720n', 'headphones', 'noise cancelling', 'v1 processor', 'bluetooth'],
    shipping: { weight: 0.192, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 16. Sony WH-CH720N (White)
  {
    name: 'Sony WH-CH720N Noise Canceling Wireless Over-Ear Headphones - White',
    shortDescription: 'Sony WH-CH720N in Elegant White with V1 Processor, 35H Battery, and Dual Noise Sensors',
    description: `Clean minimalism meets audiophile performance in the Sony WH-CH720N in White. Utilizing the same Integrated Processor V1 found in Sony's flagship headphones, it delivers low-latency active noise cancellation that keeps distractions at bay.

The ergonomic, slim headband and comfortable synthetic leather earpads make this Sony's lightest wireless noise cancelling overhead model. Fine-tune your EQ using the Sony | Headphones Connect app to customize sound stages.

Stay connected effortlessly with multi-point pairing that automatically routes calls from your phone while you're enjoying music from your PC. Up to 35 hours of battery ensures you are always ready to listen.`,
    brand: 'Sony',
    sku: 'DE-HP-SONY-CH720N-WHT',
    pricing: {
      basePrice: 14990,
      salePrice: 9990,
      costPrice: 7500,
      discountPercentage: 33.36,
    },
    inventory: { stock: 15, lowStockThreshold: 3, reorderPoint: 5, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/y/o/i/-enriched-transparent-original-imagz2d8cnqggynk.png?q=80', alt: 'Sony WH-CH720N White Front View', isPrimary: true },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/b/p/k/-original-imahfgfk7rffntqf.jpeg?q=80', alt: 'Sony WH-CH720N White Soft Headband', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/v/x/i/-original-imagz2d8gvefzp6j.jpeg?q=80', alt: 'Sony WH-CH720N White Earcups', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/4/l/o/-original-imagz2d8zgghcjty.jpeg?q=80', alt: 'Sony WH-CH720N White Controls and Ports', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/g/w/h/-original-imagz2d8mh46tekk.jpeg?q=80', alt: 'Sony WH-CH720N White Swivel Design', isPrimary: false },
    ],
    specifications: [
      { key: 'Headphone Type', value: 'Over the Ear' },
      { key: 'Color', value: 'White' },
      { key: 'Processor', value: 'Sony Integrated Processor V1' },
      { key: 'Noise Cancellation', value: 'Dual Noise Sensor Technology' },
      { key: 'Driver Unit', value: '30 mm Dynamic' },
      { key: 'Battery Life', value: 'Up to 35 Hours (ANC ON) / 50 Hours (ANC OFF)' },
      { key: 'Weight', value: '192 Grams' },
      { key: 'App Support', value: 'Sony | Headphones Connect' },
      { key: 'Warranty', value: '1 Year Brand Domestic Warranty' },
    ],
    highlights: [
      'Sophisticated matte white finish with lightweight 192g build',
      'Integrated Processor V1 powers premium noise cancelling and rich musicality',
      'Up to 35 hours battery life with quick-charge function (3 min = 60 mins)',
      'Multi-point Bluetooth connection allows two simultaneous devices',
      'Precise Voice Pickup technology with beamforming microphone for clear calls',
    ],
    tags: ['sony', 'wh-ch720n white', 'noise cancelling', 'headphones', 'bluetooth'],
    shipping: { weight: 0.192, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 17. Marshall Major IV (Black)
  {
    name: 'Marshall Major IV Wireless Bluetooth On-Ear Headphones - Black',
    shortDescription: 'Marshall Major IV with 80+ Hours Playtime, Wireless Charging, Custom 40mm Drivers, and Multi-Directional Knob',
    description: `Meet Major IV, the iconic headphones from Marshall with 80+ solid hours of wireless playtime, wireless charging, and a new, improved ergonomic design. When you’re deep diving into your music, the tenth hour is as comfortable as the first.

Custom-tuned 40mm dynamic drivers deliver roaring bass, smooth mids, and brilliant treble for a rich, unrivalled sound that you’ll never want to turn off. With 80+ hours of wireless playtime, you can cut the cord and enjoy freedom from charging anxiety.

With wireless charging, it’s now easier than ever to charge and go. The multi-directional control knob lets you play, pause, skip, and adjust the volume of your device, as well as power your headphones on or off.`,
    brand: 'Marshall',
    sku: 'DE-HP-MARSH-M4-BLK',
    pricing: {
      basePrice: 14999,
      salePrice: 9999,
      costPrice: 7200,
      discountPercentage: 33.34,
    },
    inventory: { stock: 15, lowStockThreshold: 3, reorderPoint: 5, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/i/x/s/-original-imahfcgw3xwsmyyg.jpeg?q=90', alt: 'Marshall Major IV Black Front View', isPrimary: true },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/n/j/x/-original-imagzefgfk2t468q.jpeg?q=90', alt: 'Marshall Major IV Textured Earcups and Brass Knob', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/y/m/8/-original-imagzefgggyhzydd.jpeg?q=90', alt: 'Marshall Major IV Collapsible Rugged Headband', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/u/x/g/-original-imagzefgjs9wywz5.jpeg?q=90', alt: 'Marshall Major IV Wireless Charging Base Support', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/9/2/l/-original-imagzefguwwyywqh.jpeg?q=90', alt: 'Marshall Major IV 3.5mm Audio Sharing Port', isPrimary: false },
    ],
    specifications: [
      { key: 'Headphone Type', value: 'On the Ear (Foldable Over the Head)' },
      { key: 'Drivers', value: '40 mm Custom-Tuned Dynamic Drivers' },
      { key: 'Frequency Range', value: '20 Hz - 20,000 Hz' },
      { key: 'Battery Life', value: '80+ Solid Hours of Wireless Playtime' },
      { key: 'Charging', value: 'Wireless Qi Charging + USB-C Quick Charge (15 min = 15 hours)' },
      { key: 'Control Knob', value: 'Multi-directional brass control knob' },
      { key: 'Audio Sharing', value: '3.5mm Socket allows a friend to plug in and share your music' },
      { key: 'Weight', value: '165 Grams' },
      { key: 'Warranty', value: '1 Year Brand Warranty' },
    ],
    highlights: [
      'Unstoppable 80+ hours of continuous wireless playtime on a single charge',
      'Wireless charging support makes replenishing power effortless and clutter-free',
      'Multi-directional brass control knob for intuitive music and phone functionality',
      'Iconic vintage Marshall rock heritage design with collapsible rugged build',
      'Share music easily via the integrated 3.5mm audio passthrough socket',
    ],
    tags: ['marshall', 'major iv', 'headphones', 'wireless', 'bluetooth', '80 hours battery', 'vintage'],
    shipping: { weight: 0.165, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 18. Marshall Major IV (Brown)
  {
    name: 'Marshall Major IV Wireless Bluetooth On-Ear Headphones - Brown',
    shortDescription: 'Marshall Major IV in Vintage Brown with 80+ Hours Playtime, Wireless Charging, and 40mm Drivers',
    description: `Immerse yourself in vintage rock aesthetic with the Marshall Major IV in Vintage Brown. Offering over 80 hours of wireless playtime on a single charge, these headphones let you listen for days without needing an outlet.

Custom-tuned 40mm drivers deliver roaring bass and crystalline highs that honor Marshall’s six decades of acoustic heritage. The ergonomic 3D hinges and soft ear cushions ensure comfortable listening from the first song to the final encore.

Wireless charging support allows you to simply place the ear cup on a wireless charging pad. Plus, the built-in 3.5mm socket lets you share what you’re listening to with a friend.`,
    brand: 'Marshall',
    sku: 'DE-HP-MARSH-M4-BRN',
    pricing: {
      basePrice: 14999,
      salePrice: 11399,
      costPrice: 8500,
      discountPercentage: 24,
    },
    inventory: { stock: 12, lowStockThreshold: 3, reorderPoint: 5, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/u/i/i/-original-imahfcgwr4tdah6h.jpeg?q=90', alt: 'Marshall Major IV Brown Front Profile', isPrimary: true },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/l3xcr680/headphone/e/8/j/major-iv-marshall-original-imagexzgznfxhrtc.jpeg?q=90', alt: 'Marshall Major IV Brown Vintage Vinyl Texture', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/l3xcr680/headphone/x/h/j/major-iv-marshall-original-imagexzg5gwhaffz.jpeg?q=90', alt: 'Marshall Major IV Brown Folded Collapsible Hinge', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/l3xcr680/headphone/1/h/x/major-iv-marshall-original-imagexzgknvjtkgg.jpeg?q=90', alt: 'Marshall Major IV Brown Headband Detail', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/l3xcr680/headphone/e/s/b/major-iv-marshall-original-imagexzgrskzszhw.jpeg?q=90', alt: 'Marshall Major IV Brown Brass Control Knob', isPrimary: false },
    ],
    specifications: [
      { key: 'Headphone Type', value: 'On the Ear' },
      { key: 'Color', value: 'Brown' },
      { key: 'Drivers', value: '40 mm Dynamic Custom Tuned Drivers' },
      { key: 'Play Time', value: '80+ Hours Wireless' },
      { key: 'Charging', value: 'Wireless Charging + USB-C' },
      { key: 'Quick Charge', value: '15 Mins = 15 Hours' },
      { key: 'Controls', value: 'Multi-directional Brass Knob' },
      { key: 'Warranty', value: '1 Year Brand Warranty' },
    ],
    highlights: [
      'Retro brown textured vinyl finish with iconic Marshall signature script',
      'Incredible 80+ hours battery life with convenient wireless charging capability',
      'Custom-engineered 40mm drivers deliver explosive bass and balanced mids',
      'Multi-directional knob controls playback, volume, and phone call answering',
      'Pass-through 3.5mm audio jack for simultaneous listening with another pair',
    ],
    tags: ['marshall', 'major iv brown', 'vintage headphones', 'wireless', '80h battery'],
    shipping: { weight: 0.165, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 19. Samsung Galaxy Buds 3 Pro
  {
    name: 'Samsung Galaxy Buds 3 Pro True Wireless Earbuds with Galaxy AI - Silver',
    shortDescription: 'Samsung Galaxy Buds 3 Pro with Galaxy AI Live Translate, Dual Drivers, Blade Lights, and Adaptive ANC 2.0',
    description: `Step into a new dimension of smart acoustic performance with Samsung Galaxy Buds 3 Pro. Powered by Galaxy AI, experience real-time language interpretation directly in your ears during foreign conversations.

Featuring a sophisticated 2-way speaker system (10.5mm dynamic woofer + 6.1mm planar tweeter) driven by dual amplifiers, you enjoy 24-bit/96kHz ultra-high-quality studio audio. Adaptive ANC 2.0 with voice and siren detection automatically lowers noise cancellation when sirens sound or someone speaks to you.

The ergonomic blade design features illuminated Blade Lights and intuitive pinch-and-swipe touch controls, delivering both futuristic aesthetics and effortless operation.`,
    brand: 'Samsung',
    sku: 'DE-HP-SAMS-BUDS3P-SLV',
    pricing: {
      basePrice: 24999,
      salePrice: 16999,
      costPrice: 13000,
      discountPercentage: 32,
    },
    inventory: { stock: 15, lowStockThreshold: 3, reorderPoint: 5, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/8/i/w/-original-imahgpxhwrkzvrkz.jpeg?q=80', alt: 'Samsung Galaxy Buds 3 Pro Silver Case and Buds', isPrimary: true },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/s/k/e/-original-imah2nhzec9rvrzy.jpeg?q=80', alt: 'Samsung Galaxy Buds 3 Pro Blade Stem and Light', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/6/2/k/-original-imah2nhzxzkfk7fn.jpeg?q=80', alt: 'Samsung Galaxy Buds 3 Pro In-Ear Fit', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/b/y/s/-original-imah2nhzymmmzycx.jpeg?q=80', alt: 'Samsung Galaxy Buds 3 Pro Transparent Lid Case', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/q/8/v/-original-imah2nhzjwjhpa8a.jpeg?q=80', alt: 'Samsung Galaxy Buds 3 Pro Dual Driver Acoustic Core', isPrimary: false },
    ],
    specifications: [
      { key: 'Headphone Type', value: 'True Wireless In-Ear Earbuds' },
      { key: 'AI Features', value: 'Galaxy AI Real-Time Voice Interpreter & Live Translate' },
      { key: 'Driver System', value: 'Enhanced 2-Way (10.5mm Dynamic Woofer + 6.1mm Planar Tweeter)' },
      { key: 'Amplifier', value: 'Dual Amplifiers (Separately driving woofer & tweeter)' },
      { key: 'Noise Cancellation', value: 'Adaptive ANC 2.0 with Siren & Voice Detect' },
      { key: 'Audio Codec', value: 'Samsung Seamless Codec (SSC) 24-bit/96kHz Hi-Fi' },
      { key: 'Battery Life', value: 'Up to 30 Hours (Case + Buds) / 7 Hours per charge' },
      { key: 'Blade Lights', value: 'Integrated LED Blade Lights with customizable lighting' },
      { key: 'Water Resistance', value: 'IP57 Water and Dust Resistant' },
      { key: 'Warranty', value: '1 Year Samsung Brand Warranty' },
    ],
    highlights: [
      'Galaxy AI powered Live Translate provides real-time in-ear translation',
      'Enhanced 2-Way speakers with planar tweeters and dual amps for 24-bit Hi-Fi sound',
      'Adaptive Noise Control 2.0 intelligently reacts to voices and emergency sirens',
      'Futuristic Blade design with Blade Lights and intuitive pinch/swipe controls',
      'IP57 water and dust resistance with up to 30 hours of long-lasting playback',
    ],
    tags: ['samsung', 'galaxy buds 3 pro', 'galaxy ai', 'tws', 'earbuds', 'anc', 'blade design'],
    shipping: { weight: 0.052, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 20. CMF by Nothing Buds Pro 2 (Orange)
  {
    name: 'CMF by Nothing Buds Pro 2 with Smart Dial - Orange',
    shortDescription: 'CMF by Nothing Buds Pro 2 with Customizable Smart Dial, 50dB Hybrid ANC, LDAC, and Dual Drivers',
    description: `Experience the future of smart wireless earbuds with the CMF by Nothing Buds Pro 2 in signature vibrant Orange. Featuring an industry-first customizable Smart Dial on the case, you can control volume, manage ANC, toggle voice assistant, and answer calls directly with an intuitive twist.

Equipped with dual-driver acoustics (11mm bass driver with titanium coating + 6mm micro-planar tweeter), these earbuds are certified for Hi-Res Audio Wireless with LDAC support for up to 990kbps streaming. 

Enjoy up to 50dB of Hybrid Active Noise Cancellation with smart environment adaptation. With 6 HD microphones and Clear Voice Technology 2.0, your voice is always heard loud and clear. Total battery life extends up to 43 hours.`,
    brand: 'Nothing',
    sku: 'DE-HP-CMF-BP2-ORG',
    pricing: {
      basePrice: 4999,
      salePrice: 4299,
      costPrice: 3200,
      discountPercentage: 14,
    },
    inventory: { stock: 20, lowStockThreshold: 4, reorderPoint: 6, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/x/4/b/-enriched-transparent-original-imahhvazrfvgxyd9.png?q=90', alt: 'CMF Buds Pro 2 Orange Case and Buds', isPrimary: true },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/p/o/n/-original-imah2gngsje6gqa2.jpeg?q=90', alt: 'CMF Buds Pro 2 Orange In-Ear Earbuds', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/c/j/w/-original-imah2gngxpbdnkgp.jpeg?q=90', alt: 'CMF Buds Pro 2 Smart Dial Rotary Control', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/o/z/n/-original-imah2gnhzqvqzhn7.jpeg?q=90', alt: 'CMF Buds Pro 2 Orange Compact Design', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/x/d/u/-original-imah2gngypukz8qk.jpeg?q=90', alt: 'CMF Buds Pro 2 Dual Driver Acoustic Tech', isPrimary: false },
    ],
    specifications: [
      { key: 'Headphone Type', value: 'True Wireless In-Ear Earbuds' },
      { key: 'Case Control', value: 'Rotary Smart Dial (Volume, ANC & Assistant control)' },
      { key: 'Noise Cancellation', value: '50dB Hybrid Active Noise Cancellation' },
      { key: 'Driver Architecture', value: 'Dual Drivers (11mm Dynamic + 6mm Micro-Planar)' },
      { key: 'Hi-Res Audio', value: 'LDAC Certified Hi-Res Audio Wireless' },
      { key: 'Audio Tuning', value: 'Dirac Opteo + Ultra Bass Technology 2.0' },
      { key: 'Battery Life', value: 'Up to 43 Hours Total (Case + Buds)' },
      { key: 'Call Tech', value: '6 HD Microphones with Clear Voice Technology 2.0' },
      { key: 'Water Resistance', value: 'IP55 Water and Dust Resistant' },
      { key: 'Warranty', value: '1 Year Brand Domestic Warranty' },
    ],
    highlights: [
      'Innovative case Smart Dial enables rotary volume and noise cancellation adjustment',
      'Dual Drivers (11mm bass + 6mm micro-planar) deliver rich, cinematic acoustic clarity',
      '50dB Hybrid Active Noise Cancellation with smart adaptive environmental tuning',
      'LDAC Hi-Res Audio Wireless certification with Dirac Opteo sound optimization',
      'Up to 43 hours total playtime with fast charging and IP55 water/dust resistance',
    ],
    tags: ['cmf', 'nothing', 'buds pro 2', 'smart dial', 'tws', 'orange', 'ldac'],
    shipping: { weight: 0.056, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 21. CMF by Nothing Buds Pro 2 (Dark Grey)
  {
    name: 'CMF by Nothing Buds Pro 2 with Smart Dial - Dark Grey',
    shortDescription: 'CMF by Nothing Buds Pro 2 in Dark Grey with Smart Dial, 50dB ANC, Dual Drivers, and 43H Playback',
    description: `Sleek, minimalist, and acoustically mastercrafted — the CMF by Nothing Buds Pro 2 in Dark Grey combines stealthy aesthetics with high-performance audio engineering.

The integrated Smart Dial on the case allows tactile rotary control of playback, volume, and noise cancellation without taking out your smartphone. Inside each earbud, an 11mm bass driver works in tandem with a 6mm micro-planar tweeter for breathtaking full-range audio.

With 50dB Hybrid ANC, ChatGPT voice integration via the Nothing X app, and 6 HD microphones for noise-free calls, the Buds Pro 2 sets a new standard in value-packed audio excellence.`,
    brand: 'Nothing',
    sku: 'DE-HP-CMF-BP2-DGRY',
    pricing: {
      basePrice: 4999,
      salePrice: 4299,
      costPrice: 3200,
      discountPercentage: 14,
    },
    inventory: { stock: 20, lowStockThreshold: 4, reorderPoint: 6, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/o/p/t/-enriched-transparent-original-imahhvaz4jghgmey.png?q=90', alt: 'CMF Buds Pro 2 Dark Grey Front', isPrimary: true },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/w/g/s/-original-imah2gnggtqpuzhm.jpeg?q=90', alt: 'CMF Buds Pro 2 Dark Grey Earbuds', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/h/w/p/-original-imah2gngjcjxvwsw.jpeg?q=90', alt: 'CMF Buds Pro 2 Dark Grey Smart Dial', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/p/y/y/-original-imah2gnggnhkeabg.jpeg?q=90', alt: 'CMF Buds Pro 2 Dark Grey Case Profile', isPrimary: false },
    ],
    specifications: [
      { key: 'Headphone Type', value: 'True Wireless In-Ear Earbuds' },
      { key: 'Color', value: 'Dark Grey' },
      { key: 'Smart Dial', value: 'Rotary Dial on Case for tactile commands' },
      { key: 'Noise Cancellation', value: '50dB Hybrid Active Noise Cancellation' },
      { key: 'Drivers', value: '11mm Titanium Dynamic Driver + 6mm Micro-Planar Tweeter' },
      { key: 'Codecs', value: 'LDAC, AAC, SBC' },
      { key: 'Play Time', value: 'Up to 43 Hours with Case' },
      { key: 'Protection', value: 'IP55 Dust and Water Resistant' },
      { key: 'Warranty', value: '1 Year Brand Domestic Warranty' },
    ],
    highlights: [
      'Understated Dark Grey finish with rotary Smart Dial on case',
      '50dB Hybrid Active Noise Cancellation suppresses harsh environmental background noise',
      'Dual-driver architecture provides pristine highs and deep, articulate sub-bass',
      'LDAC Hi-Res Audio certification with Dirac Opteo acoustic enhancement',
      'Up to 43 hours total playtime with fast charge (10 mins = 7 hours playback)',
    ],
    tags: ['cmf', 'nothing buds pro 2', 'smart dial', 'tws', 'dark grey', 'anc'],
    shipping: { weight: 0.056, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 22. realme Buds Air 6 Pro (Silver Blue)
  {
    name: 'realme Buds Air 6 Pro with 50dB Smart ANC - Silver Blue',
    shortDescription: 'realme Buds Air 6 Pro with Coaxial Dual Drivers, 50dB ANC, 360 Spatial Audio, and LDAC',
    description: `Experience studio-grade acoustics on the move with the realme Buds Air 6 Pro in Silver Blue. Equipped with an advanced coaxial dual-driver system (11mm Dynamic Bass Boost driver + 6mm Micro-Planar tweeter), each earbud reproduces deep resonant bass alongside shimmering, distortion-free treble.

Step into pure acoustic peace with 50dB Smart Active Noise Cancellation that dynamically neutralizes ambient chaos across an ultra-wide 4000Hz frequency spectrum. Certified for Hi-Res Audio with the LDAC HD codec, you hear music in pure original fidelity.

Gamers will appreciate the 55ms super-low latency mode, while a 6-microphone array with AI call noise cancellation ensures pristine voice transmission even on crowded streets. Total playback extends up to 40 hours.`,
    brand: 'Realme',
    sku: 'DE-HP-REALME-A6P-BLU',
    pricing: {
      basePrice: 7999,
      salePrice: 4999,
      costPrice: 3700,
      discountPercentage: 37.5,
    },
    inventory: { stock: 20, lowStockThreshold: 4, reorderPoint: 6, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/v/i/6/-original-imahaumhfjm3udez.jpeg?q=90', alt: 'realme Buds Air 6 Pro Silver Blue Front Case and Buds', isPrimary: true },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/z/7/z/-original-imah223hggvafmpg.jpeg?q=90', alt: 'realme Buds Air 6 Pro In-Ear Earbuds Fit', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/3/g/6/-original-imah223h9qfydhtr.jpeg?q=90', alt: 'realme Buds Air 6 Pro Stem Controls and Microphones', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/g/e/v/-original-imah223hptemyyfh.jpeg?q=90', alt: 'realme Buds Air 6 Pro Dual Driver Acoustic Architecture', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/y/5/8/-original-imah223hgycegdhg.jpeg?q=90', alt: 'realme Buds Air 6 Pro Glossy Charging Case', isPrimary: false },
    ],
    specifications: [
      { key: 'Headphone Type', value: 'True Wireless In-Ear Earbuds' },
      { key: 'Driver Architecture', value: 'Coaxial Dual Drivers (11mm Bass Boost + 6mm Micro-Planar Tweeter)' },
      { key: 'Noise Cancellation', value: '50dB Smart Active Noise Cancellation (4000Hz Ultra-wide)' },
      { key: 'Audio Codec', value: 'LDAC, AAC, SBC (Hi-Res Audio Certified)' },
      { key: 'Spatial Sound', value: '360° Spatial Audio Effect' },
      { key: 'Gaming Latency', value: '55ms Super Low Latency Mode' },
      { key: 'Battery Life', value: 'Up to 40 Hours Total Playback' },
      { key: 'Microphones', value: '6-Mic System with AI Deep Call Noise Cancellation' },
      { key: 'Protection', value: 'IP55 Water and Dust Resistance' },
      { key: 'Warranty', value: '1 Year Domestic Brand Warranty' },
    ],
    highlights: [
      'Hi-Fi coaxial dual drivers (11mm dynamic woofer + 6mm planar tweeter) for studio acoustics',
      '50dB Smart Active Noise Cancellation with ultra-wide 4000Hz band suppression',
      'Certified Hi-Res Audio with LDAC HD codec and 360° Spatial Audio immersion',
      '6-Mic system powered by AI call noise reduction for crystal-clear communications',
      'Up to 40 hours total battery life with fast charging and dual-device connectivity',
    ],
    tags: ['realme', 'buds air 6 pro', 'tws', '50db anc', 'ldac', 'coaxial dual drivers'],
    shipping: { weight: 0.048, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 23. realme Buds Air 6 Pro (Titanium Twilight)
  {
    name: 'realme Buds Air 6 Pro with 50dB Smart ANC - Titanium Twilight',
    shortDescription: 'realme Buds Air 6 Pro in Titanium Twilight with Dual Drivers, 50dB ANC, and 40H Battery',
    description: `Embrace refined metallic style with the realme Buds Air 6 Pro in Titanium Twilight. Combining an 11mm dynamic driver for rumbling sub-bass with a 6mm micro-planar tweeter for crystal-pure treble, these earbuds deliver exceptional audiophile reproduction.

Silence external commotion with 50dB Smart ANC, capable of filtering low and high-frequency noise up to 4000Hz. Stream uncompressed audio with LDAC support, and enjoy three-dimensional 360° Spatial Audio.

With a long-lasting 40-hour battery, dual-device pairing, and an ultra-fast 55ms gaming mode, the realme Buds Air 6 Pro is engineered for users who refuse to compromise on sound or style.`,
    brand: 'Realme',
    sku: 'DE-HP-REALME-A6P-TWL',
    pricing: {
      basePrice: 7999,
      salePrice: 4999,
      costPrice: 3700,
      discountPercentage: 37.5,
    },
    inventory: { stock: 20, lowStockThreshold: 4, reorderPoint: 6, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/z/t/w/-original-imahaummug42d87v.jpeg?q=90', alt: 'realme Buds Air 6 Pro Titanium Twilight Case and Buds', isPrimary: true },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/n/b/k/-original-imah223hfphbdkw7.jpeg?q=90', alt: 'realme Buds Air 6 Pro Titanium In-Ear Earbuds', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/s/w/t/-original-imah223hhqwzyhwf.jpeg?q=90', alt: 'realme Buds Air 6 Pro Metallic Stems and Touch Controls', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/2/f/o/-original-imah223hr4nyz8yx.jpeg?q=90', alt: 'realme Buds Air 6 Pro Charging Case Profile', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/z/m/i/-original-imah223hrzghgwrz.jpeg?q=90', alt: 'realme Buds Air 6 Pro Coaxial Drivers Inside', isPrimary: false },
    ],
    specifications: [
      { key: 'Headphone Type', value: 'True Wireless In-Ear Earbuds' },
      { key: 'Color', value: 'Titanium Twilight' },
      { key: 'Drivers', value: 'Coaxial Dual Drivers (11mm + 6mm Planar)' },
      { key: 'Noise Cancellation', value: '50dB Smart Active Noise Cancellation' },
      { key: 'Audio Formats', value: 'LDAC, AAC, SBC (Hi-Res Audio Certified)' },
      { key: 'Battery Playback', value: 'Up to 40 Hours Total' },
      { key: 'Call Microphones', value: '6 Microphones with AI Noise Filtering' },
      { key: 'Water Resistance', value: 'IP55 Rated' },
      { key: 'Warranty', value: '1 Year Brand Domestic Warranty' },
    ],
    highlights: [
      'Gleaming Titanium Twilight metallic finish with ergonomic pebble case',
      'Dual coaxial acoustic drivers (11mm woofer + 6mm planar tweeter) for master sound',
      '50dB Smart ANC actively cancels ambient train, airplane, and street noise',
      'LDAC 990kbps wireless audio streaming with 360° Spatial Audio Effect',
      'Up to 40 hours total playtime with dual-device seamless connection',
    ],
    tags: ['realme', 'buds air 6 pro titanium', 'tws', '50db anc', 'earbuds', 'ldac'],
    shipping: { weight: 0.048, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },

  // 24. Noise Airwave Max 6 (2026 Launch)
  {
    name: 'Noise Airwave Max 6 Wireless Over-Ear ANC Headphones (2026 Model)',
    shortDescription: 'Noise Airwave Max 6 (2026 Launch) with Hi-Res LDAC Audio, 45dB Adaptive ANC, and 120H Battery',
    description: `Setting a groundbreaking benchmark for 2026, the Noise Airwave Max 6 wireless headphones combine audiophile Hi-Res LDAC audio performance with an astonishing 120 hours of battery life on a single charge.

Featuring 45dB Adaptive Active Noise Cancellation, the Airwave Max 6 analyzes and neutralizes real-time environmental sound across multiple frequencies. Equipped with custom-tuned 40mm composite dynamic drivers, you experience deep sub-bass resonances, silky midtones, and shimmering treble.

With Bluetooth 5.4, ultra-low latency gaming mode, dual pairing support, and premium breathable memory-foam cushions, the Airwave Max 6 is designed to deliver relentless musical immersion for weeks without recharging.`,
    brand: 'Noise',
    sku: 'DE-HP-NOISE-AWMAX6-2026',
    pricing: {
      basePrice: 6999,
      salePrice: 5499,
      costPrice: 3900,
      discountPercentage: 21.43,
    },
    inventory: { stock: 20, lowStockThreshold: 4, reorderPoint: 6, trackInventory: true, soldCount: 0 },
    images: [
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/t/t/v/-original-imahhdknqbgupxng.jpeg?q=80', alt: 'Noise Airwave Max 6 Carbon Black Front', isPrimary: true },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/w/q/s/-original-imahhdknbj6apsyz.jpeg?q=80', alt: 'Noise Airwave Max 6 Plush Memory Foam Earcups', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/s/g/e/-enriched-transparent-original-imah8r3qy6fbtzzw.png?q=90', alt: 'Noise Airwave Max 6 Foldable Headband and Controls', isPrimary: false },
      { url: 'https://rukminim2.flixcart.com/image/800/1070/xif0q/headphone/t/8/1/-original-imah8r3q3deb5ycb.jpeg?q=90', alt: 'Noise Airwave Max 6 Profile View', isPrimary: false },
    ],
    specifications: [
      { key: 'Release Year', value: '2026 Flagship Launch' },
      { key: 'Headphone Type', value: 'Over the Ear (Circumaural)' },
      { key: 'Noise Cancellation', value: '45dB Adaptive Hybrid Active Noise Cancellation' },
      { key: 'Battery Life', value: '120 Hours Total Runtime' },
      { key: 'Audio Codecs', value: 'Hi-Res LDAC, AAC, SBC' },
      { key: 'Drivers', value: '40 mm Composite Dynamic Acoustic Drivers' },
      { key: 'Bluetooth Version', value: 'v5.4 with Dual Device Pairing' },
      { key: 'Gaming Mode', value: 'Ultra-Low 40ms Latency' },
      { key: 'Charging', value: 'Type-C Instacharge (10 Mins = 15 Hours)' },
      { key: 'Warranty', value: '1 Year Brand Domestic Warranty' },
    ],
    highlights: [
      '2026 Flagship Model with staggering 120 Hours non-stop battery life',
      'Hi-Res Audio Wireless certified with LDAC high-bitrate streaming',
      '45dB Adaptive Hybrid Active Noise Cancellation silences ambient noise',
      'Instacharge technology gives 15 hours of playback with just 10 minutes charging',
      'Bluetooth 5.4 with dual pairing and ultra-low 40ms gaming mode',
    ],
    tags: ['noise', 'airwave max 6', '2026 model', '120h battery', 'ldac', 'anc', 'over ear'],
    shipping: { weight: 0.245, unit: 'kg', freeShipping: true, shippingFee: 0 },
  },
];

async function verifyImageUrl(url) {
  try {
    const res = await fetch(url, { headers: { 'Range': 'bytes=0-100', 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch (err) {
    return false;
  }
}

async function seedHeadphones() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas\n');

    const Seller = mongoose.models.Seller || mongoose.model('Seller', new mongoose.Schema({}, { strict: false }));
    const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({}, { strict: false }));
    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

    // Find Dream Electronics seller
    const seller = await Seller.findOne({
      $or: [
        { 'businessInfo.businessName': 'Dream Electronics' },
        { 'storeInfo.storeName': 'Dream Electronics' },
      ],
    });

    if (!seller) {
      console.error('❌ Dream Electronics seller account not found!');
      process.exit(1);
    }
    console.log(`🏢 Seller identified: ${seller.storeInfo?.storeName || seller.businessInfo?.businessName} (${seller._id})`);

    // Verify or find Headphones Category
    let category = await Category.findOne({ slug: 'headphones-all' });
    if (!category) {
      category = await Category.findOne({ name: /Headphone/i });
    }
    const categoryId = category ? category._id : new mongoose.Types.ObjectId('69720d231648cf2c64e400a3');
    const categoryPath = category ? category.path : 'electronics/audio/headphones-all';
    console.log(`📁 Category: Headphones (ID: ${categoryId}, Path: ${categoryPath})\n`);

    console.log(`🔍 Pre-verifying all image URLs live via HTTP (no 404s allowed)...`);
    let totalImagesChecked = 0;
    let totalImagesOk = 0;

    for (const hp of headphoneProducts) {
      if (!hp.images || hp.images.length < 4) {
        throw new Error(`Product ${hp.name} has fewer than 4 images (${hp.images?.length || 0})!`);
      }
      for (const img of hp.images) {
        totalImagesChecked++;
        const ok = await verifyImageUrl(img.url);
        if (!ok) {
          throw new Error(`❌ Image URL failed verification (404/error): ${img.url} on product ${hp.name}`);
        }
        totalImagesOk++;
      }
    }
    console.log(`✅ All ${totalImagesChecked}/${totalImagesChecked} image URLs verified 100% OK (HTTP 200/206)! Zero 404s!\n`);

    console.log(`📦 Upserting ${headphoneProducts.length} Headphone Products into MongoDB...`);
    let inserted = 0;
    let updated = 0;

    for (const hp of headphoneProducts) {
      const payload = {
        ...hp,
        sellerId: seller._id,
        category: categoryId,
        categoryPath: categoryPath,
        subCategory: 'Headphones',
        isActive: true,
        isApproved: true,
        isFeatured: true,
        isDraft: false,
      };

      const existing = await Product.findOne({ sku: hp.sku });
      if (existing) {
        await Product.updateOne({ sku: hp.sku }, { $set: payload });
        console.log(`🔄 [UPDATED] ${hp.brand.padEnd(10)} | ${hp.sku.padEnd(24)} | ₹${hp.pricing.salePrice} | ${hp.images.length} images | ${hp.name.substring(0, 45)}...`);
        updated++;
      } else {
        await Product.create(payload);
        console.log(`✨ [INSERTED] ${hp.brand.padEnd(10)} | ${hp.sku.padEnd(24)} | ₹${hp.pricing.salePrice} | ${hp.images.length} images | ${hp.name.substring(0, 45)}...`);
        inserted++;
      }
    }

    console.log('\n=======================================');
    console.log('🎉 HEADPHONE SEEDING COMPLETED!');
    console.log('=======================================');
    console.log(`🏢 Seller: Dream Electronics (${seller._id})`);
    console.log(`🎧 Total Headphones: ${headphoneProducts.length} (Inserted: ${inserted}, Updated: ${updated})`);

    const brandCounts = {};
    headphoneProducts.forEach((p) => {
      brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
    });
    console.log('📊 Brand Breakdown:', brandCounts);

    await mongoose.connection.close();
    console.log('🔌 Database connection closed\n');
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedHeadphones();
