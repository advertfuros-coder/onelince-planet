// app/seller/(seller)/inventory/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
    Package,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    History,
    TrendingUp,
    RefreshCw,
    Plus,
    Minus,
    Box,
    Warehouse,
    Activity,
    ChevronRight,
    Edit2,
    Database,
    Zap,
    Download,
    Truck
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    AreaChart,
    Area
} from 'recharts'

export default function InventoryMasterPage() {
    const { token } = useAuth()
    const [inventory, setInventory] = useState([])
    const [warehouses, setWarehouses] = useState([])
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedWarehouse, setSelectedWarehouse] = useState('all')
    const [showAdjustmentModal, setShowAdjustmentModal] = useState(null) // productId
    const [showTransferModal, setShowTransferModal] = useState(null) // productId

    useEffect(() => {
        if (token) {
            fetchData()
            fetchLogs()
        }
    }, [token, search, selectedWarehouse])

    async function fetchData() {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                ...(search && { search }),
                ...(selectedWarehouse !== 'all' && { warehouse: selectedWarehouse }),
            })

            const res = await axios.get(`/api/seller/inventory-list?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                setInventory(res.data.inventory)
                setWarehouses(res.data.warehouses)
            }
        } catch (error) {
            toast.error('Failed to load inventory data')
        } finally {
            setLoading(false)
        }
    }

    async function fetchLogs() {
        try {
            const res = await axios.get('/api/seller/inventory/logs', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                setLogs(res.data.logs)
            }
        } catch (error) {
            console.error('Logs fetch error')
        }
    }

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase())
    )

    const stats = {
        totalUnits: inventory.reduce((sum, item) => sum + item.totalStock, 0),
        lowStockItems: inventory.filter(item => item.totalStock <= item.lowStockThreshold).length,
        outOfStock: inventory.filter(item => item.totalStock === 0).length,
        stockValue: '₹' + (inventory.reduce((sum, item) => sum + (item.totalStock * 500), 0) / 100000).toFixed(1) + 'L' // Mock calculation
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 font-semibold uppercase tracking-widest text-[10px]">Loading Inventory...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8">
            <div className="max-w-[1700px] mx-auto space-y-8">

                {/* Modern Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                <Database size={18} />
                            </div>
                            <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Stock Management</span>
                        </div>
                        <h1 className="text-4xl font-semibold text-gray-900 tracking-tighter">Inventory Manager <span className="text-emerald-600">.</span></h1>
                        <p className="text-gray-500 font-medium mt-1 uppercase text-[10px] tracking-widest">Track and manage your stock levels across all warehouses</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="hidden md:flex items-center gap-2 px-6 py-4 bg-white border border-gray-100 rounded-[1.5rem] font-semibold uppercase tracking-widest text-[11px] text-gray-600 hover:bg-gray-50 transition-all">
                            <Download size={18} />
                            Export Report
                        </button>
                        <button
                            className="px-8 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-semibold uppercase text-[11px] tracking-widest shadow-2xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Plus size={18} />
                            Add Stock
                        </button>
                    </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <InvStatCard label="Total Stock" value={stats.totalUnits.toLocaleString()} trend="+12.4%" icon={Package} color="emerald" />
                    <InvStatCard label="Low Stock Items" value={stats.lowStockItems} trend={`${((stats.lowStockItems / inventory.length) * 100).toFixed(0)}% of total`} icon={AlertTriangle} color="orange" alert={stats.lowStockItems > 0} />
                    <InvStatCard label="Out of Stock" value={stats.outOfStock} trend="Requires Action" icon={Box} color="rose" alert={stats.outOfStock > 0} />
                    <InvStatCard label="Total Stock Value" value={stats.stockValue} trend="Market Value" icon={TrendingUp} color="blue" />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

                    {/* Inventory Monitoring Grid */}
                    <div className="xl:col-span-3 space-y-6">

                        {/* Control Bar */}
                        <div className="bg-white rounded-[2rem] p-4 lg:p-6 shadow-sm border border-gray-100/50 flex flex-col lg:flex-row gap-4 items-center justify-between">
                            <div className="relative group w-full lg:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by SKU, Name or Batch..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl text-[13px] font-semibold focus:ring-2 focus:ring-emerald-100 transition-all"
                                />
                            </div>

                            <div className="flex items-center gap-3 w-full lg:w-auto">
                                <select
                                    value={selectedWarehouse}
                                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                                    className="flex-1 lg:w-56 px-4 py-3.5 bg-gray-50 border-none rounded-2xl text-[10px] font-semibold uppercase tracking-widest focus:ring-2 focus:ring-emerald-100"
                                >
                                    <option value="all">All Warehouses</option>
                                    {warehouses.map(wh => (
                                        <option key={wh._id} value={wh._id}>{wh.name}</option>
                                    ))}
                                </select>
                                <button className="p-3.5 bg-gray-50 text-gray-400 rounded-2xl hover:text-emerald-600 transition-all">
                                    <Filter size={18} />
                                </button>
                                <button onClick={fetchData} className="p-3.5 bg-gray-50 text-gray-400 rounded-2xl hover:text-emerald-600 transition-all">
                                    <RefreshCw size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Inventory Matrix Table */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100/50 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-50 bg-gray-50/30">
                                            <th className="px-8 py-5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Product Details</th>
                                            <th className="px-6 py-5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-widest">SKU</th>
                                            <th className="px-6 py-5 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Total Stock</th>
                                            <th className="px-6 py-5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Warehouse Locations</th>
                                            <th className="px-8 py-5 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredInventory.map((item) => (
                                            <tr key={item._id} className="group hover:bg-gray-50/30 transition-all">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-gray-50 overflow-hidden border border-gray-100 p-1">
                                                            {item.image ? (
                                                                <img src={item.image} alt="" className="w-full h-full object-cover rounded-lg" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={20} /></div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-gray-900 truncate tracking-tight">{item.name}</p>
                                                            <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-tighter">{item.category}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 font-semibold text-xs text-slate-400">{item.sku}</td>
                                                <td className="px-6 py-6 text-center">
                                                    <div className={`inline-flex flex-col items-center px-4 py-2 rounded-2xl ${item.totalStock <= item.lowStockThreshold ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                        <span className="text-lg font-semibold leading-none">{item.totalStock}</span>
                                                        <span className="text-[8px] font-semibold uppercase tracking-widest mt-1">Units</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex -space-x-2">
                                                        {item.warehouseBreakdown.map((wh, idx) => (
                                                            <div
                                                                key={wh.warehouseId}
                                                                title={`${wh.warehouseName}: ${wh.quantity} units`}
                                                                className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-semibold ${wh.quantity > 0 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}
                                                            >
                                                                {wh.warehouseName.charAt(0)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setShowAdjustmentModal(item)}
                                                            className="p-3 bg-gray-50 hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 rounded-xl transition-all"
                                                            title="Adjust Stock"
                                                        >
                                                            <Activity size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => setShowTransferModal(item)}
                                                            className="p-3 bg-gray-50 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-xl transition-all"
                                                            title="Transfer Stock"
                                                        >
                                                            <Truck size={16} />
                                                        </button>
                                                        <button className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-indigo-600 rounded-xl transition-all">
                                                            <ChevronRight size={16} />
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

                    {/* Movement History & Insights */}
                    <div className="xl:col-span-1 space-y-6">

                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100/50">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                    <History size={16} className="text-indigo-600" /> Movement Logs
                                </h3>
                                <button className="text-[10px] font-semibold text-indigo-600 uppercase hover:underline">Full Audit</button>
                            </div>

                            <div className="space-y-6">
                                {logs.map((log, idx) => (
                                    <div key={log._id} className="flex gap-4 group">
                                        <div className={`mt-1 h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${log.type === 'addition' ? 'bg-emerald-50 text-emerald-600' :
                                            log.type === 'sale' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                                            }`}>
                                            {log.type === 'addition' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-semibold text-gray-900 uppercase leading-none tracking-tight">{log.productId?.name}</p>
                                            <p className="text-[9px] font-semibold text-gray-500 mt-1">
                                                {log.type.toUpperCase()} • {log.quantity} units @ {log.warehouseId?.name}
                                            </p>
                                            <p className="text-[8px] font-medium text-gray-400 mt-1">{new Date(log.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-[#1E3A8A] rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700" />
                            <Zap className="text-amber-400 mb-4" />
                            <h4 className="text-lg font-semibold tracking-tight leading-tight">Smart Stock Alerts</h4>
                            <p className="text-blue-100/60 text-xs font-medium mt-2 leading-relaxed">
                                Demand for "Spectral Entity X1" is up 40%. Recommend increasing buffer stock at Bangalore Hub by 200 units.
                            </p>
                            <button className="w-full mt-6 py-4 bg-white/10 hover:bg-white text-white hover:text-indigo-900 rounded-2xl text-[10px] font-semibold uppercase tracking-widest border border-white/20 hover:border-white transition-all">
                                Restock Automatically
                            </button>
                        </div>
                    </div>
                </div>

                {/* Adjustment Modal */}
                <AnimatePresence>
                    {showAdjustmentModal && (
                        <AdjustmentModal
                            item={showAdjustmentModal}
                            warehouses={warehouses}
                            onClose={() => setShowAdjustmentModal(null)}
                            onSuccess={() => {
                                setShowAdjustmentModal(null)
                                fetchData()
                                fetchLogs()
                            }}
                        />
                    )}
                    {showTransferModal && (
                        <TransferModal
                            item={showTransferModal}
                            warehouses={warehouses}
                            onClose={() => setShowTransferModal(null)}
                            onSuccess={() => {
                                setShowTransferModal(null)
                                fetchData()
                                fetchLogs()
                            }}
                        />
                    )}
                </AnimatePresence>

            </div>
        </div>
    )
}

function InvStatCard({ label, value, trend, icon: Icon, color, alert }) {
    const colors = {
        emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        orange: 'text-orange-600 bg-orange-50 border-orange-100',
        rose: 'text-rose-600 bg-rose-50 border-rose-100',
        blue: 'text-blue-600 bg-blue-50 border-blue-100',
    }

    return (
        <div className={`bg-white p-6 rounded-[2.2rem] shadow-sm border ${alert ? 'border-rose-100' : 'border-gray-100/50'} group relative overflow-hidden`}>
            {alert && <div className="absolute top-0 right-0 w-8 h-8 bg-rose-500/10 rounded-bl-[2rem] flex items-center justify-center"><div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" /></div>}
            <div className="flex items-center gap-4 relative z-10">
                <div className={`p-4 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform duration-500 bg-opacity-100`}>
                    <Icon size={22} />
                </div>
                <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-semibold text-gray-900 tracking-tight">{value}</p>
                        <span className={`text-[10px] font-semibold ${alert ? 'text-rose-500' : 'text-emerald-500'}`}>{trend}</span>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-gray-50/30 -mb-12 -mr-12 rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-700" />
        </div>
    )
}

function TransferModal({ item, warehouses, onClose, onSuccess }) {
    const { token } = useAuth()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        productId: item._id,
        fromWarehouseId: warehouses[0]?._id || '',
        toWarehouseId: warehouses[1]?._id || '',
        quantity: 0,
        reason: ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (formData.quantity <= 0) return toast.error('Quantity must be greater than zero')
        if (formData.fromWarehouseId === formData.toWarehouseId) return toast.error('Source and destination must be different')

        try {
            setLoading(true)
            const res = await axios.post('/api/seller/inventory/transfer', formData, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                toast.success('Stock transferred successfully')
                onSuccess()
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Transfer failed')
        } finally {
            setLoading(false)
        }
    }

    const sourceWarehouse = item.warehouseBreakdown.find(w => w.warehouseId === formData.fromWarehouseId)
    const maxAvailable = sourceWarehouse?.quantity || 0

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-100 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full overflow-hidden"
            >
                <div className="p-10 bg-indigo-50/50 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Transfer Stock</h2>
                        <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest mt-1">Move stock between warehouses</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors">
                        <Plus size={20} className="rotate-45" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <img src={item.image} className="w-12 h-12 object-cover rounded-lg" alt="" />
                        <div>
                            <p className="text-[11px] font-semibold text-gray-900 uppercase leading-none">{item.name}</p>
                            <p className="text-[9px] font-semibold text-indigo-600 mt-1">Total Stock: {item.totalStock} Units</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-1">From Warehouse</label>
                            <select
                                value={formData.fromWarehouseId}
                                onChange={(e) => setFormData({ ...formData, fromWarehouseId: e.target.value })}
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-indigo-100 transition-all"
                            >
                                {warehouses.map(wh => (
                                    <option key={wh._id} value={wh._id}>{wh.name}</option>
                                ))}
                            </select>
                            <p className="text-[8px] font-semibold text-indigo-600 uppercase ml-1">Available: {maxAvailable} Units</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-1">To Warehouse</label>
                            <select
                                value={formData.toWarehouseId}
                                onChange={(e) => setFormData({ ...formData, toWarehouseId: e.target.value })}
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-indigo-100 transition-all"
                            >
                                {warehouses.map(wh => (
                                    <option key={wh._id} value={wh._id}>{wh.name} {wh._id === formData.fromWarehouseId ? '(Source)' : ''}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-1">Transfer Quantity</label>
                        <input
                            type="number"
                            required
                            max={maxAvailable}
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-lg font-semibold focus:ring-2 focus:ring-indigo-100 transition-all"
                            placeholder="0"
                        />
                        <p className="text-[8px] font-semibold text-gray-400 ml-1">Units will be moved from source to destination warehouse.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-1">Transfer Reason</label>
                        <input
                            type="text"
                            required
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-indigo-100 transition-all"
                            placeholder="e.g. Regional demand balancing"
                        />
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-8 py-5 border-2 border-gray-100 text-gray-400 rounded-3xl text-[11px] font-semibold uppercase tracking-widest hover:bg-gray-50 transition-all"
                        >
                            Abort
                        </button>
                        <button
                            type="submit"
                            disabled={loading || formData.quantity <= 0 || formData.quantity > maxAvailable}
                            className="flex-1 px-8 py-5 bg-indigo-600 text-white rounded-3xl text-[11px] font-semibold uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 disabled:opacity-50 transition-all"
                        >
                            {loading ? 'Transferring...' : 'Transfer Stock'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}

function AdjustmentModal({ item, warehouses, onClose, onSuccess }) {
    const { token } = useAuth()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        productId: item._id,
        warehouseId: '', // Force user to select
        type: 'addition',
        quantity: 0,
        reason: ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validate warehouse selection
        if (!formData.warehouseId) {
            return toast.error('Please select a warehouse')
        }

        if (formData.quantity <= 0) {
            return toast.error('Quantity must be greater than zero')
        }

        try {
            setLoading(true)
            const res = await axios.post('/api/seller/inventory', formData, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                toast.success('Stock adjusted successfully')
                onSuccess()
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Adjustment failed'
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-100 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full overflow-hidden"
            >
                <div className="p-10 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Stock Adjustment</h2>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">Update Stock Levels</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors">
                        <Plus size={20} className="rotate-45" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <img src={item.image} className="w-12 h-12 object-cover rounded-lg" alt="" />
                        <div>
                            <p className="text-[11px] font-semibold text-gray-900 uppercase leading-none">{item.name}</p>
                            <p className="text-[9px] font-semibold text-emerald-600 mt-1">Global Stock: {item.totalStock} Units</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-1">Warehouse</label>
                            <select
                                value={formData.warehouseId}
                                onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-emerald-100 transition-all"
                                required
                            >
                                <option value="">Select Warehouse</option>
                                {warehouses.map(wh => (
                                    <option key={wh._id} value={wh._id}>{wh.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-1">Operation</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-emerald-100 transition-all"
                            >
                                <option value="addition">Addition (+)</option>
                                <option value="subtraction">Removal (-)</option>
                                <option value="damaged">Damage Report</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-1">Quantity</label>
                        <input
                            type="number"
                            required
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-lg font-semibold focus:ring-2 focus:ring-emerald-100 transition-all"
                            placeholder="0"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-1">Adjustment Reason</label>
                        <input
                            type="text"
                            required
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-emerald-100 transition-all"
                            placeholder="e.g. Restock from supplier, Damage in transit"
                        />
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-8 py-5 border-2 border-gray-100 text-gray-400 rounded-3xl text-[11px] font-semibold uppercase tracking-widest hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || formData.quantity <= 0}
                            className="flex-1 px-8 py-5 bg-emerald-600 text-white rounded-3xl text-[11px] font-semibold uppercase tracking-widest hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 disabled:opacity-50 transition-all"
                        >
                            {loading ? 'Processing...' : 'Update Stock'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
