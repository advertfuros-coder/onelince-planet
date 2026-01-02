'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FiHeart,
  FiEye,
  FiShoppingCart,
  FiStar
} from 'react-icons/fi'
import { FaHeart, FaStar } from 'react-icons/fa'
import { formatPrice } from '../../lib/utils'
import { createProductUrl } from '../../lib/utils/productUrl'
import { useCart } from '../../lib/context/CartContext'
import { useRegion } from '@/context/RegionContext'

export default function ProductCard({
  product,
  isWishlisted = false,
  onToggleWishlist = () => { }
}) {
  const router = useRouter()
  const { addToCart } = useCart()
  const { region } = useRegion()

  const discount = product.pricing?.basePrice && product.pricing?.salePrice ?
    Math.round(((product.pricing.basePrice - product.pricing.salePrice) / product.pricing.basePrice) * 100) : 0
  const finalPrice = product.pricing?.salePrice || product.pricing?.basePrice || 0

  // Mock badge for UI demonstration based on image
  const getBadge = () => {
    if (product.isBestSeller) return { text: 'BEST SELLER', color: 'bg-[#FF9900]' }
    if (product.isNewArrival) return { text: 'NEW ARRIVAL', color: 'bg-[#4B88FF]' }
    if (product.isPremium) return { text: 'PREMIUM', color: 'bg-[#1C1C1C]' }
    if (product.isTopRated) return { text: 'TOP RATED', color: 'bg-[#FFB800]' }
    return null
  }

  const badge = getBadge()

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
  }

  const handleBuyNow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
    router.push('/cart')
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl hover:border-blue-100 transition-all duration-500 flex flex-col h-full ring-1 ring-black/5">
      {/* Product Image Section */}
      <div className="relative aspect-square overflow-hidden bg-[#F8F9FA] p -4">
        <Link href={createProductUrl(product)}>
          {product.images?.[0]?.url ? (
            <img
              src={product.images[0].url}
              alt={product.name || 'Product image'}
              className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out"
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
        <div className="absolute top-2 left-2 flex flex-col gap-2 z-10">
          {badge && (
            <span className={`${badge.color} text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest shadow-md transform -translate-x-1 group-hover:translate-x-0 transition-transform duration-300`}>
              {badge.text}
            </span>
          )}
          {discount > 0 && (
            <span className="bg-red-50/90 backdrop-blur-sm text-red-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest border border-red-100 shadow-sm">
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
          className="absolute top-4 right-4 z-10 p-2.5 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-300 text-gray-400 hover:text-red-500"
        >
          {isWishlisted ? (
            <FaHeart className="w-5 h-5 text-red-500" />
          ) : (
            <FiHeart className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Product Info Section */}
      <div className="p-3 flex flex-col flex-1 bg-white">
        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="flex text-[#FF9900]">
            {[...Array(5)].map((_, i) => (
              i < Math.floor(product.ratings?.average || 0) ? (
                <FaStar key={i} className="w-3.5 h-3.5" />
              ) : (
                <FiStar key={i} className="w-3.5 h-3.5" />
              )
            ))}
          </div>
          <span className="text-[11px] font-semibold text-gray-400">
            ({product.ratings?.totalReviews || 0})
          </span>
        </div>

        {/* Name */}
        <Link href={createProductUrl(product)}>
          <h3 className="font-bold text-[#1a1a1b] text-[15px] leading-[1.4] mb-3 line-clamp-2 min-h-[42px] hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price Section */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-[20px] font-black text-[#1a1a1b]">
            {formatPrice(finalPrice, region)}
          </span>
          {product.pricing?.basePrice && product.pricing?.salePrice && (
            <span className="text-[13px] text-gray-400 line-through font-medium">
              {formatPrice(product.pricing.basePrice, region)}
            </span>
          )}
        </div>

        {/* Action Buttons - Always Visible */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={handleAddToCart}
            disabled={product.inventory?.stock === 0}
            className="px-3 py-2.5 bg-white border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiShoppingCart className="w-4 h-4" />
            Add
          </button>
          <button
            onClick={handleBuyNow}
            disabled={product.inventory?.stock === 0}
            className="px-3 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Buy Now
          </button>
        </div>

        {/* Seller Info & Status - Matches Image */}
        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-gray-400">Sold by</span>
            <span className="text-[11px] font-bold text-gray-600 truncate max-w-[80px]">
              {product.sellerId?.storeInfo?.storeName ||
                product.sellerId?.businessInfo?.businessName ||
                ''}
            </span>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-1">
            {product.isVerified ? (
              <div className="flex items-center gap-1 text-[10px] font-bold text-[#00B058]">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[10px] font-bold text-blue-500">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" fill="currentColor" />
                </svg>
                Fast
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
