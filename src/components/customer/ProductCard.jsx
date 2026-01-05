'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FiHeart,
  FiEye,
  FiShoppingCart,
  FiStar,
  FiPlus,
  FiLock,
  FiTruck
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
  minimal = false,
  variant = 'default' // 'default', 'minimal', 'steal'
}) {
  const router = useRouter()
  const { addToCart } = useCart()
  const { formatPrice, country } = useCurrency()

  const discount = product.pricing?.basePrice && product.pricing?.salePrice ?
    Math.round(((product.pricing.basePrice - product.pricing.salePrice) / product.pricing.basePrice) * 100) : 0
  const finalPrice = product.pricing?.salePrice || product.pricing?.basePrice || 0

  // Calculate delivery estimate (zero API calls)
  const sellerCountry = product.sellerId?.businessInfo?.country || product.sellerId?.country || 'AE'
  const deliveryEstimate = calculateDeliveryEstimate(product, country, sellerCountry)

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
      <div className={`relative ${variant === 'steal' ? 'aspect-[4/5]' : 'aspect-square'} overflow-hidden bg-[#F8F9FA] ${variant === 'steal' ? 'rounded-[24px] border border-gray-50 shadow-inner' : ''}`}>
        <Link href={createProductUrl(product)}>
          {product.images?.[0]?.url ? (
            <img
              src={product.images[0].url}
              alt={product.name || 'Product image'}
              className={`w-full h-full object-contain mix-blend-multiply ${!minimal ? 'group-hover:scale-110' : 'group-hover:scale-105'} transition-transform duration-700 ease-out`}
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
            <span className={`${badge.color} text-white px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest shadow-md transform -translate-x-1 group-hover:translate-x-0 transition-transform duration-300`}>
              {badge.text}
            </span>
          )}
          {discount > 0 && (
            <span className="bg-red-50/90 font-medium backdrop-blur-sm text-red-600 px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest border border-red-100 shadow-sm">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        {variant !== 'steal' && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleWishlist(product._id);
            }}
            className={`absolute top-3 right-3 z-10 p-2 ${minimal ? 'bg-gray-200/50' : 'bg-white/80'} backdrop-blur-md rounded-full shadow-sm hover:bg-white hover:scale-110 transition-all duration-300 text-gray-500 hover:text-red-500`}
          >
            {isWishlisted ? (
              <FaHeart className={`${minimal ? 'w-3.5 h-3.5' : 'w-5 h-5'} text-red-500`} />
            ) : (
              <FiHeart className={`${minimal ? 'w-3.5 h-3.5' : 'w-5 h-5'}`} />
            )}
          </button>
        )}

        {/* Steal Deal Action Button */}
        {variant === 'steal' && (
          <button className="absolute top-4 right-4 w-12 h-12 bg-white border-2 border-gray-100 rounded-2xl flex items-center justify-center shadow-md hover:bg-gray-50 transition-all hover:scale-105 active:scale-95 group-hover:border-purple-200">
            <FiPlus className="text-gray-300 w-8 h-8 stroke-[3]" />
          </button>
        )}

        {/* Steal Deal Quantity Tag */}
        {variant === 'steal' && product.quantity && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full border border-gray-100 social-shadow min-w-[80px] text-center">
            <span className="text-[11px] font-semibold text-gray-400">{product.quantity}</span>
          </div>
        )}
      </div>

      {/* Product Info Section */}
      <div className={`${(minimal || variant === 'steal') ? 'p-2' : 'p-3'} flex flex-col flex-1 bg-white`}>
        {/* Variant: Steal Deal */}
        {variant === 'steal' ? (
          <div className="space-y-3">
            <Link href={createProductUrl(product)}>
              <h3 className="font-medium text-[#1a1a1b] text-xs leading-tight line-clamp-2 h-10 hover:text-purple-600 transition-colors">
                {product.name}
              </h3>
            </Link>

            {/* Progress Section */}
            <div className="space-y-1.5 mt-3">
              <div className="h-1.5 w-full bg-purple-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-1000"
                  style={{ width: `${product.stealDealProgress || 40}%` }}
                />
              </div>
              <div className="flex items-center gap-1.5 text-purple-600">
                <div className="p-0.5 bg-purple-100 rounded-md">
                  <FiLock className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wide">
                  Shop for {formatPrice(product.moreToClaim || 191)} more to claim
                </span>
              </div>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-2">
              <Price amount={finalPrice} className="text-sm font-semibold text-gray-900" />
              {product.pricing?.basePrice > finalPrice && (
                <StrikePrice amount={product.pricing.basePrice} className="text-xs font-semibold text-gray-300" />
              )}
            </div>
          </div>
        ) : minimal ? (
          <>
            {/* Minimal Mode Layout: Name -> Rating -> Price */}
            <Link href={createProductUrl(product)}>
              <h3 className="font-medium text-[#1a1a1b] text-xs leading-tight mb-1 line-clamp-2 hover:text-blue-600 transition-colors">
                {product.name}
              </h3>
            </Link>
            <div className="flex items-center gap-1 mb-2">
              <div className="flex text-blue-600">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={`w-3 h-3 ${i < Math.floor(product.ratings?.average || 4) ? 'text-blue-600' : 'text-gray-200'}`} />
                ))}
              </div>
              <span className="text-[10px] text-gray-400 font-medium">({product.ratings?.totalReviews || 0})</span>
            </div>
            <div className="flex items-baseline gap-1 mt-auto">
              <Price amount={finalPrice} className="text-sm font-semibold text-gray-900" />
              {product.pricing?.basePrice > finalPrice && (
                <StrikePrice amount={product.pricing.basePrice} className="text-[10px] text-gray-400" />
              )}
            </div>
          </>
        ) : (
          <>
            {/* Standard Mode Layout */}
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

            <Link href={createProductUrl(product)}>
              <h3 className="font-semibold text-[#1a1a1b] text-xs mb-1 min-h-[42px] hover:text-blue-600 transition-colors">
                {product.name}
              </h3>
            </Link>

            <div className="flex items-baseline gap-2 mb-2">
              <Price
                amount={finalPrice}
                className="text-md font-semibold  text-[#1a1a1b]"
              />
              {product.pricing?.basePrice && product.pricing?.salePrice && (
                <StrikePrice
                  amount={product.pricing.basePrice}
                  className="text-[13px] text-gray-400 font-medium"
                />
              )}
            </div>

            {/* Delivery Estimate */}
            <div className="flex items-center gap-1.5 mb-3">
              <FiTruck className="w-4 h-4 text-green-600" />
              <span className="text-xs text-gray-600">
                Delivery by <span className="font-semibold text-green-600">{deliveryEstimate.label}</span>
              </span>
            </div>

            {/* <div className="grid md:grid-cols-2 gap-2 -4">
              <button
                onClick={handleAddToCart}
                disabled={product.inventory?.stock === 0}
                className="px-3 py-2.5 bg-white border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-semibold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiShoppingCart className="w-4 h-4" />
                Add
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.inventory?.stock === 0}
                className="px-3 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div> */}

            {/* <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-gray-400">Sold by</span>
                <span className="text-[11px] font-semibold text-gray-600 truncate max-w-[80px]">
                  {product.sellerId?.storeInfo?.storeName || product.sellerId?.businessInfo?.businessName || ''}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {product.isVerified ? (
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-[#00B058]">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-blue-500">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" fill="currentColor" />
                    </svg>
                    Fast
                  </div>
                )}
              </div>
            </div> */}
          </>
        )}
      </div>
    </div>
  )
}
