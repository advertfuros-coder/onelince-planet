// app/(admin)/products/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import Link from 'next/link'
import {
  FiSearch,
  FiFilter,
  FiPlus,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiDownload,
  FiUpload,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiPackage,
  FiTrendingUp,
  FiTrendingDown,
} from 'react-icons/fi'

export default function AdminProductsPage() {
  const { token } = useAuth()
  const [products, setProducts] = useState([])
  const [stats, setStats] = useState({})
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProducts, setSelectedProducts] = useState([])

  // Filters
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [order, setOrder] = useState('desc')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    if (token) fetchProducts()
  }, [token, page, categoryFilter, statusFilter, sortBy, order])

  async function fetchProducts() {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page,
        limit: 20,
        ...(search && { search }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(statusFilter && { status: statusFilter }),
        sortBy,
        order,
      })

      const res = await axios.get(`/api/admin/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      console.log(res.data)

      if (res.data.success) {
        setProducts(res.data.products)
        setStats(res.data.stats)
        setCategories(res.data.categories)
        setPagination(res.data.pagination)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e) {
    e.preventDefault()
    setPage(1)
    fetchProducts()
  }

  function toggleProductSelection(productId) {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }

  function toggleSelectAll() {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map((p) => p._id))
    }
  }

  async function handleBulkAction(action) {
    if (selectedProducts.length === 0) {
      alert('Please select products first')
      return
    }

    if (!confirm(`Are you sure you want to ${action} ${selectedProducts.length} product(s)?`)) return

    try {
      const res = await axios.patch(
        '/api/admin/products',
        { productIds: selectedProducts, action },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.data.success) {
        alert(res.data.message)
        setSelectedProducts([])
        fetchProducts()
      }
    } catch (error) {
      alert('Failed to perform bulk action')
    }
  }

  async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const res = await axios.delete(`/api/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.success) {
        alert('Product deleted successfully')
        fetchProducts()
      }
    } catch (error) {
      alert('Failed to delete product')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Product Management</h1>
          <p className="text-gray-600 mt-1">Manage all products on the platform</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <FiDownload />
            <span>Export</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <FiUpload />
            <span>Import</span>
          </button>
          <Link
            href="/admin/products/new"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FiPlus />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard
          label="Total"
          value={stats.totalProducts || 0}
          icon={<FiPackage />}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          label="Pending"
          value={stats.pendingApproval || 0}
          icon={<FiAlertCircle />}
          color="text-yellow-600"
          bgColor="bg-yellow-50"
        />
        <StatCard
          label="Active"
          value={stats.activeProducts || 0}
          icon={<FiCheckCircle />}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          label="Inactive"
          value={stats.inactiveProducts || 0}
          icon={<FiXCircle />}
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <StatCard
          label="Out of Stock"
          value={stats.outOfStock || 0}
          icon={<FiAlertCircle />}
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
        <StatCard
          label="Low Stock"
          value={stats.lowStock || 0}
          icon={<FiTrendingDown />}
          color="text-yellow-600"
          bgColor="bg-yellow-50"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="md:col-span-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending Approval</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt">Date Added</option>
            <option value="name">Name</option>
            <option value="pricing.salePrice">Price</option>
            <option value="inventory.stock">Stock</option>
          </select>

          {/* Order */}
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-blue-900">
              {selectedProducts.length} product(s) selected
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleBulkAction('approve')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                Approve
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
              >
                Reject
              </button>
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
              >
                Deactivate
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedProducts.length === products.length && products.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Seller
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product._id)}
                          onChange={() => toggleProductSelection(product._id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.images?.[0]?.url || '/images/placeholder-product.jpg'}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />



                          <div>
                            <p className="font-semibold text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{product.category}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            ₹{product.pricing?.salePrice?.toLocaleString('en-IN')}
                          </p>
                          {product.pricing?.basePrice !== product.pricing?.salePrice && (
                            <p className="text-sm text-gray-500 line-through">
                              ₹{product.pricing?.basePrice?.toLocaleString('en-IN')}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${product.inventory?.stock === 0
                            ? 'bg-red-100 text-red-700'
                            : product.inventory?.stock <= 10
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                            }`}
                        >
                          {product.inventory?.stock || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.seller?.businessName || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          {product.isApproved ? (
                            <span className="flex items-center space-x-1 text-green-600 text-xs font-semibold bg-green-50 px-2 py-0.5 rounded-full w-fit">
                              <FiCheckCircle />
                              <span>Approved</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 text-yellow-600 text-xs font-semibold bg-yellow-50 px-2 py-0.5 rounded-full w-fit">
                              <FiAlertCircle />
                              <span>Pending</span>
                            </span>
                          )}
                          {product.isActive ? (
                            <span className="flex items-center space-x-1 text-blue-600 text-xs font-semibold bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                              <FiCheckCircle />
                              <span>Live</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 text-red-600 text-xs font-semibold bg-red-50 px-2 py-0.5 rounded-full w-fit">
                              <FiXCircle />
                              <span>Hidden</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end space-x-2">
                          {!product.isApproved && (
                            <button
                              onClick={async () => {
                                try {
                                  await axios.patch(
                                    '/api/admin/products',
                                    { productIds: [product._id], action: 'approve' },
                                    { headers: { Authorization: `Bearer ${token}` } }
                                  )
                                  fetchProducts()
                                } catch (error) {
                                  alert('Failed to approve product')
                                }
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Approve"
                            >
                              <FiCheckCircle />
                            </button>
                          )}
                          <Link
                            href={`/admin/products/${product._id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View"
                          >
                            <FiEye />
                          </Link>
                          <Link
                            href={`/admin/products/${product._id}/edit`}
                            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 />
                          </Link>
                          <button
                            onClick={() => deleteProduct(product._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
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
              <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Showing {(page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} products
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <div className={`${color} text-xl`}>{icon}</div>
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}
