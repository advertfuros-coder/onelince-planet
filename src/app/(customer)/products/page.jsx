'use client'
import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import ProductFilters from '@/components/customer/ProductFilters'
import ProductCard from '@/components/customer/ProductCard'
import { useCurrency } from '@/lib/context/CurrencyContext'
import { useCart } from '@/lib/context/CartContext'
import { FiChevronRight, FiChevronLeft, FiFilter, FiX } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'

function ProductsContent() {
    const searchParams = useSearchParams()
    const { country } = useCurrency()
    const { addToCart } = useCart()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [totalPages, setTotalPages] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [wishlist, setWishlist] = useState([])
    const [showMobileFilters, setShowMobileFilters] = useState(false)

    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        brand: searchParams.get('brand') || '',
        rating: searchParams.get('rating') || '',
        verified: false,
        fastDelivery: false,
        sortBy: searchParams.get('sortBy') || 'relevance',
        order: searchParams.get('order') || 'desc'
    })

    useEffect(() => {
        fetchProducts()
    }, [filters, currentPage, country])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()

            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value)
            })

            params.append('country', country)
            params.append('page', currentPage)
            params.append('limit', 20)

            const response = await axios.get(`/api/products?${params.toString()}`)

            if (response.data.success) {
                setProducts(response.data.products || [])
                setTotalPages(response.data.totalPages || 1)
            }
        } catch (error) {
            console.error('Failed to fetch products:', error)
            setProducts([])
        } finally {
            setLoading(false)
        }
    }

    const handlePageChange = (page) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const toggleWishlist = (productId) => {
        setWishlist(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        )
        const isWishlisted = wishlist.includes(productId)
        toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
    }

    const handleAddToCart = (product) => {
        addToCart(product, 1)
    }

    const generatePageNumbers = () => {
        const pages = []
        const maxVisible = 5

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i)
                }
                pages.push('...')
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1)
                pages.push('...')
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i)
                }
            } else {
                pages.push(1)
                pages.push('...')
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i)
                }
                pages.push('...')
                pages.push(totalPages)
            }
        }
        return pages
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-8xl mx-auto md:px-6 px-4 py-6">
                {/* Breadcrumbs */}
                {/* <nav className="flex items-center gap-2 text-[13px] text-gray-500 mb-8 font-medium">
                    <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                    <FiChevronRight className="w-3.5 h-3.5" />
                    <span className="text-[#1a1a1b] font-semibold">Products</span>
                    {filters.category && (
                        <>
                            <FiChevronRight className="w-3.5 h-3.5" />
                            <span className="text-[#1a1a1b] font-semibold capitalize">{filters.category}</span>
                        </>
                    )}
                </nav> */}

                <div className="flex gap-10">
                    {/* Left Sidebar */}
                    <aside className="w-[280px] flex-shrink-0 hidden lg:block">
                        <ProductFilters filters={filters} onFiltersChange={setFilters} />
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        {/* Results Header */}
                        <div className="flex flex-col gap-6 mb-8">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h1 className="text-xl font-semibold text-[#1a1a1b] leading-tight tracking-tight">
                                        {filters.search ? `Search results for '${filters.search}'` :
                                            filters.category ? `${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)} Products` :
                                                'All Products'}
                                    </h1>
                                    {!loading && (
                                        <p className="text-[14px] font-semibold text-gray-400">
                                            Showing {products.length} of {totalPages * 20} results
                                        </p>
                                    )}
                                </div>

                                <div className="flex md:block hidden items-center gap-3">
                                    {/* Sort Dropdown */}
                                    <select
                                        value={`${filters.sortBy}:${filters.order}`}
                                        onChange={(e) => {
                                            const [sortBy, order] = e.target.value.split(':')
                                            setFilters(prev => ({ ...prev, sortBy, order }))
                                        }}
                                        className="px-5 py-2.5 bg-[#F8F9FA] rounded-[14px] border border-gray-100 font-semibold text-[14px] text-[#1a1a1b] hover:border-gray-300 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="relevance:desc">Sort by: Relevance</option>
                                        <option value="createdAt:desc">Newest First</option>
                                        <option value="pricing.salePrice:asc">Price: Low to High</option>
                                        <option value="pricing.salePrice:desc">Price: High to Low</option>
                                        <option value="ratings.average:desc">Customer Rating</option>
                                        <option value="name:asc">Name: A to Z</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {[...Array(12)].map((_, index) => (
                                        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                            <div className="animate-pulse">
                                                <div className="bg-gray-300 h-48 w-full"></div>
                                                <div className="p-4 space-y-3">
                                                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                                                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                                                    <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                                                    <div className="h-8 bg-gray-300 rounded w-full"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && (!products || products.length === 0) && (
                            <div className="text-center py-16">
                                <div className="w-32 h-32 mx-auto mb-6 text-gray-400">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v1M7 8h10l-1 8H8l-1-8z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                    We couldn't find any products matching your criteria. Try adjusting your search or filter options.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button variant="outline" onClick={() => window.location.href = '/products'}>
                                        Browse All Products
                                    </Button>
                                    <Button onClick={() => window.location.href = '/'}>
                                        Back to Home
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Products Grid */}
                        {!loading && products && products.length > 0 && (
                            <div className="space-y-2">
                                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap">
                                    {products.map((product) => (
                                        <ProductCard
                                            key={product._id}
                                            product={product}
                                            isWishlisted={wishlist.includes(product._id)}
                                            onToggleWishlist={toggleWishlist}
                                            onAddToCart={handleAddToCart}
                                        />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-200">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <span>Page {currentPage} of {totalPages}</span>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <FiChevronLeft className="w-4 h-4 mr-1" />
                                                Previous
                                            </button>

                                            <div className="hidden sm:flex space-x-1">
                                                {generatePageNumbers().map((page, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => typeof page === 'number' && handlePageChange(page)}
                                                        disabled={page === '...' || page === currentPage}
                                                        className={`px-3 py-2 text-sm font-medium border transition-colors ${page === currentPage
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : page === '...'
                                                                ? 'bg-white text-gray-400 border-gray-300 cursor-default'
                                                                : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Next
                                                <FiChevronRight className="w-4 h-4 ml-1" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>

                {/* Mobile Filter Button - Bottom Right (Flipkart style) */}
                <button
                    onClick={() => setShowMobileFilters(true)}
                    className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40 hover:bg-blue-700 transition-all active:scale-95"
                >
                    <FiFilter className="w-6 h-6" />
                </button>

                {/* Mobile Filter Modal */}
                <AnimatePresence>
                    {showMobileFilters && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowMobileFilters(false)}
                                className="lg:hidden fixed inset-0 bg-black/50 z-50"
                            />

                            {/* Bottom Sheet */}
                            <motion.div
                                initial={{ y: '100%' }}
                                animate={{ y: 0 }}
                                exit={{ y: '100%' }}
                                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                                className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[85vh] flex flex-col"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-900">Sort & Filter</h2>
                                    <button
                                        onClick={() => setShowMobileFilters(false)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        <FiX className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>

                                {/* Two Column Layout - Sort & Filter */}
                                <div className="flex flex-1 overflow-hidden">
                                    {/* Left Column - Sort */}
                                    <div className="w-2/5 border-r border-gray-200 overflow-y-auto">
                                        <div className="p-4">
                                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Sort By</h3>
                                            <div className="space-y-1">
                                                {[
                                                    { label: 'Relevance', value: 'relevance:desc' },
                                                    { label: 'Newest First', value: 'createdAt:desc' },
                                                    { label: 'Price: Low to High', value: 'pricing.salePrice:asc' },
                                                    { label: 'Price: High to Low', value: 'pricing.salePrice:desc' },
                                                    { label: 'Customer Rating', value: 'ratings.average:desc' },
                                                    { label: 'Name: A to Z', value: 'name:asc' },
                                                ].map((option) => {
                                                    const isSelected = `${filters.sortBy}:${filters.order}` === option.value
                                                    return (
                                                        <button
                                                            key={option.value}
                                                            onClick={() => {
                                                                const [sortBy, order] = option.value.split(':')
                                                                setFilters(prev => ({ ...prev, sortBy, order }))
                                                            }}
                                                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isSelected
                                                                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                                                : 'text-gray-700 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {option.label}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column - Filters */}
                                    <div className="flex-1 overflow-y-auto">
                                        <div className="p-4">
                                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Filters</h3>
                                            <ProductFilters filters={filters} onFiltersChange={setFilters} />
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="p-4 border-t border-gray-200 flex gap-3">
                                    <button
                                        onClick={() => {
                                            setFilters({
                                                search: searchParams.get('search') || '',
                                                category: searchParams.get('category') || '',
                                                minPrice: '',
                                                maxPrice: '',
                                                brand: '',
                                                rating: '',
                                                verified: false,
                                                fastDelivery: false,
                                                sortBy: 'relevance',
                                                order: 'desc'
                                            })
                                        }}
                                        className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all"
                                    >
                                        Clear All
                                    </button>
                                    <button
                                        onClick={() => setShowMobileFilters(false)}
                                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default function ProductsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading products...</p>
                </div>
            </div>
        }>
            <ProductsContent />
        </Suspense>
    )
}

