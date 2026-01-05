// components/customer/ProductGrid.jsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  FiHeart,
  FiEye,
  FiShoppingCart,
  FiChevronLeft,
  FiChevronRight,
  FiStar
} from 'react-icons/fi'
import { FaHeart, FaStar } from 'react-icons/fa'
import { formatPrice } from '../../lib/utils'
import Button from '../ui/Button'
import { useCart } from '../../lib/context/CartContext'
import { toast } from 'react-hot-toast'

import ProductCard from './ProductCard'

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
      {/* Products Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              <FiChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>

            <div className="hidden sm:flex space-x-1">
              {generatePageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' && onPageChange && onPageChange(page)}
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
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
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
            <img
              src={product.images?.[0]?.url || '/images/placeholder-product.jpg'}
              alt={product.name}
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
                      <FaStar key={i} className="w-4 h-4" />
                    ) : (
                      <FiStar key={i} className="w-4 h-4" />
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
                  <FaHeart className="w-5 h-5 text-red-500" />
                ) : (
                  <FiHeart className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xl font-semibold text-gray-900">
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
