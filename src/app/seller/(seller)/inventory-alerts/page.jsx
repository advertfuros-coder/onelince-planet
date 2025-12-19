// app/seller/(seller)/inventory-alerts/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
    FiAlertTriangle,
    FiAlertCircle,
    FiPackage,
    FiRefreshCw,
    FiCheck,
    FiX,
    FiTrendingDown,
    FiShoppingCart,
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'

export default function InventoryAlertsPage() {
    const { token } = useAuth()
    const [alerts, setAlerts] = useState([])
    const [stats, setStats] = useState({})
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('active')
    const [checking, setChecking] = useState(false)

    useEffect(() => {
        if (token) fetchAlerts()
    }, [token, filter])

    async function fetchAlerts() {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (filter !== 'all') params.append('status', filter)

            const res = await axios.get(`/api/seller/inventory-alerts?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.data.success) {
                setAlerts(res.data.alerts)
                setStats(res.data.stats)
            }
        } catch (error) {
            console.error('Error fetching alerts:', error)
            toast.error('Failed to load inventory alerts')
        } finally {
            setLoading(false)
        }
    }

    async function checkAllInventory() {
        try {
            setChecking(true)
            toast.loading('Checking inventory levels...')

            const res = await axios.post('/api/seller/inventory-alerts', {
                action: 'check_all'
            }, {
                headers: { Authorization: `Bearer ${token}` },
            })

            toast.dismiss()
            if (res.data.success) {
                toast.success(`Checked inventory. ${res.data.alertsCreated} new alerts created.`)
                fetchAlerts()
            }
        } catch (error) {
            toast.dismiss()
            console.error('Error checking inventory:', error)
            toast.error('Failed to check inventory')
        } finally {
            setChecking(false)
        }
    }

    async function handleAction(alertId, action, actionTaken = '') {
        try {
            const res = await axios.post('/api/seller/inventory-alerts', {
                action,
                alertId,
                actionTaken
            }, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.data.success) {
                toast.success(res.data.message)
                fetchAlerts()
            }
        } catch (error) {
            console.error('Error performing action:', error)
            toast.error('Action failed')
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">📦 Inventory Alerts</h1>
                        <p className="mt-2 text-red-100">Monitor stock levels and get notified when action is needed</p>
                    </div>
                    <button
                        onClick={checkAllInventory}
                        disabled={checking}
                        className="flex items-center space-x-2 px-6 py-3 bg-white text-red-600 rounded-lg hover:bg-red-50 font-semibold shadow-lg transition-all disabled:opacity-50"
                    >
                        <FiRefreshCw className={checking ? 'animate-spin' : ''} />
                        <span>Check All Inventory</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    icon={<FiAlertTriangle />}
                    label="Total Alerts"
                    value={stats.total || 0}
                    color="blue"
                />
                <StatCard
                    icon={<FiAlertCircle />}
                    label="Active Alerts"
                    value={stats.active || 0}
                    color="orange"
                />
                <StatCard
                    icon={<FiPackage />}
                    label="Critical"
                    value={stats.critical || 0}
                    color="red"
                />
                <StatCard
                    icon={<FiTrendingDown />}
                    label="Out of Stock"
                    value={stats.byType?.out_of_stock || 0}
                    color="purple"
                />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-semibold text-gray-700">Filter:</span>
                    {['all', 'active', 'acknowledged', 'resolved'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Alerts List */}
            {alerts.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Alerts</h3>
                    <p className="text-gray-600 mb-6">
                        {filter === 'all'
                            ? 'All inventory levels are healthy!'
                            : `No ${filter} alerts at the moment.`}
                    </p>
                    <button
                        onClick={checkAllInventory}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                    >
                        Check Inventory Now
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {alerts.map((alert) => (
                        <AlertCard key={alert._id} alert={alert} onAction={handleAction} />
                    ))}
                </div>
            )}
        </div>
    )
}

function AlertCard({ alert, onAction }) {
    const priorityColors = {
        critical: 'bg-red-100 text-red-700 border-red-300',
        high: 'bg-orange-100 text-orange-700 border-orange-300',
        medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        low: 'bg-blue-100 text-blue-700 border-blue-300',
    }

    const typeIcons = {
        out_of_stock: <FiAlertTriangle className="w-5 h-5" />,
        low_stock: <FiAlertCircle className="w-5 h-5" />,
        restock_needed: <FiShoppingCart className="w-5 h-5" />,
        overstock: <FiPackage className="w-5 h-5" />,
    }

    const typeLabels = {
        out_of_stock: 'Out of Stock',
        low_stock: 'Low Stock',
        restock_needed: 'Restock Needed',
        overstock: 'Overstock',
    }

    return (
        <div className={`bg-white rounded-lg shadow-md border-2 p-6 ${priorityColors[alert.priority]}`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                    {alert.productId?.images?.[0] && (
                        <img
                            src={typeof alert.productId.images[0] === 'string'
                                ? alert.productId.images[0]
                                : alert.productId.images[0].url}
                            alt={alert.productId.name}
                            className="w-16 h-16 object-cover rounded-lg"
                        />
                    )}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{alert.productId?.name}</h3>
                        <p className="text-sm text-gray-600">SKU: {alert.productId?.sku}</p>
                        <div className="flex items-center space-x-2 mt-2">
                            <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${priorityColors[alert.priority]}`}>
                                {typeIcons[alert.alertType]}
                                <span>{typeLabels[alert.alertType]}</span>
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold uppercase">
                                {alert.priority}
                            </span>
                        </div>
                    </div>
                </div>

                {alert.status === 'active' && (
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => onAction(alert._id, 'acknowledge')}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                            title="Acknowledge"
                        >
                            <FiCheck className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => onAction(alert._id, 'dismiss')}
                            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all"
                            title="Dismiss"
                        >
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Stock Info */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Current Stock</p>
                    <p className="text-2xl font-bold text-gray-900">{alert.currentStock}</p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Threshold</p>
                    <p className="text-2xl font-bold text-gray-900">{alert.threshold}</p>
                </div>
                {alert.recommendedRestock && (
                    <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Recommended Restock</p>
                        <p className="text-2xl font-bold text-green-600">{alert.recommendedRestock}</p>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full ${alert.currentStock === 0 ? 'bg-red-600' :
                            alert.currentStock <= alert.threshold / 2 ? 'bg-orange-600' :
                                'bg-yellow-600'
                            }`}
                        style={{ width: `${Math.min((alert.currentStock / alert.threshold) * 100, 100)}%` }}
                    ></div>
                </div>
            </div>

            {/* Actions */}
            {alert.status === 'active' && alert.recommendedRestock && (
                <div className="space-y-3 pt-4 border-t">
                    <p className="text-sm text-gray-600">
                        <strong>Action Required:</strong> Restock {alert.recommendedRestock} units
                    </p>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => onAction(alert._id, 'trigger_auto_restock')}
                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold flex items-center justify-center space-x-2"
                        >
                            <FiShoppingCart className="w-4 h-4" />
                            <span>Auto-Restock from Supplier</span>
                        </button>
                        <button
                            onClick={() => onAction(alert._id, 'resolve', `Restocked ${alert.recommendedRestock} units`)}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                        >
                            Mark as Restocked
                        </button>
                    </div>
                </div>
            )}

            {/* Status Info */}
            {alert.status !== 'active' && (
                <div className="pt-4 border-t text-sm text-gray-600">
                    <p><strong>Status:</strong> {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}</p>
                    {alert.actionTaken && <p><strong>Action:</strong> {alert.actionTaken}</p>}
                    {alert.resolvedAt && (
                        <p><strong>Resolved:</strong> {new Date(alert.resolvedAt).toLocaleString()}</p>
                    )}
                </div>
            )}
        </div>
    )
}

function StatCard({ icon, label, value, color }) {
    const colors = {
        blue: 'bg-blue-100 text-blue-600',
        orange: 'bg-orange-100 text-orange-600',
        red: 'bg-red-100 text-red-600',
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
