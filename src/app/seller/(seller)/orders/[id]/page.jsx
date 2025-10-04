// app/seller/(seller)/orders/[id]/page.jsx
'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { useAuth } from '@/lib/context/AuthContext'
import { toast } from 'react-hot-toast'
import {
  FiPackage,
  FiTruck,
  FiCheck,
  FiX,
  FiClock,
  FiUser,
  FiMapPin,
  FiPhone,
  FiMail,
  FiDollarSign,
  FiEdit,
  FiPrinter,
  FiDownload
} from 'react-icons/fi'
import Button from '@/components/ui/Button'

export default function SellerOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { token } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [trackingId, setTrackingId] = useState('')

  useEffect(() => {
    if (token && params.id) {
      loadOrder()
    }
  }, [token, params.id])

  const updatePaymentStatus = async (newStatus) => {
  setUpdating(true)
  try {
    const response = await axios.patch(
      `/api/seller/orders/${params.id}`,
      { paymentStatus: newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (response.data.success) {
      setOrder(response.data.order)
      toast.success('Payment status updated successfully')
    }
  } catch (error) {
    toast.error('Failed to update payment status')
    console.error(error)
  } finally {
    setUpdating(false)
  }
}
  const loadOrder = async () => {
    try {
      const response = await axios.get(`/api/seller/orders/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setOrder(response.data.order)
        setTrackingId(response.data.order.shipping?.trackingId || '')
      }
    } catch (error) {
      console.error('Error loading order:', error)
      toast.error('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (newStatus) => {
    setUpdating(true)
    try {
      const response = await axios.patch(
        `/api/seller/orders/${params.id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success) {
        setOrder(response.data.order)
        toast.success('Order status updated successfully')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error(error.response?.data?.message || 'Failed to update order')
    } finally {
      setUpdating(false)
    }
  }

  const addTrackingId = async () => {
    if (!trackingId.trim()) {
      toast.error('Please enter a tracking ID')
      return
    }

    setUpdating(true)
    try {
      const response = await axios.patch(
        `/api/seller/orders/${params.id}`,
        { 
          status: 'shipped',
          trackingId: trackingId.trim()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success) {
        setOrder(response.data.order)
        setShowTrackingModal(false)
        toast.success('Tracking ID added and order marked as shipped')
      }
    } catch (error) {
      console.error('Error adding tracking:', error)
      toast.error('Failed to add tracking ID')
    } finally {
      setUpdating(false)
    }
  }

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">Order not found</p>
        <Button onClick={() => router.push('/seller/orders')} className="mt-4">
          Back to Orders
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="mt-4">
  <p className="text-sm font-semibold">Payment Status:</p>
  <p className={`inline-block px-3 py-1 rounded-full text-white font-semibold ${
    order.payment.status === 'paid' ? 'bg-green-600' : 'bg-yellow-500'
  }`}>
    {order.payment.status}
  </p>
  {order.payment.status === 'pending' && order.payment.method === 'cod' && (
    <div className="mt-2">
      <Button 
        onClick={() => updatePaymentStatus('paid')} 
        disabled={updating} 
      >
        {updating ? 'Marking...' : 'Mark as Paid'}
      </Button>
    </div>
  )}
</div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
          <p className="text-gray-600 mt-1">
            Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => window.print()}>
            <FiPrinter className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline">
            <FiDownload className="w-4 h-4 mr-2" />
            Invoice
          </Button>
        </div>
      </div>

      {/* Status and Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Current Status</p>
            <span className={`px-4 py-2 rounded-lg text-sm font-bold border-2 capitalize ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-2">Order Date</p>
            <p className="font-semibold text-gray-900">
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {order.status === 'pending' && (
            <>
              <Button 
                onClick={() => updateOrderStatus('processing')}
                disabled={updating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <FiClock className="w-4 h-4 mr-2" />
                Mark as Processing
              </Button>
              <Button 
                onClick={() => setShowTrackingModal(true)}
                disabled={updating}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <FiTruck className="w-4 h-4 mr-2" />
                Ship Order
              </Button>
            </>
          )}
          
          {order.status === 'processing' && (
            <Button 
              onClick={() => setShowTrackingModal(true)}
              disabled={updating}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <FiTruck className="w-4 h-4 mr-2" />
              Ship Order
            </Button>
          )}
          
          {order.status === 'shipped' && (
            <Button 
              onClick={() => updateOrderStatus('delivered')}
              disabled={updating}
              className="bg-green-600 hover:bg-green-700"
            >
              <FiCheck className="w-4 h-4 mr-2" />
              Mark as Delivered
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FiPackage className="w-5 h-5 mr-2 text-blue-600" />
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={item.images?.[0]?.url || '/images/placeholder-product.jpg'}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                    <p className="text-sm text-gray-600">{formatPrice(item.price)} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FiMapPin className="w-5 h-5 mr-2 text-blue-600" />
              Shipping Address
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-semibold text-gray-900 mb-2">{order.shippingAddress.name}</p>
              <p className="text-gray-600">{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && (
                <p className="text-gray-600">{order.shippingAddress.addressLine2}</p>
              )}
              <p className="text-gray-600">
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
              <p className="text-gray-600 mt-2">
                <FiPhone className="inline w-4 h-4 mr-1" />
                {order.shippingAddress.phone}
              </p>
              {order.shippingAddress.email && (
                <p className="text-gray-600">
                  <FiMail className="inline w-4 h-4 mr-1" />
                  {order.shippingAddress.email}
                </p>
              )}
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Timeline</h2>
            <div className="space-y-4">
              {order.timeline?.map((event, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 capitalize">{event.status}</p>
                    <p className="text-sm text-gray-600">{event.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(event.timestamp).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <FiUser className="w-5 h-5 mr-2 text-blue-600" />
              Customer
            </h2>
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-gray-900">{order.customer?.name}</p>
              <p className="text-gray-600">{order.customer?.email}</p>
              <p className="text-gray-600">{order.customer?.phone}</p>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <FiDollarSign className="w-5 h-5 mr-2 text-blue-600" />
              Payment Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">{formatPrice(order.pricing.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-gray-900">
                  {order.pricing.shipping === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    formatPrice(order.pricing.shipping)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium text-gray-900">{formatPrice(order.pricing.tax)}</span>
              </div>
              {order.pricing.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-600">-{formatPrice(order.pricing.discount)}</span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-xl text-gray-900">{formatPrice(order.pricing.total)}</span>
                </div>
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-600">
                  Payment Method: <span className="font-medium text-gray-900 capitalize">{order.payment.method}</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Payment Status: <span className={`font-medium capitalize ${
                    order.payment.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {order.payment.status}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          {order.shipping?.trackingId && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
              <h3 className="font-bold text-purple-900 mb-2 flex items-center">
                <FiTruck className="w-5 h-5 mr-2" />
                Tracking Information
              </h3>
              <p className="text-sm text-purple-700 mb-1">Tracking ID:</p>
              <p className="font-mono font-bold text-purple-900">{order.shipping.trackingId}</p>
              {order.shipping.carrier && (
                <p className="text-sm text-purple-700 mt-2">Carrier: {order.shipping.carrier}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tracking Modal */}
      {showTrackingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ship Order</h2>
            <p className="text-gray-600 mb-4">
              Enter the tracking ID to mark this order as shipped
            </p>
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter tracking ID"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowTrackingModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={addTrackingId}
                disabled={updating || !trackingId.trim()}
                className="flex-1"
              >
                {updating ? 'Updating...' : 'Ship Order'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
