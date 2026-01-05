'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import {
    Plus,
    Edit2,
    Trash2,
    Eye,
    EyeOff,
    Crown,
    TrendingUp,
    Users,
    DollarSign,
    Loader2,
    Save,
    X,
    Check,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

export default function SubscriptionPlansPage() {
    const { token } = useAuth()
    const [plans, setPlans] = useState([])
    const [loading, setLoading] = useState(true)
    const [showEditor, setShowEditor] = useState(false)
    const [editingPlan, setEditingPlan] = useState(null)
    const [stats, setStats] = useState({
        totalPlans: 0,
        activeSubscribers: 0,
        monthlyRevenue: 0,
        avgLTV: 0,
    })

    useEffect(() => {
        if (token) {
            fetchPlans()
        }
    }, [token])

    const fetchPlans = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/admin/subscription-plans', {
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            if (data.success) {
                setPlans(data.plans)
                calculateStats(data.plans)
            }
        } catch (error) {
            console.error('Fetch plans error:', error)
            toast.error('Failed to load plans')
        } finally {
            setLoading(false)
        }
    }

    const calculateStats = (plansData) => {
        const totalSubs = plansData.reduce((sum, p) => sum + (p.analytics?.activeSubscribers || 0), 0)
        const totalRevenue = plansData.reduce((sum, p) => sum + (p.analytics?.monthlyRevenue || 0), 0)
        const avgLTV = plansData.reduce((sum, p) => sum + (p.analytics?.avgLifetimeValue || 0), 0) / plansData.length

        setStats({
            totalPlans: plansData.filter(p => p.status === 'active').length,
            activeSubscribers: totalSubs,
            monthlyRevenue: totalRevenue,
            avgLTV: avgLTV || 0,
        })
    }

    const handleCreatePlan = () => {
        setEditingPlan({
            name: '',
            displayName: '',
            description: '',
            icon: '⭐',
            color: '#3B82F6',
            pricing: { monthly: 0, quarterly: 0, yearly: 0 },
            discounts: { quarterly: 10, yearly: 20 },
            features: {
                maxProducts: 50,
                maxWarehouses: 1,
                maxImages: 5,
                bulkUpload: false,
                advancedAnalytics: false,
                apiAccess: false,
            },
            status: 'draft',
            isVisible: true,
        })
        setShowEditor(true)
    }

    const handleEditPlan = (plan) => {
        setEditingPlan(plan)
        setShowEditor(true)
    }

    const handleDeletePlan = async (planId) => {
        if (!confirm('Are you sure you want to archive this plan?')) return

        try {
            const res = await fetch(`/api/admin/subscription-plans/${planId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            })
            const data = await res.json()
            if (data.success) {
                toast.success('Plan archived successfully')
                fetchPlans()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error('Failed to archive plan')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-semibold text-gray-900">Subscription Plans</h1>
                        <p className="text-gray-600 mt-2">Manage pricing tiers and features</p>
                    </div>
                    <button
                        onClick={handleCreatePlan}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        Create New Plan
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        icon={Crown}
                        label="Active Plans"
                        value={stats.totalPlans}
                        color="blue"
                    />
                    <StatCard
                        icon={Users}
                        label="Total Subscribers"
                        value={stats.activeSubscribers}
                        color="purple"
                    />
                    <StatCard
                        icon={DollarSign}
                        label="Monthly Revenue"
                        value={`₹${(stats.monthlyRevenue / 1000).toFixed(1)}K`}
                        color="green"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Avg. LTV"
                        value={`₹${(stats.avgLTV / 1000).toFixed(1)}K`}
                        color="amber"
                    />
                </div>

                {/* Plans Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Plan
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Subscribers
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Revenue
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {plans.map((plan) => (
                                    <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{plan.icon}</span>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{plan.displayName}</div>
                                                    <div className="text-sm text-gray-500">{plan.description}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">
                                                ₹{plan.pricing.monthly.toLocaleString()}/mo
                                            </div>
                                            {plan.discounts.yearly > 0 && (
                                                <div className="text-xs text-green-600">
                                                    {plan.discounts.yearly}% off yearly
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">
                                                {plan.analytics?.activeSubscribers || 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">
                                                ₹{(plan.analytics?.monthlyRevenue || 0).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${plan.status === 'active'
                                                        ? 'bg-green-100 text-green-700'
                                                        : plan.status === 'draft'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                    }`}
                                            >
                                                {plan.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditPlan(plan)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePlan(plan.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Archive"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Plan Editor Modal */}
            <AnimatePresence>
                {showEditor && (
                    <PlanEditorModal
                        plan={editingPlan}
                        onClose={() => {
                            setShowEditor(false)
                            setEditingPlan(null)
                        }}
                        onSave={() => {
                            setShowEditor(false)
                            setEditingPlan(null)
                            fetchPlans()
                        }}
                        token={token}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

function StatCard({ icon: Icon, label, value, color }) {
    const colors = {
        blue: 'from-blue-500 to-blue-600',
        purple: 'from-purple-500 to-purple-600',
        green: 'from-green-500 to-green-600',
        amber: 'from-amber-500 to-amber-600',
    }

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${colors[color]} mb-4`}>
                <Icon className="text-white" size={24} />
            </div>
            <div className="text-3xl font-semibold text-gray-900 mb-1">{value}</div>
            <div className="text-sm text-gray-600 font-medium">{label}</div>
        </div>
    )
}

function PlanEditorModal({ plan, onClose, onSave, token }) {
    const [formData, setFormData] = useState(plan)
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        setSaving(true)
        try {
            const url = plan.id
                ? `/api/admin/subscription-plans/${plan.id}`
                : '/api/admin/subscription-plans'

            const res = await fetch(url, {
                method: plan.id ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            })

            const data = await res.json()
            if (data.success) {
                toast.success(plan.id ? 'Plan updated!' : 'Plan created!')
                onSave()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error('Failed to save plan')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">
                        {plan.id ? 'Edit Plan' : 'Create New Plan'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Plan Name (ID)
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="starter"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Starter Plan"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                            placeholder="For growing businesses"
                        />
                    </div>

                    {/* Pricing */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Monthly Price (₹)
                                </label>
                                <input
                                    type="number"
                                    value={formData.pricing.monthly}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            pricing: { ...formData.pricing, monthly: parseInt(e.target.value) },
                                        })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Quarterly Discount (%)
                                </label>
                                <input
                                    type="number"
                                    value={formData.discounts.quarterly}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            discounts: { ...formData.discounts, quarterly: parseInt(e.target.value) },
                                        })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Yearly Discount (%)
                                </label>
                                <input
                                    type="number"
                                    value={formData.discounts.yearly}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            discounts: { ...formData.discounts, yearly: parseInt(e.target.value) },
                                        })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Features - Simplified for length */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Features & Limits</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Max Products (-1 = unlimited)
                                </label>
                                <input
                                    type="number"
                                    value={formData.features.maxProducts}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            features: { ...formData.features, maxProducts: parseInt(e.target.value) },
                                        })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Max Warehouses
                                </label>
                                <input
                                    type="number"
                                    value={formData.features.maxWarehouses}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            features: { ...formData.features, maxWarehouses: parseInt(e.target.value) },
                                        })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Max Images/Product
                                </label>
                                <input
                                    type="number"
                                    value={formData.features.maxImages}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            features: { ...formData.features, maxImages: parseInt(e.target.value) },
                                        })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Feature Toggles */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            {['bulkUpload', 'advancedAnalytics', 'apiAccess'].map((feature) => (
                                <label key={feature} className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.features[feature]}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                features: { ...formData.features, [feature]: e.target.checked },
                                            })
                                        }
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 capitalize">
                                        {feature.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-6 border-t">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    Save Plan
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
