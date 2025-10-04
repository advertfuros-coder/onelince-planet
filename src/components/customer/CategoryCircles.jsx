// components/customer/CategoryCircles.jsx
import Link from 'next/link'
import { GiClothes, GiSparkles, GiCakeSlice } from 'react-icons/gi'
import { FiHome, FiSmartphone, FiBookOpen, FiHeart, FiGift } from 'react-icons/fi'

const categories = [
  {
    id: 1,
    name: 'Fashion',
    icon: GiClothes,
    link: '/products?category=fashion',
    color: 'bg-pink-100 text-pink-600',
    hoverColor: 'hover:bg-pink-200'
  },
  {
    id: 2,
    name: 'Home & Decor',
    icon: FiHome,
    link: '/products?category=home',
    color: 'bg-blue-100 text-blue-600',
    hoverColor: 'hover:bg-blue-200'
  },
  {
    id: 3,
    name: 'Electronics',
    icon: FiSmartphone,
    link: '/products?category=electronics',
    color: 'bg-purple-100 text-purple-600',
    hoverColor: 'hover:bg-purple-200'
  },
  {
    id: 4,
    name: 'Books',
    icon: FiBookOpen,
    link: '/products?category=books',
    color: 'bg-green-100 text-green-600',
    hoverColor: 'hover:bg-green-200'
  },
  {
    id: 5,
    name: 'Beauty & Skin',
    icon: GiSparkles,
    link: '/products?category=beauty',
    color: 'bg-yellow-100 text-yellow-600',
    hoverColor: 'hover:bg-yellow-200'
  },
  {
    id: 6,
    name: 'Groceries',
    icon: GiCakeSlice,
    link: '/products?category=groceries',
    color: 'bg-orange-100 text-orange-600',
    hoverColor: 'hover:bg-orange-200'
  },
  {
    id: 7,
    name: 'Health',
    icon: FiHeart,
    link: '/products?category=health',
    color: 'bg-red-100 text-red-600',
    hoverColor: 'hover:bg-red-200'
  },
  {
    id: 8,
    name: 'Gifts',
    icon: FiGift,
    link: '/products?category=gifts',
    color: 'bg-indigo-100 text-indigo-600',
    hoverColor: 'hover:bg-indigo-200'
  }
]

export default function CategoryCircles() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Shop by Category</h2>
          <p className="text-gray-600">Discover products across all categories</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Link
                key={category.id}
                href={category.link}
                className="group flex flex-col items-center"
              >
                <div className={`
                  w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center
                  ${category.color} ${category.hoverColor}
                  transition-all duration-300 group-hover:scale-110 shadow-md
                `}>
                  <Icon className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                <span className="mt-3 text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors text-center">
                  {category.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
