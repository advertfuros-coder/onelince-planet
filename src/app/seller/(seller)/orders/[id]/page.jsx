'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FiPackage, FiUser, FiMapPin, FiDollarSign, FiTruck,
  FiCalendar, FiClock, FiCheckCircle, FiArrowLeft,
  FiPrinter, FiDownload
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Image from 'next/image';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchOrderDetails();
    }
  }, [params.id]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`/api/seller/orders/${params.id}`);
      if (response.data.success) {
        setOrder(response.data.order);
      }
    } catch (error) {
      toast.error('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintInvoice = () => {
    window.open(`/api/seller/orders/${params.id}/invoice`, '_blank');
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <FiArrowLeft className="text-2xl" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                Order #{order.orderNumber}
              </h1>
              <p className="text-gray-600">
                Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={handlePrintInvoice}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FiPrinter />
              Print Invoice
            </button>
          </div>

          {/* Status Badge */}
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-bold text-lg">
            Status: {order.status.replace(/_/g, ' ').toUpperCase()}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FiPackage className="text-blue-600" />
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="relative w-20 h-20 flex-shrink-0 bg-white rounded-lg overflow-hidden">
                      {item.images && item.images[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <FiPackage className="text-3xl text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      {item.sku && <p className="text-xs text-gray-500">SKU: {item.sku}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-lg">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">₹{item.price} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FiClock className="text-blue-600" />
                Order Timeline
              </h2>
              <div className="space-y-4">
                {order.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                        <FiCheckCircle />
                      </div>
                      {index < order.timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <p className="font-semibold text-gray-900">{event.description}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Customer Info */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiUser className="text-blue-600" />
                Customer Details
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Name</p>
                  <p className="font-semibold text-gray-900">{order.customer?.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">{order.customer?.email}</p>
                </div>
                <div>
                  <p className="text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">{order.customer?.phone}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiMapPin className="text-green-600" />
                Shipping Address
              </h2>
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-semibold text-gray-900">{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p>PIN: {order.shippingAddress.pincode}</p>
                <p className="pt-2 border-t">{order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-6 text-white">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FiDollarSign />
                Payment Summary
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{order.pricing.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₹{order.pricing.shipping.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (GST)</span>
                  <span>₹{order.pricing.tax.toLocaleString()}</span>
                </div>
                {order.pricing.discount > 0 && (
                  <div className="flex justify-between text-green-300">
                    <span>Discount</span>
                    <span>-₹{order.pricing.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-white/30 pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{order.pricing.total.toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t border-white/30">
                  <p className="text-xs opacity-90">Payment Method</p>
                  <p className="font-semibold uppercase">{order.payment.method}</p>
                </div>
              </div>
            </div>

            {/* Tracking Info */}
            {order.shiprocket?.awbCode && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiTruck className="text-orange-600" />
                  Shipping Details
                </h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600">Courier</p>
                    <p className="font-semibold text-gray-900">{order.shiprocket.courierName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">AWB Number</p>
                    <p className="font-semibold text-gray-900">{order.shiprocket.awbCode}</p>
                  </div>
                  <a
                    href={`https://shiprocket.co/tracking/${order.shiprocket.awbCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full mt-4 px-4 py-2 bg-orange-600 text-white text-center rounded-lg hover:bg-orange-700 transition font-medium"
                  >
                    Track Shipment
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
