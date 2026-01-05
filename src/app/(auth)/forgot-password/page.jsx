// (auth)/forgot-password/page.jsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  FiMail,
  FiArrowLeft,
  FiShoppingBag,
  FiCheckCircle,
  FiLock,
  FiEye,
  FiEyeOff
} from 'react-icons/fi'
import Button from '@/components/ui/Button'
import { toast } from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Email, 2: OTP + New Password
  const [showPassword, setShowPassword] = useState(false)

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setStep(2)
        toast.success('Verification code sent to your email')
      } else {
        toast.error(data.message || 'Failed to send verification code')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match')
    }

    if (newPassword.length < 8) {
      return toast.error('Password must be at least 8 characters')
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      })

      const data = await response.json()

      if (data.success) {
        setStep(3)
        toast.success('Password reset successfully! 🎉')
      } else {
        toast.error(data.message || 'Verification failed')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 group">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <FiShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              OnlinePlanet
            </span>
          </Link>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white p-8">
          {step === 1 && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Forgot Password?</h2>
                <p className="text-gray-600 text-sm">
                  Enter your email address and we'll send you a 6-digit verification code.
                </p>
              </div>

              <form onSubmit={handleSendOTP} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full py-4 text-base font-semibold rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-xl hover:shadow-blue-500/20 transition-all"
                >
                  Send Verification Code
                </Button>
              </form>

              <Link
                href="/login"
                className="flex items-center justify-center space-x-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mt-8"
              >
                <FiArrowLeft className="w-4 h-4" />
                <span>Back to Sign In</span>
              </Link>
            </>
          )}

          {step === 2 && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Verify OTP</h2>
                <p className="text-gray-600 text-sm">
                  We've sent a 6-digit code to <span className="font-semibold text-gray-900">{email}</span>. Please enter it below along with your new password.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1"> Verification Code </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center tracking-[1em] text-2xl font-semibold py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                    placeholder="000000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1"> New Password </label>
                  <div className="relative group">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1"> Confirm Password </label>
                  <div className="relative group">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full py-4 text-base font-semibold rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-xl hover:shadow-blue-500/20 transition-all"
                >
                  Reset Password
                </Button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-center text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Edit Email Address
                </button>
              </form>
            </>
          )}

          {step === 3 && (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce-subtle">
                <FiCheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Password Updated!</h2>
              <p className="text-gray-600 mb-8">
                Your password has been reset successfully. You can now use your new password to sign in.
              </p>
              <Link href="/login">
                <Button className="w-full py-4 text-base font-semibold rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600">
                  Continue to Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Support Link */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Didn't receive the email? Check your spam folder or{' '}
          <button onClick={() => setStep(1)} className="text-blue-600 font-semibold hover:underline">
            try again
          </button>
        </p>
      </div>
    </div>
  )
}
