// app/seller/(seller)/documents/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
    FileText,
    Upload,
    Check,
    X,
    Clock,
    AlertTriangle,
    Download,
    Trash2,
    Eye,
    Shield,
    Plus,
    Filter,
    Search,
    ChevronRight,
    Activity,
    ShieldCheck,
    Info,
    Calendar,
    Briefcase,
    Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

const DOCUMENT_TYPES = {
    government_id: { label: 'Government ID', category: 'Identity', required: true, icon: '🆔' },
    passport: { label: 'Passport', category: 'Identity', required: false, icon: '🛂' },
    drivers_license: { label: "Driver's License", category: 'Identity', required: false, icon: '🚗' },
    business_registration: { label: 'Business Registration', category: 'Business', required: true, icon: '🏢' },
    trade_license: { label: 'Trade License', category: 'Business', required: true, icon: '📜' },
    gst_certificate: { label: 'GST Certificate', category: 'Tax', required: true, icon: '💼' },
    utility_bill: { label: 'Utility Bill', category: 'Address Proof', required: true, icon: '💡' },
    pan_card: { label: 'PAN Card', category: 'Tax', required: true, icon: '💳' },
    cancelled_cheque: { label: 'Cancelled Cheque', category: 'Banking', required: true, icon: '✅' },
    other: { label: 'Other Document', category: 'Additional', required: false, icon: '📎' },
}

