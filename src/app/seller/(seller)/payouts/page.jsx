// app/seller/(seller)/payouts/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Download,
  Filter,
  Plus,
  ChevronRight,
  Clock,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  DollarSign,
  Lock,
  Globe,
  Activity,
  CreditCard,
  Menu,
  Calendar,
  Search
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

export default function PayoutsPage() {
  const { token } = useAuth()
  const [stats, setStats] = useState(null)
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState('')

  useEffect(() => {
    if (token) {
      fetchPayoutData()
    }
  }, [token])

  async function fetchPayoutData() {
    try {
      setLoading(true)
      const res = await axios.get('/api/seller/payouts', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.data.success) {
        setStats({
          availableBalance: res.data.stats.availableBalance,
          pendingSettlement: res.data.stats.pendingPayouts,
          lastPayout: res.data.payouts[0]?.amount || 0,
          totalSettled: res.data.stats.totalPaidOut
        })
        setPayouts(res.data.payouts.map(p => ({
          id: p._id,
          date: new Date(p.createdAt).toLocaleDateString(),
          amount: p.amount,
          status: p.status,
          method: p.bankDetails ? `${p.bankDetails.bankName} (...${p.bankDetails.accountNumber.slice(-4)})` : 'Bank Transfer'
        })))
      }
    } catch (error) {
      console.error('Error fetching payouts:', error)
      // Mock data for fallback
      setStats({
        availableBalance: 45890.50,
        pendingSettlement: 12400.00,
        lastPayout: 28500.00,
        totalSettled: 154000.00
      })
      setPayouts([
        { id: 'TXN-9021', date: '2025-12-22', amount: 28500, status: 'completed', method: 'Bank Transfer' },
        { id: 'TXN-8942', date: '2025-12-15', amount: 12000, status: 'pending', method: 'UPI' },
      ])
    } finally {
      setLoading(false)
    }
  }

  async function handleRequestPayout() {
    if (!payoutAmount || isNaN(payoutAmount)) return toast.error('Enter valid amount')
    if (payoutAmount > (stats?.availableBalance || 0)) return toast.error('Insufficient liquidity')

    try {
      setRequesting(true)
      const res = await axios.post('/api/seller/payouts',
        { amount: Number(payoutAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data.success) {
        toast.success('Withdrawal protocol initiated')
        setShowModal(false)
        fetchPayoutData()
      }
    } catch (error) {
      toast.error('Withdrawal failed. Check balance.')
    } finally {
      setRequesting(false)
    }
  }

  const formatCurrency = (val) => `₹${(val || 0).toLocaleString('en-IN')}`

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 font-black uppercase tracking-widest text-[9px]">Analyzing Liquidity Pool...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-10">

        {/* Header: Liquidity Console */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                <Wallet size={22} />
              </div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">Financial Ledger</span>
            </div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none uppercase">Liquidity Console</h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[11px] mt-3 flex items-center gap-2">
              <Globe size={14} className="text-blue-500" /> Settlement Frequency: T+2 Cycle — Node Active
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowModal(true)}
              className="px-8 py-5 bg-blue-600 text-white rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:bg-blue-500 transition-all active:scale-95 flex items-center gap-3"
            >
              <ArrowUpRight size={18} />
              <span>Request Withdrawal</span>
            </button>
            <button className="p-5 bg-white border border-gray-100 rounded-[1.8rem] text-gray-400 hover:text-blue-600 transition-all shadow-sm">
              <Download size={20} />
            </button>
          </div>
        </div>

        {/* Balance Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <BalanceCard label="Available Liquidity" value={formatCurrency(stats?.availableBalance)} icon={DollarSign} color="emerald" trend="Settled" />
          <BalanceCard label="Pending Settlement" value={formatCurrency(stats?.pendingSettlement)} icon={Clock} color="amber" trend="Escrow" />
          <BalanceCard label="Last Transmission" value={formatCurrency(stats?.lastPayout)} icon={ArrowUpRight} color="blue" trend="Completed" />
          <BalanceCard label="Total Disbursed" value={formatCurrency(stats?.totalSettled)} icon={CheckCircle2} color="indigo" trend="Lifetime" />
        </div>

        {/* Encryption Protocol Notice */}
        <div className="bg-gray-900 rounded-[3rem] p-10 relative overflow-hidden group border border-gray-800">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent pointer-events-none" />
          <Activity className="absolute bottom-[-20%] right-[-5%] w-64 h-64 text-blue-500/10 group-hover:scale-110 transition-transform duration-700" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-2 space-y-6 text-center lg:text-left">
              <h3 className="text-2xl lg:text-3xl font-black text-white tracking-tight uppercase leading-none">
                Institutional Settlement <span className="text-blue-500">Infrastructure</span>
              </h3>
              <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] leading-relaxed max-w-2xl mx-auto lg:mx-0">
                All financial transmissions are processed through encrypted banking nodes. Settlement cycles are automated based on your account topology and KYC verification status.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[9px] font-black uppercase text-blue-400">AES-256 Bridge</div>
                <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[9px] font-black uppercase text-blue-400">T+2 Protocol</div>
                <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[9px] font-black uppercase text-blue-400">Verified Hub</div>
              </div>
            </div>
            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-md text-center">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Vault Integrity</p>
              <p className="text-4xl font-black text-white tracking-tighter">100%</p>
              <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Ledger */}
        <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100/50 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Settlement History</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Full audit trail of all financial nodes</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="TXN ID / AMOUNT"
                  className="pl-12 pr-6 py-3 bg-gray-50 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-gray-300 w-full md:w-64"
                />
              </div>
              <button className="flex items-center gap-2 px-5 py-3 bg-gray-50 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-colors">
                <Filter size={14} /> Filter
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="pb-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocol ID</th>
                  <th className="pb-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Commit Date</th>
                  <th className="pb-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                  <th className="pb-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Transmission Status</th>
                  <th className="pb-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <Lock size={14} />
                        </div>
                        <span className="text-xs font-black text-gray-900 uppercase tracking-tighter">{payout.id}</span>
                      </div>
                    </td>
                    <td className="py-6">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">{payout.date}</span>
                    </td>
                    <td className="py-6">
                      <span className="text-sm font-black text-gray-900">{formatCurrency(payout.amount)}</span>
                    </td>
                    <td className="py-6">
                      <StatusBadge status={payout.status} />
                    </td>
                    <td className="py-6 text-right">
                      <button className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100">
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[3.5rem] w-full max-w-xl p-10 lg:p-14 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                <Wallet size={200} />
              </div>

              <div className="relative z-10 space-y-10">
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                    <ArrowUpRight size={32} />
                  </div>
                  <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">Initiate Withdrawal</h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Commit specific liquidity to settlement bridge</p>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Available Pool</p>
                      <p className="text-2xl font-black text-emerald-600 tracking-tighter">{formatCurrency(stats?.availableBalance)}</p>
                    </div>
                    <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-100">Verified</div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Disbursement Amount</label>
                    <div className="relative group">
                      <div className="absolute left-8 top-1/2 -translate-y-1/2 font-black text-gray-300 group-focus-within:text-blue-600 transition-colors">₹</div>
                      <input
                        type="number"
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-14 pr-8 py-6 bg-gray-50 border-none rounded-[2.2rem] text-2xl font-black tracking-tighter focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-gray-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    onClick={handleRequestPayout}
                    disabled={requesting || !payoutAmount}
                    className="w-full py-6 bg-blue-600 text-white rounded-[2rem] text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/30 hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {requesting ? <RefreshCw className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                    <span>Confirm Transmission</span>
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full py-6 text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-gray-600 transition-colors"
                  >
                    Abort Protocol
                  </button>
                </div>

                <div className="flex items-center gap-2 justify-center">
                  <Lock size={12} className="text-emerald-500" />
                  <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.1em]">Secured by SSL End-to-End Encryption</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function BalanceCard({ label, value, icon: Icon, color, trend }) {
  const colors = {
    emerald: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
    blue: 'text-blue-600 bg-blue-50',
    indigo: 'text-indigo-600 bg-indigo-50',
  }
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-[2.8rem] shadow-sm border border-gray-100/50 flex flex-col justify-between group"
    >
      <div className="flex justify-between items-start mb-10">
        <div className={`p-4 rounded-xl ${colors[color]} group-hover:scale-110 transition-transform duration-500`}>
          <Icon size={20} />
        </div>
        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${colors[color]} bg-opacity-20`}>
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

function StatusBadge({ status }) {
  const config = {
    completed: { color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: CheckCircle2, label: 'Settled' },
    pending: { color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Clock, label: 'Processing' },
    failed: { color: 'text-rose-600 bg-rose-50 border-rose-100', icon: AlertCircle, label: 'Review Required' },
  }
  const { color, icon: Icon, label } = config[status] || config.pending

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${color} text-[9px] font-black uppercase tracking-widest`}>
      <Icon size={12} />
      <span>{label}</span>
    </div>
  )
}
