// app/(customer)/page.jsx
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import axios from 'axios'
import {
  FiShoppingBag,
  FiSearch,
  FiUser,
  FiMapPin,
  FiChevronRight,
  FiClock
} from 'react-icons/fi'
import { useAuth } from '@/lib/context/AuthContext'
import { useCart } from '@/lib/context/CartContext'
import { useCurrency } from '@/lib/context/CurrencyContext'

export default function HomePage() {
  const { user } = useAuth()
  const { cart } = useCart()
  const { country } = useCurrency()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [country]) // Re-fetch when country changes

  const fetchData = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        axios.get('/api/categories'),
        axios.get(`/api/products?limit=20&country=${country}`)
      ])
      setCategories(categoriesRes.data.categories || [])
      setProducts(productsRes.data.products || [])
    } catch (error) {
      console.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Blinkit Style */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                <FiShoppingBag className="w-6 h-6 text-gray-900" />
              </div>
              <span className="text-2xl font-semibold">Online Planet</span>
            </Link>

            {/* Delivery Location */}
            <button className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
              <FiMapPin className="w-5 h-5" />
              <div className="text-left">
                <p className="text-xs text-gray-600">Delivery in 10 minutes</p>
                <p className="font-semibold text-sm">Select Location</p>
              </div>
            </button>

            {/* Search */}
            <div className="flex-1 max-w-2xl mx-8 hidden lg:block">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {user ? (
                <Link href="/profile" className="flex items-center space-x-2 hover:bg-gray-100 px-3 py-2 rounded-lg">
                  <FiUser className="w-5 h-5" />
                  <span className="hidden md:block font-medium">{user.name}</span>
                </Link>
              ) : (
                <Link href="/login" className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 font-semibold rounded-lg">
                  Login
                </Link>
              )}

              {/* Cart */}
              <Link href="/cart" className="relative p-3 bg-green-600 hover:bg-green-700 rounded-lg">
                <FiShoppingBag className="w-6 h-6 text-white" />
                {cart?.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner - Blinkit Style */}
      <section className="bg-gradient-to-r from-yellow-50 to-orange-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-5xl font-semibold mb-4">
                India's last minute app
              </h1>
              <p className="text-xl text-gray-700 mb-6">
                Get everything delivered in <span className="font-semibold text-green-600">10 minutes</span>
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-4 py-3 bg-white rounded-lg shadow-sm">
                  <FiClock className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">10 min delivery</span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-3 bg-white rounded-lg shadow-sm">
                  <span className="text-2xl">🎯</span>
                  <span className="font-semibold">Best prices</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <Image
                src="/hero-image.png"
                alt="Quick delivery"
                width={500}
                height={400}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories - Horizontal Scroll */}
      <section className="py-6 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center space-x-4 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/products?category=${category.slug}`}
                className="flex-shrink-0 text-center group"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mb-2 group-hover:bg-yellow-100 transition-colors">
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={60}
                    height={60}
                    className="object-contain"
                  />
                </div>
                <p className="text-sm font-semibold">{category.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Shop by category</h2>
            <Link href="/products" className="text-green-600 font-semibold flex items-center space-x-1">
              <span>See all</span>
              <FiChevronRight />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function ProductCard({ product }) {
  const { addToCart } = useCart()

  return (
    <Link href={`/products/${product._id}`} className="group">
      <div className="bg-white border rounded-xl p-3 hover:shadow-lg transition-shadow">
        <div className="aspect-square bg-gray-50 rounded-lg mb-3 relative overflow-hidden">
          <Image
            src={product.images?.[0] || '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform"
          />
        </div>
        <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
        <p className="text-xs text-gray-600 mb-2">{product.weight || '1 unit'}</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">₹{product.price}</p>
            {product.mrp && (
              <p className="text-xs text-gray-500 line-through">₹{product.mrp}</p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              addToCart(product)
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg"
          >
            ADD
          </button>
        </div>
      </div>
    </Link>
  )
}
