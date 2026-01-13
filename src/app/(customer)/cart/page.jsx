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

  // Selection state
  const [selectedItems, setSelectedItems] = useState([])

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
  const finalTotal = cartTotal + platformFee

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
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-1 text-blue-600">
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-sm font-semibold text-gray-800 tighter ">Shopping Bag</h1>
        </div>
       </div>

      {/* Stepper */}
      <div className="bg-white md:block hidden px-4 py-4 border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between max-w-xs mx-auto text-[10px] font-semibold  [2px]">
          <div className="flex flex-col items-center gap-1.5 ">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-50"></div>
            <span className="text-blue-600">Bag</span>
          </div>
          <div className="flex-1 h-[2px] bg-gray-200 mx-2 -mt-4"></div>
          <div className="flex flex-col items-center gap-1.5 opacity-40">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
            <span>Address</span>
          </div>
          <div className="flex-1 h-[2px] bg-gray-200 mx-2 -mt-4"></div>
          <div className="flex flex-col items-center gap-1.5 opacity-40">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
            <span>Payment</span>
          </div>
        </div>
      </div>

   
      {/* Selection Control Bar */}
      <div className="bg-white px-4 py-4 mb-1 flex items-center justify-between border-b border-gray-100">
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
      </div>

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
              <div className="absolute top-5 left-5 z-10">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleItemSelection(id)}
                  className="w-5 h-5 rounded-lg border-2 border-gray-100 text-blue-600 focus:ring-blue-600"
                />
              </div>

              {/* Product Visual */}
              <Link href={`/products/${item.productId}`} className="w-32 aspect-[3/3] bg-gray -50 roun ded-3xl overflow-hidden flex-shrink-0 bo rder border-gray-100 flex items-center justify-center group">
                <img
                  src={item.image?.startsWith('http') ? item.image : item.image || '/placeholder-product.png'}
                  alt={item.name}
                  className="w-full h-full object-contain p3 mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                />
              </Link>

              {/* High Density Details */}
              <div className="flex-1 min-w-0 flex flex-col pt-1">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex-1">
                    <p className="text-[14px] text-gray-900 font-semibold leading-tight">{item.name}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.productId, item.variant)} className="p-1">
                    <FiTrash2 className="w-4 h-4 text-gray-200 hover:text-red-500 transition-colors" />
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 font-semibold  wider mb-3">Merchant: {item.seller || 'Online Planet'}</p>

                {/* Attribute Pickers */}
                <div className="flex gap-2 mb-4">
                  
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variant)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-2xl text-[10px] font-semibold text-gray-700 border border-gray-100  tighter">
                    QTY: {item.quantity} <FiChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>

                {/* Matrix Pricing */}
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-[18px] font-semibold text-blue-600 tighter leading-none">{currencyConfig.symbol}{price.toLocaleString()}</span>
                  <StrikePrice amount={originalPrice} className="text-[12px] text-gray-300 font-semibold mb-0.5" />
                  <span className="text-[11px] text-emerald-500 font-semibold mb-0.5  tighter">{discountPercent}% OFF</span>
                </div>

                {/* Meta Labels */}
                <div className="space-y-1.5 pt-3 border-t border-dashed border-gray-100">
                  <div className="flex items-center gap-2 text-[10px] text-gray-900 font-semibold  wider">
                    <FiRefreshCw className="w-3 h-3 text-blue-600" />
                    <span>Verified 7-Day Returns</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-semibold  wider">
                    <FiTruck className="w-3 h-3" />
                    <span>Delivery: <span className="text-gray-900">Est. 9 Jan 2026</span></span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Discovery Section (You May Also Like) */}
      <div className="mt-10 px-4">
        <div className="flex items-center gap-2 mb-6">
          <FiShoppingBag className="w-6 h-6 text-blue-600" />
          <p className="text-[13px] font-semibold text-gray-900   ]">You May Also Like</p>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-6">
          <button className="px-6 py-3 rounded-full border-2 border-blue-600 bg-blue-600 text-[10px] font-semibold text-white shadow-xl shadow-blue-600/10  widest whitespace-nowrap">Explore All</button>
          {['Tech Essentials', 'Fashion', 'Eco-Decor', 'Fitness'].map(cat => (
            <button key={cat} className="px-6 py-3 rounded-full border-2 border-white bg-white text-[10px] font-semibold text-gray-500 shadow-sm  widest whitespace-nowrap">{cat}</button>
          ))}
        </div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {[
            { name: 'Pexpo', sub: 'Premium Craft Sipper', price: 299, original: 649, off: '54% OFF', img: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop' },
            { name: 'Neutriderm', sub: 'Vitamin E Science', price: 1000, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop' },
            { name: 'Alexv', sub: 'Outerworld Jacket', price: 499, original: 1299, off: '60% OFF', img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=500&fit=crop' }
          ].map((prod, i) => (
            <div key={i} className="min-w-[170px] max-w-[170px] bg-white rounded-[32px] border border-gray-100 p-2 flex flex-col shadow-sm group">
              <div className="aspect-square bg-gray-50 rounded-[28px] flex items-center justify-center p-3 relative overflow-hidden">
                <img src={prod.img} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-500" /> 
                <div className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                  <FiHeart className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="p-3 pt-4 flex-1 flex flex-col">
                <h5 className="text-[11px] font-semibold text-blue-600  wider truncate mb-1">{prod.name}</h5>
                <p className="text-[10px] text-gray-400 font-semibold truncate mb-3">{prod.sub}</p>
                <div className="mt-auto">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[13px] font-semibold text-gray-900">{currencyConfig.symbol}{prod.price}</span>
                    {prod.original && <StrikePrice amount={prod.original} className="text-[9px] text-gray-300" />}
                  </div>
                  <button className="w-full py-2.5 bg-gray-50 rounded-2xl text-[9px] font-semibold text-blue-600  widest border border-blue-50 hover:bg-blue-600 hover:text-white transition-all">Add to bag</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coupons/Incentives Section */}
      <div className="mt-10 px-4">
        <h3 className="text-[10px] font-semibold text-gray-400  [3px] mb-4">Planet Rewards</h3>
        <div className="bg-white p-5 rounded-[28px] flex items-center justify-between shadow-xl shadow-blue-600/5 mb-3 border border-blue-50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <BiTagAlt className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-gray-900  tighter">Best Planet Coupon</p>
              <p className="text-[10px] text-gray-400 font-semibold">Automatic savings applied</p>
            </div>
          </div>
          <FiChevronRight className="text-blue-600 w-6 h-6" />
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-[32px] relative overflow-hidden shadow-2xl shadow-blue-500/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-[18px] font-semibold text-[#FFD23F] tighter">Save {currencyConfig.symbol}301 Extra</h4>
              <p className="text-[11px] text-blue-100 font-semibold mt-1">On orders exceeding {currencyConfig.symbol}1,299</p>
            </div>
            <div className="px-5 py-2 bg-white/10 backdrop-blur rounded-2xl border border-white/20 text-[10px] font-semibold text-white  widest">
              PLANET301
            </div>
          </div>
          <button className="w-full py-4 bg-[#FFD23F] text-blue-600 font-semibold text-[12px] rounded-2xl  [3px] active:scale-[0.98] transition-all">Claim Reward</button>
        </div>
      </div>

      {/* Financial Matrix (Price Details) */}
      <div className="mt-10 bg-white border-t-2 border-blue-50 p-6 pb-12 rounded-t-[40px] shadow-[0_-10px_30px_rgba(37,99,235,0.03)]">
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
            <span className="text-emerald-500 font-semibold  widest">Absorbed</span>
          </div>
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
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-5 z-40 lg:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-5">
            <div className="flex-1">
              <p className="text-xl font-semibold text-blue-600 leading-none tighter">{currencyConfig.symbol}{Math.round(finalTotal).toLocaleString()}</p>
              <button className="text-[9px] font-semibold text-gray-400  [2px] mt-1.5 flex items-center gap-1">View Breakdown <FiChevronDown /></button>
            </div>
            <Link href="/checkout" className="flex-[1.8]">
              <button className="w-full py-3 bg-blue-600 text-white font-semibold text-[14px] rounded-[24px] shadow-2xl shadow-blue-600/20  [4px] active:scale-[0.98] transition-all">
                Place Order
              </button>
            </Link>
          </div>
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
