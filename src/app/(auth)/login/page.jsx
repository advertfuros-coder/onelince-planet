// (auth)/login/page.jsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiShoppingBag,
  FiCheck,
  FiStar,
  FiUsers,
  FiTrendingUp,
  FiArrowRight
} from 'react-icons/fi'
import { FaGoogle, FaFacebook, FaApple } from 'react-icons/fa'
import Button from '@/components/ui/Button'
import { useAuth } from '@/lib/context/AuthContext'
import { toast } from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await login(formData.email, formData.password)

      if (result.success) {
        toast.success('Welcome back! 🎉')

        if (result.user.role === 'seller') {
          router.push('/seller/dashboard')
        } else if (result.user.role === 'admin') {
          router.push('/admin/dashboard')
        } else {
          router.push('/')
        }
      } else if (result.requiresVerification) {
        toast.error(result.message)
        router.push(`/verify-email?email=${encodeURIComponent(result.email)}`)
      } else {
        toast.error(result.message || 'Login failed')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* Left Side - Visual Showcase */}
      <div className="hidden lg:flex relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                <FiShoppingBag className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-semibold text-white">OnlinePlanet</span>
            </Link>
          </div>

          {/* Center Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-semibold text-white leading-tight">
                Shop Smarter,
                <br />
                Live Better
              </h1>
              <p className="text-xl text-white/90 max-w-md">
                Join millions of shoppers discovering amazing deals from trusted sellers across India
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-lg">
              {[
                { icon: FiUsers, value: '2M+', label: 'Active Users' },
                { icon: FiStar, value: '4.8', label: 'App Rating' },
                { icon: FiTrendingUp, value: '50K+', label: 'Products' }
              ].map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                  <stat.icon className="w-6 h-6 text-white mb-2" />
                  <div className="text-2xl font-semibold text-white">{stat.value}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 max-w-lg">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                ))}
              </div>
              <p className="text-white/90 mb-4">
                "Best shopping experience! Fast delivery and amazing customer service. Highly recommended!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">
                  R
                </div>
                <div>
                  <div className="text-white font-semibold">Rahul Kumar</div>
                  <div className="text-white/70 text-sm">Verified Buyer</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="flex items-center gap-6 text-white/80 text-sm">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <span>•</span>
            <Link href="/help" className="hover:text-white transition-colors">Help</Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-pink-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md space-y-8">

          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FiShoppingBag className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                OnlinePlanet
              </span>
            </Link>
          </div>

          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">Welcome back</h2>
            <p className="text-sm md:text-base text-gray-600">Sign in to your account to continue</p>
          </div>

          {/* Social Login */}
          <div className="space-y-2.5">
            <button className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all group">
              <FaGoogle className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
              <span className="text-sm md:text-base font-semibold text-gray-700 group-hover:text-gray-900">Continue with Google</span>
            </button>
            
            <div className="grid grid-cols-2 gap-2.5">
              <button className="flex items-center justify-center gap-1.5 px-3 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all group">
                <FaFacebook className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                <span className="text-sm md:text-base font-semibold text-gray-700 group-hover:text-gray-900">Facebook</span>
              </button>
              <button className="flex items-center justify-center gap-1.5 px-3 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all group">
                <FaApple className="w-4 h-4 md:w-5 md:h-5 text-gray-900" />
                <span className="text-sm md:text-base font-semibold text-gray-700 group-hover:text-gray-900">Apple</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs md:text-sm">
              <span className="px-3 bg-white text-gray-500 font-medium">Or with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs md:text-sm font-semibold text-gray-900">
                Email
              </label>
              <div className="relative group">
                <FiMail className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-3.5 text-sm md:text-base bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-gray-900"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs md:text-sm font-semibold text-gray-900">
                Password
              </label>
              <div className="relative group">
                <FiLock className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 md:pl-12 pr-10 md:pr-12 py-3 md:py-3.5 text-sm md:text-base bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-gray-900"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <FiEye className="w-4 h-4 md:w-5 md:h-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="w-4 h-4 rounded-md border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  Remember me
                </span>
              </label>
              <Link 
                href="/forgot-password" 
                className="text-xs md:text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-3 md:py-4 text-sm md:text-base bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-sm md:text-base">Signing in...</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm md:text-base">Sign in</span>
                    <FiArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </form>

          {/* Sign Up */}
          <p className="text-center text-xs md:text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700">
              Create free account
            </Link>
          </p>

          {/* Seller Link */}
          <div className="pt-4 md:pt-6 border-t border-gray-200">
            <Link 
              href="/seller/register" 
              className="flex items-center justify-center gap-1.5 text-xs md:text-sm text-gray-600 hover:text-gray-900 group"
            >
              <span>Sell on OnlinePlanet?</span>
              <span className="font-semibold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                Register as Seller
                <FiArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
