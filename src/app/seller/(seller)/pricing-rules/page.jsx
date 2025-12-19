// app/seller/(seller)/pricing-rules/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
    FiPlus,
    FiZap,
    FiClock,
    FiPackage,
    FiTrendingDown,
    FiDollarSign,
    FiToggleLeft,
    FiToggleRight,
    FiEdit2,
    FiTrash2,
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'

export default function PricingRulesPage() {
    const { token } = useAuth()
    const [rules, setRules] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)

    useEffect(() => {
        if (token) fetchRules()
    }, [token])

    async function fetchRules() {
        try {
            setLoading(true)
            // API endpoint to be created
            const res = await axios.get('/api/seller/pricing-rules', {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.data.success) {
                setRules(res.data.rules)
            }
        } catch (error) {
            console.error('Error fetching rules:', error)
        } finally {
            setLoading(false)
        }
    }

    const ruleTypeIcons = {
        dynamic: <FiZap className="w-5 h-5" />,
        scheduled: <FiClock className="w-5 h-5" />,
        inventory_based: <FiPackage className="w-5 h-5" />,
        competitor_based: <FiTrendingDown className="w-5 h-5" />,
        bulk_discount: <FiDollarSign className="w-5 h-5" />,
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">⚡ Automated Pricing Rules</h1>
                        <p className="mt-2 text-purple-100">Set dynamic pricing strategies for your products</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center space-x-2 px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 font-semibold shadow-lg transition-all"
                    >
                        <FiPlus />
                        <span>Create Rule</span>
                    </button>
                </div>
            </div>

            {/* Rule Types Info */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <RuleTypeCard
                    icon={<FiZap />}
                    title="Dynamic"
                    description="Beat competitor prices"
                    color="yellow"
                />
                <RuleTypeCard
                    icon={<FiClock />}
                    title="Scheduled"
                    description="Time-based pricing"
                    color="blue"
                />
                <RuleTypeCard
                    icon={<FiPackage />}
                    title="Inventory"
                    description="Stock-based pricing"
                    color="green"
                />
                <RuleTypeCard
                    icon={<FiTrendingDown />}
                    title="Competitor"
                    description="Match competitors"
                    color="red"
                />
                <RuleTypeCard
                    icon={<FiDollarSign />}
                    title="Bulk Discount"
                    description="Quantity tiers"
                    color="purple"
                />
            </div>

            {/* Rules List */}
            {rules.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <FiZap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Pricing Rules Yet</h3>
                    <p className="text-gray-600 mb-6">
                        Create automated pricing rules to optimize your revenue and stay competitive
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                    >
                        Create Your First Rule
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {rules.map((rule) => (
                        <PricingRuleCard key={rule._id} rule={rule} onUpdate={fetchRules} />
                    ))}
                </div>
            )}

            {/* Add Rule Modal */}
            {showAddModal && (
                <AddPricingRuleModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false)
                        fetchRules()
                    }}
                />
            )}
        </div>
    )
}

function PricingRuleCard({ rule, onUpdate }) {
    const [isActive, setIsActive] = useState(rule.status === 'active')

    const typeColors = {
        dynamic: 'bg-yellow-100 text-yellow-700',
        scheduled: 'bg-blue-100 text-blue-700',
        inventory_based: 'bg-green-100 text-green-700',
        competitor_based: 'bg-red-100 text-red-700',
        bulk_discount: 'bg-purple-100 text-purple-700',
    }

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{rule.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${typeColors[rule.type]}`}>
                            {rule.type.replace('_', ' ')}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                            {isActive ? 'Active' : 'Paused'}
                        </span>
                    </div>
                    <p className="text-gray-600 mb-4">{rule.description}</p>

                    {/* Rule Details */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                            <p className="text-xs text-gray-500">Products Affected</p>
                            <p className="text-lg font-bold text-gray-900">{rule.metrics?.productsAffected || 0}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total Revenue</p>
                            <p className="text-lg font-bold text-gray-900">
                                ₹{(rule.metrics?.totalRevenue || 0).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Avg Discount</p>
                            <p className="text-lg font-bold text-gray-900">
                                {(rule.metrics?.averageDiscount || 0).toFixed(1)}%
                            </p>
                        </div>
                    </div>

                    {/* Conditions */}
                    {rule.conditions && (
                        <div className="flex flex-wrap gap-2">
                            {rule.conditions.daysOfWeek && (
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                                    {rule.conditions.daysOfWeek.join(', ')}
                                </span>
                            )}
                            {rule.conditions.timeOfDay && (
                                <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">
                                    {rule.conditions.timeOfDay.start} - {rule.conditions.timeOfDay.end}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                    <button
                        onClick={() => setIsActive(!isActive)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title={isActive ? 'Pause' : 'Activate'}
                    >
                        {isActive ? <FiToggleRight className="w-6 h-6 text-green-600" /> : <FiToggleLeft className="w-6 h-6" />}
                    </button>
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <FiEdit2 />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <FiTrash2 />
                    </button>
                </div>
            </div>
        </div>
    )
}

function AddPricingRuleModal({ onClose, onSuccess }) {
    const { token } = useAuth()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'inventory_based',
        appliesTo: 'all',
        priceAdjustment: {
            type: 'percentage',
            value: -10
        }
    })

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setLoading(true)
            const res = await axios.post('/api/seller/pricing-rules', formData, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (res.data.success) {
                toast.success('Pricing rule created successfully')
                onSuccess()
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create rule')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Create Pricing Rule</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            placeholder="Weekend Sale"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            rows="2"
                            placeholder="10% discount on weekends"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rule Type *</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="inventory_based">Inventory Based</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="dynamic">Dynamic</option>
                            <option value="competitor_based">Competitor Based</option>
                            <option value="bulk_discount">Bulk Discount</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Adjustment Type</label>
                            <select
                                value={formData.priceAdjustment.type}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    priceAdjustment: { ...formData.priceAdjustment, type: e.target.value }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="percentage">Percentage</option>
                                <option value="fixed">Fixed Amount</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                            <input
                                type="number"
                                value={formData.priceAdjustment.value}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    priceAdjustment: { ...formData.priceAdjustment, value: parseFloat(e.target.value) }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                placeholder="-10"
                            />
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Rule'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function RuleTypeCard({ icon, title, description, color }) {
    const colors = {
        yellow: 'bg-yellow-100 text-yellow-600',
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        red: 'bg-red-100 text-red-600',
        purple: 'bg-purple-100 text-purple-600',
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className={`w-12 h-12 rounded-lg ${colors[color]} flex items-center justify-center mx-auto mb-2`}>
                {icon}
            </div>
            <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
    )
}
