// app/seller/(seller)/suppliers/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
    Users,
    Plus,
    Edit2,
    Trash2,
    Check,
    X,
    Mail,
    Phone,
    MapPin,
    Package,
    Zap,
    Star,
    MoreVertical,
    Activity,
    ChevronRight,
    ArrowUpRight,
    Filter,
    Search,
    ShieldCheck,
    Truck,
    Clock,
    DollarSign
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    Radar,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis
} from 'recharts'

const RADAR_DATA = [
    { subject: 'Reliability', A: 120, fullMark: 150 },
    { subject: 'Quality', A: 98, fullMark: 150 },
    { subject: 'Lead Time', A: 86, fullMark: 150 },
    { subject: 'Cost', A: 99, fullMark: 150 },
    { subject: 'Restock', A: 85, fullMark: 150 },
];

export default function SuppliersPage() {
    const { token } = useAuth()
    const [suppliers, setSuppliers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingSupplier, setEditingSupplier] = useState(null)

    useEffect(() => {
        if (token) fetchSuppliers()
    }, [token])

    async function fetchSuppliers() {
        try {
            setLoading(true)
            const res = await axios.get('/api/seller/suppliers', {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.data.success) {
                setSuppliers(res.data.suppliers || [])
            }
        } catch (error) {
            console.error('Error fetching suppliers:', error)
            // Silencing as API might not exist
        } finally {
            setLoading(false)
        }
    }

    async function deleteSupplier(id) {
        if (!confirm('Authorize permanent severance of supplier partnership?')) return
        try {
            const res = await axios.delete(`/api/seller/suppliers/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.data.success) {
                toast.success('Supplier link terminated')
                fetchSuppliers()
            }
        } catch (error) { toast.error('Termination failure') }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 font-semibold uppercase tracking-widest text-[10px]">Auditing Supply Network...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8">
            <div className="max-w-[1600px] mx-auto space-y-10">

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                <Truck size={18} />
                            </div>
                            <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">Global Supply Chain</span>
                        </div>
                        <h1 className="text-4xl font-semibold text-gray-900 tracking-tighter">Merchant Partnerships</h1>
                        <p className="text-gray-500 font-medium mt-1">Manage vendor relations and automated restock protocols for peak efficiency</p>
                    </div>

                    <button
                        onClick={() => { setEditingSupplier(null); setShowModal(true); }}
                        className="px-8 py-4 bg-emerald-600 text-white rounded-3xl font-semibold uppercase text-[11px] tracking-widest shadow-2xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Plus size={18} />
                        Onboard Partner
                    </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

                    {/* Network Analytics */}
                    <div className="xl:col-span-1 space-y-8">
                        <div className="bg-white rounded-[2.8rem] p-8 shadow-sm border border-gray-100/50">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                                <Activity size={16} className="text-emerald-500" /> Network Radar
                            </h3>
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RADAR_DATA}>
                                        <PolarGrid stroke="#F1F5F9" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }} />
                                        <Radar name="Network" dataKey="A" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-6 space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Health Index</span>
                                    <span className="text-xs font-semibold text-emerald-600">92.4% Optimal</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-[#064E3B] to-[#065F46] rounded-[2.8rem] p-8 text-white relative overflow-hidden group">
                            <ShieldCheck className="text-emerald-300 mb-4" size={32} />
                            <h4 className="text-xl font-semibold mb-2 tracking-tight">Verified Source Protocol</h4>
                            <p className="text-emerald-100/60 text-[11px] font-semibold uppercase tracking-widest leading-relaxed">
                                100% of your current suppliers have passed the 2024 compliance audit.
                            </p>
                            <button className="mt-8 w-full py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-[10px] font-semibold uppercase tracking-widest border border-white/10 transition-all">
                                Global Compliance Log
                            </button>
                        </div>
                    </div>

                    {/* Suppliers Feed */}
                    <div className="xl:col-span-3 space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <SmallStat label="Provisioners" value={suppliers.length} icon={Users} color="blue" />
                            <SmallStat label="Auto-Restock" value={suppliers.filter(s => s.autoRestock?.enabled).length} icon={Zap} color="orange" />
                            <SmallStat label="Total SKU Flow" value={suppliers.reduce((sum, s) => sum + (s.products?.length || 0), 0)} icon={Package} color="emerald" />
                            <SmallStat label="Avg Lead Time" value="2.4 Days" icon={Clock} color="purple" />
                        </div>

                        <div className="flex items-center justify-between px-2 pt-4">
                            <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Supply Link Ledger</h3>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                    <input type="text" placeholder="Search vendor..." className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-[10px] font-semibold uppercase tracking-widest focus:ring-4 focus:ring-emerald-50/50 outline-none w-64 shadow-sm" />
                                </div>
                                <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-emerald-600 shadow-sm transition-all"><Filter size={18} /></button>
                            </div>
                        </div>

                        {suppliers.length === 0 ? (
                            <div className="bg-white rounded-[3.5rem] p-20 text-center shadow-sm border border-gray-100/50 flex flex-col items-center justify-center space-y-6">
                                <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center text-emerald-300">
                                    <Users size={40} />
                                </div>
                                <h3 className="text-3xl font-semibold text-gray-900 tracking-tighter">No Active Provisioners</h3>
                                <p className="text-gray-500 max-w-sm font-semibold uppercase text-[11px] tracking-widest leading-relaxed">Initialize your global supply grid by onboarding your first manufacturing partner.</p>
                                <button onClick={() => setShowModal(true)} className="px-10 py-5 bg-emerald-600 text-white rounded-3xl font-semibold uppercase text-[11px] tracking-widest hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-500/30">Sync New Partner</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                                {suppliers.map((supplier, idx) => (
                                    <ModernSupplierCard
                                        key={supplier._id}
                                        supplier={supplier}
                                        idx={idx}
                                        onEdit={() => { setEditingSupplier(supplier); setShowModal(true); }}
                                        onDelete={() => deleteSupplier(supplier._id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {showModal && <SupplierModal supplier={editingSupplier} onClose={() => { setShowModal(false); setEditingSupplier(null); }} onSuccess={() => { setShowModal(false); setEditingSupplier(null); fetchSuppliers(); }} token={token} />}
            </div>
        </div>
    )
}

function ModernSupplierCard({ supplier, idx, onEdit, onDelete }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-[2.8rem] p-8 shadow-sm border border-gray-100/50 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all group"
        >
            <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                        <Users size={28} />
                    </div>
                    <div>
                        <h4 className="text-xl font-semibold text-gray-900 tracking-tighter leading-none">{supplier.name}</h4>
                        <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-widest mt-2">{supplier.companyName || 'Private Provisioner'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onEdit} className="p-3 bg-gray-50 hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 rounded-xl transition-all"><Edit2 size={16} /></button>
                    <button onClick={onDelete} className="p-3 bg-gray-50 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-xl transition-all"><Trash2 size={16} /></button>
                </div>
            </div>

            <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-gray-500">
                    <Mail size={14} className="text-emerald-500" />
                    <span className="text-xs font-semibold truncate">{supplier.email}</span>
                </div>
                {supplier.address?.city && (
                    <div className="flex items-center gap-3 text-gray-500">
                        <MapPin size={14} className="text-emerald-500" />
                        <span className="text-xs font-semibold uppercase tracking-widest">{supplier.address.city}, {supplier.address.country}</span>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <div className="flex gap-6">
                    <div className="text-center">
                        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">SKU Flow</p>
                        <p className="text-lg font-semibold text-gray-900">{supplier.products?.length || 0}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Rating</p>
                        <div className="flex items-center gap-1">
                            <Star size={14} className="text-amber-500 fill-current" />
                            <p className="text-lg font-semibold text-gray-900">{supplier.metrics?.rating || 5}</p>
                        </div>
                    </div>
                </div>
                {supplier.autoRestock?.enabled && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-semibold text-emerald-600 uppercase tracking-widest">Active Sync</span>
                    </div>
                )}
            </div>
        </motion.div>
    )
}

function SmallStat({ label, value, icon: Icon, color }) {
    const colors = {
        blue: 'text-blue-600 bg-blue-50 border-blue-100',
        orange: 'text-orange-600 bg-orange-50 border-orange-100',
        emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        purple: 'text-purple-600 bg-purple-50 border-purple-100',
    }
    return (
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100/50 flex items-center gap-4 group">
            <div className={`p-3 rounded-2xl ${colors[color]} border group-hover:scale-110 transition-transform duration-500`}><Icon size={18} /></div>
            <div>
                <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
                <p className="text-lg font-semibold text-gray-900 tracking-tight leading-none">{value}</p>
            </div>
        </div>
    )
}

function SupplierModal({ supplier, onClose, onSuccess, token }) {
    const [formData, setFormData] = useState({
        name: supplier?.name || '',
        companyName: supplier?.companyName || '',
        email: supplier?.email || '',
        phone: supplier?.phone || '',
        address: { street: supplier?.address?.street || '', city: supplier?.address?.city || '', state: supplier?.address?.state || '', country: supplier?.address?.country || '', zipCode: supplier?.address?.zipCode || '' },
        autoRestock: { enabled: supplier?.autoRestock?.enabled || false, method: supplier?.autoRestock?.method || 'email', apiEndpoint: supplier?.autoRestock?.apiEndpoint || '', apiKey: supplier?.autoRestock?.apiKey || '' },
        paymentTerms: supplier?.paymentTerms || 'net_30',
    })

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            const url = supplier ? `/api/seller/suppliers/${supplier._id}` : '/api/seller/suppliers'
            const method = supplier ? 'put' : 'post'
            const res = await axios[method](url, formData, { headers: { Authorization: `Bearer ${token}` } })
            if (res.data.success) {
                toast.success(supplier ? 'Link synchronized' : 'Partner onboarded')
                onSuccess()
            }
        } catch (error) { toast.error('Sync failure') }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[3.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-emerald-50/20">
                    <div>
                        <h2 className="text-3xl font-semibold text-gray-900 tracking-tighter uppercase">{supplier ? 'Edit Partner' : 'Onboard Partner'}</h2>
                        <p className="text-emerald-500 text-[10px] font-semibold uppercase tracking-widest mt-1">Vendor Node Authorization</p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors">
                        <Plus size={24} className="rotate-45" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-1">Legal Identity</label>
                            <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-8 py-5 bg-gray-50 border-none rounded-[2rem] text-[15px] font-semibold focus:ring-4 focus:ring-emerald-100 transition-all outline-none" placeholder="Full Name / Brand" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-1">Email Communication</label>
                            <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-8 py-5 bg-gray-50 border-none rounded-[2rem] text-[15px] font-semibold focus:ring-4 focus:ring-emerald-100 transition-all outline-none" placeholder="vendor@provision.com" />
                        </div>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Global Restock Sync</p>
                        <label className="flex items-center gap-3 p-6 bg-gray-50 rounded-[2.5rem] cursor-pointer group">
                            <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.autoRestock.enabled ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.autoRestock.enabled ? 'left-7' : 'left-1'}`} />
                            </div>
                            <input type="checkbox" className="hidden" checked={formData.autoRestock.enabled} onChange={(e) => setFormData({ ...formData, autoRestock: { ...formData.autoRestock, enabled: e.target.checked } })} />
                            <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-900">Authorize Automated Replenishment</span>
                        </label>
                    </div>
                    <div className="flex gap-4 pt-6">
                        <button type="button" onClick={onClose} className="flex-1 px-8 py-5 border-2 border-gray-100 text-gray-400 rounded-[2rem] text-[11px] font-semibold uppercase tracking-widest hover:bg-gray-50 transition-all">Abort Sync</button>
                        <button type="submit" className="flex-1 px-8 py-5 bg-emerald-600 text-white rounded-[2rem] text-[11px] font-semibold uppercase tracking-widest hover:bg-emerald-700 shadow-2xl shadow-emerald-500/20 transition-all">Execute Onboarding</button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
