'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import {
    RefreshCcw,
    Clock,
    CheckCircle,
    XCircle,
    Search,
    Eye,
    Filter,
    Download
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { formatDate } from '@/lib/utils/formatters'

export default function AdminReturnsPage() {
    const [returns, setReturns] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        fetchReturns()
    }, [])

    const fetchReturns = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await axios.get('/api/returns?role=admin', {
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

    const getStatusStyle = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-700',
            approved: 'bg-green-100 text-green-700',
            rejected: 'bg-red-100 text-red-700',
            completed: 'bg-blue-100 text-blue-700'
        }
        return styles[status] || 'bg-gray-100 text-gray-700'
    }

    if (loading) return <div className="p-8">Loading Returns...</div>

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Returns & Replacements</h1>
                    <p className="text-sm text-gray-400 mt-1">Monitor all service requests across the platform</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 transition-all text-sm font-semibold">
                        <Download size={16} /> Export
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-sm font-semibold shadow-lg shadow-blue-500/20">
                        <Filter size={16} /> Filter
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Pending Review', value: returns.filter(r => r.status === 'pending').length, color: 'yellow' },
                    { label: 'Total Claims (30d)', value: returns.length, color: 'blue' },
                    { label: 'Approval Rate', value: '88%', color: 'green' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                        <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="bg-[#0F172A] border border-white/10 rounded-[2.5rem] overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white/5">
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Request ID</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Customer</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Product</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Type</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Evidence</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Status</th>
                            <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {returns.map((req) => (
                            <tr key={req._id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-5">
                                    <p className="text-[12px] font-bold text-white">#{req._id.slice(-8).toUpperCase()}</p>
                                    <p className="text-[10px] text-gray-500">{formatDate(req.createdAt)}</p>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="text-[12px] font-semibold text-gray-300">{req.customerId?.name}</p>
                                    <p className="text-[10px] text-gray-500">{req.customerId?.email}</p>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="text-[12px] font-semibold text-gray-300 line-clamp-1">{req.items?.[0]?.name}</p>
                                    <p className="text-[10px] text-gray-500">AED {req.items?.[0]?.price}</p>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`text-[9px] font-bold px-2 py-1 rounded-lg uppercase ${req.items?.[0]?.type === 'return' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                                        {req.items?.[0]?.type}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex -space-x-2">
                                        {req.evidence?.slice(0, 3).map((url, i) => (
                                            <div key={i} className="w-8 h-8 rounded-lg border-2 border-[#0F172A] overflow-hidden">
                                                <img src={url} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${getStatusStyle(req.status)}`}>
                                        {req.status}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="p-2 bg-white/5 text-gray-400 rounded-lg hover:text-white transition-all">
                                            <Eye size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
