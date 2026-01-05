// app/seller/(seller)/customers/page.jsx
'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Star,
  User,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Target,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { formatPrice } from '@/lib/utils'

export default function SellerCustomers() {
  const { token } = useAuth()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid')

  useEffect(() => {
    if (token) {
      loadCustomers()
    }
  }, [token])

  const loadCustomers = async () => {
    if (!token) return

    setLoading(true)
    try {
      const response = await axios.get('/api/seller/customers', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.data.success) {
        setCustomers(response.data.customers)
      } else {
        toast.error('Failed to load customers')
      }
    } catch (error) {
      console.error('Error loading customers:', error)
      toast.error('Failed to load customer data')
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const customerStats = {
    total: customers.length,
    returning: customers.filter(c => c.totalOrders > 1).length,
    highValue: customers.filter(c => c.totalSpent > 10000).length,
    avgLTV: customers.reduce((acc, curr) => acc + (curr.totalSpent || 0), 0) / (customers.length || 1)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8">
      <div className="max-w-[1500px] mx-auto space-y-8">

        {/* Modern Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Target size={18} />
              </div>
              <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Retention Hub</span>
            </div>
            <h1 className="text-4xl font-semibold text-gray-900 tracking-tighter flex items-center gap-4">
              Customer Intelligence
            </h1>
            <p className="text-gray-500 font-medium mt-1">Manage relationships and analyze customer lifetime value (LTV)</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-100 rounded-2xl font-semibold text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all active:scale-95">
              <Download size={18} />
              <span>Export CRM</span>
            </button>
            <button
              onClick={loadCustomers}
              className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm active:scale-95"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* CRM Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <CustomerStatCard
            label="Active Base"
            value={customerStats.total}
            icon={User}
            color="blue"
            delay={0.1}
          />
          <CustomerStatCard
            label="Returning"
            value={customerStats.returning}
            icon={RefreshCw}
            color="emerald"
            delay={0.2}
            percent={`${Math.round((customerStats.returning / (customerStats.total || 1)) * 100)}%`}
          />
          <CustomerStatCard
            label="High Tier"
            value={customerStats.highValue}
            icon={Star}
            color="amber"
            delay={0.3}
          />
          <CustomerStatCard
            label="Average LTV"
            value={formatPrice(customerStats.avgLTV)}
            icon={TrendingUp}
            color="indigo"
            delay={0.4}
          />
        </div>

        {/* Filtering & Search Bar */}
        <div className="bg-white rounded-[2rem] p-4 lg:p-6 shadow-sm border border-gray-100/50 flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative group w-full lg:w-[32rem]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by name, email or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-5 py-3 border border-gray-100 rounded-2xl font-semibold text-gray-600 hover:bg-gray-50 shadow-sm transition-all uppercase text-[10px] tracking-widest">
              <Filter size={16} />
              <span>Segments</span>
            </button>
          </div>
        </div>

        {/* Page Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 font-semibold uppercase tracking-widest text-[10px]">Filtering Audience...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-32 text-center border border-gray-100/50 shadow-sm">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-blue-300" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 tracking-tighter">No profiles detected</h3>
            <p className="text-gray-500 font-medium mt-2 max-w-sm mx-auto">Profiles will automatically populate as customers interact with your storefront.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCustomers.map((customer, idx) => (
              <CustomerProfileCard key={customer.id} customer={customer} delay={idx * 0.05} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CustomerStatCard({ label, value, icon: Icon, color, delay, percent }) {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    rose: 'text-rose-600 bg-rose-50',
    amber: 'text-amber-600 bg-amber-50',
    indigo: 'text-indigo-600 bg-indigo-50',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white p-6 rounded-[2.2rem] shadow-sm border border-gray-100/50 group relative overflow-hidden"
    >
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform duration-500`}>
          <Icon size={22} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none">{label}</p>
            {percent && <span className="text-[9px] font-semibold p-1 bg-emerald-50 text-emerald-600 rounded">{percent}</span>}
          </div>
          <p className="text-2xl font-semibold text-gray-900 tracking-tight">{value || 0}</p>
        </div>
      </div>
    </motion.div>
  )
}

function CustomerProfileCard({ customer, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="bg-white p-8 rounded-[2.5rem] border border-gray-100/50 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-[4rem] group-hover:bg-blue-500/10 transition-colors pointer-events-none" />

      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-xl shadow-lg shadow-blue-500/20 group-hover:rotate-6 transition-transform">
            {customer.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 tracking-tight leading-none mb-2">{customer.name}</h3>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-semibold uppercase tracking-tight ${customer.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
              }`}>
              {customer.status || 'Active Portal'}
            </div>
          </div>
        </div>
        <button className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
          <MoreVertical size={20} />
        </button>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
          <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400"><Mail size={14} /></div>
          <span className="truncate">{customer.email}</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
          <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400"><Phone size={14} /></div>
          <span>{customer.phone || 'No direct dial'}</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-gray-500">
          <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400"><MapPin size={14} /></div>
          <span className="truncate">{customer.location || 'Distributed Global'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-8 mt-2">
        <div>
          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <ShoppingBag size={10} /> Volume
          </p>
          <p className="text-xl font-semibold text-gray-900">{customer.totalOrders} <span className="text-[10px] text-gray-300 uppercase ml-1">Orders</span></p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center justify-end gap-1.5">
            Revenue <CreditCard size={10} />
          </p>
          <p className="text-xl font-semibold text-blue-600 font-mono tracking-tighter">{formatPrice(customer.totalSpent)}</p>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button className="flex-1 py-3.5 bg-gray-50 text-gray-900 rounded-[1.2rem] text-[10px] font-semibold uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
          <Mail size={14} />
          Briefing
        </button>
        <button className="flex-1 py-3.5 bg-blue-600 text-white rounded-[1.2rem] text-[10px] font-semibold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 active:scale-95 flex items-center justify-center gap-2">
          Profiles
          <ChevronRight size={14} />
        </button>
      </div>
    </motion.div>
  )
}
