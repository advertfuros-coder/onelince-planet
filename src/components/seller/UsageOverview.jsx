'use client'

import { useState, useEffect } from 'react'
import { Package, Warehouse, Image, Zap, TrendingUp, AlertCircle, ArrowUpRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function UsageOverview({ token }) {
    const [usage, setUsage] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (token) {
            fetchUsage()
        }
    }, [token])

    const fetchUsage = async () => {
        try {
            const res = await fetch('/api/seller/usage', {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            if (data.success) {
                setUsage(data)
            }
        } catch (error) {
            console.error('Usage fetch error:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-32 bg-gray-100 rounded-3xl" />
                <div className="h-32 bg-gray-100 rounded-3xl" />
                <div className="h-32 bg-gray-100 rounded-3xl" />
            </div>
        )
    }

    if (!usage) return null

    return (
        <div className="space-y-6">
            {/* Plan Header */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border-2 border-blue-100">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">
                            Current Plan
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 capitalize">
                            {usage.plan.tierName}
                        </h2>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                            Monthly
                        </div>
                        <div className="text-3xl font-black text-gray-900">
                            ₹{usage.plan.price.toLocaleString()}
                        </div>
                    </div>
                </div>

                {usage.plan.billing?.nextBillingDate && (
                    <div className="text-sm text-gray-600 font-medium">
                        Next billing: {new Date(usage.plan.billing.nextBillingDate).toLocaleDateString()}
                    </div>
                )}
            </div>

            {/* Upgrade Recommendation */}
            {usage.upgradeRecommendation && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-6"
                >
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-amber-100 rounded-2xl">
                            <Sparkles className="text-amber-600" size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-black text-gray-900 mb-2">
                                Upgrade Recommended
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                                {usage.upgradeRecommendation.reason}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {usage.upgradeRecommendation.benefits.map((benefit, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-white rounded-full text-xs font-bold text-gray-700"
                                    >
                                        ✓ {benefit}
                                    </span>
                                ))}
                            </div>
                            <Link
                                href="/seller/subscription"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-black text-sm hover:shadow-lg transition-all"
                            >
                                Upgrade to {usage.upgradeRecommendation.tierName}
                                <ArrowUpRight size={16} />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Usage Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <UsageCard
                    icon={Package}
                    label="Products"
                    current={usage.usage.products.current}
                    limit={usage.usage.products.limit}
                    percentage={usage.usage.products.percentage}
                    status={usage.usage.products.status}
                    daysUntilLimit={usage.usage.products.daysUntilLimit}
                    color="blue"
                />

                <UsageCard
                    icon={Warehouse}
                    label="Warehouses"
                    current={usage.usage.warehouses.current}
                    limit={usage.usage.warehouses.limit}
                    percentage={usage.usage.warehouses.percentage}
                    status={usage.usage.warehouses.status}
                    color="purple"
                />

                <UsageCard
                    icon={Image}
                    label="Images per Product"
                    current={usage.usage.images.limit}
                    limit={usage.usage.images.limit}
                    percentage={0}
                    status="normal"
                    isLimit={true}
                    color="green"
                />

                <UsageCard
                    icon={Zap}
                    label="API Access"
                    current={usage.usage.apiCalls.current}
                    limit={usage.usage.apiCalls.limit}
                    percentage={0}
                    status={usage.usage.apiCalls.available ? "normal" : "unavailable"}
                    isFeature={true}
                    available={usage.usage.apiCalls.available}
                    color="amber"
                />
            </div>
        </div>
    )
}

function UsageCard({
    icon: Icon,
    label,
    current,
    limit,
    percentage,
    status,
    daysUntilLimit,
    color,
    isLimit = false,
    isFeature = false,
    available = true,
}) {
    const colorClasses = {
        blue: {
            bg: 'bg-blue-50',
            border: 'border-blue-100',
            icon: 'text-blue-600',
            bar: 'bg-blue-500',
        },
        purple: {
            bg: 'bg-purple-50',
            border: 'border-purple-100',
            icon: 'text-purple-600',
            bar: 'bg-purple-500',
        },
        green: {
            bg: 'bg-green-50',
            border: 'border-green-100',
            icon: 'text-green-600',
            bar: 'bg-green-500',
        },
        amber: {
            bg: 'bg-amber-50',
            border: 'border-amber-100',
            icon: 'text-amber-600',
            bar: 'bg-amber-500',
        },
    }

    const statusColors = {
        normal: 'bg-blue-500',
        warning: 'bg-yellow-500',
        critical: 'bg-red-500',
        unavailable: 'bg-gray-300',
    }

    const colors = colorClasses[color]

    return (
        <div className={`${colors.bg} border-2 ${colors.border} rounded-3xl p-6`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-white rounded-2xl ${colors.icon}`}>
                    <Icon size={24} />
                </div>
                {status === 'critical' && (
                    <div className="flex items-center gap-1 text-red-600">
                        <AlertCircle size={16} />
                        <span className="text-xs font-black uppercase">At Limit</span>
                    </div>
                )}
                {status === 'warning' && (
                    <div className="flex items-center gap-1 text-yellow-600">
                        <TrendingUp size={16} />
                        <span className="text-xs font-black uppercase">High Usage</span>
                    </div>
                )}
            </div>

            <div className="mb-4">
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    {label}
                </div>

                {isLimit ? (
                    <div className="text-2xl font-black text-gray-900">
                        {limit === -1 ? 'Unlimited' : limit} per product
                    </div>
                ) : isFeature ? (
                    <div className="text-2xl font-black text-gray-900">
                        {available ? 'Enabled' : 'Not Available'}
                    </div>
                ) : (
                    <div className="text-2xl font-black text-gray-900">
                        {current} / {limit === -1 ? '∞' : limit.toLocaleString()}
                    </div>
                )}
            </div>

            {!isLimit && !isFeature && limit !== -1 && (
                <>
                    {/* Progress Bar */}
                    <div className="h-3 bg-white rounded-full overflow-hidden mb-3">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(percentage, 100)}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className={`h-full ${statusColors[status]}`}
                        />
                    </div>

                    {/* Status Message */}
                    <div className="text-sm font-medium text-gray-600">
                        {status === 'critical' && (
                            <span className="text-red-600 font-bold">
                                🔴 Limit reached. Upgrade to add more.
                            </span>
                        )}
                        {status === 'warning' && daysUntilLimit > 0 && (
                            <span className="text-yellow-600 font-bold">
                                ⚠️ You'll hit your limit in {daysUntilLimit} days
                            </span>
                        )}
                        {status === 'normal' && (
                            <span className="text-gray-500">
                                {percentage}% used
                            </span>
                        )}
                    </div>
                </>
            )}

            {isFeature && !available && (
                <Link
                    href="/seller/subscription"
                    className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 mt-2"
                >
                    Upgrade to unlock
                    <ArrowUpRight size={14} />
                </Link>
            )}
        </div>
    )
}
