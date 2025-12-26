// app/(customer)/cart/page.jsx
'use client'
import { useCart } from '@/lib/context/CartContext'
import Link from 'next/link'
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
  FiShoppingCart
} from 'react-icons/fi'
import { BiTagAlt } from 'react-icons/bi'
import Button from '@/components/ui/Button'

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getCartTotal, getCartCount, isLoaded } = useCart()

  // Mock data for UI elements not yet in backend
  const EXCHANGE_RATE_AED = 0.044 // Approx INR to AED
  const DELIVERY_DATE = "Tue, 24 Oct"

  // Show loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 font-medium">Loading your cart...</p>
      </div>
    )
  }

  const cartCount = getCartCount()
  const cartTotal = getCartTotal()
  const discount = 3000 // Mock discount
  const deliveryCharges = 0
  const tax = Math.round(cartTotal * 0.18) // Mock GST
  const finalTotal = cartTotal + tax - discount

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100/50 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiShoppingCart className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link href="/products" className="block w-full">
            <Button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-200">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-8 font- sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Cart</span>
        </nav>

        {/* Page Title */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-8">
          Shopping Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Cart Items */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => {
              const price = item.price || 0
              const itemTotal = price * item.quantity
              const originalPrice = Math.round(price * 1.25) // Mock original price (25% markup)
              const savedAmount = (originalPrice - price) * item.quantity

              return (
                <div key={`${item.productId}-${JSON.stringify(item.variant)}`} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative group transition-all hover:shadow-md">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Image */}
                    <Link href={`/products/${item.productId}`} className="flex-shrink-0">
                      <div className="w-full sm:w-32 h-32 bg-gray-50 rounded-xl overflow-hidden relative border border-gray-100">
                        <img
                          src={item.image || '/images/placeholder-product.jpg'}
                          alt={item.name}
                          className="w-full h-full object-contain p-2 mix-blend-multiply"
                        />
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        {/* Title & Header */}
                        <div className="flex justify-between items-start mb-1">
                          <Link href={`/products/${item.productId}`} className="group-hover:text-blue-600 transition-colors">
                            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                          </Link>
                        </div>

                        {/* Variants */}
                        <div className="text-sm text-gray-500 mb-3 flex items-center gap-2">
                          {item.variant && Object.entries(item.variant).map(([key, value]) => (
                            <span key={key} className="capitalize">{key}: {value} •</span>
                          ))}
                          <Link href="#" className="flex items-center gap-1 text-blue-600 text-xs font-semibold hover:underline">
                            <FiShoppingBag className="w-3 h-3" />
                            Sold by Global Gadgets
                          </Link>
                        </div>
                      </div>

                      {/* Controls Row */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
                        {/* Quantity & Actions */}
                        <div className="flex items-center gap-6">
                          <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variant)}
                              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-l-lg transition-colors"
                            >
                              <FiMinus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variant)}
                              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-r-lg transition-colors disabled:opacity-50"
                              disabled={item.quantity >= item.stock}
                            >
                              <FiPlus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex items-center gap-4 text-sm font-medium">
                            <button
                              onClick={() => removeFromCart(item.productId, item.variant)}
                              className="text-gray-500 hover:text-red-600 transition-colors"
                            >
                              Delete
                            </button>
                            <button className="text-gray-500 hover:text-blue-600 transition-colors">
                              Save for later
                            </button>
                          </div>
                        </div>

                        {/* Price Block */}
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-2 mb-1">
                            <span className="text-xs text-gray-400 line-through">₹{originalPrice.toLocaleString()}</span>
                            <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded">-20%</span>
                          </div>
                          <div className="text-xl font-bold text-gray-900">₹{price.toLocaleString()}</div>
                          <div className="text-[10px] text-gray-400 font-medium">(AED {(price * EXCHANGE_RATE_AED).toFixed(0)})</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Info (Stock/Delivery) */}
                  <div className="mt-4 pt-4 border-t border-dashed border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4 text-sm">
                    {item.quantity >= item.stock ? (
                      <div className="flex items-center gap-2 text-orange-600 font-medium">
                        <FiClock className="w-4 h-4" />
                        <span>Low Stock - Order soon!</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-600 font-medium">
                        <FiTruck className="w-4 h-4" />
                        <span>Free Delivery by {DELIVERY_DATE}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4 space-y-6">

            {/* Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Coupon Input */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-blue-600 mb-2">Have a coupon?</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <BiTagAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter code"
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <button className="px-5 py-2.5 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-100 transition-colors">
                    Apply
                  </button>
                </div>
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-100 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartCount} items)</span>
                  <span className="font-medium text-gray-900">₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span className="font-medium">- ₹{discount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Delivery Charges</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="flex justify-between text-gray-500 flex items-center gap-1">
                  <span>Tax (GST/VAT) <span className="text-gray-300 cursor-help">ⓘ</span></span>
                  <span className="text-xs">Calculated at checkout</span>
                </div>
              </div>

              {/* Final Total */}
              <div className="flex justify-between items-end mb-8">
                <span className="text-lg font-bold text-gray-900">Total Amount</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">₹{finalTotal.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 font-medium">Approx. AED {(finalTotal * EXCHANGE_RATE_AED).toFixed(0)}</div>
                </div>
              </div>

              {/* Checkout Button */}
              <Link href="/checkout" className="block">
                <Button className="w-full py-4 bg-[#1a56db] hover:bg-blue-700 text-white font-bold rounded-full shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group transition-all transform hover:-translate-y-0.5">
                  Continue to Checkout
                  <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              {/* Trust Badges */}
              <div className="mt-8 grid grid-cols-3 gap-2 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                    <FiShield className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 leading-tight">SECURE<br />PAYMENT</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                    <FiRefreshCw className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 leading-tight">EASY<br />RETURNS</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                    <FiCheckCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 leading-tight">AUTHENTIC<br />BRANDS</span>
                </div>
              </div>
            </div>

            {/* Security Note Banner */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-start gap-3">
              <FiShield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 leading-relaxed">
                Your transaction is secured with 256-bit SSL encryption. We do not store your card details.
              </p>
            </div>
          </div>

        </div>

        {/* Use Cases / Recommendations */}
        <section className="mt-24">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900">You May Also Like</h3>
            <Link href="/products" className="text-blue-600 text-sm font-semibold hover:underline">View All</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { id: 1, title: 'Portable Mini Speaker', brand: 'AudioTech', price: 1299, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop' },
              { id: 2, title: 'Speed Runner Shoes', brand: 'SportFit', price: 5499, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop' },
              { id: 3, title: 'Laptop Sleeve 13"', brand: 'CaseLogic', price: 999, image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=500&h=500&fit=crop' },
              { id: 4, title: 'Ergo Wireless Mouse', brand: 'TechWorld UAE', price: 1499, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop' }
            ].map((product) => (
              <div key={product.id} className="bg-white p-4 rounded-2xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
                <div className="relative aspect-square mb-4 bg-gray-50 rounded-xl overflow-hidden">
                  <img src={product.image} alt={product.title} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white transition-colors shadow-sm">
                    <FiHeart className="w-4 h-4 fill-current" />
                  </button>
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{product.title}</h4>
                <p className="text-xs text-gray-500 mb-3">{product.brand}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                  <button className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                    <FiShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
