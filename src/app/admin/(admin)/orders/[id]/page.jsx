'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FiArrowLeft, FiPackage, FiTruck, FiMapPin, FiPhone, 
  FiMail, FiUser, FiShoppingBag, FiClock, FiCheckCircle,
  FiAlertCircle, FiDollarSign, FiCalendar, FiBox,
  FiDownload, FiSend, FiExternalLink, FiEdit
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import Image from 'next/image';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCourierModal, setShowCourierModal] = useState(false);
  const [availableCouriers, setAvailableCouriers] = useState([]);
  const [loadingCouriers, setLoadingCouriers] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    if (params.id && token) {
      fetchOrderDetails();
    }
  }, [params.id, token]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/seller/orders/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        toast.error('Order not found');
        router.push('/admin/orders');
      }
    } catch (error) {
      console.error('Fetch order error:', error);
      toast.error('Failed to fetch order details');
      router.push('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignShiprocket = async () => {
    setLoadingCouriers(true);
    setShowCourierModal(true);

    try {
      const response = await axios.post(
        `/api/admin/orders/${params.id}/couriers`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setAvailableCouriers(response.data.couriers);
      } else {
        toast.error('Failed to fetch couriers');
        setShowCourierModal(false);
      }
    } catch (error) {
      console.error('Fetch couriers error:', error);
      toast.error('Failed to fetch courier partners');
      setShowCourierModal(false);
    } finally {
      setLoadingCouriers(false);
    }
  };

  const confirmCourierAssignment = async (courierId) => {
    if (processingAction) return;

    setProcessingAction(true);
    try {
      const response = await axios.post(
        `/api/admin/orders/${params.id}/assign-shiprocket`,
        { 
          courierId: courierId,
          adminId: user._id
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success(`Shiprocket assigned! AWB: ${response.data.shiprocket.awbCode}`);
        setShowCourierModal(false);
        fetchOrderDetails();
      } else {
        toast.error(response.data.message || 'Failed to assign Shiprocket');
      }
    } catch (error) {
      console.error('Assign Shiprocket error:', error);
      toast.error(error.response?.data?.message || 'Error assigning Shiprocket');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!confirm(`Update order status to ${status}?`)) return;

    setProcessingAction(true);
    try {
      const response = await axios.patch(
        `/api/admin/orders/${params.id}/update-status`,
        { status },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success('Order status updated!');
        fetchOrderDetails();
      } else {
        toast.error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Update status error:', error);
      toast.error(error.response?.data?.message || 'Error updating status');
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      ready_for_pickup: 'bg-yellow-100 text-yellow-800',
      pickup: 'bg-orange-100 text-orange-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      returned: 'bg-purple-100 text-purple-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/orders')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
          >
            <FiArrowLeft className="text-xl" />
            <span className="font-medium">Back to Orders</span>
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  Order #{order.orderNumber}
                </h1>
                <p className="text-gray-600">
                  Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <span className={`px-6 py-3 rounded-full font-bold text-lg ${getStatusBadge(order.status)}`}>
                {order.status.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {order.status === 'ready_for_pickup' && !order.shiprocket?.awbCode && (
                <button
                  onClick={handleAssignShiprocket}
                  disabled={processingAction}
                  className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium disabled:opacity-50"
                >
                  <FiSend />
                  Assign Shiprocket
                </button>
              )}

              {order.status === 'pickup' && (
                <button
                  onClick={() => handleUpdateStatus('shipped')}
                  disabled={processingAction}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50"
                >
                  <FiTruck />
                  Mark as Shipped
                </button>
              )}

              {order.status === 'shipped' && (
                <button
                  onClick={() => handleUpdateStatus('delivered')}
                  disabled={processingAction}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
                >
                  <FiCheckCircle />
                  Mark as Delivered
                </button>
              )}

              <a
                href={`/api/seller/orders/${order._id}/invoice`}
                target="_blank"
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
              >
                <FiDownload />
                Download Invoice
              </a>

              {order.shiprocket?.awbCode && (
                <a
                  href={`https://shiprocket.co/tracking/${order.shiprocket.awbCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                >
                  <FiTruck />
                  Track Shipment
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Customer & Seller Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiUser className="text-blue-600" />
                Customer Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Name</p>
                  <p className="font-semibold text-gray-900">{order.shippingAddress.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Phone</p>
                  <a href={`tel:${order.shippingAddress.phone}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
                    <FiPhone className="text-sm" />
                    {order.shippingAddress.phone}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <a href={`mailto:${order.shippingAddress.email}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm break-all">
                    <FiMail className="text-sm" />
                    {order.shippingAddress.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Seller Information */}
            {order.items && order.items.length > 0 && order.items[0].seller && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiShoppingBag className="text-green-600" />
                  Seller Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Business Name</p>
                    <p className="font-semibold text-gray-900">{order.items[0].seller.businessName}</p>
                  </div>
                  {order.items[0].seller.storeInfo?.storeName && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Store Name</p>
                      <p className="font-semibold text-gray-900">{order.items[0].seller.storeInfo.storeName}</p>
                    </div>
                  )}
                  {order.items[0].seller.email && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <a href={`mailto:${order.items[0].seller.email}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm break-all">
                        <FiMail className="text-sm" />
                        {order.items[0].seller.email}
                      </a>
                    </div>
                  )}
                  {order.items[0].seller.phone && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Phone</p>
                      <a href={`tel:${order.items[0].seller.phone}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
                        <FiPhone className="text-sm" />
                        {order.items[0].seller.phone}
                      </a>
                    </div>
                  )}
                  
                  {/* View Seller Details Button */}
                  <Link
                    href={`/admin/sellers/${order.items[0].seller._id}`}
                    className="flex items-center justify-center gap-2 w-full mt-4 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition font-medium shadow-lg"
                  >
                    <FiExternalLink />
                    View Seller Details
                  </Link>
                </div>
              </div>
            )}

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiMapPin className="text-red-600" />
                Shipping Address
              </h2>
              <div className="space-y-2 text-gray-700">
                <p className="font-semibold">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p>{order.shippingAddress.pincode}</p>
                <p>{order.shippingAddress.country || 'India'}</p>
              </div>
            </div>

            {/* Shiprocket Info */}
            {order.shiprocket?.awbCode && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                  <FiTruck className="text-green-600" />
                  Shiprocket Details
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-green-700 mb-1">Courier Partner</p>
                    <p className="font-bold text-green-900">{order.shiprocket.courierName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-700 mb-1">AWB Code</p>
                    <p className="font-mono font-bold text-green-900">{order.shiprocket.awbCode}</p>
                  </div>
                  {order.shiprocket.pickupScheduledDate && (
                    <div>
                      <p className="text-xs text-green-700 mb-1">Pickup Scheduled</p>
                      <p className="font-semibold text-green-900">
                        {new Date(order.shiprocket.pickupScheduledDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {order.shiprocket.label && (
                    <a
                      href={order.shiprocket.label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-green-700 hover:text-green-900 font-medium"
                    >
                      <FiDownload />
                      Download Shipping Label
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Items & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiBox className="text-purple-600" />
                Order Items ({order.items.length})
              </h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                    {item.images && item.images.length > 0 && (
                      <div className="relative w-20 h-20 flex-shrink-0 bg-white rounded-lg overflow-hidden">
                        <Image
                          src={item.images[0]}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                      {item.sku && (
                        <p className="text-xs text-gray-500 mb-2">SKU: {item.sku}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600">Qty: <strong>{item.quantity}</strong></span>
                          <span className="text-sm text-gray-600">Price: <strong>₹{item.price.toLocaleString()}</strong></span>
                        </div>
                        <p className="text-lg font-bold text-blue-600">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Summary */}
              <div className="mt-6 pt-6 border-t-2 border-gray-200">
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-semibold">₹{order.pricing.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping:</span>
                    <span className="font-semibold">₹{order.pricing.shipping.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax (GST):</span>
                    <span className="font-semibold">₹{order.pricing.tax.toLocaleString()}</span>
                  </div>
                  {order.pricing.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span className="font-semibold">-₹{order.pricing.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-2xl font-bold text-gray-900 pt-3 border-t-2 border-gray-300">
                    <span>Total:</span>
                    <span className="text-blue-600">₹{order.pricing.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiDollarSign className="text-yellow-600" />
                Payment Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                  <p className="font-bold text-gray-900 uppercase">{order.payment.method}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full font-semibold text-sm ${
                    order.payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.payment.status.toUpperCase()}
                  </span>
                </div>
                {order.payment.transactionId && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
                    <p className="font-mono font-semibold text-gray-900">{order.payment.transactionId}</p>
                  </div>
                )}
                {order.payment.paidAt && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Paid At</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(order.payment.paidAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiClock className="text-indigo-600" />
                Order Timeline
              </h2>
              <div className="space-y-4">
                {order.timeline && order.timeline.length > 0 ? (
                  order.timeline.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-blue-600' : 'bg-gray-300'
                        }`}>
                          <FiCheckCircle className="text-white" />
                        </div>
                        {index !== order.timeline.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-300 my-1"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <p className="font-bold text-gray-900 capitalize">
                          {event.status.replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm text-gray-600">{event.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No timeline events yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courier Selection Modal */}
      {showCourierModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Select Courier Partner</h2>
              <button
                onClick={() => setShowCourierModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FiAlertCircle className="text-2xl" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {loadingCouriers ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600">Fetching courier partners...</p>
                </div>
              ) : availableCouriers.length === 0 ? (
                <div className="text-center py-12">
                  <FiAlertCircle className="text-6xl text-red-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Couriers Available</h3>
                  <p className="text-gray-600">No courier partners available for this location.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableCouriers.map((courier) => (
                    <button
                      key={courier.courier_company_id}
                      onClick={() => confirmCourierAssignment(courier.courier_company_id)}
                      disabled={processingAction}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition text-left disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{courier.courier_name}</h3>
                          <p className="text-sm text-gray-600">Delivery in {courier.estimated_delivery_days} days</p>
                          <p className="text-xs text-gray-500">ETD: {courier.etd}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">₹{courier.rate}</p>
                          <p className="text-xs text-gray-500">Shipping cost</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
