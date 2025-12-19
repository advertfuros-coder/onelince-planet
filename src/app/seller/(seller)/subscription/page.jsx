// app/seller/(seller)/subscription/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
    FiCheck,
    FiX,
    FiCrown,
    FiTrendingUp,
    FiZap,
    FiStar,
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'

const tiers = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        description: 'Perfect for getting started',
        features: [
            { name: '50 Products', included: true },
            { name: '5 Images per product', included: true },
            { name: '1 Warehouse', included: true },
            { name: 'Basic Analytics', included: true },
            { name: 'Bulk Upload', included: false },
            { name: 'Advanced Analytics', included: false },
            { name: 'API Access', included: false },
            { name: 'Priority Support', included: false },
        ],
        color: 'gray',
        popular: false
    },
    {
        id: 'starter',
        name: 'Starter',
        price: 999,
        description: 'For growing businesses',
        features: [
            { name: '500 Products', included: true },
            { name: '10 Images per product', included: true },
            { name: '2 Warehouses', included: true },
            { name: '5 Pricing Rules', included: true },
            { name: 'Bulk Upload', included: true },
            { name: 'Advanced Analytics', included: true },
            { name: 'Multi-Warehouse', included: true },
            { name: 'Email Marketing', included: true },
            { name: 'API Access', included: false },
            { name: 'Priority Support', included: false },
        ],
        color: 'blue',
        popular: true
    },
    {
        id: 'professional',
        name: 'Professional',
        price: 2999,
        description: 'For established sellers',
        features: [
            { name: '5,000 Products', included: true },
            { name: '20 Images per product', included: true },
            { name: '5 Warehouses', included: true },
            { name: '20 Pricing Rules', included: true },
            { name: 'Bulk Upload', included: true },
            { name: 'Advanced Analytics', included: true },
            { name: 'API Access', included: true },
            { name: 'Priority Support', included: true },
            { name: 'Competitor Tracking', included: true },
            { name: 'Custom Reports', included: true },
        ],
        color: 'purple',
        popular: false
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 9999,
        description: 'For large-scale operations',
        features: [
            { name: 'Unlimited Products', included: true },
            { name: 'Unlimited Images', included: true },
            { name: 'Unlimited Warehouses', included: true },
            { name: 'Unlimited Pricing Rules', included: true },
            { name: 'All Professional Features', included: true },
            { name: 'White Label', included: true },
            { name: 'Dedicated Manager', included: true },
            { name: 'Custom Integration', included: true },
            { name: '24/7 Phone Support', included: true },
            { name: 'SLA Guarantee', included: true },
        ],
        color: 'gold',
        popular: false
    }
]

