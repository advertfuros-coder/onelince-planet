// app/seller/(seller)/returns/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
    RefreshCcw,
    Search,
    Filter,
    ChevronRight,
    ArrowLeftRight,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Package,
    User,
    Calendar,
    Wallet,
    Maximize2,
    MessageSquare,
    Image as ImageIcon
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

export default function ReturnsManagement() {
    const { token } = useAuth()
    const [returns, setReturns] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [selectedReturn, setSelectedReturn] = useState(null)

    useEffect(() => {
        if (token) fetchReturns()
    }, [token])

    const fetchReturns = async () => {
        try {
            setLoading(true)
            const res = await axios.get('/api/seller/returns', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                setReturns(res.data.returns)
            }
        } catch (error) {
            console.error('Error fetching returns:', error)
            toast.error('Failed to sync reverse logistics data')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStatus = async (orderId, status, reason = '', amount = 0) => {
        try {
            const res = await axios.put(`/api/seller/returns/${orderId}`,
                { status, resolutionReason: reason, refundAmount: amount },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (res.data.success) {
                toast.success(`Return request ${status} successfully`)
                fetchReturns()
                setSelectedReturn(null)
            }
        } catch (error) {
            toast.error('Failed to update return pulse')
        }
    }

    const filteredReturns = returns.filter(ret => {
        const matchesSearch = ret.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ret.customer?.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = filterStatus === 'all' || ret.returnRequest?.status === filterStatus
        return matchesSearch && matchesStatus
    })

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Processing Reverse Logic Flow...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8">
            <div className="max-w-[1400px] mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                                <RefreshCcw size={18} />
                            </div>
                            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full">Reverse Logistics</span>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Returns Terminal</h1>
                        <p className="text-gray-500 font-medium mt-1">Manage product circularity and customer restitution</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search Return ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-[1.5rem] w-full lg:w-80 text-sm font-bold shadow-sm focus:ring-4 focus:ring-rose-500/5 transition-all outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                            {['all', 'requested', 'approved', 'rejected', 'refunded'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === status
                                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20'
                                        : 'text-gray-400 hover:text-rose-600'
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Returns Grid */}
                {filteredReturns.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredReturns.map((ret) => (
                            <ReturnItemCard
                                key={ret._id}
                                entry={ret}
                                onSelect={() => setSelectedReturn(ret)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[3rem] p-20 text-center border border-gray-100/50 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200 mx-auto mb-6">
                            <Package size={40} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2 uppercase">No Return Signals Detected</h3>
                        <p className="text-gray-400 text-sm font-medium">Circular logistics inventory is currently balanced.</p>
                    </div>
                )}
            </div>

            {/* Return Detail Modal */}
            <AnimatePresence>
                {selectedReturn && (
                    <ReturnDetailModal
                        entry={selectedReturn}
                        onClose={() => setSelectedReturn(null)}
                        onUpdate={handleUpdateStatus}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

function ReturnItemCard({ entry, onSelect }) {
    const statusColors = {
        requested: 'bg-amber-50 text-amber-600 border-amber-100',
        approved: 'bg-blue-50 text-blue-600 border-blue-100',
        received: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        quality_passed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        quality_failed: 'bg-rose-50 text-rose-600 border-rose-100',
        rejected: 'bg-rose-50 text-rose-600 border-rose-100',
        refunded: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-rose-500/5 transition-all cursor-pointer overflow-hidden relative"
            onClick={onSelect}
        >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-rose-600 shrink-0">
                        <ArrowLeftRight size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-lg font-black text-gray-900 tracking-tighter">{entry.orderNumber}</h4>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColors[entry.returnRequest.status]}`}>
                                {entry.returnRequest.status}
                            </span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Initiated by {entry.customer?.name} • {new Date(entry.returnRequest.requestedAt).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="flex items-center gap-12">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Value Restoration</p>
                        <p className="text-lg font-black text-gray-900 tracking-tighter">₹{(entry.pricing?.total || 0).toLocaleString()}</p>
                    </div>
                    <div className="w-[1px] h-10 bg-gray-100 hidden sm:block" />
                    <button className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-rose-600 group-hover:text-white transition-all">
                        <Maximize2 size={18} />
                    </button>
                </div>
            </div>

            <div className="absolute top-[-20%] right-[-5%] opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                <RefreshCcw size={180} />
            </div>
        </motion.div>
    )
}

function ReturnDetailModal({ entry, onClose, onUpdate }) {
    const [actionLoading, setActionLoading] = useState(false)
    const [reason, setReason] = useState('')
    const [amount, setAmount] = useState(entry.pricing?.total || 0)
    const [qualityCheck, setQualityCheck] = useState({
        condition: entry.returnRequest?.qualityCheck?.condition || 'new',
        comments: entry.returnRequest?.qualityCheck?.comments || ''
    })

    const handleAction = async (status) => {
        setActionLoading(true)
        await onUpdate(entry._id, status, reason, amount, status.includes('quality') || status === 'received' ? qualityCheck : null)
        setActionLoading(false)
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-[3.5rem] shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded tracking-widest uppercase">Reverse Case Terminal</span>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter">{entry.orderNumber}</h2>
                        </div>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-tight">Current Logical State: {entry.returnRequest.status.replace('_', ' ')}</p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white border border-gray-100 text-gray-400 hover:text-rose-600 rounded-2xl transition-all shadow-sm">
                        <XCircle size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Left Side: Request Intel & Evidence */}
                        <div className="space-y-8">
                            <section>
                                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Customer Claim</h5>
                                <div className="bg-rose-50 rounded-3xl p-6 border border-rose-100/50">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-600 shadow-sm shrink-0">
                                            <AlertCircle size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-rose-900 mb-1">{entry.returnRequest.reason || 'No specific reason provided'}</p>
                                            <p className="text-xs font-bold text-rose-700/70 leading-relaxed italic">"{entry.returnRequest.description || 'Customer provided no further context.'}"</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-rose-200/30">
                                        <Calendar size={14} className="text-rose-400" />
                                        <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Requested on {new Date(entry.returnRequest.requestedAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Unit Manifest</h5>
                                <div className="space-y-3">
                                    {entry.items?.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 bg-gray-50 border border-gray-100 p-3 rounded-2xl">
                                            <div className="w-10 h-10 bg-white rounded-xl overflow-hidden shadow-inner">
                                                {item.images?.[0] ? <img src={item.images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-200"><Package size={16} /></div>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-black text-gray-900 truncate tracking-tight">{item.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">QTY: {item.quantity} • Unit: ₹{item.price?.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {entry.returnRequest.images?.length > 0 && (
                                <section>
                                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Evidence Registry</h5>
                                    <div className="grid grid-cols-3 gap-3">
                                        {entry.returnRequest.images.map((img, idx) => (
                                            <div key={idx} className="aspect-square bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:border-rose-400 transition-all shadow-sm">
                                                <img src={img} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Right Side: Resolution & Quality Check */}
                        <div className="space-y-8">
                            {/* Quality Check Module */}
                            {(entry.returnRequest.status === 'approved' || entry.returnRequest.status === 'received' || entry.returnRequest.status === 'quality_passed' || entry.returnRequest.status === 'quality_failed') && (
                                <section className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                                    <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
                                    <h5 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-6 relative z-10">Quality Assessment Module</h5>

                                    <div className="space-y-6 relative z-10">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2">Assessed Condition</label>
                                            <select
                                                value={qualityCheck.condition}
                                                onChange={(e) => setQualityCheck({ ...qualityCheck, condition: e.target.value })}
                                                disabled={['quality_passed', 'quality_failed', 'refunded'].includes(entry.returnRequest.status)}
                                                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-[12px] font-bold focus:bg-white/10 transition-all outline-none"
                                            >
                                                <option value="new" className="bg-gray-900">Brand New / Sealed</option>
                                                <option value="used" className="bg-gray-900">Slightly Used</option>
                                                <option value="damaged" className="bg-gray-900">Physically Damaged</option>
                                                <option value="missing_parts" className="bg-gray-900">Missing Accessories</option>
                                                <option value="wrong_item" className="bg-gray-900">Wrong Item Received</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-2">Technician Comments</label>
                                            <textarea
                                                value={qualityCheck.comments}
                                                onChange={(e) => setQualityCheck({ ...qualityCheck, comments: e.target.value })}
                                                disabled={['quality_passed', 'quality_failed', 'refunded'].includes(entry.returnRequest.status)}
                                                rows={2}
                                                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-[12px] font-bold focus:bg-white/10 transition-all outline-none resize-none"
                                                placeholder="Document inspection findings..."
                                            />
                                        </div>
                                    </div>
                                </section>
                            )}

                            <section>
                                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Financial Protocol</h5>
                                <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Reason (Internal/Rejection)</label>
                                        <textarea
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            rows={2}
                                            className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-[12px] font-bold focus:bg-white focus:border-rose-100 transition-all outline-none resize-none"
                                            placeholder="Explain resolution for internal logs..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Final Restitution Value</label>
                                        <div className="relative">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-black">₹</div>
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="w-full pl-10 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl text-[13px] font-black focus:bg-white focus:border-rose-100 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-emerald-500 shadow-sm"><Wallet size={16} /></div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Restitution Vector: <span className="text-gray-900 font-black">₹{parseFloat(amount).toLocaleString()}</span></p>
                    </div>

                    <div className="flex gap-3">
                        {entry.returnRequest.status === 'requested' ? (
                            <>
                                <button onClick={() => handleAction('rejected')} disabled={actionLoading} className="px-6 py-4 bg-white border border-gray-200 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all disabled:opacity-50">REJECT REQUEST</button>
                                <button onClick={() => handleAction('approved')} disabled={actionLoading} className="px-10 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all disabled:opacity-50">APPROVE RETURN</button>
                            </>
                        ) : entry.returnRequest.status === 'approved' ? (
                            <button onClick={() => handleAction('received')} disabled={actionLoading} className="px-10 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all disabled:opacity-50">MARK AS RECEIVED</button>
                        ) : entry.returnRequest.status === 'received' ? (
                            <>
                                <button onClick={() => handleAction('quality_failed')} disabled={actionLoading} className="px-6 py-4 bg-white border border-gray-200 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all disabled:opacity-50">FAIL INSPECTION</button>
                                <button onClick={() => handleAction('quality_passed')} disabled={actionLoading} className="px-10 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all disabled:opacity-50">PASS INSPECTION</button>
                            </>
                        ) : (entry.returnRequest.status === 'quality_passed' || entry.returnRequest.status === 'quality_failed') ? (
                            <button onClick={() => handleAction('refunded')} disabled={actionLoading} className="px-10 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-rose-700 transition-all disabled:opacity-50">EXECUTE REFUND</button>
                        ) : (
                            <button onClick={onClose} className="px-10 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl font-black">ACKNOWLEDGE TERMINAL</button>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}
