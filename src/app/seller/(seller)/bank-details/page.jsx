// app/seller/(seller)/bank-details/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
    DollarSign,
    CreditCard,
    Save,
    Shield,
    CheckCircle2,
    Lock,
    ArrowRight,
    Building2,
    Hash,
    User,
    Activity,
    Zap,
    Briefcase,
    Smartphone
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

export default function BankDetailsPage() {
    const { token } = useAuth()
    const [bankDetails, setBankDetails] = useState({
        accountHolderName: '',
        accountNumber: '',
        bankName: '',
        ifscCode: '',
        branchName: '',
        accountType: 'savings',
        upiId: ''
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [verified, setVerified] = useState(false)

    useEffect(() => {
        if (token) fetchBankDetails()
    }, [token])

    async function fetchBankDetails() {
        try {
            setLoading(true)
            const res = await axios.get('/api/seller/bank-details', {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.data.success) {
                setBankDetails(res.data.bankDetails || {})
                setVerified(res.data.bankDetails?.verified || false)
            }
        } catch (error) {
            console.error('Error fetching bank details:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            setSaving(true)
            const res = await axios.post('/api/seller/bank-details', bankDetails, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.data.success) {
                toast.success('Treasury handshake successful')
                setVerified(res.data.bankDetails?.verified || false)
            }
        } catch (error) {
            toast.error('Handshake failed')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
                <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 font-semibold uppercase tracking-widest text-[9px]">Initializing Secured Vault...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8">
            <div className="max-w-[1200px] mx-auto space-y-10">

                {/* Header Block */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                                <DollarSign size={22} />
                            </div>
                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full uppercase tracking-widest border border-emerald-100">Treasury Hub</span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-semibold text-gray-900 tracking-tighter leading-none">Payout Architecture</h1>
                            <p className="text-gray-500 font-semibold uppercase tracking-widest text-[11px] mt-3 flex items-center gap-2">
                                {verified ? (
                                    <span className="flex items-center gap-2 text-emerald-600">
                                        <CheckCircle2 size={16} /> Link Verified — Active Transmission
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2 text-amber-500">
                                        <Activity size={16} className="animate-pulse" /> Pending Validation Pod
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="text-right">
                            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">Global Payout Uptime</p>
                            <p className="text-lg font-semibold text-gray-900 leading-none">99.99%</p>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                </div>

                {/* Secure Protocol Alert */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-900 rounded-[2.8rem] p-8 text-white relative overflow-hidden group border border-gray-800"
                >
                    <Activity className="absolute bottom-[-10%] right-[-5%] w-48 h-48 text-emerald-500/10 group-hover:scale-110 transition-transform duration-700" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[1.8rem] bg-emerald-600/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                                <Shield size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold tracking-tight leading-none uppercase">End-to-End Cryptography</h3>
                                <p className="text-emerald-100/60 text-[10px] font-semibold uppercase tracking-widest leading-relaxed mt-2">
                                    Your financial routing data is obfuscated via 256-bit AES protocol. No plain-text storage detected.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="px-4 py-2 bg-emerald-600/20 rounded-xl border border-emerald-500/30 text-[9px] font-semibold uppercase tracking-widest text-emerald-400">SSL Secure</div>
                            <div className="px-4 py-2 bg-emerald-600/20 rounded-xl border border-emerald-500/30 text-[9px] font-semibold uppercase tracking-widest text-emerald-400">PCI-DSS Compliant</div>
                        </div>
                    </div>
                </motion.div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Left: Account Entry Matrix */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100/50">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                        <CreditCard size={18} className="text-emerald-500" /> Primary Settlement Hub
                                    </h2>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">Configure Routing Infrastructure</p>
                                </div>
                                <Zap size={20} className="text-amber-400" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-4">Account Custodian Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                        <input
                                            type="text"
                                            value={bankDetails.accountHolderName}
                                            onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                                            placeholder="LEGAL ENTITY NAME"
                                            className="w-full pl-16 pr-6 py-5 bg-gray-50 border-none rounded-[2rem] text-[13px] font-semibold uppercase tracking-widest focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:text-gray-200"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-4">Account Identifier</label>
                                    <div className="relative group">
                                        <Hash className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                        <input
                                            type="text"
                                            value={bankDetails.accountNumber}
                                            onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                            placeholder="DIGITAL ADDRESS"
                                            className="w-full pl-16 pr-6 py-5 bg-gray-50 border-none rounded-[2rem] text-[13px] font-semibold uppercase tracking-widest focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:text-gray-200"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-4">Hub Topology</label>
                                    <select
                                        value={bankDetails.accountType}
                                        onChange={(e) => setBankDetails({ ...bankDetails, accountType: e.target.value })}
                                        className="w-full px-8 py-5 bg-gray-50 border-none rounded-[2rem] text-[13px] font-semibold uppercase tracking-widest focus:ring-4 focus:ring-emerald-50 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="savings">Retail (Savings)</option>
                                        <option value="current">Institutional (Current)</option>
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-4">Banking Node</label>
                                    <div className="relative group">
                                        <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                        <input
                                            type="text"
                                            value={bankDetails.bankName}
                                            onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                            placeholder="FINANCIAL INST."
                                            className="w-full pl-16 pr-6 py-5 bg-gray-50 border-none rounded-[2rem] text-[13px] font-semibold uppercase tracking-widest focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:text-gray-200"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest ml-4">Protocol Code (IFSC)</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                        <input
                                            type="text"
                                            value={bankDetails.ifscCode}
                                            onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })}
                                            placeholder="BRIDGE IDENTITY"
                                            className="w-full pl-16 pr-6 py-5 bg-gray-50 border-none rounded-[2rem] text-[13px] font-semibold uppercase tracking-widest focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:text-gray-200"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* UPI Bridge Pod */}
                        <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100/50">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                        <Smartphone size={18} className="text-emerald-500" /> Instant Transmission (UPI)
                                    </h2>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">Optional Low-Latency Settlement</p>
                                </div>
                                <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-semibold uppercase tracking-widest">Fast Track</div>
                            </div>
                            <div className="relative group">
                                <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="yourname@digitalid"
                                    value={bankDetails.upiId}
                                    onChange={(e) => setBankDetails({ ...bankDetails, upiId: e.target.value })}
                                    className="w-full pl-16 pr-6 py-5 bg-gray-50 border-none rounded-[2rem] text-[13px] font-semibold lowercase tracking-widest focus:ring-4 focus:ring-emerald-50 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: Validation & Deploy */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100/50">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-widest mb-6">Integrity Parameters</h3>
                            <div className="space-y-6">
                                <ValidationStep label="Account Mapping" status="Ready" desc="Hub topology aligned" icon={CheckCircle2} />
                                <ValidationStep label="Protocol Sync" status="Active" desc="IFSC Bridge connected" icon={Activity} />
                                <ValidationStep label="KYC Compliance" status="Verified" desc="Business identity logged" icon={ShieldCheck} />
                            </div>

                            <div className="mt-10 pt-10 border-t border-gray-50">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full py-6 bg-gray-900 text-white rounded-[2rem] text-[11px] font-semibold uppercase tracking-[0.2em] shadow-2xl shadow-gray-900/10 hover:bg-emerald-600 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {saving ? (
                                        <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                    ) : <Save size={18} />}
                                    {saving ? 'Transmitting...' : 'Commit Protocol'}
                                </button>
                                <p className="text-[9px] font-semibold text-gray-300 uppercase tracking-widest text-center mt-6">Handshake latency: 450ms</p>
                            </div>
                        </div>

                        <div className="bg-emerald-50 rounded-[3rem] p-8 border border-emerald-100">
                            <h4 className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest mb-4">Payout Frequency</h4>
                            <div className="space-y-4">
                                <FrequencyPod label="T+2 Professional" active={true} />
                                <FrequencyPod label="Weekly Consolidation" active={false} />
                                <FrequencyPod label="Monthly Batch" active={false} />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

function ValidationStep({ label, status, desc, icon: Icon }) {
    return (
        <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-emerald-500 shrink-0"><Icon size={20} /></div>
            <div>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-semibold text-gray-900 uppercase tracking-widest">{label}</span>
                    <span className="text-[8px] font-semibold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">{status}</span>
                </div>
                <p className="text-[9px] font-medium text-gray-400 uppercase mt-1">{desc}</p>
            </div>
        </div>
    )
}

function FrequencyPod({ label, active }) {
    return (
        <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${active ? 'bg-white border-emerald-200 shadow-sm' : 'bg-transparent border-emerald-100 opacity-50'}`}>
            <span className="text-[10px] font-semibold text-emerald-900 uppercase">{label}</span>
            {active && <ArrowRight size={14} className="text-emerald-500" />}
        </div>
    )
}

function ShieldCheck({ size = 20 }) {
    return (
        <div className="relative">
            <Shield size={size} />
            <CheckCircle2 size={size / 2} className="absolute inset-0 m-auto mt-2 ml-2" />
        </div>
    )
} 
