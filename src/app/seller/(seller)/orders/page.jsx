// app/(seller)/orders/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import Link from 'next/link'
import {
  FiSearch,
  FiFilter,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiEye,
  FiDownload,
  FiRefreshCw,
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'

export default function SellerOrdersPage() {
  const { token } = useAuth()
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})

  useEffect(() => {
    if (token) fetchOrders()
  }, [token, search, selectedStatus, page])

  async function fetchOrders() {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        ...(search && { search }),
        ...(selectedStatus && { status: selectedStatus }),
      })

      const res = await axios.get(`/api/seller/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.success) {
        setOrders(res.data.orders)
        setStats(res.data.stats)
        setPagination(res.data.pagination)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => `₹${(value || 0).toLocaleString('en-IN')}`
  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">📦 Orders Management</h1>
            <p className="mt-2 text-blue-100">Manage and fulfill your orders</p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30"
          >
            <FiRefreshCw />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <StatCard
          label="Total Orders"
          value={stats.totalOrders}
          icon={<FiPackage />}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          label="Pending"
          value={stats.pendingOrders}
          icon={<FiClock />}
          color="text-yellow-600"
          bgColor="bg-yellow-50"
        />
        <StatCard
          label="Processing"
          value={stats.processingOrders}
          icon={<FiRefreshCw />}
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
        <StatCard
          label="Shipped"
          value={stats.shippedOrders}
          icon={<FiTruck />}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <StatCard
          label="Delivered"
          value={stats.deliveredOrders}
          icon={<FiCheckCircle />}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          label="Cancelled"
          value={stats.cancelledOrders}
          icon={<FiXCircle />}
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-sm p-4 text-white">
          <p className="text-xs mb-1">Total Revenue</p>
          <p className="text-lg font-bold">{formatCurrency(stats.totalRevenue)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number, customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
          </select>

          <button className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <FiDownload />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No orders found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Items
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => {
                    const itemTotal = order.items.reduce(
                      (sum, item) => sum + item.price * item.quantity,
                      0
                    )
                    const itemStatus = order.items[0]?.status || 'pending'

                    return (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">
                              #{order.orderNumber || order._id.slice(-8)}
                            </p>
                            {order.shipping?.trackingId && (
                              <p className="text-xs text-gray-600">
                                Tracking: {order.shipping.trackingId}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {order.customer?.name || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600">{order.customer?.phone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {order.items[0]?.images?.[0] && (
                              <img
                                src={order.items[0].images[0]}
                                alt=""
                                className="w-10 h-10 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {order.items[0]?.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {order.items.length} item(s)
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(itemTotal)}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <PaymentBadge status={order.payment?.status} />
                        </td>
                        <td className="px-6 py-4 text-center">
                          <StatusBadge status={itemStatus} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/seller/orders/${order._id}`}
                            className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                          >
                            <FiEye />
                            <span className="text-sm">View</span>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing {(page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} orders
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
      <div className="flex items-center space-x-2">
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <div className={`${color}`}>{icon}</div>
        </div>
        <div>
          <p className="text-xs text-gray-600">{label}</p>
          <p className="text-lg font-bold text-gray-900">{value || 0}</p>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const statusConfig = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
    processing: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Processing' },
    shipped: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Shipped' },
    delivered: { bg: 'bg-green-100', text: 'text-green-700', label: 'Delivered' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
    returned: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Returned' },
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <span className={`px-3 py-1 ${config.bg} ${config.text} rounded-full text-xs font-semibold`}>
      {config.label}
    </span>
  )
}

function PaymentBadge({ status }) {
  const statusConfig = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
    paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'Paid' },
    failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed' },
    refunded: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Refunded' },
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <span className={`px-2 py-1 ${config.bg} ${config.text} rounded text-xs font-semibold`}>
      {config.label}
    </span>
  )
}
