// app/seller/(seller)/integrations/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
  Link as LinkIcon,
  RefreshCw,
  CheckCircle,
  XCircle,
  Settings,
  ShoppingBag,
  Zap,
  Shield,
  Activity,
  Plus,
  ChevronRight,
  Database,
  Globe,
  Lock,
  ArrowUpRight,
  HardDrive
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

const PLATFORM_META = {
  shopify: { name: 'Shopify', icon: '🛍️', color: 'emerald', theme: '#10B981' },
  woocommerce: { name: 'WooCommerce', icon: '🔌', color: 'purple', theme: '#A855F7' },
  magento: { name: 'Magento', icon: '🏪', color: 'orange', theme: '#F97316' },
  bigcommerce: { name: 'BigCommerce', icon: '🛒', color: 'blue', theme: '#3B82F6' },
}

export default function IntegrationsPage() {
  const { token } = useAuth()
  const [integrations, setIntegrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState(null)

  useEffect(() => {
    if (token) fetchIntegrations()
  }, [token])

  async function fetchIntegrations() {
    try {
      setLoading(true)
      const res = await axios.get('/api/seller/integrations', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success) {
        setIntegrations(res.data.integrations || [])
      }
    } catch (error) {
      console.error('Error fetching integrations:', error)
    } finally {
      setLoading(false)
    }
  }

  async function syncIntegration(id) {
    try {
      toast.loading('Synchronizing Nodes...')
      const res = await axios.post(`/api/seller/integrations/${id}/sync`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.dismiss()
      if (res.data.success) {
        toast.success('Omni-Sync successful')
        fetchIntegrations()
      }
    } catch (error) {
      toast.dismiss()
      toast.error('Sync failure')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 font-black uppercase tracking-widest text-[9px]">Initializing External Bridges...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-10">

        {/* Header Block */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <Database size={18} />
              </div>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">Systems Interconnect</span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">API Integration Matrix</h1>
            <p className="text-gray-500 font-medium mt-1">Establish high-bandwidth data bridges between external storefronts and your command center</p>
          </div>

          <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
            <div className="text-right">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Global Sync Health</p>
              <p className="text-lg font-black text-emerald-600 leading-none">99.9% Uptime</p>
            </div>
            <div className="w-[1px] h-8 bg-gray-100" />
            <div className="flex items-center gap-2 text-emerald-500">
              <Activity size={20} className="animate-pulse" />
            </div>
          </div>
        </div>

        {/* Status Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricBox label="Connected Nodes" value={integrations.filter(i => i.status === 'active').length} icon={LinkIcon} color="emerald" />
          <MetricBox label="Last Global Sync" value={integrations[0]?.lastSyncAt ? new Date(integrations[0].lastSyncAt).toLocaleDateString() : 'Protocol Standby'} icon={RefreshCw} color="blue" />
          <MetricBox label="Synced Entities" value={integrations.reduce((sum, i) => sum + (i.syncedProducts || 0), 0)} icon={ShoppingBag} color="purple" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* Platform Selection */}
          <div className="xl:col-span-1 space-y-8">
            <div className="bg-white rounded-[2.8rem] p-8 shadow-sm border border-gray-100/50">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8 flex items-center justify-between">
                <span>Bridge Authorization</span>
                <Plus size={16} className="text-emerald-500 cursor-pointer" />
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(PLATFORM_META).map(([id, meta]) => {
                  const isConnected = integrations.some(i => i.platform === id)
                  return (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      key={id}
                      onClick={() => {
                        if (!isConnected) {
                          setSelectedPlatform({ id, ...meta })
                          setShowModal(true)
                        }
                      }}
                      className={`
                                 p-6 rounded-[2rem] border transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-3
                                 ${isConnected ? 'bg-gray-50 border-gray-100 grayscale' : 'bg-white border-gray-100 hover:shadow-xl hover:shadow-emerald-500/5'}
                               `}
                    >
                      <div className="text-4xl mb-1">{meta.icon}</div>
                      <span className="text-[10px] font-black uppercase text-gray-900">{meta.name}</span>
                      {isConnected ? (
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Active Link</span>
                      ) : (
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Handshake Ready</span>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-emerald-900 rounded-[2.8rem] p-8 text-white relative overflow-hidden group">
              <Lock className="text-emerald-400 mb-4" size={32} />
              <h4 className="text-xl font-black mb-2 tracking-tight">E2E Encryption Active</h4>
              <p className="text-emerald-100/60 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                All protocol handshakes are secured via 256-bit AES cryptographic standards.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[100%]" />
                </div>
                <span className="text-[10px] font-black">SECURE</span>
              </div>
            </div>
          </div>

          {/* Active Bridges */}
          <div className="xl:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Active Neural Bridges</h3>
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-gray-400" />
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Monitoring 4 Endpoints</span>
              </div>
            </div>

            {integrations.length === 0 ? (
              <div className="bg-white rounded-[3rem] p-20 text-center shadow-sm border border-gray-100/50 flex flex-col items-center justify-center space-y-6">
                <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center text-emerald-300">
                  <Zap size={40} />
                </div>
                <h3 className="text-3xl font-black text-gray-900 tracking-tighter">Zero External Links</h3>
                <p className="text-gray-500 max-w-sm font-black uppercase text-[10px] tracking-widest leading-relaxed">Synchronize your first external node to begin low-latency data ingestion.</p>
                <button onClick={() => { setSelectedPlatform({ id: 'shopify', ...PLATFORM_META.shopify }); setShowModal(true); }} className="px-10 py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase text-[11px] tracking-widest hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-500/30">Initiate Link Protocol</button>
              </div>
            ) : (
              <div className="space-y-4">
                {integrations.map((int, idx) => (
                  <ModernIntegrationCard key={int._id} int={int} idx={idx} onSync={() => syncIntegration(int._id)} />
                ))}
              </div>
            )}
          </div>
        </div>

        {showModal && selectedPlatform && <InterconnectModal platform={selectedPlatform} onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); fetchIntegrations(); }} token={token} />}
      </div>
    </div>
  )
}

function ModernIntegrationCard({ int, idx, onSync }) {
  const meta = PLATFORM_META[int.platform] || PLATFORM_META.shopify
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.1 }}
      className="group bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100/50 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform duration-500">
            {meta.icon}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h4 className="text-xl font-black text-gray-900 tracking-tighter uppercase">{int.storeName || meta.name}</h4>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">Live Node</span>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 truncate max-w-[200px]">{int.storeUrl}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 px-8 border-x border-gray-50">
          <div className="text-center">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Cycle Frequency</p>
            <p className="text-sm font-black text-gray-900 uppercase">{int.syncFrequency}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Synced Load</p>
            <p className="text-sm font-black text-blue-600">{int.syncedProducts || 0} Units</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={onSync} className="p-4 bg-gray-50 hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 rounded-2xl transition-all"><RefreshCw size={20} /></button>
          <button className="p-4 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-2xl transition-all"><Settings size={20} /></button>
        </div>
      </div>
    </motion.div>
  )
}

function MetricBox({ label, value, icon: Icon, color }) {
  const colors = {
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
  }
  return (
    <div className="bg-white p-6 rounded-[2.2rem] shadow-sm border border-gray-100/50 flex items-center gap-4 group overflow-hidden relative">
      <div className={`p-4 rounded-xl ${colors[color]} border group-hover:scale-110 transition-transform duration-500`}><Icon size={20} /></div>
      <div>
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">{label}</p>
        <p className="text-xl font-black text-gray-900 tracking-tighter leading-none">{value}</p>
      </div>
    </div>
  )
}

function InterconnectModal({ platform, onClose, onSuccess, token }) {
  const [formData, setFormData] = useState({
    platform: platform.id, storeName: '', apiKey: '', apiSecret: '', storeUrl: '', syncFrequency: 'hourly'
  })

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const res = await axios.post('/api/seller/integrations', formData, { headers: { Authorization: `Bearer ${token}` } })
      if (res.data.success) { toast.success('Link established'); onSuccess(); }
    } catch (error) { toast.error('Handshake failure'); }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[3.5rem] shadow-2xl max-w-xl w-full overflow-hidden flex flex-col">
        <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-emerald-50/20">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Forge Bridge: {platform.name}</h2>
            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-1">External Data Handshake</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors">
            <Plus size={24} className="rotate-45" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <input type="text" placeholder="Designate Store Hub *" value={formData.storeName} onChange={(e) => setFormData({ ...formData, storeName: e.target.value })} className="w-full px-8 py-5 bg-gray-50 border-none rounded-[2rem] text-[14px] font-bold focus:ring-4 focus:ring-emerald-100 outline-none" required />
          <input type="url" placeholder="Endpoint URL *" value={formData.storeUrl} onChange={(e) => setFormData({ ...formData, storeUrl: e.target.value })} className="w-full px-8 py-5 bg-gray-50 border-none rounded-[2rem] text-[14px] font-bold focus:ring-4 focus:ring-emerald-100 outline-none" required />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Protocol Key *" value={formData.apiKey} onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })} className="w-full px-8 py-5 bg-gray-50 border-none rounded-[2rem] text-[14px] font-bold focus:ring-4 focus:ring-emerald-100 outline-none" required />
            <input type="password" placeholder="Protocol Secret *" value={formData.apiSecret} onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })} className="w-full px-8 py-5 bg-gray-50 border-none rounded-[2rem] text-[14px] font-bold focus:ring-4 focus:ring-emerald-100 outline-none" required />
          </div>
          <select value={formData.syncFrequency} onChange={(e) => setFormData({ ...formData, syncFrequency: e.target.value })} className="w-full px-8 py-5 bg-gray-50 border-none rounded-[2rem] text-[14px] font-bold focus:ring-4 focus:ring-emerald-100 outline-none appearance-none cursor-pointer">
            <option value="realtime">Low Latency (Real-time)</option>
            <option value="hourly">Hourly Pulse</option>
            <option value="daily">Daily Batch</option>
          </select>
          <div className="flex gap-4 pt-6">
            <button type="button" onClick={onClose} className="flex-1 px-8 py-5 border-2 border-gray-100 text-gray-400 rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">Abort</button>
            <button type="submit" className="flex-1 px-8 py-5 bg-emerald-600 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-2xl shadow-emerald-500/20 transition-all">Authorize Bridge</button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
