// components/customer/TopBrands.jsx
import Link from 'next/link'
import Image from 'next/image'

const topBrands = [
  {
    id: 1,
    name: 'Samsung',
    logo: '/images/brands/samsung.png',
    category: 'Electronics',
    productsCount: 1250,
    href: '/products?brand=samsung',
    description: 'Leading technology brand'
  },
  {
    id: 2,
    name: 'Nike',
    logo: '/images/brands/nike.png',
    category: 'Fashion & Sports',
    productsCount: 890,
    href: '/products?brand=nike',
    description: 'Just Do It'
  },
  {
    id: 3,
    name: 'Apple',
    logo: '/images/brands/apple.png',
    category: 'Electronics',
    productsCount: 456,
    href: '/products?brand=apple',
    description: 'Think Different'
  },
  {
    id: 4,
    name: 'Adidas',
    logo: '/images/brands/adidas.png',
    category: 'Fashion & Sports',
    productsCount: 732,
    href: '/products?brand=adidas',
    description: 'Impossible Is Nothing'
  },
  {
    id: 5,
    name: 'Levi\'s',
    logo: '/images/brands/levis.png',
    category: 'Fashion',
    productsCount: 567,
    href: '/products?brand=levis',
    description: 'Original Jeans'
  },
  {
    id: 6,
    name: 'Sony',
    logo: '/images/brands/sony.png',
    category: 'Electronics',
    productsCount: 678,
    href: '/products?brand=sony',
    description: 'Be Moved'
  },
  {
    id: 7,
    name: 'Puma',
    logo: '/images/brands/puma.png',
    category: 'Fashion & Sports',
    productsCount: 445,
    href: '/products?brand=puma',
    description: 'Forever Faster'
  },
  {
    id: 8,
    name: 'Xiaomi',
    logo: '/images/brands/xiaomi.png',
    category: 'Electronics',
    productsCount: 823,
    href: '/products?brand=xiaomi',
    description: 'Innovation for Everyone'
  },
  {
    id: 9,
    name: 'H&M',
    logo: '/images/brands/hm.png',
    category: 'Fashion',
    productsCount: 934,
    href: '/products?brand=hm',
    description: 'Fashion and Quality'
  },
  {
    id: 10,
    name: 'Boat',
    logo: '/images/brands/boat.png',
    category: 'Electronics',
    productsCount: 312,
    href: '/products?brand=boat',
    description: 'Indian Audio Brand'
  },
  {
    id: 11,
    name: 'Zara',
    logo: '/images/brands/zara.png',
    category: 'Fashion',
    productsCount: 678,
    href: '/products?brand=zara',
    description: 'Latest Fashion Trends'
  },
  {
    id: 12,
    name: 'LG',
    logo: '/images/brands/lg.png',
    category: 'Electronics',
    productsCount: 589,
    href: '/products?brand=lg',
    description: 'Life\'s Good'
  }
]

export default function TopBrands() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Top Brands</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover authentic products from your favorite global and Indian brands
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {topBrands.map((brand) => (
            <Link
              key={brand.id}
              href={brand.href}
              className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300"
            >
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={48}
                    height={48}
                    className="object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {brand.name}
                </h3>
                
                <p className="text-xs text-gray-500 mb-2">
                  {brand.category}
                </p>
                
                <p className="text-xs text-gray-600 font-medium">
                  {brand.productsCount} Products
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/brands"
            className="inline-flex items-center px-6 py-3 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
          >
            View All Brands
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
