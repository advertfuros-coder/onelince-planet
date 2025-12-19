// app/seller/(seller)/advertising/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
    FiTrendingUp,
    FiDollarSign,
    FiEye,
    FiMousePointer,
    FiPlus,
    FiEdit,
    FiPause,
    FiPlay,
    FiBarChart2,
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'

export default function AdvertisingPage() {
    const { token } = useAuth()
    const [campaigns, setCampaigns] = useState([])
    const [stats, setStats] = useState({})
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        if (token) fetchCampaigns()
    }, [token])

    async function fetchCampaigns() {
        try {
            setLoading(true)
            const res = await axios.get('/api/seller/campaigns', {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.data.success) {
                setCampaigns(res.data.campaigns || [])
                setStats(res.data.stats || {})
            }
        } catch (error) {
            console.error('Error fetching campaigns:', error)
            toast.error('Failed to load campaigns')
        } finally {
            setLoading(false)
        }
    }

    async function toggleCampaign(id, currentStatus) {
        try {
            const newStatus = currentStatus === 'active' ? 'paused' : 'active'
            const res = await axios.put(`/api/seller/campaigns/${id}`, {
                status: newStatus
            }, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.data.success) {
                toast.success(`Campaign ${newStatus}`)
                fetchCampaigns()
            }
        } catch (error) {
            toast.error('Failed to update campaign')
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
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">📢 Advertising Campaigns</h1>
                        <p className="mt-2 text-purple-100">Promote your products and boost sales</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center space-x-2 px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 font-semibold shadow-lg transition-all"
                    >
                        <FiPlus />
                        <span>Create Campaign</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    icon={<FiTrendingUp />}
                    label="Active Campaigns"
                    value={campaigns.filter(c => c.status === 'active').length}
                    color="purple"
                />
                <StatCard
                    icon={<FiDollarSign />}
                    label="Total Spend"
                    value={`₹${stats.totalSpend || 0}`}
                    color="green"
                />
                <StatCard
                    icon={<FiEye />}
                    label="Total Impressions"
                    value={stats.totalImpressions || 0}
                    color="blue"
                />
                <StatCard
                    icon={<FiMousePointer />}
                    label="Total Clicks"
                    value={stats.totalClicks || 0}
                    color="orange"
                />
            </div>

            {/* Campaigns List */}
            {campaigns.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <FiBarChart2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Campaigns Yet</h3>
                    <p className="text-gray-600 mb-6">Create your first advertising campaign to boost sales</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                    >
                        Create First Campaign
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {campaigns.map((campaign) => (
                        <CampaignCard
                            key={campaign._id}
                            campaign={campaign}
                            onToggle={() => toggleCampaign(campaign._id, campaign.status)}
                        />
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <CreateCampaignModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false)
                        fetchCampaigns()
                    }}
                    token={token}
                />
            )}
        </div>
    )
}

function CampaignCard({ campaign, onToggle }) {
    const statusColors = {
        active: 'bg-green-100 text-green-700',
        paused: 'bg-yellow-100 text-yellow-700',
        completed: 'bg-blue-100 text-blue-700',
        draft: 'bg-gray-100 text-gray-700',
    }

    const ctr = campaign.metrics?.clicks && campaign.metrics?.impressions
        ? ((campaign.metrics.clicks / campaign.metrics.impressions) * 100).toFixed(2)
        : 0

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">{campaign.name}</h3>
                    <p className="text-sm text-gray-600">{campaign.type?.toUpperCase()}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[campaign.status]}`}>
                        {campaign.status?.toUpperCase()}
                    </span>
                    <button
                        onClick={onToggle}
                        className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200"
                    >
                        {campaign.status === 'active' ? <FiPause /> : <FiPlay />}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                    <p className="text-xs text-gray-500">Budget</p>
                    <p className="text-lg font-bold text-gray-900">₹{campaign.budget?.total || 0}</p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-500">Spent</p>
                    <p className="text-lg font-bold text-purple-600">₹{campaign.budget?.spent || 0}</p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-500">Impressions</p>
                    <p className="text-lg font-bold text-gray-900">{campaign.metrics?.impressions || 0}</p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-500">CTR</p>
                    <p className="text-lg font-bold text-green-600">{ctr}%</p>
                </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${Math.min((campaign.budget?.spent / campaign.budget?.total) * 100, 100)}%` }}
                ></div>
            </div>
        </div>
    )
}

function CreateCampaignModal({ onClose, onSuccess, token }) {
    const [formData, setFormData] = useState({
        name: '',
        type: 'sponsored_products',
        budget: {
            total: 1000,
            daily: 100
        },
        bidding: {
            strategy: 'automatic',
            amount: 1
        }
    })

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            const res = await axios.post('/api/seller/campaigns', formData, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.data.success) {
                toast.success('Campaign created')
                onSuccess()
            }
        } catch (error) {
            toast.error('Failed to create campaign')
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-xl">
                    <h2 className="text-2xl font-bold">Create Campaign</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <input
                        type="text"
                        placeholder="Campaign Name *"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        required
                    />

                    <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="sponsored_products">Sponsored Products</option>
                        <option value="sponsored_brands">Sponsored Brands</option>
                        <option value="display">Display Ads</option>
                        <option value="video">Video Ads</option>
                    </select>

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="number"
                            placeholder="Total Budget"
                            value={formData.budget.total}
                            onChange={(e) => setFormData({ ...formData, budget: { ...formData.budget, total: parseInt(e.target.value) } })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                        <input
                            type="number"
                            placeholder="Daily Budget"
                            value={formData.budget.daily}
                            onChange={(e) => setFormData({ ...formData, budget: { ...formData.budget, daily: parseInt(e.target.value) } })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <div className="flex items-center justify-end space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                        >
                            Create Campaign
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function StatCard({ icon, label, value, color }) {
    const colors = {
        purple: 'bg-purple-100 text-purple-600',
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        orange: 'bg-orange-100 text-orange-600',
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
