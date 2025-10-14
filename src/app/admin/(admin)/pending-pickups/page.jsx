'use client';

import { useState, useEffect } from 'react';
import { 
  FiPackage, FiTruck, FiMapPin, FiPhone, FiMail,
  FiCalendar, FiClock, FiCheck, FiAlertCircle,
  FiBox, FiUser, FiShoppingBag
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Image from 'next/image';

export default function PendingPickupsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningOrder, setAssigningOrder] = useState(null);

  useEffect(() => {
    fetchPendingPickups();
  }, []);

  const fetchPendingPickups = async () => {
    try {
      const response = await axios.get('/api/admin/delivery/pending-pickups');
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      toast.error('Failed to fetch pending pickups');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignShiprocket = async (orderId) => {
    if (!confirm('Assign Shiprocket delivery partner for this order?')) return;

    setAssigningOrder(orderId);

    try {
      const response = await axios.post('/api/admin/delivery/assign-shiprocket', {
        orderId
      });

      if (response.data.success) {
        toast.success('Shiprocket assigned successfully!');
        fetchPendingPickups();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign Shiprocket');
    } finally {
      setAssigningOrder(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending pickups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                <FiTruck className="text-blue-600" />
                Pending Pickups
              </h1>
              <p className="text-gray-600">
                Orders ready for Shiprocket assignment
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 rounded-xl shadow-lg">
              <p className="text-sm opacity-90">Total Pending</p>
              <p className="text-4xl font-bold">{orders.length}</p>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Pending Pickups</h2>
            <p className="text-gray-600">All orders have been assigned to delivery partners</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">
                        Order #{order.orderNumber}
                      </h2>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <FiCalendar />
                          <span>{new Date(order.pickup.sellerMarkedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiClock />
                          <span>{new Date(order.pickup.sellerMarkedAt).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiBox />
                          <span>{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white text-yellow-600 px-4 py-2 rounded-full font-bold text-sm">
                      Awaiting Assignment
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Address Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Pickup Address */}
                    <div className="border-2 border-blue-200 rounded-xl p-5 bg-blue-50">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                        <FiMapPin className="text-blue-600 text-xl" />
                        Pickup Address
                      </h3>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p className="font-bold text-gray-900 text-base">
                          {order.pickup.address.name}
                        </p>
                        <p>{order.pickup.address.addressLine1}</p>
                        {order.pickup.address.addressLine2 && (
                          <p>{order.pickup.address.addressLine2}</p>
                        )}
                        <p className="font-medium">
                          {order.pickup.address.city}, {order.pickup.address.state}
                        </p>
                        <p className="font-medium">PIN: {order.pickup.address.pincode}</p>
                        <div className="flex items-center gap-2 pt-2 border-t border-blue-200">
                          <FiPhone className="text-blue-600" />
                          <span className="font-medium">{order.pickup.address.phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="border-2 border-green-200 rounded-xl p-5 bg-green-50">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                        <FiMapPin className="text-green-600 text-xl" />
                        Delivery Address
                      </h3>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p className="font-bold text-gray-900 text-base">
                          {order.shippingAddress.name}
                        </p>
                        <p>{order.shippingAddress.addressLine1}</p>
                        {order.shippingAddress.addressLine2 && (
                          <p>{order.shippingAddress.addressLine2}</p>
                        )}
                        <p className="font-medium">
                          {order.shippingAddress.city}, {order.shippingAddress.state}
                        </p>
                        <p className="font-medium">PIN: {order.shippingAddress.pincode}</p>
                        <div className="space-y-1 pt-2 border-t border-green-200">
                          <div className="flex items-center gap-2">
                            <FiPhone className="text-green-600" />
                            <span className="font-medium">{order.shippingAddress.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiMail className="text-green-600" />
                            <span className="font-medium text-xs">{order.shippingAddress.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-2 border-purple-200 rounded-xl p-5 bg-purple-50 mb-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                      <FiShoppingBag className="text-purple-600 text-xl" />
                      Order Items ({order.items.length})
                    </h3>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 bg-white p-3 rounded-lg">
                          <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                            {item.images && item.images[0] ? (
                              <Image
                                src={item.images[0]}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FiPackage className="text-2xl text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-600">₹{item.price} each</p>
                          </div>
                        </div>
                      ))}
                      <div className="border-t-2 border-purple-200 pt-3 mt-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 text-lg">Order Total</span>
                          <span className="font-bold text-purple-600 text-2xl">
                            ₹{order.pricing.total.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                          <span>Payment Method</span>
                          <span className="font-semibold uppercase">{order.payment.method}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="border-2 border-gray-200 rounded-xl p-5 bg-gray-50 mb-6">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <FiUser className="text-gray-600" />
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
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

                  {/* Assign Button */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <FiAlertCircle className="text-orange-600 text-2xl flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2">
                          Assign Shiprocket Delivery Partner
                        </h3>
                        <p className="text-sm text-gray-700 mb-4">
                          This will create order in Shiprocket, assign best courier, generate AWB, 
                          schedule pickup, and generate shipping label automatically.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAssignShiprocket(order._id)}
                      disabled={assigningOrder === order._id}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold shadow-lg text-lg"
                    >
                      {assigningOrder === order._id ? (
                        <>
                          <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                          <span>Assigning Shiprocket...</span>
                        </>
                      ) : (
                        <>
                          <FiCheck className="text-2xl" />
                          <span>Assign Shiprocket & Schedule Pickup</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
