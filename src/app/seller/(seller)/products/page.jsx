// app/(seller)/products/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import Link from 'next/link'
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiPackage,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiFilter,
  FiDownload,
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'

export default function SellerProductsPage() {
  const { token } = useAuth()
  const [products, setProducts] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    if (token) fetchProducts()
  }, [token, search, selectedCategory, selectedStatus, page])

  async function fetchProducts() {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        ...(search && { search }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedStatus && { status: selectedStatus }),
      })

      const res = await axios.get(`/api/seller/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.success) {
        setProducts(res.data.products)
        setStats(res.data.stats)
        setPagination(res.data.pagination)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const res = await axios.delete(`/api/seller/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.success) {
        toast.success('Product deleted successfully')
        fetchProducts()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product')
    }
  }

  async function toggleProductStatus(productId, currentStatus) {
    try {
      const res = await axios.put(
        `/api/seller/products/${productId}`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.data.success) {
        toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'}`)
        fetchProducts()
      }
    } catch (error) {
      toast.error('Failed to update product status')
    }
  }

  const formatCurrency = (value) => `₹${(value || 0).toLocaleString('en-IN')}`

  const categories = [...new Set(products.map((p) => p.category))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">📦 My Products</h1>
            <p className="mt-2 text-purple-100">Manage your product inventory</p>
          </div>
          <Link
            href="/seller/products/new"
            className="flex items-center space-x-2 px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 font-semibold shadow-lg"
          >
            <FiPlus />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total Products" value={stats.total} icon={<FiPackage />} color="text-blue-600" bgColor="bg-blue-50" />
        <StatCard label="Active" value={stats.active} icon={<FiCheckCircle />} color="text-green-600" bgColor="bg-green-50" />
        <StatCard label="Inactive" value={stats.inactive} icon={<FiXCircle />} color="text-red-600" bgColor="bg-red-50" />
        <StatCard label="Pending Approval" value={stats.pending} icon={<FiAlertCircle />} color="text-yellow-600" bgColor="bg-yellow-50" />
        <StatCard label="Low Stock" value={stats.lowStock} icon={<FiAlertCircle />} color="text-orange-600" bgColor="bg-orange-50" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
          </select>

          <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <FiDownload />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No products found</p>
            <Link
              href="/seller/products/new"
              className="mt-4 inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Add Your First Product
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Price</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Stock</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {product.images?.[0]?.url ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <FiPackage className="text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            {product.brand && <p className="text-sm text-gray-600">{product.brand}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.sku}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm">
                          <p className="font-semibold text-gray-900">{formatCurrency(product.pricing.salePrice || product.pricing.basePrice)}</p>
                          {product.pricing.salePrice && (
                            <p className="text-gray-500 line-through text-xs">{formatCurrency(product.pricing.basePrice)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`font-semibold ${
                            product.inventory.stock <= product.inventory.lowStockThreshold
                              ? 'text-red-600'
                              : 'text-gray-900'
                          }`}
                        >
                          {product.inventory.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center space-y-1">
                          <StatusBadge status={product.isActive ? 'active' : 'inactive'} />
                          {!product.isApproved && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                              Pending
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => toggleProductStatus(product._id, product.isActive)}
                            className={`p-2 rounded transition-colors ${
                              product.isActive
                                ? 'text-yellow-600 hover:bg-yellow-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={product.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {product.isActive ? <FiXCircle /> : <FiCheckCircle />}
                          </button>
                          <Link
                            href={`/seller/products/${product._id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <FiEdit2 />
                          </Link>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {(page - 1) * pagination.limit + 1} to {Math.min(page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} products
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.pages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color, bgColor }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <div className={`${color}`}>{icon}</div>
        </div>
        <div>
          <p className="text-xs text-gray-600">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value || 0}</p>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const statusConfig = {
    active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
    inactive: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Inactive' },
  }

  const config = statusConfig[status] || statusConfig.inactive

  return (
    <span className={`px-2 py-1 ${config.bg} ${config.text} rounded-full text-xs font-semibold`}>
      {config.label}
    </span>
  )
}
