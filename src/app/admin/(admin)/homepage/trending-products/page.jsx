'use client'
import { useState, useEffect } from 'react'
import { FiTrendingUp, FiPlus, FiTrash2, FiSearch, FiSave, FiX, FiAlertCircle } from 'react-icons/fi'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'

export default function TrendingProductsAdmin() {
    const { token } = useAuth()
    const [trendingProducts, setTrendingProducts] = useState([])
    const [allProducts, setAllProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [priority, setPriority] = useState(1)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (token) {
            fetchTrendingProducts()
            fetchAllProducts()
        }
    }, [token])

    const fetchTrendingProducts = async () => {
        try {
            const response = await axios.get('/api/trending-products')
            if (response.data.success) {
                setTrendingProducts(response.data.products)
            }
        } catch (error) {
            console.error('Error fetching trending products:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchAllProducts = async () => {
        try {
            const response = await axios.get('/api/admin/products', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (response.data.success) {
                setAllProducts(response.data.products)
            }
        } catch (error) {
            console.error('Error fetching products:', error)
        }
    }

    const handleAddToTrending = async () => {
        if (!selectedProduct) return

        setSaving(true)
        try {
            const response = await axios.post('/api/trending-products', {
                productId: selectedProduct._id,
                priority: priority
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.data.success) {
                await fetchTrendingProducts()
                setShowAddModal(false)
                setSelectedProduct(null)
                setPriority(1)
                alert('Product added to trending!')
            }
        } catch (error) {
            console.error('Error adding product:', error)
            alert('Error adding product to trending')
        } finally {
            setSaving(false)
        }
    }

    const handleRemoveFromTrending = async (productId) => {
        if (!confirm('Remove this product from trending?')) return

        try {
            const response = await axios.delete(`/api/trending-products?productId=${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (response.data.success) {
                await fetchTrendingProducts()
                alert('Product removed from trending!')
            }
        } catch (error) {
            console.error('Error removing product:', error)
            alert('Error removing product from trending')
        }
    }

    const filteredProducts = allProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !trendingProducts.some(tp => tp._id === product._id)
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <FiTrendingUp className="text-purple-600" />
                            Trending Products
                        </h1>
                        <p className="text-gray-600 mt-2">Manage products displayed in the "Trending Now" section</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                    >
                        <FiPlus className="w-5 h-5" />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Info Alert */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-semibold text-blue-900 mb-1">How it works</h3>
                    <p className="text-sm text-blue-700">
                        Products are displayed in order of priority (lower number = higher priority).
                        Maximum 8 products will be shown on the homepage.
                    </p>
                </div>
            </div>

            {/* Trending Products List */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                    <h2 className="text-xl font-bold text-gray-900">
                        Current Trending Products ({trendingProducts.length})
                    </h2>
                </div>

                {trendingProducts.length === 0 ? (
                    <div className="p-12 text-center">
                        <FiTrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No trending products yet</p>
                        <p className="text-gray-400 text-sm mt-2">Click "Add Product" to get started</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {trendingProducts.map((product, index) => (
                            <div key={product._id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-6">
                                    {/* Priority Badge */}
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center font-bold text-lg">
                                            {index + 1}
                                        </div>
                                    </div>

                                    {/* Product Image */}
                                    <div className="flex-shrink-0">
                                        <img
                                            src={product.image || product.images?.[0]?.url || '/images/placeholder-product.jpg'}
                                            alt={product.name}
                                            className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200"
                                        />
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span className="font-semibold text-purple-600">
                                                ₹{product.price?.toLocaleString()}
                                            </span>
                                            {product.originalPrice && (
                                                <span className="line-through text-gray-400">
                                                    ₹{product.originalPrice?.toLocaleString()}
                                                </span>
                                            )}
                                            {product.discount > 0 && (
                                                <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                                                    {product.discount}% OFF
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <button
                                        onClick={() => handleRemoveFromTrending(product._id)}
                                        className="flex-shrink-0 p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                        title="Remove from trending"
                                    >
                                        <FiTrash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Product Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">Add Product to Trending</h2>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 hover:bg-white rounded-lg transition-colors"
                                >
                                    <FiX className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                            {/* Search */}
                            <div className="mb-6">
                                <div className="relative">
                                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Priority Input */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Priority (lower = shows first)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={priority}
                                    onChange={(e) => setPriority(parseInt(e.target.value))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            {/* Products List */}
                            <div className="space-y-3">
                                {filteredProducts.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">No products found</p>
                                ) : (
                                    filteredProducts.slice(0, 20).map((product) => (
                                        <div
                                            key={product._id}
                                            onClick={() => setSelectedProduct(product)}
                                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedProduct?._id === product._id
                                                    ? 'border-purple-600 bg-purple-50'
                                                    : 'border-gray-200 hover:border-purple-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={product.images?.[0]?.url || product.image || '/images/placeholder-product.jpg'}
                                                    alt={product.name}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-900 truncate">
                                                        {product.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        ₹{ (product.pricing?.salePrice || product.pricing?.basePrice)?.toLocaleString() }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-6 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddToTrending}
                                disabled={!selectedProduct || saving}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Adding...</span>
                                    </>
                                ) : (
                                    <>
                                        <FiSave className="w-5 h-5" />
                                        <span>Add to Trending</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
