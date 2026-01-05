'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiLock, FiEye, FiEyeOff, FiCheck, FiX, FiShield, FiAlertTriangle } from 'react-icons/fi'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import confetti from 'canvas-confetti'

export default function ForcePasswordChange() {
    const { user, token, updateProfile } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [step, setStep] = useState(1) // 1: Welcome/Info, 2: Change Password
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (user?.requirePasswordChange) {
            setIsOpen(true)
        }
    }, [user])

    const validatePassword = (pass) => {
        return {
            length: pass.length >= 8,
            number: /[0-9]/.test(pass),
            special: /[^A-Za-z0-9]/.test(pass),
            capital: /[A-Z]/.test(pass)
        }
    }

    const requirements = validatePassword(newPassword)
    const isAllValid = Object.values(requirements).every(Boolean) && newPassword === confirmPassword

    const handleUpdate = async (e) => {
        e.preventDefault()
        if (!isAllValid) return

        setLoading(true)
        try {
            const response = await axios.post('/api/auth/update-password', {
                currentPassword,
                newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.data.success) {
                toast.success('Password updated successfully!')
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#6366f1', '#10b981', '#f59e0b']
                })
                setIsOpen(false)
                // Refresh user data to clear the flag
                window.location.reload()
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update password')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20"
                >
                    {/* Header Gradient */}
                    <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                    <div className="p-8">
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.div
                                    key="step1"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                                        <FiShield className="w-8 h-8" />
                                    </div>

                                    <div>
                                        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome to Online Planet!</h2>
                                        <p className="text-slate-500 mt-2 text-lg">Your account has been approved. To keep your store secure, please update your temporary password.</p>
                                    </div>

                                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-4">
                                        <FiAlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-semibold text-amber-900">Security Requirement</p>
                                            <p className="text-sm text-amber-700 mt-1">For your protection, you must change the temporary password provided in your approval email before proceeding.</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setStep(2)}
                                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 group transition-all hover:bg-slate-800"
                                    >
                                        Secure My Account
                                        <motion.span
                                            animate={{ x: [0, 4, 0] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                        >
                                            →
                                        </motion.span>
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="step2"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <h2 className="text-2xl font-semibold text-slate-900">Update Password</h2>
                                        <p className="text-slate-500 mt-1">Choose a strong password for your seller portal.</p>
                                    </div>

                                    <form onSubmit={handleUpdate} className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Current Temporary Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showCurrent ? 'text' : 'password'}
                                                    required
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all pr-12"
                                                    placeholder="Paste password from email"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrent(!showCurrent)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                >
                                                    {showCurrent ? <FiEyeOff /> : <FiEye />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">New Secure Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showNew ? 'text' : 'password'}
                                                    required
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all pr-12"
                                                    placeholder="Create a strong password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNew(!showNew)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                >
                                                    {showNew ? <FiEyeOff /> : <FiEye />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Confirm New Password</label>
                                            <input
                                                type="password"
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${confirmPassword && newPassword !== confirmPassword ? 'border-rose-300' : 'border-slate-200'
                                                    }`}
                                                placeholder="Repeat new password"
                                            />
                                        </div>

                                        {/* Requirements Visualizer */}
                                        <div className="grid grid-cols-2 gap-2 mt-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <RequirementItem label="8+ Characters" valid={requirements.length} />
                                            <RequirementItem label="One Number" valid={requirements.number} />
                                            <RequirementItem label="Special Char" valid={requirements.special} />
                                            <RequirementItem label="Capital Letter" valid={requirements.capital} />
                                        </div>

                                        <div className="flex gap-3 mt-8">
                                            <button
                                                type="button"
                                                onClick={() => setStep(1)}
                                                className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-semibold transition-all hover:bg-slate-200"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading || !isAllValid}
                                                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-semibold transition-all hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {loading ? 'Updating...' : 'Update & Proceed'}
                                                {!loading && <FiCheck />}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

function RequirementItem({ label, valid }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${valid ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                <FiCheck className="w-2.5 h-2.5" />
            </div>
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${valid ? 'text-emerald-700' : 'text-slate-400'}`}>
                {label}
            </span>
        </div>
    )
}
