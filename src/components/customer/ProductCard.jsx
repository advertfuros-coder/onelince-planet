'use client'
import { useState } from 'react'
import Link from 'next/link'
import { FiShoppingCart, FiHeart, FiStar } from 'react-icons/fi'
import { useCart } from '@/lib/context/CartContext'
import { formatPrice } from '@/lib/utils/formatters'
import Button from '../ui/Button'

export default function ProductCard({ product, viewMode = 'grid' }) {
  const { addToCart } = useCart()
  const [isWishlisted, setIsWishlisted] = useState(false)

  const discount = product.pricing?.salePrice
    ? Math.round(
        ((product.pricing.basePrice - product.pricing.salePrice) / product.pricing.basePrice) * 100,
      )
    : 0

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()

    addToCart(product, 1)
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlisted(!isWishlisted)
  }

  if (viewMode === 'list') {
    return (
      <Link href={`/products/${product._id}`}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg transition-shadow p-4">
          <div className="flex items-start space-x-4">
            {/* Image */}
            <div className="relative w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.images?.[0]?.url || '/images/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              {discount > 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                  {discount}% OFF
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-2">{product.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.shortDescription}</p>

              {/* Rating and count */}
              <div className="flex items-center mb-3">
                <div className="flex text-yellow-400 mr-2">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.ratings?.average || 0) ? 'fill-current' : ''}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">({product.ratings?.count || 0})</span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-gray-900">
                  {formatPrice(product.pricing?.salePrice || product.pricing?.basePrice || 0)}
                </span>
                {product.pricing?.salePrice && (
                  <span className="text-sm text-gray-500 line-through">{formatPrice(product.pricing.basePrice)}</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-2">
              <button
                onClick={handleWishlist}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
              >
                <FiHeart
                  className={`w-5 h-5 ${isWishlisted ? 'text-red-500 fill-current' : 'text-gray-600'}`}
                />
              </button>
              <Button onClick={handleAddToCart} size="sm">
                <FiShoppingCart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/products/${product._id}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg transition-shadow">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-gray-100">
          <img
            src={product.images?.[0]?.url || '/images/placeholder-product.jpg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors z-10"
          >
            <FiHeart
              className={`w-4 h-4 ${isWishlisted ? 'text-red-500 fill-current' : 'text-gray-600'}`}
            />
          </button>

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
              {discount}% OFF
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 min-h-[3rem]">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex text-yellow-400 mr-2">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(product.ratings?.average || 0) ? 'fill-current' : ''}`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">({product.ratings?.count || 0})</span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.pricing?.salePrice || product.pricing?.basePrice || 0)}
            </span>
            {product.pricing?.salePrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.pricing.basePrice)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center space-x-2"
            size="sm"
          >
            <FiShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </Button>
        </div>
      </div>
    </Link>
  )
}
