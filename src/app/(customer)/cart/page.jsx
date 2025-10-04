// app/(customer)/cart/page.jsx
'use client'
import { useCart } from '@/lib/context/CartContext'
import Link from 'next/link'
import { FiTrash2, FiShoppingCart, FiMinus, FiPlus } from 'react-icons/fi'
import Button from '@/components/ui/Button'

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getCartTotal, getCartCount, isLoaded } = useCart()

  // Show loading state while cart is being loaded from localStorage
  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-600">Loading cart...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <FiShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Add some products to get started</p>
        <Link href="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  const cartCount = getCartCount()
  const cartTotal = getCartTotal()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Shopping Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={`${item.productId}-${JSON.stringify(item.variant)}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex gap-4">
                {/* Product Image */}
                <Link href={`/products/${item.productId}`} className="flex-shrink-0">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={item.image || '/images/placeholder-product.jpg'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.productId}`}>
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 mb-1">
                      {item.name}
                    </h3>
                  </Link>
                  
                  {item.variant && (
                    <p className="text-sm text-gray-600 mb-2">
                      {Object.entries(item.variant).map(([key, value]) => (
                        <span key={key} className="mr-2">
                          {key}: {value}
                        </span>
                      ))}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variant)}
                        className="p-2 hover:bg-gray-100 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <FiMinus className="w-4 h-4" />
                      </button>
                      <span className="px-4 font-semibold min-w-[40px] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variant)}
                        className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={item.quantity >= item.stock}
                        aria-label="Increase quantity"
                      >
                        <FiPlus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price */}
                    <p className="text-lg font-bold text-gray-900">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.productId, item.variant)}
                      className="ml-auto text-red-600 hover:text-red-800 p-2 transition-colors"
                      aria-label="Remove from cart"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Stock warning */}
                  {item.quantity >= item.stock && (
                    <p className="text-xs text-orange-600 mt-2">
                      Maximum stock reached ({item.stock} available)
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold">₹{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (18%)</span>
                <span className="font-semibold">₹{Math.round(cartTotal * 0.18).toLocaleString()}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>₹{Math.round(cartTotal * 1.18).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Link href="/checkout">
              <Button className="w-full mb-3">
                Proceed to Checkout
              </Button>
            </Link>

            <Link href="/products">
              <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
