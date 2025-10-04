// components/customer/ProductGrid.jsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  HeartIcon, 
  EyeIcon, 
  ShoppingCartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon
} from '@heroicons/react/outline'
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/solid'
import { formatPrice } from '../../lib/utils'
import Button from '../ui/Button'
import { useCart } from '../../lib/context/CartContext'
import { toast } from 'react-hot-toast'

export default function ProductGrid({ 
  products = [], 
  loading = false, 
  totalPages = 0, 
  currentPage = 1, 
  onPageChange,
  showFilters = true 
}) {
  const [wishlist, setWishlist] = useState([])
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const { addItem } = useCart()

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
    addItem(product, 1)
    toast.success(`${product.name} added to cart!`)
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

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-300 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-300 rounded w-40 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
    )
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
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
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with results count and view options */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{products.length}</span> of{' '}
            <span className="font-semibold">{totalPages * 20}</span> results
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Sort Options */}
          <select 
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            onChange={(e) => {
              const [sortBy, order] = e.target.value.split(':')
              onPageChange && onPageChange(1, { sortBy, order })
            }}
          >
            <option value="createdAt:desc">Newest First</option>
            <option value="pricing.salePrice:asc">Price: Low to High</option>
            <option value="pricing.salePrice:desc">Price: High to Low</option>
            <option value="ratings.average:desc">Customer Rating</option>
            <option value="name:asc">Name: A to Z</option>
            <option value="name:desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      {/* Products Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <ProductListItem 
              key={product._id} 
              product={product}
              isWishlisted={wishlist.includes(product._id)}
              onToggleWishlist={toggleWishlist}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-600">
            <span>
              Page {currentPage} of {totalPages}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-4 h-4 mr-1" />
              Previous
            </button>

            <div className="hidden sm:flex space-x-1">
              {generatePageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && onPageChange && onPageChange(page)}
                  disabled={page === '...' || page === currentPage}
                  className={`px-3 py-2 text-sm font-medium border transition-colors ${
                    page === currentPage
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
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Product Card Component for Grid View
function ProductCard({ product, isWishlisted, onToggleWishlist, onAddToCart }) {
  const discount = product.pricing.basePrice && product.pricing.salePrice ? 
    Math.round(((product.pricing.basePrice - product.pricing.salePrice) / product.pricing.basePrice) * 100) : 0
  const finalPrice = product.pricing.salePrice || product.pricing.basePrice

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg hover:border-blue-300 transition-all duration-300">
      {/* Product Image */}
      <div className="relative overflow-hidden bg-gray-50">
        <Link href={`/products/${product._id}`}>
          <Image
            src={product.images?.[0]?.url || '/images/placeholder-product.jpg'}
            alt={product.name}
            width={300}
            height={240}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1">
          {discount > 0 && (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              -{discount}%
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Featured
            </span>
          )}
          {product.isPromoted && (
            <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Sponsored
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggleWishlist(product._id)}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
          >
            {isWishlisted ? (
              <HeartSolidIcon className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <Link href={`/products/${product._id}`}>
            <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
              <EyeIcon className="w-5 h-5 text-gray-600" />
            </button>
          </Link>
        </div>

        {/* Stock Status */}
        {product.inventory?.stock <= 5 && product.inventory?.stock > 0 && (
          <div className="absolute bottom-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            Only {product.inventory.stock} left!
          </div>
        )}

        {product.inventory?.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick Add to Cart */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            onClick={() => onAddToCart(product)}
            disabled={product.inventory?.stock === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
          >
            <ShoppingCartIcon className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4">
        {/* Category */}
        <div className="mb-2">
          <Link 
            href={`/products?category=${product.category}`}
            className="text-xs text-blue-600 hover:text-blue-800 uppercase tracking-wide font-medium"
          >
            {product.category}
          </Link>
        </div>
        
        {/* Product Name */}
        <Link href={`/products/${product._id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors leading-tight">
            {product.name}
          </h3>
        </Link>

        {/* Seller Info */}
        {product.sellerId && (
          <div className="mb-2">
            <Link 
              href={`/seller/${product.sellerId._id}`}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              by {product.sellerId.storeInfo?.storeName || 'Seller'}
            </Link>
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex text-yellow-400 mr-2">
            {[...Array(5)].map((_, i) => (
              i < Math.floor(product.ratings?.average || 0) ? (
                <StarSolidIcon key={i} className="w-4 h-4" />
              ) : (
                <StarIcon key={i} className="w-4 h-4" />
              )
            ))}
          </div>
          <span className="text-sm text-gray-500">
            {product.ratings?.average ? product.ratings.average.toFixed(1) : '0.0'} ({product.ratings?.totalReviews || 0})
          </span>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(finalPrice)}
            </span>
            {product.pricing.basePrice && product.pricing.salePrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.pricing.basePrice)}
              </span>
            )}
          </div>
          {discount > 0 && (
            <span className="text-sm text-green-600 font-medium">
              You save {formatPrice(product.pricing.basePrice - product.pricing.salePrice)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={() => onAddToCart(product)}
          disabled={product.inventory?.stock === 0}
          className="w-full"
          variant="outline"
        >
          {product.inventory?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>
    </div>
  )
}

// Product List Item Component for List View
function ProductListItem({ product, isWishlisted, onToggleWishlist, onAddToCart }) {
  const discount = product.pricing.basePrice && product.pricing.salePrice ? 
    Math.round(((product.pricing.basePrice - product.pricing.salePrice) / product.pricing.basePrice) * 100) : 0
  const finalPrice = product.pricing.salePrice || product.pricing.basePrice

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex space-x-4">
        {/* Product Image */}
        <div className="relative flex-shrink-0">
          <Link href={`/products/${product._id}`}>
            <Image
              src={product.images?.[0]?.url || '/images/placeholder-product.jpg'}
              alt={product.name}
              width={160}
              height={160}
              className="w-40 h-32 object-cover rounded-lg"
            />
          </Link>
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              -{discount}%
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {/* Category */}
              <Link 
                href={`/products?category=${product.category}`}
                className="text-xs text-blue-600 hover:text-blue-800 uppercase tracking-wide font-medium"
              >
                {product.category}
              </Link>
              
              {/* Product Name */}
              <Link href={`/products/${product._id}`}>
                <h3 className="text-lg font-semibold text-gray-900 mt-1 mb-2 hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
              </Link>

              {/* Seller */}
              {product.sellerId && (
                <p className="text-sm text-gray-500 mb-2">
                  by <Link 
                    href={`/seller/${product.sellerId._id}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {product.sellerId.storeInfo?.storeName || 'Seller'}
                  </Link>
                </p>
              )}

              {/* Rating */}
              <div className="flex items-center mb-2">
                <div className="flex text-yellow-400 mr-2">
                  {[...Array(5)].map((_, i) => (
                    i < Math.floor(product.ratings?.average || 0) ? (
                      <StarSolidIcon key={i} className="w-4 h-4" />
                    ) : (
                      <StarIcon key={i} className="w-4 h-4" />
                    )
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {product.ratings?.average ? product.ratings.average.toFixed(1) : '0.0'} ({product.ratings?.totalReviews || 0} reviews)
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {product.shortDescription || product.description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col items-end space-y-2 ml-4">
              <button
                onClick={() => onToggleWishlist(product._id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                {isWishlisted ? (
                  <HeartSolidIcon className="w-5 h-5 text-red-500" />
                ) : (
                  <HeartIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xl font-bold text-gray-900">
                  {formatPrice(finalPrice)}
                </span>
                {product.pricing.basePrice && product.pricing.salePrice && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.pricing.basePrice)}
                  </span>
                )}
              </div>
              {discount > 0 && (
                <span className="text-sm text-green-600 font-medium">
                  You save {formatPrice(product.pricing.basePrice - product.pricing.salePrice)}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {product.inventory?.stock <= 5 && product.inventory?.stock > 0 && (
                <span className="text-xs text-orange-600 font-medium">
                  Only {product.inventory.stock} left!
                </span>
              )}
              
              <Button
                onClick={() => onAddToCart(product)}
                disabled={product.inventory?.stock === 0}
                className="px-6"
              >
                {product.inventory?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