export default function DocumentsPage() {
    const { token } = useAuth()
    const [documents, setDocuments] = useState([])
    const [stats, setStats] = useState({})
    const [verificationStatus, setVerificationStatus] = useState({})
    const [expiringDocs, setExpiringDocs] = useState([])
    const [loading, setLoading] = useState(true)
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        if (token) fetchDocuments()
    }, [token, filter])

    async function fetchDocuments() {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (filter !== 'all') params.append('status', filter)

            const res = await axios.get(`/api/seller/documents?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.data.success) {
                setDocuments(res.data.documents || [])
                setStats(res.data.stats || {})
                setVerificationStatus(res.data.verificationStatus || {})
                setExpiringDocs(res.data.expiringDocuments || [])
            }
        } catch (error) {
            console.error('Error fetching documents:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 font-black uppercase tracking-widest text-[9px]">Scrutinizing Credentials...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8">
            <div className="max-w-[1400px] mx-auto space-y-10">

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                <ShieldCheck size={18} />
                            </div>
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">KYC Vault</span>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Identity & Compliance</h1>
                        <p className="text-gray-500 font-medium mt-1">Manage merchant credentials and regulatory documentation</p>
                    </div>

                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="px-8 py-4 bg-indigo-600 text-white rounded-3xl font-black uppercase text-[11px] tracking-widest shadow-2xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Plus size={18} />
                        Deposit Document
                    </button>
                </div>

                {/* Verification Progress Pane */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <ModernVerificationBanner status={verificationStatus} />
                    </div>
                    <div className="bg-white rounded-[2.8rem] p-8 shadow-sm border border-gray-100/50 flex flex-col justify-between group">
                        <div>
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Integrity Score</h3>
                            <div className="flex items-end gap-3">
                                <p className="text-5xl font-black text-gray-900 tracking-tighter">98<span className="text-gray-300 text-2xl">/100</span></p>
                                <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-black mb-2">
                                    <Activity size={12} /> +2.4%
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 space-y-3">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Rank: Trusted Merchant Tier 1</p>
                            <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 w-[98%] rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alerts & Quick Stats */}
                <div className="flex flex-col md:flex-row gap-6">
                    {expiringDocs.length > 0 && (
                        <div className="flex-1 bg-rose-50 border-2 border-rose-100 p-6 rounded-[2.5rem] flex items-center gap-6">
                            <div className="w-14 h-14 bg-rose-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/20">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-rose-900 uppercase tracking-widest">Expiration Alert</h4>
                                <p className="text-xs font-bold text-rose-600/70 mt-1 uppercase tracking-tighter">
                                    {expiringDocs.length} Documents require immediate renewal to maintain operational status.
                                </p>
                            </div>
                            <button className="ml-auto p-4 bg-white text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                <Plus size={20} />
                            </button>
                        </div>
                    )}
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        <MetricChip label="Approved" value={stats.approved || 0} icon={Check} color="emerald" />
                        <MetricChip label="Review" value={stats.under_review || 0} icon={Eye} color="purple" />
                        <MetricChip label="Pending" value={stats.pending || 0} icon={Clock} color="amber" />
                    </div>
                </div>

                {/* Filter & Feed */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            {['all', 'approved', 'pending', 'rejected'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-6 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-gray-900 text-white shadow-xl' : 'bg-white border border-gray-100 text-gray-400 hover:bg-gray-50'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input type="text" placeholder="Search archive..." className="pl-12 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest focus:ring-4 focus:ring-indigo-50 outline-none w-64 shadow-sm" />
                        </div>
                    </div>

                    {documents.length === 0 ? (
                        <div className="bg-white rounded-[3.5rem] p-24 text-center shadow-sm border border-gray-100/50 flex flex-col items-center justify-center space-y-6">
                            <div className="w-24 h-24 bg-indigo-50 rounded-[2.8rem] flex items-center justify-center text-indigo-300">
                                <FileText size={40} />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Vault Empty</h3>
                            <p className="text-gray-500 max-w-sm font-black uppercase text-[10px] tracking-widest leading-relaxed">System awaiting credential deposits. Onboard your first verification entity to activate account protocols.</p>
                            <button onClick={() => setShowUploadModal(true)} className="px-10 py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase text-[11px] tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/30">Deposit Identity</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
                            {documents.map((doc, idx) => (
                                <ModernDocumentCard
                                    key={doc._id}
                                    document={doc}
                                    idx={idx}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {showUploadModal && <UploadModal onClose={() => setShowUploadModal(false)} onSuccess={() => { setShowUploadModal(false); fetchDocuments(); }} token={token} />}
            </div>
        </div>
    )
}

function ModernVerificationBanner({ status }) {
    const isComplete = status.status === 'verified'
    return (
        <div className={`
          relative overflow-hidden p-8 rounded-[2.8rem] border shadow-2xl shadow-indigo-500/5
          ${isComplete ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-gray-900 border-gray-800 text-white'}
        `}>
            {isComplete && <Activity className="absolute bottom-[-20%] right-[-10%] w-60 h-60 text-white/5 opacity-50" />}
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shrink-0 ${isComplete ? 'bg-white/20' : 'bg-white/10'}`}>
                        {isComplete ? <ShieldCheck size={40} /> : <Clock size={40} className="text-indigo-400" />}
                    </div>
                    <div>
                        <h3 className="text-2xl font-black tracking-tight leading-none uppercase">{isComplete ? 'Node Verified' : 'Compliance Hold'}</h3>
                        <p className={`text-[11px] font-bold uppercase tracking-widest mt-2 ${isComplete ? 'text-white/70' : 'text-gray-400'}`}>
                            {status.approved || 0} of {status.required || 0} Critical Handshakes Finalized
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-5xl font-black tracking-tighter">{status.completionPercentage || 0}%</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">Integrity Matrix</p>
                </div>
            </div>
            <div className="mt-8 h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${status.completionPercentage || 0}%` }}
                    className={`h-full rounded-full ${isComplete ? 'bg-white' : 'bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,1)]'}`}
                />
            </div>
        </div>
    )
}

