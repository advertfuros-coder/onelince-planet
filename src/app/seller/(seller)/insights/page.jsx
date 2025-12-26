// app/seller/(seller)/insights/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import Link from 'next/link'
import {
    TrendingUp,
    ShoppingCart,
    Package,
    Star,
    ArrowLeft,
    ChevronRight,
    Search,
    Download,
    Eye,
    Zap,
    Target,
    BarChart3,
    ArrowUpRight,
    RefreshCw,
    Award,
    AlertCircle,
    MoreHorizontal,
    Cpu,
    BrainCircuit,
    Sparkles,
    ShieldAlert,
    Gauge,
    Layers,
    Binary,
    Activity,
    DollarSign,
    Trophy,
    Workflow,
    TrendingDown,
    ZapOff,
    CheckCircle2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis
} from 'recharts'

export default function SellerInsightsPage() {
    const { token } = useAuth()
    const [performance, setPerformance] = useState(null)
    const [aiAnalysis, setAiAnalysis] = useState(null)
    const [loading, setLoading] = useState(true)
    const [analyzing, setAnalyzing] = useState(false)
    const [period, setPeriod] = useState('30')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        if (token) {
            fetchInitialData()
        }
    }, [token, period])

    async function fetchInitialData() {
        try {
            setLoading(true)
            const performanceRes = await axios.get(`/api/seller/products/performance?period=${period}`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (performanceRes.data.success) {
                setPerformance(performanceRes.data.performance)
            }
        } catch (error) {
            console.error('Error fetching data:', error)
            toast.error('Failed to sync performance metrics')
        } finally {
            setLoading(false)
        }
    }

    async function runNeuralAnalysis() {
        try {
            setAnalyzing(true)
            const aiRes = await axios.post('/api/ai/business-coach', {
                action: 'analyze_performance'
            }, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (aiRes.data.success) {
                setAiAnalysis(aiRes.data.analysis || aiRes.data)
                toast.success('Neural mapping complete')
            }
        } catch (error) {
            console.error('AI Analysis Error:', error)
            toast.error('Neural uplink failed')
        } finally {
            setAnalyzing(false)
        }
    }

    const formatCurrency = (value) => `₹${(value || 0).toLocaleString('en-IN')}`

    if (loading && !performance) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] bg-transparent">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-400 font-bold animate-pulse uppercase tracking-widest text-[10px]">Synchronizing Intelligence Stats...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8">
            <div className="max-w-[1500px] mx-auto space-y-10">

                {/* Header: Intelligence Command */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                                <BrainCircuit size={22} />
                            </div>
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">Intelligence Terminal</span>
                        </div>
                        <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none uppercase">Business Ecosystem Insights</h1>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[11px] mt-3 flex items-center gap-2">
                            <Activity size={14} className="text-blue-500" /> System Uptime: 99.98% — Analysis Matrix Alpha
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="bg-white p-1.5 rounded-[1.8rem] border border-gray-100 shadow-sm flex items-center">
                            {[
                                { label: '7D', value: '7' },
                                { label: '30D', value: '30' },
                                { label: '90D', value: '90' }
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setPeriod(opt.value)}
                                    className={`px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all ${period === opt.value
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'text-gray-400 hover:bg-gray-50'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        <button className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 transition-all shadow-sm active:scale-95">
                            <Download size={20} />
                        </button>
                    </div>
                </div>

                {/* AI Command Center Pane */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-[3.5rem] blur-xl group-hover:blur-2xl transition-all duration-700 pointer-events-none" />
                    <div className="relative bg-[#0A1128] rounded-[3.5rem] p-10 lg:p-14 text-white overflow-hidden border border-white/5 shadow-2xl">
                        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
                        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />

                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8 text-center lg:text-left">
                                <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20 text-blue-400">
                                    <Sparkles size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Engine v4.0</span>
                                </div>
                                <h2 className="text-4xl lg:text-6xl font-black tracking-tight leading-none uppercase">
                                    Request Neural <br /> <span className="text-blue-500">Business Analysis</span>
                                </h2>
                                <p className="text-white/40 font-bold uppercase tracking-widest text-[11px] leading-relaxed max-w-md mx-auto lg:mx-0">
                                    Our AI clusters will synchronize with your sales ledger, customer sentiment, and market velocity to generate a high-bandwidth growth protocol.
                                </p>
                                <button
                                    onClick={runNeuralAnalysis}
                                    disabled={analyzing}
                                    className="px-12 py-6 bg-blue-600 text-white rounded-[2rem] text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 w-full lg:w-auto overflow-hidden relative group/btn"
                                >
                                    {analyzing ? (
                                        <RefreshCw className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            <Zap size={20} className="fill-current" />
                                            <span>Initiate Analysis</span>
                                        </>
                                    )}
                                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                                </button>
                            </div>

                            <div className="flex flex-col items-center justify-center space-y-8 bg-white/5 border border-white/10 rounded-[2.8rem] p-10 backdrop-blur-md">
                                {analyzing ? (
                                    <div className="flex flex-col items-center justify-center p-20 space-y-6">
                                        <Binary size={48} className="text-blue-500 animate-pulse" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Processing Subconscious Store Data...</p>
                                    </div>
                                ) : aiAnalysis ? (
                                    <div className="w-full space-y-8">
                                        <div className="flex items-center justify-between border-b border-white/5 pb-6">
                                            <div>
                                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Integrity Score</p>
                                                <p className="text-5xl font-black text-white tracking-tighter">{aiAnalysis.overallScore || 85}%</p>
                                            </div>
                                            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl">
                                                <Gauge size={32} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Strengths</p>
                                                <p className="text-xl font-black text-white">{aiAnalysis.strengths?.length || 0}</p>
                                            </div>
                                            <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                                                <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">Risk Factors</p>
                                                <p className="text-xl font-black text-white">{aiAnalysis.weaknesses?.length || 0}</p>
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest text-center">Protocol Validated for Next 12 Cycles</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                                        <Cpu size={56} className="text-white/10" />
                                        <p className="text-[11px] font-black uppercase tracking-widest text-white/30 max-w-[200px]">Neural core standby. Request initiation to receive store intelligence.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <IntelligenceCard label="Total Revenue" value={formatCurrency(performance?.summary?.totalRevenue)} trend="+12.5%" icon={DollarSign} color="blue" />
                    <IntelligenceCard label="Conversion Efficiency" value="3.8%" trend="+0.4%" icon={Target} color="emerald" />
                    <IntelligenceCard label="Active Nodes" value={performance?.summary?.totalProducts || 0} trend="Optimal" icon={Layers} color="purple" />
                    <IntelligenceCard label="Trust Quotient" value={(performance?.summary?.averageRating || 0).toFixed(1)} trend="Verified" icon={Award} color="amber" />
                </div>

                <AnimatePresence>
                    {aiAnalysis && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                        >
                            {/* Priority Actions */}
                            <div className="lg:col-span-2 space-y-8">
                                <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100/50">
                                    <div className="flex items-center justify-between mb-10">
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">High-Bandwidth Actions</h3>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Recommended Growth Vectors</p>
                                        </div>
                                        <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest">Protocol Defined</div>
                                    </div>

                                    <div className="space-y-4">
                                        {(aiAnalysis.priorityActions || []).map((action, idx) => (
                                            <div key={idx} className="group p-6 bg-gray-50/50 rounded-[1.8rem] border border-transparent hover:border-blue-100 hover:bg-white transition-all duration-500 flex items-start justify-between gap-6 cursor-pointer">
                                                <div className="flex gap-5">
                                                    <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                                                        <span className="text-xs font-black">0{idx + 1}</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{action.action}</h4>
                                                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-1 leading-relaxed">{action.expectedOutcome}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2 shrink-0">
                                                    <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-widest border border-emerald-100">
                                                        Impact: {action.impact}
                                                    </span>
                                                    <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-widest border border-blue-100">
                                                        Effort: {action.effort}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Competitive Edge Section */}
                                <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100/50 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                                        <Trophy size={200} />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase mb-8">Competitive Edge Index</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Market ROI</span>
                                                <TrendingUp size={14} className="text-emerald-500" />
                                            </div>
                                            <p className="text-3xl font-black text-gray-900">4.2x</p>
                                            <div className="h-1 w-full bg-gray-50 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 w-[75%]" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Retention Beta</span>
                                                <Workflow size={14} className="text-blue-500" />
                                            </div>
                                            <p className="text-3xl font-black text-gray-900">68%</p>
                                            <div className="h-1 w-full bg-gray-50 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 w-[68%]" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Acquisition Alpha</span>
                                                <TrendingUp size={14} className="text-purple-500" />
                                            </div>
                                            <p className="text-3xl font-black text-gray-900">12%</p>
                                            <div className="h-1 w-full bg-gray-50 rounded-full overflow-hidden">
                                                <div className="h-full bg-purple-500 w-[45%]" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SWOT Mini Grid */}
                            <div className="space-y-6">
                                <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100/50">
                                    <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                                        <ShieldAlert size={16} className="text-blue-600" /> Integrity Matrix
                                    </h4>
                                    <div className="space-y-8">
                                        <MatrixBlock label="Strengths" items={aiAnalysis.strengths} color="emerald" />
                                        <MatrixBlock label="Weaknesses" items={aiAnalysis.weaknesses} color="rose" />
                                        <MatrixBlock label="Opportunities" items={aiAnalysis.opportunities} color="blue" />
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[3rem] p-10 text-white shadow-xl shadow-indigo-500/20">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-60">Revenue Projection (90d)</h4>
                                    <p className="text-xs font-bold leading-relaxed mb-6 italic">"{aiAnalysis.growthProjection?.['90days']}"</p>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp size={20} className="text-emerald-400" />
                                        <span className="text-2xl font-black tracking-tighter">+24.8% Expected</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Detailed Analysis Tabs */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                    <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100/50">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Performance Trajectory</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Growth correlation across all nodes</p>
                            </div>
                            <select className="bg-gray-50 border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-100">
                                <option>Volume vs Revenue</option>
                                <option>AOV vs Conversion</option>
                            </select>
                        </div>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={WEEKLY_DATA}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FAFAFA" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#CBD5E1' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#CBD5E1' }} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                                    <Area type="monotone" dataKey="target" stroke="#E2E8F0" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100/50">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8">Category Signals</h3>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performance?.categoryPerformance?.map(c => ({ subject: c.category, A: c.revenue, fullMark: performance.summary.totalRevenue })) || performanceRadarMock}>
                                        <PolarGrid stroke="#F1F5F9" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }} />
                                        <Radar name="Performance" dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-8 p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none mb-2">Primary Engine</p>
                                    <p className="text-sm font-black text-blue-900 uppercase">{performance?.categoryPerformance?.[0]?.category || 'ELECTRONICS'}</p>
                                </div>
                                <Layers size={24} className="text-blue-500" />
                            </div>
                        </div>

                        <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100/50 group overflow-hidden relative">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Market Visibility</h3>
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <p className="text-3xl font-black text-gray-900 tracking-tighter">12.4K</p>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Impressions</p>
                                </div>
                                <div className="w-[1px] h-10 bg-gray-100" />
                                <div className="text-center">
                                    <p className="text-3xl font-black text-gray-900 tracking-tighter">2.1K</p>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Unique Nodes</p>
                                </div>
                            </div>
                            <div className="mt-8 h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: '65%' }}
                                    className="h-full bg-blue-600 rounded-full"
                                />
                            </div>
                            <p className="text-[9px] font-black text-blue-500 mt-3 uppercase tracking-widest">+15% vs previous cycle</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

function IntelligenceCard({ label, value, trend, icon: Icon, color }) {
    const colors = {
        blue: 'text-blue-600 bg-blue-50',
        emerald: 'text-emerald-600 bg-emerald-50',
        purple: 'text-purple-600 bg-purple-50',
        amber: 'text-amber-600 bg-amber-50',
    }
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-[2.8rem] shadow-sm border border-gray-100/50 flex flex-col justify-between group"
        >
            <div className="flex justify-between items-start mb-10">
                <div className={`p-4 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform duration-500`}>
                    <Icon size={20} />
                </div>
                <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter">
                    {trend}
                </div>
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 leading-none">{label}</p>
                <p className="text-3xl font-black text-gray-900 tracking-tighter leading-none">{value}</p>
            </div>
        </motion.div>
    )
}

function MatrixBlock({ label, items, color }) {
    const colors = {
        emerald: 'text-emerald-500 border-emerald-100 bg-emerald-50',
        rose: 'text-rose-500 border-rose-100 bg-rose-50',
        blue: 'text-blue-500 border-blue-100 bg-blue-50',
    }
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${colors[color].split(' ')[0]}`} />
                <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{label}</span>
            </div>
            <div className="space-y-2">
                {items?.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex gap-2">
                        <ChevronRight size={10} className="mt-1 text-gray-300" />
                        <p className="text-[11px] font-bold text-gray-500 leading-tight tracking-tight">{item}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}


const performanceRadarMock = [
    { subject: 'Shipping', A: 120, fullMark: 150 },
    { subject: 'Quality', A: 98, fullMark: 150 },
    { subject: 'Response', A: 86, fullMark: 150 },
    { subject: 'Pricing', A: 99, fullMark: 150 },
    { subject: 'Stock', A: 85, fullMark: 150 },
    { subject: 'Returns', A: 65, fullMark: 150 },
];

const WEEKLY_DATA = [
    { day: 'MON', revenue: 4000, target: 3500 },
    { day: 'TUE', revenue: 3000, target: 3500 },
    { day: 'WED', revenue: 6000, target: 3500 },
    { day: 'THU', revenue: 2780, target: 3500 },
    { day: 'FRI', revenue: 5890, target: 3500 },
    { day: 'SAT', revenue: 8390, target: 3500 },
    { day: 'SUN', revenue: 7490, target: 3500 },
];
