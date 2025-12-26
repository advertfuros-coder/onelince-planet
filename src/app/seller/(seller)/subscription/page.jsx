// app/seller/(seller)/subscription/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
    Check,
    X,
    Crown,
    TrendingUp,
    Zap,
    Star,
    Activity,
    Shield,
    Target,
    Activity as ActivityIcon,
    ChevronRight,
    ArrowUpRight,
    Plus,
    Rocket,
    Briefcase,
    Gem,
    Cpu
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

const tiers = [
    {
        id: 'free',
        name: 'Seed',
        price: 0,
        description: 'Perfect for initial deployment',
        features: [
            { name: '50 Node Inventory', included: true },
            { name: '5 Media Slots/Product', included: true },
            { name: '1 Regional Hub', included: true },
            { name: 'Core Telemetry', included: true },
            { name: 'Bulk Injection', included: false },
            { name: 'Neural Analytics', included: false },
            { name: 'API Bridge', included: false },
            { name: 'Priority Link', included: false },
        ],
        icon: Target,
        color: 'gray',
        popular: false
    },
    {
        id: 'starter',
        name: 'Velocity',
        price: 999,
        description: 'Accelerated growth protocol',
        features: [
            { name: '500 Node Inventory', included: true },
            { name: '10 Media Slots/Product', included: true },
            { name: '2 Regional Hubs', included: true },
            { name: '5 Signal Rules', included: true },
            { name: 'Bulk Injection', included: true },
            { name: 'Neural Analytics', included: true },
            { name: 'Multi-Hub Routing', included: true },
            { name: 'Nexus Marketing', included: true },
            { name: 'API Bridge', included: false },
            { name: 'Priority Link', included: false },
        ],
        icon: Rocket,
        color: 'blue',
        popular: true
    },
    {
        id: 'professional',
        name: 'Quantum',
        price: 2999,
        description: 'High-bandwidth operations',
        features: [
            { name: '5,000 Node Inventory', included: true },
            { name: '20 Media Slots/Product', included: true },
            { name: '5 Regional Hubs', included: true },
            { name: '20 Signal Rules', included: true },
            { name: 'Bulk Injection', included: true },
            { name: 'Neural Analytics', included: true },
            { name: 'API Bridge', included: true },
            { name: 'Priority Link', included: true },
            { name: 'Competitor Scrutiny', included: true },
            { name: 'Custom Telemetry', included: true },
        ],
        icon: Cpu,
        color: 'purple',
        popular: false
    },
    {
        id: 'enterprise',
        name: 'Apex',
        price: 9999,
        description: 'Omni-channel dominance',
        features: [
            { name: 'Unlimited Inventory', included: true },
            { name: 'Unlimited Media', included: true },
            { name: 'Unlimited Hubs', included: true },
            { name: 'Unlimited Signals', included: true },
            { name: 'Quantum Tier Access', included: true },
            { name: 'White-Label Protocol', included: true },
            { name: 'Dedicated Archon', included: true },
            { name: 'Custom Interconnect', included: true },
            { name: '24/7 Neural Support', included: true },
            { name: 'SLA Guarantee', included: true },
        ],
        icon: Gem,
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

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script')
            script.src = 'https://checkout.razorpay.com/v1/checkout.js'
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }

    async function handleUpgrade(tierId) {
        if (tierId === currentTier) {
            toast.error('Active Protocol Detected')
            return
        }

        const loadingToast = toast.loading('Initiating Upgrade Protocol...')

        try {
            const res = await axios.post(
                '/api/seller/subscription/upgrade',
                { tier: tierId },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            toast.dismiss(loadingToast)

            if (res.data.success) {
                if (res.data.isPaid) {
                    // Start Razorpay flow
                    const isLoaded = await loadRazorpay()
                    if (!isLoaded) {
                        toast.error('Failed to load payment gateway')
                        return
                    }

                    const options = {
                        key: res.data.key,
                        amount: res.data.order.amount,
                        currency: res.data.order.currency,
                        name: 'Online Planet Marketplace',
                        description: `Upgrade to ${tierId} Tier`,
                        order_id: res.data.order.orderId,
                        handler: async function (response) {
                            const verifyToast = toast.loading('Verifying Payment Pulse...')
                            try {
                                const verifyRes = await axios.post(
                                    '/api/seller/subscription/verify',
                                    {
                                        ...response,
                                        tier: tierId
                                    },
                                    { headers: { Authorization: `Bearer ${token}` } }
                                )

                                toast.dismiss(verifyToast)
                                if (verifyRes.data.success) {
                                    toast.success('System Evolution Complete')
                                    fetchSubscription()
                                } else {
                                    toast.error('Verification Handshake Failed')
                                }
                            } catch (err) {
                                toast.dismiss(verifyToast)
                                toast.error('Signal Interrupted during Verification')
                            }
                        },
                        prefill: {
                            name: 'Seller Name', // Ideally from Auth context
                            email: 'seller@example.com'
                        },
                        theme: {
                            color: '#7C3AED'
                        }
                    }

                    const rzp = new window.Razorpay(options)
                    rzp.open()
                } else {
                    toast.success('System Upgrade Synchronized')
                    fetchSubscription()
                }
            }
        } catch (error) {
            toast.dismiss(loadingToast)
            toast.error('Handshake failed')
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 font-black uppercase tracking-widest text-[9px]">Analyzing Account Matrix...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8">
            <div className="max-w-[1400px] mx-auto space-y-10">

                {/* Header Grid */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-xl shadow-purple-500/20">
                                <Crown size={22} />
                            </div>
                            <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-4 py-1.5 rounded-full border border-purple-100">Membership Portal</span>
                        </div>
                        <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none uppercase">Account Tier Matrix</h1>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[11px] mt-3 flex items-center gap-2">
                            Active Intelligence Protocol: <span className="text-purple-600">{tiers.find(t => t.id === currentTier)?.name} Tier</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-6 bg-white p-6 rounded-[2.8rem] shadow-sm border border-gray-100/50">
                        <div className="text-right">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Billing Cycle</p>
                            <p className="text-lg font-black text-gray-900 leading-none capitalize">Monthly Payout</p>
                        </div>
                        <div className="w-[1px] h-10 bg-gray-100" />
                        <div className="text-center px-4">
                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-2 underline underline-offset-4 decoration-2">Auto-Renew Active</p>
                            <p className="text-lg font-black text-gray-900 leading-none">JAN 24, 2026</p>
                        </div>
                    </div>
                </div>

                {/* Telemetry Usage Panels */}
                {currentTier !== 'free' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <ModernUsagePanel label="Inventory Load" current={usage.productsListed || 0} limit={tiers.find(t => t.id === currentTier)?.features.find(f => f.name.includes('Node'))?.name.split(' ')[0] || '∞'} color="purple" icon={ActivityIcon} />
                        <ModernUsagePanel label="Hub Capacity" current={usage.warehousesCreated || 0} limit={tiers.find(t => t.id === currentTier)?.features.find(f => f.name.includes('Hubs'))?.name.split(' ')[0] || '∞'} color="blue" icon={Shield} />
                        <ModernUsagePanel label="Signal Signals" current={usage.pricingRulesActive || 0} limit={tiers.find(t => t.id === currentTier)?.features.find(f => f.name.includes('Signals'))?.name.split(' ')[0] || '∞'} color="emerald" icon={Zap} />
                        <ModernUsagePanel label="Request Volume" current={usage.apiCallsThisMonth || 0} limit="∞" color="amber" icon={Cpu} />
                    </div>
                )}

                {/* Evolution Matrix (Pricing) */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                    {tiers.map((tier, idx) => (
                        <ModernPricingCard
                            key={tier.id}
                            tier={tier}
                            idx={idx}
                            currentTier={currentTier}
                            onUpgrade={handleUpgrade}
                        />
                    ))}
                </div>

                {/* Comparative Protocol Analysis */}
                <div className="bg-white rounded-[3.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-10 py-8 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Detailed Comparative Analysis</h2>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 underline">Protocol Specification Matching</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield size={16} className="text-indigo-500" />
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Enterprise Verified</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white">
                                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Operation Domain</th>
                                    {tiers.map(t => (
                                        <th key={t.id} className="px-10 py-6 text-center text-[10px] font-black text-gray-900 uppercase tracking-widest">{t.name}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {['Node Inventory', 'Media Compression', 'Regional Hubs', 'Signal Rules', 'Bulk Injection', 'Neural Analytics', 'API Bridge', 'Priority Link'].map((feature, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-10 py-5 text-[11px] font-black text-gray-900 uppercase tracking-tighter">{feature}</td>
                                        {tiers.map(tier => {
                                            const tierFeature = tier.features.find(f => f.name.includes(feature.split(' ')[0]))
                                            return (
                                                <td key={tier.id} className="px-10 py-5 text-center">
                                                    {tierFeature?.included ? (
                                                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600"><Check size={14} /></div>
                                                    ) : (
                                                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-50 text-gray-300"><X size={14} /></div>
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

                {/* FAQ Feed */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FAQPod question="Protocol Scaling latency?" answer="System upgrades are synchronized across all clusters in sub-500ms. No operational downtime detected during transition." />
                    <FAQPod question="Resource Exhaustion?" answer="Approaching node limits triggers emergency signal notifications. Apex tier allows for unlimited volumetric scaling." />
                    <FAQPod question="Encrypted Billing?" answer="All transactions are obfuscated via 256-bit AES protocols and backed by a 30-day integrity guarantee." />
                    <FAQPod question="Cross-Tier Migration?" answer="Data persistence is maintained across all evolution steps. Reverting protocols triggers pro-rated credit attribution." />
                </div>
            </div>
        </div>
    )
}

function ModernPricingCard({ tier, idx, currentTier, onUpgrade }) {
    const isCurrentPlan = tier.id === currentTier
    const Icon = tier.icon

    const colors = {
        gray: 'border-gray-200 text-gray-400',
        blue: 'border-blue-200 text-blue-600',
        purple: 'border-purple-200 text-purple-600',
        gold: 'border-amber-200 text-amber-600'
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={`
                group relative bg-white rounded-[3.5rem] p-8 shadow-sm border transition-all hover:shadow-2xl hover:shadow-indigo-500/5
                ${tier.popular ? 'ring-2 ring-purple-600 ring-offset-4 ring-offset-[#F8FAFC] scale-105 z-10' : 'border-gray-100'}
            `}
        >
            {tier.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-xl">
                    Optimal Path
                </div>
            )}

            <div className={`w-16 h-16 rounded-[1.8rem] bg-gray-50 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 ${colors[tier.color]}`}>
                <Icon size={32} />
            </div>

            <h3 className="text-2xl font-black text-gray-900 tracking-tighter leading-none mb-3 uppercase">{tier.name}</h3>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-8">Evolution Tier {idx + 1}</p>

            <div className="mb-10">
                <div className="flex items-end gap-1">
                    <span className="text-4xl font-black text-gray-900 tracking-tighter">₹{tier.price.toLocaleString()}</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 underline">/Cycle</span>
                </div>
            </div>

            <button
                onClick={() => onUpgrade(tier.id)}
                disabled={isCurrentPlan}
                className={`
                    w-full py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all
                    ${isCurrentPlan
                        ? 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100'
                        : 'bg-gray-900 text-white hover:bg-purple-600 shadow-xl shadow-gray-900/10 hover:shadow-purple-500/20 active:scale-95 group-hover:-translate-y-1'}
                `}
            >
                {isCurrentPlan ? 'Current Operating Tier' : 'Initiate Evolution'}
            </button>

            <div className="mt-10 space-y-4">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2">Core Protocols</p>
                {tier.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-3 px-2">
                        {feature.included ? (
                            <Check size={14} className="text-emerald-500 shrink-0" />
                        ) : (
                            <X size={14} className="text-gray-200 shrink-0" />
                        )}
                        <span className={`text-[10px] font-black uppercase tracking-tighter ${feature.included ? 'text-gray-700' : 'text-gray-300'}`}>
                            {feature.name}
                        </span>
                    </div>
                ))}
            </div>

            <div className="absolute bottom-[-20%] right-[-10%] opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none">
                <Icon size={120} />
            </div>
        </motion.div>
    )
}

function ModernUsagePanel({ label, current, limit, color, icon: Icon }) {
    const percentage = limit === '∞' ? 0 : (current / parseInt(limit.replace(/,/g, ''))) * 100
    const colorClasses = {
        purple: 'text-purple-600 bg-purple-50 border-purple-100',
        blue: 'text-blue-600 bg-blue-50 border-blue-100',
        emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        amber: 'text-amber-600 bg-amber-50 border-amber-100'
    }

    return (
        <div className="bg-white rounded-[2.8rem] p-6 shadow-sm border border-gray-100/50 flex flex-col justify-between group overflow-hidden">
            <div className="flex items-center justify-between mb-8">
                <div className={`p-4 rounded-xl ${colorClasses[color]} border group-hover:scale-110 transition-transform duration-500`}><Icon size={18} /></div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">{label}</p>
                    <p className="text-lg font-black text-gray-900 tracking-tighter leading-none">{current} <span className="text-gray-300 text-[11px]">/ {limit}</span></p>
                </div>
            </div>
            {limit !== '∞' && (
                <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                        className={`h-full rounded-full ${percentage > 90 ? 'bg-rose-500' : percentage > 70 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                    />
                </div>
            )}
        </div>
    )
}

function FAQPod({ question, answer }) {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <div
            onClick={() => setIsOpen(!isOpen)}
            className="group bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100/50 cursor-pointer transition-all hover:border-purple-200"
        >
            <div className="flex items-center justify-between gap-4">
                <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-widest leading-relaxed underline decoration-purple-100 underline-offset-4 decoration-2">{question}</h4>
                <div className={`p-2 rounded-xl bg-gray-50 text-gray-400 group-hover:text-purple-600 transition-all ${isOpen ? 'rotate-180 bg-purple-50' : ''}`}>
                    <Plus size={14} className={isOpen ? 'rotate-45' : ''} />
                </div>
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-6 text-[11px] font-medium text-gray-400 uppercase tracking-widest leading-relaxed overflow-hidden"
                    >
                        {answer}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    )
}
