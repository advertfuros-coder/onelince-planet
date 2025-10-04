// app/seller/(seller)/products/page.jsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { useAuth } from '@/lib/context/AuthContext'
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils/formatters'
import { toast } from 'react-hot-toast'

export default function SellerProductsPage() {
  const { token } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  function fetchProducts() {
    axios.get('/api/seller/products', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setProducts(res.data.products))
      .finally(() => setLoading(false))
  }

  async function deleteProduct(id) {
    if (!confirm('Delete this product?')) return
    await axios.delete(`/api/seller/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    toast.success('Deleted')
    fetchProducts()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Products</h1>
        <Link href="/seller/products/add">
          <Button className="flex items-center space-x-2">
            <FiPlus className="w-5 h-5" />
            <span>Add Product</span>
          </Button>
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-600">No products yet.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map(p => (
                <tr key={p._id}>
                  <td className="px-6 py-4 flex items-center space-x-3">
                    <img src={p.images?.[0]?.url || '/images/placeholder-product.jpg'} className="w-12 h-12 object-cover rounded" alt={p.name} />
                    <span className="font-medium">{p.name}</span>
                  </td>
                  <td className="px-6 py-4">{formatPrice(p.pricing.basePrice)}</td>
                  <td className="px-6 py-4">{p.inventory.stock}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${p.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {p.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link href={`/seller/products/edit/${p._id}`}>
                      <button className="text-blue-600 hover:text-blue-800"><FiEdit /></button>
                    </Link>
                    <button onClick={() => deleteProduct(p._id)} className="text-red-600 hover:text-red-800"><FiTrash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
