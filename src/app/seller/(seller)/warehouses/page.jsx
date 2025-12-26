// app/seller/(seller)/warehouses/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import Link from 'next/link'
import {
    Plus,
    MapPin,
    Package,
    TrendingUp,
    Settings,
    ArrowRight,
    Edit2,
    Trash2,
    Box,
    Globe,
    Zap,
    History,
    MoreVertical,
    Activity,
    ChevronRight,
    Layout
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
    PieChart,
    Pie
} from 'recharts'

export default function WarehousesPage() {
    const { token } = useAuth()
    const [warehouses, setWarehouses] = useState([])
    const [stats, setStats] = useState({})
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)

    useEffect(() => {
        if (token) fetchWarehouses()
    }, [token])

    async function fetchWarehouses() {
        try {
            setLoading(true)
            const res = await axios.get('/api/seller/warehouses', {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.data.success) {
                setWarehouses(res.data.warehouses)
                setStats(res.data.stats)
            }
        } catch (error) {
            console.error('Error fetching warehouses:', error)
            toast.error('Failed to load storage terminals')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Accessing Storage Protocols...</p>
            </div>
        )
    }

    const chartData = warehouses.map(wh => ({
        name: wh.name,
        stock: wh.metrics?.totalStock || 0,
        capacity: wh.capacity?.total || 1000,
        used: wh.capacity?.used || 0
    }))

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8">
            <div className="max-w-[1600px] mx-auto space-y-8">
                
                {/* Modern Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                           <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                              <Box size={18} />
                           </div>
                           <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Inventory Architecture</span>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Global Hub Terminals</h1>
                        <p className="text-gray-500 font-medium mt-1">Orchestrate stock distribution across your verified storage points</p>
                    </div>

                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-widest shadow-2xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Plus size={18} />
                        Establish New Hub
                    </button>
                </div>

                {/* Status Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   <MetricCard label="Active Nodes" value={stats.active || 0} icon={Globe} color="indigo" />
                   <MetricCard label="Unit Inventory" value={stats.totalStock?.toLocaleString() || 0} icon={Package} color="emerald" />
                   <MetricCard label="Node Efficiency" value="94.2%" icon={Activity} color="blue" />
                   <MetricCard label="Load Factor" value={`${((stats.totalStock / (stats.totalWarehouses * 1000)) * 100).toFixed(1)}%`} icon={History} color="orange" />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    
                    {/* Left Column: Analytics & Visualization */}
                    <div className="xl:col-span-1 space-y-8">
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100/50">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8">Capacity Distribution</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} layout="vertical" margin={{ left: -20, right: 20 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748B' }} />
                                        <Tooltip 
                                            cursor={{ fill: '#F8FAFC' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-gray-900 text-white p-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-800 shadow-2xl">
                                                            {payload[0].payload.name}: {payload[0].value} Units
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }}
                                        />
                                        <Bar dataKey="stock" radius={[0, 4, 4, 0]} barSize={8}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4F46E5' : '#818CF8'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-6 pt-6 border-t border-gray-50">
                                <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <span>Global Load</span>
                                    <span>Average Threshold</span>
                                </div>
                                <div className="mt-2 h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-[72%] rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-[#0A1128] to-[#1E3A8A] rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                            <div className="absolute top-[-10%] right-[-10%] w-[200px] h-[200px] bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                            <div className="relative z-10 space-y-4">
                                <Zap className="text-blue-400" />
                                <h4 className="text-xl font-bold font-black leading-tight">Optimization Report</h4>
                                <p className="text-white/60 text-xs font-medium">Node "Mumbai Alpha" is operating at 88% capacity. Consider rerouting stock to Bangalore Hub.</p>
                                <button className="w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all">
                                    Reroute Protocol
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Grid of Hubs */}
                    <div className="xl:col-span-2">
                        {warehouses.length === 0 ? (
                            <div className="bg-white rounded-[2.5rem] p-16 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-6">
                                <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-300">
                                    <MapPin size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tighter">No Active Nodes Detected</h3>
                                <p className="text-gray-500 max-w-sm font-medium">Synchronize your first hub terminal to begin multi-point fulfillment orchestrations.</p>
                                <button 
                                    onClick={() => setShowAddModal(true)}
                                    className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-black transition-all shadow-xl"
                                >
                                    Initialize Terminal
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                                {warehouses.map((warehouse, idx) => (
                                    <ModernWarehouseCard 
                                        key={warehouse._id} 
                                        warehouse={warehouse} 
                                        idx={idx}
                                        onUpdate={fetchWarehouses} 
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {showAddModal && <AddWarehouseModal onClose={() => setShowAddModal(false)} onSuccess={fetchWarehouses} />}
            </div>
        </div>
    )
}

function ModernWarehouseCard({ warehouse, idx, onUpdate }) {
    const capacityPercent = warehouse.capacity?.total > 0
        ? (warehouse.capacity.used / warehouse.capacity.total) * 100
        : 0

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100/50 overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
        >
            <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${warehouse.settings?.isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                        <Box size={24} />
                    </div>
                    <div className="flex items-center gap-2">
                         <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                            warehouse.settings?.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                         }`}>
                            {warehouse.settings?.isActive ? 'Operational' : 'Dormant'}
                         </span>
                         <button className="p-2 text-gray-300 hover:text-gray-900 transition-colors">
                            <MoreVertical size={16} />
                         </button>
                    </div>
                </div>

                <div>
                    <h4 className="text-lg font-black text-gray-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">{warehouse.name}</h4>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-tighter mt-1">{warehouse.code}</p>
                </div>

                <div className="flex items-start gap-2 text-gray-500">
                    <MapPin size={14} className="mt-0.5 text-indigo-400" />
                    <p className="text-[12px] font-bold leading-tight truncate">{warehouse.address?.city}, {warehouse.address?.state}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50">
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">Stock Load</p>
                        <p className="text-xl font-black text-gray-900 tracking-tight">{warehouse.metrics?.totalStock || 0}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">SKU Density</p>
                        <p className="text-xl font-black text-gray-900 tracking-tight">{warehouse.metrics?.totalProducts || 0}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-end">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Hub Volume</span>
                        <span className={`text-xs font-black ${capacityPercent > 85 ? 'text-rose-500' : 'text-indigo-600'}`}>{capacityPercent.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(capacityPercent, 100)}%` }}
                            transition={{ duration: 1, ease: 'circOut' }}
                            className={`h-full rounded-full ${
                                capacityPercent > 85 ? 'bg-rose-500' : capacityPercent > 60 ? 'bg-orange-400' : 'bg-indigo-500'
                            }`}
                        />
                    </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                    <Link 
                        href={`/seller/warehouses/${warehouse._id}`}
                        className="flex-1 py-3 bg-gray-50 hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2"
                    >
                        Master Panel <ChevronRight size={14} />
                    </Link>
                    <button className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-400 rounded-xl transition-all">
                        <Edit2 size={14} />
                    </button>
                    <button className="p-3 bg-gray-50 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-xl transition-all">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

function MetricCard({ label, value, icon: Icon, color }) {
   const colors = {
      indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      blue: 'text-blue-600 bg-blue-50 border-blue-100',
      orange: 'text-orange-600 bg-orange-50 border-orange-100',
   }

   return (
      <div className="bg-white p-6 rounded-[2.2rem] shadow-sm border border-gray-100/50 group overflow-hidden relative">
         <div className="flex items-center gap-4 relative z-10">
            <div className={`p-4 rounded-xl shadow-sm border ${colors[color]} group-hover:scale-110 transition-transform duration-500`}>
               <Icon size={22} />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
               <p className="text-2xl font-black text-gray-900 tracking-tight">{value}</p>
            </div>
         </div>
         <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50/50 -mr-12 -mt-12 rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-700" />
      </div>
   )
}

function AddWarehouseModal({ onClose, onSuccess }) {
    const { token } = useAuth()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        type: 'main',
        address: { street: '', city: '', state: '', country: 'India', pincode: '' },
        contact: { name: '', phone: '', email: '' },
        capacity: { total: 1000 }
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            const res = await axios.post('/api/seller/warehouses', formData, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                toast.success('Hub synchronized successfully')
                onSuccess()
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Protocol failure')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
                <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Sync New Hub Terminal</h2>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Inventory Node Initialization</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors shadow-sm">
                        <Plus size={20} className="rotate-45" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Terminal Designation</label>
                           <input
                               type="text"
                               required
                               value={formData.name}
                               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                               className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-[13px] font-bold focus:ring-2 focus:ring-indigo-100 transition-all"
                               placeholder="e.g. Mumbai Prime Hub"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Protocol Code</label>
                           <input
                               type="text"
                               required
                               placeholder="e.g. WH-BOM-001"
                               value={formData.code}
                               onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                               className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-[13px] font-bold focus:ring-2 focus:ring-indigo-100 transition-all"
                           />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Geographical Coordinates</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <input
                               type="text"
                               placeholder="City"
                               value={formData.address.city}
                               onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                               className="px-6 py-4 bg-gray-50 border-none rounded-2xl text-[13px] font-bold focus:ring-2 focus:ring-indigo-100 transition-all"
                           />
                           <input
                               type="text"
                               placeholder="State"
                               value={formData.address.state}
                               onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                               className="px-6 py-4 bg-gray-50 border-none rounded-2xl text-[13px] font-bold focus:ring-2 focus:ring-indigo-100 transition-all"
                           />
                           <input
                               type="text"
                               placeholder="Pincode"
                               value={formData.address.pincode}
                               onChange={(e) => setFormData({ ...formData, address: { ...formData.address, pincode: e.target.value } })}
                               className="px-6 py-4 bg-gray-50 border-none rounded-2xl text-[13px] font-bold focus:ring-2 focus:ring-indigo-100 transition-all"
                           />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Node Volume Threshold</label>
                        <input
                            type="number"
                            placeholder="Units (e.g. 5000)"
                            value={formData.capacity.total}
                            onChange={(e) => setFormData({ ...formData, capacity: { total: parseInt(e.target.value) } })}
                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-[13px] font-bold focus:ring-2 focus:ring-indigo-100 transition-all"
                        />
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-8 py-5 border-2 border-gray-100 text-gray-400 rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                        >
                            Abort Sync
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-8 py-5 bg-indigo-600 text-white rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 disabled:opacity-50 transition-all"
                        >
                            {loading ? 'Initializing...' : 'Authorize Terminal'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
