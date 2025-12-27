'use client'

import { useState, useEffect } from 'react'
import { X, Check, Zap, TrendingUp, AlertCircle, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

export default function UpgradeModal({ isOpen, onClose, selectedTier, billingInterval, currentTier, token }) {
    const [loading, setLoading] = useState(false)
    const [orderData, setOrderData] = useState(null)

    useEffect(() => {
        if (isOpen && selectedTier) {
            createOrder()
        }
    }, [isOpen, selectedTier, billingInterval])

    const createOrder = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/seller/subscription/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    tier: selectedTier,
                    billingInterval,
                }),
            })

            const data = await res.json()
            if (data.success) {
                setOrderData(data.order)
            } else {
                toast.error(data.message || 'Failed to create order')
                onClose()
            }
        } catch (error) {
            console.error('Order creation error:', error)
            toast.error('Failed to create order')
            onClose()
        } finally {
            setLoading(false)
        }
    }

    const handlePayment = async () => {
        if (!orderData) return

        const options = {
            key: orderData.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'Online Planet',
            description: `${orderData.tierName} Plan - ${billingInterval}`,
            order_id: orderData.id,
            handler: async function (response) {
                console.log('✅ Payment successful:', response)

                // Show success message
                toast.success('Payment successful! Activating your plan...', {
                    duration: 3000,
                    icon: '🎉',
                })

                // Wait a moment for webhook to process
                setTimeout(() => {
                    window.location.reload() // Reload to show new plan
                }, 2000)
            },
            prefill: {
                name: '',
                email: '',
                contact: '',
            },
            theme: {
                color: '#667eea',
            },
            modal: {
                ondismiss: function () {
                    console.log('Payment cancelled')
                    toast.error('Payment cancelled')
                },
            },
        }

        const razorpay = new window.Razorpay(options)
        razorpay.open()
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
                    >
                        <X size={24} className="text-gray-500" />
                    </button>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
                            <p className="text-gray-600 font-medium">Preparing your upgrade...</p>
                        </div>
                    ) : orderData ? (
                        <div className="p-8 md:p-12">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mb-4">
                                    <Zap className="text-white" size={32} />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 mb-2">
                                    Upgrade to {orderData.tierName}
                                </h2>
                                <p className="text-gray-600">
                                    Unlock powerful features and grow your business
                                </p>
                            </div>

                            {/* Comparison */}
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                {/* Current Plan */}
                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                                    <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">
                                        Current Plan
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 mb-4 capitalize">
                                        {currentTier}
                                    </h3>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div>Limited features</div>
                                        <div>Basic support</div>
                                        <div>Standard limits</div>
                                    </div>
                                </div>

                                {/* New Plan */}
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full -mr-16 -mt-16" />
                                    <div className="relative">
                                        <div className="text-xs font-black text-blue-600 uppercase tracking-wider mb-3">
                                            New Plan
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 mb-4">
                                            {orderData.tierName}
                                        </h3>
                                        <div className="space-y-2 text-sm text-gray-700">
                                            {Object.entries(orderData.features).slice(0, 3).map(([key, value]) => (
                                                <div key={key} className="flex items-center gap-2">
                                                    <Check size={16} className="text-green-500" />
                                                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}: {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Breakdown */}
                            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                                <h3 className="font-black text-gray-900 mb-4">Pricing Breakdown</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Plan Price ({billingInterval})</span>
                                        <span className="font-bold text-gray-900">₹{(orderData.originalAmount / 100).toLocaleString()}</span>
                                    </div>

                                    {orderData.discount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-600">Discount ({orderData.discount}%)</span>
                                            <span className="font-bold text-green-600">
                                                -₹{((orderData.originalAmount - orderData.amount) / 100).toLocaleString()}
                                            </span>
                                        </div>
                                    )}

                                    {orderData.proratedDays > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-blue-600">Prorated ({orderData.proratedDays} days)</span>
                                            <span className="font-bold text-blue-600">
                                                ₹{(orderData.proratedAmount / 100).toLocaleString()}
                                            </span>
                                        </div>
                                    )}

                                    <div className="border-t border-gray-200 pt-3 flex justify-between">
                                        <span className="font-black text-gray-900">Total Due Today</span>
                                        <span className="text-2xl font-black text-gray-900">
                                            ₹{(orderData.proratedAmount / 100).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Info Alert */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex gap-3">
                                <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-900">
                                    <p className="font-bold mb-1">Instant Activation</p>
                                    <p>Your new plan will be activated immediately after payment. All features will be unlocked within 2 seconds!</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-4 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePayment}
                                    className="flex-1 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                                >
                                    <Zap size={20} />
                                    Proceed to Payment
                                </button>
                            </div>

                            {/* Trust Badges */}
                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <div className="flex items-center justify-center gap-8 text-xs text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <Check size={16} className="text-green-500" />
                                        <span>Secure Payment</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Check size={16} className="text-green-500" />
                                        <span>Instant Activation</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Check size={16} className="text-green-500" />
                                        <span>24h Money Back</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
