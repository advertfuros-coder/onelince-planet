'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiPackage, FiMail, FiSearch, FiAlertCircle } from 'react-icons/fi'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { toast } from 'react-hot-toast'

export default function TrackOrderPage() {
  const router = useRouter()
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleTrackOrder = async (e) => {
    e.preventDefault()

    if (!orderNumber.trim()) {
      toast.error('Please enter your order number')
      return
    }

    if (!email.trim()) {
      toast.error('Please enter your email address')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      // Redirect to order tracking page with credentials
      router.push(`/track-order/${orderNumber}?email=${encodeURIComponent(email)}`)
    } catch (error) {
      toast.error('Failed to track order')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
            <FiPackage className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            Track Your Order
          </h1>
          <p className="text-lg text-gray-600">
            Enter your order details to see the latest status
          </p>
        </div>

        {/* Tracking Form */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-blue-100 p-8 md:p-12">
          <form onSubmit={handleTrackOrder} className="space-y-6">

            {/* Order Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Order Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiPackage className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g., OP1767425533045001"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                You can find this in your order confirmation email
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                The email you used when placing the order
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-lg transform hover:-translate-y-0.5 transition-all text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Searching...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FiSearch className="w-5 h-5" />
                  Track Order
                </span>
              )}
            </Button>
          </form>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Can't find your order number?</p>
                <p>Check your email inbox for the order confirmation. The order number starts with "OP" followed by numbers.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Need help? Contact our support team
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@onlineplanet.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all font-semibold text-gray-700"
            >
              <FiMail className="w-5 h-5" />
              Email Support
            </a>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all font-semibold text-gray-700"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
