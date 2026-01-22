// app/(admin)/products/[id]/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useAuth } from '@/lib/context/AuthContext'
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiPackage,
  FiDollarSign,
  FiTag,
  FiCalendar,
  FiUser,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiTruck,
} from 'react-icons/fi'
import Link from 'next/link'

export default function AdminProductDetailPage({ params }) {
  const { token } = useAuth()
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [productId, setProductId] = useState(null)

  // Unwrap params
  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params
      setProductId(resolvedParams.id)
    }
    unwrapParams()
  }, [params])

  useEffect(() => {
    if (token && productId) fetchProductDetails()
  }, [token, productId])

  async function fetchProductDetails() {
    try {
      setLoading(true)
      const res = await axios.get(`/api/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      console.log('Product details:', res.data)

      if (res.data.success) {
        setProduct(res.data.product)
      } else {
        router.push('/admin/products')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      router.push('/admin/products')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const res = await axios.delete(`/api/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.success) {
        alert('Product deleted successfully')
        router.push('/admin/products')
      }
    } catch (error) {
      alert('Failed to delete product')
    }
  }

  async function toggleStatus() {
    try {
      const res = await axios.put(
        `/api/admin/products/${productId}`,
        { isActive: !product.isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.data.success) {
        setProduct(res.data.product)
        alert('Product status updated')
      }
    } catch (error) {
      alert('Failed to update status')
    }
  }

  if (loading || !productId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  if (!product) return null

  const discountPercent = product.pricing?.basePrice
    ? Math.round(((product.pricing.basePrice - product.pricing.salePrice) / product.pricing.basePrice) * 100)
    : 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Product Details</h1>
            <p className="text-gray-600 mt-1">View and manage product information</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={toggleStatus}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white ${product.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
          >
            {product.isActive ? <FiXCircle /> : <FiCheckCircle />}
            <span>{product.isActive ? 'Deactivate' : 'Activate'}</span>
          </button>
          <Link
            href={`/admin/products/${productId}/edit`}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FiEdit2 />
            <span>Edit</span>
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <FiTrash2 />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div
        className={`rounded-lg p-4 flex items-center justify-between ${product.isActive ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}
      >
        <div className="flex items-center space-x-3">
          {product.isActive ? (
            <>
              <FiCheckCircle className="text-green-600 text-xl" />
              <div>
                <p className="font-semibold text-green-900">Product Active</p>
                <p className="text-sm text-green-700">This product is visible to customers</p>
              </div>
            </>
          ) : (
            <>
              <FiXCircle className="text-red-600 text-xl" />
              <div>
                <p className="font-semibold text-red-900">Product Inactive</p>
                <p className="text-sm text-red-700">This product is hidden from customers</p>
              </div>
            </>
          )}
        </div>
        {product.inventory?.stock === 0 && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-red-100 rounded-lg">
            <FiAlertCircle className="text-red-600" />
            <span className="text-sm font-semibold text-red-700">Out of Stock</span>
          </div>
        )}
        {product.inventory?.stock > 0 && product.inventory?.stock <= 10 && (
          <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 rounded-lg">
            <FiAlertCircle className="text-yellow-600" />
            <span className="text-sm font-semibold text-yellow-700">Low Stock ({product.inventory.stock})</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Images */}
        <div className="lg:col-span-1 space-y-4">
          {/* Main Image */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img
                src={product.images?.[0]?.url || '/images/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Image Thumbnails */}
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${activeImage === idx ? 'border-blue-600' : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stock Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <FiPackage />
              <span>Inventory</span>
            </h3>
            <div className="space-y-3">
              <InfoRow label="SKU" value={product.sku || 'N/A'} />
              <InfoRow label="Stock" value={product.inventory?.stock || 0} />
              <InfoRow label="Low Stock Alert" value={product.inventory?.lowStockThreshold || 0} />
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">{product.name}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center space-x-1">
                  <FiTag />
                  <span>{product.category}</span>
                </span>
                {product.brand && (
                  <span className="flex items-center space-x-1">
                    <FiTag />
                    <span>{product.brand}</span>
                  </span>
                )}
                <span className="flex items-center space-x-1">
                  <FiCalendar />
                  <span>Added {new Date(product.createdAt).toLocaleDateString('en-IN')}</span>
                </span>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-baseline space-x-3">
                <div className="flex items-center space-x-2">
                  <FiDollarSign className="text-green-600" />
                  <span className="text-3xl font-semibold text-gray-900">
                    ₹{product.pricing?.salePrice?.toLocaleString('en-IN')}
                  </span>
                </div>
                {product.pricing?.basePrice !== product.pricing?.salePrice && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      ₹{product.pricing?.basePrice?.toLocaleString('en-IN')}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-semibold">
                      {discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-gray-600">Cost Price</p>
                  <p className="text-sm font-semibold text-gray-900">
                    ₹{product.pricing?.costPrice?.toLocaleString('en-IN') || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Margin</p>
                  <p className="text-sm font-semibold text-green-600">
                    ₹{((product.pricing?.salePrice || 0) - (product.pricing?.costPrice || 0)).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Margin %</p>
                  <p className="text-sm font-semibold text-green-600">
                    {product.pricing?.salePrice
                      ? (
                          ((product.pricing.salePrice - (product.pricing.costPrice || 0)) / product.pricing.salePrice) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
            </div>
          </div>

          {/* Seller Info */}
          {product.sellerId && typeof product.sellerId === 'object' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiUser />
                  <span>Seller Information</span>
                </div>
                {product.sellerId.subscriptionPlan && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    product.sellerId.subscriptionPlan === 'premium' ? 'bg-purple-100 text-purple-700' :
                    product.sellerId.subscriptionPlan === 'basic' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {product.sellerId.subscriptionPlan}
                  </span>
                )}
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Business Name</p>
                  <p className="text-sm font-semibold text-slate-900">{product.sellerId.businessInfo?.businessName || 'N/A'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Contact Person</p>
                    <p className="text-xs font-medium text-slate-700">{product.sellerId.personalDetails?.fullName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">GSTIN</p>
                    <p className="text-xs font-medium text-slate-700 font-mono italic">{product.sellerId.businessInfo?.gstin || 'No GSTIN'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email Address</p>
                    <p className="text-xs font-medium text-slate-700 truncate">{product.sellerId.personalDetails?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Phone Number</p>
                    <p className="text-xs font-medium text-slate-700">{product.sellerId.personalDetails?.phone || 'N/A'}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => router.push(`/admin/sellers/${product.sellerId._id}`)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-semibold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
                  >
                    View Full Seller Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Specifications */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.specifications.map((spec, idx) => {
                  // Handle different specification formats
                  const label = spec.key || spec.name || spec.label || `Spec ${idx + 1}`
                  const value = spec.value || spec.description || JSON.stringify(spec)

                  return (
                    <div key={idx} className="flex flex-col py-2 border-b">
                      <span className="text-xs text-gray-500 uppercase mb-1">{label}</span>
                      <span className="text-sm font-medium text-gray-900">{value}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}


          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Shipping Info */}
          {product.shipping && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <FiTruck />
                <span>Shipping Information</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow label="Weight" value={`${product.shipping.weight || 0} kg`} />
                <InfoRow
                  label="Dimensions"
                  value={
                    product.shipping.dimensions
                      ? `${product.shipping.dimensions.length} × ${product.shipping.dimensions.width} × ${product.shipping.dimensions.height} cm`
                      : 'N/A'
                  }
                />
                <InfoRow label="Free Shipping" value={product.shipping.freeShipping ? 'Yes' : 'No'} />
                <InfoRow label="Processing Time" value={`${product.shipping.processingTime || 1} days`} />
              </div>
            </div>
          )}

          {/* SEO Info */}
          {product.seo && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Information</h3>
              <div className="space-y-3">
                <InfoRow label="Meta Title" value={product.seo.metaTitle || 'N/A'} />
                <InfoRow label="Meta Description" value={product.seo.metaDescription || 'N/A'} />
                {product.seo.keywords && product.seo.keywords.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Keywords</p>
                    <div className="flex flex-wrap gap-2">
                      {product.seo.keywords.map((keyword, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b last:border-b-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text- font-semibold text-blue-500">{value || 'N/A'}</span>
    </div>
  )
}
