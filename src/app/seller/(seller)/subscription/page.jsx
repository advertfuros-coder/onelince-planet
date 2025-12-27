'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
    Check,
    X,
    Crown,
    Zap,
    Rocket,
    Gem,
    Loader2,
    Sparkles,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'

export default function SubscriptionPage() {
    const { token } = useAuth()
    const [plans, setPlans] = useState([])
    const [currentTier, setCurrentTier] = useState('free')
    const [loading, setLoading] = useState(true)
    const [processingPlanId, setProcessingPlanId] = useState(null) // Track which plan is being processed

    useEffect(() => {
        if (token) {
            fetchPlans()
            fetchCurrentSubscription()
        }
    }, [token])

    // Fetch admin-configured plans
    async function fetchPlans() {
        try {
            const res = await axios.get('/api/seller/subscription/plans')
            if (res.data.success) {
                setPlans(res.data.plans)
            }
        } catch (error) {
            console.error('Error fetching plans:', error)
            toast.error('Failed to load subscription plans')
        }
    }

    // Fetch current subscription
    async function fetchCurrentSubscription() {
        try {
            setLoading(true)
            const res = await axios.get('/api/seller/subscription', {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.data.success) {
                setCurrentTier(res.data.subscription?.tier || 'free')
            }
        } catch (error) {
            console.error('Error fetching subscription:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }

    async function handleUpgrade(planId, billingInterval = 'monthly') {
        // PROTECTION 1: Check if already processing
        if (processingPlanId) {
            toast.error('Please wait, processing your previous request...')
            return
        }

        // PROTECTION 2: Check if same as current plan
        if (planId === currentTier) {
            toast.error('You are already on this plan')
            return
        }

        const plan = plans.find((p) => p.name === planId)
        if (!plan) return

        // If free plan, no payment needed
        if (plan.pricing.monthly === 0) {
            toast.error('Cannot upgrade to free plan')
            return
        }

        // PROTECTION 3: Set processing state to disable button
        setProcessingPlanId(planId)

        const loadingToast = toast.loading('Initiating upgrade...')

        try {
            // Create order
            const res = await axios.post(
                '/api/seller/subscription/create-order',
                { tier: planId, billingInterval },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            toast.dismiss(loadingToast)

            if (res.data.success) {
                // Load Razorpay
                const isLoaded = await loadRazorpay()
                if (!isLoaded) {
                    toast.error('Failed to load payment gateway')
                    setProcessingPlanId(null) // Reset on error
                    return
                }

                const options = {
                    key: res.data.razorpayKeyId,
                    amount: res.data.order.amount,
                    currency: res.data.order.currency,
                    name: 'Online Planet',
                    description: `Upgrade to ${plan.displayName}`,
                    order_id: res.data.order.id,
                    handler: async function (response) {
                        // INSTANT ACTIVATION - Don't wait for webhook
                        const activationToast = toast.loading('Activating your plan...')
                        
                        try {
                            // Call instant activation API
                            const activationRes = await axios.post(
                                '/api/seller/subscription/activate',
                                {
                                    tier: planId,
                                    billingInterval,
                                    paymentId: response.razorpay_payment_id,
                                    orderId: response.razorpay_order_id,
                                },
                                { headers: { Authorization: `Bearer ${token}` } }
                            )

                            toast.dismiss(activationToast)

                            if (activationRes.data.success) {
                                toast.success(`🎉 ${plan.displayName} plan activated!`)
                                console.log(`✅ Activated in ${activationRes.data.activationTime}ms`)
                                
                                // Reload page to show new plan
                                setTimeout(() => {
                                    window.location.reload()
                                }, 1500)
                            } else {
                                toast.error('Activation failed. Please contact support.')
                                setProcessingPlanId(null)
                            }
                        } catch (error) {
                            toast.dismiss(activationToast)
                            toast.error('Activation failed. Please refresh the page.')
                            console.error('Activation error:', error)
                            setProcessingPlanId(null)
                        }
                    },
                    modal: {
                        ondismiss: function () {
                            // PROTECTION 4: Reset if user closes modal
                            setProcessingPlanId(null)
                            toast.error('Payment cancelled')
                        },
                    },
                    prefill: {
                        name: '',
                        email: '',
                    },
                    theme: {
                        color: plan.color || '#667eea',
                    },
                }

                const rzp = new window.Razorpay(options)

                // PROTECTION 5: Reset if payment fails
                rzp.on('payment.failed', function (response) {
                    setProcessingPlanId(null)
                    toast.error('Payment failed. Please try again.')
                })

                rzp.open()
            } else {
                toast.error(res.data.message || 'Failed to create order')
                setProcessingPlanId(null) // Reset on error
            }
        } catch (error) {
            toast.dismiss(loadingToast)
            toast.error('Upgrade failed')
            console.error('Upgrade error:', error)
            setProcessingPlanId(null) // Reset on error
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-600 font-medium">Loading subscription plans...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mb-4">
                        <Crown size={16} />
                        Subscription Plans
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 mb-4">
                        Choose Your Plan
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Select the perfect plan for your business needs. Upgrade or downgrade anytime.
                    </p>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    {plans.map((plan, index) => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            index={index}
                            currentTier={currentTier}
                            processingPlanId={processingPlanId}
                            onUpgrade={handleUpgrade}
                        />
                    ))}
                </div>

                {/* Features Comparison Table */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
                    <h2 className="text-3xl font-black text-gray-900 mb-8 text-center">
                        Compare Plans
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-200">
                                    <th className="text-left py-4 px-6 font-black text-gray-900">
                                        Feature
                                    </th>
                                    {plans.map((plan) => (
                                        <th
                                            key={plan.id}
                                            className="text-center py-4 px-6 font-black text-gray-900"
                                        >
                                            {plan.displayName}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <ComparisonRow
                                    label="Products"
                                    plans={plans}
                                    getValue={(p) =>
                                        p.features.maxProducts === -1
                                            ? 'Unlimited'
                                            : p.features.maxProducts
                                    }
                                />
                                <ComparisonRow
                                    label="Warehouses"
                                    plans={plans}
                                    getValue={(p) =>
                                        p.features.maxWarehouses === -1
                                            ? 'Unlimited'
                                            : p.features.maxWarehouses
                                    }
                                />
                                <ComparisonRow
                                    label="Images per Product"
                                    plans={plans}
                                    getValue={(p) =>
                                        p.features.maxImages === -1 ? 'Unlimited' : p.features.maxImages
                                    }
                                />
                                <ComparisonRow
                                    label="Bulk Upload"
                                    plans={plans}
                                    getValue={(p) => p.features.bulkUpload}
                                    isBoolean
                                />
                                <ComparisonRow
                                    label="Advanced Analytics"
                                    plans={plans}
                                    getValue={(p) => p.features.advancedAnalytics}
                                    isBoolean
                                />
                                <ComparisonRow
                                    label="API Access"
                                    plans={plans}
                                    getValue={(p) => p.features.apiAccess}
                                    isBoolean
                                />
                                <ComparisonRow
                                    label="Priority Support"
                                    plans={plans}
                                    getValue={(p) => p.features.prioritySupport}
                                    isBoolean
                                />
                                <ComparisonRow
                                    label="Dedicated Manager"
                                    plans={plans}
                                    getValue={(p) => p.features.dedicatedManager}
                                    isBoolean
                                />
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

function PlanCard({ plan, index, currentTier, processingPlanId, onUpgrade }) {
    const isCurrentPlan = currentTier === plan.name
    const isFree = plan.pricing.monthly === 0
    const isProcessing = processingPlanId === plan.name
    const isAnyProcessing = processingPlanId !== null

    // Icon mapping
    const iconMap = {
        '🌱': Sparkles,
        '🚀': Rocket,
        '💎': Gem,
        '👑': Crown,
    }
    const Icon = iconMap[plan.icon] || Zap

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative bg-white rounded-3xl p-8 shadow-lg border-2 transition-all hover:shadow-2xl ${plan.isPopular
                ? 'border-blue-500 scale-105'
                : isCurrentPlan
                    ? 'border-green-500'
                    : 'border-gray-200'
                }`}
        >
            {/* Popular Badge */}
            {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="px-4 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black uppercase rounded-full shadow-lg">
                        Most Popular
                    </div>
                </div>
            )}

            {/* Current Plan Badge */}
            {isCurrentPlan && (
                <div className="absolute top-4 right-4">
                    <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-black uppercase rounded-full">
                        Current Plan
                    </div>
                </div>
            )}

            {/* Icon */}
            <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                style={{ backgroundColor: plan.color + '20' }}
            >
                <span className="text-4xl">{plan.icon}</span>
            </div>

            {/* Plan Name */}
            <h3 className="text-2xl font-black text-gray-900 mb-2">
                {plan.displayName}
            </h3>
            <p className="text-sm text-gray-600 mb-6">{plan.tagline || plan.description}</p>

            {/* Price */}
            <div className="mb-6">
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-gray-900">
                        ₹{plan.pricing.monthly.toLocaleString()}
                    </span>
                    <span className="text-gray-500 font-medium">/month</span>
                </div>
                {plan.discounts.yearly > 0 && (
                    <p className="text-sm text-green-600 font-bold mt-1">
                        Save {plan.discounts.yearly}% with yearly billing
                    </p>
                )}
            </div>

            {/* CTA Button */}
            <button
                onClick={() => !isCurrentPlan && !isFree && !isAnyProcessing && onUpgrade(plan.name)}
                disabled={isCurrentPlan || isFree || isAnyProcessing}
                className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all mb-6 flex items-center justify-center gap-2 ${isCurrentPlan
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isFree
                        ? 'bg-gray-100 text-gray-600 cursor-default'
                        : isProcessing
                            ? 'bg-blue-400 text-white cursor-wait'
                            : isAnyProcessing
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : plan.isPopular
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl hover:scale-105'
                                    : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg'
                    }`}
            >
                {isProcessing ? (
                    <>
                        <Loader2 className="animate-spin" size={18} />
                        Processing...
                    </>
                ) : isCurrentPlan ? (
                    'Current Plan'
                ) : isFree ? (
                    'Free Forever'
                ) : isAnyProcessing ? (
                    'Please Wait...'
                ) : (
                    'Upgrade Now'
                )}
            </button>

            {/* Features */}
            <div className="space-y-3">
                <p className="text-xs font-black text-gray-400 uppercase tracking-wider">
                    Includes:
                </p>
                <FeatureItem
                    text={`${plan.features.maxProducts === -1 ? 'Unlimited' : plan.features.maxProducts} Products`}
                    included={true}
                />
                <FeatureItem
                    text={`${plan.features.maxWarehouses === -1 ? 'Unlimited' : plan.features.maxWarehouses} Warehouses`}
                    included={true}
                />
                <FeatureItem
                    text={`${plan.features.maxImages === -1 ? 'Unlimited' : plan.features.maxImages} Images/Product`}
                    included={true}
                />
                <FeatureItem text="Bulk Upload" included={plan.features.bulkUpload} />
                <FeatureItem
                    text="Advanced Analytics"
                    included={plan.features.advancedAnalytics}
                />
                <FeatureItem text="API Access" included={plan.features.apiAccess} />
                <FeatureItem
                    text="Priority Support"
                    included={plan.features.prioritySupport}
                />
                {plan.features.dedicatedManager && (
                    <FeatureItem text="Dedicated Manager" included={true} />
                )}
            </div>
        </motion.div>
    )
}

function FeatureItem({ text, included }) {
    return (
        <div className="flex items-center gap-3">
            {included ? (
                <Check size={18} className="text-green-500 flex-shrink-0" />
            ) : (
                <X size={18} className="text-gray-300 flex-shrink-0" />
            )}
            <span
                className={`text-sm font-medium ${included ? 'text-gray-700' : 'text-gray-400'
                    }`}
            >
                {text}
            </span>
        </div>
    )
}

function ComparisonRow({ label, plans, getValue, isBoolean = false }) {
    return (
        <tr className="border-b border-gray-100 hover:bg-gray-50">
            <td className="py-4 px-6 font-bold text-gray-700">{label}</td>
            {plans.map((plan) => {
                const value = getValue(plan)
                return (
                    <td key={plan.id} className="py-4 px-6 text-center">
                        {isBoolean ? (
                            value ? (
                                <Check size={20} className="inline text-green-500" />
                            ) : (
                                <X size={20} className="inline text-gray-300" />
                            )
                        ) : (
                            <span className="font-bold text-gray-900">{value}</span>
                        )}
                    </td>
                )
            })}
        </tr>
    )
}
