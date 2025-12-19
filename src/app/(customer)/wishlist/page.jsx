// app/(customer)/wishlist/page.jsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useWishlist } from '@/lib/hooks/useWishlist'
import { FiHeart, FiShoppingCart, FiTrash2, FiPackage, FiBell, FiShare2 } from 'react-icons/fi'
import PriceAlertModal from '@/components/customer/PriceAlertModal'
import ShareWishlistModal from '@/components/customer/ShareWishlistModal'

export default function WishlistPage() {
  const { wishlist, loading, removeFromWishlist } = useWishlist()
  const [removing, setRemoving] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showShareModal, setShowShareModal] = useState(false)

  const handleRemove = async (productId) => {
    setRemoving(productId)
    await removeFromWishlist(productId)
    setRemoving(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <FiHeart className="text-3xl text-purple-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                My Wishlist
              </h1>
            </div>

            {/* Action Buttons */}
            {wishlist.count > 0 && (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
                >
                  <FiShare2 />
                  <span className="hidden sm:inline">Share Wishlist</span>
                </button>
              </div>
            )}
          </div>
          <p className="text-gray-600">
            {wishlist.count} {wishlist.count === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>

        {/* Empty State */}
        {wishlist.count === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiHeart className="text-5xl text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">
              Start adding products you love to your wishlist
            </p>
            <Link
              href="/products"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              <FiPackage />
              <span>Browse Products</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.items.map((item) => {
              const product = item.productId
              if (!product) return null

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Product Image */}
                  <Link href={`/products/${product._id}`}>
                    <div className="relative h-64 bg-gray-100">
                      {product.images?.[0] ? (
                        <Image
                          src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiPackage className="text-6xl text-gray-300" />
                        </div>
                      )}

                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          handleRemove(product._id)
                        }}
                        disabled={removing === product._id}
                        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50"
                      >
                        <FiTrash2 />
                      </button>

                      {/* Stock Badge */}
                      {product.inventory?.stock <= 0 && (
                        <div className="absolute bottom-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                          Out of Stock
                        </div>
                      )}
                      {product.inventory?.stock > 0 && product.inventory?.stock <= 10 && (
                        <div className="absolute bottom-3 left-3 px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                          Only {product.inventory.stock} left
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-4">
                    <Link href={`/products/${product._id}`}>
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-purple-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    {product.brand && (
                      <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
                    )}

                    {/* Rating */}
                    {product.ratings?.average > 0 && (
                      <div className="flex items-center space-x-1 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < Math.round(product.ratings.average)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                                }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                              />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          ({product.ratings.count})
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="mb-3">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-bold text-gray-900">
                          ₹{product.pricing?.salePrice?.toLocaleString()}
                        </span>
                        {product.pricing?.basePrice !== product.pricing?.salePrice && (
                          <>
                            <span className="text-sm text-gray-500 line-through">
                              ₹{product.pricing?.basePrice?.toLocaleString()}
                            </span>
                            <span className="text-sm font-semibold text-green-600">
                              {Math.round(((product.pricing.basePrice - product.pricing.salePrice) / product.pricing.basePrice) * 100)}% OFF
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mb-3">
                      <Link
                        href={`/products/${product._id}`}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
                      >
                        <FiShoppingCart />
                        <span>View</span>
                      </Link>
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="flex items-center justify-center px-4 py-2.5 bg-white border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-all"
                        title="Set Price Alert"
                      >
                        <FiBell />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modals */}
        {selectedProduct && (
          <PriceAlertModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}

        {showShareModal && (
          <ShareWishlistModal onClose={() => setShowShareModal(false)} />
        )}
      </div>
    </div>
  )
}
