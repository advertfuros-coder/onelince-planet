'use client'

import { useState } from 'react'
import { Check, Zap, TrendingUp, Shield, Crown, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

const PRICING_TIERS = [
    {
        id: 'free',
        name: 'Free',
        tagline: 'Perfect for getting started',
        price: 0,
        icon: Sparkles,
        color: 'gray',
        gradient: 'from-gray-400 to-gray-600',
        features: [
            { text: '50 Products', included: true },
            { text: '1 Warehouse', included: true },
            { text: '5 Images per Product', included: true },
            { text: 'Basic Analytics', included: true },
            { text: 'Email Support', included: true },
            { text: 'Bulk Upload', included: false },
            { text: 'API Access', included: false },
            { text: 'Priority Support', included: false },
        ],
        limits: {
            products: 50,
            warehouses: 1,
            images: 5,
        },
    },
    {
        id: 'starter',
        name: 'Starter',
        tagline: 'For growing businesses',
        price: 999,
        icon: Zap,
        color: 'blue',
        gradient: 'from-blue-500 to-indigo-600',
        popular: true,
        features: [
            { text: '500 Products', included: true },
            { text: '2 Warehouses', included: true },
            { text: '10 Images per Product', included: true },
            { text: 'Advanced Analytics', included: true },
            { text: 'Bulk Upload Tool', included: true },
            { text: '2 Featured Listings', included: true },
            { text: 'Email Marketing', included: true },
            { text: 'Priority Email Support', included: true },
            { text: 'API Access', included: false },
        ],
        limits: {
            products: 500,
            warehouses: 2,
            images: 10,
        },
    },
    {
        id: 'professional',
        name: 'Professional',
        tagline: 'For established sellers',
        price: 2999,
        icon: TrendingUp,
        color: 'purple',
        gradient: 'from-purple-500 to-pink-600',
        features: [
            { text: '5,000 Products', included: true },
            { text: '5 Warehouses', included: true },
            { text: '20 Images per Product', included: true },
            { text: 'Advanced Analytics + Custom Reports', included: true },
            { text: 'Full API Access', included: true },
            { text: '10 Featured Listings', included: true },
            { text: 'Automated Pricing Rules', included: true },
            { text: 'Competitor Tracking', included: true },
            { text: 'Priority Support (24/7)', included: true },
        ],
        limits: {
            products: 5000,
            warehouses: 5,
            images: 20,
        },
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        tagline: 'For large-scale operations',
        price: 9999,
        icon: Crown,
        color: 'amber',
        gradient: 'from-amber-500 to-orange-600',
        features: [
            { text: 'Unlimited Products', included: true },
            { text: 'Unlimited Warehouses', included: true },
            { text: 'Unlimited Images', included: true },
            { text: 'Custom Analytics Dashboard', included: true },
            { text: 'Full API Access + Webhooks', included: true },
            { text: 'Unlimited Featured Listings', included: true },
            { text: 'White-Label Solution', included: true },
            { text: 'Dedicated Account Manager', included: true },
            { text: 'Custom Integrations', included: true },
            { text: '24/7 Phone + Email Support', included: true },
        ],
        limits: {
            products: -1,
            warehouses: -1,
            images: -1,
        },
    },
]

export default function PricingTiers({ currentTier = 'free', onSelectPlan }) {
    const [billingInterval, setBillingInterval] = useState('monthly')

    const getDiscountedPrice = (price) => {
        if (price === 0) return 0
        if (billingInterval === 'quarterly') return Math.round(price * 0.9)
        if (billingInterval === 'yearly') return Math.round(price * 0.8)
        return price
    }

    const getDiscountBadge = () => {
        if (billingInterval === 'quarterly') return 'Save 10%'
        if (billingInterval === 'yearly') return 'Save 20%'
        return null
    }

    return (
        <div className="space-y-8">
            {/* Billing Toggle */}
            <div className="flex justify-center">
                <div className="inline-flex items-center gap-4 p-2 bg-gray-100 rounded-2xl">
                    {['monthly', 'quarterly', 'yearly'].map((interval) => (
                        <button
                            key={interval}
                            onClick={() => setBillingInterval(interval)}
                            className={`relative px-6 py-3 rounded-xl font-bold text-sm transition-all ${billingInterval === interval
                                    ? 'bg-white text-gray-900 shadow-lg'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {interval.charAt(0).toUpperCase() + interval.slice(1)}
                            {interval !== 'monthly' && (
                                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-white text-[9px] font-black rounded-full">
                                    {interval === 'quarterly' ? '-10%' : '-20%'}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {PRICING_TIERS.map((tier, index) => {
                    const Icon = tier.icon
                    const discountedPrice = getDiscountedPrice(tier.price)
                    const isCurrentPlan = currentTier === tier.id

                    return (
                        <motion.div
                            key={tier.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative rounded-3xl p-8 ${tier.popular
                                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-2xl scale-105'
                                    : 'bg-white border border-gray-200 shadow-lg'
                                }`}
                        >
                            {/* Popular Badge */}
                            {tier.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <div className="px-4 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black uppercase tracking-wider rounded-full shadow-lg">
                                        Most Popular
                                    </div>
                                </div>
                            )}

                            {/* Current Plan Badge */}
                            {isCurrentPlan && (
                                <div className="absolute top-4 right-4">
                                    <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-black uppercase rounded-full">
                                        Current
                                    </div>
                                </div>
                            )}

                            {/* Icon */}
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                                <Icon className="text-white" size={28} />
                            </div>

                            {/* Tier Name */}
                            <h3 className="text-2xl font-black text-gray-900 mb-1">{tier.name}</h3>
                            <p className="text-sm text-gray-500 font-medium mb-6">{tier.tagline}</p>

                            {/* Price */}
                            <div className="mb-6">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-gray-900">
                                        ₹{discountedPrice.toLocaleString()}
                                    </span>
                                    <span className="text-gray-500 font-medium">
                                        /{billingInterval === 'monthly' ? 'mo' : billingInterval === 'quarterly' ? 'qtr' : 'yr'}
                                    </span>
                                </div>
                                {tier.price > 0 && discountedPrice < tier.price && (
                                    <div className="mt-1">
                                        <span className="text-sm text-gray-400 line-through">
                                            ₹{tier.price.toLocaleString()}
                                        </span>
                                        <span className="ml-2 text-sm text-green-600 font-bold">
                                            {getDiscountBadge()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* CTA Button */}
                            <button
                                onClick={() => !isCurrentPlan && onSelectPlan(tier.id, billingInterval)}
                                disabled={isCurrentPlan}
                                className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all mb-6 ${isCurrentPlan
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : tier.popular
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-xl hover:scale-105'
                                            : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg'
                                    }`}
                            >
                                {isCurrentPlan ? 'Current Plan' : tier.price === 0 ? 'Get Started' : 'Upgrade Now'}
                            </button>

                            {/* Features */}
                            <div className="space-y-3">
                                {tier.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        {feature.included ? (
                                            <Check size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                                        ) : (
                                            <div className="w-[18px] h-[18px] rounded-full bg-gray-200 mt-0.5 flex-shrink-0" />
                                        )}
                                        <span className={`text-sm font-medium ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                                            {feature.text}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Limits Summary */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                                    Plan Limits
                                </div>
                                <div className="space-y-1 text-sm text-gray-600">
                                    <div>Products: <strong>{tier.limits.products === -1 ? 'Unlimited' : tier.limits.products}</strong></div>
                                    <div>Warehouses: <strong>{tier.limits.warehouses === -1 ? 'Unlimited' : tier.limits.warehouses}</strong></div>
                                    <div>Images: <strong>{tier.limits.images === -1 ? 'Unlimited' : tier.limits.images}</strong></div>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* FAQ Section */}
            <div className="mt-16 text-center">
                <h3 className="text-2xl font-black text-gray-900 mb-4">Frequently Asked Questions</h3>
                <div className="max-w-3xl mx-auto space-y-4 text-left">
                    <FAQItem
                        question="Can I change my plan anytime?"
                        answer="Yes! You can upgrade or downgrade your plan at any time. Upgrades are prorated, so you only pay for the remaining days of your billing cycle."
                    />
                    <FAQItem
                        question="What payment methods do you accept?"
                        answer="We accept all major credit/debit cards, UPI, net banking, and digital wallets through Razorpay's secure payment gateway."
                    />
                    <FAQItem
                        question="Is there a free trial?"
                        answer="The Free plan is available forever with no credit card required. You can upgrade to a paid plan whenever you're ready to scale."
                    />
                    <FAQItem
                        question="What happens if I exceed my limits?"
                        answer="We'll notify you when you're approaching your limits. You can upgrade to a higher tier or purchase add-ons to increase specific limits."
                    />
                </div>
            </div>
        </div>
    )
}

function FAQItem({ question, answer }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between text-left"
            >
                <span className="font-bold text-gray-900">{question}</span>
                <span className="text-gray-400">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && (
                <p className="mt-3 text-gray-600 text-sm leading-relaxed">{answer}</p>
            )}
        </div>
    )
}
