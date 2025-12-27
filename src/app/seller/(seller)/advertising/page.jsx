'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { useAuth } from '@/lib/context/AuthContext'
import {
    Zap,
    TrendingUp,
    Target,
    MousePointer2,
    BarChart3,
    Plus,
    Pause,
    Play,
    Settings2,
    Search,
    ChevronRight,
    Flame,
    PieChart,
    ArrowUpRight,
    Sparkles,
    AlertCircle,
    Info,
    CheckCircle2
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts'

export default function AdvertisingHub() {
    const { token } = useAuth()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState(null)
    const [activeTab, setActiveTab] = useState('performance')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [products, setProducts] = useState([])
    const [newCampaign, setNewCampaign] = useState({
        campaignName: '',
        campaignType: 'sponsored_product',
        budget: { amount: 100, type: 'daily' },
        bidding: { bidAmount: 1, strategy: 'cpc' },
        schedule: { startDate: new Date().toISOString().split('T')[0] },
        products: []
    })

    useEffect(() => {
        if (token) {
            fetchAdsData()
            fetchProducts()
        }
    }, [token])

    const fetchProducts = async () => {
        try {
            const res = await axios.get('/api/seller/products', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                setProducts(res.data.products)
            }
        } catch (err) {
            console.error('Failed to load products')
        }
    }

    const fetchAdsData = async () => {
        try {
            setLoading(true)
            const res = await axios.get('/api/seller/advertising', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                setData(res.data)
            }
        } catch (err) {
            toast.error('Failed to load advertising metrics')
        } finally {
            setLoading(false)
        }
    }

    const toggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'paused' : 'active'
        try {
            const res = await axios.patch('/api/seller/advertising', { id, status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                toast.success(`Campaign ${newStatus === 'active' ? 'resumed' : 'paused'}`)
                fetchAdsData()
            }
        } catch (err) {
            toast.error('Operation failed')
        }
    }

    const toggleBoost = async (id, currentBoost) => {
        try {
            const res = await axios.patch('/api/seller/advertising', { id, boost: !currentBoost }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                toast.success(currentBoost ? 'Boost Deactivated' : '🚀 Boost Mode Activated!', {
                    icon: '⚡',
                    style: { borderRadius: '15px', background: '#0f172a', color: '#fff', fontWeight: 'bold' }
                })
                fetchAdsData()
            }
        } catch (err) {
            toast.error('Boost failed')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 bg-[#F8FAFC]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Booting Ad Engine...</p>
                </div>
            </div>
        )
    }

    // Waterfall Data: Spend -> Clicks -> Conv -> Revenue
    const funnelData = [
        { name: 'Ad Spend', value: data?.stats?.totalSpent || 0, color: '#ef4444' },
        { name: 'Clicks', value: data?.stats?.totalClicks * 10 || 0, color: '#3b82f6' }, // Scaled for vis
        { name: 'Conversions', value: data?.stats?.totalRevenue * 0.5 || 0, color: '#10b981' },
        { name: 'Net Revenue', value: data?.stats?.totalRevenue || 0, color: '#8b5cf6' },
    ]

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            <div className="max-w-[1400px] mx-auto p-6 lg:p-10 space-y-10">

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-violet-600 rounded-3xl text-white shadow-xl shadow-violet-200">
                            <Target size={28} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Growth Hub <span className="text-violet-600">.</span></h1>
                            <p className="text-slate-500 font-bold text-sm mt-1">Accelerate sales with AI-optimized smart campaigns.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95"
                        >
                            <Plus size={16} /> New Campaign
                        </button>
                    </div>
                </div>

                {/* Performance HUD */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <AdMetric
                        label="ROAS"
                        value={`${data?.stats?.roas}x`}
                        sub="Return on Ad Spend"
                        trend="+12.4%"
                        icon={TrendingUp}
                        color="violet"
                    />
                    <AdMetric
                        label="Impressions"
                        value={data?.stats?.totalImpressions.toLocaleString()}
                        sub="Total Brand Reach"
                        trend="+5.2%"
                        icon={Flame}
                        color="orange"
                    />
                    <AdMetric
                        label="Conversion"
                        value={`${data?.stats?.ctr}%`}
                        sub="Click-through Rate"
                        trend="+1.8%"
                        icon={MousePointer2}
                        color="blue"
                    />
                    <AdMetric
                        label="Ad Wealth"
                        value={`₹${data?.stats?.totalRevenue.toLocaleString()}`}
                        sub="Sales From Ads"
                        trend="+22.1%"
                        icon={Sparkles}
                        color="emerald"
                    />
                </div>

                {/* Primary Intelligence Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Left: Performance Intelligence */}
                    <div className="lg:col-span-8 space-y-10">

                        {/* ROAS Waterfall Chart */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/20 overflow-hidden relative">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                        Performance Waterfall <Info size={14} className="text-slate-300" />
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Visualizing Ad spend to Revenue conversion</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className="px-4 py-1.5 bg-violet-50 text-violet-600 rounded-full text-[9px] font-black uppercase tracking-widest">Real-time</span>
                                </div>
                            </div>

                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={funnelData}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }}
                                        />
                                        <YAxis hide />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-slate-900 p-4 rounded-2xl shadow-2xl border border-white/10">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{payload[0].payload.name}</p>
                                                            <p className="text-xl font-black text-white">₹{payload[0].value.toLocaleString()}</p>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#8b5cf6"
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#colorValue)"
                                            dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 3, stroke: '#fff' }}
                                            activeDot={{ r: 8, strokeWidth: 0 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="absolute top-10 right-0 w-64 h-64 bg-violet-600 opacity-[0.03] rounded-full blur-[100px]" />
                        </div>

                        {/* Active Campaigns List */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/20">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Campaigns</h3>
                                <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                                    <button className="px-6 py-2 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase shadow-sm">All</button>
                                    <button className="px-6 py-2 text-slate-400 text-[10px] font-black uppercase">Active</button>
                                    <button className="px-6 py-2 text-slate-400 text-[10px] font-black uppercase">Paused</button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {data?.campaigns?.length > 0 ? (
                                    data.campaigns.map((ad) => (
                                        <div key={ad._id} className="p-6 border border-slate-50 rounded-[2rem] hover:border-violet-100 hover:bg-violet-50/10 transition-all group">
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-2xl ${ad.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                                        {ad.status === 'active' ? <Flame size={20} /> : <Pause size={20} />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-slate-900 group-hover:text-violet-600 transition-colors uppercase tracking-tight">{ad.campaignName}</h4>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{ad.campaignType.replace('_', ' ')}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-8 lg:gap-16">
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">ROAS</p>
                                                        <p className="text-xs font-black text-slate-900">{(ad.metrics.revenue / (ad.budget.spent || 1)).toFixed(2)}x</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Budget</p>
                                                        <p className="text-xs font-black text-slate-900">₹{ad.budget.amount}/day</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Spent</p>
                                                        <p className="text-xs font-black text-slate-900">₹{ad.budget.spent}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => toggleBoost(ad._id, ad.boost)}
                                                        className={`p-3 rounded-xl transition-all relative overflow-hidden group/boost ${
                                                            ad.boost ? 'bg-violet-600 text-white shadow-lg shadow-violet-200' : 'bg-slate-50 text-slate-400 hover:bg-violet-50 hover:text-violet-600'
                                                        }`}
                                                    >
                                                        <Zap size={16} className={`${ad.boost ? 'animate-pulse' : ''}`} />
                                                        {ad.boost && (
                                                            <motion.div 
                                                                layoutId={`boost-aura-${ad._id}`}
                                                                className="absolute inset-0 bg-white/20"
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1.5 }}
                                                                transition={{ repeat: Infinity, duration: 2 }}
                                                            />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => toggleStatus(ad._id, ad.status)}
                                                        className={`p-3 rounded-xl transition-all ${ad.status === 'active' ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                            }`}
                                                    >
                                                        {ad.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                                                    </button>
                                                    <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all">
                                                        <Settings2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center flex flex-col items-center gap-4">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center grayscale opacity-50">
                                            <Target size={32} className="text-slate-300" />
                                        </div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No active campaigns</p>
                                        <button
                                            onClick={() => setShowCreateModal(true)}
                                            className="text-[10px] font-black text-violet-600 uppercase tracking-widest hover:underline"
                                        >
                                            Launch your first ad
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Smart Intelligence Side-Panel */}
                    <div className="lg:col-span-4 space-y-10">

                        {/* Smart Bid Advisor Proposal */}
                        <div className="bg-[#0F172A] rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                            <div className="relative z-10 space-y-8">
                                <div className="flex items-center gap-2 text-violet-400">
                                    <Zap size={18} fill="currentColor" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Smart Bid Advisor</span>
                                </div>

                                <div>
                                    <h4 className="text-xl font-black tracking-tight mb-2">Maximize Peak-Hour Traffic</h4>
                                    <p className="text-slate-400 text-xs font-medium leading-relaxed">
                                        Your category sees a <span className="text-emerald-400 font-bold">45% spike</span> in conversion between <span className="text-white font-bold">8 PM - 11 PM</span>.
                                    </p>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Recommended Bid</p>
                                        <p className="text-sm font-black text-emerald-400">₹12.50 (+₹2.00)</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Est. Click Growth</p>
                                        <p className="text-sm font-black text-blue-400">+2.4k / wk</p>
                                    </div>
                                </div>

                                <button className="w-full py-4 bg-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 transition-all shadow-xl shadow-violet-500/20 active:scale-95">
                                    Apply Optimization
                                </button>
                            </div>

                            {/* Background Elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600 opacity-20 rounded-full blur-[80px] -mr-32 -mt-32" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-600 opacity-10 rounded-full blur-[60px] -ml-16 -mb-16" />
                        </div>

                        {/* Inventory Placement Insight */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/20">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Visual Heatmap Preview</h3>
                            
                            {/* Grid Heatmap Visual */}
                            <div className="grid grid-cols-4 gap-2 mb-8 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                {[...Array(12)].map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={`h-6 rounded-lg transition-all ${
                                            [0, 1, 4].includes(i) ? 'bg-violet-500 shadow-lg shadow-violet-200 animate-pulse' : 'bg-slate-200'
                                        }`} 
                                    />
                                ))}
                            </div>

                            <div className="space-y-6">
                                <PlacementRow label="Home Page Banner" score={92} />
                                <PlacementRow label="Search Top Row" score={85} />
                                <PlacementRow label="Product Page Sidebar" score={44} />
                                <PlacementRow label="Category Footer" score={12} />
                            </div>

                            <button className="w-full py-4 border border-violet-100 mt-8 rounded-2xl text-[10px] font-black text-violet-600 uppercase tracking-widest hover:bg-violet-50 transition-all">
                                Adjust Placements
                            </button>
                        </div>

                        {/* AI Alert Card */}
                        <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertCircle size={24} />
                                <h4 className="font-black tracking-tight">AI Audit Complete</h4>
                            </div>
                            <p className="text-emerald-100 text-xs font-medium mb-6 leading-relaxed">
                                We found 3 draft campaigns with high potential CTR. Launch them now to capture untapped weekend traffic.
                            </p>
                            <button className="w-full py-4 bg-black/20 backdrop-blur-md text-white border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black/30 transition-all">
                                Launch Audited Ads
                            </button>
                        </div>

                    </div>
                </div>

                {/* Create Campaign Modal */}
                <AnimatePresence>
                    {showCreateModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-10">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowCreateModal(false)}
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                            >
                                <div className="p-8 lg:p-12 overflow-y-auto space-y-10">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Launch Campaign <span className="text-violet-600">.</span></h2>
                                            <p className="text-slate-500 font-bold text-sm mt-1">Configure your smart targeting and budget.</p>
                                        </div>
                                        <button onClick={() => setShowCreateModal(false)} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400">
                                            <AlertCircle size={24} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Campaign Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Weekend Electronics Sale"
                                                    value={newCampaign.campaignName}
                                                    onChange={e => setNewCampaign({ ...newCampaign, campaignName: e.target.value })}
                                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-violet-50 transition-all outline-none"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Daily Budget</label>
                                                    <div className="relative">
                                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
                                                        <input
                                                            type="number"
                                                            value={newCampaign.budget.amount}
                                                            onChange={e => setNewCampaign({ ...newCampaign, budget: { ...newCampaign.budget, amount: e.target.value } })}
                                                            className="w-full pl-10 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-violet-50 transition-all outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Bid Amount</label>
                                                    <div className="relative">
                                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
                                                        <input
                                                            type="number"
                                                            value={newCampaign.bidding.bidAmount}
                                                            onChange={e => setNewCampaign({ ...newCampaign, bidding: { ...newCampaign.bidding, bidAmount: e.target.value } })}
                                                            className="w-full pl-10 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-violet-50 transition-all outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Select Products</label>
                                            <div className="grid grid-cols-1 gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                                {products.map(product => (
                                                    <button
                                                        key={product._id}
                                                        onClick={() => {
                                                            const exists = newCampaign.products.includes(product._id)
                                                            if (exists) {
                                                                setNewCampaign({ ...newCampaign, products: newCampaign.products.filter(id => id !== product._id) })
                                                            } else {
                                                                setNewCampaign({ ...newCampaign, products: [...newCampaign.products, product._id] })
                                                            }
                                                        }}
                                                        className={`flex items-center gap-4 p-3 rounded-2xl border transition-all text-left ${newCampaign.products.includes(product._id)
                                                            ? 'bg-violet-50 border-violet-200 ring-2 ring-violet-100'
                                                            : 'bg-white border-slate-100 hover:border-slate-200'
                                                            }`}
                                                    >
                                                        <img src={product.images[0]?.url} className="w-10 h-10 rounded-xl object-cover" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[11px] font-black text-slate-900 truncate uppercase tracking-tight">{product.name}</p>
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">₹{product.pricing.basePrice}</p>
                                                        </div>
                                                        {newCampaign.products.includes(product._id) && (
                                                            <CheckCircle2 size={16} className="text-violet-600" />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-slate-50 flex items-center justify-end gap-4">
                                        <button
                                            onClick={() => setShowCreateModal(false)}
                                            className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const res = await axios.post('/api/seller/advertising', newCampaign, {
                                                        headers: { Authorization: `Bearer ${token}` }
                                                    })
                                                    if (res.data.success) {
                                                        toast.success('Campaign Launched!')
                                                        setShowCreateModal(false)
                                                        fetchAdsData()
                                                    }
                                                } catch (err) {
                                                    toast.error('Launch failed')
                                                }
                                            }}
                                            className="px-12 py-4 bg-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 transition-all shadow-xl shadow-violet-200 active:scale-95"
                                        >
                                            Launch Now
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    )
}

function AdMetric({ label, value, sub, trend, icon: Icon, color }) {
    const colors = {
        violet: 'bg-violet-50 text-violet-600',
        orange: 'bg-orange-50 text-orange-600',
        blue: 'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-600'
    }

    return (
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/20 group hover:translate-y-[-4px] transition-all">
            <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                </div>
                <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black">
                    {trend}
                </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">{value}</p>
            <p className="text-[10px] font-semibold text-slate-400">{sub}</p>
        </div>
    )
}

function PlacementRow({ label, score }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                <span className="text-slate-600">{label}</span>
                <span className={score > 80 ? 'text-emerald-500' : score > 40 ? 'text-amber-500' : 'text-slate-400'}>
                    {score}% Effectiveness
                </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${score > 80 ? 'bg-emerald-500' : score > 40 ? 'bg-amber-500' : 'bg-slate-300'
                        }`}
                />
            </div>
        </div>
    )
}
