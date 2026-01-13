'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import { toast } from 'react-hot-toast'
import { FiPlus, FiTrash2, FiSearch, FiRefreshCw, FiStar, FiMove } from 'react-icons/fi'
import axios from 'axios'

export default function TodaysBestDealsManagement() {
    const { token } = useAuth()
    const [featuredProducts, setFeaturedProducts] = useState([])
    const [allProducts, setAllProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)

    useEffect(() => {
        if (token) {
            fetchFeaturedProducts()
            fetchAllProducts()
        }
    }, [token])

    const fetchFeaturedProducts = async () => {
        try {
            setLoading(true)
            const response = await axios.get('/api/admin/featured-products?section=todays_best_deals&limit=100', {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            })

            console.log('API Response:', response.data)

            if (response.data.success) {
                // The API returns products array, but we need the FeaturedProduct documents
                // Let's fetch the raw featured products data
                const rawResponse = await axios.get('/api/admin/featured-products/manage?section=todays_best_deals', {
                    headers: { Authorization: `Bearer ${token}` }
                })

                console.log('Raw Response:', rawResponse.data)

                if (rawResponse.data.success && rawResponse.data.featuredProducts) {
                    setFeaturedProducts(rawResponse.data.featuredProducts)
                } else {
                    setFeaturedProducts([])
                }
            }
        } catch (error) {
            console.error('Error fetching featured products:', error)
            console.error('Error details:', error.response?.data)
            toast.error('Failed to load featured products')
            setFeaturedProducts([])
        } finally {
            setLoading(false)
        }
    }

    const fetchAllProducts = async () => {
        try {
            const response = await axios.get('/api/products?limit=100')
            if (response.data.products) {
                setAllProducts(response.data.products)
            }
        } catch (error) {
            console.error('Error fetching products:', error)
        }
    }

    const handleAddProduct = async (productId) => {
        if (!token) return

        try {
            const response = await axios.post(
                '/api/admin/featured-products',
                {
                    productId,
                    section: 'todays_best_deals',
                    order: featuredProducts.length,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )

            if (response.data.success) {
                toast.success('Product added to Today\'s Best Deals!')
                fetchFeaturedProducts()
                setShowAddModal(false)
                setSearchTerm('')
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to add product'
            toast.error(message)
        }
    }

    const handleRemoveProduct = async (featuredProductId) => {
        if (!token) return
        if (!confirm('Remove this product from Today\'s Best Deals?')) return

        try {
            await axios.delete(`/api/admin/featured-products?id=${featuredProductId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            toast.success('Product removed')
            fetchFeaturedProducts()
        } catch (error) {
            toast.error('Failed to remove product')
        }
    }

    const filteredProducts = allProducts.filter(
        (product) =>
            product.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !featuredProducts.some((fp) => fp._id === product._id)
    )

    return (
        <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <FiStar size={18} />
                            </div>
                            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                                Featured Section
                            </span>
                        </div>
                        <h1 className="text-4xl font-semibold text-gray-900 tracking-tighter">
                            Today's Best Deals
                        </h1>
                        <p className="text-gray-500 font-medium mt-1">
                            Manage featured products for the homepage
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchFeaturedProducts}
                            className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
                        >
                            <FiRefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200"
                        >
                            <FiPlus />
                            Add Product
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            Active Products
                        </p>
                        <p className="text-3xl font-bold text-gray-900">{featuredProducts.length}</p>
                    </div>
                </div>

                {/* Featured Products Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                                <div className="h-48 bg-gray-200 rounded-xl mb-4" />
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                <div className="h-4 bg-gray-200 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : featuredProducts.length === 0 ? (
                    <div className="bg-white rounded-2xl p-16 text-center border border-gray-100">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiStar className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No Featured Products Yet
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Start adding products to appear in Today's Best Deals section
                        </p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
                        >
                            <FiPlus /> Add Your First Product
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredProducts.map((featuredProduct, idx) => {
                            const product = featuredProduct.product
                            if (!product) return null
                            
                            return (
                                <div
                                    key={featuredProduct._id}
                                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all group relative"
                                >
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <button
                                            onClick={() => handleRemoveProduct(featuredProduct._id)}
                                            className="p-2 bg-red-50 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-100"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="mb-4">
                                        {product.images && product.images.length > 0 ? (
                                            <img
                                                src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url}
                                                alt={product.name}
                                                className="w-full h-48 object-cover rounded-xl"
                                            />
                                        ) : (
                                            <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                                                <span className="text-gray-400">No Image</span>
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                        {product.name}
                                    </h3>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-blue-600">
                                                ₹{product.pricing?.salePrice || product.pricing?.basePrice || 0}
                                            </p>
                                            {product.pricing?.basePrice && product.pricing?.salePrice && product.pricing.basePrice > product.pricing.salePrice && (
                                                <p className="text-sm text-gray-400 line-through">
                                                    ₹{product.pricing.basePrice}
                                                </p>
                                            )}
                                        </div>
                                        <span className="text-xs font-semibold text-gray-400 uppercase">
                                            #{idx + 1}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Add Product Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">Add Product to Deals</h2>
                                <button
                                    onClick={() => {
                                        setShowAddModal(false)
                                        setSearchTerm('')
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="relative mb-4">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="max-h-96 overflow-y-auto space-y-2">
                                {filteredProducts.length === 0 ? (
                                    <p className="text-center text-gray-500 py-8">
                                        {searchTerm ? 'No products found' : 'All products already added or no products available'}
                                    </p>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <div
                                            key={product._id}
                                            className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
                                            onClick={() => handleAddProduct(product._id)}
                                        >
                                            {product.images && product.images.length > 0 ? (
                                                <img
                                                    src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url}
                                                    alt={product.name}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-200 rounded-lg" />
                                            )}
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">{product.name}</h4>
                                                <p className="text-sm text-gray-500">₹{product.price}</p>
                                            </div>
                                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
                                                Add
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
