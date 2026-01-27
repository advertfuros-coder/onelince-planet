'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import {
    RefreshCcw,
    Clock,
    CheckCircle,
    XCircle,
    Search,
    ArrowUpRight,
    ShieldCheck,
    MoreVertical
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function SellerReturnsPage() {
    const [returns, setReturns] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // all, pending, approved, rejected

    useEffect(() => {
        fetchReturns()
    }, [])

    const fetchReturns = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await axios.get('/api/returns?role=seller', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                setReturns(res.data.returns)
            }
        } catch (err) {
            toast.error("Failed to load return requests")
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (requestId, action, notes = '') => {
        try {
            const token = localStorage.getItem('token')
            const res = await axios.put(`/api/returns/${requestId}`, { status: action, sellerNotes: notes }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                toast.success(`Request ${action} successfully`)
                fetchReturns()
            }
        } catch (err) {
            toast.error("Action failed")
        }
    }

    const getStatusStyle = (status) => {
        const styles = {
            pending: 'bg-yellow-50 text-yellow-600 border-yellow-100',
            approved: 'bg-green-50 text-green-600 border-green-100',
            rejected: 'bg-red-50 text-red-600 border-red-100',
            completed: 'bg-blue-50 text-blue-600 border-blue-100'
        }
        return styles[status] || 'bg-slate-50 text-slate-600 border-slate-100'
    }

    if (loading) return (
        <div className="p-8 animate-pulse space-y-8">
            <div className="h-10 w-64 bg-slate-200 rounded-xl" />
            <div className="grid grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-200 rounded-[2.5rem]" />)}
            </div>
            <div className="h-96 bg-slate-200 rounded-[3rem]" />
        </div>
    )

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Return & Replacement Center</h1>
                    <p className="text-[12px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Manage customer quality claims and service requests</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-6 py-2.5 bg-blue-600 text-white rounded-2xl text-[12px] font-bold uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
                        Export Policy
                    </button>
                </div>
            </div>

            {/* Modern Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Claims', value: returns.length, icon: RefreshCcw, color: 'blue' },
                    { label: 'Pending Review', value: returns.filter(r => r.status === 'pending').length, icon: Clock, color: 'yellow' },
                    { label: 'Approved Today', value: returns.filter(r => r.status === 'approved').length, icon: CheckCircle, color: 'green' },
                    { label: 'Claim Rate', value: '2.4%', icon: ArrowUpRight, color: 'purple' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm shadow-slate-200/20">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600`}>
                                <stat.icon size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Summary</span>
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Returns List */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex gap-4">
                        {['all', 'pending', 'approved', 'rejected'].map(t => (
                            <button
                                key={t}
                                onClick={() => setFilter(t)}
                                className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filter === t ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500" size={16} />
                        <input type="text" placeholder="Search by Order ID..." className="pl-12 pr-6 py-3 bg-slate-50/50 border border-transparent rounded-2xl text-[11px] font-bold outline-none focus:bg-white focus:border-blue-500 transition-all w-64" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order & Item</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer Details</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Evidence</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {returns.filter(r => filter === 'all' || r.status === filter).map((req) => (
                                <tr key={req._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <p className="text-xs font-bold text-slate-900 mb-1">{req.items[0]?.name || 'Unknown Item'}</p>
                                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">Order #{req.orderId?.orderNumber || req.orderId?._id.slice(-8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className={`text-[9px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest border w-fit ${req.items[0]?.type === 'return' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                                {req.items[0]?.type || 'return'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 max-w-xs">
                                        <p className="text-[11px] font-medium text-slate-600 line-clamp-2 leading-relaxed">{req.description}</p>
                                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest italic font-serif">Reason: {req.items[0]?.reason}</p>
                                        <p className="text-[9px] font-bold text-slate-500 mt-0.5">Customer: {req.customerId?.name}</p>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="flex -space-x-2 justify-start">
                                            {req.evidence?.slice(0, 3).map((url, i) => (
                                                <div key={i} className="w-10 h-10 rounded-xl border-2 border-white overflow-hidden shadow-sm">
                                                    <img src={url} className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                            {req.evidence?.length > 3 && (
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">
                                                    +{req.evidence.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`text-[10px] font-bold px-3 py-1.5 rounded-2xl uppercase tracking-tighter border ${getStatusStyle(req.status)}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-end gap-2">
                                            {req.status === 'pending' ? (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to APPROVE this claim?')) handleAction(req._id, 'approved')
                                                        }}
                                                        className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                                        title="Approve Claim"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const reason = prompt('Enter rejection reason:')
                                                            if (reason) handleAction(req._id, 'rejected', reason)
                                                        }}
                                                        className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                        title="Reject Claim"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </>
                                            ) : (
                                                <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all">
                                                    <MoreVertical size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {returns.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mb-4">
                                                <RefreshCcw size={40} />
                                            </div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No return claims found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
