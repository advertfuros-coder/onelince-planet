// app/(seller)/products/[id]/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import {
  FiSave,
  FiX,
  FiUpload,
  FiTrash2,
  FiPlus,
  FiPackage,
  FiDollarSign,
  FiImage,
  FiAlertCircle,
} from 'react-icons/fi'

export default function EditProductPage({ params }) {
  const { token } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [productId, setProductId] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    category: '',
    subCategory: '',
    brand: '',
    sku: '',
    pricing: {
      basePrice: 0,
      salePrice: 0,
      costPrice: 0,
    },
    inventory: {
      stock: 0,
      lowStockThreshold: 10,
      trackInventory: true,
    },
    images: [],
    specifications: [],
    shipping: {
      weight: 0,
      freeShipping: false,
      shippingFee: 0,
    },
    tags: [],
    isActive: true,
  })

  const [newSpec, setNewSpec] = useState({ key: '', value: '' })
  const [newTag, setNewTag] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    async function unwrapParams() {
      const resolvedParams = await params
      setProductId(resolvedParams.id)
    }
    unwrapParams()
  }, [params])

  useEffect(() => {
    if (token && productId && productId !== 'new') {
      fetchProduct()
    } else if (productId === 'new') {
      setLoading(false)
    }
  }, [token, productId])

  async function fetchProduct() {
    try {
      const res = await axios.get(`/api/seller/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.success) {
        setFormData({
          ...res.data.product,
          pricing: res.data.product.pricing || { basePrice: 0, salePrice: 0, costPrice: 0 },
          inventory: res.data.product.inventory || { stock: 0, lowStockThreshold: 10, trackInventory: true },
          images: res.data.product.images || [],
          specifications: res.data.product.specifications || [],
          shipping: res.data.product.shipping || { weight: 0, freeShipping: false, shippingFee: 0 },
          tags: res.data.product.tags || [],
        })
      }
    } catch (error) {
      toast.error('Failed to load product')
      router.push('/seller/products')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)

    try {
      if (productId === 'new') {
        const res = await axios.post('/api/seller/products', formData, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.data.success) {
          toast.success('Product created successfully!')
          router.push('/seller/products')
        }
      } else {
        const res = await axios.put(`/api/seller/products/${productId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.data.success) {
          toast.success('Product updated successfully!')
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  function addImage() {
    if (!imageUrl.trim()) return

    setFormData({
      ...formData,
      images: [
        ...formData.images,
        {
          url: imageUrl,
          alt: formData.name,
          isPrimary: formData.images.length === 0,
        },
      ],
    })
    setImageUrl('')
  }

  function removeImage(index) {
    const newImages = formData.images.filter((_, i) => i !== index)
    // If removed primary image, make first image primary
    if (formData.images[index].isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true
    }
    setFormData({ ...formData, images: newImages })
  }

  function setPrimaryImage(index) {
    const newImages = formData.images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }))
    setFormData({ ...formData, images: newImages })
  }

  function addSpecification() {
    if (!newSpec.key.trim() || !newSpec.value.trim()) return

    setFormData({
      ...formData,
      specifications: [...formData.specifications, { ...newSpec }],
    })
    setNewSpec({ key: '', value: '' })
  }

  function removeSpecification(index) {
    setFormData({
      ...formData,
      specifications: formData.specifications.filter((_, i) => i !== index),
    })
  }

  function addTag() {
    if (!newTag.trim() || formData.tags.includes(newTag.trim())) return

    setFormData({
      ...formData,
      tags: [...formData.tags, newTag.trim()],
    })
    setNewTag('')
  }

  function removeTag(tag) {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold">
              {productId === 'new' ? '➕ Add New Product' : '✏️ Edit Product'}
            </h1>
            <p className="mt-2 text-purple-100">
              {productId === 'new'
                ? 'Create a new product listing'
                : 'Update product information and inventory'}
            </p>
          </div>
          <button
            onClick={() => router.push('/seller/products')}
            className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30"
          >
            <FiX />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <FiPackage className="text-purple-600" />
            <span>Basic Information</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Home & Kitchen">Home & Kitchen</option>
                <option value="Beauty">Beauty</option>
                <option value="Sports">Sports</option>
                <option value="Books">Books</option>
                <option value="Toys">Toys</option>
                <option value="Food">Food</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sub Category</label>
              <input
                type="text"
                value={formData.subCategory}
                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description
              </label>
              <input
                type="text"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Brief product description"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Detailed product description"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <FiDollarSign className="text-green-600" />
            <span>Pricing</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Price (₹) *
              </label>
              <input
                type="number"
                value={formData.pricing.basePrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricing: { ...formData.pricing, basePrice: parseFloat(e.target.value) || 0 },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price (₹)</label>
              <input
                type="number"
                value={formData.pricing.salePrice || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricing: { ...formData.pricing, salePrice: parseFloat(e.target.value) || 0 },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cost Price (₹)</label>
              <input
                type="number"
                value={formData.pricing.costPrice || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricing: { ...formData.pricing, costPrice: parseFloat(e.target.value) || 0 },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="0"
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">For profit calculation</p>
            </div>
          </div>

          {formData.pricing.salePrice > 0 && formData.pricing.basePrice > 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Discount:</strong>{' '}
                {(
                  ((formData.pricing.basePrice - formData.pricing.salePrice) /
                    formData.pricing.basePrice) *
                  100
                ).toFixed(1)}
                % off (Save ₹{(formData.pricing.basePrice - formData.pricing.salePrice).toFixed(2)})
              </p>
            </div>
          )}
        </div>

        {/* Inventory */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <FiPackage className="text-blue-600" />
            <span>Inventory</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
              <input
                type="number"
                value={formData.inventory.stock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    inventory: { ...formData.inventory, stock: parseInt(e.target.value) || 0 },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Low Stock Threshold
              </label>
              <input
                type="number"
                value={formData.inventory.lowStockThreshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    inventory: {
                      ...formData.inventory,
                      lowStockThreshold: parseInt(e.target.value) || 10,
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="0"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.inventory.trackInventory}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      inventory: { ...formData.inventory, trackInventory: e.target.checked },
                    })
                  }
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">Track Inventory</span>
              </label>
            </div>
          </div>

          {formData.inventory.stock <= formData.inventory.lowStockThreshold && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2">
              <FiAlertCircle className="text-yellow-600 mt-0.5" />
              <p className="text-sm text-yellow-800">
                <strong>Low Stock Warning:</strong> Current stock is at or below the low stock threshold
              </p>
            </div>
          )}
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <FiImage className="text-pink-600" />
            <span>Product Images</span>
          </h3>

          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter image URL"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addImage}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
              >
                <FiPlus />
                <span>Add</span>
              </button>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div
                    key={index}
                    className={`relative group rounded-lg overflow-hidden border-2 ${
                      image.isPrimary ? 'border-purple-600' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center space-x-2">
                      {!image.isPrimary && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(index)}
                          className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-white text-gray-900 rounded text-xs font-semibold"
                        >
                          Set Primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="opacity-0 group-hover:opacity-100 p-2 bg-red-600 text-white rounded"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                    {image.isPrimary && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-purple-600 text-white text-xs font-semibold rounded">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Specifications</h3>

          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newSpec.key}
                onChange={(e) => setNewSpec({ ...newSpec, key: e.target.value })}
                placeholder="Key (e.g., Color)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="text"
                value={newSpec.value}
                onChange={(e) => setNewSpec({ ...newSpec, value: e.target.value })}
                placeholder="Value (e.g., Black)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addSpecification}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <FiPlus />
              </button>
            </div>

            {formData.specifications.length > 0 && (
              <div className="space-y-2">
                {formData.specifications.map((spec, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <span className="font-semibold text-gray-900">{spec.key}:</span>{' '}
                      <span className="text-gray-600">{spec.value}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSpecification(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Shipping</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
              <input
                type="number"
                value={formData.shipping.weight || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shipping: { ...formData.shipping, weight: parseFloat(e.target.value) || 0 },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Fee (₹)
              </label>
              <input
                type="number"
                value={formData.shipping.shippingFee || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shipping: {
                      ...formData.shipping,
                      shippingFee: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="0"
                step="0.01"
                disabled={formData.shipping.freeShipping}
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.shipping.freeShipping}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shipping: {
                        ...formData.shipping,
                        freeShipping: e.target.checked,
                        shippingFee: e.target.checked ? 0 : formData.shipping.shippingFee,
                      },
                    })
                  }
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">Free Shipping</span>
              </label>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Tags</h3>

          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tag..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <FiPlus />
              </button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium flex items-center space-x-2"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Status</h3>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Active Product</span>
              <p className="text-xs text-gray-500">
                Product will be visible to customers when active and approved
              </p>
            </div>
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-semibold"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FiSave />
                <span>{productId === 'new' ? 'Create Product' : 'Save Changes'}</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push('/seller/products')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
