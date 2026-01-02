// seller/(seller)/analytics/page.jsx
'use client'
import { useState, useEffect } from 'react'
import {
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Calendar,
  Download,
  MoreHorizontal,
  ArrowUpRight,
  MousePointer2,
  ChevronDown,
  Plus,
  Zap,
  CheckCircle2,
  ArrowRight
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { formatPrice } from '@/lib/utils'
import AISellerPredictions from '@/components/seller/AISellerPredictions'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import { toast } from 'react-hot-toast'

export default function SellerAnalytics() {
  const { token } = useAuth()
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      conversionRate: 0
    },
    growth: {
      revenue: 0,
      orders: 0,
      avgOrderValue: 0,
      conversionRate: 0
    },
    salesTrend: [],
    topCategories: [],
    customerInsights: {
      newCustomers: 0,
      returningCustomers: 0,
      customerRetentionRate: 0,
      totalCustomers: 0
    }
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30days')

  useEffect(() => {
    if (token) {
      loadAnalytics()
    }
  }, [dateRange, token])

  const loadAnalytics = async () => {
    if (!token) return

    setLoading(true)
    try {
      const response = await axios.get(`/api/seller/analytics?range=${dateRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.data.success) {
        setAnalyticsData(response.data.data)
      } else {
        toast.error('Failed to load analytics')
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
      // Fallback data for demo if API fails
      if (process.env.NODE_ENV === 'development') {
        // setAnalyticsData(...) 
      }
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-bold animate-pulse">Loading Analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen space-y-8">
      <div className="max-w-[1400px] mx-auto">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sales Analytics</h1>
            <p className="text-gray-500 mt-1 font-medium">Track your store performance and understand your customers</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white border border-gray-100 rounded-2xl p-1 shadow-sm flex items-center">
              {['7days', '30days', '90days'].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${dateRange === range
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                  {range === '7days' ? '1W' : range === '30days' ? '1M' : '3M'}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-95">
              <Download size={18} />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Top Grid: Payments Funnel & Gross Volume */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Payments Funnel Visualization */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100/50 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-gray-900">Order Progress</h3>
              <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                <MoreHorizontal size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Funnel Steps mapped from totalOrders */}
            <div className="grid grid-cols-5 gap-2 h-64 items-end relative">
              <FunnelStep
                label="Initiated"
                value={Math.round(analyticsData.overview.totalOrders * 1.5).toLocaleString()}
                height="90%"
                active
              />
              <FunnelStep
                label="Authorized"
                value={Math.round(analyticsData.overview.totalOrders * 1.2).toLocaleString()}
                height="75%"
                active
              />
              <FunnelStep
                label="Successful"
                value={analyticsData.overview.totalOrders.toLocaleString()}
                height="60%"
                active
                highlight
              />
              <FunnelStep
                label="Processing"
                value={Math.round(analyticsData.overview.totalOrders * 0.8).toLocaleString()}
                height="45%"
              />
              <FunnelStep
                label="Delivered"
                value={Math.round(analyticsData.overview.totalOrders * 0.7).toLocaleString()}
                height="35%"
              />

              {/* Drop-off Tooltip (Absolute) */}
              <div className="absolute top-[35%] left-[55%] animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-2">
                  <span className="text-[11px] font-bold text-gray-900">Success Rate: <span className="text-blue-600">{analyticsData.overview.conversionRate || 85}%</span></span>
                  <div className="w-[1px] h-3 bg-gray-200" />
                  <span className="text-[11px] font-bold text-gray-400">Success: <span className="text-emerald-500">High</span></span>
                </div>
              </div>
            </div>

            {/* AI Query Bar */}
            <div className="mt-8 pt-6 border-t border-gray-50">
              <div className="bg-blue-50/50 rounded-2xl p-4 flex items-center gap-3 group/query cursor-pointer hover:bg-blue-50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                  <Zap size={16} fill="currentColor" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-black text-blue-900/40 uppercase tracking-widest mb-0.5">Quick Insight</p>
                  <p className="text-xs font-bold text-blue-900/60">
                    {analyticsData.growth.orders > 0
                      ? `Order volume is up by ${analyticsData.growth.orders.toFixed(1)}% - click to see why.`
                      : "Analyze factors affecting your conversion trends."}
                  </p>
                </div>
                <MousePointer2 size={16} className="text-blue-400 opacity-0 group-hover/query:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>

          {/* Gross Volume Stats */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-gray-900">Total Revenue</h3>
                <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                  <MoreHorizontal size={20} className="text-gray-400" />
                </button>
              </div>
              <div className="flex items-center gap-4 mb-10">
                <h2 className="text-4xl font-black text-gray-900 tracking-tighter">
                  {formatPrice(analyticsData.overview.totalRevenue)}
                </h2>
                <div className={`flex items-center gap-1 ${analyticsData.growth.revenue >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'} px-3 py-1.5 rounded-full text-xs font-black`}>
                  {analyticsData.growth.revenue >= 0 ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180" />}
                  <span>{Math.abs(analyticsData.growth.revenue).toFixed(1)}%</span>
                </div>
              </div>

              <div className="space-y-6">
                <ProgressStat
                  label="Direct Sales"
                  value={analyticsData.overview.totalRevenue * 0.7}
                  total={analyticsData.overview.totalRevenue}
                  color="bg-emerald-500"
                  stripes
                />
                <ProgressStat
                  label="Bulk Orders"
                  value={analyticsData.overview.totalRevenue * 0.2}
                  total={analyticsData.overview.totalRevenue}
                  color="bg-blue-500"
                  stripes
                />
                <ProgressStat
                  label="Offers & Discounts"
                  value={analyticsData.overview.totalRevenue * 0.1}
                  total={analyticsData.overview.totalRevenue}
                  color="bg-pink-500"
                  stripes
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lower Grid: Retention, Transactions, Customers, Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-6 h-auto lg:h-[600px]">

          {/* Retention Stepped Chart */}
          <div className="lg:col-span-1 lg:row-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100/50">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-gray-900">Customer Loyalty</h3>
              <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
                <MoreHorizontal size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="h-[300px] w-full relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black shadow-lg shadow-blue-200">
                {analyticsData.customerInsights.customerRetentionRate}% Rate
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData.salesTrend} margin={{ top: 30, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="_id" hide />
                  <YAxis hide />
                  <Area
                    type="stepAfter"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    fill="url(#colorRetention)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(m => (
                <span key={m} className="text-[10px] font-extrabold text-gray-300 uppercase">{m}</span>
              ))}
            </div>
          </div>

          {/* Metrics Column */}
          <div className="lg:col-span-2 space-y-6">

            <MetricCard
              title="Total Orders"
              value={analyticsData.overview.totalOrders.toLocaleString()}
              change={`${analyticsData.growth.orders >= 0 ? '+' : ''}${analyticsData.growth.orders.toFixed(1)}%`}
              data={analyticsData.salesTrend}
              color="#10B981"
              peak="Avg"
            />

            <MetricCard
              title="Total Customers"
              value={analyticsData.customerInsights.totalCustomers.toLocaleString()}
              change={`+${analyticsData.customerInsights.newCustomers} New`}
              data={analyticsData.salesTrend}
              color="#2563EB"
              peak="Active"
            />
          </div>

          {/* Large Insights/Promo Card */}
          <div className="lg:col-span-1 lg:row-span-2 bg-gradient-to-br from-[#0A1128] to-[#1E3A8A] rounded-[2.5rem] p-10 text-white relative overflow-hidden flex flex-col justify-end">
            <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-blue-600 opacity-20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-10 right-10">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 border border-white/20">
                <Zap size={14} className="text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-widest">Revenue Forecast</span>
              </div>
            </div>

            <div className="relative z-10 space-y-4">
              <h2 className="text-7xl font-black tracking-tighter">
                {analyticsData.growth.revenue > 0 ? `+${analyticsData.growth.revenue.toFixed(0)}%` : '---'}
              </h2>
              <h4 className="text-2xl font-bold leading-tight">
                Your revenue growth trend is {analyticsData.growth.revenue >= 0 ? 'outperforming' : 'adjusting'}.
              </h4>
              <p className="text-white/60 text-sm font-medium pr-10">
                {analyticsData.overview.totalOrders} total transactions processed in the last period.
              </p>
              <div className="pt-6">
                <div className="h-1.5 w-full bg-white/10 rounded-full">
                  <div className="h-full w-3/4 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Existing AI Predictions */}
        <div className="mt-12">
          <AISellerPredictions />
        </div>

      </div>
    </div>
  )
}

function FunnelStep({ label, value, height, active, highlight }) {
  return (
    <div className="flex flex-col items-center gap-4 group flex-1">
      <div className="text-center">
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-lg font-black ${active ? 'text-gray-900' : 'text-gray-300'}`}>{value}</p>
      </div>
      <div
        className={`w-full rounded-t-2xl transition-all duration-1000 ease-out ${highlight ? 'bg-gradient-to-t from-blue-700 to-blue-500' :
          active ? 'bg-blue-100 relative' : 'bg-gray-50'
          }`}
        style={{ height }}
      >
        {active && !highlight && (
          <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#3B82F6_10px,#3B82F6_20px)] rounded-t-2xl" />
        )}
      </div>
    </div>
  )
}

function ProgressStat({ label, value, total, color, stripes }) {
  const percentage = (value / total) * 100;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-gray-500">{label}</span>
        <span className="text-sm font-black text-gray-900">₹{value.toLocaleString()}</span>
      </div>
      <div className="h-4 w-full bg-gray-50 rounded-xl overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: 'circOut' }}
          className={`h-full ${color} rounded-xl relative`}
        >
          {stripes && (
            <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,white_10px,white_20px)]" />
          )}
        </motion.div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, change, data, color, peak }) {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100/50 flex items-center justify-between group overflow-hidden">
      <div>
        <h4 className="text-lg font-black text-gray-900 mb-6">{title}</h4>
        <div className="flex items-baseline gap-4">
          <h2 className="text-5xl font-black text-gray-900 tracking-tighter">{value}</h2>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-emerald-500 tracking-tight">{change}</span>
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">vs last period</span>
          </div>
        </div>
      </div>

      <div className="w-32 h-20 relative">
        <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-black px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Peak: {peak}
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data?.slice(0, 7) || []}>
            <Bar dataKey="orders" radius={[4, 4, 4, 4]}>
              {data?.slice(0, 7).map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 3 ? color : `${color}30`}
                  className="transition-all duration-300"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
