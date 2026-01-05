'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import Link from 'next/link'
import {
    ArrowLeft,
    Package,
    MapPin,
    Phone,
    Mail,
    Edit2,
    Trash2,
    Save,
    X,
    Box,
    AlertCircle,
    CheckCircle2,
    History,
    Truck,
    TrendingUp,
    MoreVertical,
    Search,
    Filter
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    Legend
} from 'recharts'

export default function WarehouseDetailsPage() {
    const { id } = useParams()
    const router = useRouter()
    const { token } = useAuth()

    const [warehouse, setWarehouse] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [editedData, setEditedData] = useState({})

    const [inventorySearch, setInventorySearch] = useState('')

    useEffect(() => {
        if (token && id) fetchWarehouseDetails()
    }, [token, id])

    async function fetchWarehouseDetails() {
        try {
            setLoading(true)
            const res = await axios.get(`/api/seller/warehouses/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                setWarehouse(res.data.warehouse)
                setEditedData(res.data.warehouse)
            }
        } catch (error) {
            console.error('Error details:', error)
            toast.error('Failed to access terminal data')
            router.push('/seller/warehouses')
        } finally {
            setLoading(false)
        }
    }

    async function handleUpdate() {
        try {
            const res = await axios.put(`/api/seller/warehouses/${id}`, editedData, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                toast.success('Terminal protocols updated')
                setWarehouse(res.data.warehouse)
                setIsEditing(false)
            }
        } catch (error) {
            toast.error('Update sequence failed')
        }
    }

    async function handleDelete() {
        if (!confirm('WARNING: Decommissioning this terminal is irreversible. Confirm protocol?')) return

        try {
            const res = await axios.delete(`/api/seller/warehouses/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data.success) {
                toast.success('Terminal decommissioned')
                router.push('/seller/warehouses')
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Decommission failed')
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 font-semibold uppercase tracking-widest text-[10px]">Synchronizing Terminal Data...</p>
            </div>
        )
    }

    if (!warehouse) return null

    const capacityUsed = warehouse.metrics?.totalStock || 0
    const capacityTotal = warehouse.capacity?.total || 1000
    const capacityPercent = Math.min((capacityUsed / capacityTotal) * 100, 100)

    const filteredInventory = warehouse.inventory?.filter(item =>
        item.productId?.name?.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        item.productId?.sku?.toLowerCase().includes(inventorySearch.toLowerCase())
    ) || []

    const pieData = [
        { name: 'Used Space', value: capacityUsed, color: '#4F46E5' },
        { name: 'Available', value: capacityTotal - capacityUsed, color: '#E2E8F0' }
    ]

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8">
            <div className="max-w-[1600px] mx-auto space-y-8">

                {/* Header Navigation */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/seller/warehouses"
                            className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:shadow-md transition-all"
                        >
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-semibold text-gray-900 tracking-tighter uppercase">{warehouse.name}</h1>
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-semibold uppercase tracking-widest border border-indigo-100">
                                    {warehouse.code}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-gray-500 text-xs font-semibold">
                                <div className="flex items-center gap-1.5">
                                    <MapPin size={14} className="text-indigo-400" />
                                    {warehouse.address?.city}, {warehouse.address?.state}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 size={14} className={warehouse.settings?.isActive ? "text-emerald-500" : "text-gray-400"} />
                                    {warehouse.settings?.isActive ? "Operational Node" : "Offline"}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-3 border border-gray-200 text-gray-500 rounded-xl font-semibold uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold uppercase text-[10px] tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                                >
                                    <Save size={16} /> Save Changes
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => handleDelete()}
                                    className="px-5 py-3 bg-rose-50 text-rose-500 rounded-xl font-semibold uppercase text-[10px] tracking-widest hover:bg-rose-100 transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-6 py-3 bg-white border border-gray-100 text-gray-600 rounded-xl font-semibold uppercase text-[10px] tracking-widest hover:text-indigo-600 hover:shadow-md transition-all flex items-center gap-2"
                                >
                                    <Edit2 size={16} /> Edit Configuration
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Edit Mode Inputs */}
                <AnimatePresence>
                    {isEditing && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-white rounded-[2rem] p-8 border border-indigo-100 shadow-xl overflow-hidden"
                        >
                            <h3 className="text-sm font-semibold text-indigo-900 uppercase tracking-widest mb-6">Terminal Calibration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormInput label="Terminal Name" value={editedData.name} onChange={v => setEditedData({ ...editedData, name: v })} />
                                <FormInput label="City Node" value={editedData.address?.city} onChange={v => setEditedData({ ...editedData, address: { ...editedData.address, city: v } })} />
                                <FormInput label="Max Capacity" type="number" value={editedData.capacity?.total} onChange={v => setEditedData({ ...editedData, capacity: { ...editedData.capacity, total: parseInt(v) } })} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                    {/* Left Column: Metrics & Info */}
                    <div className="xl:col-span-1 space-y-6">
                        {/* Capacity Card */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100/50 relative overflow-hidden">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-widest mb-2">Storage Density</h3>
                            <div className="h-[200px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                    <span className="text-3xl font-semibold text-gray-900">{capacityPercent.toFixed(0)}%</span>
                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Occupied</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="text-center p-4 bg-indigo-50 rounded-2xl">
                                    <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest">Total Units</p>
                                    <p className="text-xl font-semibold text-indigo-900">{capacityUsed.toLocaleString()}</p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-2xl">
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Available</p>
                                    <p className="text-xl font-semibold text-gray-900">{(capacityTotal - capacityUsed).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100/50 space-y-6">
                            <div>
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Node Coordinates</h3>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                            <MapPin size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{warehouse.address?.street || 'N/A'}</p>
                                            <p className="text-xs font-medium text-gray-500">{warehouse.address?.city}, {warehouse.address?.state} - {warehouse.address?.pincode}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                            <Phone size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{warehouse.contact?.phone || 'No Contact'}</p>
                                            <p className="text-xs font-medium text-gray-500">Hub Manager</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Inventory List */}
                    <div className="xl:col-span-2">
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100/50 overflow-hidden min-h-[600px] flex flex-col">
                            <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Stored Assets</h3>
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">
                                        {filteredInventory.length} SKUs in containment
                                    </p>
                                </div>
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
                                    <input
                                        type="text"
                                        placeholder="SEARCH SKU / ASSET"
                                        value={inventorySearch}
                                        onChange={(e) => setInventorySearch(e.target.value)}
                                        className="pl-12 pr-6 py-3 bg-gray-50 border-none rounded-2xl text-[10px] font-semibold uppercase tracking-widest min-w-[250px] focus:ring-2 focus:ring-indigo-50 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="px-8 py-4 text-left text-[9px] font-semibold text-gray-400 uppercase tracking-widest">Asset Identity</th>
                                            <th className="px-6 py-4 text-center text-[9px] font-semibold text-gray-400 uppercase tracking-widest">Stock Level</th>
                                            <th className="px-6 py-4 text-center text-[9px] font-semibold text-gray-400 uppercase tracking-widest">Valuation</th>
                                            <th className="px-6 py-4 text-right text-[9px] font-semibold text-gray-400 uppercase tracking-widest">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredInventory.length > 0 ? (
                                            filteredInventory.map((item, idx) => (
                                                <tr key={idx} className="group hover:bg-indigo-50/30 transition-colors">
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden border border-gray-200">
                                                                {item.productId?.images?.[0] ? (
                                                                    <img src={item.productId.images[0].url || item.productId.images[0]} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-gray-400"><Package size={20} /></div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">{item.productId?.name}</p>
                                                                <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded mt-1 inline-block">
                                                                    {item.productId?.sku}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        <span className="text-sm font-semibold text-gray-900">{item.quantity}</span>
                                                        <p className="text-[9px] font-semibold text-gray-400">Units</p>
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        <span className="text-xs font-semibold text-gray-900">₹{(item.productId?.pricing?.salePrice || 0).toLocaleString()}</span>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <div className="flex justify-end">
                                                            <div className={`w-2 h-2 rounded-full ${item.quantity > 10 ? 'bg-emerald-500' : item.quantity > 0 ? 'bg-orange-400' : 'bg-rose-500'}`} />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="py-20 text-center">
                                                    <div className="inline-flex w-16 h-16 bg-gray-50 rounded-full items-center justify-center text-gray-300 mb-4">
                                                        <Box size={30} />
                                                    </div>
                                                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">Containment Empty</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function FormInput({ label, value, onChange, type = "text" }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-semibold text-indigo-300 uppercase tracking-widest ml-1">{label}</label>
            <input
                type={type}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-5 py-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-sm font-semibold text-indigo-900 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
            />
        </div>
    )
}
