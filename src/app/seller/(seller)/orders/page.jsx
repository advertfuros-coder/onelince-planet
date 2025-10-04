// app/seller/(seller)/orders/page.jsx
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { useAuth } from '@/lib/context/AuthContext'
import { toast } from 'react-hot-toast'
import { 
  FiEye,
  FiDownload,
  FiSearch,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiRefreshCw,
  FiFilter,
  FiMoreVertical
} from 'react-icons/fi'
import Button from '@/components/ui/Button'

export default function SellerOrders() {
  const { token } = useAuth()
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [selectedOrders, setSelectedOrders] = useState([])
  const [bulkAction, setBulkAction] = useState('')
  const [showBulkActions, setShowBulkActions] = useState(false)

  useEffect(() => {
    if (token) {
      loadOrders()
      loadStats()
    }
  }, [token, statusFilter, dateRange])

  const loadOrders = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (dateRange !== 'all') params.append('dateRange', dateRange)
      if (searchTerm) params.append('search', searchTerm)

      const response = await axios.get(`/api/seller/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setOrders(response.data.orders)
      }
    } catch (error) {
      console.error('Error loading orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await axios.get('/api/seller/orders/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setStats(response.data.stats)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    loadOrders()
  }

  const handleExport = async () => {
    try {
      const response = await axios.get('/api/seller/orders/export', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `orders-${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      toast.success('Orders exported successfully')
    } catch (error) {
      console.error('Error exporting:', error)
      toast.error('Failed to export orders')
    }
  }

  const handleBulkUpdate = async () => {
    if (!bulkAction || selectedOrders.length === 0) {
      toast.error('Please select orders and an action')
      return
    }

    try {
      const response = await axios.post(
        '/api/seller/orders/bulk-update',
        {
          orderIds: selectedOrders,
          status: bulkAction
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success) {
        toast.success(response.data.message)
        setSelectedOrders([])
        setBulkAction('')
        setShowBulkActions(false)
        loadOrders()
        loadStats()
      }
    } catch (error) {
      console.error('Error bulk updating:', error)
      toast.error('Failed to update orders')
    }
  }

  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const selectAllOrders = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(orders.map(o => o._id))
    }
  }

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FiClock className="w-4 h-4" />,
      processing: <FiPackage className="w-4 h-4" />,
      shipped: <FiTruck className="w-4 h-4" />,
      delivered: <FiCheckCircle className="w-4 h-4" />,
      cancelled: <FiXCircle className="w-4 h-4" />
    }
    return icons[status] || <FiPackage className="w-4 h-4" />
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      processing: 'bg-blue-100 text-blue-800 border-blue-300',
      shipped: 'bg-purple-100 text-purple-800 border-purple-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  if (loading && !stats) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-gray-200 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-1">Manage and track your customer orders</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={loadOrders}
            className="flex items-center space-x-2"
          >
            <FiRefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExport}
            className="flex items-center space-x-2"
          >
            <FiDownload className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <StatCard 
            label="Total Orders" 
            value={stats.totalOrders} 
            color="blue"
            icon={FiPackage}
          />
          <StatCard 
            label="Pending" 
            value={stats.pending} 
            color="yellow"
            icon={FiClock}
          />
          <StatCard 
            label="Processing" 
            value={stats.processing} 
            color="blue"
            icon={FiPackage}
          />
          <StatCard 
            label="Shipped" 
            value={stats.shipped} 
            color="purple"
            icon={FiTruck}
          />
          <StatCard 
            label="Delivered" 
            value={stats.delivered} 
            color="green"
            icon={FiCheckCircle}
          />
          <StatCard 
            label="Cancelled" 
            value={stats.cancelled} 
            color="red"
            icon={FiXCircle}
          />
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-sm p-4 text-white h-full flex flex-col justify-center">
              <p className="text-sm font-medium mb-1 opacity-90">Total Revenue</p>
              <p className="text-2xl font-bold">
                {formatPrice(stats.totalRevenue)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Bulk Actions */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order ID or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          <Button type="submit">Search</Button>
        </form>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900">
              {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
            </p>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Action</option>
              <option value="processing">Mark as Processing</option>
              <option value="shipped">Mark as Shipped</option>
              <option value="delivered">Mark as Delivered</option>
            </select>
            <Button 
              onClick={handleBulkUpdate}
              size="sm"
              disabled={!bulkAction}
            >
              Apply
            </Button>
            <button
              onClick={() => setSelectedOrders([])}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
          <FiPackage className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">Orders will appear here once customers start purchasing</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === orders.length && orders.length > 0}
                      onChange={selectAllOrders}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order._id)}
                        onChange={() => toggleOrderSelection(order._id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {order.customer?.name || 'Guest'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer?.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {formatPrice(order.sellerTotal)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border-2 capitalize ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1.5">{order.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/seller/orders/${order._id}`}>
                        <button className="text-blue-600 hover:text-blue-900 font-semibold flex items-center space-x-1 transition-colors">
                          <FiEye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// Stat Card Component
function StatCard({ label, value, color, icon: Icon }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <div className={`w-8 h-8 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
