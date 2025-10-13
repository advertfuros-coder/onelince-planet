// app/seller/(seller)/orders/[id]/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiMapPin,
  FiUser,
  FiPhone,
  FiMail,
  FiCreditCard,
  FiAlertCircle,
  FiArrowLeft,
  FiEdit2,
  FiSave,
  FiCheck,
  FiX
} from 'react-icons/fi'
import Link from 'next/link'

export default function OrderDetailPage() {
  const { token } = useAuth()
  const params = useParams()
  const router = useRouter()
  const orderId = params.id

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [accepting, setAccepting] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  
  // Update form states
  const [isEditingStatus, setIsEditingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [trackingId, setTrackingId] = useState('')
  const [carrier, setCarrier] = useState('')
  const [cancellationReason, setCancellationReason] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)

  useEffect(() => {
    if (token && orderId) {
      fetchOrderDetails()
    }
  }, [token, orderId])

  async function fetchOrderDetails() {
    try {
      setLoading(true)
      setError(null)

      const res = await axios.get(`/api/seller/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.data.success) {
        setOrder(res.data.order)
        setNewStatus(res.data.order.status)
        setTrackingId(res.data.order.shipping?.trackingId || '')
        setCarrier(res.data.order.shipping?.carrier || '')
      } else {
        setError(res.data.message)
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      setError(error.response?.data?.message || 'Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  // Accept Order
  async function handleAcceptOrder() {
    try {
      setAccepting(true)

      const res = await axios.patch(
        `/api/seller/orders/${orderId}`,
        { action: 'accept' },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.data.success) {
        setOrder(res.data.order)
        toast.success('Order accepted successfully! 🎉')
      } else {
        toast.error(res.data.message)
      }
    } catch (error) {
      console.error('Error accepting order:', error)
      toast.error(error.response?.data?.message || 'Failed to accept order')
    } finally {
      setAccepting(false)
    }
  }

  // Cancel Order
  async function handleCancelOrder() {
    if (!cancellationReason.trim()) {
      toast.error('Please provide a cancellation reason')
      return
    }

    try {
      setCancelling(true)

      const res = await axios.patch(
        `/api/seller/orders/${orderId}`,
        { 
          status: 'cancelled',
          cancellationReason
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.data.success) {
        setOrder(res.data.order)
        setShowCancelModal(false)
        setCancellationReason('')
        toast.success('Order cancelled')
      } else {
        toast.error(res.data.message)
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
      toast.error(error.response?.data?.message || 'Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  // Update Order
  async function handleUpdateOrder() {
    try {
      setUpdating(true)

      const updateData = {}
      
      if (newStatus !== order.status) {
        updateData.status = newStatus
      }
      
      if (trackingId && trackingId !== order.shipping?.trackingId) {
        updateData.trackingId = trackingId
        if (carrier) updateData.carrier = carrier
      }

      if (Object.keys(updateData).length === 0) {
        toast.error('No changes to update')
        return
      }

      const res = await axios.patch(`/api/seller/orders/${orderId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.data.success) {
        setOrder(res.data.order)
        setIsEditingStatus(false)
        toast.success('Order updated successfully')
      } else {
        toast.error(res.data.message)
      }
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error(error.response?.data?.message || 'Failed to update order')
    } finally {
      setUpdating(false)
    }
  }

  const formatCurrency = (value) => `₹${(value || 0).toLocaleString('en-IN')}`
  
  const formatDate = (date) => {
    if (!date) return 'N/A'
    try {
      return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'N/A'
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Loading order details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link 
          href="/seller/orders"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800"
        >
          <FiArrowLeft />
          <span>Back to Orders</span>
        </Link>
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
          <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-2">Error Loading Order</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={fetchOrderDetails}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">Order not found</p>
      </div>
    )
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
    processing: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    shipped: 'bg-purple-100 text-purple-800 border-purple-300',
    delivered: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
    returned: 'bg-orange-100 text-orange-800 border-orange-300'
  }

  const getAvailableStatuses = (currentStatus) => {
    const transitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: []
    }
    return transitions[currentStatus] || []
  }

  const canAcceptOrder = order.status === 'pending'
  const canCancelOrder = ['pending', 'confirmed', 'processing'].includes(order.status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <Link 
            href="/seller/orders"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-600 mt-1">#{order.orderNumber}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 flex-wrap">
          <span className={`px-4 py-2 rounded-lg border-2 font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
            {order.status?.toUpperCase()}
          </span>
          
          {/* Accept Order Button */}
          {canAcceptOrder && (
            <button
              onClick={handleAcceptOrder}
              disabled={accepting}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 shadow-lg"
            >
              <FiCheck className="w-5 h-5" />
              <span>{accepting ? 'Accepting...' : 'Accept Order'}</span>
            </button>
          )}
          
          {/* Cancel Order Button */}
          {canCancelOrder && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="flex items-center space-x-2 px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-semibold"
            >
              <FiX className="w-5 h-5" />
              <span>Cancel Order</span>
            </button>
          )}
        </div>
      </div>

      {/* Accept Order Notice */}
      {canAcceptOrder && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <FiAlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-yellow-900 mb-2">Action Required: Accept This Order</h3>
              <p className="text-yellow-800 text-sm">
                This order is waiting for your confirmation. Please review the order details and click "Accept Order" to proceed with fulfillment.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FiPackage className="w-5 h-5 mr-2" />
              Order Items ({order.items?.length || 0})
            </h2>
            <div className="space-y-4">
              {(order.items || []).map((item, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  {item.images && item.images[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                      <FiPackage className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.productName || item.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Quantity: {item.quantity} × {formatCurrency(item.price)}
                    </p>
                    <div className="mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[item.status] || 'bg-gray-100 text-gray-800'}`}>
                        {item.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-lg">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-2">
                {order.pricing?.subtotal && (
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(order.pricing.subtotal)}</span>
                  </div>
                )}
                {order.pricing?.tax > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>{formatCurrency(order.pricing.tax)}</span>
                  </div>
                )}
                {order.pricing?.shipping > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{formatCurrency(order.pricing.shipping)}</span>
                  </div>
                )}
                {order.pricing?.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.pricing.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t-2">
                  <span>Your Total</span>
                  <span>{formatCurrency(order.sellerTotal || order.pricing?.total || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Update Status - Only show if order is confirmed or later */}
          {order.status !== 'pending' && order.status !== 'cancelled' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <FiEdit2 className="w-5 h-5 mr-2" />
                  Update Order
                </h2>
                {!isEditingStatus && getAvailableStatuses(order.status).length > 0 && (
                  <button
                    onClick={() => setIsEditingStatus(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit Status
                  </button>
                )}
              </div>

              {isEditingStatus ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={order.status}>{order.status.toUpperCase()} (Current)</option>
                      {getAvailableStatuses(order.status).map(status => (
                        <option key={status} value={status}>{status.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tracking ID
                    </label>
                    <input
                      type="text"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      placeholder="Enter tracking ID"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Carrier
                    </label>
                    <input
                      type="text"
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      placeholder="e.g., BlueDart, Delhivery"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleUpdateOrder}
                      disabled={updating}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <FiSave />
                      <span>{updating ? 'Updating...' : 'Update Order'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingStatus(false)
                        setNewStatus(order.status)
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Current Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}>
                      {order.status?.toUpperCase()}
                    </span>
                  </div>
                  {order.shipping?.trackingId && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Tracking ID</span>
                      <span className="font-semibold">{order.shipping.trackingId}</span>
                    </div>
                  )}
                  {order.shipping?.carrier && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Carrier</span>
                      <span className="font-semibold">{order.shipping.carrier}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Customer & Payment Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FiUser className="w-5 h-5 mr-2" />
              Customer Details
            </h2>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <FiUser className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold">{order.customer?.name || order.shippingAddress?.fullName || order.shippingAddress?.name || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <FiPhone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold">{order.customer?.phone || order.shippingAddress?.phone || 'N/A'}</p>
                </div>
              </div>
              {(order.customer?.email || order.shippingAddress?.email) && (
                <div className="flex items-start space-x-3">
                  <FiMail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{order.customer?.email || order.shippingAddress?.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FiMapPin className="w-5 h-5 mr-2" />
              Shipping Address
            </h2>
            <div className="text-gray-700 space-y-1">
              <p className="font-semibold">{order.shippingAddress?.fullName || order.shippingAddress?.name}</p>
              <p>{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && (
                <p>{order.shippingAddress.addressLine2}</p>
              )}
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state}
              </p>
              <p>{order.shippingAddress?.pincode}</p>
              <p>{order.shippingAddress?.country || 'India'}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FiCreditCard className="w-5 h-5 mr-2" />
              Payment Details
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Method</span>
                <span className="font-semibold uppercase">{order.payment?.method || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  order.payment?.status === 'completed' || order.payment?.status === 'paid'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.payment?.status?.toUpperCase() || 'PENDING'}
                </span>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FiClock className="w-5 h-5 mr-2" />
              Order Timeline
            </h2>
            <div className="space-y-4">
              {(order.timeline || []).length > 0 ? (
                order.timeline.slice().reverse().map((event, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${index === 0 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    <div>
                      <p className="font-semibold text-gray-900">{event.description}</p>
                      <p className="text-sm text-gray-600">{formatDate(event.timestamp)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Order Placed</p>
                      <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  {order.deliveredAt && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-semibold text-gray-900">Delivered</p>
                        <p className="text-sm text-gray-600">{formatDate(order.deliveredAt)}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Cancel Order</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Please provide a reason for cancelling this order:
            </p>
            
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
            />
            
            <div className="flex space-x-3">
              <button
                onClick={handleCancelOrder}
                disabled={cancelling || !cancellationReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-semibold"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false)
                  setCancellationReason('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
