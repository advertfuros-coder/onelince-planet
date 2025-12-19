// app/seller/(seller)/warehouses/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import Link from 'next/link'
import {
    FiPlus,
    FiMapPin,
    FiPackage,
    FiTrendingUp,
    FiSettings,
    FiArrowRight,
    FiEdit2,
    FiTrash2,
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'

export default function WarehousesPage() {
    const { token } = useAuth()
    const [warehouses, setWarehouses] = useState([])
    const [stats, setStats] = useState({})
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)

    useEffect(() => {
        if (token) fetchWarehouses()
    }, [token])

    async function fetchWarehouses() {
        try {
            setLoading(true)
            const res = await axios.get('/api/seller/warehouses', {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.data.success) {
                setWarehouses(res.data.warehouses)
                setStats(res.data.stats)
            }
        } catch (error) {
            console.error('Error fetching warehouses:', error)
            toast.error('Failed to load warehouses')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">🏭 Warehouse Management</h1>
                        <p className="mt-2 text-indigo-100">Manage your inventory locations</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center space-x-2 px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 font-semibold shadow-lg transition-all"
                    >
                        <FiPlus />
                        <span>Add Warehouse</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    icon={<FiMapPin />}
                    label="Total Warehouses"
                    value={stats.total || 0}
                    color="blue"
                />
                <StatCard
                    icon={<FiPackage />}
                    label="Total Products"
                    value={stats.totalProducts || 0}
                    color="green"
                />
                <StatCard
                    icon={<FiTrendingUp />}
                    label="Total Stock"
                    value={stats.totalStock || 0}
                    color="purple"
                />
                <StatCard
                    icon={<FiSettings />}
                    label="Active Warehouses"
                    value={stats.active || 0}
                    color="indigo"
                />
            </div>

            {/* Warehouses Grid */}
            {warehouses.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <FiMapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Warehouses Yet</h3>
                    <p className="text-gray-600 mb-6">
                        Add your first warehouse to start managing inventory across multiple locations
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
                    >
                        Add Your First Warehouse
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {warehouses.map((warehouse) => (
                        <WarehouseCard key={warehouse._id} warehouse={warehouse} onUpdate={fetchWarehouses} />
                    ))}
                </div>
            )}

            {/* Add Warehouse Modal */}
            {showAddModal && (
                <AddWarehouseModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false)
                        fetchWarehouses()
                    }}
                />
            )}
        </div>
    )
}

function WarehouseCard({ warehouse, onUpdate }) {
    const capacityPercent = warehouse.capacity.total > 0
        ? (warehouse.capacity.used / warehouse.capacity.total) * 100
        : 0

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 text-white">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-bold">{warehouse.name}</h3>
                        <p className="text-sm text-indigo-100 mt-1">{warehouse.code}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${warehouse.settings.isActive
                            ? 'bg-green-400 text-green-900'
                            : 'bg-gray-400 text-gray-900'
                        }`}>
                        {warehouse.settings.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {/* Address */}
                <div className="flex items-start space-x-2">
                    <FiMapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="text-sm text-gray-600">
                        <p>{warehouse.address?.city}, {warehouse.address?.state}</p>
                        <p>{warehouse.address?.pincode}</p>
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-gray-500">Products</p>
                        <p className="text-2xl font-bold text-gray-900">{warehouse.metrics?.totalProducts || 0}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Stock</p>
                        <p className="text-2xl font-bold text-gray-900">{warehouse.metrics?.totalStock || 0}</p>
                    </div>
                </div>

                {/* Capacity Bar */}
                <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Capacity</span>
                        <span>{capacityPercent.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all ${capacityPercent > 80 ? 'bg-red-500' : capacityPercent > 60 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                            style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {warehouse.capacity.used} / {warehouse.capacity.total} units
                    </p>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                    <Link
                        href={`/seller/warehouses/${warehouse._id}`}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                    >
                        <span>Manage</span>
                        <FiArrowRight />
                    </Link>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <FiEdit2 />
                    </button>
                </div>
            </div>
        </div>
    )
}

function AddWarehouseModal({ onClose, onSuccess }) {
    const { token } = useAuth()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        type: 'main',
        address: {
            street: '',
            city: '',
            state: '',
            country: 'India',
            pincode: ''
        },
        contact: {
            name: '',
            phone: '',
            email: ''
        },
        capacity: {
            total: 1000
        }
    })

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setLoading(true)
            const res = await axios.post('/api/seller/warehouses', formData, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (res.data.success) {
                toast.success('Warehouse created successfully')
                onSuccess()
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create warehouse')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Add New Warehouse</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Warehouse Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="Mumbai Main Warehouse"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Warehouse Code *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="WH-MUM-01"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">Address</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="City"
                                value={formData.address.city}
                                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                            <input
                                type="text"
                                placeholder="State"
                                value={formData.address.state}
                                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                            <input
                                type="text"
                                placeholder="Pincode"
                                value={formData.address.pincode}
                                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, pincode: e.target.value } })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                            <input
                                type="number"
                                placeholder="Capacity (units)"
                                value={formData.capacity.total}
                                onChange={(e) => setFormData({ ...formData, capacity: { total: parseInt(e.target.value) } })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Warehouse'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function StatCard({ icon, label, value, color }) {
    const colors = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
        indigo: 'bg-indigo-100 text-indigo-600',
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${colors[color]}`}>
                    <div className="text-2xl">{icon}</div>
                </div>
                <div>
                    <p className="text-sm text-gray-600">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    )
}