function ModernDocumentCard({ document, idx }) {
    const statusMeta = {
        approved: { color: 'text-emerald-500', bg: 'bg-emerald-50', icon: Check },
        pending: { color: 'text-amber-500', bg: 'bg-amber-50', icon: Clock },
        rejected: { color: 'text-rose-500', bg: 'bg-rose-50', icon: X },
        under_review: { color: 'text-purple-500', bg: 'bg-purple-50', icon: Eye },
    }
    const meta = statusMeta[document.status] || statusMeta.pending
    const DocIcon = meta.icon
    const typeInfo = DOCUMENT_TYPES[document.documentType] || DOCUMENT_TYPES.other

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group bg-white rounded-[2.8rem] p-10 shadow-sm border border-gray-100/50 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all text-left"
        >
            <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[1.8rem] bg-gray-50 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform duration-500">
                        {typeInfo.icon}
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-gray-900 tracking-tighter leading-none group-hover:text-indigo-600 transition-colors uppercase">{document.documentName}</h4>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{typeInfo.label}</span>
                            <div className="w-1 h-1 rounded-full bg-gray-300" />
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{typeInfo.category}</span>
                        </div>
                    </div>
                </div>
                <div className={`px-4 py-2 rounded-2xl ${meta.bg} ${meta.color} flex items-center gap-2 border border-transparent group-hover:border-current transition-all`}>
                    <DocIcon size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{document.status}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-50">
                <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Seal Identity</p>
                    <p className="text-sm font-black text-gray-800 tracking-tight">{document.documentNumber || 'UNSET'}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Ingestion Date</p>
                    <p className="text-sm font-black text-gray-800 tracking-tight">{new Date(document.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Expiration</p>
                    <p className="text-sm font-black text-gray-800 tracking-tight">{document.expiryDate ? new Date(document.expiryDate).toLocaleDateString() : 'PERMANENT'}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Authorization</p>
                    <p className="text-sm font-black text-indigo-600 flex items-center gap-1">VERIFIED <Shield size={12} /></p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <a href={document.fileUrl} target="_blank" className="flex-1 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-xl shadow-gray-900/10">
                    <Download size={16} /> Inspect Payload
                </a>
                <button className="p-4 bg-gray-50 text-gray-400 hover:text-rose-500 rounded-2xl transition-all">
                    <Trash2 size={18} />
                </button>
            </div>
        </motion.div>
    )
}

function MetricChip({ label, value, icon: Icon, color }) {
    const colors = {
        emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        purple: 'text-purple-600 bg-purple-50 border-purple-100',
        amber: 'text-amber-600 bg-amber-50 border-amber-100',
    }
    return (
        <div className="bg-white px-8 py-5 rounded-[2rem] shadow-sm border border-gray-100/50 flex items-center gap-6 shrink-0 group">
            <div className={`p-4 rounded-xl ${colors[color]} border group-hover:scale-110 transition-transform duration-500`}><Icon size={18} /></div>
            <div className="text-left">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">{label}</p>
                <p className="text-lg font-black text-gray-900 tracking-tighter leading-none">{value}</p>
            </div>
        </div>
    )
}

function UploadModal({ onClose, onSuccess, token }) {
    const [formData, setFormData] = useState({
        documentType: 'government_id', documentName: '', documentNumber: '', issueDate: '', expiryDate: '', fileUrl: '', notes: ''
    })
    const [uploading, setUploading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            setUploading(true)
            const res = await axios.post('/api/seller/documents', formData, { headers: { Authorization: `Bearer ${token}` } })
            if (res.data.success) { toast.success('Vault deposit successful'); onSuccess(); }
        } catch (error) { toast.error('Deposit failure'); } finally { setUploading(false); }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[3.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-indigo-50/20">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Vault Deposit</h2>
                        <p className="text-indigo-500 text-[10px] font-black uppercase tracking-widest mt-1">Identity Node Initialization</p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors">
                        <Plus size={24} className="rotate-45" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-10 space-y-6 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-6">
                        <select value={formData.documentType} onChange={(e) => setFormData({ ...formData, documentType: e.target.value })} className="w-full px-8 py-5 bg-gray-50 border-none rounded-[2rem] text-[14px] font-bold focus:ring-4 focus:ring-indigo-100 outline-none appearance-none cursor-pointer">
                            {Object.entries(DOCUMENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                        <input type="text" placeholder="Designate Entry Name *" value={formData.documentName} onChange={(e) => setFormData({ ...formData, documentName: e.target.value })} className="w-full px-8 py-5 bg-gray-50 border-none rounded-[2rem] text-[14px] font-bold focus:ring-4 focus:ring-indigo-100 outline-none" required />
                    </div>
                    <input type="url" placeholder="Secure Resource URL *" value={formData.fileUrl} onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })} className="w-full px-8 py-5 bg-gray-50 border-none rounded-[2rem] text-[14px] font-bold focus:ring-4 focus:ring-indigo-100 outline-none" required />
                    <div className="flex gap-4 pt-6">
                        <button type="button" onClick={onClose} className="flex-1 px-8 py-5 border-2 border-gray-100 text-gray-400 rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">Abort</button>
                        <button type="submit" disabled={uploading} className="flex-1 px-8 py-5 bg-indigo-600 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-2xl shadow-indigo-500/20 transition-all">Execute Deposit</button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
