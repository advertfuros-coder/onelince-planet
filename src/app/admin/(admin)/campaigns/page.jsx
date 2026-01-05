'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
    FiSearch, FiFilter, FiPlay, FiPause, FiXCircle, FiCheckCircle,
    FiDollarSign, FiBarChart2, FiPieChart, FiMoreVertical, FiEye,
    FiCalendar, FiTarget
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'

export default function AdminCampaignsPage() {
    const { token } = useAuth()
    const [campaigns, setCampaigns] = useState([])
    const [stats, setStats] = useState({})
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // all, active, left
    const [processingId, setProcessingId] = useState(null)

    useEffect(() => {
        if (token) fetchCampaigns()
    }, [token, filter])

    const fetchCampaigns = async () => {
        try {
            setLoading(true)
            const query = filter !== 'all' ? `?status=${filter}` : ''
            const res = await axios.get(`/api/admin/campaigns${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                setCampaigns(res.data.campaigns)
                setStats(res.data.stats)
            }
        } catch (error) {
            toast.error('Failed to load campaigns')
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (id, status) => {
        if (!confirm(`Are you sure you want to mark this campaign as ${status}?`)) return

        setProcessingId(id)
        try {
            const res = await axios.patch('/api/admin/campaigns',
                { campaignId: id, status },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (res.data.success) {
                toast.success(res.data.message)
                fetchCampaigns()
            }
        } catch (error) {
            toast.error('Failed to update status')
        } finally {
            setProcessingId(null)
        }
    }

    const getStatusBadge = (status) => {
        const styles = {
            active: 'bg-green-100 text-green-700',
            paused: 'bg-yellow-100 text-yellow-700',
            draft: 'bg-gray-100 text-gray-700',
            rejected: 'bg-red-100 text-red-700',
            completed: 'bg-blue-100 text-blue-700'
        }
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${styles[status] || styles.draft}`}>
                {status}
            </span>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">Ad Campaigns</h1>
                    <p className="text-gray-600 mt-1">Manage sponsored products and platform advertisements</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    label="Total Ad Spend"
                    value={`₹${stats.totalSpend?.toLocaleString() || 0}`}
                    icon={<FiDollarSign />}
                    color="text-green-600"
                    bgColor="bg-green-50"
                />
                <StatCard
                    label="Ad Revenue"
                    value={`₹${stats.totalRevenue?.toLocaleString() || 0}`}
                    icon={<FiBarChart2 />}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                />
                <StatCard
                    label="Active Campaigns"
                    value={stats.activeCampaigns || 0}
                    icon={<FiPlay />}
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                />
                <StatCard
                    label="Pending Review"
                    value={stats.pendingCampaigns || 0}
                    icon={<FiCheckCircle />}
                    color="text-orange-600"
                    bgColor="bg-orange-50"
                />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 flex space-x-4">
                {['all', 'active', 'paused', 'draft', 'rejected'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${filter === f
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
                        No campaigns found for this filter.
                    </div>
                ) : (
                    campaigns.map(campaign => (
                        <div key={campaign._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-6">
                            {/* Image / Creative */}
                            <div className="w-full md:w-48 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                {campaign.creative?.images?.[0] ? (
                                    <img src={campaign.creative.images[0]} alt="" className="w-full h-full object-cover" />
                                ) : campaign.products?.[0]?.images?.[0]?.url ? (
                                    <img src={campaign.products[0].images[0].url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        <FiTarget className="text-4xl" />
                                    </div>
                                )}
                                <div className="absolute top-2 left-2">
                                    {getStatusBadge(campaign.status)}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900">{campaign.campaignName}</h3>
                                        <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                                            Seller: <span className="font-medium text-blue-600">{campaign.sellerId?.businessName}</span>
                                            • Type: <span className="capitalize">{campaign.campaignType.replace('_', ' ')}</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Budget</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            ₹{campaign.budget.amount.toLocaleString()}
                                            <span className="text-xs font-normal text-gray-500 ml-1">/{campaign.budget.type}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                    <div className="bg-gray-50 p-3 rounded text-sm">
                                        <span className="text-gray-500 block">Impressions</span>
                                        <span className="font-semibold">{campaign.metrics.impressions.toLocaleString()}</span>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded text-sm">
                                        <span className="text-gray-500 block">Clicks</span>
                                        <span className="font-semibold">{campaign.metrics.clicks.toLocaleString()}</span>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded text-sm">
                                        <span className="text-gray-500 block">CTR</span>
                                        <span className="font-semibold">{campaign.metrics.ctr.toFixed(2)}%</span>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded text-sm">
                                        <span className="text-gray-500 block">ROAS</span>
                                        <span className="font-semibold">{campaign.metrics.roas.toFixed(2)}x</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-row md:flex-col justify-center gap-2 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
                                {campaign.status !== 'active' && campaign.status !== 'rejected' && (
                                    <button
                                        onClick={() => updateStatus(campaign._id, 'active')}
                                        disabled={processingId === campaign._id}
                                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                    >
                                        <FiCheckCircle /> <span>Approve</span>
                                    </button>
                                )}

                                {campaign.status === 'active' && (
                                    <button
                                        onClick={() => updateStatus(campaign._id, 'paused')}
                                        disabled={processingId === campaign._id}
                                        className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                                    >
                                        <FiPause /> <span>Pause</span>
                                    </button>
                                )}

                                {campaign.status !== 'rejected' && (
                                    <button
                                        onClick={() => updateStatus(campaign._id, 'rejected')}
                                        disabled={processingId === campaign._id}
                                        className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
                                    >
                                        <FiXCircle /> <span>Reject</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

function StatCard({ label, value, icon, color, bgColor }) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${bgColor}`}>
                    <div className={`${color} text-xl`}>{icon}</div>
                </div>
                <div>
                    <p className="text-sm text-gray-600">{label}</p>
                    <p className="text-2xl font-semibold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    )
}
