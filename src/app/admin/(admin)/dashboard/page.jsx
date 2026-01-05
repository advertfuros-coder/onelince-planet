// app/(admin)/dashboard/page.jsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
  Users,
  Box,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  UserPlus,
  Package,
  Star,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Activity,
  ArrowUpRight,
  Monitor,
  Calendar,
  Layers,
  Sparkles,
  Truck
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import ResponsiveChart from '@/components/admin/ResponsiveChart'
import ResponsiveTable from '@/components/admin/ResponsiveTable'
import clsx from 'clsx'

const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#06B6D4']

export default function AdminDashboard() {
  const { token, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!token) return

    async function fetchDashboard() {
      try {
        setLoading(true)
        const res = await axios.get('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.data.success) {
          setData(res.data)
          setError('')
        } else {
          setError('Failed to load dashboard')
        }
      } catch (err) {
        setError('Error loading dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [token])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-400 animate-pulse">Initializing Global Terminal...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-[2rem] border border-gray-100 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 uppercase tracking-tight">Access Interrupted</h3>
          <p className="text-sm text-gray-500 mt-2 font-semibold uppercase tracking-widest text-[11px]">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 w-full py-4 bg-[#0F172A] text-white rounded-2xl font-semibold uppercase tracking-widest text-xs hover:bg-black transition-all active:scale-95"
          >
            Reconnect Terminal
          </button>
        </div>
      </div>
    )
  }

  const overview = data?.dashboard || {}
  const weeklyNewOrders = data?.weeklyNewOrders || []
  const sellerDistribution = data?.sellerDistribution || []
  const topSellers = data?.topSellers || []
  const topProducts = data?.topProducts || []
  const lowSellingProducts = data?.lowSellingProducts || []
  const categoryPerformance = data?.categoryPerformance || []
  const regionalPerformance = data?.regionalPerformance || []

  return (
    <div className="space-y-10 pb-20">

      {/* Dynamic Command Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-[#0A1128] rounded-[3rem] p-10 lg:p-14 text-white shadow-2xl"
      >
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400">
              <Sparkles size={14} />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Marketplace Intelligence Active</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-semibold tracking-tighter leading-none uppercase">
              Welcome, <br /> <span className="text-blue-500">{user?.name || 'Administrator'}</span>
            </h1>
            <p className="text-white/40 font-semibold uppercase tracking-widest text-[11px] max-w-md leading-relaxed">
              System synchronized with global nodes. Monitoring data velocity across all marketplace sectors in real-time.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-md">
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1">Health Score</p>
              <p className="text-4xl font-semibold text-white tracking-tighter">98.4</p>
            </div>
            <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-md">
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1">Active Nodes</p>
              <p className="text-4xl font-semibold text-white tracking-tighter">{overview?.totalSellers || 0}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Primary Intelligence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Gross Revenue"
          value={`₹${(parseFloat(overview?.totalRevenue) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          icon={DollarSign}
          color="blue"
          trend={overview?.revenueGrowth ? `${overview.revenueGrowth > 0 ? '+' : ''}${parseFloat(overview.revenueGrowth).toFixed(1)}%` : '0%'}
        />
        <MetricCard
          title="Global Orders"
          value={overview?.totalOrders || 0}
          icon={ShoppingCart}
          color="emerald"
          trend={overview?.orderGrowth ? `${overview.orderGrowth > 0 ? '+' : ''}${parseFloat(overview.orderGrowth).toFixed(1)}%` : '0%'}
        />
        <MetricCard
          title="Verified Sellers"
          value={overview?.totalSellers || 0}
          icon={Users}
          color="purple"
          subtitle={`${overview?.activeProducts || 0} Active Assets`}
        />
        <MetricCard
          title="Customer Base"
          value={overview?.totalCustomers || 0}
          icon={UserPlus}
          color="amber"
          trend={overview?.customerGrowth ? `${overview.customerGrowth > 0 ? '+' : ''}${parseFloat(overview.customerGrowth).toFixed(1)}%` : '0%'}
        />
      </div>

      {/* Multi-Node Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <SmallMetricCard title="Avg Basket" value={`₹${(parseFloat(overview?.avgOrderValue) || 0).toFixed(0)}`} icon={DollarSign} color="blue" />
        <SmallMetricCard title="Conversion" value={`${(parseFloat(overview?.conversionRate) || 0).toFixed(1)}%`} icon={TrendingUp} color="emerald" />
        <SmallMetricCard title="Quality Alpha" value={(parseFloat(overview?.averageRating) || 0).toFixed(1)} icon={Star} color="amber" />
        <SmallMetricCard title="Awaiting Meta" value={overview?.pendingOrders || 0} icon={Package} color="purple" />
        <SmallMetricCard title="Success Nodes" value={overview?.completedOrders || 0} icon={CheckCircle2} color="indigo" />
        <SmallMetricCard title="Bounce Rate" value={overview?.cancelledOrders || 0} icon={XCircle} color="rose" />
      </div>

      {/* Visual Analytics Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartPanel title="Velocity: Weekly Order Trends" icon={Activity}>
          {weeklyNewOrders?.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={weeklyNewOrders}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#94A3B8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorOrders)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Awaiting data synchronization..." />
          )}
        </ChartPanel>

        <ChartPanel title="Ecosystem: Seller Tier Distribution" icon={Layers}>
          {sellerDistribution?.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={sellerDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={8}
                >
                  {sellerDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Seller data offline." />
          )}
        </ChartPanel>

        <ChartPanel title="Revenue: Sector Performance" icon={TrendingUp}>
          {categoryPerformance?.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={categoryPerformance} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#94A3B8' }} />
                <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748B' }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                <Bar dataKey="revenue" fill="#F59E0B" radius={[0, 12, 12, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No category metrics available." />
          )}
        </ChartPanel>

        <ChartPanel title="Regional: Transaction Density" icon={Truck}>
          {regionalPerformance?.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={regionalPerformance}>
                <XAxis dataKey="state" axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={60} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#94A3B8' }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                <Bar dataKey="revenue" fill="#10B981" radius={[12, 12, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="Regional mapping pending." />
          )}
        </ChartPanel>
      </div>

      {/* Leaderboard Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TablePanel title="Top Performing Entities" subtitle="Seller baseline performance">
          {topSellers?.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left py-4 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Provider</th>
                  <th className="text-center py-4 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Volume</th>
                  <th className="text-right py-4 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topSellers.map((seller, idx) => (
                  <tr key={idx} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-[13px] font-semibold text-gray-900">{seller.name}</td>
                    <td className="text-center py-4 px-6 text-sm text-gray-500 font-semibold">{seller.orderCount}</td>
                    <td className="text-right py-4 px-6">
                      <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full px-4 py-2">₹{seller.revenue.toLocaleString('en-IN')}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState message="No seller leaderboard data." compact />
          )}
        </TablePanel>

        <TablePanel title="High Velocity Assets" subtitle="Top selling inventory units">
          {topProducts?.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left py-4 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Asset Unit</th>
                  <th className="text-center py-4 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Units Sold</th>
                  <th className="text-right py-4 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Rev Cap</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, idx) => (
                  <tr key={idx} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-[13px] font-semibold text-gray-900 truncate max-w-[200px]">{product.name}</td>
                    <td className="text-center py-4 px-6 text-sm text-gray-500 font-semibold">{product.totalQty}</td>
                    <td className="text-right py-4 px-6">
                      <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full px-4 py-2">₹{product.revenue.toLocaleString('en-IN')}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState message="Asset metrics unavailable." compact />
          )}
        </TablePanel>
      </div>

      {/* Integrity Alerts: Low Selling Products */}
      {lowSellingProducts?.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="bg-rose-50 rounded-[3rem] p-10 border border-rose-100"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-500/20">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-rose-900 uppercase tracking-tight">System Integrity Alert</h3>
              <p className="text-[10px] font-semibold text-rose-400 uppercase tracking-widest">Underperforming Inventory Nodes Detected</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lowSellingProducts.map((product, idx) => (
              <div key={idx} className="bg-white p-6 rounded-[2rem] border border-rose-100 shadow-sm flex items-center justify-between group hover:scale-[1.02] transition-transform">
                <div>
                  <p className="text-sm font-semibold text-gray-900 uppercase tracking-tight">{product.name}</p>
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest mt-2 flex items-center gap-2">
                    <Monitor size={12} /> Velocity: {product.totalQty} Units / 30d
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                  <ArrowUpRight size={18} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Critical Status Monitoring */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FinalStatusCard title="Pending Logistics" value={overview?.pendingOrders || 0} icon={Package} color="amber" />
        <FinalStatusCard title="Fulfillment Success" value={overview?.completedOrders || 0} icon={CheckCircle2} color="emerald" />
        <FinalStatusCard title="Terminated Nodes" value={overview?.cancelledOrders || 0} icon={XCircle} color="rose" />
      </div>
    </div>
  )
}

// === PREMIUM COMPONENT HELPERS ===

function MetricCard({ title, value, icon: Icon, color, subtitle, trend }) {
  const colorMap = {
    blue: 'bg-blue-600 shadow-blue-500/20 text-blue-600',
    emerald: 'bg-emerald-600 shadow-emerald-500/20 text-emerald-600',
    purple: 'bg-purple-600 shadow-purple-500/20 text-purple-600',
    amber: 'bg-amber-600 shadow-amber-500/20 text-amber-600',
  }
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100/50 group"
    >
      <div className="flex items-start justify-between mb-8">
        <div className={`p-4 rounded-2xl ${colorMap[color].replace('bg-', 'bg-').split(' ')[0]} bg-opacity-10 text-opacity-100 flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon size={24} className={colorMap[color].split(' ')[2]} />
        </div>
        {trend && (
          <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-tighter">
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 leading-none">{title}</p>
        <p className="text-3xl font-semibold text-gray-900 tracking-tighter leading-none">{value}</p>
        {subtitle && <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-2">{subtitle}</p>}
      </div>
    </motion.div>
  )
}

function SmallMetricCard({ title, value, icon: Icon, color }) {
  const colors = {
    blue: 'text-blue-500',
    emerald: 'text-emerald-500',
    purple: 'text-purple-500',
    amber: 'text-amber-500',
    indigo: 'text-indigo-500',
    rose: 'text-rose-500',
  }
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`${colors[color]} p-2 bg-gray-50 rounded-xl`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest leading-none mb-1">{title}</p>
        <p className="text-xl font-semibold text-gray-900 tracking-tighter">{value}</p>
      </div>
    </div>
  )
}

function ChartPanel({ title, children, icon: Icon }) {
  return (
    <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Icon size={16} />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-widest">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function TablePanel({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-10 py-10 bg-gray-50/50 border-b border-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 uppercase tracking-tight">{title}</h3>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">{subtitle}</p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function FinalStatusCard({ title, value, icon: Icon, color }) {
  const colors = {
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100',
  }
  return (
    <div className={`p-8 rounded-[2.8rem] border ${colors[color]} shadow-sm`}>
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-2xl bg-white shadow-sm flex items-center justify-center`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest opacity-60 mb-1">{title}</p>
          <p className="text-4xl font-semibold tracking-tighter leading-none">{value}</p>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ message, compact = false }) {
  return (
    <div className={clsx("flex flex-col items-center justify-center text-center", compact ? "py-10" : "h-64")}>
      <Activity className="text-gray-200 mb-4" size={compact ? 32 : 48} />
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{message}</p>
    </div>
  )
}
