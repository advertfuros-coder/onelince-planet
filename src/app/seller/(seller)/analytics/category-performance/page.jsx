'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
    TrendingUp,
    DollarSign,
    ShoppingCart,
    Eye,
    Target,
    AlertCircle,
    Lightbulb,
    Info,
    CheckCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function CategoryAnalyticsPage() {
    const { token } = useAuth()
    const [analytics, setAnalytics] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (token) {
            fetchAnalytics()
        }
    }, [token])

    const fetchAnalytics = async () => {
        try {
            setLoading(true)
            const res = await axios.get('/api/seller/analytics/categories', {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (res.data.success) {
                setAnalytics(res.data.data)
            }
        } catch (err) {
            console.error('Analytics fetch error:', err)
            setError(err.response?.data?.message || 'Failed to load analytics')
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (value) => `AED ${(value || 0).toLocaleString('en-AE', { minimumFractionDigits: 2 })}`

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400 font-semibold uppercase tracking-widest text-xs">Loading Analytics...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
                <div className="bg-white rounded-[2.5rem] p-10 max-w-md text-center shadow-xl">
                    <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} className="text-rose-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Analytics</h2>
                    <p className="text-sm text-slate-600 mb-6">{error}</p>
                    <button
                        onClick={fetchAnalytics}
                        className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-semibold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8">
            <div className="max-w-[1500px] mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-xl shadow-purple-500/20">
                                <TrendingUp size={20} />
                            </div>
                            <span className="text-[11px] font-semibold text-purple-600 uppercase tracking-[0.2em] bg-purple-50 px-4 py-1.5 rounded-full">
                                Performance Analytics
                            </span>
                        </div>
                        <h1 className="text-5xl font-semibold text-slate-900 tracking-tighter">
                            Category Insights<span className="text-purple-600">.</span>
                        </h1>
                        <p className="text-slate-400 font-semibold text-base max-w-2xl">
                            Track performance, identify opportunities, and optimize your catalog based on real data.
                        </p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <SummaryCard
                        label="Total Revenue"
                        value={formatCurrency(analytics?.totals?.revenue)}
                        icon={DollarSign}
                        color="emerald"
                        delay={0.1}
                    />
                    <SummaryCard
                        label="Total Orders"
                        value={analytics?.totals?.orders || 0}
                        icon={ShoppingCart}
                        color="blue"
                        delay={0.2}
                    />
                    <SummaryCard
                        label="Units Sold"
                        value={analytics?.totals?.units || 0}
                        icon={Target}
                        color="purple"
                        delay={0.3}
                    />
                    <SummaryCard
                        label="Active Categories"
                        value={analytics?.totals?.categories || 0}
                        icon={TrendingUp}
                        color="orange"
                        delay={0.4}
                    />
                </div>

                {/* Smart Insights */}
                {analytics?.insights && analytics.insights.length > 0 && (
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100">
                        <h2 className="text-lg font-semibold text-slate-900 uppercase tracking-widest mb-6">
                            Smart Insights
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {analytics.insights.map((insight, idx) => (
                                <InsightCard key={idx} insight={insight} delay={0.5 + idx * 0.1} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Category Performance Table */}
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-10 border-b border-slate-100">
                        <h2 className="text-lg font-semibold text-slate-900 uppercase tracking-widest">
                            Category Performance
                        </h2>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">
                            Last 30 days
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-50 bg-gray-50/30">
                                    <th className="px-8 py-5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Category</th>
                                    <th className="px-6 py-5 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Views</th>
                                    <th className="px-6 py-5 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Orders</th>
                                    <th className="px-6 py-5 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Conv. Rate</th>
                                    <th className="px-6 py-5 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Revenue</th>
                                    <th className="px-6 py-5 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-widest">AOV</th>
                                    <th className="px-6 py-5 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Products</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {analytics?.categories?.map((category, idx) => (
                                    <tr key={idx} className="group hover:bg-gray-50/30 transition-all">
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-semibold text-gray-900">{category.categoryPath}</p>
                                            <p className="text-xs text-gray-400 font-semibold mt-0.5">{category.categoryName}</p>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Eye size={14} className="text-gray-400" />
                                                <span className="text-sm font-semibold text-gray-900">{category.views.toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <span className="text-sm font-semibold text-gray-900">{category.orders}</span>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-12 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${parseFloat(category.conversionRate) >= 8 ? 'bg-green-500' :
                                                                parseFloat(category.conversionRate) >= 5 ? 'bg-blue-500' :
                                                                    'bg-orange-500'
                                                            }`}
                                                        style={{ width: `${Math.min(parseFloat(category.conversionRate) * 10, 100)}%` }}
                                                    />
                                                </div>
                                                <span className={`text-xs font-semibold ${parseFloat(category.conversionRate) >= 8 ? 'text-green-600' :
                                                        parseFloat(category.conversionRate) >= 5 ? 'text-blue-600' :
                                                            'text-orange-600'
                                                    }`}>
                                                    {category.conversionRate}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <span className="text-sm font-semibold text-green-600">{formatCurrency(category.revenue)}</span>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <span className="text-sm font-semibold text-gray-900">{formatCurrency(category.averageOrderValue)}</span>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <span className="text-xs text-gray-600 font-semibold">
                                                {category.productCount?.active || 0} / {category.productCount?.total || 0}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {(!analytics?.categories || analytics.categories.length === 0) && (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TrendingUp size={24} className="text-gray-300" />
                            </div>
                            <p className="text-gray-400 font-semibold">No sales data yet</p>
                            <p className="text-xs text-gray-300 mt-1">Analytics will appear once you have orders</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function SummaryCard({ label, value, icon: Icon, color, delay }) {
    const colors = {
        emerald: 'text-emerald-600 bg-emerald-50',
        blue: 'text-blue-600 bg-blue-50',
        purple: 'text-purple-600 bg-purple-50',
        orange: 'text-orange-600 bg-orange-50',
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-white p-6 rounded-[2.2rem] shadow-sm border border-gray-100/50"
        >
            <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${colors[color]}`}>
                    <Icon size={24} />
                </div>
                <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-2xl font-semibold text-gray-900 tracking-tight">{value}</p>
                </div>
            </div>
        </motion.div>
    )
}

function InsightCard({ insight, delay }) {
    const typeConfig = {
        success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', iconColor: 'text-green-600', Icon: CheckCircle },
        info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', iconColor: 'text-blue-600', Icon: Info },
        warning: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', iconColor: 'text-orange-600', Icon: AlertCircle },
        opportunity: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900', iconColor: 'text-purple-600', Icon: Lightbulb },
    }

    const config = typeConfig[insight.type] || typeConfig.info
    const { Icon } = config

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
            className={`${config.bg} ${config.border} border-2 rounded-2xl p-4 flex items-start gap-3`}
        >
            <div className="shrink-0">
                <Icon size={20} className={config.iconColor} />
            </div>
            <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: config.iconColor.replace('text-', '') }}>
                    {insight.icon} {insight.title}
                </p>
                <p className={`text-xs font-semibold ${config.text}`}>{insight.message}</p>
            </div>
        </motion.div>
    )
}
