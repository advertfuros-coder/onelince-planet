// app/seller/(seller)/orders/page.jsx
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
  FiAlertCircle,
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'

export default function SellerOrdersPage() {
  const { token } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (token) fetchOrders()
  }, [token, selectedStatus, page])

  // Debounce search
  useEffect(() => {
    if (token) {
      const timer = setTimeout(() => {
        fetchOrders()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [search])

  async function fetchOrders() {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: page.toString(),
        ...(search && { search }),
        ...(selectedStatus && { status: selectedStatus }),
      })

      const res = await axios.get(`/api/seller/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.success) {
        setOrders(res.data.orders || [])
      } else {
        setError(res.data.message || 'Failed to load orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError(error.response?.data?.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats from orders array
  const calculateStats = () => {
    const stats = {
      totalOrders: orders.length,
      pendingOrders: 0,
      processingOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      totalRevenue: 0,
    }

    orders.forEach(order => {
      const status = order?.status || 'pending'
      const pricing = order?.pricing || {}
      
      if (status === 'pending') stats.pendingOrders++
      if (status === 'processing') stats.processingOrders++
      if (status === 'shipped') stats.shippedOrders++
      if (status === 'delivered') stats.deliveredOrders++
      if (status === 'cancelled') stats.cancelledOrders++
      
      if (status === 'delivered') {
        stats.totalRevenue += pricing.total || 0
      }
    })

    return stats
  }

  const stats = calculateStats()

  const formatCurrency = (value) => `₹${(value || 0).toLocaleString('en-IN')}`
  
  const formatDate = (date) => {
    if (!date) return 'N/A'
    try {
      return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch (error) {
      return 'N/A'
    }
  }

  // Filter orders by search term
  const filteredOrders = orders.filter(order => {
    if (!search) return true
    
    const searchLower = search.toLowerCase()
    const orderNumber = (order?.orderNumber || '').toLowerCase()
    const customerId = (order?._id || '').toString().toLowerCase()
    const customerName = (order?.shippingAddress?.fullName || '').toLowerCase()
    
    return orderNumber.includes(searchLower) || 
           customerId.includes(searchLower) || 
           customerName.includes(searchLower)
  })

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <h1 className="text-3xl font-bold">📦 Orders Management</h1>
        </div>
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
          <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-2">Error Loading Orders</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={fetchOrders}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

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
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
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

        {/* Search Results Count */}
        {search && (
          <div className="mt-3 text-sm text-gray-600">
            Found {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} matching "{search}"
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium text-lg mb-2">
              {search ? 'No orders found' : 'No orders yet'}
            </p>
            <p className="text-gray-500 text-sm">
              {search ? 'Try adjusting your search' : 'Orders will appear here once customers place orders'}
            </p>
          </div>
        ) : (
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
                {filteredOrders.map((order) => (
                  <OrderRow key={order?._id || Math.random()} order={order} formatCurrency={formatCurrency} formatDate={formatDate} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// Order Row Component (Error-Proof)
function OrderRow({ order, formatCurrency, formatDate }) {
  if (!order) return null

  try {
    const orderId = order._id?.toString() || 'N/A'
    const orderNumber = order.orderNumber || orderId.slice(-8)
    const items = Array.isArray(order.items) ? order.items : []
    const firstItem = items[0] || {}
    const pricing = order.pricing || {}
    const payment = order.payment || {}
    const shippingAddress = order.shippingAddress || {}
    const status = order.status || 'pending'
    const itemStatus = firstItem.status || status

    // Get first item details
    const itemName = firstItem.name || 'Product'
    const itemImage = Array.isArray(firstItem.images) && firstItem.images[0] 
      ? firstItem.images[0] 
      : null
    const itemCount = items.length

    return (
      <tr className="hover:bg-gray-50 transition-colors">
        {/* Order Number */}
        <td className="px-6 py-4">
          <div>
            <p className="font-semibold text-gray-900">
              #{orderNumber}
            </p>
            <p className="text-xs text-gray-500">
              {orderId.slice(-8)}
            </p>
          </div>
        </td>

        {/* Customer */}
        <td className="px-6 py-4">
          <div>
            <p className="font-medium text-gray-900">
              {shippingAddress.fullName || 'Guest Customer'}
            </p>
            <p className="text-sm text-gray-600">
              {shippingAddress.phone || 'No phone'}
            </p>
          </div>
        </td>

        {/* Items */}
        <td className="px-6 py-4">
          <div className="flex items-center space-x-2">
            {itemImage ? (
              <img
                src={itemImage}
                alt={itemName}
                className="w-10 h-10 object-cover rounded"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            ) : (
              <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                <FiPackage className="w-5 h-5 text-gray-400" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {itemName}
              </p>
              <p className="text-xs text-gray-600">
                {itemCount} item{itemCount > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </td>

        {/* Amount */}
        <td className="px-6 py-4 text-right">
          <p className="font-semibold text-gray-900">
            {formatCurrency(pricing.total || 0)}
          </p>
          {pricing.subtotal && pricing.subtotal !== pricing.total && (
            <p className="text-xs text-gray-500">
              Subtotal: {formatCurrency(pricing.subtotal)}
            </p>
          )}
        </td>

        {/* Payment */}
        <td className="px-6 py-4 text-center">
          <div>
            <p className="text-xs font-semibold text-gray-700 uppercase mb-1">
              {payment.method || 'COD'}
            </p>
            <PaymentBadge status={payment.status} />
          </div>
        </td>

        {/* Status */}
        <td className="px-6 py-4 text-center">
          <StatusBadge status={itemStatus} />
        </td>

        {/* Date */}
        <td className="px-6 py-4 text-sm text-gray-600">
          {formatDate(order.createdAt)}
        </td>

        {/* Actions */}
        <td className="px-6 py-4 text-right">
          <Link
            href={`/seller/orders/${orderId}`}
            className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-semibold"
          >
            <FiEye className="w-4 h-4" />
            <span className="text-sm">View</span>
          </Link>
        </td>
      </tr>
    )
  } catch (error) {
    console.error('OrderRow render error:', error)
    return null
  }
}

// Stat Card Component
function StatCard({ label, value, icon, color, bgColor }) {
  try {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${bgColor || 'bg-gray-100'}`}>
            <div className={`${color || 'text-gray-600'}`}>{icon}</div>
          </div>
          <div>
            <p className="text-xs text-gray-600">{label || 'N/A'}</p>
            <p className="text-lg font-bold text-gray-900">{value || 0}</p>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('StatCard error:', error)
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <p className="text-xs text-gray-500">Loading...</p>
      </div>
    )
  }
}

// Status Badge Component
function StatusBadge({ status }) {
  try {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Processing' },
      shipped: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Shipped' },
      delivered: { bg: 'bg-green-100', text: 'text-green-700', label: 'Delivered' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
      returned: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Returned' },
    }

    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending

    return (
      <span className={`px-3 py-1 ${config.bg} ${config.text} rounded-full text-xs font-semibold uppercase`}>
        {config.label}
      </span>
    )
  } catch (error) {
    console.error('StatusBadge error:', error)
    return (
      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
        N/A
      </span>
    )
  }
}

// Payment Badge Component
function PaymentBadge({ status }) {
  try {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
      paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'Paid' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
      failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed' },
      refunded: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Refunded' },
    }

    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending

    return (
      <span className={`px-2 py-1 ${config.bg} ${config.text} rounded text-xs font-semibold uppercase`}>
        {config.label}
      </span>
    )
  } catch (error) {
    console.error('PaymentBadge error:', error)
    return (
      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
        N/A
      </span>
    )
  }
}
