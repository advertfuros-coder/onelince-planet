// components/customer/ProductCarousel.jsx
'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FiChevronLeft, FiChevronRight, FiHeart, FiEye } from 'react-icons/fi'
import { AiFillHeart } from 'react-icons/ai'
import { formatPrice } from '../../lib/utils'
import Button from '../ui/Button'

export default function ProductCarousel({ 
  title, 
  subtitle, 
  products = [], 
  viewAllLink,
  bgColor = 'bg-white' 
}) {
  const scrollRef = useRef(null)
  const [wishlist, setWishlist] = useState([])

  const scroll = (direction) => {
    const { current } = scrollRef
    if (current) {
      const scrollAmount = direction === 'left' ? -300 : 300
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  const toggleWishlist = (productId) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  return (
    <section className={`py-12 ${bgColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">{title}</h2>
            {subtitle && <p className="text-gray-600">{subtitle}</p>}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <button
                onClick={() => scroll('left')}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
            {viewAllLink && (
              <Link href={viewAllLink}>
                <Button variant="outline">View All</Button>
              </Link>
            )}
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => {
            const isWishlisted = wishlist.includes(product.id)
            const discount = product.originalPrice ? 
              Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0

            return (
              <div
                key={product.id}
                className="flex-none w-72 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={288}
                    height={200}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {discount > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                      -{discount}%
                    </div>
                  )}

                  <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    >
                      {isWishlisted ? (
                        <AiFillHeart className="w-5 h-5 text-red-500" />
                      ) : (
                        <FiHeart className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                    <Link href={`/products/${product.id}`}>
                      <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                        <FiEye className="w-5 h-5 text-gray-600" />
                      </button>
                    </Link>
                  </div>

                  {product.badge && (
                    <div className="absolute bottom-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      {product.badge}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="mb-2">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      {product.category}
                    </span>
                  </div>
                  
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 fill-current ${
                              i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">({product.reviews})</span>
                    </div>
                    
                    {product.stock <= 5 && (
                      <span className="text-xs text-red-500 font-medium">
                        Only {product.stock} left!
                      </span>
                    )}
                  </div>

                  <Button 
                    className="w-full mt-4" 
                    variant="outline"
                    onClick={() => {
                      // Add to cart logic
                      console.log('Add to cart:', product.id)
                    }}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
