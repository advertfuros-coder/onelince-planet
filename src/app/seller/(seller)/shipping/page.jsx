'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { useAuth } from '@/lib/context/AuthContext'
import {
   Truck,
   Package,
   CheckCircle2,
   Printer,
   Search,
   ChevronRight,
   Filter,
   Box,
   Clock,
   Download,
   Eye
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function ShippingPage() {
   const { token } = useAuth()
   const [loading, setLoading] = useState(true)
   const [data, setData] = useState(null)
   const [activeTab, setActiveTab] = useState('pending')
   const [searchQuery, setSearchQuery] = useState('')

   useEffect(() => {
      if (token) {
         fetchShippingData()
      }
   }, [token])

   const fetchShippingData = async () => {
      try {
         setLoading(true)
         const res = await axios.get('/api/seller/shipping', {
            headers: { Authorization: `Bearer ${token}` }
         })
         if (res.data.success) {
            setData(res.data)
         }
      } catch (err) {
         toast.error('Failed to load shipping data')
      } finally {
         setLoading(false)
      }
   }

   const handleAction = async (orderId, action) => {
      try {
         const res = await axios.post('/api/seller/shipping', { orderId, action }, {
            headers: { Authorization: `Bearer ${token}` }
         })
         if (res.data.success) {
            toast.success('Action successfully executed')
            fetchShippingData()
         }
      } catch (err) {
         toast.error('Action failed')
      }
   }

   const filteredOrders = data?.orders?.filter(order => {
      const matchesTab = activeTab === 'all' ||
         (activeTab === 'pending' && ['confirmed', 'processing'].includes(order.status)) ||
         (activeTab === 'ready' && order.status === 'ready_for_pickup') ||
         (activeTab === 'shipped' && order.status === 'shipped');

      const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
         order.customer.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
   });

   if (loading) {
      return (
         <div className="min-h-screen flex items-center justify-center p-8 bg-[#F8FAFC]">
            <div className="flex flex-col items-center gap-4">
               <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
               <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Loading Fleet...</p>
            </div>
         </div>
      )
   }

   return (
      <div className="min-h-screen bg-[#F8FAFC] pb-20">
         <div className="max-w-[1400px] mx-auto p-6 lg:p-10 space-y-8">

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
               <div>
                  <h1 className="text-4xl font-semibold text-slate-900 tracking-tight">Shipping Hub <span className="text-emerald-600">.</span></h1>
                  <p className="text-slate-500 font-semibold text-sm mt-1">Manage manifests, labels, and courier handovers.</p>
               </div>
               <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-semibold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
                     <Printer size={14} /> Bulk Print Labels
                  </button>
               </div>
            </div>

            {/* Shipping Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <ShippingStat
                  title="To manifest"
                  value={data?.stats?.pending}
                  icon={Package}
                  color="text-amber-600"
                  bgColor="bg-amber-100"
               />
               <ShippingStat
                  title="Ready for Pickup"
                  value={data?.stats?.ready}
                  icon={Clock}
                  color="text-blue-600"
                  bgColor="bg-blue-100"
               />
               <ShippingStat
                  title="Shipped Today"
                  value={data?.stats?.shippedToday}
                  icon={CheckCircle2}
                  color="text-emerald-600"
                  bgColor="bg-emerald-100"
               />
               <ShippingStat
                  title="Pickup Point"
                  value={data?.stats?.pickupPoint}
                  icon={Truck}
                  color="text-indigo-600"
                  bgColor="bg-indigo-100"
               />
            </div>

            {/* Logistics Controls Area */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">

               {/* Filters Header */}
               <div className="p-4 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex bg-slate-50/50 p-1 rounded-2xl border border-slate-100">
                     {['pending', 'ready', 'shipped', 'all'].map((tab) => (
                        <button
                           key={tab}
                           onClick={() => setActiveTab(tab)}
                           className={`px-6 py-2.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'
                              }`}
                        >
                           {tab}
                        </button>
                     ))}
                  </div>

                  <div className="relative">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                     <input
                        type="text"
                        placeholder="Search Shipment ID or Client..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold outline-none focus:bg-white focus:border-emerald-500 transition-all w-full md:w-[300px]"
                     />
                  </div>
               </div>

               {/* Shipments Table */}
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead>
                        <tr className="bg-slate-50/30">
                           <th className="text-left px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Shipment Detail</th>
                           <th className="text-left px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Destination</th>
                           <th className="text-left px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Courier Partner</th>
                           <th className="text-left px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Status</th>
                           <th className="text-right px-8 py-5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Operations</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {filteredOrders?.length > 0 ? (
                           filteredOrders.map((order) => (
                              <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                                 <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                          <Box size={20} />
                                       </div>
                                       <div>
                                          <p className="text-xs font-semibold text-slate-900">#{order.orderNumber}</p>
                                          <p className="text-[10px] font-semibold text-slate-400">{new Date(order.date).toLocaleDateString()}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-8 py-6">
                                    <p className="text-xs font-semibold text-slate-900">{order.customer}</p>
                                    <p className="text-[10px] font-semibold text-slate-400">{order.itemsCount} Items in Package</p>
                                 </td>
                                 <td className="px-8 py-6">
                                    <div className="flex items-center gap-2">
                                       <div className="w-6 h-6 bg-slate-900 rounded-lg flex items-center justify-center">
                                          <Truck size={12} className="text-white" />
                                       </div>
                                       <span className="text-xs font-semibold text-slate-700">{order.courier}</span>
                                    </div>
                                    {order.trackingId && <p className="text-[9px] font-semibold text-emerald-600 mt-1 uppercase tracking-tight">{order.trackingId}</p>}
                                 </td>
                                 <td className="px-8 py-6">
                                    <ShipmentStatus status={order.status} />
                                 </td>
                                 <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                       {['confirmed', 'processing'].includes(order.status) && (
                                          <button
                                             onClick={() => handleAction(order.id, 'READY_FOR_PICKUP')}
                                             className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-semibold uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                                          >
                                             Mark Ready
                                          </button>
                                       )}
                                       {order.status === 'ready_for_pickup' && (
                                          <button className="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
                                             <Printer size={16} />
                                          </button>
                                       )}
                                       <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                          <Eye size={18} />
                                       </button>
                                    </div>
                                 </td>
                              </tr>
                           ))
                        ) : (
                           <tr>
                              <td colSpan="5" className="py-20 text-center">
                                 <div className="flex flex-col items-center gap-2 grayscale">
                                    <Box size={40} className="text-slate-200" />
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">No matching shipments found</p>
                                 </div>
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* Courier Pickup Banner */}
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="relative z-10 space-y-2">
                  <span className="text-emerald-400 text-[10px] font-semibold uppercase tracking-[0.3em]">Logistics Alert</span>
                  <h3 className="text-2xl font-semibold tracking-tight">Daily Courier Pickup Cycle</h3>
                  <p className="text-slate-400 text-sm font-medium">Last pickup scan occurred at 04:30 PM. Next window in 14 hours.</p>
               </div>
               <button className="relative z-10 px-8 py-4 bg-white text-slate-900 rounded-2xl text-xs font-semibold uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-xl shadow-white/5 active:scale-95">
                  DOWNLOAD DAILY MANIFEST
               </button>
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600 opacity-20 rounded-full blur-[100px]" />
            </div>

         </div>
      </div>
   )
}

function ShippingStat({ title, value, icon: Icon, color, bgColor }) {
   return (
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/20 flex items-center gap-6 group hover:translate-y-[-4px] transition-all">
         <div className={`p-4 rounded-2xl ${bgColor} ${color} group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
         </div>
         <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
            <p className="text-2xl font-semibold text-slate-900 tracking-tight">{value || 0}</p>
         </div>
      </div>
   )
}

function ShipmentStatus({ status }) {
   const configs = {
      confirmed: { label: 'Awaiting Pack', color: 'bg-amber-50 text-amber-600 border-amber-100' },
      processing: { label: 'In Packing', color: 'bg-blue-50 text-blue-600 border-blue-100' },
      ready_for_pickup: { label: 'Ready for Fleet', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
      shipped: { label: 'In Transit', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
   }

   const config = configs[status] || { label: status, color: 'bg-slate-50 text-slate-600 border-slate-100' }

   return (
      <span className={`px-4 py-1.5 rounded-full text-[9px] font-semibold uppercase tracking-widest border ${config.color}`}>
         {config.label}
      </span>
   )
}
