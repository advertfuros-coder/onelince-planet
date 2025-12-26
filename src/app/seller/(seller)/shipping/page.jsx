// seller/(seller)/shipping/page.jsx
'use client'

import { useState, useEffect } from 'react'
import {
  Truck,
  Package,
  MapPin,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Zap,
  Clock,
  Navigation,
  Box,
  Globe,
  RefreshCw,
  MoreVertical,
  CheckCircle2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/context/AuthContext'
import { formatPrice } from '@/lib/utils'
import { toast } from 'react-hot-toast'

export default function SellerShipping() {
  const { token } = useAuth()
  const [shippingRules, setShippingRules] = useState([])
  const [pickupAddress, setPickupAddress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    if (token) fetchShippingSettings()
  }, [token])

  const fetchShippingSettings = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/seller/shipping', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setShippingRules(data.shippingRules)
        setPickupAddress(data.pickupAddress)
      }
    } catch (error) {
      console.error('Error fetching shipping settings:', error)
      toast.error('Failed to retrieve logistics logic')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
     return (
         <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
             <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
             <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Accessing Logistics Protocol...</p>
         </div>
     )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8">
      <div className="max-w-[1500px] mx-auto space-y-8">
        
        {/* Modern Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <Truck size={18} />
               </div>
               <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Fulfillment Logic</span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Shipping Architecture</h1>
            <p className="text-gray-500 font-medium mt-1">Configure delivery boundaries, pickup terminals and pricing rules</p>
          </div>

          <button 
             onClick={() => setShowAddForm(true)}
             className="px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase text-[11px] tracking-widest shadow-2xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
             <Plus size={18} />
             Define Shipping Rule
          </button>
        </div>

        {/* Status Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <LogisticsMetric 
              label="Active Protocols" 
              value={shippingRules.filter(r => r.isActive).length} 
              icon={Zap} 
              color="indigo" 
           />
           <LogisticsMetric 
              label="Coverage Range" 
              value="All India" 
              icon={Globe} 
              color="emerald" 
           />
           <LogisticsMetric 
              label="SLA Efficiency" 
              value="3-4 Days" 
              icon={Clock} 
              color="blue" 
           />
        </div>

        {/* Shipping Rules Table */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100/50 overflow-hidden">
           <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Global Shipping Rules</h3>
              <div className="flex items-center gap-4">
                 <button onClick={fetchShippingSettings} className="p-2 text-gray-300 hover:text-indigo-600 transition-colors">
                    <RefreshCw size={18} />
                 </button>
              </div>
           </div>

           <div className="divide-y divide-gray-100">
              {shippingRules.length === 0 ? (
                 <div className="text-center py-32 space-y-6">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
                       <Navigation size={32} className="text-indigo-300" />
                    </div>
                    <div className="max-w-sm mx-auto">
                       <h4 className="text-xl font-black text-gray-900 tracking-tight">Logistics void detected</h4>
                       <p className="text-gray-500 text-sm mt-2 mb-6">Without shipping rules, customers won't be able to calculate delivery costs for their geozone.</p>
                       <button 
                          onClick={() => setShowAddForm(true)}
                          className="px-6 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-black transition-all"
                       >
                          Initialize Protocol
                       </button>
                    </div>
                 </div>
              ) : (
                 shippingRules.map((rule, idx) => (
                    <motion.div 
                       key={rule.id || idx}
                       initial={{ opacity: 0, x: -10 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: idx * 0.05 }}
                       className="p-8 group hover:bg-gray-50/50 transition-all flex flex-col sm:flex-row items-center justify-between gap-8"
                    >
                       <div className="flex items-center gap-6 w-full sm:w-auto">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border ${
                             rule.isActive ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-gray-50 border-gray-100 text-gray-400'
                          }`}>
                             <Truck size={24} />
                          </div>
                          <div>
                             <div className="flex items-center gap-3 mb-1">
                                <h4 className="text-lg font-black text-gray-900 tracking-tight leading-none">{rule.name}</h4>
                                <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-tight ${
                                   rule.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                                }`}>
                                   {rule.isActive ? 'Active' : 'Dormant'}
                                </span>
                             </div>
                             <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
                                <span className="flex items-center gap-1"><Package size={12} className="text-indigo-400" /> {rule.type === 'weight' ? 'Weight Multiplier' : 'Order Momentum'}</span>
                                <span className="flex items-center gap-1"><Clock size={12} className="text-indigo-400" /> {rule.deliveryTime}</span>
                             </div>
                          </div>
                       </div>

                       <div className="flex flex-wrap gap-12 flex-1 justify-center sm:justify-start">
                          <div>
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">Threshold Conditions</p>
                             <p className="text-xs font-black text-gray-800">
                                {rule.type === 'weight' ? `${rule.conditions.minWeight}kg — ${rule.conditions.maxWeight}kg` : `Above ${formatPrice(rule.conditions.minOrderValue)}`}
                             </p>
                          </div>
                          <div>
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">Base Liquidation</p>
                             <p className="text-base font-black text-indigo-600">{formatPrice(rule.pricing.baseRate)}</p>
                          </div>
                          {rule.pricing.freeShippingThreshold && (
                             <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">Zero-Cost Floor</p>
                                <p className="text-xs font-black text-emerald-600">Free @ {formatPrice(rule.pricing.freeShippingThreshold)}</p>
                             </div>
                          )}
                       </div>

                       <div className="flex items-center gap-2">
                          <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-indigo-600 hover:shadow-md transition-all">
                             <Edit size={16} />
                          </button>
                          <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-rose-600 hover:shadow-md transition-all">
                             <Trash2 size={16} />
                          </button>
                       </div>
                    </motion.div>
                 ))
              )}
           </div>
        </div>

        {/* Pickup Terminal Section */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100/50">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                 <Box size={20} className="text-indigo-600" />
                 Pickup Dispatch Hub
              </h3>
           </div>
           
           {pickupAddress ? (
              <div className="flex flex-col lg:flex-row gap-10">
                 <div className="flex-1 bg-gray-50/50 rounded-[2rem] p-8 border border-gray-100 flex items-start gap-6 group hover:bg-gray-50 transition-all">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-indigo-600 shadow-sm">
                       <MapPin size={28} />
                    </div>
                    <div>
                       <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-black text-gray-900 tracking-tighter">{pickupAddress.name}</h4>
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">Primary Hub</span>
                       </div>
                       <div className="space-y-1">
                          <p className="text-sm font-bold text-gray-500">{pickupAddress.street}</p>
                          <p className="text-sm font-black text-gray-700">{pickupAddress.city}, {pickupAddress.state} {pickupAddress.pincode}</p>
                          <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mt-3 flex items-center gap-1.5"><Clock size={12} /> Contact Route: {pickupAddress.phone}</p>
                       </div>
                    </div>
                 </div>
                 
                 <div className="lg:w-72 flex flex-col justify-center">
                    <button 
                       className="w-full py-4 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                       <Edit size={16} />
                       Modify Hub Coordinates
                    </button>
                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest text-center mt-3">Verified Dispatch Terminal</p>
                 </div>
              </div>
           ) : (
              <div className="bg-gray-50/30 border-2 border-dashed border-gray-100 rounded-[2.5rem] p-16 text-center space-y-6">
                 <div className="w-20 h-20 bg-white border border-gray-100 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                    <MapPin size={32} className="text-gray-200" />
                 </div>
                 <div className="max-w-sm mx-auto">
                    <h4 className="text-xl font-black text-gray-900 tracking-tighter">Hub Coordinates Missing</h4>
                    <p className="text-gray-500 text-sm mt-2 mb-8 italic">Courier partners require a verified dispatch address to facilitate shipment pickup protocols.</p>
                    <button className="px-8 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all">
                       Initialize Hub Terminal
                    </button>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  )
}

function LogisticsMetric({ label, value, icon: Icon, color }) {
   const colors = {
      indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      blue: 'text-blue-600 bg-blue-50 border-blue-100',
   }

   return (
      <div className="bg-white p-6 rounded-[2.2rem] shadow-sm border border-gray-100/50 group overflow-hidden relative">
         <div className="flex items-center gap-4 relative z-10">
            <div className={`p-4 rounded-xl shadow-sm border ${colors[color]} group-hover:scale-110 transition-transform duration-500`}>
               <Icon size={22} />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
               <p className="text-2xl font-black text-gray-900 tracking-tight">{value}</p>
            </div>
         </div>
         <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50/50 -mr-12 -mt-12 rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-700" />
      </div>
   )
}
