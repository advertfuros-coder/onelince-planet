'use client'
import { useState, useEffect } from 'react'
import { FiChevronUp, FiStar } from 'react-icons/fi'

export default function ProductFilters({ filters, onFiltersChange }) {
  const [openSections, setOpenSections] = useState({
    price: true,
    brand: true,
    rating: true
  })
  const [brands, setBrands] = useState([])
  const [loadingBrands, setLoadingBrands] = useState(true)

  // Fetch brands from API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const url = filters.category
          ? `/api/brands?category=${filters.category}`
          : '/api/brands'

        const response = await fetch(url)
        const data = await response.json()

        if (data.success && data.brands) {
          setBrands(data.brands)
        }
      } catch (error) {
        console.error('Failed to fetch brands:', error)
        // Fallback to some default brands
        setBrands([
          { name: 'Sony', count: 0 },
          { name: 'JBL', count: 0 },
          { name: 'Bose', count: 0 },
          { name: 'Boat', count: 0 },
          { name: 'Samsung', count: 0 }
        ])
      } finally {
        setLoadingBrands(false)
      }
    }

    fetchBrands()
  }, [filters.category])

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const updateFilter = (key, value) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      search: filters.search,
      category: filters.category,
      minPrice: '',
      maxPrice: '',
      brand: '',
      rating: '',
      verified: false,
      fastDelivery: false,
      sortBy: 'relevance',
      order: 'desc'
    })
  }

  const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.brand || filters.rating || filters.verified || filters.fastDelivery

  return (
    <div className="w-full max-w-[280px] space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[22px] font-black text-[#1a1a1b] tracking-tight">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.minPrice && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex items-center gap-1">
              Min: ₹{filters.minPrice}
              <button onClick={() => updateFilter('minPrice', '')} className="hover:text-blue-900">×</button>
            </span>
          )}
          {filters.maxPrice && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex items-center gap-1">
              Max: ₹{filters.maxPrice}
              <button onClick={() => updateFilter('maxPrice', '')} className="hover:text-blue-900">×</button>
            </span>
          )}
          {filters.brand && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex items-center gap-1 capitalize">
              {filters.brand}
              <button onClick={() => updateFilter('brand', '')} className="hover:text-blue-900">×</button>
            </span>
          )}
          {filters.rating && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex items-center gap-1">
              {filters.rating}★ & Up
              <button onClick={() => updateFilter('rating', '')} className="hover:text-blue-900">×</button>
            </span>
          )}
        </div>
      )}

      {/* Price Range */}
      <div className="bg-[#F8F9FA] rounded-[24px] overflow-hidden border border-gray-100/50">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full p-5 text-left font-bold text-[#1a1a1b]"
        >
          Price Range
          <FiChevronUp className={`w-5 h-5 transition-transform duration-300 ${!openSections.price ? 'rotate-180' : ''}`} />
        </button>
        {openSections.price && (
          <div className="px-5 pb-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                />
              </div>
              <span className="text-gray-400 font-medium">-</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Brand Filter */}
      <div className="bg-[#F8F9FA] rounded-[24px] overflow-hidden border border-gray-100/50">
        <button
          onClick={() => toggleSection('brand')}
          className="flex items-center justify-between w-full p-5 text-left font-bold text-[#1a1a1b]"
        >
          Brand
          <FiChevronUp className={`w-5 h-5 transition-transform duration-300 ${!openSections.brand ? 'rotate-180' : ''}`} />
        </button>
        {openSections.brand && (
          <div className="px-5 pb-6 space-y-3">
            {loadingBrands ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-6 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : brands.length > 0 ? (
              brands.filter(brand => brand.name).map((brand) => {
                const brandName = brand.name?.toLowerCase() || ''
                return (
                  <label key={brand.name} className="flex items-center group cursor-pointer">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.brand === brandName}
                        onChange={() => updateFilter('brand', filters.brand === brandName ? '' : brandName)}
                        className="peer w-5 h-5 border-2 border-gray-300 rounded-[6px] checked:bg-blue-600 checked:border-blue-600 transition-all appearance-none cursor-pointer"
                      />
                      <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 left-0.5 pointer-events-none transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="ml-3 text-sm font-bold text-gray-600 group-hover:text-[#1a1a1b] transition-colors">{brand.name}</span>
                    {brand.count > 0 && (
                      <span className="ml-auto text-[11px] font-black text-gray-400">({brand.count})</span>
                    )}
                  </label>
                )
              })
            ) : (
              <p className="text-sm text-gray-500">No brands available</p>
            )}
          </div>
        )}
      </div>

      {/* Rating Filter */}
      <div className="bg-[#F8F9FA] rounded-[24px] overflow-hidden border border-gray-100/50">
        <button
          onClick={() => toggleSection('rating')}
          className="flex items-center justify-between w-full p-5 text-left font-bold text-[#1a1a1b]"
        >
          Customer Rating
          <FiChevronUp className={`w-5 h-5 transition-transform duration-300 ${!openSections.rating ? 'rotate-180' : ''}`} />
        </button>
        {openSections.rating && (
          <div className="px-5 pb-6 space-y-3">
            {[5, 4, 3, 2].map((rating) => (
              <label key={rating} className="flex items-center group cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.rating == rating}
                  onChange={() => updateFilter('rating', filters.rating == rating ? '' : rating)}
                  className="peer w-5 h-5 border-2 border-gray-300 rounded-full checked:bg-blue-600 checked:border-blue-600 transition-all appearance-none cursor-pointer"
                />
                <div className="ml-3 flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className={`w-3.5 h-3.5 ${i < rating ? 'fill-[#FF9900] text-[#FF9900]' : 'text-gray-300'}`} />
                  ))}
                  <span className="ml-1 text-sm font-bold text-gray-600 group-hover:text-[#1a1a1b] transition-colors">& Up</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Toggles */}
      <div className="bg-[#F8F9FA] rounded-[24px] p-5 space-y-5 border border-gray-100/50">
        {/* Verified Seller */}
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-bold text-gray-700">Verified Seller</span>
          <button
            onClick={() => updateFilter('verified', !filters.verified)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors outline-none focus:ring-2 focus:ring-blue-500/20 ${filters.verified ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${filters.verified ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Fast Delivery */}
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-bold text-gray-700">Fast Delivery</span>
          <button
            onClick={() => updateFilter('fastDelivery', !filters.fastDelivery)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors outline-none focus:ring-2 focus:ring-blue-500/20 ${filters.fastDelivery ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${filters.fastDelivery ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>
    </div>
  )
}
