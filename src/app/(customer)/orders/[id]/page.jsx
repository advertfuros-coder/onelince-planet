// app/(customer)/orders/[id]/page.jsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
  FiArrowLeft,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCreditCard,
  FiDownload,
  FiRotateCcw,
  FiMessageSquare,
} from 'react-icons/fi'
import Button from '@/components/ui/Button'
import { toast } from 'react-hot-toast'

export default function OrderDetailPage({ params }) {
  const { token, isAuthenticated } = useAuth()
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    fetchOrderDetails()
  }, [isAuthenticated, token, params.id])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`/api/customer/orders/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.success) {
        setOrder(res.data.order)
      } else {
        toast.error('Order not found')
        router.push('/orders')
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      toast.error('Failed to load order details')
      router.push('/orders')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return

    try {
      const res = await axios.post(
        `/api/customer/orders/${params.id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.data.success) {
        toast.success('Order cancelled successfully')
        fetchOrderDetails()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order')
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPrice = (price) => {
    return `₹${Number(price || 0).toLocaleString('en-IN')}`
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
      refunded: 'bg-gray-100 text-gray-800 border-gray-300',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-gray-600 mt-4 font-medium">Loading order details...</p>
      </div>
    )
  }

  if (!order) {
    return null
  }

  const canCancel = ['pending', 'processing', 'confirmed'].includes(order.status)
  const canReturn = order.status === 'delivered'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Orders</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Order #{order.orderNumber}
              </h1>
              <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border-2 capitalize ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Timeline */}
            {order.timeline && order.timeline.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Timeline</h2>
                <div className="space-y-4">
                  {order.timeline.map((event, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <FiCheckCircle className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 capitalize">{event.status}</p>
                        <p className="text-sm text-gray-600">{event.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(event.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shipping Information */}
            {order.shipping?.trackingId && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <FiTruck className="w-5 h-5" />
                  <span>Shipping Information</span>
                </h2>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Tracking ID:</span>
                    <p className="font-medium text-gray-900">{order.shipping.trackingId}</p>
                  </div>
                  {order.shipping.carrier && (
                    <div>
                      <span className="text-sm text-gray-600">Carrier:</span>
                      <p className="font-medium text-gray-900">{order.shipping.carrier}</p>
                    </div>
                  )}
                  {order.shipping.estimatedDelivery && (
                    <div>
                      <span className="text-sm text-gray-600">Estimated Delivery:</span>
                      <p className="font-medium text-gray-900">
                        {formatDate(order.shipping.estimatedDelivery)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 pb-4 border-b last:border-b-0"
                  >
                    <img
                      src={item.images?.[0] || '/images/placeholder-product.jpg'}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Quantity: {item.quantity} × {formatPrice(item.price)}
                      </p>
                      <span
                        className={`inline-flex items-center text-xs px-2 py-1 rounded-full mt-2 ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Actions</h2>
              <div className="flex flex-wrap gap-3">
                {canCancel && (
                  <Button
                    variant="outline"
                    onClick={handleCancelOrder}
                    className="flex items-center space-x-2"
                  >
                    <FiXCircle className="w-4 h-4" />
                    <span>Cancel Order</span>
                  </Button>
                )}
                {canReturn && (
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/orders/${order._id}/return`)}
                    className="flex items-center space-x-2"
                  >
                    <FiRotateCcw className="w-4 h-4" />
                    <span>Return Order</span>
                  </Button>
                )}
                <Button variant="outline" className="flex items-center space-x-2">
                  <FiDownload className="w-4 h-4" />
                  <span>Download Invoice</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2">
                  <FiMessageSquare className="w-4 h-4" />
                  <span>Contact Support</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(order.pricing?.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">
                    {order.pricing?.shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPrice(order.pricing?.shipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (18% GST)</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(order.pricing?.tax)}
                  </span>
                </div>
                {order.pricing?.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Discount</span>
                    <span className="font-medium text-green-600">
                      -{formatPrice(order.pricing?.discount)}
                    </span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-gray-900">
                      {formatPrice(order.pricing?.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <FiCreditCard className="w-5 h-5" />
                <span>Payment</span>
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Method:</span>
                  <p className="font-medium text-gray-900 capitalize">
                    {order.payment?.method || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Status:</span>
                  <p>
                    <span
                      className={`inline-flex items-center text-xs px-2 py-1 rounded-full font-semibold ${
                        order.payment?.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : order.payment?.status === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {order.payment?.status || 'pending'}
                    </span>
                  </p>
                </div>
                {order.payment?.transactionId && (
                  <div>
                    <span className="text-sm text-gray-600">Transaction ID:</span>
                    <p className="font-medium text-gray-900 text-sm break-all">
                      {order.payment.transactionId}
                    </p>
                  </div>
                )}
                {order.payment?.couponCode && (
                  <div>
                    <span className="text-sm text-gray-600">Coupon Applied:</span>
                    <p className="font-medium text-green-700">{order.payment.couponCode}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <FiMapPin className="w-5 h-5" />
                <span>Delivery Address</span>
              </h2>
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-semibold text-gray-900">{order.shippingAddress?.name}</p>
                <p>{order.shippingAddress?.addressLine1}</p>
                {order.shippingAddress?.addressLine2 && (
                  <p>{order.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                  {order.shippingAddress?.pincode}
                </p>
                <p>{order.shippingAddress?.country}</p>
                <div className="pt-3 border-t mt-3">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FiPhone className="w-4 h-4" />
                    <span>{order.shippingAddress?.phone}</span>
                  </div>
                  {order.shippingAddress?.email && (
                    <div className="flex items-center space-x-2 text-gray-600 mt-1">
                      <FiMail className="w-4 h-4" />
                      <span className="text-sm">{order.shippingAddress.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
