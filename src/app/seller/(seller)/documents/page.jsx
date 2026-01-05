'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
    FileText, Upload, Check, X, Clock, AlertTriangle, Download,
    Trash2, Eye, Shield, Plus, ShieldCheck, Activity, Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

const DOCUMENT_TYPES = {
    government_id: { label: 'Government ID', category: 'Identity', color: 'indigo' },
    passport: { label: 'Passport', category: 'Identity', color: 'blue' },
    drivers_license: { label: "Driver's License", category: 'Identity', color: 'slate' },
    business_registration: { label: 'Business Registration', category: 'Business', color: 'indigo' },
    trade_license: { label: 'Trade License', category: 'Business', color: 'amber' },
    gst_certificate: { label: 'GST Certificate', category: 'Tax', color: 'emerald' },
    utility_bill: { label: 'Utility Bill', category: 'Address', color: 'slate' },
    pan_card: { label: 'PAN Card', category: 'Tax', color: 'rose' },
    cancelled_cheque: { label: 'Cancelled Cheque', category: 'Banking', color: 'slate' },
}

export default function DocumentsPage() {
    const { token } = useAuth()
    const [documents, setDocuments] = useState([])
    const [requestedDocs, setRequestedDocs] = useState([])
    const [status, setStatus] = useState({})
    const [loading, setLoading] = useState(true)
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [activeRequest, setActiveRequest] = useState(null)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        if (token) {
            fetchData()
        }
    }, [token, filter])

    async function fetchData() {
        try {
            setLoading(true)
            const [docsRes, reqRes] = await Promise.all([
                axios.get(`/api/seller/documents`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`/api/seller/documents/requested`, { headers: { Authorization: `Bearer ${token}` } })
            ])
            if (docsRes.data.success) {
                setDocuments(docsRes.data.documents || [])
                setStatus(docsRes.data.verificationStatus || {})
            }
            if (reqRes.data.success) {
                setRequestedDocs(reqRes.data.requestedDocuments || [])
            }
        } finally {
            setLoading(false)
        }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
    )

    return (
        <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-10 animate-in fade-in duration-500">
            {/* Minimal Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-semibold text-slate-900">Documents & Compliance</h1>
                    <p className="text-slate-500 mt-1 font-medium">Verify your identity and business credentials</p>
                </div>
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                    <Plus size={18} /> Upload New
                </button>
            </div>

            {/* Action Items: Requested Docs */}
            {requestedDocs.filter(d => d.status === 'pending' || d.status === 'rejected').length > 0 && (
                <div className="bg-amber-50 rounded-2xl border border-amber-100 p-8 space-y-6">
                    <div className="flex items-center gap-2 text-amber-800">
                        <AlertTriangle size={20} />
                        <h2 className="text-lg font-semibold">Action Required from Admin</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {requestedDocs.filter(d => d.status === 'pending' || d.status === 'rejected').map(req => (
                            <div key={req._id} className="bg-white p-6 rounded-xl border border-amber-200 flex flex-col justify-between">
                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-2 uppercase text-sm tracking-tight">{req.title}</h4>
                                    <p className="text-slate-500 text-xs mb-4">{req.description}</p>
                                    {req.status === 'rejected' && (
                                        <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-[10px] font-semibold">
                                            REJECTED: {req.rejectionReason}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => { setActiveRequest(req); setShowUploadModal(true); }}
                                    className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold text-xs uppercase tracking-widest hover:bg-indigo-700"
                                >
                                    Upload Now
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Overview Chips */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Verification</p>
                        <p className="text-lg font-semibold text-slate-900">{status.status?.toUpperCase() || 'UNKNOWN'}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <Check size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Approved</p>
                        <p className="text-lg font-semibold text-slate-900">{status.approved || 0} Critical</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Completion</p>
                        <p className="text-lg font-semibold text-slate-900">{status.completionPercentage || 0}% Matrix</p>
                    </div>
                </div>
            </div>

            {/* Documents Grid */}
            <div className="space-y-6">
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {['all', 'approved', 'pending', 'rejected'].map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2 rounded-lg text-xs font-semibold uppercase tracking-widest border transition-all ${filter === f ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>
                            {f}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {documents.map(doc => (
                        <div key={doc._id} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-all flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
                                        <FileText size={20} />
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase ${doc.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                            doc.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                        }`}>
                                        {doc.status}
                                    </span>
                                </div>
                                <h4 className="font-semibold text-slate-900 text-lg mb-1 leading-none">{doc.documentName}</h4>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">{doc.documentType?.replace('_', ' ')}</p>

                                <div className="space-y-3 mb-8">
                                    <div className="flex justify-between text-[10px] font-semibold uppercase text-slate-400">
                                        <span>Uploaded</span>
                                        <span className="text-slate-600">{new Date(doc.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="h-1 w-full bg-slate-50 rounded-full">
                                        <div className={`h-full rounded-full ${doc.status === 'approved' ? 'bg-emerald-400' : 'bg-amber-400'} w-full`} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <a href={doc.fileUrl} target="_blank" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-semibold uppercase tracking-widest text-center">Inspect</a>
                                <button className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                    {documents.length === 0 && (
                        <div className="lg:col-span-3 py-20 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <FileText size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 font-semibold uppercase text-[10px] tracking-[.2em]">No Credentials Found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowUploadModal(false)}></div>
                    <form onSubmit={async (e) => {
                        e.preventDefault()
                        const formData = new FormData(e.target)
                        const data = Object.fromEntries(formData)
                        try {
                            if (activeRequest) {
                                await axios.post('/api/seller/documents/requested', { requestId: activeRequest._id, url: data.fileUrl }, { headers: { Authorization: `Bearer ${token}` } })
                            } else {
                                await axios.post('/api/seller/documents', data, { headers: { Authorization: `Bearer ${token}` } })
                            }
                            toast.success('Successfully uploaded')
                            setShowUploadModal(false)
                            setActiveRequest(null)
                            fetchData()
                        } catch (err) { toast.error('Upload failed') }
                    }} className="relative bg-white w-full max-w-md rounded-2xl p-8 space-y-6">
                        <div>
                            <h3 className="text-xl font-semibold text-slate-900">{activeRequest ? 'Fulfill Request' : 'Upload Document'}</h3>
                            <p className="text-slate-400 text-xs font-medium mt-1">
                                {activeRequest ? activeRequest.title : 'Add new credential to your vault'}
                            </p>
                        </div>
                        <div className="space-y-4">
                            {!activeRequest && (
                                <>
                                    <select name="documentType" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-semibold text-sm outline-none">
                                        {Object.entries(DOCUMENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                    </select>
                                    <input name="documentName" placeholder="Document Name (e.g. My PAN)" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-semibold text-sm outline-none" required />
                                </>
                            )}
                            <input name="fileUrl" type="url" placeholder="Resource URL (HTTP link to document)" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-semibold text-sm outline-none" required />
                        </div>
                        <div className="flex gap-4">
                            <button type="button" onClick={() => { setShowUploadModal(false); setActiveRequest(null); }} className="flex-1 py-3 text-slate-400 font-semibold text-xs uppercase hover:bg-slate-50 rounded-xl">Cancel</button>
                            <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-xs uppercase shadow-lg shadow-indigo-100">Upload Doc</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}
