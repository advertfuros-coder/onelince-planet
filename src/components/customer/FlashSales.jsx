'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiHeart, FiStar } from 'react-icons/fi'
import { useCart } from '../../lib/context/CartContext'
import { useRegion } from '../../context/RegionContext'
import { formatPrice } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function FlashSales() {
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [wishlist, setWishlist] = useState(new Set())
  const { addToCart } = useCart()
  const { region } = useRegion()

  useEffect(() => {
    const fetchFlashDeals = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/flash-sales?live=true')
        const data = await response.json()

        if (data.success && data.flashSales && data.flashSales.length > 0) {
          // Extract products from flash sales
          const allProducts = []

          data.flashSales.forEach(sale => {
            if (sale.products && Array.isArray(sale.products)) {
              sale.products.forEach(product => {
                if (product.productId) {
                  allProducts.push({
                    id: product.productId._id || product.productId,
                    _id: product.productId._id || product.productId,
                    name: product.productId.name || 'Product',
                    image: product.productId.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
                    price: product.flashPrice || product.productId.price || 0,
                    currency: 'AED',
                    originalPrice: product.originalPrice || product.productId.originalPrice,
                    rating: product.productId.rating || 4.0,
                    reviews: product.productId.reviews || '0',
                    link: `/products/${product.productId._id || product.productId}`,
                    discount: product.discount || 0
                  })
                }
              })
            }
          })

          if (allProducts.length > 0) {
            setDeals(allProducts)
          } else {
            setDeals([])
          }
        } else {
          setDeals([])
        }
      } catch (error) {
        console.error('Error fetching flash deals:', error)
        setDeals([])
      } finally {
        setLoading(false)
      }
    }
    fetchFlashDeals()
  }, [])

  const toggleWishlist = (dealId, e) => {
    e.preventDefault()
    e.stopPropagation()
    setWishlist(prev => {
      const newSet = new Set(prev)
      if (newSet.has(dealId)) {
        newSet.delete(dealId)
        toast.success('Removed from wishlist')
      } else {
        newSet.add(dealId)
        toast.success('Added to wishlist!')
      }
      return newSet
    })
  }

  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const endOfDay = new Date(now)
      endOfDay.setHours(23, 59, 59, 999)
      const difference = endOfDay - now

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        })
      }
    }
    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [])

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        </div>
      </section>
    )
  }

  // If no deals are found, don't show the section at all
  if (deals.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-red-600 p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                Flash Deals
              </h2>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl">
              <span className="text-sm font-bold text-gray-500 uppercase">Ends in:</span>
              <div className="flex items-center gap-1">
                {[
                  { value: timeLeft.hours, label: 'h' },
                  { value: timeLeft.minutes, label: 'm' },
                  { value: timeLeft.seconds, label: 's' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <span className="bg-white text-gray-900 px-2 py-1 rounded text-lg font-bold shadow-sm min-w-[35px] text-center">
                      {String(item.value).padStart(2, '0')}
                    </span>
                    <span className="text-sm font-bold text-gray-400">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/deals"
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm md:text-base flex items-center gap-1 transition-colors"
          >
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {deals.slice(0, 10).map((deal) => (
            <Link
              key={deal.id}
              href={deal.link || `/products/${deal._id}`}
              className="group"
            >
              <div className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
                {/* Image Container */}
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={deal.image}
                    alt={deal.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'
                    }}
                  />

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => toggleWishlist(deal.id, e)}
                    className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                  >
                    <FiHeart
                      className={`w-5 h-5 ${wishlist.has(deal.id)
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-400'
                        }`}
                    />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {/* Product Name */}
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[40px]">
                    {deal.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-3.5 h-3.5 ${i < Math.floor(deal.rating)
                          ? 'fill-blue-600 text-blue-600'
                          : 'text-gray-300'
                          }`}
                      />
                    ))}
                    <span className="text-xs text-gray-600 ml-1">
                      ({typeof deal.reviews === 'number' ? deal.reviews : deal.reviews})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(deal.price, region)}
                    </span>
                    {deal.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(deal.originalPrice, region)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
