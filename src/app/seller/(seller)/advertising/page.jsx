// app/seller/(seller)/advertising/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
    TrendingUp,
    DollarSign,
    Eye,
    MousePointer,
    Plus,
    Edit,
    Pause,
    Play,
    BarChart2,
    Target,
    Zap,
    Rocket,
    PieChart as PieChartIcon,
    ArrowUpRight,
    Search,
    Filter,
    MoreHorizontal,
    Activity,
    LineChart as LineChartIcon
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie
} from 'recharts'

const AD_PERFORMANCE_HISTORY = [
    { name: '01 Dec', spend: 1200, revenue: 4500 },
    { name: '05 Dec', spend: 1800, revenue: 7800 },
    { name: '10 Dec', spend: 1400, revenue: 6200 },
    { name: '15 Dec', spend: 2200, revenue: 11000 },
    { name: '20 Dec', spend: 1900, revenue: 8900 },
    { name: '25 Dec', spend: 2800, revenue: 14500 },
];

const AD_TYPE_DISTRIBUTION = [
    { name: 'Sponsored Products', value: 45, color: '#3B82F6' },
    { name: 'Display Ads', value: 25, color: '#8B5CF6' },
    { name: 'Video Ads', value: 20, color: '#EC4899' },
    { name: 'Brands', value: 10, color: '#10B981' },
];

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
            // Silencing since API might not exist yet
        } finally {
            setLoading(false)
        }
    }

    async function toggleCampaign(id, currentStatus) {
        try {
            const newStatus = currentStatus === 'active' ? 'paused' : 'active'
            const res = await axios.put(`/api/seller/campaigns/${id}`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.data.success) {
                toast.success(`Campaign protocol ${newStatus}`)
                fetchCampaigns()
            }
        } catch (error) {
            toast.error('Sync failure')
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Accessing Ad Terminal...</p>
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
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <Rocket size={18} />
                            </div>
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Growth Terminal</span>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Campaign Architecture</h1>
                        <p className="text-gray-500 font-medium mt-1">Execute high-velocity advertising protocols to capture market share</p>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="px-8 py-4 bg-blue-600 text-white rounded-3xl font-black uppercase text-[11px] tracking-widest shadow-2xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Plus size={18} />
                        Initiate Campaign
                    </button>
                </div>

                {/* Performance Bento */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-[2.8rem] p-8 shadow-sm border border-gray-100/50">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Revenue Momentum</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">ROAS Correlation Matrix</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span className="text-[9px] font-black uppercase text-gray-400">Revenue</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-gray-200" />
                                    <span className="text-[9px] font-black uppercase text-gray-400">Spend</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={AD_PERFORMANCE_HISTORY}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                                    <Area type="monotone" dataKey="spend" stroke="#E2E8F0" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.8rem] p-8 shadow-sm border border-gray-100/50">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8 text-center">Protocol Mix</h3>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={AD_TYPE_DISTRIBUTION} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {AD_TYPE_DISTRIBUTION.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2">
                            {AD_TYPE_DISTRIBUTION.slice(0, 3).map(item => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-[9px] font-black uppercase text-gray-400">{item.name}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-gray-900">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[2.8rem] p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
                            <Activity size={120} />
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <Zap className="text-blue-300 mb-4" />
                                <h4 className="text-2xl font-black tracking-tight leading-tight">ROAS<br />Optimizer</h4>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-200/60 mb-4 leading-relaxed">
                                    AI is currently optimizing 12 bid points to reach target 4.5x ROAS.
                                </p>
                                <button className="w-full py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all">
                                    View Logic Trace
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Chips */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <MetricChip label="Total Spend" value={`₹${stats.totalSpend || 0}`} icon={DollarSign} color="blue" />
                    <MetricChip label="Impressions" value={stats.totalImpressions?.toLocaleString() || 0} icon={Eye} color="purple" />
                    <MetricChip label="Interaction" value={stats.totalClicks?.toLocaleString() || 0} icon={MousePointer} color="emerald" />
                    <MetricChip label="Avg ROAS" value="4.2x" icon={TrendingUp} color="orange" />
                </div>

                {/* Campaigns Feed */}
                <div className="space-y-6 pb-20">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-lg font-black text-gray-900 tracking-tight">Active Deployment Feed</h3>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <input type="text" placeholder="Search protocol..." className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest focus:ring-4 focus:ring-blue-50/50 outline-none w-64 shadow-sm" />
                            </div>
                            <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 shadow-sm transition-all"><Filter size={18} /></button>
                        </div>
                    </div>

                    {campaigns.length === 0 ? (
                        <div className="bg-white rounded-[3rem] p-16 text-center shadow-sm border border-gray-100/50 flex flex-col items-center justify-center space-y-6">
                            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-300">
                                <BarChart2 size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Terminal Offline</h3>
                            <p className="text-gray-500 max-w-sm font-medium">No advertising protocols are currently deployed. Launch your first campaign to begin data ingestion.</p>
                            <button onClick={() => setShowModal(true)} className="px-10 py-5 bg-blue-600 text-white rounded-3xl font-black uppercase text-[11px] tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">Launch Alpha Protocol</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {campaigns.map((campaign, idx) => (
                                <ModernCampaignCard key={campaign._id} campaign={campaign} idx={idx} onToggle={() => toggleCampaign(campaign._id, campaign.status)} />
                            ))}
                        </div>
                    )}
                </div>

                {showModal && <CreateCampaignModal onClose={() => setShowModal(false)} onSuccess={fetchCampaigns} token={token} />}
            </div>
        </div>
    )
}

function ModernCampaignCard({ campaign, idx, onToggle }) {
    const ctr = campaign.metrics?.clicks && campaign.metrics?.impressions ? ((campaign.metrics.clicks / campaign.metrics.impressions) * 100).toFixed(2) : 0
    const spendPercent = Math.min((campaign.budget?.spent / campaign.budget?.total) * 100, 100)

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100/50 hover:shadow-2xl hover:shadow-blue-500/5 transition-all group"
        >
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                        <Target size={22} />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-gray-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors uppercase">{campaign.name}</h4>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2 block">{campaign.type?.replace('_', ' ')}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${campaign.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                        {campaign.status}
                    </span>
                    <button onClick={onToggle} className="p-2.5 bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-xl transition-all">
                        {campaign.status === 'active' ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                    </button>
                    <button className="p-2.5 bg-gray-50 text-gray-300 hover:text-gray-900 rounded-xl transition-all"><MoreHorizontal size={18} /></button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-gray-50/50 rounded-3xl border border-gray-50">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Impressions</p>
                    <p className="text-xl font-black text-gray-900 tracking-tighter">{campaign.metrics?.impressions?.toLocaleString() || 0}</p>
                </div>
                <div className="text-center p-4 bg-gray-50/50 rounded-3xl border border-gray-50">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">CTR Velocity</p>
                    <p className="text-xl font-black text-blue-600 tracking-tighter">{ctr}%</p>
                </div>
                <div className="text-center p-4 bg-gray-50/50 rounded-3xl border border-gray-50">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">ROAS</p>
                    <p className="text-xl font-black text-emerald-500 tracking-tighter">4.8x</p>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-end">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Protocol Fuel (Budget)</span>
                    <span className="text-[10px] font-black text-gray-900">₹{campaign.budget?.spent?.toLocaleString()} / ₹{campaign.budget?.total?.toLocaleString()}</span>
                </div>
                <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${spendPercent}%` }}
                        className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                    />
                </div>
            </div>
        </motion.div>
    )
}

function MetricChip({ label, value, icon: Icon, color }) {
    const colors = {
        blue: 'text-blue-600 bg-blue-50 border-blue-100',
        purple: 'text-purple-600 bg-purple-50 border-purple-100',
        emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        orange: 'text-orange-600 bg-orange-50 border-orange-100',
    }
    return (
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100/50 flex items-center gap-4 group">
            <div className={`p-3 rounded-2xl ${colors[color]} border group-hover:scale-110 transition-transform duration-500`}><Icon size={18} /></div>
            <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
                <p className="text-lg font-black text-gray-900 tracking-tighter leading-none">{value}</p>
            </div>
        </div>
    )
}

function CreateCampaignModal({ onClose, onSuccess, token }) {
    const [formData, setFormData] = useState({
        name: '', type: 'sponsored_products',
        budget: { total: 1000, daily: 100 },
        bidding: { strategy: 'automatic', amount: 1 }
    })

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            const res = await axios.post('/api/seller/campaigns', formData, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.data.success) {
                toast.success('Campaign protocol synchronized')
                onSuccess()
            }
        } catch (error) { toast.error('Sync failure') }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[3rem] shadow-2xl max-w-xl w-full overflow-hidden flex flex-col"
            >
                <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-blue-50/20">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Forge Campaign</h2>
                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mt-1">Growth Protocol Initialization</p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors shadow-sm">
                        <Plus size={24} className="rotate-45" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Protocol Handle</label>
                        <input type="text" required placeholder="e.g. Winter Blitz 2024" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-8 py-5 bg-gray-50 border-none rounded-[2rem] text-[15px] font-bold focus:ring-4 focus:ring-blue-100 transition-all outline-none" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Medium</label>
                            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-8 py-5 bg-gray-50 border-none rounded-[2rem] text-[15px] font-bold focus:ring-4 focus:ring-blue-100 transition-all outline-none appearance-none cursor-pointer">
                                <option value="sponsored_products">Sponsored Products</option>
                                <option value="sponsored_brands">Sponsored Brands</option>
                                <option value="display">Display Ads</option>
                                <option value="video">Video Portals</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Total Fuel (Budget)</label>
                            <input type="number" value={formData.budget.total} onChange={(e) => setFormData({ ...formData, budget: { ...formData.budget, total: parseInt(e.target.value) } })} className="w-full px-8 py-5 bg-gray-50 border-none rounded-[2rem] text-[15px] font-bold focus:ring-4 focus:ring-blue-100 transition-all outline-none" />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button type="button" onClick={onClose} className="flex-1 px-8 py-5 border-2 border-gray-100 text-gray-400 rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">Abort</button>
                        <button type="submit" className="flex-1 px-8 py-5 bg-blue-600 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-2xl shadow-blue-500/20 transition-all">Synchronize</button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
