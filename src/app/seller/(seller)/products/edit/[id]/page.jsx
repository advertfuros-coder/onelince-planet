// seller/(seller)/products/edit/[id]/page.jsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  FiUpload,
  FiX,
  FiPlus,
  FiMinus,
  FiSave,
  FiEye,
  FiTrash2
} from 'react-icons/fi'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { toast } from 'react-hot-toast'

export default function EditProduct() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [productData, setProductData] = useState({
    name: '',
    shortDescription: '',
    description: '',
    category: '',
    brand: '',
    sku: '',
    pricing: {
      basePrice: '',
      salePrice: '',
      costPrice: ''
    },
    inventory: {
      stock: '',
      lowStockThreshold: 10,
      trackInventory: true
    },
    images: [],
    variants: [],
    specifications: [],
    shipping: {
      weight: '',
      dimensions: {
        length: '',
        width: '',
        height: ''
      },
      freeShipping: false,
      shippingFee: ''
    },
    isActive: true,
    isFeatured: false
  })

  useEffect(() => {
    loadProduct()
  }, [params.id])

  const loadProduct = async () => {
    try {
      // Mock data - replace with actual API call
      const mockProduct = {
        name: 'Wireless Bluetooth Headphones',
        shortDescription: 'Premium quality wireless headphones with noise cancellation',
        description: 'Experience crystal-clear audio with these premium wireless headphones featuring advanced noise cancellation technology...',
        category: 'Electronics',
        brand: 'TechPro',
        sku: 'WBH-001',
        pricing: {
          basePrice: '2999',
          salePrice: '2499',
          costPrice: '1800'
        },
        inventory: {
          stock: '25',
          lowStockThreshold: 10,
          trackInventory: true
        },
        images: ['/images/headphones.jpg', '/images/headphones-2.jpg'],
        variants: [
          { name: 'Color', value: 'Black', price: '0', stock: '15' },
          { name: 'Color', value: 'White', price: '100', stock: '10' }
        ],
        specifications: [
          { key: 'Battery Life', value: '30 hours' },
          { key: 'Connectivity', value: 'Bluetooth 5.0' },
          { key: 'Weight', value: '250g' }
        ],
        shipping: {
          weight: '0.5',
          dimensions: {
            length: '20',
            width: '18',
            height: '8'
          },
          freeShipping: true,
          shippingFee: ''
        },
        isActive: true,
        isFeatured: false
      }
      setProductData(mockProduct)
    } catch (error) {
      toast.error('Error loading product')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // API call to update product
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Product updated successfully!')
      router.push('/seller/products')
    } catch (error) {
      toast.error('Error updating product')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setLoading(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        toast.success('Product deleted successfully!')
        router.push('/seller/products')
      } catch (error) {
        toast.error('Error deleting product')
      } finally {
        setLoading(false)
      }
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  // Similar form structure as AddProduct but with pre-filled data
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-600">Update product information</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleDelete} className="text-red-600 border-red-300 hover:bg-red-50">
            <FiTrash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button variant="outline">
            <FiEye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {/* Same form structure as AddProduct but with update functionality */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form content similar to AddProduct */}
        
        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/seller/products')}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex items-center space-x-2">
            <FiSave className="w-4 h-4" />
            <span>Update Product</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
