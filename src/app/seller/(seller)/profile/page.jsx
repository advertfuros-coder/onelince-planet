// app/seller/(seller)/profile/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
    User,
    Mail,
    Phone,
    MapPin,
    Save,
    Camera,
    Shield,
    Building2,
    Globe,
    CreditCard,
    Briefcase,
    ChevronRight,
    CheckCircle2,
    Lock,
    ExternalLink
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'

export default function ProfilePage() {
    const { token, user } = useAuth()
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        businessName: '',
        address: {
            street: '',
            city: '',
            state: '',
            country: '',
            zipCode: ''
        },
        taxInfo: {
            gstNumber: '',
            panNumber: ''
        }
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (token) fetchProfile()
    }, [token])

    async function fetchProfile() {
        try {
            setLoading(true)
            const res = await axios.get('/api/seller/profile', {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.data.success && res.data.profile) {
                setProfile(prevProfile => ({
                    name: res.data.profile.name || prevProfile.name,
                    email: res.data.profile.email || prevProfile.email,
                    phone: res.data.profile.phone || prevProfile.phone,
                    businessName: res.data.profile.businessName || prevProfile.businessName,
                    address: {
                        street: res.data.profile.address?.street || prevProfile.address.street,
                        city: res.data.profile.address?.city || prevProfile.address.city,
                        state: res.data.profile.address?.state || prevProfile.address.state,
                        country: res.data.profile.address?.country || prevProfile.address.country,
                        zipCode: res.data.profile.address?.zipCode || prevProfile.address.zipCode
                    },
                    taxInfo: {
                        gstNumber: res.data.profile.taxInfo?.gstNumber || prevProfile.taxInfo.gstNumber,
                        panNumber: res.data.profile.taxInfo?.panNumber || prevProfile.taxInfo.panNumber
                    }
                }))
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
            if (error.response?.status !== 404) {
                toast.error('Failed to load profile parameters')
            }
        } finally {
            setLoading(false)
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            setSaving(true)
            const res = await axios.put('/api/seller/profile', profile, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.data.success) {
                toast.success('System credentials updated successfully')
            }
        } catch (error) {
            toast.error('Transmission failed')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Retrieving Master Data...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8">
            <div className="max-w-[1200px] mx-auto">
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Hero Profile Section */}
                    <div className="bg-[#0A1128] rounded-[2.5rem] p-10 lg:p-16 text-white relative overflow-hidden">
                        <div className="absolute top-[-30%] right-[-10%] w-[40rem] h-[40rem] bg-blue-600/10 rounded-full blur-[100px]" />
                        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-8">
                            <div className="relative">
                                <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-[3rem] bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-5xl font-black shadow-2xl border-4 border-white/5">
                                    {profile.name.charAt(0).toUpperCase()}
                                </div>
                                <button type="button" className="absolute bottom-2 right-2 p-3 bg-white text-gray-900 rounded-2xl shadow-xl hover:scale-110 transition-transform">
                                    <Camera size={20} />
                                </button>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">Authorized Seller</span>
                                    <div className="flex items-center gap-1 text-emerald-400">
                                        <CheckCircle2 size={12} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                                    </div>
                                </div>
                                <h1 className="text-4xl lg:text-5xl font-black tracking-tighter mb-4">{profile.name || 'Set Identity'}</h1>
                                <div className="flex flex-wrap gap-6 text-white/50 text-sm font-medium">
                                    <div className="flex items-center gap-2">
                                        <Mail size={16} className="text-blue-400" />
                                        {profile.email}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Briefcase size={16} className="text-blue-400" />
                                        {profile.businessName || 'Business not defined'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-blue-400" />
                                        {profile.address.city}, {profile.address.country}
                                    </div>
                                </div>
                            </div>
                            <div className="lg:text-right">
                                <button 
                                    type="submit"
                                    disabled={saving}
                                    className="px-10 py-5 bg-white text-gray-900 rounded-[1.5rem] font-black uppercase text-[11px] tracking-widest shadow-2xl hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                                    Synchronize Changes
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Sidebar Sections */}
                        <div className="space-y-4">
                            <SectionTab icon={User} label="Identity & Contact" active />
                            <SectionTab icon={MapPin} label="Physical Presence" />
                            <SectionTab icon={Shield} label="Regulatory & Tax" />
                            <SectionTab icon={Lock} label="Security Protocols" />
                            
                            <div className="mt-8 p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100/50">
                                <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-4">Account Integrity</h4>
                                <p className="text-xs font-bold text-blue-800/60 leading-relaxed mb-4">Your store parameters are encrypted and stored in secondary secure vaults.</p>
                                <button type="button" className="text-[10px] font-black text-blue-700 uppercase tracking-widest flex items-center gap-2">
                                   View Audit Logs <ExternalLink size={12} />
                                </button>
                            </div>
                        </div>

                        {/* Main Form Fields */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Personal Infrastructure */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100/50"
                            >
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                                    <Building2 size={18} className="text-blue-600" />
                                    Identity Architecture
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <InputField 
                                        label="Nominal Identity" 
                                        icon={User} 
                                        value={profile.name} 
                                        onChange={(v) => setProfile({...profile, name: v})} 
                                    />
                                    <InputField 
                                        label="Primary Gateway (Email)" 
                                        icon={Mail} 
                                        value={profile.email} 
                                        onChange={(v) => setProfile({...profile, email: v})} 
                                        type="email"
                                    />
                                    <InputField 
                                        label="Tele-Contact" 
                                        icon={Phone} 
                                        value={profile.phone} 
                                        onChange={(v) => setProfile({...profile, phone: v})} 
                                    />
                                    <InputField 
                                        label="Corporate Alias" 
                                        icon={Briefcase} 
                                        value={profile.businessName} 
                                        onChange={(v) => setProfile({...profile, businessName: v})} 
                                    />
                                </div>
                            </motion.div>

                            {/* Logistics Access Point */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100/50"
                            >
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                                    <MapPin size={18} className="text-blue-600" />
                                    Global Distribution Point
                                </h3>
                                <div className="space-y-8">
                                    <InputField 
                                        label="Street Address" 
                                        value={profile.address.street} 
                                        onChange={(v) => setProfile({...profile, address: {...profile.address, street: v}})} 
                                    />
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <InputField 
                                            label="City" 
                                            value={profile.address.city} 
                                            onChange={(v) => setProfile({...profile, address: {...profile.address, city: v}})} 
                                        />
                                        <InputField 
                                            label="State" 
                                            value={profile.address.state} 
                                            onChange={(v) => setProfile({...profile, address: {...profile.address, state: v}})} 
                                        />
                                        <InputField 
                                            label="ISO Country" 
                                            value={profile.address.country} 
                                            onChange={(v) => setProfile({...profile, address: {...profile.address, country: v}})} 
                                        />
                                        <InputField 
                                            label="Postal Code" 
                                            value={profile.address.zipCode} 
                                            onChange={(v) => setProfile({...profile, address: {...profile.address, zipCode: v}})} 
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Fiscal Compliance */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100/50"
                            >
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                                    <Shield size={18} className="text-blue-600" />
                                    Compliance Parameters
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <InputField 
                                        label="GST Authorization Number" 
                                        value={profile.taxInfo.gstNumber} 
                                        onChange={(v) => setProfile({...profile, taxInfo: {...profile.taxInfo, gstNumber: v}})} 
                                    />
                                    <InputField 
                                        label="PAN Protocol ID" 
                                        value={profile.taxInfo.panNumber} 
                                        onChange={(v) => setProfile({...profile, taxInfo: {...profile.taxInfo, panNumber: v}})} 
                                    />
                                </div>
                                <div className="mt-8 p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center gap-4">
                                   <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                                      <CheckCircle2 size={24} />
                                   </div>
                                   <div>
                                      <p className="text-[10px] font-black text-emerald-900 uppercase tracking-widest mb-0.5">Automated Tax Delta</p>
                                      <p className="text-xs font-bold text-emerald-700">GST settlements are reconciled dynamically against your sales ledger.</p>
                                   </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

function SectionTab({ icon: Icon, label, active }) {
    return (
        <button 
           type="button"
           className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all group ${
              active 
              ? 'bg-white shadow-lg shadow-blue-500/5 text-gray-900 border border-gray-100' 
              : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50/50'
           }`}
        >
           <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-xl transition-colors ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-50 text-gray-300 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                 <Icon size={18} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
           </div>
           {active && <ChevronRight size={16} className="text-blue-600" />}
        </button>
    )
}

function InputField({ label, icon: Icon, value, onChange, type = "text" }) {
    return (
        <div className="space-y-2 group">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center justify-between">
                {label}
                {Icon && <Icon size={12} className="text-gray-200 group-focus-within:text-blue-400 transition-colors" />}
            </label>
            <input
                type={type}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50/50 border border-transparent rounded-[1.2rem] text-[13px] font-black placeholder:text-gray-300 focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
            />
        </div>
    )
}
