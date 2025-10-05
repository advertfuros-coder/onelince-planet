// app/(admin)/orders/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import Link from 'next/link'
import {
  FiSearch,
  FiFilter,
  FiDownload,
  FiEye,
  FiPackage,
  FiClock,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiDollarSign,
  FiShoppingCart,
  FiAlertCircle,
} from 'react-icons/fi'

export default function AdminOrdersPage() {
  const { token } = useAuth()
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedOrders, setSelectedOrders] = useState([])

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [order, setOrder] = useState('desc')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    if (token) fetchOrders()
  }, [token, page, statusFilter, paymentFilter, sortBy, order])

  async function fetchOrders() {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page,
        limit: 20,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(paymentFilter && { paymentStatus: paymentFilter }),
        sortBy,
        order,
      })

      const res = await axios.get(`/api/admin/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.success) {
        setOrders(res.data.orders)
        setStats(res.data.stats)
        setPagination(res.data.pagination)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e) {
    e.preventDefault()
    setPage(1)
    fetchOrders()
  }

  function toggleOrderSelection(orderId) {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    )
  }

  function toggleSelectAll() {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(orders.map((o) => o._id))
    }
  }

  async function handleBulkStatusUpdate(status) {
    if (selectedOrders.length === 0) {
      alert('Please select orders first')
      return
    }

    if (!confirm(`Update ${selectedOrders.length} order(s) to ${status}?`)) return

    try {
      const res = await axios.patch(
        '/api/admin/orders',
        { orderIds: selectedOrders, action: 'updateStatus', status },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.data.success) {
        alert(res.data.message)
        setSelectedOrders([])
        fetchOrders()
      }
    } catch (error) {
      alert('Failed to update orders')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      processing: 'bg-blue-100 text-blue-800 border-blue-300',
      confirmed: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      shipped: 'bg-purple-100 text-purple-800 border-purple-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      returned: 'bg-orange-100 text-orange-800 border-orange-300',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const getPaymentStatusColor = (status) => {
    const colors = {
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
      refunded: 'bg-gray-100 text-gray-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">Manage all orders on the platform</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <FiDownload />
          <span>Export Orders</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Orders"
          value={stats.totalOrders || 0}
          icon={<FiShoppingCart />}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          label="Pending"
          value={stats.pendingOrders || 0}
          icon={<FiClock />}
          color="text-yellow-600"
          bgColor="bg-yellow-50"
        />
        <StatCard
          label="Delivered"
          value={stats.deliveredOrders || 0}
          icon={<FiCheckCircle />}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          label="Total Revenue"
          value={`₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`}
          icon={<FiDollarSign />}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Processing"
          value={stats.processingOrders || 0}
          icon={<FiPackage />}
          color="text-blue-600"
          bgColor="bg-blue-50"
          small
        />
        <StatCard
          label="Shipped"
          value={stats.shippedOrders || 0}
          icon={<FiTruck />}
          color="text-purple-600"
          bgColor="bg-purple-50"
          small
        />
        <StatCard
          label="Cancelled"
          value={stats.cancelledOrders || 0}
          icon={<FiXCircle />}
          color="text-red-600"
          bgColor="bg-red-50"
          small
        />
        <StatCard
          label="Avg Order Value"
          value={`₹${Math.round((stats.totalRevenue || 0) / (stats.totalOrders || 1)).toLocaleString('en-IN')}`}
          icon={<FiDollarSign />}
          color="text-green-600"
          bgColor="bg-green-50"
          small
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="md:col-span-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number, name, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>

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
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
          </select>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value)
              setPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt">Date</option>
            <option value="pricing.total">Amount</option>
            <option value="orderNumber">Order Number</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-blue-900">{selectedOrders.length} order(s) selected</p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleBulkStatusUpdate('processing')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Mark Processing
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('shipped')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
              >
                Mark Shipped
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('delivered')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                Mark Delivered
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
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
                        checked={selectedOrders.length === orders.length && orders.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Order Number
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                      Payment
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
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order._id)}
                          onChange={() => toggleOrderSelection(order._id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/orders/${order.orderNumber}`}
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{order.customer?.name || order.shippingAddress?.name}</p>
                          <p className="text-sm text-gray-600">{order.customer?.phone || order.shippingAddress?.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">₹{order.pricing?.total?.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-gray-600">{order.items?.length || 0} items</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-semibold capitalize ${getPaymentStatusColor(
                              order.payment?.status
                            )}`}
                          >
                            {order.payment?.status}
                          </span>
                          <p className="text-xs text-gray-600 capitalize">{order.payment?.method}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border capitalize ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/orders/${order.orderNumber}`}
                          className="flex justify-end"
                        >
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                            <FiEye />
                          </button>
                        </Link>
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
                  {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} orders
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

function StatCard({ label, value, icon, color, bgColor, small = false }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <div className={`${color} ${small ? 'text-lg' : 'text-xl'}`}>{icon}</div>
        </div>
        <div>
          <p className={`text-sm text-gray-600 ${small ? 'text-xs' : ''}`}>{label}</p>
          <p className={`font-bold text-gray-900 ${small ? 'text-lg' : 'text-2xl'}`}>{value}</p>
        </div>
      </div>
    </div>
  )
}
