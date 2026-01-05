'use client'

import { useState } from 'react'
import { Eye, EyeOff, Check, X, AlertCircle, Lock, RefreshCw } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function PasswordResetSection({ token }) {
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    })
    const [loading, setLoading] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState(0)

    // Password strength calculator
    const calculatePasswordStrength = (password) => {
        let strength = 0
        if (password.length >= 8) strength += 20
        if (password.length >= 12) strength += 20
        if (/[a-z]/.test(password)) strength += 15
        if (/[A-Z]/.test(password)) strength += 15
        if (/[0-9]/.test(password)) strength += 15
        if (/[^a-zA-Z0-9]/.test(password)) strength += 15
        return strength
    }

    const handlePasswordChange = (field, value) => {
        setPasswords(prev => ({ ...prev, [field]: value }))
        if (field === 'newPassword') {
            setPasswordStrength(calculatePasswordStrength(value))
        }
    }

    const getStrengthColor = () => {
        if (passwordStrength < 40) return 'bg-red-500'
        if (passwordStrength < 70) return 'bg-yellow-500'
        return 'bg-green-500'
    }

    const getStrengthText = () => {
        if (passwordStrength < 40) return 'Weak'
        if (passwordStrength < 70) return 'Medium'
        return 'Strong'
    }

    const passwordRequirements = [
        { text: 'At least 8 characters', met: passwords.newPassword.length >= 8 },
        { text: 'Contains uppercase letter', met: /[A-Z]/.test(passwords.newPassword) },
        { text: 'Contains lowercase letter', met: /[a-z]/.test(passwords.newPassword) },
        { text: 'Contains number', met: /[0-9]/.test(passwords.newPassword) },
        { text: 'Contains special character', met: /[^a-zA-Z0-9]/.test(passwords.newPassword) }
    ]

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validation
        if (!passwords.currentPassword) {
            toast.error('Current password is required')
            return
        }

        if (passwords.newPassword.length < 8) {
            toast.error('New password must be at least 8 characters')
            return
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error('New passwords do not match')
            return
        }

        if (passwordStrength < 40) {
            toast.error('Password is too weak. Please choose a stronger password.')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/seller/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword
                })
            })

            const data = await res.json()

            if (data.success) {
                toast.success('Password updated successfully!')
                setPasswords({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                })
                setPasswordStrength(0)
            } else {
                toast.error(data.message || 'Failed to update password')
            }
        } catch (error) {
            console.error('Password change error:', error)
            toast.error('An error occurred while updating password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Current Password */}
            <div className="space-y-2 group max-w-lg">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 group-focus-within:text-blue-600 transition-colors">
                    Current Secure Key
                </label>
                <div className="relative">
                    <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwords.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                        placeholder="Enter your current password"
                        className="w-full px-6 py-4 pr-12 bg-gray-50/50 border border-transparent rounded-[1.5rem] text-[13px] font-semibold placeholder:text-gray-300 focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            {/* New Password */}
            <div className="space-y-2 group max-w-lg">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 group-focus-within:text-blue-600 transition-colors">
                    New Entropy Passphrase
                </label>
                <div className="relative">
                    <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwords.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        placeholder="Min 8 characters, mix of letters, numbers & symbols"
                        className="w-full px-6 py-4 pr-12 bg-gray-50/50 border border-transparent rounded-[1.5rem] text-[13px] font-semibold placeholder:text-gray-300 focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                {/* Password Strength Indicator */}
                {passwords.newPassword && (
                    <div className="space-y-2 px-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">
                                Password Strength
                            </span>
                            <span className={`text-[9px] font-semibold uppercase tracking-widest ${passwordStrength < 40 ? 'text-red-500' : passwordStrength < 70 ? 'text-yellow-500' : 'text-green-500'
                                }`}>
                                {getStrengthText()}
                            </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                                style={{ width: `${passwordStrength}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2 group max-w-lg">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 group-focus-within:text-blue-600 transition-colors">
                    Verify Entropy
                </label>
                <div className="relative">
                    <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwords.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                        placeholder="Re-enter your new password"
                        className="w-full px-6 py-4 pr-12 bg-gray-50/50 border border-transparent rounded-[1.5rem] text-[13px] font-semibold placeholder:text-gray-300 focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                {/* Password Match Indicator */}
                {passwords.confirmPassword && (
                    <div className="flex items-center gap-2 px-2">
                        {passwords.newPassword === passwords.confirmPassword ? (
                            <>
                                <Check size={14} className="text-green-500" />
                                <span className="text-[9px] font-semibold text-green-500 uppercase tracking-widest">
                                    Passwords Match
                                </span>
                            </>
                        ) : (
                            <>
                                <X size={14} className="text-red-500" />
                                <span className="text-[9px] font-semibold text-red-500 uppercase tracking-widest">
                                    Passwords Don't Match
                                </span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Password Requirements */}
            {passwords.newPassword && (
                <div className="bg-gray-50/50 rounded-[2rem] p-6 border border-gray-100 max-w-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertCircle size={16} className="text-blue-600" />
                        <h4 className="text-[10px] font-semibold text-gray-900 uppercase tracking-widest">
                            Security Requirements
                        </h4>
                    </div>
                    <div className="space-y-2">
                        {passwordRequirements.map((req, index) => (
                            <div key={index} className="flex items-center gap-2">
                                {req.met ? (
                                    <Check size={14} className="text-green-500" />
                                ) : (
                                    <X size={14} className="text-gray-300" />
                                )}
                                <span className={`text-[11px] font-semibold ${req.met ? 'text-green-600' : 'text-gray-400'}`}>
                                    {req.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-start max-w-lg">
                <button
                    type="submit"
                    disabled={loading || !passwords.currentPassword || !passwords.newPassword || passwords.newPassword !== passwords.confirmPassword || passwordStrength < 40}
                    className="px-10 py-4 bg-blue-600 text-white rounded-[1.5rem] font-semibold uppercase text-[11px] tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
                >
                    {loading ? (
                        <>
                            <RefreshCw size={16} className="animate-spin" />
                            Updating...
                        </>
                    ) : (
                        <>
                            <Lock size={16} />
                            Update Password
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}
