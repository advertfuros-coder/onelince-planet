'use client';

import { useState, useEffect } from 'react';
import { 
  FiTag, FiEdit, FiTrash2, FiToggleLeft, FiToggleRight,
  FiPlus, FiSearch, FiFilter, FiCalendar, FiPercent,
  FiDollarSign, FiTruck, FiPackage, FiUsers, FiClock
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';

export default function CouponsList() {
  const router = useRouter();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, expired
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, [filter]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/coupons?status=${filter}`);
      const data = await response.json();
      if (data.success) {
        setCoupons(data.coupons);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCouponStatus = async (id, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage(`✓ ${data.message}`);
        fetchCoupons();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage(`✗ Error: ${error.message}`);
    }
  };

  const deleteCoupon = async (id) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setMessage(`✓ ${data.message}`);
        fetchCoupons();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage(`✗ Error: ${error.message}`);
    }
  };

  const getDiscountIcon = (type) => {
    switch (type) {
      case 'percentage':
        return <FiPercent className="text-blue-600" />;
      case 'fixed':
        return <FiDollarSign className="text-green-600" />;
      case 'free_shipping':
        return <FiTruck className="text-purple-600" />;
      default:
        return <FiTag />;
    }
  };

  const getScopeIcon = (scope) => {
    switch (scope) {
      case 'platform':
        return <FiPackage className="text-blue-600" />;
      case 'seller':
        return <FiUsers className="text-orange-600" />;
      case 'product':
        return <FiTag className="text-green-600" />;
      case 'category':
        return <FiFilter className="text-purple-600" />;
      default:
        return <FiPackage />;
    }
  };

  const isExpired = (endDate) => {
    return new Date(endDate) < new Date();
  };

  const isActive = (startDate, endDate, isActive) => {
    const now = new Date();
    return isActive && new Date(startDate) <= now && new Date(endDate) >= now;
  };

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coupon.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-gray-900 flex items-center gap-3">
                <FiTag className="text-blue-600" />
                All Coupons
              </h1>
              <p className="text-gray-600 mt-2">Manage all your discount coupons</p>
            </div>
            <button
              onClick={() => router.push('/admin/coupons/create')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg font-medium"
            >
              <FiPlus className="text-xl" />
              Create New Coupon
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('✓')
              ? 'bg-green-50 border-2 border-green-200 text-green-700'
              : 'bg-red-50 border-2 border-red-200 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Search by code or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'active', label: 'Active' },
                { value: 'expired', label: 'Expired' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    filter === value
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700 font-medium">Total Coupons</p>
              <p className="text-3xl font-semibold text-blue-900">{coupons.length}</p>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700 font-medium">Active Coupons</p>
              <p className="text-3xl font-semibold text-green-900">
                {coupons.filter(c => isActive(c.startDate, c.endDate, c.isActive)).length}
              </p>
            </div>
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700 font-medium">Expired Coupons</p>
              <p className="text-3xl font-semibold text-red-900">
                {coupons.filter(c => isExpired(c.endDate)).length}
              </p>
            </div>
          </div>
        </div>

        {/* Coupons Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-600 mt-4">Loading coupons...</p>
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="p-12 text-center">
              <FiTag className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No coupons found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Code</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Discount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Scope</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Usage</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Valid Period</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCoupons.map((coupon) => (
                    <tr key={coupon._id} className="hover:bg-gray-50 transition-colors">
                      {/* Code */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">{coupon.code}</p>
                          <p className="text-sm text-gray-600 truncate max-w-xs">{coupon.description}</p>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getDiscountIcon(coupon.discountType)}
                          <span className="text-sm font-medium capitalize">
                            {coupon.discountType.replace('_', ' ')}
                          </span>
                        </div>
                      </td>

                      {/* Discount */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-green-600">
                          {coupon.discountType === 'percentage' && `${coupon.discountValue}%`}
                          {coupon.discountType === 'fixed' && `₹${coupon.discountValue}`}
                          {coupon.discountType === 'free_shipping' && 'Free Shipping'}
                        </div>
                        {coupon.maxDiscountAmount && (
                          <p className="text-xs text-gray-600">Max: ₹{coupon.maxDiscountAmount}</p>
                        )}
                      </td>

                      {/* Scope */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getScopeIcon(coupon.scope)}
                          <span className="text-sm font-medium capitalize">{coupon.scope}</span>
                        </div>
                      </td>

                      {/* Usage */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {coupon.currentUsageCount} / {coupon.totalUsageLimit || '∞'}
                          </p>
                          <p className="text-xs text-gray-600">Per user: {coupon.perUserLimit}</p>
                        </div>
                      </td>

                      {/* Valid Period */}
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <FiCalendar className="text-xs" />
                            <span>{new Date(coupon.startDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <FiClock className="text-xs" />
                            <span>{new Date(coupon.endDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {isActive(coupon.startDate, coupon.endDate, coupon.isActive) ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                            Active
                          </span>
                        ) : isExpired(coupon.endDate) ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                            Expired
                          </span>
                        ) : !coupon.isActive ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                            <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                            Inactive
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                            <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                            Scheduled
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleCouponStatus(coupon._id, coupon.isActive)}
                            className={`p-2 rounded-lg transition-colors ${
                              coupon.isActive
                                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title={coupon.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {coupon.isActive ? <FiToggleRight className="text-xl" /> : <FiToggleLeft className="text-xl" />}
                          </button>
                          <button
                            onClick={() => deleteCoupon(coupon._id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 className="text-xl" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
