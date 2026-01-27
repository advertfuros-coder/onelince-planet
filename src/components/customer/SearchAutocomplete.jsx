// components/customer/SearchAutocomplete.jsx
'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FiSearch, FiTrendingUp, FiPackage, FiTag } from 'react-icons/fi'
import { useCurrency } from '@/lib/context/CurrencyContext'
import { createProductUrl } from '@/lib/utils/productUrl'
import axios from 'axios'
import Image from 'next/image'

export default function SearchAutocomplete({ onClose }) {
    const router = useRouter()
    const { formatPrice } = useCurrency()
    const [query, setQuery] = useState('')
    const [suggestions, setSuggestions] = useState({ categories: [], products: [], total: 0 })
    const [loading, setLoading] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const inputRef = useRef(null)
    const dropdownRef = useRef(null)

    // Debounced search
    useEffect(() => {
        if (query.length < 2) {
            setSuggestions({ categories: [], products: [], total: 0 })
            setShowSuggestions(false)
            return
        }

        const timer = setTimeout(() => {
            fetchSuggestions(query)
        }, 300) // 300ms debounce

        return () => clearTimeout(timer)
    }, [query])

    // Fetch suggestions from API
    const fetchSuggestions = async (searchQuery) => {
        try {
            setLoading(true)
            const response = await axios.get(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=10`)

            if (response.data.success) {
                setSuggestions(response.data.suggestions)
                setShowSuggestions(true)
            }
        } catch (error) {
            console.error('Failed to fetch suggestions:', error)
        } finally {
            setLoading(false)
        }
    }

    // Handle search submit
    const handleSearch = (e) => {
        e?.preventDefault()
        if (query.trim()) {
            router.push(`/products?search=${encodeURIComponent(query.trim())}`)
            setShowSuggestions(false)
            onClose?.()
        }
    }

    // Handle category click
    const handleCategoryClick = (category) => {
        router.push(`/products?category=${category.slug}`)
        setShowSuggestions(false)
        onClose?.()
    }

    // Handle product click
    const handleProductClick = (product) => {
        router.push(createProductUrl(product))
        setShowSuggestions(false)
        onClose?.()
    }

    // Keyboard navigation
    const handleKeyDown = (e) => {
        const allItems = [...suggestions.categories, ...suggestions.products]

        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex(prev => Math.min(prev + 1, allItems.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex(prev => Math.max(prev - 1, -1))
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (selectedIndex >= 0 && selectedIndex < allItems.length) {
                const item = allItems[selectedIndex]
                if (item.type === 'category') {
                    handleCategoryClick(item)
                } else {
                    handleProductClick(item)
                }
            } else {
                handleSearch(e)
            }
        } else if (e.key === 'Escape') {
            setShowSuggestions(false)
            onClose?.()
        }
    }

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowSuggestions(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="relative shadow-lg w-full" ref={dropdownRef}>
            {/* Search Input */}
            <form onSubmit={handleSearch} className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                    placeholder="Search for products, categories..."
                    className="w-full px-4 py-3 pl-12 pr-4 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    autoComplete="off"
                />
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                {loading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.total > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-[500px] overflow-y-auto">
                    {/* Categories Section */}
                    {suggestions.categories.length > 0 && (
                        <div className="p-2 border-b border-gray-100">
                            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <FiTag className="w-3.5 h-3.5" />
                                Categories
                            </div>
                            {suggestions.categories.map((category, index) => (
                                <button
                                    key={category.id}
                                    onClick={() => handleCategoryClick(category)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${selectedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="text-2xl">{category.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-gray-900 truncate">{category.name}</p>
                                        {category.productCount > 0 && (
                                            <p className="text-xs text-gray-500">{category.productCount} products</p>
                                        )}
                                    </div>
                                    <FiTrendingUp className="w-4 h-4 text-gray-400" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Products Section */}
                    {suggestions.products.length > 0 && (
                        <div className="p-2">
                            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <FiPackage className="w-3.5 h-3.5" />
                                Products
                            </div>
                            {suggestions.products.map((product, index) => {
                                const itemIndex = suggestions.categories.length + index
                                const isVariant = !!product.variantSku
                                return (
                                    <button
                                        key={product.id}
                                        onClick={() => handleProductClick(product)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${selectedIndex === itemIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        {/* Product Image */}
                                        <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden relative">
                                            {product.image ? (
                                                <Image
                                                    src={product.image}
                                                    alt={product.name}
                                                    fill
                                                    className="object-contain"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <FiPackage className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-sm text-gray-900 truncate">{product.name}</p>
                                                {isVariant && (
                                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-semibold rounded-full whitespace-nowrap">
                                                        Variant
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-xs font-semibold text-blue-600">
                                                    {formatPrice(product.price)}
                                                </p>
                                                {product.rating > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-xs text-yellow-500">★</span>
                                                        <span className="text-xs text-gray-500">{product.rating.toFixed(1)}</span>
                                                    </div>
                                                )}
                                                {isVariant && product.stock !== undefined && (
                                                    <span className={`text-[10px] font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {/* View All Results */}
                    <div className="border-t border-gray-100 p-2">
                        <button
                            onClick={handleSearch}
                            className="w-full px-3 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <FiSearch className="w-4 h-4" />
                            View all results for "{query}"
                        </button>
                    </div>
                </div>
            )}

            {/* No Results */}
            {showSuggestions && !loading && query.length >= 2 && suggestions.total === 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-8 text-center z-50">
                    <FiSearch className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">No results found for "{query}"</p>
                    <p className="text-sm text-gray-400 mt-1">Try different keywords</p>
                </div>
            )}
        </div>
    )
}
