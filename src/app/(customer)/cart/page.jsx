// app/(customer)/cart/page.jsx
'use client'
import { useState, useEffect } from 'react'
import { useCart } from '@/lib/context/CartContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FiTrash2,
  FiMinus,
  FiPlus,
  FiHeart,
  FiTruck,
  FiClock,
  FiShoppingBag,
  FiShield,
  FiRefreshCw,
  FiCheckCircle,
  FiArrowRight,
  FiShoppingCart,
  FiArrowLeft,
  FiChevronDown,
  FiMapPin,
  FiInfo,
  FiChevronRight,
  FiCheck,
  FiAlertCircle
} from 'react-icons/fi'
import { BiTagAlt } from 'react-icons/bi'
import Button from '@/components/ui/Button'
import Price, { StrikePrice } from '@/components/ui/Price'
import { useCurrency } from '@/lib/context/CurrencyContext'
import CouponBanner from '@/components/customer/CouponBanner'
import { useRecentlyViewed } from '@/lib/hooks/useRecentlyViewed'
import ProductCard from '@/components/customer/ProductCard'

export default function CartPage() {
  const router = useRouter()
  const { formatPrice, currencyConfig } = useCurrency()
  const { getRecentlyViewedIds } = useRecentlyViewed()
  const [deliveryEstimates, setDeliveryEstimates] = useState({})
  const [loadingEstimates, setLoadingEstimates] = useState(false)
  const [recommendedProducts, setRecommendedProducts] = useState([])
  const [loadingRecommended, setLoadingRecommended] = useState(false)
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([])
  const [loadingRecentlyViewed, setLoadingRecentlyViewed] = useState(false)

  // Selection state
  const [selectedItems, setSelectedItems] = useState([])

  // Coupon input state
  const [couponCode, setCouponCode] = useState('')

  const {
    items,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartCount,
    isLoaded,
    addToCart,
    appliedCoupon,
    discount,
    applyCoupon,
    removeCoupon: removeCouponFromCart
  } = useCart()

  // BRAND COLORS
  const BRAND_PRIMARY = '#2563eb' // Blue 600
  const BRAND_SECONDARY = '#FFD23F' // Planet Yellow

  useEffect(() => {
    if (isLoaded && items.length > 0) {
      setSelectedItems(items.map(item => `${item.productId}-${JSON.stringify(item.variant)}`))
    }
  }, [items, isLoaded])

  const toggleItemSelection = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(items.map(item => `${item.productId}-${JSON.stringify(item.variant)}`))
    }
  }

  // Fetch delivery estimates
  useEffect(() => {
    const fetchDeliveryEstimates = async () => {
      const savedPincode = localStorage.getItem('userPincode')
      if (!savedPincode || items.length === 0) return

      setLoadingEstimates(true)
      const estimates = {}

      for (const item of items) {
        try {
          const response = await fetch('/api/shipping/estimate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: item.productId,
              deliveryPincode: savedPincode
            })
          })
          const data = await response.json()
          if (data.success) {
            estimates[item.productId] = data.estimate
          }
        } catch (error) {
          console.error('Failed to fetch delivery estimate:', error)
        }
      }
      setDeliveryEstimates(estimates)
      setLoadingEstimates(false)
    }

    if (isLoaded) {
      fetchDeliveryEstimates()
    }
  }, [items, isLoaded])

  // Fetch recommended products based on cart items
  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      if (items.length === 0) {
        setRecommendedProducts([])
        return
      }

      setLoadingRecommended(true)
      try {
        // Get unique product IDs from cart
        const cartProductIds = items.map(item => item.productId)

        // Fetch recommended products (exclude cart items)
        const response = await fetch(`/api/products?limit=6&exclude=${cartProductIds.join(',')}`)
        const data = await response.json()

        if (data.success && data.products) {
          setRecommendedProducts(data.products.slice(0, 6))
        }
      } catch (error) {
        console.error('Failed to fetch recommended products:', error)
      } finally {
        setLoadingRecommended(false)
      }
    }

    if (isLoaded) {
      fetchRecommendedProducts()
    }
  }, [items, isLoaded])

  // Fetch recently viewed products
  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      const recentlyViewedIds = getRecentlyViewedIds()

      if (recentlyViewedIds.length === 0) {
        setRecentlyViewedProducts([])
        return
      }

      // Filter out products already in cart
      const cartProductIds = items.map(item => item.productId)
      const filteredIds = recentlyViewedIds.filter(id => !cartProductIds.includes(id))

      if (filteredIds.length === 0) {
        setRecentlyViewedProducts([])
        return
      }

      setLoadingRecentlyViewed(true)
      try {
        // Fetch products by IDs (limit to 6)
        const idsToFetch = filteredIds.slice(0, 6)
        const response = await fetch(`/api/products?ids=${idsToFetch.join(',')}`)
        const data = await response.json()

        if (data.success && data.products) {
          setRecentlyViewedProducts(data.products)
        }
      } catch (error) {
        console.error('Failed to fetch recently viewed products:', error)
      } finally {
        setLoadingRecentlyViewed(false)
      }
    }

    if (isLoaded) {
      fetchRecentlyViewed()
    }
  }, [items, isLoaded, getRecentlyViewedIds])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50/30">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const cartTotal = items.reduce((acc, item) => {
    const id = `${item.productId}-${JSON.stringify(item.variant)}`
    return selectedItems.includes(id) ? acc + (item.price * item.quantity) : acc
  }, 0)

  const selectedCount = selectedItems.length
  const totalMRP = cartTotal * 1.4
  const discountOnMRP = totalMRP - cartTotal
  const platformFee = selectedCount > 0 ? 20 : 0
  const shippingFee = (cartTotal > 500 || selectedCount === 0) ? 0 : 50
  const finalTotal = cartTotal + platformFee + shippingFee - discount

  // Check if any items have unavailable delivery
  const hasUndeliverableItems = items.some(item =>
    deliveryEstimates[item.productId]?.available === false
  )


  // Handle coupon apply
  const handleApplyCoupon = () => {
    applyCoupon(couponCode, cartTotal)
  }

  // Remove coupon
  const removeCoupon = () => {
    setCouponCode('')
    removeCouponFromCart()
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col pt-20 px-4">
        <div className="text-center max-w-md w-full mx-auto">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiShoppingBag className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2 tight">Your bag is empty</h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Looks like you haven't added anything to your planet bag yet.
          </p>
          <Link href="/products" className="block w-full">
            <button className="w-full py-4 bg-blue-600 text-white font-semibold rounded-2xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all  widest">
              Explore Products
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50/30 pb-32">
      {/* Header */}


      {/* Stepper */}
      <div className="bg-white md:block hidden px-4 py-6 border-b border-gray-100">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold shadow-lg shadow-blue-200">
              <FiCheck className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold text-blue-600">Bag</span>
          </div>
          <div className="flex-1 h-[2px] bg-gray-200 mx-2 -mt-6"></div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs font-semibold">
              2
            </div>
            <span className="text-[10px] font-semibold text-gray-400">Address</span>
          </div>
          <div className="flex-1 h-[2px] bg-gray-200 mx-2 -mt-6"></div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs font-semibold">
              3
            </div>
            <span className="text-[10px] font-semibold text-gray-400">Payment</span>
          </div>
        </div>
      </div>



      {/* Selection Control Bar */}
      {/* <div className="bg-white px-4 py-4 mb-1 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selectedCount === items.length}
            onChange={toggleSelectAll}
            className="w-5 h-5 rounded-lg border-2 border-gray-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
          />
          <p className="text-[11px] font-semibold text-gray-900  widest">
            {selectedCount}/{items.length} Items <span className="text-gray-400 font-semibold ml-1">selected</span>
          </p>
        </div>
        <div className="flex items-center gap-4 text-gray-300">
          <FiTrash2 className="w-5 h-5 hover:text-red-500 transition-colors" />
          <FiHeart className="w-5 h-5 hover:text-blue-500 transition-colors" />
        </div>
      </div> */}

      {/* Premium Item Cards */}
      <div className="space-y-1">
        {items.map((item) => {
          const id = `${item.productId}-${JSON.stringify(item.variant)}`
          const isSelected = selectedItems.includes(id)
          const price = item.price || 0
          const originalPrice = Math.round(price * 1.4)
          const discountPercent = 40

          return (
            <div key={id} className={`bg-white p-5 flex gap-5 relative transition-all duration-300 shadow-sm ${!isSelected ? 'opacity-50 grayscale-[0.5]' : ''}`}>
              {/* Selection Checkbox Overlay */}
              {/* <div className="absolute top-5 left-5 z-10">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleItemSelection(id)}
                  className="w-5 h-5 rounded-lg border-2 border-gray-100 text-blue-600 focus:ring-blue-600"
                />
              </div> */}

              {/* Product Visual */}
              <Link href={`/products/${item.productId}`} className="w-32 aspect-square bg-g ray-50 rounded-3xl overflow-hidden flex-shrink-0 bor der border-gray-100 flex items-center justify-center group">
                <img
                  src={item.image || '/placeholder-product.png'}
                  alt={item.name}
                  className="w-full h-full object-contain   mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                />
              </Link>

              {/* High Density Details */}
              <div className="flex-1 min-w-0 flex flex-col pt-1">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex-1">
                    <p className="text-xs pr-3 text-gray-900 font-semibold leading-tight">{item.name}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.productId, item.variant)} className="p-1">
                    <FiTrash2 className="w-4 h-4 text-red-500 hover:text-red-500 transition-colors" />
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 font-semibold  wider mb-3">Merchant: {item.seller || 'Online Planet'}</p>

                {/* Quantity Selector */}
                <div className="flex gap-2 mb-4">
                  <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variant)}
                      className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-95 transition-all"
                      disabled={item.quantity <= 1}
                    >
                      <FiMinus className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                    <span className="text-[11px] font-semibold text-gray-900 min-w-[20px] text-center tighter">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variant)}
                      className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-95 transition-all"
                      disabled={item.stock && item.quantity >= item.stock}
                    >
                      <FiPlus className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Matrix Pricing */}
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-[18px] font-semibold text-blue-600 tighter leading-none">{currencyConfig.symbol}{price.toLocaleString()}</span>
                  <StrikePrice amount={originalPrice} className="text-[12px] text-gray-300 font-semibold mb-0.5" />
                  <span className="text-[11px] text-emerald-500 font-semibold mb-0.5  tighter">{discountPercent}% OFF</span>
                </div>

                {/* Meta Labels */}
                <div className="">

                  <div className="flex items-center gap-2 text-[10px] font-semibold wider">
                    <FiTruck className="w-3 h-3" />
                    {deliveryEstimates[item.productId]?.available === false ? (
                      <span className="text-red-600">
                        ⚠️ Delivery not available to your location
                      </span>
                    ) : (
                      <span className="text-emerald-600">
                        Delivery: <span className="text-gray-900">
                          {deliveryEstimates[item.productId]?.etd ? (
                            `Est. ${new Date(deliveryEstimates[item.productId].etd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                          ) : loadingEstimates ? (
                            'Calculating...'
                          ) : (
                            'Est. 2-5 days'
                          )}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>





      {/* Coupon Banner - Same as Homepage */}
      <CouponBanner />

      {/* Coupon Input Section */}
      <div className="mt-6 bg-white border border-gray-100 p-6 rounded-[32px] shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <BiTagAlt className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-gray-900">Apply Coupon</h3>
            <p className="text-[10px] text-gray-400 font-semibold">Get extra discounts on your order</p>
          </div>
        </div>

        {!appliedCoupon ? (
          <div className="flex gap-3">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:bg-white focus:outline-none transition-all text-sm font-semibold placeholder:text-gray-300"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={!couponCode.trim()}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all text-[13px] shadow-lg shadow-blue-600/20"
            >
              Apply
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-2xl">
            <div className="flex items-center gap-3">
              <FiCheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-[12px] font-semibold text-green-900">
                  Coupon "{appliedCoupon.code}" Applied!
                </p>
                <p className="text-[10px] text-green-600 font-medium">
                  You saved {currencyConfig.symbol}{Math.round(discount).toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={removeCoupon}
              className="text-[11px] font-semibold text-red-500 hover:text-red-600 transition-colors"
            >
              Remove
            </button>
          </div>
        )}

      </div>




      {/* Financial Matrix (Price Details) */}
      <div className="mt-4 bg-white border-t-2 border-blue-50 p-6 pb-12 rounded-t-[40px] shadow-[0_-10px_30px_rgba(37,99,235,0.03)]">
        <h3 className="text-[10px] font-semibold text-gray-400  [3px] mb-6">Financial Ledger</h3>
        <div className="space-y-4 text-[13px]">
          <div className="flex justify-between items-center font-semibold text-gray-500">
            <span className=" widest text-[11px]">Gross Value</span>
            <span className="text-gray-900">{currencyConfig.symbol}{Math.round(totalMRP).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center font-semibold">
            <span className="text-gray-500  widest text-[11px]">Planet Savings</span>
            <span className="text-emerald-500 font-semibold">-{currencyConfig.symbol}{Math.round(discountOnMRP).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center font-semibold">
            <span className="text-gray-500 flex items-center gap-1.5  widest text-[11px]">Platform Fee <FiInfo className="w-3.5 h-3.5" /></span>
            <span className="text-gray-900">+{currencyConfig.symbol}{platformFee}</span>
          </div>
          <div className="flex justify-between items-center font-semibold">
            <span className="text-gray-500  widest text-[11px]">Logistics Fee</span>
            <span className={shippingFee > 0 ? "text-gray-900" : "text-emerald-500 font-semibold widest"}>
              {shippingFee > 0 ? `+${currencyConfig.symbol}${shippingFee}` : 'FREE'}
            </span>
          </div>
          {appliedCoupon && discount > 0 && (
            <div className="flex justify-between items-center font-semibold">
              <span className="text-gray-500  widest text-[11px]">Coupon Discount ({appliedCoupon.code})</span>
              <span className="text-emerald-500 font-semibold">-{currencyConfig.symbol}{Math.round(discount).toLocaleString()}</span>
            </div>
          )}
          <div className="pt-6 border-t border-dashed border-gray-100 flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-blue-600  [3px]">Net Payable</span>
              <span className="text-[11px] text-gray-400 font-semibold mt-1">Final amount for checkout</span>
            </div>
            <span className="text-xl font-semibold text-blue-600 tighter">{currencyConfig.symbol}{Math.round(finalTotal).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Persistent Checkout Trigger */}
      {selectedCount > 0 && (
        <div className="fixed md:bottom-0 bottom-16 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-5 z-40 lg: shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-5">
            <div className="flex-1">
              <p className="text-xl font-semibold text-blue-600 leading-none tighter">{currencyConfig.symbol}{Math.round(finalTotal).toLocaleString()}</p>
              <button className="text-[9px] font-semibold text-gray-400  [2px] mt-1.5 flex items-center gap-1">View Breakdown <FiChevronDown /></button>
            </div>
            {hasUndeliverableItems ? (
              <button
                disabled
                className="flex-[1.8] w-full py-3 bg-gray-300 text-gray-500 font-semibold text-[14px] rounded-[24px] cursor-not-allowed [4px]"
              >
                Place Order
              </button>
            ) : (
              <Link href="/checkout" className="flex-[1.8]">
                <button className="w-full py-3 bg-blue-600 text-white font-semibold text-[14px] rounded-[24px] shadow-2xl shadow-blue-600/20  [4px] active:scale-[0.98] transition-all">
                  Place Order
                </button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* You May Also Like Section */}
      {recommendedProducts.length > 0 && (
        <div className="mt-10 px-4">
          <div className="flex items-center gap-2 mb-6">
            <FiShoppingBag className="w-6 h-6 text-blue-600" />
            <p className="text-[13px] font-semibold text-gray-900">You May Also Like</p>
          </div>

          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6">
            {recommendedProducts.map((product) => {
              const finalPrice = product.pricing?.salePrice || product.pricing?.basePrice || 0
              const originalPrice = product.pricing?.basePrice
              const discount = originalPrice && finalPrice < originalPrice
                ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
                : 0

              return (
                <div key={product._id} className="min-w-[170px] max-w-[170px] bg-white rounded-[32px] border border-gray-100 p-2 flex flex-col shadow-sm group">
                  <Link href={`/products/${product._id}`} className="aspect-square bg-gray-50 rounded-[28px] flex items-center justify-center p-3 relative overflow-hidden">
                    <img
                      src={product.images?.[0]?.url || product.images?.[0] || '/placeholder-product.png'}
                      alt={product.name}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                    />
                    {discount > 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-[9px] font-bold">
                        {discount}% OFF
                      </div>
                    )}
                  </Link>
                  <div className="p-3 pt-4 flex-1 flex flex-col">
                    <Link href={`/products/${product._id}`}>
                      <h5 className="text-[11px] font-semibold text-blue-600 wider truncate mb-1">{product.name}</h5>
                    </Link>
                    <p className="text-[10px] text-gray-400 font-semibold truncate mb-3 line-clamp-1">
                      {product.category || 'Product'}
                    </p>
                    <div className="mt-auto">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[13px] font-semibold text-gray-900">
                          {currencyConfig.symbol}{finalPrice.toLocaleString()}
                        </span>
                        {originalPrice && originalPrice > finalPrice && (
                          <span className="text-[9px] text-gray-300 line-through">
                            {currencyConfig.symbol}{originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => addToCart(product, 1)}
                        className="w-full py-2.5 bg-gray-50 rounded-2xl text-[9px] font-semibold text-blue-600 widest border border-blue-50 hover:bg-blue-600 hover:text-white transition-all"
                      >
                        Add to bag
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}



      {/* Recently Viewed Products Section */}
      {recentlyViewedProducts.length > 0 && (
        <div className="mt-10 px-4">
          <div className="flex items-center gap-2 mb-6">
            <FiClock className="w-5 h-5 text-gray-700" />
            <h2 className="text-xl font-bold text-gray-900">Recently Viewed</h2>
          </div>

          {loadingRecentlyViewed ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {recentlyViewedProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  isWishlisted={false}
                  onToggleWishlist={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ecosystem Trust Signifiers */}
      <div className="mt-8 px-6 flex items-center justify-around pb-24">
        <div className="flex flex-col items-center gap-2">
          <FiShield className="w-9 h-9 text-blue-50" />
          <span className="text-[8px] font-semibold text-gray-200 text-center  [2px] leading-tight">100% Authentic<br />Planet</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <FiRefreshCw className="w-9 h-9 text-blue-50" />
          <span className="text-[8px] font-semibold text-gray-300 text-center  [2px] leading-tight">Secure<br />Stream</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <FiTruck className="w-9 h-9 text-blue-50" />
          <span className="text-[8px] font-semibold text-gray-300 text-center  [2px] leading-tight">Premium<br />Logistics</span>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
