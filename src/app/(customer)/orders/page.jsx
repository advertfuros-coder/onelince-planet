// app/(customer)/orders/page.jsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import { formatDate, formatPrice } from '@/lib/utils/formatters'
import { FiPackage, FiChevronRight, FiClock, FiTruck, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import Button from '@/components/ui/Button'

export default function OrdersPage() {
  const { token, isAuthenticated } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) return

    axios
      .get('/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((res) => {
        setOrders(res.data.orders || [])
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [isAuthenticated, token])

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FiClock className="w-5 h-5" />,
      processing: <FiPackage className="w-5 h-5" />,
      shipped: <FiTruck className="w-5 h-5" />,
      delivered: <FiCheckCircle className="w-5 h-5" />,
      cancelled: <FiXCircle className="w-5 h-5" />
    }
    return icons[status] || <FiPackage className="w-5 h-5" />
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">Please login to view your orders.</p>
          <Link href="/login">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
              Login Now
            </button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 mt-4">Loading orders...</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <FiPackage className="w-20 h-20 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h2>
        <p className="text-gray-600 mb-6">Start shopping now to place your first order.</p>
        <Link href="/products">
          <Button>Shop Now</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-extrabold mb-6">My Orders</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <div className="text-sm text-gray-500">Order Number</div>
                <div className="font-semibold text-lg text-gray-900">{order.orderNumber || order._id.slice(-8).toUpperCase()}</div>
              </div>
              <div className="hidden md:block">
                <div className="text-sm text-gray-500">Order Date</div>
                <div className="font-medium text-gray-900">{formatDate(order.createdAt)}</div>
              </div>
              <div className="hidden md:block">
                <div className="text-sm text-gray-500">Total</div>
                <div className="font-semibold text-gray-900">{formatPrice(order.pricing?.total)}</div>
              </div>
              <div>
                <span className={`flex items-center space-x-2 px-4 py-2 font-semibold rounded-full border-2 capitalize ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span>{order.status}</span>
                </span>
              </div>
              <Link href={`/orders/${order._id}`}>
                <button className="ml-4 md:ml-8 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center space-x-1">
                  <FiChevronRight className="w-5 h-5" />
                  <span>View Details</span>
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
