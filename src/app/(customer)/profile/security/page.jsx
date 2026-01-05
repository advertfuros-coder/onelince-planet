'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import { FiArrowLeft, FiLock, FiShield, FiSmartphone, FiEye, FiEyeOff } from 'react-icons/fi'
import Button from '@/components/ui/Button'
import { toast } from 'react-hot-toast'

export default function SecurityPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const handleUpdatePassword = (e) => {
        e.preventDefault()
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('New passwords do not match')
            return
        }
        toast.success('Password update functionality coming soon!')
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 shadow-sm lg:hidden">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/profile')} className="p-1">
                        <FiArrowLeft className="w-5 h-5 text-gray-800" />
                    </button>
                    <h1 className="text-sm font-semibold text-gray-800">Security</h1>
                </div>
            </div>

            <div className="max-w-xl mx-auto lg:py-10 lg:px-4 px-4 py-6">
                <h1 className="text-2xl font-semibold mb-8 hidden lg:block">Security & Safety</h1>

                <div className="space-y-6">
                    {/* Active Security Card */}
                    <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-[32px] p-6 text-white shadow-xl shadow-green-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                <FiShield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Account is Protected</h3>
                                <p className="text-green-50 text-[10px] uppercase font-semibold tracking-widest mt-1">Verified on 2024</p>
                            </div>
                        </div>
                    </div>

                    {/* Password Form */}
                    <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <FiLock className="text-blue-600" /> Change Password
                        </h3>

                        <form onSubmit={handleUpdatePassword} className="space-y-6">
                            <div>
                                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                                <div className="relative mt-1">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="••••••••"
                                        value={formData.currentPassword}
                                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-4 text-gray-400"
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                                <div className="mt-1">
                                    <input
                                        type="password"
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Min 8 characters"
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                                <div className="mt-1">
                                    <input
                                        type="password"
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>

                            <Button type="submit" loading={loading} className="w-full py-4 rounded-2xl shadow-lg shadow-blue-100 mt-4">
                                Update Security Details
                            </Button>
                        </form>
                    </div>

                    {/* Two Factor Auth Placeholder */}
                    <div className="bg-white rounded-[32px] p-6 border border-gray-100 flex items-center justify-between group cursor-pointer hover:border-blue-200 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FiSmartphone className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 text-sm">Two-Factor Authentication</h4>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">Recommended</p>
                            </div>
                        </div>
                        <div className="w-12 h-6 bg-gray-100 rounded-full relative">
                            <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
