'use client'
import Link from 'next/link'
import { FiArrowRight, FiChevronRight } from 'react-icons/fi'

const topBrands = [
  {
    id: 1,
    name: 'Samsung',
    domain: 'samsung.com',
    category: 'Electronics',
    productsCount: '1.2k+',
    href: '/products?brand=samsung',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 2,
    name: 'Nike',
    domain: 'nike.com',
    category: 'Fashion',
    productsCount: '850+',
    href: '/products?brand=nike',
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 3,
    name: 'Apple',
    domain: 'apple.com',
    category: 'Electronics',
    productsCount: '450+',
    href: '/products?brand=apple',
    color: 'from-gray-700 to-gray-900'
  },
  {
    id: 4,
    name: 'Adidas',
    domain: 'adidas.com',
    category: 'Sportswear',
    productsCount: '700+',
    href: '/products?brand=adidas',
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    id: 5,
    name: 'Sony',
    domain: 'sony.com',
    category: 'Electronics',
    productsCount: '600+',
    href: '/products?brand=sony',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 6,
    name: 'Xiaomi',
    domain: 'mi.com',
    category: 'Mobiles',
    productsCount: '800+',
    href: '/products?brand=xiaomi',
    color: 'from-red-500 to-orange-500'
  },
  {
    id: 7,
    name: 'Puma',
    domain: 'puma.com',
    category: 'Fashion',
    productsCount: '400+',
    href: '/products?brand=puma',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 8,
    name: 'Zara',
    domain: 'zara.com',
    category: 'Fashion',
    productsCount: '650+',
    href: '/products?brand=zara',
    color: 'from-pink-500 to-rose-600'
  },
  {
    id: 9,
    name: 'LG',
    domain: 'lg.com',
    category: 'Electronics',
    productsCount: '550+',
    href: '/products?brand=lg',
    color: 'from-red-600 to-pink-600'
  },
  {
    id: 10,
    name: 'Levi\'s',
    domain: 'levi.com',
    category: 'Apparel',
    productsCount: '500+',
    href: '/products?brand=levis',
    color: 'from-blue-600 to-indigo-700'
  },
  {
    id: 11,
    name: 'H&M',
    domain: 'hm.com',
    category: 'Fashion',
    productsCount: '900+',
    href: '/products?brand=hm',
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 12,
    name: 'Boat',
    domain: 'boat-lifestyle.com',
    category: 'Audio',
    productsCount: '300+',
    href: '/products?brand=boat',
    color: 'from-cyan-500 to-blue-600'
  }
]

export default function TopBrands() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
              Shop by Top Brands
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              Explore products from your favorite brands
            </p>
          </div>
          <Link
            href="/brands"
            className="hidden md:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors group"
          >
            View All
            <FiChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Brand Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {topBrands.map((brand) => (
            <Link
              key={brand.id}
              href={brand.href}
              className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 overflow-hidden"
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${brand.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center text-center">
                {/* Brand Logo */}
                <div className="w-16 h-16 mb-4 flex items-center justify-center bg-gray-50 rounded-xl group-hover:bg-white transition-colors">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${brand.domain}&sz=128`}
                    alt={brand.name}
                    className="max-w-[60%] max-h-[60%] object-contain transform group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      if (!e.target.src.includes('duckduckgo')) {
                        e.target.src = `https://icons.duckduckgo.com/ip3/${brand.domain}.ico`
                      } else {
                        e.target.src = `https://ui-avatars.com/api/?name=${brand.name}&background=f3f4f6&color=1f2937&bold=true&size=128`
                      }
                    }}
                  />
                </div>

                {/* Brand Name */}
                <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">
                  {brand.name}
                </h3>

                {/* Category */}
                <p className="text-xs text-gray-500 mb-2">
                  {brand.category}
                </p>

                {/* Products Count */}
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
                  {brand.productsCount} items
                </div>
              </div>

              {/* Arrow Icon */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <FiArrowRight className="w-4 h-4 text-blue-600" />
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="md:hidden mt-6 text-center">
          <Link
            href="/brands"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
          >
            View All Brands
            <FiChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
