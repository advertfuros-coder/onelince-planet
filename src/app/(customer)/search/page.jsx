'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import ProductFilters from '@/components/customer/ProductFilters'
import ProductCard from '@/components/customer/ProductCard'
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { useCart } from '@/lib/context/CartContext'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const { addToCart } = useCart()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
  })
  const [wishlist, setWishlist] = useState([])

  const [filters, setFilters] = useState({
    search: searchParams.get('q') || searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    brand: searchParams.get('brand') || '',
    rating: searchParams.get('rating') || '',
    verified: searchParams.get('verified') === 'true',
    fastDelivery: searchParams.get('fastDelivery') === 'true',
    inStock: searchParams.get('inStock') === 'true',
    sortBy: searchParams.get('sortBy') || 'relevance',
    order: searchParams.get('order') || 'desc'
  })

  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchSearchResults()
  }, [filters, currentPage])

  const fetchSearchResults = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      // Add all filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          if (key === 'search') {
            params.append('q', value)
          } else {
            params.append(key, value)
          }
        }
      })

      params.append('page', currentPage)
      params.append('limit', 20)

      const response = await axios.get(`/api/search?${params.toString()}`)

      if (response.data.success) {
        setProducts(response.data.products || [])
        setPagination(response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalProducts: 0,
        })
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Failed to load search results')
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
    const { currentPage, totalPages } = pagination
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
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[13px] text-gray-500 mb-8 font-medium">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <FiChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#1a1a1b] font-semibold">Search Results</span>
          {filters.category && (
            <>
              <FiChevronRight className="w-3.5 h-3.5" />
              <span className="text-[#1a1a1b] font-semibold capitalize">{filters.category}</span>
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
                  <h1 className="text-[34px] font-semibold text-[#1a1a1b] leading-tight tracking-tight">
                    {filters.search ? `Search results for '${filters.search}'` : 'All Products'}
                  </h1>
                  {!loading && (
                    <p className="text-[14px] font-semibold text-gray-400">
                      Showing {pagination.startIndex || 1}-{pagination.endIndex || 0} of {pagination.totalProducts || 0} results
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
                    className="px-5 py-2.5 bg-[#F8F9FA] rounded-[14px] border border-gray-100 font-semibold text-[14px] text-[#1a1a1b] hover:border-gray-300 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="relevance:desc">Sort by: Relevance</option>
                    <option value="newest:desc">Newest First</option>
                    <option value="price:asc">Price: Low to High</option>
                    <option value="price:desc">Price: High to Low</option>
                    <option value="rating:desc">Customer Rating</option>
                    <option value="popular:desc">Most Popular</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(12)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <div className="animate-pulse">
                        <div className="bg-gray-300 h-48 w-full"></div>
                        <div className="p-4 space-y-3">
                          <div className="h-3 bg-gray-300 rounded w-16"></div>
                          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                          <div className="h-6 bg-gray-300 rounded w-1/3"></div>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  We couldn't find any products matching "{filters.search}". Try adjusting your search or filters.
                </p>
                <Link
                  href="/products"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all"
                >
                  Browse All Products
                </Link>
              </div>
            )}

            {/* Product Grid */}
            {!loading && products && products.length > 0 && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
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
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 py-8">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="p-2 bg-[#F8F9FA] rounded-full text-gray-400 hover:text-blue-600 transition-colors border border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiChevronLeft className="w-5 h-5" />
                    </button>

                    {generatePageNumbers().map((pageNum, index) => (
                      <button
                        key={index}
                        onClick={() => typeof pageNum === 'number' && handlePageChange(pageNum)}
                        disabled={pageNum === '...' || pageNum === pagination.currentPage}
                        className={`w-10 h-10 flex items-center justify-center rounded-full font-semibold text-[14px] transition-all ${pageNum === pagination.currentPage
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                            : pageNum === '...'
                              ? 'bg-transparent text-gray-400 cursor-default'
                              : 'bg-transparent text-gray-500 hover:bg-[#F8F9FA]'
                          }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="p-2 bg-[#F8F9FA] rounded-full text-gray-400 hover:text-blue-600 transition-colors border border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
