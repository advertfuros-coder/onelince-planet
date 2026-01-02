'use client'
import Link from 'next/link'
import { FiArrowUpRight, FiMinus } from 'react-icons/fi'

const topBrands = [
  {
    id: 1,
    name: 'Samsung',
    domain: 'samsung.com',
    category: 'Electronics',
    productsCount: '1.2k+',
    href: '/products?brand=samsung'
  },
  {
    id: 2,
    name: 'Nike',
    domain: 'nike.com',
    category: 'Fashion',
    productsCount: '850+',
    href: '/products?brand=nike'
  },
  {
    id: 3,
    name: 'Apple',
    domain: 'apple.com',
    category: 'Electronics',
    productsCount: '450+',
    href: '/products?brand=apple'
  },
  {
    id: 4,
    name: 'Adidas',
    domain: 'adidas.com',
    category: 'Sportswear',
    productsCount: '700+',
    href: '/products?brand=adidas'
  },
  {
    id: 5,
    name: 'Sony',
    domain: 'sony.com',
    category: 'Electronics',
    productsCount: '600+',
    href: '/products?brand=sony'
  },
  {
    id: 6,
    name: 'Xiaomi',
    domain: 'mi.com',
    category: 'Mobiles',
    productsCount: '800+',
    href: '/products?brand=xiaomi'
  },
  {
    id: 7,
    name: 'Puma',
    domain: 'puma.com',
    category: 'Fashion',
    productsCount: '400+',
    href: '/products?brand=puma'
  },
  {
    id: 8,
    name: 'Zara',
    domain: 'zara.com',
    category: 'Fashion',
    productsCount: '650+',
    href: '/products?brand=zara'
  },
  {
    id: 9,
    name: 'LG',
    domain: 'lg.com',
    category: 'Electronics',
    productsCount: '550+',
    href: '/products?brand=lg'
  },
  {
    id: 10,
    name: 'Levi\'s',
    domain: 'levi.com',
    category: 'Apparel',
    productsCount: '500+',
    href: '/products?brand=levis'
  },
  {
    id: 11,
    name: 'H&M',
    domain: 'hm.com',
    category: 'Fashion',
    productsCount: '900+',
    href: '/products?brand=hm'
  },
  {
    id: 12,
    name: 'Boat',
    domain: 'boat-lifestyle.com',
    category: 'Audio',
    productsCount: '300+',
    href: '/products?brand=boat'
  }
]

export default function TopBrands() {
  return (
    <section className="py-24 bg-white border-y border-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-4">
              <FiMinus className="text-blue-600 w-8" />
              <span className="text-blue-600 font-bold text-[10px] uppercase tracking-[0.3em]">Partner Network</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter leading-none mb-4">
              Featured <br /> Brands
            </h2>
            <p className="text-gray-500 text-sm md:text-base font-medium">
              Collaborating with the world's most innovative labels to bring you excellence.
            </p>
          </div>
          <Link
            href="/brands"
            className="group flex items-center gap-3 text-gray-900 font-black text-sm uppercase tracking-widest border-b-2 border-gray-900 pb-1 hover:text-blue-600 hover:border-blue-600 transition-all"
          >
            All Partnerships
            <FiArrowUpRight className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </div>

        {/* Brand Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-px bg-gray-100 border border-gray-100">
          {topBrands.map((brand) => (
            <Link
              key={brand.id}
              href={brand.href}
              className="group relative bg-white aspect-square flex flex-col items-center justify-center p-8 transition-all duration-500 hover:z-10 hover:shadow-2xl"
            >
              <div className="relative w-24 h-24 mb-6 flex items-center justify-center gra yscale group-hover:grayscale-0 transition-all duration-700">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${brand.domain}&sz=128`}
                  alt={brand.name}
                  className="max-w-[70%] max-h-[70%] object-contain transform group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    // Try second CDN if primary fails
                    if (!e.target.src.includes('duckduckgo')) {
                      e.target.src = `https://icons.duckduckgo.com/ip3/${brand.domain}.ico`
                    } else {
                      // Ultimate fallback
                      e.target.src = `https://ui-avatars.com/api/?name=${brand.name}&background=f3f4f6&color=1f2937&bold=true&size=128`
                    }
                  }}
                />
              </div>

              <div className="absolute inset-0 bg-gray-900 opacity-0 group-hover:opacity-[0.02] transition-opacity duration-500"></div>

              <div className="text-center opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                <h3 className="font-black text-xs uppercase tracking-widest text-gray-900 mb-1">
                  {brand.name}
                </h3>
                <p className="text-[10px] text-blue-600 font-bold">
                  {brand.productsCount} Items
                </p>
              </div>

              {/* Decorative Corner */}
              <div className="absolute top-4 right-4 text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                <FiArrowUpRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
