'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import { toast } from 'react-hot-toast'
import { FiPlus, FiTrash2, FiEdit2, FiRefreshCw, FiTag } from 'react-icons/fi'
import axios from 'axios'

export default function CouponBannersManagement() {
    const { token } = useAuth()
    const [banners, setBanners] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingBanner, setEditingBanner] = useState(null)

    useEffect(() => {
        if (token) {
            fetchBanners()
        }
    }, [token])

    const fetchBanners = async () => {
        try {
            setLoading(true)
            const response = await axios.get('/api/admin/coupon-banners')
            if (response.data.success) {
                setBanners(response.data.banners)
            }
        } catch (error) {
            console.error('Error fetching banners:', error)
            toast.error('Failed to load banners')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (data) => {
        if (!token) return

        try {
            const response = await axios.post(
                '/api/admin/coupon-banners',
                data,
                { headers: { Authorization: `Bearer ${token}` } }
            )

            if (response.data.success) {
                toast.success(response.data.message)
                fetchBanners()
                setShowModal(false)
                setEditingBanner(null)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save banner')
        }
    }

    const handleDelete = async (id) => {
        if (!token) return
        if (!confirm('Delete this coupon banner?')) return

        try {
            await axios.delete(`/api/admin/coupon-banners?id=${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            toast.success('Banner deleted')
            fetchBanners()
        } catch (error) {
            toast.error('Failed to delete banner')
        }
    }

    const openCreateModal = () => {
        setEditingBanner({
            title: '',
            code: '',
            discount: 300,
            discountType: 'flat',
            backgroundColor: '#92C7CF',
            textColor: '#FFD66B',
            order: banners.length,
            active: true,
            termsAndConditions: 'T&C Apply',
        })
        setShowModal(true)
    }

    const openEditModal = (banner) => {
        setEditingBanner(banner)
        setShowModal(true)
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-yellow-600 flex items-center justify-center text-white shadow-lg shadow-yellow-500/20">
                                <FiTag size={18} />
                            </div>
                            <span className="text-[10px] font-semibold text-yellow-600 uppercase tracking-widest bg-yellow-50 px-3 py-1 rounded-full">
                                Promotional Banners
                            </span>
                        </div>
                        <h1 className="text-4xl font-semibold text-gray-900 tracking-tighter">
                            Coupon Banners
                        </h1>
                        <p className="text-gray-500 font-medium mt-1">
                            Manage promotional coupon banners
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchBanners}
                            className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 transition-all shadow-sm"
                        >
                            <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-all shadow-lg hover:shadow-yellow-200"
                        >
                            <FiPlus />
                            Add Banner
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Total Banners
                        </p>
                        <p className="text-3xl font-bold text-gray-900">{banners.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Active Banners
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                            {banners.filter(b => b.active).length}
                        </p>
                    </div>
                </div>

                {/* Banners List */}
                {loading ? (
                    <div className="grid grid-cols-1 gap-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                                <div className="h-24 bg-gray-200 rounded-xl" />
                            </div>
                        ))}
                    </div>
                ) : banners.length === 0 ? (
                    <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiTag className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No Coupon Banners Yet
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Create your first promotional coupon banner
                        </p>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-all"
                        >
                            <FiPlus /> Add Your First Banner
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {banners.map((banner) => (
                            <div
                                key={banner._id}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all group"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    {/* Banner Preview */}
                                    <div
                                        className="flex-1 h-24 rounded-xl flex items-center justify-between px-8"
                                        style={{ backgroundColor: banner.backgroundColor }}
                                    >
                                        <h3
                                            className="text-2xl font-bold"
                                            style={{ color: banner.textColor }}
                                        >
                                            {banner.title || `${banner.discountType === 'flat' ? 'FLAT ₹' : ''}${banner.discount}${banner.discountType === 'percentage' ? '%' : ''} OFF`}
                                        </h3>
                                        <div
                                            className="px-6 py-2 rounded-lg font-bold text-black"
                                            style={{ backgroundColor: banner.textColor }}
                                        >
                                            {banner.code}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${banner.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {banner.active ? 'Active' : 'Inactive'}
                                        </span>
                                        <button
                                            onClick={() => openEditModal(banner)}
                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                                        >
                                            <FiEdit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(banner._id)}
                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit/Create Modal */}
            {showModal && editingBanner && (
                <BannerModal
                    banner={editingBanner}
                    onSave={handleSave}
                    onClose={() => {
                        setShowModal(false)
                        setEditingBanner(null)
                    }}
                />
            )}
        </div>
    )
}

function BannerModal({ banner, onSave, onClose }) {
    const [formData, setFormData] = useState(banner)

    const handleSubmit = (e) => {
        e.preventDefault()
        onSave(formData)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {banner._id ? 'Edit Banner' : 'Create Banner'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Banner Title (Optional - will auto-generate from discount)
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., FLAT ₹300 OFF"
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-yellow-500"
                        />
                    </div>

                    {/* Code */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Coupon Code *
                        </label>
                        <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            placeholder="e.g., PLANET300"
                            required
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-yellow-500 uppercase"
                        />
                    </div>

                    {/* Discount */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Discount Value *
                            </label>
                            <input
                                type="number"
                                value={formData.discount}
                                onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                                required
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-yellow-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Discount Type *
                            </label>
                            <select
                                value={formData.discountType}
                                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-yellow-500"
                            >
                                <option value="flat">Flat Amount (₹)</option>
                                <option value="percentage">Percentage (%)</option>
                            </select>
                        </div>
                    </div>

                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Background Color
                            </label>
                            <input
                                type="color"
                                value={formData.backgroundColor}
                                onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                                className="w-full h-12 rounded-xl cursor-pointer"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Text Color
                            </label>
                            <input
                                type="color"
                                value={formData.textColor}
                                onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                                className="w-full h-12 rounded-xl cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* T&C */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Terms & Conditions
                        </label>
                        <input
                            type="text"
                            value={formData.termsAndConditions}
                            onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-yellow-500"
                        />
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="active"
                            checked={formData.active}
                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                            className="w-5 h-5 rounded text-yellow-600"
                        />
                        <label htmlFor="active" className="text-sm font-semibold text-gray-700">
                            Active (Show on homepage)
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 font-semibold"
                        >
                            Save Banner
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
