'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  FiHeart,
  FiEye,
  FiShoppingCart,
  FiStar,
  FiPlus,
  FiLock,
  FiTruck,
  FiAlertCircle
} from 'react-icons/fi'
import { FaHeart, FaStar } from 'react-icons/fa'
import { createProductUrl } from '../../lib/utils/productUrl'
import { useCart } from '../../lib/context/CartContext'
import { useCurrency } from '../../lib/context/CurrencyContext'
import { calculateDeliveryEstimate } from '../../lib/utils/deliveryEstimate'
import Price, { StrikePrice } from '../ui/Price'

export default function ProductCard({
  product,
  isWishlisted = false,
  onToggleWishlist = () => { },
  variant = 'default' // 'default', 'steal'
}) {
  const router = useRouter()
  const { addToCart } = useCart()
  const { country } = useCurrency()
  const [deliveryAvailable, setDeliveryAvailable] = useState(null)
  const [deliveryDate, setDeliveryDate] = useState(null)

  const discount = product.pricing?.basePrice && product.pricing?.salePrice ?
    Math.round(((product.pricing.basePrice - product.pricing.salePrice) / product.pricing.basePrice) * 100) : 0
  const finalPrice = product.pricing?.salePrice || product.pricing?.basePrice || 0

  // Calculate delivery estimate
  const sellerCountry = product.sellerId?.businessInfo?.country || product.sellerId?.country || 'AE'
  const deliveryEstimate = calculateDeliveryEstimate(product, country, sellerCountry)

  // Check delivery availability if pincode is saved
  useEffect(() => {
    const checkDelivery = async () => {
      const savedPincode = localStorage.getItem('userPincode')
      if (!savedPincode || !product._id) return

      try {
        const response = await fetch('/api/shipping/estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product._id,
            deliveryPincode: savedPincode
          })
        })
        const data = await response.json()

        if (data.success && data.estimate) {
          if (data.estimate.available === false) {
            setDeliveryAvailable(false)
          } else {
            setDeliveryAvailable(true)
            if (data.estimate.etd) {
              const date = new Date(data.estimate.etd)
              setDeliveryDate(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
            }
          }
        }
      } catch (error) {
        console.error('Failed to check delivery:', error)
      }
    }

    checkDelivery()
  }, [product._id])

  // Create product URL with variant info
  const productUrl = product.variantInfo?.isVariant
    ? `${createProductUrl(product)}?variant=${product.variantInfo.variantIndex}`
    : createProductUrl(product);

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl hover:border-blue-100 transition-all duration-500 flex flex-col h-full ring-1 ring-black/5">
      {/* Product Image Section */}
      <div className={`relative ${variant === 'steal' ? 'aspect-[4/5]' : 'aspect-square'} overflow-hidden bg-[#F8F9FA] ${variant === 'steal' ? 'rounded-[24px] border border-gray-50 shadow-inner' : ''}`}>
        <Link href={productUrl}>
          {product.images?.[0]?.url || product.image ? (
            <img
              src={product.images?.[0]?.url || product.image}
              alt={product.name || 'Product image'}
              className={`w-full h-full ${variant === 'steal' ? 'object-cover' : 'object-contain mix-blend-multiply'} group-hover:scale-110 transition-transform duration-700 ease-out`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
              <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </Link>

        {/* Floating Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {discount > 0 && (
            <span className="bg-[#FFE5E5] text-[#FF4D4D] px-3 py-1.5 rounded-2xl text-xs font-semibold shadow-sm">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleWishlist(product._id);
          }}
          className="absolute top-4 right-4 z-10 w-11 h-11 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-all duration-300 border border-gray-100"
        >
          {isWishlisted ? (
            <FaHeart className="w-6 h-6 text-red-500" />
          ) : (
            <FiHeart className="w-6 h-6 text-gray-400 group-hover:text-red-500 transition-colors" />
          )}
        </button>

        {/* Steal Deal Action Button */}
        {variant === 'steal' && (
          <button className="absolute bottom-4 right-4 w-12 h-12 bg-white border-2 border-gray-100 rounded-2xl flex items-center justify-center shadow-md hover:bg-gray-50 transition-all hover:scale-105 active:scale-95 group-hover:border-purple-200">
            <FiPlus className="text-gray-300 w-8 h-8 stroke-[3]" />
          </button>
        )}
      </div>

      {/* Product Info Section */}
      <div className="p-5 flex flex-col flex-1 bg-white">
        {/* Rating Section */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="flex text-[#FF9E2C]">
            {[...Array(5)].map((_, i) => (
              i < Math.floor(product.ratings?.average || 0) ? (
                <FaStar key={i} className="w-4 h-4" />
              ) : (
                <FiStar key={i} className="w-4 h-4 text-gray-200" />
              )
            ))}
          </div>
          <span className="text-sm font-medium text-gray-400">
            ({product.ratings?.totalReviews || product.ratings?.count || 0})
          </span>
        </div>

        <Link href={productUrl}>
          <h3 className="font-semibold text-gray-900 text-[15px] leading-snug mb-2 line-clamp-2 h-10 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2 ">
          <Price
            amount={finalPrice}
            className="text-xl font-semibold text-gray-900"
          />
          {product.pricing?.basePrice > finalPrice && (
            <StrikePrice
              amount={product.pricing.basePrice}
              className="text-sm text-gray-400 font-medium whitespace-nowrap"
            />
          )}
        </div>

        {/* Delivery Estimate */}
        <div className="flex items-center gap-2 text-[13px] font-medium mt-2">
          {deliveryAvailable === false ? (
            <>
              <FiAlertCircle className="w-4 h-4 text-red-600 stroke-[2.5px]" />
              <span className="text-red-600">
                Not available at your location
              </span>
            </>
          ) : (
            <>
              <FiTruck className="w-4 h-4 text-[#00A650] stroke-[2.5px]" />
              <span className="text-[#00A650]">
                Delivery <span className="font-semibold">{deliveryDate || deliveryEstimate.label}</span>
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
