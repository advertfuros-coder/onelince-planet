'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const defaultCategories = [
  {
    id: 'electronics',
    name: 'Electronics',
    icon: '/category-icons/electronics.png',
    link: '/products?category=electronics',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'fashion',
    name: 'Fashion',
    icon: '/category-icons/fashion.png',
    link: '/products?category=fashion',
    color: 'from-pink-500 to-rose-600'
  },
  {
    id: 'home',
    name: 'Home & Decor',
    icon: '/category-icons/home.png',
    link: '/products?category=home',
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 'beauty',
    name: 'Beauty & Skin',
    icon: '/category-icons/beauty.png',
    link: '/products?category=beauty',
    color: 'from-purple-500 to-violet-600'
  },
  {
    id: 'books',
    name: 'Books',
    icon: '/category-icons/books.png',
    link: '/products?category=books',
    color: 'from-orange-500 to-amber-600'
  },
  {
    id: 'sports',
    name: 'Health & Fitness',
    icon: '/category-icons/sports.png',
    link: '/products?category=health',
    color: 'from-cyan-500 to-teal-600'
  },
  {
    id: 'groceries',
    name: 'Groceries',
    emoji: '🛒',
    link: '/products?category=groceries',
    color: 'from-lime-500 to-green-600'
  },
  {
    id: 'gifts',
    name: 'Gifts',
    emoji: '🎁',
    link: '/products?category=gifts',
    color: 'from-red-500 to-pink-600'
  }
]

export default function CategoryCircles() {
  const [categories, setCategories] = useState(defaultCategories)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()

        if (data.success && data.categories && data.categories.length > 0) {
          // Map API categories with our default icons
          const mappedCategories = data.categories.map(cat => {
            const defaultCat = defaultCategories.find(
              dc => dc.id === cat.slug || dc.name.toLowerCase() === cat.name.toLowerCase()
            )
            return {
              id: cat._id || cat.id,
              name: cat.name,
              icon: cat.icon || defaultCat?.icon,
              emoji: cat.emoji || defaultCat?.emoji,
              link: `/products?category=${cat.slug || cat.name.toLowerCase()}`,
              color: cat.color || defaultCat?.color || 'from-gray-500 to-gray-600'
            }
          })
          setCategories(mappedCategories)
        }
      } catch (error) {
        console.log('Using default categories:', error)
        // Keep using default categories on error
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse flex justify-center gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900">
            Explore Popular Categories
          </h2>
          <Link
            href="/products"
            className="text-blue-600 hover:text-blue-700 font-bold text-sm flex items-center gap-1 transition-colors"
          >
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Category Grid - Horizontal Scrollable */}
        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={category.link}
                className="group flex flex-col items-center gap-3 flex-shrink-0 snap-start"
              >
                {/* Icon Circle with Light Background */}
                <div className="relative w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  {category.emoji ? (
                    <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                      {category.emoji}
                    </span>
                  ) : (
                    <img
                      src={category.icon}
                      alt={category.name}
                      className="  object-contain group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentElement.innerHTML = '<span class="text-4xl">🏷️</span>'
                      }}
                    />
                  )}
                </div>

                {/* Category Name */}
                <span className="text-sm font-bold text-gray-900 text-center group-hover:text-blue-600 transition-colors duration-300 max-w-[130px]">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>

          {/* Scroll Arrows for Desktop */}
          <button
            onClick={() => {
              document.querySelector('.overflow-x-auto').scrollBy({ left: -200, behavior: 'smooth' })
            }}
            className="hidden md:flex absolute left-0 top-1/3 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg items-center justify-center hover:bg-gray-50 transition-colors z-10"
            aria-label="Scroll left"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => {
              document.querySelector('.overflow-x-auto').scrollBy({ left: 200, behavior: 'smooth' })
            }}
            className="hidden md:flex absolute right-0 top-1/3 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg items-center justify-center hover:bg-gray-50 transition-colors z-10"
            aria-label="Scroll right"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}
