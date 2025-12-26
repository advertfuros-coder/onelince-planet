// app/seller/(seller)/coupons/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
    Ticket,
    Plus,
    Search,
    Edit3,
    Trash2,
    Calendar,
    Users,
    TrendingUp,
    CheckCircle2,
    XCircle,
    Info,
    Tag,
    ChevronRight,
    Copy,
    ArrowUpRight,
    Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

export default function CouponsManagement() {
    const { token } = useAuth()
    const [coupons, setCoupons] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingCoupon, setEditingCoupon] = useState(null)

    useEffect(() => {
        if (token) fetchCoupons()
    }, [token])

    const fetchCoupons = async () => {
        try {
            setLoading(true)
            const res = await axios.get('/api/seller/coupons', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                setCoupons(res.data.coupons)
            }
        } catch (error) {
            toast.error('Failed to sync coupon data')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Terminate this promotion?')) return
        try {
            const res = await axios.delete(`/api/seller/coupons/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                toast.success('Promotion terminated')
                fetchCoupons()
            }
        } catch (error) {
            toast.error('Termination failed')
        }
    }

    const filteredCoupons = coupons.filter(c =>
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Encrypting Promotional Buffers...</p>
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
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                <Ticket size={18} />
                            </div>
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Yield Enhancement</span>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Coupon Terminal</h1>
                        <p className="text-gray-500 font-medium mt-1">Deploy promotional vouchers and incentive protocols</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search Protocol ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-[1.5rem] w-full lg:w-80 text-sm font-bold shadow-sm focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
                            />
                        </div>
                        <button
                            onClick={() => {
                                setEditingCoupon(null)
                                setShowModal(true)
                            }}
                            className="bg-gray-900 text-white px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-gray-900/10 hover:bg-indigo-600 hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3"
                        >
                            <Plus size={18} />
                            Initialize Promotion
                        </button>
                    </div>
                </div>

                {/* Coupons Grid */}
                {filteredCoupons.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredCoupons.map((coupon) => (
                            <CouponCard
                                key={coupon._id}
                                coupon={coupon}
                                onEdit={() => {
                                    setEditingCoupon(coupon)
                                    setShowModal(true)
                                }}
                                onDelete={() => handleDelete(coupon._id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[3rem] p-20 text-center border border-gray-100/50 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200 mx-auto mb-6">
                            <Ticket size={40} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2 uppercase">No Promotional Signals</h3>
                        <p className="text-gray-400 text-sm font-medium">Your account is currently running at base yield protocols.</p>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <CouponModal
                        coupon={editingCoupon}
                        onClose={() => setShowModal(false)}
                        onSuccess={() => {
                            setShowModal(false)
                            fetchCoupons()
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

function CouponCard({ coupon, onEdit, onDelete }) {
    const isActive = new Date(coupon.validUntil) > new Date() && coupon.isActive

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all relative overflow-hidden flex flex-col"
        >
            <div className={`h-2 w-full ${isActive ? 'bg-emerald-500' : 'bg-gray-200'}`} />

            <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-300'}`}>
                            <Zap size={16} />
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {isActive ? 'Active Protocol' : 'Dormant'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onEdit} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                            <Edit3 size={16} />
                        </button>
                        <button onClick={onDelete} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">{coupon.code}</h3>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(coupon.code)
                                toast.success('Protocol ID Copied')
                            }}
                            className="p-1.5 bg-gray-50 border border-gray-100 rounded-lg text-gray-400 hover:text-indigo-600 transition-all"
                        >
                            <Copy size={12} />
                        </button>
                    </div>
                    <p className="text-xs font-bold text-gray-400 italic">"{coupon.description || 'Standard promotional discount.'}"</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Benefit</p>
                        <p className="text-lg font-black text-indigo-600 tracking-tighter">
                            {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Consumption</p>
                        <div className="flex items-center justify-end gap-1.5 font-black text-gray-900 tracking-tighter">
                            <Users size={14} className="text-gray-300" />
                            <span>{coupon.usageCount?.total || 0}</span>
                            <span className="text-gray-300">/ {coupon.usageLimit?.total || '∞'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 bg-gray-50/50 rounded-2xl p-4">
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-tight">
                            Ends {new Date(coupon.validUntil).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <TrendingUp size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tight">+12% Yield</span>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-[-10%] right-[-5%] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                <Ticket size={120} />
            </div>
        </motion.div>
    )
}

function CouponModal({ coupon, onClose, onSuccess }) {
    const { token } = useAuth()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState(coupon || {
        code: '',
        type: 'percentage',
        value: 10,
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        minimumPurchase: 500,
        maximumDiscount: 1000,
        usageLimit: { total: 100, perUser: 1 },
        description: ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const url = coupon ? `/api/seller/coupons/${coupon._id}` : '/api/seller/coupons'
            const method = coupon ? 'put' : 'post'
            const res = await axios[method](url, formData, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                toast.success(coupon ? 'Promotion Updated' : 'Promotion Dispatched')
                onSuccess()
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Dispatch failed')
        } finally {
            setLoading(false)
        }
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
                className="bg-white rounded-[3.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded tracking-widest uppercase">Protocol Init</span>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter">{coupon ? 'Edit Promotion' : 'New Promotion'}</h2>
                        </div>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-tight">Configure yield adjustment parameters</p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white border border-gray-100 text-gray-400 hover:text-indigo-600 rounded-2xl transition-all">
                        <XCircle size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2 col-span-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Protocol ID (Code)</label>
                            <input
                                required
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-[1.5rem] text-[13px] font-black placeholder:text-gray-300 focus:bg-white focus:border-indigo-100 transition-all outline-none"
                                placeholder="E.G. SAVE30"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Discount Type</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-[1.5rem] text-[13px] font-black focus:bg-white focus:border-indigo-100 transition-all outline-none"
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (₹)</option>
                                <option value="free_shipping">Free Shipping</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Discount Value</label>
                            <input
                                type="number"
                                required
                                value={formData.value}
                                onChange={e => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                                className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-[1.5rem] text-[13px] font-black focus:bg-white focus:border-indigo-100 transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Valid From</label>
                            <input
                                type="date"
                                required
                                value={formData.validFrom?.split('T')[0]}
                                onChange={e => setFormData({ ...formData, validFrom: e.target.value })}
                                className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-[1.5rem] text-[13px] font-black focus:bg-white focus:border-indigo-100 transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Valid Until</label>
                            <input
                                type="date"
                                required
                                value={formData.validUntil?.split('T')[0]}
                                onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                                className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-[1.5rem] text-[13px] font-black focus:bg-white focus:border-indigo-100 transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Min Purchase (₹)</label>
                            <input
                                type="number"
                                value={formData.minimumPurchase}
                                onChange={e => setFormData({ ...formData, minimumPurchase: parseFloat(e.target.value) })}
                                className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-[1.5rem] text-[13px] font-black focus:bg-white focus:border-indigo-100 transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Max Discount (₹)</label>
                            <input
                                type="number"
                                value={formData.maximumDiscount}
                                onChange={e => setFormData({ ...formData, maximumDiscount: parseFloat(e.target.value) })}
                                className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-[1.5rem] text-[13px] font-black focus:bg-white focus:border-indigo-100 transition-all outline-none"
                                placeholder="Only for %"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Total Limit</label>
                            <input
                                type="number"
                                value={formData.usageLimit?.total}
                                onChange={e => setFormData({ ...formData, usageLimit: { ...formData.usageLimit, total: parseInt(e.target.value) } })}
                                className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-[1.5rem] text-[13px] font-black focus:bg-white focus:border-indigo-100 transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-[1.5rem] text-[12px] font-bold focus:bg-white focus:border-indigo-100 transition-all outline-none resize-none"
                                placeholder="Public description of the offer..."
                                rows={2}
                            />
                        </div>
                    </div>
                </form>

                <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Info size={16} className="text-gray-400" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Protocol validation active</p>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-gray-900 text-white px-12 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
                    >
                        {loading && <Zap size={18} className="animate-pulse" />}
                        {coupon ? 'Sync Protocol' : 'Deploy Protocol'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}
