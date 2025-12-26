// app/seller/(seller)/pricing-rules/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
    Plus,
    Zap,
    Clock,
    Package,
    TrendingDown,
    DollarSign,
    ToggleLeft,
    ToggleRight,
    Edit2,
    Trash2,
    Target,
    BarChart3,
    Activity,
    ChevronRight,
    Info,
    ArrowUpRight,
    Percent,
    ShieldCheck
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts'

const MOCK_REVENUE_IMPACT = [
    { name: 'Mon', before: 4000, after: 4400 },
    { name: 'Tue', before: 3000, after: 3800 },
    { name: 'Wed', before: 2000, after: 3200 },
    { name: 'Thu', before: 2780, after: 3900 },
    { name: 'Fri', before: 1890, after: 4100 },
    { name: 'Sat', before: 2390, after: 4800 },
    { name: 'Sun', before: 3490, after: 5300 },
];

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
            const res = await axios.get('/api/seller/pricing-rules', {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.data.success) {
                setRules(res.data.rules || [])
            }
        } catch (error) {
            console.error('Error fetching rules:', error)
            // Silencing error since API might not be fully ready, just using empty state
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Loading Algorithm Nodes...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8">
            <div className="max-w-[1600px] mx-auto space-y-10">

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                                <Zap size={18} />
                            </div>
                            <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-full">Yield Management</span>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Autonomous Pricing Engine</h1>
                        <p className="text-gray-500 font-medium mt-1">Deploy dynamic valuation protocols based on market velocity and inventory load</p>
                    </div>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-8 py-4 bg-purple-600 text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-widest shadow-2xl shadow-purple-500/30 hover:bg-purple-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Plus size={18} />
                        Deploy New Protocol
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Analytics Pane */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white rounded-[2.8rem] p-8 shadow-sm border border-gray-100/50">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                                <Activity size={16} className="text-purple-600" /> Delta Velocity
                            </h3>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={MOCK_REVENUE_IMPACT}>
                                        <defs>
                                            <linearGradient id="colorAfter" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Area type="monotone" dataKey="after" stroke="#8B5CF6" strokeWidth={4} fillOpacity={1} fill="url(#colorAfter)" />
                                        <Area type="monotone" dataKey="before" stroke="#CBD5E1" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Avg Lift</p>
                                    <p className="text-xl font-black text-gray-900">+22.4%</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Buy Box Win</p>
                                    <p className="text-xl font-black text-gray-900">89%</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-[#581C87] to-[#7E22CE] rounded-[2.8rem] p-8 text-white relative overflow-hidden">
                            <div className="absolute top-[-20%] right-[-10%] w-[250px] h-[250px] bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />
                            <ShieldCheck className="text-purple-300 mb-4" size={32} />
                            <h4 className="text-xl font-black mb-2 tracking-tight">Active Safeguard</h4>
                            <p className="text-purple-100/60 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                                No rule can drop price below "Global Minimum" floor set in your treasury preferences.
                            </p>
                            <button className="mt-6 w-full py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/20 transition-all">
                                Adjust Treasury Floor
                            </button>
                        </div>
                    </div>

                    {/* Protocols List */}
                    <div className="lg:col-span-2 space-y-6">
                        {rules.length === 0 ? (
                            <div className="bg-white rounded-[3rem] p-16 text-center shadow-sm border border-gray-100/50 flex flex-col items-center justify-center space-y-6">
                                <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center text-purple-300">
                                    <Zap size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Engine Standby</h3>
                                <p className="text-gray-500 max-w-sm font-medium">Initialize your first automated pricing protocol to stay competitive at scale.</p>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="px-8 py-4 bg-purple-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-purple-700 transition-all shadow-xl"
                                >
                                    Launch Protocol 01
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {rules.map((rule, idx) => (
                                    <ModernRuleCard key={rule._id} rule={rule} idx={idx} onUpdate={fetchRules} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {showAddModal && <AddPricingRuleModal onClose={() => setShowAddModal(false)} onSuccess={fetchRules} />}
            </div>
        </div>
    )
}

function ModernRuleCard({ rule, idx, onUpdate }) {
    const [isActive, setIsActive] = useState(rule.status === 'active')

    const typeMeta = {
        dynamic: { icon: Zap, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
        scheduled: { icon: Clock, bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
        inventory_based: { icon: Package, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
        competitor_based: { icon: Target, bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
        bulk_discount: { icon: DollarSign, bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    }

    const meta = typeMeta[rule.type] || typeMeta.dynamic
    const Icon = meta.icon

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100/50 hover:shadow-xl hover:shadow-purple-500/5 transition-all"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-6">
                    <div className={`w-14 h-14 rounded-2xl ${meta.bg} ${meta.border} border flex items-center justify-center ${meta.text} group-hover:scale-110 transition-transform duration-500`}>
                        <Icon size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-xl font-black text-gray-900 tracking-tight leading-none">{rule.name}</h4>
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${meta.bg} ${meta.text}`}>
                                {rule.type.replace('_', ' ')}
                            </span>
                            {isActive && (
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                            )}
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{rule.description || 'Automated valuation logic'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-gray-50/50 p-6 rounded-3xl border border-gray-50">
                    <div className="text-center px-4 border-r border-gray-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">SKU Reach</p>
                        <p className="text-lg font-black text-gray-900 leading-none">{rule.metrics?.productsAffected || 0}</p>
                    </div>
                    <div className="text-center px-4">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Avg Δ</p>
                        <p className="text-lg font-black text-emerald-500 leading-none">{(rule.metrics?.averageDiscount || 0).toFixed(1)}%</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsActive(!isActive)}
                        className={`p-3 rounded-2xl transition-all ${isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}
                    >
                        {isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                    <button className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-400 rounded-2xl transition-all">
                        <Edit2 size={18} />
                    </button>
                    <button className="p-3 bg-gray-50 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-2xl transition-all">
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
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
        priceAdjustment: { type: 'percentage', value: -10 }
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            const res = await axios.post('/api/seller/pricing-rules', formData, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                toast.success('Protocol established')
                onSuccess()
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Handshake failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[3.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/20"
            >
                <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-purple-50/30">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Forge Rule Node</h2>
                        <p className="text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Autonomous Pricing Synthesis</p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors shadow-sm">
                        <Plus size={24} className="rotate-45" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Protocol Designation</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-8 py-5 bg-gray-50 border-none rounded-[2rem] text-[15px] font-bold focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                            placeholder="e.g. Flash Velocity Surge"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Logic Pattern</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-8 py-5 bg-gray-50 border-none rounded-[2rem] text-[15px] font-bold focus:ring-4 focus:ring-purple-100 transition-all outline-none appearance-none cursor-pointer"
                            >
                                <option value="inventory_based">Inventory Load</option>
                                <option value="scheduled">Time Domain</option>
                                <option value="dynamic">Buy-Box Capture</option>
                                <option value="competitor_based">Competitor Mirror</option>
                                <option value="bulk_discount">Volume Tiering</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Valuation Delta (%)</label>
                            <input
                                type="number"
                                required
                                value={formData.priceAdjustment.value}
                                onChange={(e) => setFormData({ ...formData, priceAdjustment: { ...formData.priceAdjustment, value: parseFloat(e.target.value) } })}
                                className="w-full px-8 py-5 bg-gray-50 border-none rounded-[2rem] text-[15px] font-bold focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                                placeholder="-10"
                            />
                        </div>
                    </div>

                    <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-50 flex gap-4">
                        <Info className="text-blue-500 shrink-0" size={20} />
                        <p className="text-[11px] font-black text-blue-600/70 uppercase tracking-widest leading-relaxed">
                            A -10% delta will reduce the product price by 10% relative to your current global floor when protocol triggers.
                        </p>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-8 py-5 border-2 border-gray-100 text-gray-400 rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                        >
                            Decline Protocol
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-8 py-5 bg-purple-600 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-purple-700 shadow-2xl shadow-purple-500/20 disabled:opacity-50 transition-all"
                        >
                            {loading ? 'Synthesizing...' : 'Authorize Engine'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
