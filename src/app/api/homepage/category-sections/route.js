import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Product } from '@/lib/db/models';

export const dynamic = 'force-dynamic';

const CATEGORY_SECTIONS_CONFIG = [
  {
    id: 'air-conditioners',
    name: 'Air Conditioners',
    title: 'Cool Comfort & Inverter ACs',
    subtitle: 'Beat the heat with energy-efficient 2025 & 2026 smart inverter air conditioners',
    badge: '2025/2026 Models',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    iconEmoji: '❄️',
    link: '/products?category=Air Conditioners',
    filter: { category: 'Air Conditioners' },
  },
  {
    id: 'smartphones',
    name: 'Smartphones',
    title: 'Flagship Smartphones & 5G',
    subtitle: 'Experience next-gen speed, pro camera systems, and vibrant AMOLED displays',
    badge: 'Latest Tech',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    iconEmoji: '📱',
    link: '/products?category=Smartphones',
    filter: { category: 'Smartphones' },
  },
  {
    id: 'laptops',
    name: 'Laptops',
    title: 'High-Performance Laptops',
    subtitle: 'From ultra-thin MacBooks to RTX gaming beasts and AI-powered workstations',
    badge: 'Top Rated',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    iconEmoji: '💻',
    link: '/products?category=Laptops',
    filter: { category: 'Laptops' },
  },
  {
    id: 'tablets',
    name: 'Tablets & iPads',
    title: 'Tablets & iPads',
    subtitle: 'Unleash creativity and productivity on OLED touchscreens with stylus support',
    badge: 'Productivity',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    iconEmoji: '📟',
    link: '/products?category=Tablets %26 iPads',
    filter: { category: 'Tablets & iPads' },
  },
  {
    id: 'headphones',
    name: 'Headphones & Audio',
    title: 'Premium Audio & Headphones',
    subtitle: 'Studio-quality active noise cancellation, lossless fidelity, and wireless freedom',
    badge: 'Immersive Sound',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    iconEmoji: '🎧',
    link: '/products?category=Headphones',
    filter: { category: 'Headphones' },
  },
  {
    id: 'smart-tv',
    name: 'Smart TVs',
    title: '4K QLED & Smart TVs',
    subtitle: 'Transform your living room with Dolby Vision, HDR10+, and cinematic surround sound',
    badge: 'Home Cinema',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    iconEmoji: '📺',
    link: '/products?category=Smart TV',
    filter: { category: 'Smart TV' },
  },
  {
    id: 'skincare',
    name: 'Skincare & Beauty',
    title: 'Skincare & Glow Essentials',
    subtitle: 'Dermatologist-approved serums, sunscreens, and nourishing botanicals',
    badge: 'Self Care',
    badgeColor: 'bg-pink-50 text-pink-700 border-pink-200',
    iconEmoji: '✨',
    link: '/products?category=Skincare',
    filter: { category: { $in: ['Skincare', 'Beauty & Skin', 'Face Moisturizers'] } },
  },
  {
    id: 'tops-tees',
    name: "Women's Tops & Tees",
    title: "Women's Trending Tops & Tees",
    subtitle: 'Elevate your daily wardrobe with breathable fabrics, trendy fits, and fresh designs',
    badge: 'Trending Styles',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconEmoji: '👗',
    link: '/products?category=Tops %26 Tees',
    filter: { category: 'Tops & Tees' },
  },
  {
    id: 'shirts',
    name: "Men's Shirts",
    title: "Men's Premium Shirts",
    subtitle: 'Crisp cotton formal shirts and effortless casual linens tailored for every occasion',
    badge: 'Sharp & Classic',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    iconEmoji: '👔',
    link: '/products?category=Shirts',
    filter: { category: 'Shirts' },
  },
  {
    id: 'jeans',
    name: "Men's Jeans & Denim",
    title: "Men's Denim & Jeans",
    subtitle: 'Slim, tapered, and relaxed fits crafted with premium stretch denim for all-day wear',
    badge: 'Everyday Comfort',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    iconEmoji: '👖',
    link: '/products?category=Jeans',
    filter: { category: 'Jeans' },
  },
  {
    id: 'furniture',
    name: 'Modern Living & Furniture',
    title: 'Modern Living & Furniture',
    subtitle: 'Ergonomic couches, solid wood dining, orthopedic beds, and designer wardrobes',
    badge: 'Interior Decor',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    iconEmoji: '🛋️',
    link: '/products?category=Sofas %26 Couches',
    filter: { category: { $in: ['Sofas & Couches', 'Beds', 'Dining Tables', 'Wardrobes', 'Office Furniture'] } },
  },
];

export async function GET() {
  try {
    await dbConnect();

    // Query all sections in parallel
    const sectionsWithProducts = await Promise.all(
      CATEGORY_SECTIONS_CONFIG.map(async (sec) => {
        try {
          const rawProducts = await Product.find({
            ...sec.filter,
            isActive: true,
          })
            .select(
              '_id name slug brand category subCategory pricing images ratings inventory highlights tags isFeatured createdAt'
            )
            .sort({ createdAt: -1 })
            .limit(15)
            .lean();

          const products = rawProducts.map((p) => {
            const basePrice = p.pricing?.basePrice || 0;
            const salePrice = p.pricing?.salePrice || basePrice;
            const discount =
              basePrice && salePrice && basePrice > salePrice
                ? Math.round(((basePrice - salePrice) / basePrice) * 100)
                : 0;

            return {
              ...p,
              _id: p._id.toString(),
              name: p.name,
              brand: p.brand || '',
              category: p.category || sec.name,
              pricing: {
                basePrice,
                salePrice,
                discountPercentage: discount,
              },
              images:
                p.images && p.images.length > 0
                  ? p.images.map((img) => ({
                      url: typeof img === 'string' ? img : img.url,
                      alt: (typeof img === 'object' && img.alt) || p.name,
                    }))
                  : [{ url: '/placeholder-product.png', alt: p.name }],
              ratings: {
                average: p.ratings?.average || 4.5,
                count: p.ratings?.count || 24,
              },
              inventory: {
                stock: p.inventory?.stock !== undefined ? p.inventory.stock : 10,
              },
            };
          });

          return {
            id: sec.id,
            name: sec.name,
            title: sec.title,
            subtitle: sec.subtitle,
            badge: sec.badge,
            badgeColor: sec.badgeColor,
            iconEmoji: sec.iconEmoji,
            link: sec.link,
            totalProducts: products.length,
            products,
          };
        } catch (err) {
          console.error(`Error loading section ${sec.id}:`, err);
          return {
            id: sec.id,
            name: sec.name,
            title: sec.title,
            subtitle: sec.subtitle,
            badge: sec.badge,
            badgeColor: sec.badgeColor,
            iconEmoji: sec.iconEmoji,
            link: sec.link,
            totalProducts: 0,
            products: [],
          };
        }
      })
    );

    // Filter out sections with 0 products if any, but ensure we keep valid ones
    const activeSections = sectionsWithProducts.filter((sec) => sec.products.length > 0);

    return NextResponse.json({
      success: true,
      count: activeSections.length,
      sections: activeSections,
    });
  } catch (error) {
    console.error('Error in /api/homepage/category-sections:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch homepage category sections',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
