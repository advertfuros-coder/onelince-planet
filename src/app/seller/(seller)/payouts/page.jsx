'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useAuth } from '@/lib/context/AuthContext'
import {
  DollarSign,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  ChevronRight,
  Download,
  Filter,
  TrendingUp,
  AlertCircle,
  Wallet
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function PayoutsPage() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    if (token) {
      fetchPayouts()
    }
  }, [token])

  const fetchPayouts = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/api/seller/payouts', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        setData(res.data)
      }
    } catch (err) {
      toast.error('Failed to load financial data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Syncing Ledger...</p>
        </div>
      </div>
    )
  }

  const waterfallData = [
    { name: 'Gross Sales', value: data?.waterfall?.grossSales, color: '#2563eb' },
    { name: 'Commission', value: -data?.waterfall?.commission, color: '#ef4444' },
    { name: 'Logistics', value: -data?.waterfall?.shipping, color: '#f59e0b' },
    { name: 'Net Payout', value: data?.waterfall?.netPayout, color: '#10b981' },
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="max-w-[1400px] mx-auto p-6 lg:p-10 space-y-10">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Financials <span className="text-blue-600">.</span></h1>
            <p className="text-slate-500 font-bold text-sm mt-1">Real-time revenue settlement and payout tracking.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
              <Download size={14} /> Export Report
            </button>
          </div>
        </div>

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Pending Payout"
            value={`₹${data?.stats?.pendingPayout.toLocaleString()}`}
            subtitle={`Scheduled for ${data?.stats?.nextPayoutDate}`}
            icon={Clock}
            variant="blue"
          />
          <StatCard
            title="Lifetime Earnings"
            value={`₹${data?.stats?.lifetimeEarnings.toLocaleString()}`}
            subtitle="Total revenue generated"
            icon={TrendingUp}
            variant="indigo"
          />
          <StatCard
            title="Total Withdrawn"
            value={`₹${data?.stats?.totalWithdrawn.toLocaleString()}`}
            subtitle="Successfully settled"
            icon={CheckCircle2}
            variant="green"
          />
          <StatCard
            title="Marketplace Fees"
            value={`5%`}
            subtitle="Standard commission rate"
            icon={AlertCircle}
            variant="orange"
          />
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left Side: Waterfall Chart & Pending Orders */}
          <div className="lg:col-span-8 space-y-10">

            {/* Revenue Waterfall */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/20">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Revenue Waterfall</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Breakdown for the current cycle</p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <Wallet size={20} />
                </div>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={waterfallData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }}
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-100">
                              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{payload[0].payload.name}</p>
                              <p className="text-xl font-black text-slate-900">₹{Math.abs(payload[0].value).toLocaleString()}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={60}>
                      {waterfallData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-8">
                {waterfallData.map((item, idx) => (
                  <div key={idx} className="text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.name}</p>
                    <p className={`text-sm font-black ${item.value < 0 ? 'text-rose-500' : 'text-slate-900'}`}>
                      {item.value < 0 ? '-' : ''}₹{Math.abs(item.value).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Eligible Orders for Next Payout */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/20">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Upcoming Payout Items</h3>
                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All Orders</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="text-left py-4 text-[10px] font-black text-slate-400 uppercase">Order</th>
                      <th className="text-left py-4 text-[10px] font-black text-slate-400 uppercase">Amount</th>
                      <th className="text-left py-4 text-[10px] font-black text-slate-400 uppercase">Status</th>
                      <th className="text-right py-4 text-[10px] font-black text-slate-400 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data?.pendingOrders?.length > 0 ? (
                      data.pendingOrders.map((order, idx) => (
                        <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-4">
                            <p className="text-xs font-black text-slate-900">#{order.orderNumber}</p>
                            <p className="text-[10px] font-bold text-slate-400">{new Date(order.date).toLocaleDateString()}</p>
                          </td>
                          <td className="py-4">
                            <p className="text-xs font-black text-slate-900">₹{order.amount.toLocaleString()}</p>
                            <p className="text-[9px] font-bold text-rose-500">-₹{order.commission.toLocaleString()} (fee)</p>
                          </td>
                          <td className="py-4">
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                              {order.status}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <button className="p-2 text-slate-300 group-hover:text-blue-600 transition-colors">
                              <ChevronRight size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-10 text-center">
                          <p className="text-xs font-bold text-slate-400">No pending orders for payout.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Side: Payout History & Bank Info */}
          <div className="lg:col-span-4 space-y-10">

            {/* Summary Card */}
            <div className="bg-[#1E293B] rounded-[2.5rem] p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Settlement Account</h4>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-black tracking-tight">HDFC Bank</p>
                    <p className="text-[10px] font-bold text-slate-400">**** 8291</p>
                  </div>
                </div>
                <button className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95">
                  Update Payment Details
                </button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 opacity-20 rounded-full blur-[70px]" />
            </div>

            {/* Recent History */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/20">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Recent History</h3>
              <div className="space-y-6">
                {data?.history?.length > 0 ? (
                  data.history.map((payout, idx) => (
                    <div key={idx} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${payout.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                          }`}>
                          <CheckCircle2 size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">₹{payout.amount.toLocaleString()}</p>
                          <p className="text-[10px] font-bold text-slate-400">{new Date(payout.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <button className="text-[10px] font-black text-slate-300 group-hover:text-slate-900 transition-colors">
                        INVOICE
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">No history found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white">
              <h4 className="font-bold text-lg mb-2">Need Help?</h4>
              <p className="text-indigo-100 text-xs font-medium mb-6">Facing issues with your payout? Our finance team is available 24/7.</p>
              <button className="w-full py-4 bg-black/20 backdrop-blur-md text-white border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black/30 transition-all">
                Raise Ticket
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

function StatCard({ title, value, subtitle, icon: Icon, variant }) {
  const variants = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-emerald-50 text-emerald-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/20 group hover:translate-y-[-4px] transition-all">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl ${variants[variant]} group-hover:scale-110 transition-transform`}>
          <Icon size={20} />
        </div>
        <ArrowUpRight size={16} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
      <p className="text-2xl font-black text-slate-900 tracking-tight mb-1">{value}</p>
      <p className="text-[10px] font-bold text-slate-400">{subtitle}</p>
    </div>
  )
}
