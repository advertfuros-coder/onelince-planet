// app/seller/(seller)/reports/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
    BarChart3,
    PieChart,
    LineChart,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    Calendar,
    Filter,
    Layers,
    Target,
    Zap,
    FileText,
    TrendingUp,
    Globe,
    Activity,
    ChevronDown,
    Search,
    Printer,
    Share2,
    Database,
    Binary
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
    Bar,
    Cell,
    PieChart as RePieChart,
    Pie
} from 'recharts'

export default function ReportsPage() {
    const { token } = useAuth()
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState('30')
    const [data, setData] = useState(null)

    useEffect(() => {
        if (token) fetchReportData()
    }, [token, period])

    async function fetchReportData() {
        try {
            setLoading(true)
            const res = await axios.get(`/api/seller/reports?period=${period}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                setData(res.data.reports)
            }
        } catch (error) {
            console.error('Error fetching reports:', error)
            // Mock data for UI development
            setData(MOCK_REPORTS)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (val) => `₹${(val || 0).toLocaleString('en-IN')}`

    if (loading && !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 font-black uppercase tracking-widest text-[9px]">Compiling Analytical Nodes...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8">
            <div className="max-w-[1500px] mx-auto space-y-10">

                {/* Header: Analytical Terminal */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                                <BarChart3 size={22} />
                            </div>
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100">Analytical Terminal</span>
                        </div>
                        <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none uppercase">Data Intelligence Gallery</h1>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-[11px] mt-3 flex items-center gap-2">
                            <Database size={14} className="text-indigo-500" /> Repository: Multi-Node Distribution — Insights V4
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="bg-white p-1.5 rounded-[1.8rem] border border-gray-100 shadow-sm flex items-center">
                            {['7', '30', '90', 'ALL'].map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => setPeriod(opt)}
                                    className={`px-6 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all ${period === opt
                                            ? 'bg-indigo-600 text-white shadow-lg'
                                            : 'text-gray-400 hover:bg-gray-50'
                                        }`}
                                >
                                    {opt === 'ALL' ? 'LIFETIME' : `${opt}D`}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-indigo-600 transition-all shadow-sm">
                                <Share2 size={18} />
                            </button>
                            <button className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-indigo-600 transition-all shadow-sm">
                                <Printer size={18} />
                            </button>
                            <button className="flex items-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all">
                                <Download size={18} />
                                <span>Export Matrix</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <ReportKPI label="Net Revenue" value={formatCurrency(data?.summary?.revenue)} change="+14.2%" trend="up" icon={DollarSignIcon} />
                    <ReportKPI label="Total Orders" value={data?.summary?.orders || 0} change="+8.1%" trend="up" icon={FileText} />
                    <ReportKPI label="Avg Order Value" value={formatCurrency(data?.summary?.aov)} change="-1.4%" trend="down" icon={Target} />
                    <ReportKPI label="Retention Beta" value={`${data?.summary?.retention || 0}%`} change="+4.2%" trend="up" icon={Activity} />
                </div>

                {/* Main Evolution Matrix (Main Chart) */}
                <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">Market Evolution Matrix</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                                <Binary size={14} className="text-indigo-500" /> Revenue vs Transaction Velocity (Time-Series)
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="w-2 h-2 rounded-full bg-indigo-600" />
                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Revenue Alpha</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="w-2 h-2 rounded-full bg-gray-200" />
                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Benchmark</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[450px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.timeSeries || []}>
                                <defs>
                                    <linearGradient id="colorInd" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }}
                                    tickFormatter={(val) => `₹${val / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.14)', padding: '20px' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#4F46E5"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorInd)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="benchmark"
                                    stroke="#E2E8F0"
                                    strokeWidth={2}
                                    fillOpacity={0}
                                    strokeDasharray="5 5"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Dimensional Analysis (Two columns) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">

                    {/* Category Distribution */}
                    <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100/50">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase leading-none">Categorical Slices</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Revenue cluster breakdown by node</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-indigo-600">
                                <Layers size={21} />
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie
                                        data={data?.categories || []}
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {data?.categories?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </RePieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            {data?.categories?.map((cat, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                                    <div>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{cat.name}</p>
                                        <p className="text-xs font-black text-gray-900">{cat.percentage}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Regional Performance Heatmap (Horizontal Bars) */}
                    <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100/50">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase leading-none">Territorial Velocity</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Top performing geographical nodes</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-indigo-600">
                                <Globe size={21} />
                            </div>
                        </div>
                        <div className="space-y-6">
                            {(data?.regions || []).map((region, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex items-center justify-between px-2">
                                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{region.label}</span>
                                        <span className="text-[10px] font-black text-indigo-600">{formatCurrency(region.value)}</span>
                                    </div>
                                    <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100/50">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${region.percentage}%` }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-12 p-8 bg-indigo-900 rounded-[2rem] text-white relative overflow-hidden group">
                            <TrendingUp className="absolute bottom-[-20%] right-[-10%] w-32 h-32 text-indigo-500/20 group-hover:scale-110 transition-transform" />
                            <div className="relative z-10">
                                <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-2">Aggregated Forecast</p>
                                <h4 className="text-xl font-black tracking-tight uppercase leading-none">Regional Scale Potential: +24%</h4>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    )
}

function ReportKPI({ label, value, change, trend, icon: Icon }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-[2.8rem] shadow-sm border border-gray-100/50 flex flex-col justify-between group"
        >
            <div className="flex justify-between items-start mb-8">
                <div className="p-4 rounded-xl bg-gray-50 text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm border border-gray-100 group-hover:border-indigo-500">
                    <Icon size={20} />
                </div>
                <div className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 border ${trend === 'up'
                        ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                        : 'text-rose-600 bg-rose-50 border-rose-100'
                    }`}>
                    {trend === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {change}
                </div>
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 leading-none">{label}</p>
                <p className="text-3xl font-black text-gray-900 tracking-tighter leading-none">{value}</p>
            </div>
        </motion.div>
    )
}

function DollarSignIcon({ size = 20 }) {
    return <span className="font-black text-lg">$</span>
}

const CHART_COLORS = ['#4F46E5', '#818CF8', '#C7D2FE', '#E0E7FF', '#3730A3'];

const MOCK_REPORTS = {
    summary: {
        revenue: 842500,
        orders: 1420,
        aov: 593.30,
        retention: 64
    },
    timeSeries: [
        { date: 'DEC 01', revenue: 12000, benchmark: 10000 },
        { date: 'DEC 05', revenue: 24000, benchmark: 11000 },
        { date: 'DEC 10', revenue: 18000, benchmark: 12000 },
        { date: 'DEC 15', revenue: 45000, benchmark: 13000 },
        { date: 'DEC 20', revenue: 38000, benchmark: 14000 },
        { date: 'DEC 25', revenue: 62000, benchmark: 15000 },
        { date: 'DEC 30', revenue: 54000, benchmark: 16000 },
    ],
    categories: [
        { name: 'Electronics', value: 45, percentage: 45 },
        { name: 'Accessories', value: 25, percentage: 25 },
        { name: 'Lifestyle', value: 20, percentage: 20 },
        { name: 'Apparel', value: 10, percentage: 10 },
    ],
    regions: [
        { label: 'Dubai Central', value: 240000, percentage: 85 },
        { label: 'Abu Dhabi', value: 185000, percentage: 65 },
        { label: 'Sharjah', value: 120000, percentage: 45 },
        { label: 'RAK City', value: 85000, percentage: 32 },
    ]
}
