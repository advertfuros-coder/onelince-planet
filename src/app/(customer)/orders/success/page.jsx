'use client'
import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  FiCheckCircle,
  FiPackage,
  FiTruck,
  FiHome,
  FiShoppingBag,
  FiArrowRight
} from 'react-icons/fi'
import { BiLeaf } from 'react-icons/bi'
import Button from '@/components/ui/Button.jsx'
import Confetti from 'react-confetti'

function OrderSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showConfetti, setShowConfetti] = useState(true)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  // Get order details from URL params
  const orderNumber = searchParams.get('orderNumber') || '#12345678'
  const orderTotal = searchParams.get('total') || '0'
  const donation = searchParams.get('donation') || '0'
  const customerName = searchParams.get('name') || 'Customer'

  useEffect(() => {
    // Set window size for confetti
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    })

    // Stop confetti after 5 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 relative overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 mb-6">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <FiCheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Thank you for your order, {customerName}!
            </h1>
            <p className="text-gray-500">
              Your order <span className="font-semibold text-gray-900">{orderNumber}</span> is confirmed.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Link href={`/orders/${orderNumber.replace('#', '')}`} className="flex-1">
              <Button className="w-full py-3 bg-white border-2 border-gray-200 text-gray-900 font-semibold rounded-xl hover:bg-gray-50 transition-all">
                Track Your Order
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all">
                Continue Shopping
              </Button>
            </Link>
          </div>

          {/* Order Summary */}
          <div className="border-t border-gray-100 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Order Summary</h3>
              {parseFloat(donation) > 0 && (
                <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                  <BiLeaf className="w-4 h-4" />
                  You saved ₹{donation}
                </div>
              )}
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Estimated Delivery</span>
                <span className="font-semibold text-gray-900">Oct 24 - Oct 26</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-semibold text-gray-900">Cash on Delivery</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping Address</span>
                <span className="font-semibold text-gray-900 text-right">Dubai Marina, UAE</span>
              </div>
            </div>

            {/* Total Amount */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <span className="text-base font-bold text-gray-900">Total Amount</span>
              <span className="text-xl font-bold text-blue-600">₹{parseFloat(orderTotal).toLocaleString()}</span>
            </div>
          </div>

          {/* Green Donation Thank You */}
          {parseFloat(donation) > 0 && (
            <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <BiLeaf className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1 text-sm">Thank You for Your Green Donation! 🌱</h4>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Your contribution of <span className="font-bold text-green-700">₹{donation}</span> will help us plant trees and fight global warming.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Account Creation Prompt */}
          <div className="mt-6 bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <FiPackage className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1 text-sm">Create an account for faster checkout</h4>
                  <p className="text-xs text-gray-600">Track this order easily and save details for next time</p>
                </div>
              </div>
              <Link href="/register">
                <button className="text-blue-600 text-sm font-semibold hover:text-blue-700 whitespace-nowrap">
                  Set Password
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Exclusive Deals Section */}
        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Exclusive Deals Just for You</h2>
              <p className="text-sm text-gray-500">Based on your recent purchase history</p>
            </div>
            <Link href="/products" className="text-blue-600 text-sm font-semibold hover:text-blue-700 flex items-center gap-1">
              View all deals <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Ultra Smart Watch Ser...', price: '₹2,499', originalPrice: '₹3,999', discount: '25% OFF', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop' },
              { name: 'Noise Cancelling Ear...', price: '₹1,299', originalPrice: '₹2,499', badge: 'Best Seller', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop' },
              { name: 'Urban Travel Backpack', price: '₹899', originalPrice: '₹1,499', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop' },
              { name: 'Mini Portable Bass Sp...', price: '₹999', originalPrice: '₹1,999', discount: '50% OFF', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200&h=200&fit=crop' }
            ].map((product, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="relative bg-gray-100 rounded-xl overflow-hidden mb-3 aspect-square">
                  {product.discount && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
                      {product.discount}
                    </div>
                  )}
                  {product.badge && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
                      {product.badge}
                    </div>
                  )}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-gray-900">{product.price}</span>
                  <span className="text-xs text-gray-400 line-through">{product.originalPrice}</span>
                </div>
                <button className="mt-2 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-semibold rounded-lg transition-colors">
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Need help with your order? Contact us at <a href="mailto:support@onlineplanet.com" className="text-blue-600 hover:text-blue-700 font-semibold">support@onlineplanet.com</a></p>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  )
}
