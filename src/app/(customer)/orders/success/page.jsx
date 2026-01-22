'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { FiCheckCircle, FiMail, FiPackage, FiUser, FiGift, FiTrendingUp, FiShield } from 'react-icons/fi'
import { BiLeaf } from 'react-icons/bi'
import Price from '@/components/ui/Price'
import Button from '@/components/ui/Button'
import { toast } from 'react-hot-toast'
import axios from 'axios'

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const orderNumber = searchParams.get('orderNumber')
  const total = parseFloat(searchParams.get('total') || '0')
  const donation = parseFloat(searchParams.get('donation') || '0')
  const email = searchParams.get('email')
  const isGuest = searchParams.get('guest') === 'true'

  const [showAccountPrompt, setShowAccountPrompt] = useState(isGuest)
  const [creatingAccount, setCreatingAccount] = useState(false)

  const handleCreateAccount = async () => {
    setCreatingAccount(true)
    try {
      // Redirect to signup with pre-filled email
      router.push(`/signup?email=${encodeURIComponent(email || '')}&from=order`)
    } catch (error) {
      toast.error('Failed to redirect to signup')
      setCreatingAccount(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-green-100 p-8 md:p-12 mb-6">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-200 animate-bounce">
              <FiCheckCircle className="w-14 h-14 text-white" />
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
              Order Placed Successfully! 🎉
            </h1>
            <p className="text-lg text-gray-600">
              Thank you for your purchase. Your order is being processed.
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <FiPackage className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="font-semibold text-gray-900">{orderNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <FiMail className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Confirmation Email</p>
                  <p className="font-semibold text-gray-900 truncate">{email}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/50">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-semibold">Total Amount</span>
                <Price amount={total} className="text-2xl font-extrabold text-blue-600" />
              </div>
              {donation > 0 && (
                <div className="flex items-center gap-2 mt-3 p-3 bg-green-100 rounded-lg">
                  <BiLeaf className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-800">
                    Thank you for contributing <Price amount={donation} /> to plant trees! 🌱
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiPackage className="w-5 h-5 text-blue-600" />
              What's Next?
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">1</span>
                </div>
                <span>You'll receive an order confirmation email at <strong>{email}</strong></span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">2</span>
                </div>
                <span>We'll send you tracking details once your order ships</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">3</span>
                </div>
                <span>Your order will be delivered to your specified address</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Create Account Prompt for Guests */}
        {showAccountPrompt && (
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl shadow-2xl shadow-purple-200 p-8 md:p-10 text-white mb-6 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <FiGift className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-extrabold">Create Your Account & Get Exclusive Benefits!</h2>
              </div>

              <p className="text-white/90 mb-6 text-lg">
                Your order was placed as a guest. Create an account to unlock amazing features:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <FiPackage className="w-6 h-6 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Track All Orders</h4>
                    <p className="text-sm text-white/80">View order history and track shipments in real-time</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <FiTrendingUp className="w-6 h-6 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Exclusive Deals</h4>
                    <p className="text-sm text-white/80">Get early access to sales and member-only discounts</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <FiShield className="w-6 h-6 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Saved Addresses</h4>
                    <p className="text-sm text-white/80">Checkout faster with saved shipping addresses</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <BiLeaf className="w-6 h-6 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Loyalty Rewards</h4>
                    <p className="text-sm text-white/80">Earn points on every purchase and redeem for discounts</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleCreateAccount}
                  disabled={creatingAccount}
                  className="flex-1 bg-white text-purple-600 hover:bg-gray-100 font-semibold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all"
                >
                  <FiUser className="w-5 h-5 mr-2" />
                  {creatingAccount ? 'Redirecting...' : 'Create Free Account'}
                </Button>
                <button
                  onClick={() => setShowAccountPrompt(false)}
                  className="px-6 py-4 text-white/90 hover:text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => router.push('/')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl shadow-lg"
          >
            Continue Shopping
          </Button>
          {!isGuest && (
            <Button
              onClick={() => router.push('/orders')}
              className="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-4 rounded-xl shadow-lg"
            >
              View My Orders
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  )
}
