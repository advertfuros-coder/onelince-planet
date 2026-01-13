'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import { toast } from 'react-hot-toast'
import { FiPlus, FiTrash2, FiEdit2, FiRefreshCw, FiPercent, FiSearch, FiX } from 'react-icons/fi'
import axios from 'axios'

export default function StealDealsManagement() {
    const { token } = useAuth()
    const [deals, setDeals] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingDeal, setEditingDeal] = useState(null)

    useEffect(() => {
        if (token) {
            fetchDeals()
        }
    }, [token])

    const fetchDeals = async () => {
        try {
            setLoading(true)
            const response = await axios.get('/api/admin/steal-deals')
            if (response.data.success) {
                // Fetch the full deal objects for admin (we need another endpoint for this)
                const adminResponse = await axios.get('/api/admin/steal-deals/manage', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (adminResponse.data.success) {
                    setDeals(adminResponse.data.deals)
                }
            }
        } catch (error) {
            console.error('Error fetching deals:', error)
            toast.error('Failed to load deals')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (data) => {
        if (!token) return

        try {
            const response = await axios.post(
                '/api/admin/steal-deals',
                data,
                { headers: { Authorization: `Bearer ${token}` } }
            )

            if (response.data.success) {
                toast.success(response.data.message)
                fetchDeals()
                setShowModal(false)
                setEditingDeal(null)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save deal')
        }
    }

    const handleDelete = async (id) => {
        if (!token) return
        if (!confirm('Delete this steal deal?')) return

        try {
            await axios.delete(`/api/admin/steal-deals?id=${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            toast.success('Deal deleted')
            fetchDeals()
        } catch (error) {
            toast.error('Failed to delete deal')
        }
    }

    const openCreateModal = () => {
        setEditingDeal({
            productId: '',
            stealPrice: 0,
            originalPrice: 0,
            quantity: '1 unit',
            limitedStock: false,
            stockRemaining: null,
            order: deals.length,
            active: true,
        })
        setShowModal(true)
    }

    const openEditModal = (deal) => {
        setEditingDeal({
            _id: deal._id,
            productId: deal.product?._id,
            stealPrice: deal.stealPrice,
            originalPrice: deal.originalPrice,
            quantity: deal.quantity,
            limitedStock: deal.limitedStock || false,
            stockRemaining: deal.stockRemaining,
            order: deal.order,
            active: deal.active,
        })
        setShowModal(true)
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                                <FiPercent size={18} />
                            </div>
                            <span className="text-[10px] font-semibold text-purple-600 uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-full">
                                Limited Time Offers
                            </span>
                        </div>
                        <h1 className="text-4xl font-semibold text-gray-900 tracking-tighter">
                            Steal Deals
                        </h1>
                        <p className="text-gray-500 font-medium mt-1">
                            Manage massive price drop offers
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchDeals}
                            className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all shadow-sm"
                        >
                            <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-200"
                        >
                            <FiPlus />
                            Add Steal Deal
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Total Deals
                        </p>
                        <p className="text-3xl font-bold text-gray-900">{deals.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Active Deals
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                            {deals.filter(d => d.active).length}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Avg. Discount
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                            {deals.length > 0 ? Math.round(deals.reduce((sum, d) => sum + d.discountPercentage, 0) / deals.length) : 0}%
                        </p>
                    </div>
                </div>

                {/* Deals List */}
                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                                <div className="h-24 bg-gray-200 rounded-xl" />
                            </div>
                        ))}
                    </div>
                ) : deals.length === 0 ? (
                    <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiPercent className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No Steal Deals Yet
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Create your first massive price drop offer
                        </p>
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all"
                        >
                            <FiPlus /> Add Your First Deal
                        </button>
                    </div>
                ) : (
                    <div className="grid bg-red-500 grid-cols-2 lg:grid-cols-3 gap-4">
                        {deals.map((deal) => (
                            <div
                                key={deal._id}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all group"
                            >
                                <div className="p-6">
                                    <div className="flex items-start gap-6">
                                        {/* Product Image */}
                                        {deal.product?.images?.[0] && (
                                            <div className="relative flex-shrink-0">
                                                <img
                                                    src={typeof deal.product.images[0] === 'string' ? deal.product.images[0] : deal.product.images[0].url}
                                                    alt={deal.product.name}
                                                    className="w-32 h-32 object-cover rounded-2xl shadow-md"
                                                />
                                                {/* Discount Badge on Image */}
                                                <div className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-pink-600 text-white px-3 py-1.5 rounded-full shadow-lg">
                                                    <p className="text-sm font-bold">
                                                        {Math.round(((deal.originalPrice - deal.stealPrice) / deal.originalPrice) * 100)}% OFF
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Product Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                                                        {deal.product?.name || 'Unknown Product'}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                            {deal.quantity}
                                                        </span>
                                                    </p>
                                                </div>

                                                {/* Status & Actions */}
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                                                        deal.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {deal.active ? '● Active' : '○ Inactive'}
                                                    </span>
                                                    <button
                                                        onClick={() => openEditModal(deal)}
                                                        className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                                                    >
                                                        <FiEdit2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(deal._id)}
                                                        className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                                                    >
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Pricing Section */}
                                            <div className="flex items-center gap-6 mb-3">
                                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 px-6 py-3 rounded-xl border border-purple-200">
                                                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-0.5">Steal Price</p>
                                                    <p className="text-3xl font-bold text-purple-700">₹{deal.stealPrice}</p>
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Original Price</p>
                                                    <p className="text-2xl font-bold text-gray-400 line-through">₹{deal.originalPrice}</p>
                                                </div>
                                                <div className="flex-1"></div>
                                                {deal.limitedStock && deal.stockRemaining !== null && (
                                                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 px-4 py-3 rounded-xl border border-orange-200">
                                                        <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-0.5">Stock Left</p>
                                                        <p className="text-2xl font-bold text-orange-700">{deal.stockRemaining}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Additional Info */}
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                    </svg>
                                                    Save ₹{deal.originalPrice - deal.stealPrice}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                    </svg>
                                                    Order #{deal.order}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit/Create Modal */}
            {showModal && editingDeal && (
                <DealModal
                    deal={editingDeal}
                    onSave={handleSave}
                    onClose={() => {
                        setShowModal(false)
                        setEditingDeal(null)
                    }}
                    token={token}
                />
            )}
        </div>
    )
}

function DealModal({ deal, onSave, onClose, token }) {
    const [formData, setFormData] = useState(deal)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [searching, setSearching] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)

    useEffect(() => {
        if (deal.productId) {
            // If editing, fetch product details
            fetchProductDetails(deal.productId)
        }
    }, [])

    const fetchProductDetails = async (productId) => {
        try {
            const response = await axios.get(`/api/products/${productId}`)
            if (response.data.product) {
                setSelectedProduct(response.data.product)
            }
        } catch (error) {
            console.error('Error fetching product:', error)
        }
    }

    const searchProducts = async (query) => {
        if (!query.trim()) {
            setSearchResults([])
            return
        }

        setSearching(true)
        try {
            const response = await axios.get(`/api/products?search=${query}&limit=10`)
            if (response.data.products) {
                setSearchResults(response.data.products)
            }
        } catch (error) {
            console.error('Error searching products:', error)
        } finally {
            setSearching(false)
        }
    }

    const selectProduct = (product) => {
        setSelectedProduct(product)
        setFormData({
            ...formData,
            productId: product._id,
            originalPrice: product.pricing?.basePrice || 0,
        })
        setSearchQuery('')
        setSearchResults([])
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!formData.productId) {
            toast.error('Please select a product')
            return
        }
        onSave(formData)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {deal._id ? 'Edit Steal Deal' : 'Create Steal Deal'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <FiX size={20} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Product Selection */}
                    {!deal._id && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Select Product *
                            </label>
                            {selectedProduct ? (
                                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
                                    {selectedProduct.images?.[0] && (
                                        <img
                                            src={typeof selectedProduct.images[0] === 'string' ? selectedProduct.images[0] : selectedProduct.images[0].url}
                                            alt={selectedProduct.name}
                                            className="w-12 h-12 object-cover rounded-lg"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">{selectedProduct.name}</p>
                                        <p className="text-sm text-gray-500">
                                            ₹{selectedProduct.pricing?.basePrice || 0}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedProduct(null)
                                            setFormData({ ...formData, productId: '', originalPrice: 0 })
                                        }}
                                        className="p-2 hover:bg-white rounded-lg"
                                    >
                                        <FiX size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value)
                                            searchProducts(e.target.value)
                                        }}
                                        placeholder="Search for products..."
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-purple-500"
                                    />
                                    {searchResults.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-10">
                                            {searchResults.map((product) => (
                                                <button
                                                    key={product._id}
                                                    type="button"
                                                    onClick={() => selectProduct(product)}
                                                    className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 w-full text-left"
                                                >
                                                    {product.images?.[0] && (
                                                        <img
                                                            src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url}
                                                            alt={product.name}
                                                            className="w-10 h-10 object-cover rounded-lg"
                                                        />
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{product.name}</p>
                                                        <p className="text-sm text-gray-500">₹{product.pricing?.basePrice || 0}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pricing */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Original Price *
                            </label>
                            <input
                                type="number"
                                value={formData.originalPrice}
                                onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                                required
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Steal Price *
                            </label>
                            <input
                                type="number"
                                value={formData.stealPrice}
                                onChange={(e) => setFormData({ ...formData, stealPrice: Number(e.target.value) })}
                                required
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    {/* Quantity */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Quantity Display
                        </label>
                        <input
                            type="text"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            placeholder="e.g., 1 kg, 40 g, 1 unit"
                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Limited Stock (Optional) */}
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <input
                                type="checkbox"
                                id="limitedStock"
                                checked={formData.limitedStock}
                                onChange={(e) => setFormData({ ...formData, limitedStock: e.target.checked })}
                                className="w-5 h-5 rounded text-purple-600"
                            />
                            <label htmlFor="limitedStock" className="text-sm font-semibold text-gray-700">
                                Limited Stock (Optional - shows stock counter)
                            </label>
                        </div>
                        {formData.limitedStock && (
                            <input
                                type="number"
                                value={formData.stockRemaining || ''}
                                onChange={(e) => setFormData({ ...formData, stockRemaining: Number(e.target.value) || null })}
                                placeholder="Enter stock remaining"
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-purple-500"
                            />
                        )}
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="active"
                            checked={formData.active}
                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                            className="w-5 h-5 rounded text-purple-600"
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
                            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-semibold"
                        >
                            Save Deal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
