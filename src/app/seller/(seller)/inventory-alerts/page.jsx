// app/seller/(seller)/inventory-alerts/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
    AlertTriangle,
    AlertCircle,
    Package,
    RefreshCw,
    Check,
    X,
    TrendingDown,
    ShoppingCart,
    Clock,
    Zap,
    Search,
    ChevronRight,
    ArrowUpRight,
    ShieldAlert
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
            toast.loading('Running Global Inventory Audit...')

            const res = await axios.post('/api/seller/inventory-alerts', {
                action: 'check_all'
            }, {
                headers: { Authorization: `Bearer ${token}` },
            })

            toast.dismiss()
            if (res.data.success) {
                toast.success(`Audit Complete: ${res.data.alertsCreated} anomalies detected.`)
                fetchAlerts()
            }
        } catch (error) {
            toast.dismiss()
            console.error('Error checking inventory:', error)
            toast.error('Audit sequence failed')
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
            toast.error('Resolution failed')
        }
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8">
            <div className="max-w-[1500px] mx-auto space-y-8">

                {/* Modern Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <ShieldAlert size={18} />
                            </div>
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Safety Protocol</span>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Inventory Guard</h1>
                        <p className="text-gray-500 font-medium mt-1">Real-time depletion monitoring and restock intelligence</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={checkAllInventory}
                            disabled={checking}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 active:scale-95 disabled:opacity-50"
                        >
                            <RefreshCw size={18} className={checking ? 'animate-spin' : ''} />
                            <span>Run Global Audit</span>
                        </button>
                    </div>
                </div>

                {/* Stock Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <AlertStatCard
                        label="Active Alerts"
                        value={stats.active || 0}
                        icon={AlertTriangle}
                        color="amber"
                        delay={0.1}
                        alert={stats.active > 0}
                    />
                    <AlertStatCard
                        label="Stock-Outs"
                        value={stats.byType?.out_of_stock || 0}
                        icon={TrendingDown}
                        color="rose"
                        delay={0.2}
                        alert={stats.byType?.out_of_stock > 0}
                    />
                    <AlertStatCard
                        label="High Priority"
                        value={stats.critical || 0}
                        icon={Zap}
                        color="orange"
                        delay={0.3}
                    />
                    <AlertStatCard
                        label="Efficiency"
                        value="94%"
                        icon={Check}
                        color="emerald"
                        delay={0.4}
                    />
                </div>

                {/* Filter & Search */}
                <div className="bg-white rounded-[2rem] p-4 lg:p-6 shadow-sm border border-gray-100/50 flex flex-col lg:flex-row gap-6 items-center">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto invisible-scrollbar">
                        {['all', 'active', 'acknowledged', 'resolved'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight transition-all shrink-0 ${filter === f
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="relative group w-full lg:w-96 lg:ml-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Filter alerts by SKU..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                    </div>
                </div>

                {/* Alerts List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Scanning Warehouses...</p>
                        </div>
                    ) : alerts.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white rounded-[2.5rem] p-32 text-center border border-gray-100/50 shadow-sm"
                        >
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-10 h-10 text-emerald-400" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Inventory levels optimal</h3>
                            <p className="text-gray-500 font-medium mt-2 max-w-sm mx-auto">No critical depletion detected across your catalog.</p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {alerts.map((alert, idx) => (
                                <ModernAlertCard key={alert._id} alert={alert} onAction={handleAction} delay={idx * 0.05} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function AlertStatCard({ label, value, icon: Icon, color, delay, alert }) {
    const colors = {
        blue: 'text-blue-600 bg-blue-50',
        amber: 'text-amber-600 bg-amber-50',
        rose: 'text-rose-600 bg-rose-50',
        orange: 'text-orange-600 bg-orange-50',
        emerald: 'text-emerald-600 bg-emerald-50',
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-white p-6 rounded-[2.2rem] shadow-sm border border-gray-100/50 group relative overflow-hidden"
        >
            {alert && <div className="absolute top-0 right-0 w-8 h-8 bg-rose-500/10 rounded-bl-[2rem] flex items-center justify-center"><div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" /></div>}
            <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform duration-500`}>
                    <Icon size={22} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-2xl font-black text-gray-900 tracking-tight">{value || 0}</p>
                </div>
            </div>
        </motion.div>
    )
}

function ModernAlertCard({ alert, onAction, delay }) {
    const priorityColors = {
        critical: 'text-rose-600 bg-rose-50 border-rose-100',
        high: 'text-orange-600 bg-orange-50 border-orange-100',
        medium: 'text-amber-600 bg-amber-50 border-amber-100',
        low: 'text-blue-600 bg-blue-50 border-blue-100',
    }

    const typeIcons = {
        out_of_stock: <AlertTriangle size={18} />,
        low_stock: <AlertCircle size={18} />,
        restock_needed: <ShoppingCart size={18} />,
        overstock: <Package size={18} />,
    }

    const typeLabels = {
        out_of_stock: 'Critical Depletion',
        low_stock: 'Low Stock Hazard',
        restock_needed: 'Restock Suggested',
        overstock: 'Surplus Warning',
    }

    const stockPercentage = Math.min((alert.currentStock / (alert.threshold || 1)) * 100, 100);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
            className="bg-white rounded-[2.5rem] p-8 border border-gray-100/50 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative"
        >
            <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 border border-gray-100 overflow-hidden p-1 group-hover:scale-105 transition-transform duration-500">
                        {alert.productId?.images?.[0]?.url ? (
                            <img src={alert.productId.images[0].url} className="w-full h-full object-cover rounded-xl" />
                        ) : <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={24} /></div>}
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1.5">
                            <h4 className="text-lg font-black text-gray-900 tracking-tighter leading-none">{alert.productId?.name}</h4>
                            <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-tighter ${priorityColors[alert.priority]}`}>
                                {alert.priority}
                            </span>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{alert.productId?.sku}</p>
                    </div>
                </div>

                {alert.status === 'active' && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => onAction(alert._id, 'acknowledge')}
                            className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all shadow-sm"
                        >
                            <Check size={18} />
                        </button>
                        <button
                            onClick={() => onAction(alert._id, 'dismiss')}
                            className="p-3 bg-gray-50 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-3 gap-8 mb-8 border-y border-gray-50 py-8">
                <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Package size={10} /> Live Units</p>
                    <p className={`text-2xl font-black ${alert.currentStock === 0 ? 'text-rose-600' : 'text-gray-900'}`}>{alert.currentStock}</p>
                </div>
                <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Clock size={10} /> Safe Zone</p>
                    <p className="text-2xl font-black text-gray-900">{alert.threshold}</p>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center justify-end gap-1.5">Restock <ArrowUpRight size={10} /></p>
                    <p className="text-2xl font-black text-emerald-600">+{alert.recommendedRestock || 0}</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-tight flex items-center gap-1.5 ${alert.currentStock === 0 ? 'text-rose-600' : 'text-amber-600'
                            }`}>
                            {typeIcons[alert.alertType]} {typeLabels[alert.alertType]}
                        </span>
                        <span className="text-[10px] font-black text-gray-400">{Math.round(stockPercentage)}% Cap</span>
                    </div>
                    <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${stockPercentage}%` }}
                            className={`h-full rounded-full ${alert.currentStock === 0 ? 'bg-rose-500' :
                                    alert.currentStock <= alert.threshold / 2 ? 'bg-orange-500' :
                                        'bg-amber-500'
                                }`}
                        />
                    </div>
                </div>

                {alert.status === 'active' && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => onAction(alert._id, 'trigger_auto_restock')}
                            className="flex-1 py-3.5 bg-gray-900 text-white rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Zap size={14} className="text-amber-400" />
                            Procure Now
                        </button>
                        <button
                            onClick={() => onAction(alert._id, 'resolve', `Restocked ${alert.recommendedRestock} units`)}
                            className="flex-1 py-3.5 bg-blue-600 text-white rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Check size={14} />
                            Resolve
                        </button>
                    </div>
                )}

                {alert.status !== 'active' && (
                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-blue-600">
                            <Check size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight">Status: {alert.status}</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Resolved on {new Date(alert.resolvedAt || alert.updatedAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
