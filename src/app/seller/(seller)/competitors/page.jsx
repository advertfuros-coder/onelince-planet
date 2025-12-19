// app/seller/(seller)/competitors/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
    FiPlus,
    FiTrendingDown,
    FiTrendingUp,
    FiDollarSign,
    FiTarget,
    FiZap,
    FiAlertCircle,
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'

export default function CompetitorsPage() {
    const { token } = useAuth()
    const [trackings, setTrackings] = useState([])
    const [stats, setStats] = useState({})
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)

    useEffect(() => {
        if (token) fetchTrackings()
    }, [token])

    async function fetchTrackings() {
        try {
            setLoading(true)
            const res = await axios.get('/api/seller/competitors', {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.data.success) {
                setTrackings(res.data.trackings)
                setStats(res.data.stats)
            }
        } catch (error) {
            console.error('Error fetching trackings:', error)
            toast.error('Failed to load competitor tracking')
        } finally {
            setLoading(false)
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
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">🎯 Competitor Price Tracking</h1>
                        <p className="mt-2 text-red-100">Monitor competitor prices and stay competitive</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center space-x-2 px-6 py-3 bg-white text-red-600 rounded-lg hover:bg-red-50 font-semibold shadow-lg transition-all"
                    >
                        <FiPlus />
                        <span>Track Product</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    icon={<FiTarget />}
                    label="Products Tracked"
                    value={stats.totalTracked || 0}
                    color="blue"
                />
                <StatCard
                    icon={<FiTrendingDown />}
                    label="Competitors"
                    value={stats.totalCompetitors || 0}
                    color="red"
                />
                <StatCard
                    icon={<FiDollarSign />}
                    label="Avg Price Difference"
                    value={`${(stats.averagePriceDifference || 0).toFixed(1)}%`}
                    color="green"
                />
                <StatCard
                    icon={<FiZap />}
                    label="Auto-Pricing Active"
                    value={stats.autoPricingEnabled || 0}
                    color="purple"
                />
            </div>

            {/* Trackings List */}
            {trackings.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <FiTarget className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Competitor Tracking Yet</h3>
                    <p className="text-gray-600 mb-6">
                        Start tracking competitor prices to optimize your pricing strategy
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                    >
                        Track Your First Product
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {trackings.map((tracking) => (
                        <TrackingCard key={tracking._id} tracking={tracking} onUpdate={fetchTrackings} />
                    ))}
                </div>
            )}
        </div>
    )
}

function TrackingCard({ tracking, onUpdate }) {
    const position = tracking.currentPosition || {}
    const isCompetitive = position.priceRank <= 2

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                    {tracking.productId?.images?.[0] && (
                        <img
                            src={typeof tracking.productId.images[0] === 'string'
                                ? tracking.productId.images[0]
                                : tracking.productId.images[0].url}
                            alt={tracking.productId.name}
                            className="w-16 h-16 object-cover rounded-lg"
                        />
                    )}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{tracking.productId?.name}</h3>
                        <p className="text-sm text-gray-600">{tracking.competitors.length} competitors tracked</p>
                    </div>
                </div>

                {tracking.autoPricing?.enabled && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold flex items-center space-x-1">
                        <FiZap className="w-3 h-3" />
                        <span>Auto-Pricing</span>
                    </span>
                )}
            </div>

            {/* Price Comparison */}
            <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Your Price</p>
                    <p className="text-xl font-bold text-gray-900">
                        ₹{(position.myPrice || 0).toLocaleString()}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Lowest</p>
                    <p className="text-xl font-bold text-red-600">
                        ₹{(position.lowestCompetitorPrice || 0).toLocaleString()}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Average</p>
                    <p className="text-xl font-bold text-blue-600">
                        ₹{(position.averageCompetitorPrice || 0).toLocaleString()}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Your Rank</p>
                    <p className={`text-xl font-bold ${isCompetitive ? 'text-green-600' : 'text-orange-600'}`}>
                        #{position.priceRank || '-'}
                    </p>
                </div>
            </div>

            {/* Price Difference */}
            {position.percentageDifference !== undefined && (
                <div className={`flex items-center justify-center space-x-2 p-3 rounded-lg ${position.percentageDifference > 0
                        ? 'bg-red-50 text-red-700'
                        : 'bg-green-50 text-green-700'
                    }`}>
                    {position.percentageDifference > 0 ? (
                        <>
                            <FiTrendingUp className="w-5 h-5" />
                            <span className="font-semibold">
                                {position.percentageDifference.toFixed(1)}% higher than lowest
                            </span>
                        </>
                    ) : (
                        <>
                            <FiTrendingDown className="w-5 h-5" />
                            <span className="font-semibold">
                                {Math.abs(position.percentageDifference).toFixed(1)}% lower than lowest
                            </span>
                        </>
                    )}
                </div>
            )}

            {/* Competitors */}
            <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-semibold text-gray-700 mb-2">Tracked Competitors:</p>
                <div className="flex flex-wrap gap-2">
                    {tracking.competitors.map((comp, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            {comp.name} ({comp.platform})
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}

function StatCard({ icon, label, value, color }) {
    const colors = {
        blue: 'bg-blue-100 text-blue-600',
        red: 'bg-red-100 text-red-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${colors[color]}`}>
                    <div className="text-2xl">{icon}</div>
                </div>
                <div>
                    <p className="text-sm text-gray-600">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    )
}
