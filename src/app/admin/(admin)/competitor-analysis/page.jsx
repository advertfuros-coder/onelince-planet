'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
    FiSearch,
    FiTrendingUp,
    FiTrendingDown,
    FiAlertCircle,
    FiExternalLink,
    FiRefreshCw,
    FiTarget,
    FiGlobe,
    FiDollarSign,
    FiArrowUp,
    FiArrowDown,
    FiMinus
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts'

export default function AdminCompetitorAnalysisPage() {
    const { token } = useAuth()
    const [trackings, setTrackings] = useState([])
    const [stats, setStats] = useState({
        totalTracked: 0,
        marketPosition: 'Neutral',
        percentageDiff: 0,
        productsCheaperThanMarket: 0,
        productsMoreExpensive: 0
    })
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        if (token) fetchData()
    }, [token])

    async function fetchData() {
        try {
            setLoading(true)
            const res = await axios.get('/api/admin/competitor-analysis', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                setTrackings(res.data.trackings)
                setStats(res.data.stats)
            }
        } catch (error) {
            console.error(error)
            toast.error('Failed to load competitor data')
        } finally {
            setLoading(false)
        }
    }

    // Helper for status colors
    const getDiffColor = (diff) => {
        if (diff < -5) return 'text-green-600' // Significantly cheaper
        if (diff > 5) return 'text-red-600'   // Significantly expensive
        return 'text-gray-600'                // Similar
    }

    const getDiffBadge = (diff) => {
        if (diff < -5) return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Best Price</span>
        if (diff > 5) return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Overpriced</span>
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">Competitive</span>
    }

    const chartData = [
        { name: 'Cheaper', value: stats.productsCheaperThanMarket, color: '#10B981' },
        { name: 'Expensive', value: stats.productsMoreExpensive, color: '#EF4444' },
    ]

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">Competitor Intelligence</h1>
                    <p className="text-gray-600 mt-1">Real-time market analysis and price monitoring</p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                    <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                    <span>Refresh Data</span>
                </button>
            </div>

            {/* Insight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1 space-y-4">
                    <StatCard
                        label="Total Products Tracked"
                        value={stats.totalTracked}
                        icon={<FiTarget />}
                        color="text-blue-600"
                        bgColor="bg-blue-50"
                    />
                    <StatCard
                        label="Market Positioning"
                        value={stats.marketPosition}
                        subValue={`${Math.abs(stats.percentageDiff).toFixed(1)}% ${stats.percentageDiff < 0 ? 'Cheaper' : 'Costlier'}`}
                        icon={<FiGlobe />}
                        color={stats.percentageDiff < 0 ? 'text-green-600' : 'text-orange-600'}
                        bgColor={stats.percentageDiff < 0 ? 'bg-green-50' : 'bg-orange-50'}
                    />
                </div>

                {/* Chart */}
                <div className="md:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Competitiveness Breakdown</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={80} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Main Data Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">Tracked Products</h2>
                    <div className="relative w-64">
                        <FiSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search product or seller..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                        <p className="mt-4 text-gray-600">Analyzing market data...</p>
                    </div>
                ) : trackings.length === 0 ? (
                    <div className="p-12 text-center">
                        <FiAlertCircle className="text-4xl text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600">No competitor tracking data found.</p>
                        <p className="text-sm text-gray-500">Sellers haven't set up any trackers yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-4 text-left">Product</th>
                                    <th className="px-6 py-4 text-left">Seller</th>
                                    <th className="px-6 py-4 text-right">Our Price</th>
                                    <th className="px-6 py-4 text-right">Competitor</th>
                                    <th className="px-6 py-4 text-right">Difference</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {trackings
                                    .filter(t =>
                                        t.productId?.name?.toLowerCase().includes(search.toLowerCase()) ||
                                        t.sellerId?.businessName?.toLowerCase().includes(search.toLowerCase())
                                    )
                                    .map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <img
                                                        src={item.productId?.images?.[0]?.url || '/placeholder.png'}
                                                        alt=""
                                                        className="w-10 h-10 rounded-md object-cover border"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-gray-900 truncate max-w-xs" title={item.productId?.name}>
                                                            {item.productId?.name}
                                                        </p>
                                                        <span className="text-xs text-gray-500">SKU: {item.productId?.sku || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <p className="font-medium text-gray-900">{item.sellerId?.businessName}</p>
                                                    <p className="text-xs text-gray-500">{item.sellerId?.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-gray-900">
                                                ₹{(item.currentPosition?.myPrice || 0).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="text-sm">
                                                    <p className="font-semibold text-gray-700">
                                                        ₹{(item.currentPosition?.lowestCompetitorPrice || 0).toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-gray-500">Lowest Found</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className={`flex flex-col items-end ${getDiffColor(item.currentPosition?.percentageDifference)}`}>
                                                    <div className="flex items-center space-x-1 font-semibold">
                                                        {item.currentPosition?.percentageDifference < 0 ? <FiArrowDown /> : item.currentPosition?.percentageDifference > 0 ? <FiArrowUp /> : <FiMinus />}
                                                        <span>{Math.abs(item.currentPosition?.percentageDifference || 0).toFixed(1)}%</span>
                                                    </div>
                                                    <span className="text-xs">
                                                        ₹{Math.abs(item.currentPosition?.priceDifference || 0).toLocaleString()} {item.currentPosition?.priceDifference < 0 ? 'less' : 'more'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {getDiffBadge(item.currentPosition?.percentageDifference)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {item.competitors?.[0]?.url && (
                                                    <a
                                                        href={item.competitors[0].url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 p-2 inline-block rounded-full hover:bg-blue-50"
                                                        title="View Competitor"
                                                    >
                                                        <FiExternalLink />
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

function StatCard({ label, value, subValue, icon, color, bgColor }) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${bgColor}`}>
                    <div className={`${color} text-xl`}>{icon}</div>
                </div>
                <div>
                    <p className="text-sm text-gray-600">{label}</p>
                    <div className="flex items-baseline space-x-2">
                        <p className="text-2xl font-semibold text-gray-900">{value}</p>
                        {subValue && <span className="text-sm font-medium text-gray-500">{subValue}</span>}
                    </div>
                </div>
            </div>
        </div>
    )
}
