'use client'
import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import ProductFilters from '@/components/customer/ProductFilters'
import ProductGrid from '@/components/customer/ProductGrid'
import { useCurrency } from '@/lib/context/CurrencyContext'
import { FiChevronRight } from 'react-icons/fi'
import Link from 'next/link'

function ProductsContent() {
    const searchParams = useSearchParams()
    const { country } = useCurrency()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [totalPages, setTotalPages] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)

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
    }, [filters, currentPage, country]) // Re-fetch when country changes

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()

            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value)
            })

            // Add country filter
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

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[1440px] mx-auto px-6 py-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-[13px] text-gray-500 mb-8 font-medium">
                    <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
                    <FiChevronRight className="w-3.5 h-3.5" />
                    <span className="text-[#1a1a1b] font-bold">Products</span>
                    {filters.category && (
                        <>
                            <FiChevronRight className="w-3.5 h-3.5" />
                            <span className="text-[#1a1a1b] font-bold capitalize">{filters.category}</span>
                        </>
                    )}
                </nav>

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
                                    <h1 className="text-[34px] font-black text-[#1a1a1b] leading-tight tracking-tight">
                                        {filters.search ? `Search results for '${filters.search}'` :
                                            filters.category ? `${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)} Products` :
                                                'All Products'}
                                    </h1>
                                    {!loading && (
                                        <p className="text-[14px] font-bold text-gray-400">
                                            Showing {products.length} of {totalPages * 20} results
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Sort Dropdown */}
                                    <select
                                        value={`${filters.sortBy}:${filters.order}`}
                                        onChange={(e) => {
                                            const [sortBy, order] = e.target.value.split(':')
                                            setFilters(prev => ({ ...prev, sortBy, order }))
                                        }}
                                        className="px-5 py-2.5 bg-[#F8F9FA] rounded-[14px] border border-gray-100 font-bold text-[14px] text-[#1a1a1b] hover:border-gray-300 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                        {/* Product Grid */}
                        <ProductGrid
                            products={products}
                            loading={loading}
                            totalPages={totalPages}
                            currentPage={currentPage}
                            onPageChange={handlePageChange}
                        />
                    </main>
                </div>
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

