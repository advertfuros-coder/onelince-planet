// (auth)/verify-email/page.jsx
'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
    FiMail,
    FiShoppingBag,
    FiCheckCircle,
    FiArrowLeft,
    FiLock
} from 'react-icons/fi'
import Button from '@/components/ui/Button'
import { toast } from 'react-hot-toast'

function VerifyEmailContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [email, setEmail] = useState(searchParams.get('email') || '')
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [resending, setResending] = useState(false)
    const [verified, setVerified] = useState(false)

    const handleVerify = async (e) => {
        e.preventDefault()
        if (!email || !otp) return toast.error('Email and OTP are required')

        setLoading(true)
        try {
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            })

            const data = await response.json()

            if (data.success) {
                setVerified(true)
                toast.success(data.message || 'Account verified successfully!')
            } else {
                toast.error(data.message || 'Verification failed')
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        if (!email) return toast.error('Email is required to resend code')
        setResending(true)
        try {
            const response = await fetch('/api/auth/resend-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
            const data = await response.json()
            if (data.success) {
                toast.success('New verification code sent!')
            } else {
                toast.error(data.message || 'Failed to resend code')
            }
        } catch (error) {
            toast.error('Error resending code')
        } finally {
            setResending(false)
        }
    }

    if (verified) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <FiCheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Email Verified!</h2>
                    <p className="text-gray-600 mb-8">
                        Your account has been successfully verified. You can now sign in to your account.
                    </p>
                    <Link href="/login">
                        <Button className="w-full py-4 text-base font-semibold rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-xl transition-all">
                            Continue to Login
                        </Button>
                    </Link>
                </div>
            </div>
        )
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
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Verify Your Email</h2>
                        <p className="text-gray-600 text-sm">
                            Please enter the 6-digit verification code sent to your email.
                        </p>
                    </div>

                    <form onSubmit={handleVerify} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
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

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Verification Code</label>
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

                        <Button
                            type="submit"
                            loading={loading}
                            className="w-full py-4 text-base font-semibold rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-xl hover:shadow-blue-500/20 transition-all"
                        >
                            Verify Account
                        </Button>
                    </form>

                    <div className="mt-8 text-center space-y-4">
                        <p className="text-sm text-gray-500">
                            Didn't receive the code?{' '}
                            <button
                                onClick={handleResend}
                                disabled={resending}
                                className="text-blue-600 font-semibold hover:underline disabled:opacity-50"
                            >
                                {resending ? 'Sending...' : 'Resend Code'}
                            </button>
                        </p>

                        <Link
                            href="/login"
                            className="flex items-center justify-center space-x-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
                        >
                            <FiArrowLeft className="w-4 h-4" />
                            <span>Back to Sign In</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    )
}
