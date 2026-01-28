'use client';

import { useState, useEffect } from 'react';
import {
  FiPackage, FiSearch, FiEye, FiTruck, FiCheckCircle,
  FiClock, FiDollarSign, FiShoppingBag, FiRefreshCw,
  FiAlertCircle, FiSend, FiX
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminOrdersPage() {
  const { user, loading: authLoading, isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingAction, setProcessingAction] = useState(null);
  const [showCourierModal, setShowCourierModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [availableCouriers, setAvailableCouriers] = useState([]);
  const [loadingCouriers, setLoadingCouriers] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (user && user.role !== 'admin') {
        toast.error('Access denied. Admin account required.');
        router.push('/');
        return;
      }

      if (user && user._id) {
        fetchOrders();
      }
    }
  }, [authLoading, isAuthenticated, user, selectedStatus, searchTerm]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: selectedStatus,
        search: searchTerm
      });

      const response = await axios.get(`/api/admin/orders?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setOrders(response.data.orders);
        setStats(response.data.stats);
      } else {
        toast.error(response.data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignShiprocket = async (order) => {
    setSelectedOrder(order);
    setLoadingCouriers(true);
    setShowCourierModal(true);

    try {
      const response = await axios.post(
        `/api/admin/orders/${order._id}/couriers`,
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

    setProcessingAction(selectedOrder._id);
    try {
      const response = await axios.post(
        `/api/admin/orders/${selectedOrder._id}/assign-shiprocket`,
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
        fetchOrders();
      } else {
        toast.error(response.data.message || 'Failed to assign Shiprocket');
      }
    } catch (error) {
      console.error('Assign Shiprocket error:', error);
      toast.error(error.response?.data?.message || 'Error assigning Shiprocket');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    if (processingAction) return;

    if (!confirm(`Update order status to ${status}?`)) return;

    setProcessingAction(orderId);
    try {
      const response = await axios.patch(
        `/api/admin/orders/${orderId}/update-status`,
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
        fetchOrders();
      } else {
        toast.error(response.data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Update status error:', error);
      toast.error(error.response?.data?.message || 'Error updating status');
    } finally {
      setProcessingAction(null);
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

  const statusFilters = [
    { value: 'all', label: 'All Orders', icon: FiShoppingBag },
    { value: 'confirmed', label: 'Confirmed', icon: FiCheckCircle },
    { value: 'processing', label: 'Processing', icon: FiClock },
    { value: 'ready_for_pickup', label: 'Ready for Pickup', icon: FiAlertCircle },
    { value: 'pickup', label: 'Pickup Assigned', icon: FiPackage },
    { value: 'shipped', label: 'Shipped', icon: FiTruck },
    { value: 'delivered', label: 'Delivered', icon: FiCheckCircle }
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-2">
                Order Management
              </h1>
              <p className="text-gray-600">Manage all orders and assign deliveries</p>
            </div>
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <FiShoppingBag className="text-3xl mb-2 opacity-80" />
              <p className="text-sm opacity-90">Total Orders</p>
              <p className="text-3xl font-semibold">{stats.total || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
              <FiAlertCircle className="text-3xl mb-2 opacity-80" />
              <p className="text-sm opacity-90">Ready for Pickup</p>
              <p className="text-3xl font-semibold">{stats.ready_for_pickup || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
              <FiTruck className="text-3xl mb-2 opacity-80" />
              <p className="text-sm opacity-90">Shipped</p>
              <p className="text-3xl font-semibold">{stats.shipped || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <FiDollarSign className="text-3xl mb-2 opacity-80" />
              <p className="text-sm opacity-90">Revenue</p>
              <p className="text-2xl font-semibold">₹{(stats.totalRevenue || 0).toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Search by order number, customer name, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
            >
              {statusFilters.map(filter => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {statusFilters.map(filter => {
              const Icon = filter.icon;
              const count = filter.value === 'all' ? stats?.total : stats?.[filter.value] || 0;

              return (
                <button
                  key={filter.value}
                  onClick={() => setSelectedStatus(filter.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${selectedStatus === filter.value
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <Icon />
                  <span>{filter.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${selectedStatus === filter.value
                    ? 'bg-white text-blue-600'
                    : 'bg-white text-gray-700'
                    }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <FiPackage className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Orders Found</h2>
            <p className="text-gray-600">
              {searchTerm || selectedStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'No orders available'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Delivery Address
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Items/Payment
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <p className="font-bold text-gray-900 text-base">#{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <span className={`inline-block px-3 py-1 rounded-full font-semibold text-xs ${getStatusBadge(order.status)}`}>
                            {order.status.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          {order.shiprocket?.awbCode && (
                            <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                              <p className="text-xs font-semibold text-green-800">AWB: {order.shiprocket.awbCode}</p>
                              <p className="text-xs text-green-600">{order.shiprocket.courierName}</p>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{order.shippingAddress?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-600 mt-1">{order.shippingAddress?.phone || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900 max-w-[200px]">
                          {order.items[0]?.seller?.businessInfo?.businessName ||
                            order.items[0]?.seller?.storeInfo?.storeName ||
                            order.items[0]?.seller?.personalDetails?.fullName ||
                            'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 max-w-[180px]">
                          {order.shippingAddress?.city}, {order.shippingAddress?.state}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">PIN: {order.shippingAddress?.pincode}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{order.items.length} items</p>
                          <p className="text-xs text-gray-600 uppercase mt-1">{order.payment.method}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-lg font-bold text-blue-600">₹{order.pricing.total.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2 min-w-[160px]">
                          {order.status === 'ready_for_pickup' && !order.shiprocket?.awbCode && (
                            <button
                              onClick={() => handleAssignShiprocket(order)}
                              disabled={processingAction === order._id}
                              className="flex items-center justify-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-xs font-medium disabled:opacity-50"
                            >
                              <FiSend size={14} />
                              {processingAction === order._id ? 'Assigning...' : 'Assign Shiprocket'}
                            </button>
                          )}

                          {order.status === 'pickup' && (
                            <button
                              onClick={() => handleUpdateStatus(order._id, 'shipped')}
                              disabled={processingAction === order._id}
                              className="flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-xs font-medium disabled:opacity-50"
                            >
                              <FiTruck size={14} />
                              Mark Shipped
                            </button>
                          )}

                          {order.status === 'shipped' && (
                            <button
                              onClick={() => handleUpdateStatus(order._id, 'delivered')}
                              disabled={processingAction === order._id}
                              className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs font-medium disabled:opacity-50"
                            >
                              <FiCheckCircle size={14} />
                              Mark Delivered
                            </button>
                          )}

                          <Link
                            href={`/admin/orders/${order._id}`}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs font-medium"
                          >
                            <FiEye size={14} />
                            View Details
                          </Link>

                          {order.shiprocket?.awbCode && (
                            <a
                              href={`https://shiprocket.co/tracking/${order.shiprocket.awbCode}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-xs font-medium"
                            >
                              <FiTruck size={14} />
                              Track
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Courier Selection Modal */}
      {showCourierModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Select Courier Partner</h2>
              <button
                onClick={() => setShowCourierModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FiX className="text-2xl" />
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Couriers Available</h3>
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
                          <h3 className="font-semibold text-gray-900 text-lg">{courier.courier_name}</h3>
                          <p className="text-sm text-gray-600">Delivery in {courier.estimated_delivery_days} days</p>
                          <p className="text-xs text-gray-500">ETD: {courier.etd}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-semibold text-blue-600">₹{courier.rate}</p>
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
