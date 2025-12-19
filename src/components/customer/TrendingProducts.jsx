// components/customer/TrendingProducts.jsx
'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FiHeart, FiShoppingCart, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import WishlistButton from '@/components/customer/WishlistButton'

const tabs = [
  { id: 'new', label: 'New Products', color: 'bg-yellow-400 text-gray-900' },
  { id: 'bestselling', label: 'Best Selling', color: 'bg-white text-gray-700 border border-gray-200' },
  { id: 'featured', label: 'Featured Products', color: 'bg-white text-gray-700 border border-gray-200' }
]

export default function TrendingProducts({ products = [] }) {
  const [activeTab, setActiveTab] = useState('new')

  // Sample products if none provided
  const sampleProducts = [
    {
      _id: '1',
      name: 'Kids Headphones Bulk 10 Pack Multi Colored For Students',
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'],
      price: 56.00,
      mrp: 1050.00,
      discount: 95,
      rating: 4,
      reviews: 738,
      badge: '-95%'
    },
    {
      _id: '2',
      name: 'Pioneer DJ HDJ-X5-S Professional DJ Headphones',
      images: ['https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop'],
      price: 250.00,
      mrp: 1050.00,
      discount: 76,
      rating: 5,
      reviews: 536,
      badge: '-76%'
    },
    {
      _id: '3',
      name: 'Bang & Olufsen Beoplay H8 Wireless Over-Ear Headphones',
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'],
      price: 602.00,
      mrp: 1200.00,
      discount: 50,
      rating: 4,
      reviews: 423
    },
    {
      _id: '4',
      name: 'APPLE Watch Series 2 - 42 Mm Stainless Steel Case',
      images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop'],
      price: 1102.00,
      mrp: 1500.00,
      discount: 27,
      rating: 5,
      reviews: 892
    },
    {
      _id: '5',
      name: 'Beoplay A1 Portable Bluetooth Speaker With Microphone',
      images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop'],
      price: 241.99,
      mrp: 350.00,
      discount: 31,
      rating: 4,
      reviews: 267
    },
    {
      _id: '6',
      name: 'Realme Pad Mini 3 GB RAM 32 GB ROM 8.7 Inch With Wi-Fi+4G',
      images: ['https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=400&fit=crop'],
      price: 122.00,
      mrp: 200.00,
      discount: 39,
      rating: 5,
      reviews: 1543
    }
  ]

  const displayProducts = products.length > 0 ? products : sampleProducts

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Our Trending <span className="text-gray-500">Products</span>
          </h2>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 ${activeTab === tab.id
                    ? tab.color
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-yellow-400'
                  }`}
              >
                {tab.label}
              </button>
            ))}

            {/* Navigation Arrows */}
            <div className="hidden md:flex items-center gap-2 ml-4">
              <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <FiChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <FiChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {displayProducts.map((product) => (
            <div
              key={product._id}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Product Image */}
              <div className="relative aspect-square bg-gray-50 p-4">
                {/* Discount Badge */}
                {product.badge && (
                  <div className="absolute top-3 left-3 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded-md z-10">
                    {product.badge}
                  </div>
                )}

                {/* Wishlist Button */}
                <div className="absolute top-3 right-3 z-10">
                  <WishlistButton productId={product._id} size="sm" />
                </div>

                {/* Product Image */}
                <Link href={`/products/${product._id}`}>
                  <div className="relative w-full h-full">
                    {product.images?.[0] && (
                      <img
                        src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url || product.images[0]}
                        alt={product.name}
                        fill
                        className="object-contain group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      />
                    )}
                  </div>
                </Link>

                {/* Quick Add to Cart (appears on hover) */}
                <button className="absolute bottom-3 left-1/2 -translate-x-1/2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg">
                  <FiShoppingCart className="w-5 h-5 text-gray-900" />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-4">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-3 h-3 ${i < product.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                  <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
                </div>

                {/* Product Name */}
                <Link href={`/products/${product._id}`}>
                  <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors min-h-[40px]">
                    {product.name}
                  </h3>
                </Link>

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.mrp && product.mrp > product.price && (
                    <span className="text-sm text-gray-400 line-through">
                      ${product.mrp.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Category Banners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/products?category=electronics"
            className="group relative h-32 rounded-xl overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <div className="relative h-full flex items-center justify-center">
              <div className="text-center text-white">
                <h3 className="text-2xl font-bold mb-1">Electronics</h3>
                <p className="text-sm opacity-90">Explore Latest Gadgets</p>
              </div>
            </div>
          </Link>

          <Link
            href="/products?category=fashion"
            className="group relative h-32 rounded-xl overflow-hidden bg-gradient-to-r from-yellow-400 to-orange-500 hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
            <div className="relative h-full flex items-center justify-center">
              <div className="text-center text-gray-900">
                <h3 className="text-2xl font-bold mb-1">Fashion</h3>
                <p className="text-sm opacity-90">Trending Styles</p>
              </div>
            </div>
          </Link>

          <Link
            href="/products?category=home"
            className="group relative h-32 rounded-xl overflow-hidden bg-gradient-to-r from-red-500 to-pink-600 hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <div className="relative h-full flex items-center justify-center">
              <div className="text-center text-white">
                <h3 className="text-2xl font-bold mb-1">Home & Living</h3>
                <p className="text-sm opacity-90">Transform Your Space</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
