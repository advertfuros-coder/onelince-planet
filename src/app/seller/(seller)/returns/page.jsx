'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { useAuth } from '@/lib/context/AuthContext'
import {
    RotateCcw,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Eye,
    MessageSquare,
    ShieldAlert,
    ChevronRight,
    ArrowRight,
    Image as ImageIcon,
    Filter,
    Calendar
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function ReturnsPage() {
    const { token } = useAuth()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState(null)
    const [activeTab, setActiveTab] = useState('requested')
    const [selectedReturn, setSelectedReturn] = useState(null)

    useEffect(() => {
        if (token) {
            fetchReturns()
        }
    }, [token])

    const fetchReturns = async () => {
        try {
            setLoading(true)
            const res = await axios.get('/api/seller/returns', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                setData(res.data)
            }
        } catch (err) {
            toast.error('Failed to load return requests')
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (orderId, action, extra = {}) => {
        try {
            const res = await axios.post('/api/seller/returns', { orderId, action, ...extra }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                toast.success(`Request ${action.toLowerCase()}ed`)
                setSelectedReturn(null)
                fetchReturns()
            }
        } catch (err) {
            toast.error('Operation failed')
        }
    }

    const filteredReturns = data?.returns?.filter(r => {
        if (activeTab === 'all') return true;
        if (activeTab === 'requested') return r.status === 'requested';
        if (activeTab === 'processing') return ['approved', 'received'].includes(r.status);
        if (activeTab === 'resolved') return ['quality_passed', 'quality_failed', 'refunded', 'rejected'].includes(r.status);
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 bg-[#F8FAFC]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Claims...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            <div className="max-w-[1400px] mx-auto p-6 lg:p-10 space-y-10">

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Claims Manager <span className="text-rose-600">.</span></h1>
                        <p className="text-slate-500 font-bold text-sm mt-1">Review return requests and manage quality disputes.</p>
                    </div>
                </div>

                {/* Dispute Radar & Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Metrics Cards */}
                    <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ReturnStat
                            title="New Requests"
                            value={data?.stats?.pendingApproval}
                            icon={RotateCcw}
                            color="text-rose-600"
                            bgColor="bg-rose-100"
                        />
                        <ReturnStat
                            title="In-Process"
                            value={data?.stats?.awaitingReceipt + data?.stats?.qualityCheck}
                            icon={Calendar}
                            color="text-amber-600"
                            bgColor="bg-amber-100"
                        />
                        <ReturnStat
                            title="Resolved (MTD)"
                            value={data?.stats?.resolvedThisMonth}
                            icon={CheckCircle2}
                            color="text-emerald-600"
                            bgColor="bg-emerald-100"
                        />
                    </div>

                    {/* Dispute Radar Value Add */}
                    <div className="lg:col-span-4">
                        <div className="bg-[#0F172A] rounded-[2.5rem] p-8 text-white relative overflow-hidden h-full">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 text-rose-400 mb-4">
                                    <ShieldAlert size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Dispute Radar AI</span>
                                </div>
                                <h3 className="text-lg font-black mb-4 tracking-tight">Return Fraud Detection</h3>
                                <p className="text-slate-400 text-xs font-medium mb-6 leading-relaxed"> No high-risk return patterns detected today. Your catalog health is within safe parameters.</p>
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 border-t border-slate-800 pt-6">
                                    <span>Risk Score: <span className="text-emerald-500">LOW</span></span>
                                    <span>Monitoring Active</span>
                                </div>
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-rose-600 opacity-20 rounded-full blur-[80px]" />
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">

                    {/* List of Returns */}
                    <div className="xl:col-span-8 space-y-6">
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden">
                            <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                                <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                                    {['requested', 'processing', 'resolved', 'all'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="divide-y divide-slate-50">
                                {filteredReturns?.length > 0 ? (
                                    filteredReturns.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => setSelectedReturn(item)}
                                            className={`p-8 hover:bg-slate-50 transition-all cursor-pointer group ${selectedReturn?.id === item.id ? 'bg-slate-50' : ''}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden">
                                                        {item.images?.[0] ? (
                                                            <img src={item.images[0]} alt="Return item" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <ImageIcon className="text-slate-300" size={24} />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded">Claim #{item.orderNumber}</span>
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(item.requestedAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <h4 className="text-sm font-black text-slate-900 mb-1">{item.reason}</h4>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Requested by: <span className="text-slate-700">{item.customer}</span></p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6 text-right">
                                                    <div>
                                                        <p className="text-xs font-black text-slate-900">₹{item.refundAmount.toLocaleString()}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Est. Refund</p>
                                                    </div>
                                                    <div className={`p-3 rounded-2xl bg-white border border-slate-100 text-slate-300 group-hover:text-rose-600 transition-all ${selectedReturn?.id === item.id ? 'text-rose-600' : ''}`}>
                                                        <ChevronRight size={20} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center flex flex-col items-center gap-4">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center grayscale">
                                            <RotateCcw size={32} className="text-slate-300" />
                                        </div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">All clear: No claims found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Detailed Inspector View */}
                    <div className="xl:col-span-4">
                        <AnimatePresence mode="wait">
                            {selectedReturn ? (
                                <motion.div
                                    key={selectedReturn.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-8 sticky top-6 space-y-8"
                                >
                                    <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                                        <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                                            <ArrowRight size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Claim Lifecycle</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Manage workflow stages</p>
                                        </div>
                                    </div>

                                    {/* Action Box based on Status */}
                                    <div className="space-y-6">
                                        {selectedReturn.status === 'requested' && (
                                            <div className="space-y-6">
                                                <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex gap-4">
                                                    <AlertTriangle size={20} className="text-amber-600 shrink-0" />
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Customer Note</p>
                                                        <p className="text-[11px] font-medium text-amber-700 leading-relaxed italic">"{selectedReturn.description}"</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 gap-3">
                                                    <button
                                                        onClick={() => handleAction(selectedReturn.id, 'APPROVE')}
                                                        className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200"
                                                    >
                                                        Approve Return
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const reason = prompt('Rejection reason:')
                                                            if (reason) handleAction(selectedReturn.id, 'REJECT', { comment: reason })
                                                        }}
                                                        className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all"
                                                    >
                                                        Reject Claim
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {selectedReturn.status === 'approved' && (
                                            <div className="text-center space-y-6">
                                                <div className="p-10 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center gap-4">
                                                    <RotateCcw size={32} className="text-slate-300 animate-spin" />
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-relaxed">Awaiting arrival of the physical asset from the logistics network.</p>
                                                </div>
                                                <button
                                                    onClick={() => handleAction(selectedReturn.id, 'RECEIVED')}
                                                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200"
                                                >
                                                    Mark as Received
                                                </button>
                                            </div>
                                        )}

                                        {selectedReturn.status === 'received' && (
                                            <div className="space-y-6">
                                                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Quality Inspector</h4>
                                                <div className="grid grid-cols-1 gap-3">
                                                    <button
                                                        onClick={() => handleAction(selectedReturn.id, 'RESOLVE', { condition: 'passed' })}
                                                        className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200"
                                                    >
                                                        Pass Quality Check
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(selectedReturn.id, 'RESOLVE', { condition: 'failed', comment: 'Item damaged by user' })}
                                                        className="w-full py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-200"
                                                    >
                                                        Fail Quality Check
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {['quality_passed', 'refunded', 'rejected'].includes(selectedReturn.status) && (
                                            <div className="text-center space-y-4 py-8">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <CheckCircle2 size={32} className="text-emerald-500" />
                                                </div>
                                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Case Resolved</h4>
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">The claiming process for this unit is finalized and archived.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Sidebar Extras */}
                                    <div className="pt-8 border-t border-slate-50 space-y-4">
                                        <button className="flex items-center justify-between w-full p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">
                                            <div className="flex items-center gap-3">
                                                <Eye size={16} className="text-slate-400" />
                                                <span className="text-[10px] font-black text-slate-600 uppercase">View Order Detail</span>
                                            </div>
                                            <ChevronRight size={14} className="text-slate-300" />
                                        </button>
                                        <button className="flex items-center justify-between w-full p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">
                                            <div className="flex items-center gap-3">
                                                <MessageSquare size={16} className="text-slate-400" />
                                                <span className="text-[10px] font-black text-slate-600 uppercase">Contact Support</span>
                                            </div>
                                            <ChevronRight size={14} className="text-slate-300" />
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-full bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center grayscale opacity-50">
                                    <ShieldAlert size={48} className="text-slate-300 mb-4" />
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-relaxed">Select a claim from the list to initiate inspection.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

            </div>
        </div>
    )
}

function ReturnStat({ title, value, icon: Icon, color, bgColor }) {
    return (
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/20 flex items-center gap-6 group hover:translate-y-[-4px] transition-all">
            <div className={`p-4 rounded-2xl ${bgColor} ${color} group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{value || 0}</p>
            </div>
        </div>
    )
}
