// app/(admin)/products/[id]/edit/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useAuth } from '@/lib/context/AuthContext'
import { FiArrowLeft, FiSave, FiX, FiPlus, FiTrash2, FiUpload } from 'react-icons/fi'
import { toast } from 'react-hot-toast'

export default function EditProductPage({ params }) {
  const { token } = useAuth()
  const router = useRouter()
  const [productId, setProductId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    sku: '',
    images: [],
    pricing: {
      basePrice: 0,
      salePrice: 0,
      costPrice: 0,
    },
    inventory: {
      stock: 0,
      lowStockThreshold: 10,
      warehouse: '',
    },
    specifications: [],
    tags: [],
    shipping: {
      weight: 0,
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
      },
      freeShipping: false,
      processingTime: 1,
    },
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: [],
    },
    isActive: true,
  })

  // Unwrap params
  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params
      setProductId(resolvedParams.id)
    }
    unwrapParams()
  }, [params])

  useEffect(() => {
    if (token && productId) fetchProduct()
  }, [token, productId])

  async function fetchProduct() {
    try {
      setLoading(true)
      const res = await axios.get(`/api/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.success) {
        const product = res.data.product
        setFormData({
          name: product.name || '',
          description: product.description || '',
          category: product.category || '',
          brand: product.brand || '',
          sku: product.sku || '',
          images: Array.isArray(product.images) ? product.images : [],
          pricing: {
            basePrice: product.pricing?.basePrice || 0,
            salePrice: product.pricing?.salePrice || 0,
            costPrice: product.pricing?.costPrice || 0,
          },
          inventory: {
            stock: product.inventory?.stock || 0,
            lowStockThreshold: product.inventory?.lowStockThreshold || 10,
            warehouse: product.inventory?.warehouse || '',
          },
          specifications: Array.isArray(product.specifications) ? product.specifications : [],
          tags: Array.isArray(product.tags) ? product.tags : [],
          shipping: {
            weight: product.shipping?.weight || 0,
            dimensions: {
              length: product.shipping?.dimensions?.length || 0,
              width: product.shipping?.dimensions?.width || 0,
              height: product.shipping?.dimensions?.height || 0,
            },
            freeShipping: product.shipping?.freeShipping || false,
            processingTime: product.shipping?.processingTime || 1,
          },
          seo: {
            metaTitle: product.seo?.metaTitle || '',
            metaDescription: product.seo?.metaDescription || '',
            keywords: Array.isArray(product.seo?.keywords) ? product.seo.keywords : [],
          },
          isActive: product.isActive,
        })
      }
    } catch (error) {
      toast.error('Failed to load product')
      router.push('/admin/products')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await axios.put(`/api/admin/products/${productId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.success) {
        toast.success('Product updated successfully')
        router.push(`/admin/products/${productId}`)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  function addSpecification() {
    setFormData({
      ...formData,
      specifications: [...(formData.specifications || []), { key: '', value: '' }],
    })
  }

  function updateSpecification(index, field, value) {
    const newSpecs = [...(formData.specifications || [])]
    newSpecs[index][field] = value
    setFormData({ ...formData, specifications: newSpecs })
  }

  function removeSpecification(index) {
    setFormData({
      ...formData,
      specifications: (formData.specifications || []).filter((_, i) => i !== index),
    })
  }

  function addTag(e) {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault()
      if (!(formData.tags || []).includes(e.target.value.trim())) {
        setFormData({
          ...formData,
          tags: [...(formData.tags || []), e.target.value.trim()],
        })
      }
      e.target.value = ''
    }
  }

  function removeTag(tag) {
    setFormData({
      ...formData,
      tags: (formData.tags || []).filter((t) => t !== tag),
    })
  }

  function addKeyword(e) {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault()
      if (!(formData.seo?.keywords || []).includes(e.target.value.trim())) {
        setFormData({
          ...formData,
          seo: {
            ...formData.seo,
            keywords: [...(formData.seo?.keywords || []), e.target.value.trim()],
          },
        })
      }
      e.target.value = ''
    }
  }

  function removeKeyword(keyword) {
    setFormData({
      ...formData,
      seo: {
        ...formData.seo,
        keywords: (formData.seo?.keywords || []).filter((k) => k !== keyword),
      },
    })
  }

  function addImage(url) {
    if (url.trim()) {
      setFormData({
        ...formData,
        images: [...(formData.images || []), url.trim()],
      })
    }
  }

  function removeImage(index) {
    setFormData({
      ...formData,
      images: (formData.images || []).filter((_, i) => i !== index),
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-600 mt-1">Update product information</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FiX />
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <FiSave />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Section title="Basic Information">
            <Input
              label="Product Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Textarea
              label="Description *"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Category *"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
              <Input
                label="Brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
            <Input
              label="SKU"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            />
          </Section>

          {/* Pricing */}
          <Section title="Pricing">
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Base Price (₹) *"
                type="number"
                value={formData.pricing.basePrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricing: { ...formData.pricing, basePrice: parseFloat(e.target.value) },
                  })
                }
                required
              />
              <Input
                label="Sale Price (₹) *"
                type="number"
                value={formData.pricing.salePrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricing: { ...formData.pricing, salePrice: parseFloat(e.target.value) },
                  })
                }
                required
              />
              <Input
                label="Cost Price (₹)"
                type="number"
                value={formData.pricing.costPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pricing: { ...formData.pricing, costPrice: parseFloat(e.target.value) },
                  })
                }
              />
            </div>
          </Section>

          {/* Inventory */}
          <Section title="Inventory">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Stock *"
                type="number"
                value={formData.inventory.stock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    inventory: { ...formData.inventory, stock: parseInt(e.target.value) },
                  })
                }
                required
              />
              <Input
                label="Low Stock Alert"
                type="number"
                value={formData.inventory.lowStockThreshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    inventory: { ...formData.inventory, lowStockThreshold: parseInt(e.target.value) },
                  })
                }
              />
            </div>
            <Input
              label="Warehouse"
              value={formData.inventory.warehouse}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  inventory: { ...formData.inventory, warehouse: e.target.value },
                })
              }
            />
          </Section>

          {/* Specifications */}
          <Section title="Specifications">
            {Array.isArray(formData.specifications) && formData.specifications.map((spec, index) => (
              <div key={index} className="flex space-x-2">
                <Input
                  placeholder="Key (e.g., Display)"
                  value={spec.key}
                  onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Value (e.g., 6.1-inch OLED)"
                  value={spec.value}
                  onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeSpecification(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSpecification}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FiPlus />
              <span>Add Specification</span>
            </button>
          </Section>

          {/* Shipping */}
          <Section title="Shipping">
            <div className="grid grid-cols-4 gap-4">
              <Input
                label="Weight (kg)"
                type="number"
                step="0.01"
                value={formData.shipping.weight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shipping: { ...formData.shipping, weight: parseFloat(e.target.value) },
                  })
                }
              />
              <Input
                label="Length (cm)"
                type="number"
                value={formData.shipping.dimensions.length}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shipping: {
                      ...formData.shipping,
                      dimensions: { ...formData.shipping.dimensions, length: parseFloat(e.target.value) },
                    },
                  })
                }
              />
              <Input
                label="Width (cm)"
                type="number"
                value={formData.shipping.dimensions.width}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shipping: {
                      ...formData.shipping,
                      dimensions: { ...formData.shipping.dimensions, width: parseFloat(e.target.value) },
                    },
                  })
                }
              />
              <Input
                label="Height (cm)"
                type="number"
                value={formData.shipping.dimensions.height}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shipping: {
                      ...formData.shipping,
                      dimensions: { ...formData.shipping.dimensions, height: parseFloat(e.target.value) },
                    },
                  })
                }
              />
            </div>
            <div className="flex space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.shipping.freeShipping}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shipping: { ...formData.shipping, freeShipping: e.target.checked },
                    })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Free Shipping</span>
              </label>
              <Input
                label="Processing Time (days)"
                type="number"
                value={formData.shipping.processingTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shipping: { ...formData.shipping, processingTime: parseInt(e.target.value) },
                  })
                }
                className="w-32"
              />
            </div>
          </Section>

          {/* SEO */}
          <Section title="SEO">
            <Input
              label="Meta Title"
              value={formData.seo.metaTitle}
              onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, metaTitle: e.target.value } })}
            />
            <Textarea
              label="Meta Description"
              value={formData.seo.metaDescription}
              onChange={(e) =>
                setFormData({ ...formData, seo: { ...formData.seo, metaDescription: e.target.value } })
              }
              rows={3}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SEO Keywords</label>
              <input
                type="text"
                onKeyDown={addKeyword}
                placeholder="Press Enter to add keyword"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {Array.isArray(formData.seo?.keywords) && formData.seo.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    <span>{keyword}</span>
                    <button type="button" onClick={() => removeKeyword(keyword)} className="hover:text-blue-900">
                      <FiX size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </Section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status */}
          <Section title="Status">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Product Active</span>
            </label>
          </Section>

          {/* Images */}
          <Section title="Product Images">
            <div className="space-y-3">
              {Array.isArray(formData.images) && formData.images.map((img, index) => (
                <div key={index} className="relative group">
                  <img src={img} alt={`Product ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <Input
              placeholder="Image URL"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addImage(e.target.value)
                  e.target.value = ''
                }
              }}
            />
            <p className="text-xs text-gray-500">Press Enter to add image URL</p>
          </Section>

          {/* Tags */}
          <Section title="Tags">
            <input
              type="text"
              onKeyDown={addTag}
              placeholder="Press Enter to add tag"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {Array.isArray(formData.tags) && formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  <span>{tag}</span>
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-gray-900">
                    <FiX size={14} />
                  </button>
                </span>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </form>
  )
}

// Helper Components
function Section({ title, children }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Input({ label, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
      <input
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        {...props}
      />
    </div>
  )
}

function Textarea({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
      <textarea
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        {...props}
      />
    </div>
  )
}