export default function SubscriptionPage() {
    const { token } = useAuth()
    const [currentTier, setCurrentTier] = useState('free')
    const [usage, setUsage] = useState({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (token) fetchSubscription()
    }, [token])

    async function fetchSubscription() {
        try {
            setLoading(true)
            const res = await axios.get('/api/seller/subscription', {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.data.success) {
                setCurrentTier(res.data.subscription?.tier || 'free')
                setUsage(res.data.subscription?.usage || {})
            }
        } catch (error) {
            console.error('Error fetching subscription:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleUpgrade(tierId) {
        if (tierId === currentTier) {
            toast.error('You are already on this plan')
            return
        }

        try {
            const res = await axios.post(
                '/api/seller/subscription/upgrade',
                { tier: tierId },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            if (res.data.success) {
                toast.success('Subscription upgraded successfully!')
                fetchSubscription()
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upgrade')
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl shadow-lg p-8 text-white">
                <div className="max-w-3xl">
                    <div className="flex items-center space-x-3 mb-4">
                        <FiTrendingUp className="w-10 h-10" />
                        <h1 className="text-4xl font-bold">Subscription Plans</h1>
                    </div>
                    <p className="text-xl text-purple-100">
                        Choose the perfect plan to grow your business
                    </p>
                    <p className="mt-2 text-purple-200">
                        Currently on: <span className="font-bold text-white">{tiers.find(t => t.id === currentTier)?.name}</span> Plan
                    </p>
                </div>
            </div>

            {/* Current Usage */}
            {currentTier !== 'free' && (
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Current Usage</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <UsageCard
                            label="Products"
                            current={usage.productsListed || 0}
                            limit={tiers.find(t => t.id === currentTier)?.features.find(f => f.name.includes('Products'))?.name.split(' ')[0] || 'Unlimited'}
                        />
                        <UsageCard
                            label="Warehouses"
                            current={usage.warehousesCreated || 0}
                            limit={tiers.find(t => t.id === currentTier)?.features.find(f => f.name.includes('Warehouses'))?.name.split(' ')[0] || 'Unlimited'}
                        />
                        <UsageCard
                            label="Pricing Rules"
                            current={usage.pricingRulesActive || 0}
                            limit={tiers.find(t => t.id === currentTier)?.features.find(f => f.name.includes('Pricing'))?.name.split(' ')[0] || 'Unlimited'}
                        />
                        <UsageCard
                            label="API Calls"
                            current={usage.apiCallsThisMonth || 0}
                            limit="Unlimited"
                        />
                    </div>
                </div>
            )}

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {tiers.map((tier) => (
                    <PricingCard
                        key={tier.id}
                        tier={tier}
                        currentTier={currentTier}
                        onUpgrade={handleUpgrade}
                    />
                ))}
            </div>

            {/* Features Comparison */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b">
                    <h2 className="text-xl font-bold text-gray-900">Feature Comparison</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Feature</th>
                                {tiers.map(tier => (
                                    <th key={tier.id} className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                                        {tier.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {['Products', 'Images', 'Warehouses', 'Pricing Rules', 'Bulk Upload', 'Advanced Analytics', 'API Access', 'Priority Support'].map((feature, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{feature}</td>
                                    {tiers.map(tier => {
                                        const tierFeature = tier.features.find(f => f.name.includes(feature))
                                        return (
                                            <td key={tier.id} className="px-6 py-4 text-center">
                                                {tierFeature?.included ? (
                                                    <FiCheck className="w-5 h-5 text-green-600 mx-auto" />
                                                ) : (
                                                    <FiX className="w-5 h-5 text-gray-300 mx-auto" />
                                                )}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* FAQ */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    <FAQItem
                        question="Can I upgrade or downgrade anytime?"
                        answer="Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
                    />
                    <FAQItem
                        question="What happens if I exceed my limits?"
                        answer="You'll be notified when approaching limits. You can upgrade to continue or manage your resources."
                    />
                    <FAQItem
                        question="Is there a free trial?"
                        answer="All paid plans come with a 14-day free trial. No credit card required to start."
                    />
                    <FAQItem
                        question="Do you offer refunds?"
                        answer="Yes, we offer a 30-day money-back guarantee on all paid plans."
                    />
                </div>
            </div>
        </div>
    )
}

function PricingCard({ tier, currentTier, onUpgrade }) {
    const isCurrentPlan = tier.id === currentTier

    const colorClasses = {
        gray: 'from-gray-600 to-gray-700',
        blue: 'from-blue-600 to-blue-700',
        purple: 'from-purple-600 to-purple-700',
        gold: 'from-yellow-600 to-orange-600'
    }

    return (
        <div className={`bg-white rounded-xl shadow-lg border-2 ${tier.popular ? 'border-purple-600 scale-105' : 'border-gray-200'
            } overflow-hidden transition-all hover:shadow-xl`}>
            {tier.popular && (
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-2 text-sm font-semibold">
                    ⭐ Most Popular
                </div>
            )}

            <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <p className="text-gray-600 mb-4">{tier.description}</p>

                <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">₹{tier.price.toLocaleString()}</span>
                    <span className="text-gray-600">/month</span>
                </div>

                <button
                    onClick={() => onUpgrade(tier.id)}
                    disabled={isCurrentPlan}
                    className={`w-full py-3 rounded-lg font-semibold transition-all ${isCurrentPlan
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : `bg-gradient-to-r ${colorClasses[tier.color]} text-white hover:shadow-lg`
                        }`}
                >
                    {isCurrentPlan ? 'Current Plan' : 'Upgrade Now'}
                </button>

                <ul className="mt-6 space-y-3">
                    {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                            {feature.included ? (
                                <FiCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            ) : (
                                <FiX className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                            )}
                            <span className={`text-sm ${feature.included ? 'text-gray-900' : 'text-gray-400'}`}>
                                {feature.name}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

function UsageCard({ label, current, limit }) {
    const percentage = limit === 'Unlimited' ? 0 : (current / parseInt(limit)) * 100

    return (
        <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">
                {current} <span className="text-sm text-gray-500">/ {limit}</span>
            </p>
            {limit !== 'Unlimited' && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full ${percentage > 80 ? 'bg-red-500' : percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                </div>
            )}
        </div>
    )
}

function FAQItem({ question, answer }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="bg-white rounded-lg p-4 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">{question}</h4>
                <span className="text-gray-400">{isOpen ? '−' : '+'}</span>
            </div>
            {isOpen && (
                <p className="mt-2 text-gray-600 text-sm">{answer}</p>
            )}
        </div>
    )
}
