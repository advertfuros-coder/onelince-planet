// app/(admin)/orders/[orderNumber]/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useAuth } from '@/lib/context/AuthContext'
import {
  FiArrowLeft,
  FiPackage,
  FiUser,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCreditCard,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiEdit2,
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'

export default function AdminOrderDetailPage({ params }) {
  const { token } = useAuth()
  const router = useRouter()
  const [orderNumber, setOrderNumber] = useState(null)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [trackingId, setTrackingId] = useState('')
  const [carrier, setCarrier] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params
      setOrderNumber(resolvedParams.orderNumber)
    }
    unwrapParams()
  }, [params])

  useEffect(() => {
    if (token && orderNumber) fetchOrderDetails()
  }, [token, orderNumber])

  async function fetchOrderDetails() {
    try {
      setLoading(true)
      const res = await axios.get(`/api/admin/orders/${orderNumber}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.success) {
        setOrder(res.data.order)
      } else {
        router.push('/admin/orders')
      }
    } catch (error) {
      console.error('Error:', error)
      router.push('/admin/orders')
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusUpdate() {
    if (!newStatus) {
      toast.error('Please select a status')
      return
    }

    setUpdating(true)
    try {
      const updateData = {
        status: newStatus,
        description: `Order status updated to ${newStatus} by admin`,
      }

      if (newStatus === 'shipped' && trackingId) {
        updateData.shipping = { trackingId, carrier }
      }

      const res = await axios.put(`/api/admin/orders/${orderNumber}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.success) {
        setOrder(res.data.order)
        setShowStatusModal(false)
        setNewStatus('')
        setTrackingId('')
        setCarrier('')
        toast.success('Order status updated successfully')
      }
    } catch (error) {
      toast.error('Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading || !orderNumber) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  if (!order) return null

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

  const formatPrice = (price) => `₹${(price || 0).toLocaleString('en-IN')}`
  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
              <FiArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
              <p className="text-gray-600 mt-1">Placed on {formatDate(order.createdAt)}</p>
            </div>
          </div>
          <button
            onClick={() => setShowStatusModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FiEdit2 />
            <span>Update Status</span>
          </button>
        </div>

        {/* Status Banner */}
        <div className={`rounded-lg p-4 border-2 ${getStatusColor(order.status)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-lg capitalize">Status: {order.status}</p>
              <p className="text-sm mt-1">
                Payment: <span className="font-semibold capitalize">{order.payment?.status}</span> •{' '}
                <span className="capitalize">{order.payment?.method}</span>
              </p>
            </div>
            {order.shipping?.trackingId && (
              <div className="text-right">
                <p className="text-sm font-medium">Tracking ID</p>
                <p className="text-lg font-bold">{order.shipping.trackingId}</p>
                {order.shipping.carrier && <p className="text-sm">{order.shipping.carrier}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Timeline */}
            {order.timeline && order.timeline.length > 0 && (
              <Section title="Order Timeline">
                <div className="space-y-4">
                  {order.timeline.map((event, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FiCheckCircle className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 capitalize">{event.status}</p>
                        <p className="text-sm text-gray-600">{event.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(event.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Order Items */}
            <Section title="Order Items">
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4 pb-4 border-b last:border-b-0">
                    <img
                      src={item.images?.[0] || '/images/placeholder-product.jpg'}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Seller: {item.seller?.businessName || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} × {formatPrice(item.price)}
                      </p>
                      <span
                        className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Customer Info */}
            <Section title="Customer Information">
              <div className="space-y-3">
                <InfoRow icon={<FiUser />} label="Name" value={order.customer?.name || order.shippingAddress?.name} />
                <InfoRow icon={<FiMail />} label="Email" value={order.customer?.email || order.shippingAddress?.email} />
                <InfoRow icon={<FiPhone />} label="Phone" value={order.customer?.phone || order.shippingAddress?.phone} />
              </div>
            </Section>

            {/* Shipping Address */}
            <Section title="Shipping Address">
              <div className="flex items-start space-x-3">
                <FiMapPin className="text-gray-600 mt-1" />
                <div className="text-gray-700">
                  <p className="font-semibold text-gray-900">{order.shippingAddress?.name}</p>
                  <p>{order.shippingAddress?.addressLine1}</p>
                  {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}
                  </p>
                  <p>{order.shippingAddress?.country}</p>
                  <p className="mt-2">{order.shippingAddress?.phone}</p>
                </div>
              </div>
            </Section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <Section title="Order Summary">
              <div className="space-y-3">
                <InfoRow label="Subtotal" value={formatPrice(order.pricing?.subtotal)} />
                <InfoRow label="Shipping" value={formatPrice(order.pricing?.shipping)} />
                <InfoRow label="Tax" value={formatPrice(order.pricing?.tax)} />
                {order.pricing?.discount > 0 && (
                  <InfoRow label="Discount" value={`-${formatPrice(order.pricing.discount)}`} className="text-green-600" />
                )}
                <div className="pt-3 border-t">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-xl text-gray-900">{formatPrice(order.pricing?.total)}</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* Payment Info */}
            <Section title="Payment Information">
              <div className="space-y-3">
                <InfoRow icon={<FiCreditCard />} label="Method" value={order.payment?.method?.toUpperCase()} />
                <InfoRow
                  label="Status"
                  value={
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        order.payment?.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {order.payment?.status}
                    </span>
                  }
                />
                {order.payment?.transactionId && (
                  <InfoRow label="Transaction ID" value={order.payment.transactionId} />
                )}
                {order.payment?.couponCode && (
                  <InfoRow label="Coupon Applied" value={order.payment.couponCode} />
                )}
              </div>
            </Section>

            {/* Shipping Info */}
            {order.shipping && (
              <Section title="Shipping Information">
                <div className="space-y-3">
                  {order.shipping.trackingId && <InfoRow icon={<FiTruck />} label="Tracking ID" value={order.shipping.trackingId} />}
                  {order.shipping.carrier && <InfoRow label="Carrier" value={order.shipping.carrier} />}
                  {order.shipping.shippedAt && (
                    <InfoRow label="Shipped At" value={formatDate(order.shipping.shippedAt)} />
                  )}
                  {order.shipping.deliveredAt && (
                    <InfoRow label="Delivered At" value={formatDate(order.shipping.deliveredAt)} />
                  )}
                  {order.shipping.estimatedDelivery && (
                    <InfoRow label="Est. Delivery" value={formatDate(order.shipping.estimatedDelivery)} />
                  )}
                </div>
              </Section>
            )}
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Update Order Status</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="returned">Returned</option>
                </select>
              </div>

              {newStatus === 'shipped' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tracking ID</label>
                    <input
                      type="text"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter tracking number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Carrier</label>
                    <input
                      type="text"
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Blue Dart, DTDC"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={updating}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  )
}

function InfoRow({ icon, label, value, className = '' }) {
  return (
    <div className={`flex justify-between py-2 border-b last:border-b-0 ${className}`}>
      <span className="text-sm text-gray-600 flex items-center space-x-2">
        {icon}
        <span>{label}</span>
      </span>
      <span className="text-sm font-medium text-gray-900">{value || 'N/A'}</span>
    </div>
  )
}
