// app/seller/(seller)/insights/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import Link from 'next/link'
import {
    FiTrendingUp,
    FiTrendingDown,
    FiDollarSign,
    FiShoppingCart,
    FiPackage,
    FiStar,
    FiEye,
    FiArrowLeft,
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'

export default function SellerInsightsPage() {
    const { token } = useAuth()
    const [performance, setPerformance] = useState(null)
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState('30')

    useEffect(() => {
        if (token) fetchPerformance()
    }, [token, period])

    async function fetchPerformance() {
        try {
            setLoading(true)
            const res = await axios.get(`/api/seller/products/performance?period=${period}`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.data.success) {
                setPerformance(res.data.performance)
            }
        } catch (error) {
            console.error('Error fetching performance:', error)
            toast.error('Failed to load performance data')
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (value) => `₹${(value || 0).toLocaleString('en-IN')}`

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
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <Link
                            href="/seller/products"
                            className="inline-flex items-center space-x-2 text-white/80 hover:text-white mb-2 transition-colors"
                        >
                            <FiArrowLeft />
                            <span>Back to Products</span>
                        </Link>
                        <h1 className="text-3xl font-bold">📊 Performance Insights</h1>
                        <p className="mt-2 text-blue-100">Track your product performance and sales metrics</p>
                    </div>
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-lg focus:ring-2 focus:ring-white/50"
                    >
                        <option value="7" className="text-gray-900">Last 7 Days</option>
                        <option value="30" className="text-gray-900">Last 30 Days</option>
                        <option value="90" className="text-gray-900">Last 90 Days</option>
                    </select>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    icon={<FiDollarSign />}
                    label="Total Revenue"
                    value={formatCurrency(performance?.summary?.totalRevenue)}
                    color="green"
                />
                <MetricCard
                    icon={<FiShoppingCart />}
                    label="Total Orders"
                    value={performance?.summary?.totalOrders || 0}
                    color="blue"
                />
                <MetricCard
                    icon={<FiPackage />}
                    label="Units Sold"
                    value={performance?.summary?.totalUnits || 0}
                    color="purple"
                />
                <MetricCard
                    icon={<FiStar />}
                    label="Average Rating"
                    value={(performance?.summary?.averageRating || 0).toFixed(1)}
                    color="yellow"
                />
            </div>

            {/* Top Performing Products */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-900">Top Performing Products</h2>
                    <p className="text-sm text-gray-600">Ranked by revenue in the selected period</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Rank</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Product</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Revenue</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Orders</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Units</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Stock</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Rating</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {performance?.products?.slice(0, 10).map((product, index) => (
                                <tr key={product.productId} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-sm">
                                            {index + 1}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            {product.image ? (
                                                <img
                                                    src={typeof product.image === 'string' ? product.image : product.image.url}
                                                    alt={product.name}
                                                    className="w-12 h-12 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <FiPackage className="text-gray-400" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900">{product.name}</p>
                                                <Link
                                                    href={`/seller/products/${product.productId}`}
                                                    className="text-sm text-blue-600 hover:underline"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className="font-bold text-gray-900">{formatCurrency(product.totalRevenue)}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className="font-semibold text-gray-900">{product.totalOrders}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className="font-semibold text-gray-900">{product.totalUnits}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span
                                            className={`font-semibold ${product.stock <= 10 ? 'text-red-600' : 'text-gray-900'
                                                }`}
                                        >
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center space-x-1">
                                            <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                                            <span className="font-semibold text-gray-900">
                                                {product.rating.toFixed(1)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center space-y-1">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${product.isActive
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                    }`}
                                            >
                                                {product.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                            {!product.isApproved && (
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                                                    Pending
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {(!performance?.products || performance.products.length === 0) && (
                    <div className="text-center py-12">
                        <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No performance data available for this period</p>
                    </div>
                )}
            </div>

            {/* Insights & Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-bold text-blue-900 mb-3 flex items-center space-x-2">
                        <FiTrendingUp className="w-5 h-5" />
                        <span>Growth Opportunities</span>
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                        <li>• Products with high views but low sales need better descriptions</li>
                        <li>• Low stock items are your best sellers - restock soon!</li>
                        <li>• Consider bundling top products for higher order values</li>
                    </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h3 className="font-bold text-purple-900 mb-3 flex items-center space-x-2">
                        <FiStar className="w-5 h-5" />
                        <span>Performance Tips</span>
                    </h3>
                    <ul className="space-y-2 text-sm text-purple-800">
                        <li>• Maintain 4+ star ratings to boost visibility</li>
                        <li>• Update product images for better conversion</li>
                        <li>• Respond to reviews to build customer trust</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

function MetricCard({ icon, label, value, color }) {
    const colorClasses = {
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        purple: 'bg-purple-100 text-purple-600',
        yellow: 'bg-yellow-100 text-yellow-600',
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
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
