// app/seller/(seller)/products/add/page.jsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useAuth } from '@/lib/context/AuthContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { toast } from 'react-hot-toast'

const CATEGORIES = [
  'Electronics', 'Fashion', 'Home & Decor', 'Beauty', 
  'Books', 'Sports', 'Groceries', 'Health & Fitness', 'Gifts'
]

export default function AddProductPage() {
  const router = useRouter()
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    shortDescription: '',
    category: '',
    subCategory: '',
    brand: '',
    sku: '',
    basePrice: '',
    salePrice: '',
    costPrice: '',
    stock: '',
    lowStockThreshold: '10',
    trackInventory: true,
    weight: '',
    freeShipping: false,
    shippingFee: '',
    specifications: [{ key: '', value: '' }]
  })

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  function handleSpecChange(index, field, value) {
    const newSpecs = [...form.specifications]
    newSpecs[index][field] = value
    setForm(prev => ({ ...prev, specifications: newSpecs }))
  }

  function addSpecification() {
    setForm(prev => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }]
    }))
  }

  function removeSpecification(index) {
    setForm(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        name: form.name,
        description: form.description,
        shortDescription: form.shortDescription,
        category: form.category,
        subCategory: form.subCategory,
        brand: form.brand,
        sku: form.sku || `SKU-${Date.now()}`,
        pricing: {
          basePrice: Number(form.basePrice),
          salePrice: form.salePrice ? Number(form.salePrice) : undefined,
          costPrice: form.costPrice ? Number(form.costPrice) : undefined
        },
        inventory: {
          stock: Number(form.stock),
          lowStockThreshold: Number(form.lowStockThreshold),
          trackInventory: form.trackInventory
        },
        shipping: {
          weight: form.weight ? Number(form.weight) : undefined,
          freeShipping: form.freeShipping,
          shippingFee: form.shippingFee ? Number(form.shippingFee) : undefined
        },
        specifications: form.specifications.filter(spec => spec.key && spec.value),
        images: [{
          url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
          alt: form.name
        }]
      }

      const response = await axios.post('/api/seller/products', payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        toast.success('Product added successfully!')
        router.push('/seller/products')
      } else {
        toast.error(response.data.message || 'Failed to add product')
      }
    } catch (error) {
      console.error('Add product error:', error)
      toast.error(error.response?.data?.message || 'Failed to add product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Add New Product</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          
          <Input
            label="Product Name *"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="e.g., Wireless Bluetooth Headphones"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Short Description *
            </label>
            <input
              name="shortDescription"
              value={form.shortDescription}
              onChange={handleChange}
              required
              maxLength={160}
              placeholder="Brief product description (max 160 characters)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Description *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Detailed product description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <Input
              label="Sub Category"
              name="subCategory"
              value={form.subCategory}
              onChange={handleChange}
              placeholder="e.g., Audio"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Brand"
              name="brand"
              value={form.brand}
              onChange={handleChange}
              placeholder="e.g., Sony"
            />

            <Input
              label="SKU"
              name="sku"
              value={form.sku}
              onChange={handleChange}
              placeholder="Auto-generated if left empty"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <h2 className="text-xl font-semibold mb-4">Pricing</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Base Price *"
              name="basePrice"
              type="number"
              value={form.basePrice}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="999"
            />

            <Input
              label="Sale Price"
              name="salePrice"
              type="number"
              value={form.salePrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="799"
            />

            <Input
              label="Cost Price"
              name="costPrice"
              type="number"
              value={form.costPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="600"
            />
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <h2 className="text-xl font-semibold mb-4">Inventory</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Stock Quantity *"
              name="stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              required
              min="0"
              placeholder="100"
            />

            <Input
              label="Low Stock Threshold"
              name="lowStockThreshold"
              type="number"
              value={form.lowStockThreshold}
              onChange={handleChange}
              min="0"
              placeholder="10"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="trackInventory"
              checked={form.trackInventory}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700">
              Track inventory for this product
            </label>
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <h2 className="text-xl font-semibold mb-4">Shipping</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Weight (kg)"
              name="weight"
              type="number"
              value={form.weight}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.5"
            />

            <Input
              label="Shipping Fee (₹)"
              name="shippingFee"
              type="number"
              value={form.shippingFee}
              onChange={handleChange}
              disabled={form.freeShipping}
              min="0"
              placeholder="50"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="freeShipping"
              checked={form.freeShipping}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700">
              Free shipping
            </label>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Specifications</h2>
            <Button type="button" variant="outline" onClick={addSpecification}>
              Add Specification
            </Button>
          </div>

          {form.specifications.map((spec, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="e.g., Battery Life"
                value={spec.key}
                onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
              />
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., 30 hours"
                  value={spec.value}
                  onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                />
                {form.specifications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="submit"
            loading={loading}
            className="flex-1"
          >
            Add Product
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
