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
  FiChevronRight
} from 'react-icons/fi'
import { BiTagAlt } from 'react-icons/bi'
import Button from '@/components/ui/Button'
import Price, { StrikePrice } from '@/components/ui/Price'
import { useCurrency } from '@/lib/context/CurrencyContext'

export default function CartPage() {
  const router = useRouter()
  const { items, removeFromCart, updateQuantity, getCartTotal, getCartCount, isLoaded } = useCart()
  const { formatPrice, currencyConfig } = useCurrency()
  const [deliveryEstimates, setDeliveryEstimates] = useState({})
  const [loadingEstimates, setLoadingEstimates] = useState(false)
  
  // Myntra-style state
  const [selectedItems, setSelectedItems] = useState([])

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

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 font-semibold">Loading your bag...</p>
      </div>
    )
  }

  const cartTotal = items.reduce((acc, item) => {
    const id = `${item.productId}-${JSON.stringify(item.variant)}`
    return selectedItems.includes(id) ? acc + (item.price * item.quantity) : acc
  }, 0)

  const selectedCount = selectedItems.length
  const totalMRP = cartTotal * 1.4 // Mock MRP
  const discountOnMRP = totalMRP - cartTotal
  const platformFee = selectedCount > 0 ? 20 : 0
  const finalTotal = cartTotal + platformFee

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col pt-20 px-4">
        <div className="text-center max-w-md w-full mx-auto">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiShoppingBag className="w-12 h-12 text-gray-300" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Hey, it feels so light!</h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            There is nothing in your bag. Let's add some items.
          </p>
          <Link href="/products" className="block w-full">
            <button className="w-full py-4 bg-[#FF3F6C] text-white font-semibold rounded-lg shadow-lg active:scale-95 transition-all">
              SHOP NOW
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F1F3F6] pb-32">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-1">
            <FiArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-sm font-semibold text-gray-800 tracking-tight uppercase">Shopping Bag</h1>
        </div>
        <FiHeart className="w-6 h-6 text-gray-600" />
      </div>

      {/* Stepper */}
      <div className="bg-white px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between max-w-xs mx-auto text-[10px] text-gray-400 font-semibold uppercase tracking-widest">
           <div className="flex flex-col items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50"></div>
              <span className="text-emerald-600">Bag</span>
           </div>
           <div className="flex-1 h-[1px] bg-gray-200 mx-2 -mt-4"></div>
           <div className="flex flex-col items-center gap-1.5 opacity-50">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
              <span>Address</span>
           </div>
           <div className="flex-1 h-[1px] bg-gray-200 mx-2 -mt-4"></div>
           <div className="flex flex-col items-center gap-1.5 opacity-50">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
              <span>Payment</span>
           </div>
        </div>
      </div>

      {/* Address Bar */}
      <div className="bg-white px-4 py-4 mb-2 flex items-center justify-between shadow-sm">
        <div className="flex items-start gap-3">
           <FiMapPin className="w-5 h-5 text-gray-400 mt-0.5" />
           <div>
              <p className="text-xs font-semibold text-gray-400">Deliver to: <span className="text-gray-900">{localStorage.getItem('userPincode') || 'Select Pincode'}</span></p>
              <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{localStorage.getItem('userLocation') || 'Set delivery address to see estimated dates'}</p>
           </div>
        </div>
        <button className="text-[11px] font-semibold text-[#FF3F6C] border border-[#FF3F6C] px-3 py-1.5 rounded uppercase">Change</button>
      </div>

      {/* Savings Banner */}
      <div className="bg-[#E7F7F1] px-4 py-3 mb-2 flex items-center gap-2">
         <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white">
            <FiCheckCircle className="w-3.5 h-3.5" />
         </div>
         <p className="text-xs font-semibold text-gray-800">You're saving <span className="text-emerald-600">{currencyConfig.symbol}{Math.round(discountOnMRP).toLocaleString()}</span> on this order</p>
      </div>

      {/* Selected Counter */}
      <div className="bg-white px-4 py-4 mb-0.5 flex items-center justify-between border-b border-gray-50">
         <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={selectedCount === items.length}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-gray-300 text-[#FF3F6C] focus:ring-[#FF3F6C] cursor-pointer" 
            />
            <p className="text-[11px] font-semibold text-gray-900 tracking-tight">
               {selectedCount}/{items.length} ITEMS SELECTED <span className="text-gray-400 ml-1">({currencyConfig.symbol}{cartTotal.toLocaleString()})</span>
            </p>
         </div>
         <div className="flex items-center gap-4 text-gray-400">
            <FiTrash2 className="w-5 h-5" />
            <FiHeart className="w-5 h-5" />
         </div>
      </div>

      {/* Cart Items List */}
      <div className="space-y-0.5">
         {items.map((item) => {
            const id = `${item.productId}-${JSON.stringify(item.variant)}`
            const isSelected = selectedItems.includes(id)
            const price = item.price || 0
            const originalPrice = Math.round(price * 1.4)
            const discountPercent = 40
            const savingsAmt = originalPrice - price

            return (
               <div key={id} className={`bg-white p-4 flex gap-4 relative transition-opacity ${!isSelected ? 'opacity-50' : ''}`}>
                  {/* Selection Checkbox */}
                  <div className="absolute top-4 left-4 z-10">
                     <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => toggleItemSelection(id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#FF3F6C] focus:ring-[#FF3F6C] cursor-pointer" 
                     />
                  </div>

                  {/* Product Image */}
                  <Link href={`/products/${item.productId}`} className="w-28 aspect-[3/4] bg-gray-50 rounded overflow-hidden flex-shrink-0 border border-gray-100 flex items-center justify-center">
                     <img
                        src={item.image?.startsWith('http') ? item.image : item.image || '/placeholder-product.png'}
                        alt={item.name}
                        className="w-full h-full object-contain p-2 mix-blend-multiply"
                     />
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                     <div className="flex justify-between items-start">
                        <div className="flex-1">
                           <h4 className="text-[11px] font-semibold text-gray-900 uppercase tracking-wider mb-0.5">Planet Essential</h4>
                           <p className="text-[13px] text-gray-500 font-medium truncate mb-1">{item.name}</p>
                           <p className="text-[10px] text-gray-400 font-semibold mb-2">Sold by: {item.seller || 'Online Planet'}</p>
                        </div>
                        <button onClick={() => removeFromCart(item.productId, item.variant)} className="p-1">
                           <FiTrash2 className="w-4 h-4 text-gray-400" />
                        </button>
                     </div>

                     {/* Selectors */}
                     <div className="flex gap-2 mb-2">
                        <button className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded text-[10px] font-semibold text-gray-700 border border-gray-100 uppercase">
                           Size: {item.variant?.size || 'Free'} <FiChevronDown className="w-3 h-3 text-gray-500" />
                        </button>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variant)} className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded text-[10px] font-semibold text-gray-700 border border-gray-100 uppercase">
                           Qty: {item.quantity} <FiChevronDown className="w-3 h-3 text-gray-500" />
                        </button>
                     </div>

                     {/* Price Info */}
                     <div className="flex items-center flex-wrap gap-2 mb-2">
                        <span className="text-[14px] font-semibold text-gray-900">{currencyConfig.symbol}{price.toLocaleString()}</span>
                        <StrikePrice amount={originalPrice} className="text-[12px] text-gray-400" />
                        <span className="text-[12px] text-[#FF905A] font-semibold">{discountPercent}% OFF</span>
                     </div>

                     {/* Policy & Delivery */}
                     <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[11px] text-gray-800 font-semibold">
                           <FiRefreshCw className="w-3 h-3" />
                           <span>7 days return available</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                           <FiTruck className="w-3 h-3" />
                           <span>Delivery by <span className="text-gray-800 underline">9 Jan 2026</span></span>
                        </div>
                     </div>
                  </div>
               </div>
            )
         })}
      </div>

      {/* Recommendations */}
      <div className="mt-8 px-4">
         <div className="flex items-center gap-2 mb-4">
            <FiShoppingBag className="w-5 h-5 text-gray-600" />
            <p className="text-[13px] font-semibold text-gray-800">You may also like:</p>
         </div>
         <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4">
            <button className="px-5 py-2.5 rounded-full border border-[#FF3F6C] bg-white text-[11px] font-semibold text-[#FF3F6C] shadow-sm uppercase whitespace-nowrap">All</button>
            {['Face Oil', 'Day Cream', 'Water Bottle', 'Speaker'].map(cat => (
               <button key={cat} className="px-5 py-2.5 rounded-full border border-gray-200 bg-white text-[11px] font-semibold text-gray-600 shadow-sm uppercase whitespace-nowrap">{cat}</button>
            ))}
         </div>
         
         <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {[
               { name: 'Pexpo', sub: 'Craft Sipper-950ml', price: 299, original: 649, off: '54% OFF', img: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop' },
               { name: 'Neutriderm', sub: 'Vitamin E Moisturising...', price: 1000, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop' },
               { name: 'Alexv', sub: 'Winter Jacket', price: 499, original: 1299, off: '60% OFF', img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=500&fit=crop' }
            ].map((prod, i) => (
               <div key={i} className="min-w-[160px] max-w-[160px] bg-white border border-gray-100 rounded overflow-hidden flex flex-col">
                  <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center p-2">
                     <img src={prod.img} className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                     <h5 className="text-[11px] font-bold text-gray-900 truncate">{prod.name}</h5>
                     <p className="text-[9px] text-gray-500 truncate mb-2">{prod.sub}</p>
                     <div className="mt-auto">
                        <div className="flex items-center gap-1.5 mb-2">
                           <span className="text-[11px] font-bold text-gray-900">{currencyConfig.symbol}{prod.price}</span>
                           {prod.original && <StrikePrice amount={prod.original} className="text-[9px] text-gray-400" />}
                        </div>
                        <button className="w-full py-2 border border-gray-100 text-[10px] font-black text-[#FF3F6C] uppercase bg-white hover:bg-gray-50">ADD TO BAG</button>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Coupons Section */}
      <div className="mt-8 px-4">
         <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-4">Coupons</h3>
         <div className="bg-white p-4 rounded-lg flex items-center justify-between shadow-sm border border-white">
            <div className="flex items-center gap-4">
               <FiTagAlt className="w-5 h-5 text-gray-800" />
               <p className="text-[13px] font-semibold text-gray-800">Best Coupon For You</p>
            </div>
            <div className="flex items-center gap-1 text-[#FF3F6C] text-[11px] font-semibold uppercase">
               All Coupons <FiChevronRight />
            </div>
         </div>
         <div className="mt-2 bg-white p-4 border border-[#FEEBC8] rounded-xl relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FFD23F]"></div>
            <h4 className="text-[14px] font-semibold text-gray-900 mb-1">Extra {currencyConfig.symbol}301 OFF</h4>
            <p className="text-[11px] text-gray-500 mb-4 font-medium leading-relaxed">Rs. 301 off on minimum purchase of Rs. 1299</p>
            <div className="flex items-center justify-between">
               <div className="px-4 py-1.5 border border-dashed border-emerald-500 text-emerald-600 bg-emerald-50 text-[10px] font-black rounded">
                  PLANET301
               </div>
               <button className="text-[11px] font-semibold text-[#FF3F6C] uppercase tracking-wide">Login To Avail</button>
            </div>
         </div>
      </div>

      {/* Price Details Card */}
      <div className="mt-8 bg-white border-t border-gray-100 p-4 pb-10">
         <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-4">Price Details ({selectedCount} Items)</h3>
         <div className="space-y-4 text-[13px]">
            <div className="flex justify-between items-center text-gray-600">
               <span>Total MRP</span>
               <span className="text-gray-900 font-medium">{currencyConfig.symbol}{Math.round(totalMRP).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
               <span className="flex items-center gap-1.5">Discount on MRP <span className="text-[#FF3F6C] font-semibold cursor-pointer">Know More</span></span>
               <span className="text-emerald-500 font-semibold">-{currencyConfig.symbol}{Math.round(discountOnMRP).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
               <span className="flex items-center gap-1.5">Platform Fee <span className="text-[#FF3F6C] font-semibold cursor-pointer">Know More</span></span>
               <span className="text-gray-900 font-medium">+{currencyConfig.symbol}{platformFee}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
               <span>Shipping Fee</span>
               <span className="text-emerald-500 font-semibold uppercase">Free</span>
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-[16px] font-semibold text-gray-900">
               <span>Total Amount</span>
               <span>{currencyConfig.symbol}{Math.round(finalTotal).toLocaleString()}</span>
            </div>
         </div>
      </div>

      {/* Sticky Bottom Checkout */}
      {selectedCount > 0 && (
         <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-40 lg:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-4">
               <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-900 tracking-tight">{currencyConfig.symbol}{Math.round(finalTotal).toLocaleString()}</p>
                  <button className="text-[10px] font-black text-[#FF3F6C] uppercase tracking-wider">View Details</button>
               </div>
               <Link href="/checkout" className="flex-[1.5]">
                  <button className="w-full py-4 bg-[#FF3F6C] text-white font-semibold rounded text-sm shadow-xl shadow-[#FF3F6C]/20 uppercase tracking-widest active:scale-95 transition-all">
                     Place Order
                  </button>
               </Link>
            </div>
         </div>
      )}

      {/* Trust Markers */}
      <div className="mt-8 px-4 flex items-center justify-around pb-20">
         <div className="flex flex-col items-center gap-2">
            <FiShield className="w-8 h-8 text-gray-300" />
            <span className="text-[10px] font-semibold text-gray-400 text-center uppercase leading-tight">Authentic<br/>Brands</span>
         </div>
         <div className="flex flex-col items-center gap-2">
            <FiRefreshCw className="w-8 h-8 text-gray-300" />
            <span className="text-[10px] font-semibold text-gray-400 text-center uppercase leading-tight">Safe<br/>Payments</span>
         </div>
         <div className="flex flex-col items-center gap-2">
            <FiTruck className="w-8 h-8 text-gray-300" />
            <span className="text-[10px] font-semibold text-gray-400 text-center uppercase leading-tight">Contactless<br/>Delivery</span>
         </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

function FiTagAlt(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 7h.01" />
      <path d="M15.59 3.41a2 2 0 0 1 2.82 0l2.18 2.18a2 2 0 0 1 0 2.82L12 17l-9-9 9-9 8.59 8.59" />
      <path d="M5 19h14" />
    </svg>
  )
}
