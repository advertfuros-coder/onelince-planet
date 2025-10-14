'use client';

import { useState, useEffect } from 'react';
import { 
  FiPackage, FiSearch, FiFilter, FiEye, FiTruck, 
  FiCheckCircle, FiClock, FiDollarSign, FiShoppingBag,
  FiDownload, FiRefreshCw, FiAlertCircle
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function SellerOrdersPage() {
  const { user, loading: authLoading, isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Check authentication
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      // Check if user is a seller
      if (user && user.role !== 'seller') {
        toast.error('Access denied. Seller account required.');
        router.push('/');
        return;
      }

      // Fetch orders if authenticated and is seller
      if (user && user._id) {
        fetchOrders();
      }
    }
  }, [authLoading, isAuthenticated, user, selectedStatus, searchTerm]);

  const fetchOrders = async () => {
    if (!user?._id) {
      console.error('No user ID available');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        sellerId: user._id,
        status: selectedStatus,
        search: searchTerm
      });

      const response = await axios.get(`/api/seller/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-gray-100 text-gray-800',
      processing: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
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
    { value: 'ready_for_pickup', label: 'Ready for Pickup', icon: FiPackage },
    { value: 'shipped', label: 'Shipped', icon: FiTruck },
    { value: 'delivered', label: 'Delivered', icon: FiCheckCircle }
  ];

  // Show loading while checking auth
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

  // Show error if not authenticated or not a seller
  if (!isAuthenticated || !user || user.role !== 'seller') {
    return null; // Router will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                My Orders
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.name || user?.businessName}
              </p>
              <p className="text-xs text-gray-500 mt-1">Seller ID: {user?._id}</p>
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
              <p className="text-3xl font-bold">{stats.total || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <FiCheckCircle className="text-3xl mb-2 opacity-80" />
              <p className="text-sm opacity-90">Confirmed</p>
              <p className="text-3xl font-bold">{stats.confirmed || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
              <FiTruck className="text-3xl mb-2 opacity-80" />
              <p className="text-sm opacity-90">Shipped</p>
              <p className="text-3xl font-bold">{stats.shipped || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <FiDollarSign className="text-3xl mb-2 opacity-80" />
              <p className="text-sm opacity-90">Revenue</p>
              <p className="text-2xl font-bold">₹{(stats.totalRevenue || 0).toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
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

            {/* Status Filter Dropdown */}
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

          {/* Status Filter Buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            {statusFilters.map(filter => {
              const Icon = filter.icon;
              const count = filter.value === 'all' ? stats?.total : stats?.[filter.value] || 0;
              
              return (
                <button
                  key={filter.value}
                  onClick={() => setSelectedStatus(filter.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                    selectedStatus === filter.value
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon />
                  <span>{filter.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    selectedStatus === filter.value
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Found</h2>
            <p className="text-gray-600">
              {searchTerm || selectedStatus !== 'all' 
                ? 'Try adjusting your filters' 
                : 'You haven\'t received any orders yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden">
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full font-semibold text-sm ${getStatusBadge(order.status)}`}>
                      {order.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Customer</p>
                      <p className="font-semibold text-gray-900">{order.shippingAddress.name}</p>
                      <p className="text-sm text-gray-600">{order.shippingAddress.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Delivery Address</p>
                      <p className="text-sm text-gray-900">
                        {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                      </p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Items ({order.items.length})</p>
                    <div className="space-y-2">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm">
                          <span className="text-gray-600">{item.name}</span>
                          <span className="text-gray-400">×</span>
                          <span className="font-medium text-gray-900">{item.quantity}</span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-xs text-blue-600 font-medium">
                          +{order.items.length - 2} more items
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Payment & Total */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg mb-4">
                    <div>
                      <p className="text-xs text-gray-600">Payment Method</p>
                      <p className="font-semibold text-gray-900 uppercase">{order.payment.method}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-blue-600">₹{order.pricing.total.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/seller/orders/${order._id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      <FiEye />
                      View Details
                    </Link>
                    
                    {order.status === 'confirmed' && (
                      <Link
                        href={`/seller/orders/${order._id}/prepare`}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                      >
                        <FiPackage />
                        Prepare Order
                      </Link>
                    )}

                    {order.shiprocket?.awbCode && (
                      <a
                        href={`https://shiprocket.co/tracking/${order.shiprocket.awbCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
                      >
                        <FiTruck />
                        Track Shipment
                      </a>
                    )}

                    <a
                      href={`/api/seller/orders/${order._id}/invoice`}
                      target="_blank"
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
                    >
                      <FiDownload />
                      Invoice
                    </a>
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
