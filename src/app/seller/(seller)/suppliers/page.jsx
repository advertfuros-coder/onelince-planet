// app/seller/(seller)/suppliers/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
    FiUsers,
    FiPlus,
    FiEdit,
    FiTrash2,
    FiCheck,
    FiX,
    FiMail,
    FiPhone,
    FiMapPin,
    FiPackage,
    FiZap,
    FiStar,
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'

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
                setSuppliers(res.data.suppliers)
            }
        } catch (error) {
            console.error('Error fetching suppliers:', error)
            toast.error('Failed to load suppliers')
        } finally {
            setLoading(false)
        }
    }

    async function deleteSupplier(id) {
        if (!confirm('Are you sure you want to delete this supplier?')) return

        try {
            const res = await axios.delete(`/api/seller/suppliers/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.data.success) {
                toast.success('Supplier deleted')
                fetchSuppliers()
            }
        } catch (error) {
            toast.error('Failed to delete supplier')
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">🏭 Supplier Management</h1>
                        <p className="mt-2 text-blue-100">Manage your suppliers and enable auto-restocking</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingSupplier(null)
                            setShowModal(true)
                        }}
                        className="flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold shadow-lg transition-all"
                    >
                        <FiPlus />
                        <span>Add Supplier</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    icon={<FiUsers />}
                    label="Total Suppliers"
                    value={suppliers.length}
                    color="blue"
                />
                <StatCard
                    icon={<FiZap />}
                    label="Auto-Restock Enabled"
                    value={suppliers.filter(s => s.autoRestock?.enabled).length}
                    color="green"
                />
                <StatCard
                    icon={<FiPackage />}
                    label="Products Supplied"
                    value={suppliers.reduce((sum, s) => sum + (s.products?.length || 0), 0)}
                    color="purple"
                />
                <StatCard
                    icon={<FiStar />}
                    label="Avg Rating"
                    value={(suppliers.reduce((sum, s) => sum + (s.metrics?.rating || 0), 0) / suppliers.length || 0).toFixed(1)}
                    color="yellow"
                />
            </div>

            {/* Suppliers List */}
            {suppliers.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <FiUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Suppliers Yet</h3>
                    <p className="text-gray-600 mb-6">Add your first supplier to enable auto-restocking</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                    >
                        Add First Supplier
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {suppliers.map((supplier) => (
                        <SupplierCard
                            key={supplier._id}
                            supplier={supplier}
                            onEdit={() => {
                                setEditingSupplier(supplier)
                                setShowModal(true)
                            }}
                            onDelete={() => deleteSupplier(supplier._id)}
                        />
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <SupplierModal
                    supplier={editingSupplier}
                    onClose={() => {
                        setShowModal(false)
                        setEditingSupplier(null)
                    }}
                    onSuccess={() => {
                        setShowModal(false)
                        setEditingSupplier(null)
                        fetchSuppliers()
                    }}
                    token={token}
                />
            )}
        </div>
    )
}

function SupplierCard({ supplier, onEdit, onDelete }) {
    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">{supplier.name}</h3>
                    {supplier.companyName && (
                        <p className="text-sm text-gray-600">{supplier.companyName}</p>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={onEdit}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                    >
                        <FiEdit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    >
                        <FiTrash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FiMail className="w-4 h-4" />
                    <span>{supplier.email}</span>
                </div>
                {supplier.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FiPhone className="w-4 h-4" />
                        <span>{supplier.phone}</span>
                    </div>
                )}
                {supplier.address?.city && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FiMapPin className="w-4 h-4" />
                        <span>{supplier.address.city}, {supplier.address.country}</span>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4">
                    <div className="text-center">
                        <p className="text-xs text-gray-500">Products</p>
                        <p className="text-lg font-bold text-gray-900">{supplier.products?.length || 0}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500">Rating</p>
                        <div className="flex items-center space-x-1">
                            <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
                            <p className="text-lg font-bold text-gray-900">{supplier.metrics?.rating || 5}</p>
                        </div>
                    </div>
                </div>
                {supplier.autoRestock?.enabled && (
                    <span className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        <FiZap className="w-3 h-3" />
                        <span>Auto-Restock</span>
                    </span>
                )}
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
        address: {
            street: supplier?.address?.street || '',
            city: supplier?.address?.city || '',
            state: supplier?.address?.state || '',
            country: supplier?.address?.country || '',
            zipCode: supplier?.address?.zipCode || '',
        },
        autoRestock: {
            enabled: supplier?.autoRestock?.enabled || false,
            method: supplier?.autoRestock?.method || 'email',
            apiEndpoint: supplier?.autoRestock?.apiEndpoint || '',
            apiKey: supplier?.autoRestock?.apiKey || '',
        },
        paymentTerms: supplier?.paymentTerms || 'net_30',
    })

    async function handleSubmit(e) {
        e.preventDefault()

        try {
            const url = supplier
                ? `/api/seller/suppliers/${supplier._id}`
                : '/api/seller/suppliers'

            const method = supplier ? 'put' : 'post'

            const res = await axios[method](url, formData, {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (res.data.success) {
                toast.success(supplier ? 'Supplier updated' : 'Supplier added')
                onSuccess()
            }
        } catch (error) {
            toast.error('Failed to save supplier')
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl">
                    <h2 className="text-2xl font-bold">
                        {supplier ? 'Edit Supplier' : 'Add New Supplier'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-900">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Supplier Name *"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Company Name"
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="email"
                                placeholder="Email *"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <input
                                type="tel"
                                placeholder="Phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-900">Address</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Street"
                                value={formData.address.street}
                                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                                className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                placeholder="City"
                                value={formData.address.city}
                                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                placeholder="State"
                                value={formData.address.state}
                                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                placeholder="Country"
                                value={formData.address.country}
                                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, country: e.target.value } })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                placeholder="Zip Code"
                                value={formData.address.zipCode}
                                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, zipCode: e.target.value } })}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Auto-Restock */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-900">Auto-Restock Settings</h3>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={formData.autoRestock.enabled}
                                onChange={(e) => setFormData({ ...formData, autoRestock: { ...formData.autoRestock, enabled: e.target.checked } })}
                                className="w-5 h-5 text-blue-600 rounded"
                            />
                            <span className="text-gray-700">Enable Auto-Restock</span>
                        </label>

                        {formData.autoRestock.enabled && (
                            <div className="space-y-4 pl-7">
                                <select
                                    value={formData.autoRestock.method}
                                    onChange={(e) => setFormData({ ...formData, autoRestock: { ...formData.autoRestock, method: e.target.value } })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="email">Email</option>
                                    <option value="api">API</option>
                                    <option value="manual">Manual</option>
                                </select>

                                {formData.autoRestock.method === 'api' && (
                                    <>
                                        <input
                                            type="url"
                                            placeholder="API Endpoint"
                                            value={formData.autoRestock.apiEndpoint}
                                            onChange={(e) => setFormData({ ...formData, autoRestock: { ...formData.autoRestock, apiEndpoint: e.target.value } })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="API Key"
                                            value={formData.autoRestock.apiKey}
                                            onChange={(e) => setFormData({ ...formData, autoRestock: { ...formData.autoRestock, apiKey: e.target.value } })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Payment Terms */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-900">Payment Terms</h3>
                        <select
                            value={formData.paymentTerms}
                            onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="prepaid">Prepaid</option>
                            <option value="net_30">Net 30</option>
                            <option value="net_60">Net 60</option>
                            <option value="net_90">Net 90</option>
                            <option value="cod">Cash on Delivery</option>
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                        >
                            {supplier ? 'Update' : 'Add'} Supplier
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
        yellow: 'bg-yellow-100 text-yellow-600',
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
