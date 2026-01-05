// components/admin/CouponManager.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function CouponManager() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [filter, setFilter] = useState('active');

    useEffect(() => {
        fetchCoupons();
    }, [filter]);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/coupons?status=${filter}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setCoupons(response.data.coupons);
            }
        } catch (error) {
            toast.error('Failed to fetch coupons');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">Coupon Management</h1>
                    <p className="text-gray-600 mt-1">Create and manage discount coupons</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                    + Create Coupon
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-6">
                {['active', 'expired', 'all'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg transition-colors ${filter === status
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {/* Coupons List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : coupons.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-4xl mb-4">🎫</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No coupons found</h3>
                    <p className="text-gray-600">Create your first coupon to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coupons.map(coupon => (
                        <CouponCard key={coupon._id} coupon={coupon} onUpdate={fetchCoupons} />
                    ))}
                </div>
            )}

            {/* Create Form Modal */}
            {showCreateForm && (
                <CreateCouponModal
                    onClose={() => setShowCreateForm(false)}
                    onSuccess={() => {
                        setShowCreateForm(false);
                        fetchCoupons();
                    }}
                />
            )}
        </div>
    );
}

function CouponCard({ coupon, onUpdate }) {
    const isExpired = new Date(coupon.validUntil) < new Date();
    const usagePercentage = coupon.usageLimit?.total
        ? (coupon.usageCount.total / coupon.usageLimit.total) * 100
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-400 transition-colors"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-2xl font-semibold text-blue-600">{coupon.code}</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${coupon.type === 'percentage' ? 'bg-purple-100 text-purple-800' :
                            coupon.type === 'fixed' ? 'bg-green-100 text-green-800' :
                                'bg-blue-100 text-blue-800'
                        }`}>
                        {coupon.type === 'percentage' ? `${coupon.value}% OFF` :
                            coupon.type === 'fixed' ? `₹${coupon.value} OFF` :
                                'FREE SHIPPING'}
                    </span>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isExpired ? 'bg-red-100 text-red-800' :
                        coupon.isActive ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                    }`}>
                    {isExpired ? 'Expired' : coupon.isActive ? 'Active' : 'Inactive'}
                </div>
            </div>

            {/* Description */}
            {coupon.description && (
                <p className="text-gray-600 text-sm mb-4">{coupon.description}</p>
            )}

            {/* Details */}
            <div className="space-y-2 text-sm">
                {coupon.minimumPurchase > 0 && (
                    <div className="flex justify-between text-gray-600">
                        <span>Min. Purchase:</span>
                        <span className="font-semibold">₹{coupon.minimumPurchase}</span>
                    </div>
                )}

                <div className="flex justify-between text-gray-600">
                    <span>Valid Until:</span>
                    <span className="font-semibold">
                        {new Date(coupon.validUntil).toLocaleDateString()}
                    </span>
                </div>

                {coupon.usageLimit?.total && (
                    <>
                        <div className="flex justify-between text-gray-600">
                            <span>Usage:</span>
                            <span className="font-semibold">
                                {coupon.usageCount.total} / {coupon.usageLimit.total}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Analytics */}
            {coupon.analytics?.totalOrders > 0 && (
                <div className="mt-4 pt-4 border-t space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Orders:</span>
                        <span className="font-semibold">{coupon.analytics.totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Revenue:</span>
                        <span className="font-semibold text-green-600">
                            ₹{coupon.analytics.totalRevenue.toFixed(2)}
                        </span>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

function CreateCouponModal({ onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        code: '',
        type: 'percentage',
        value: '',
        description: '',
        minimumPurchase: '',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
        usageLimit: {
            total: '',
            perUser: 1
        }
    });
    const [creating, setCreating] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCreating(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/coupons', {
                ...formData,
                value: parseFloat(formData.value),
                minimumPurchase: parseFloat(formData.minimumPurchase) || 0,
                usageLimit: {
                    total: parseInt(formData.usageLimit.total) || undefined,
                    perUser: parseInt(formData.usageLimit.perUser) || 1
                }
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success('Coupon created successfully!');
                onSuccess();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create coupon');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            >
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Create New Coupon</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Code */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Coupon Code *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            placeholder="e.g., SAVE10"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Type & Value */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type *
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="percentage">Percentage</option>
                                <option value="fixed">Fixed Amount</option>
                                <option value="free_shipping">Free Shipping</option>
                            </select>
                        </div>

                        {formData.type !== 'free_shipping' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Value * {formData.type === 'percentage' ? '(%)' : '(₹)'}
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                    placeholder={formData.type === 'percentage' ? '10' : '100'}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={2}
                            placeholder="Save 10% on your order"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Min Purchase */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Minimum Purchase (₹)
                        </label>
                        <input
                            type="number"
                            value={formData.minimumPurchase}
                            onChange={(e) => setFormData({ ...formData, minimumPurchase: e.target.value })}
                            placeholder="0"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Valid From *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.validFrom}
                                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Valid Until *
                            </label>
                            <input
                                type="date"
                                required
                                value={formData.validUntil}
                                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Usage Limits */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Total Usage Limit
                            </label>
                            <input
                                type="number"
                                value={formData.usageLimit.total}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    usageLimit: { ...formData.usageLimit, total: e.target.value }
                                })}
                                placeholder="Unlimited"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Per User Limit
                            </label>
                            <input
                                type="number"
                                value={formData.usageLimit.perUser}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    usageLimit: { ...formData.usageLimit, perUser: e.target.value }
                                })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={creating}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold"
                        >
                            {creating ? 'Creating...' : 'Create Coupon'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
