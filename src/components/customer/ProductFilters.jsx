// components/customer/ProductFilters.jsx
'use client'
import { useState } from 'react'
import { FiChevronDown, FiX } from 'react-icons/fi'

const categories = [
  'Fashion',
  'Electronics',
  'Home & Decor',
  'Beauty & Skin',
  'Books',
  'Health & Fitness',
  'Groceries',
  'Gifts'
]

const brands = [
  'Samsung',
  'Nike',
  'Apple',
  'Adidas',
  'Sony',
  'Puma',
  'Xiaomi',
  'Boat'
]

const priceRanges = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 - ₹1,000', min: 500, max: 1000 },
  { label: '₹1,000 - ₹2,500', min: 1000, max: 2500 },
  { label: '₹2,500 - ₹5,000', min: 2500, max: 5000 },
  { label: 'Above ₹5,000', min: 5000, max: null }
]

const ratings = [4, 3, 2, 1]

export default function ProductFilters({ filters, onFiltersChange }) {
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    brand: false,
    rating: false
  })

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const updateFilter = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilter = (key) => {
    onFiltersChange({
      ...filters,
      [key]: ''
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      search: filters.search, // Keep search
      category: '',
      minPrice: '',
      maxPrice: '',
      brand: '',
      rating: '',
      sortBy: 'createdAt',
      order: 'desc'
    })
  }

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => 
    key !== 'search' && key !== 'sortBy' && key !== 'order' && value
  ).length

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear All ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {filters.category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                {filters.category}
                <button
                  onClick={() => clearFilter('category')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                ₹{filters.minPrice || 0} - ₹{filters.maxPrice || '∞'}
                <button
                  onClick={() => {
                    clearFilter('minPrice')
                    clearFilter('maxPrice')
                  }}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.brand && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                {filters.brand}
                <button
                  onClick={() => clearFilter('brand')}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('category')}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
        >
          Category
          <FiChevronDown 
            className={`w-5 h-5 transition-transform ${openSections.category ? 'rotate-180' : ''}`} 
          />
        </button>
        {openSections.category && (
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category} className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  value={category.toLowerCase()}
                  checked={filters.category === category.toLowerCase()}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
        >
          Price Range
          <FiChevronDown 
            className={`w-5 h-5 transition-transform ${openSections.price ? 'rotate-180' : ''}`} 
          />
        </button>
        {openSections.price && (
          <div className="space-y-3">
            {priceRanges.map((range, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="radio"
                  name="priceRange"
                  checked={
                    filters.minPrice == range.min && 
                    (filters.maxPrice == range.max || (!filters.maxPrice && !range.max))
                  }
                  onChange={() => {
                    updateFilter('minPrice', range.min.toString())
                    updateFilter('maxPrice', range.max ? range.max.toString() : '')
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{range.label}</span>
              </label>
            ))}
            
            {/* Custom Price Range */}
            <div className="pt-3 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Brand Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('brand')}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
        >
          Brand
          <FiChevronDown 
            className={`w-5 h-5 transition-transform ${openSections.brand ? 'rotate-180' : ''}`} 
          />
        </button>
        {openSections.brand && (
          <div className="space-y-2">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center">
                <input
                  type="radio"
                  name="brand"
                  value={brand.toLowerCase()}
                  checked={filters.brand === brand.toLowerCase()}
                  onChange={(e) => updateFilter('brand', e.target.value)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{brand}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Rating Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('rating')}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
        >
          Customer Rating
          <FiChevronDown 
            className={`w-5 h-5 transition-transform ${openSections.rating ? 'rotate-180' : ''}`} 
          />
        </button>
        {openSections.rating && (
          <div className="space-y-2">
            {ratings.map((rating) => (
              <label key={rating} className="flex items-center">
                <input
                  type="radio"
                  name="rating"
                  value={rating}
                  checked={filters.rating == rating}
                  onChange={(e) => updateFilter('rating', e.target.value)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-2 flex items-center">
                  <div className="flex text-yellow-400 mr-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 fill-current ${
                          i < rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-700">& Up</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
