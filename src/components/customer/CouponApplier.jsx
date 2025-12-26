// components/customer/CouponApplier.jsx
'use client';

import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function CouponApplier({ cartTotal, onCouponApplied }) {
    const [couponCode, setCouponCode] = useState('');
    const [validating, setValidating] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    const handleApply = async () => {
        if (!couponCode.trim()) {
            toast.error('Please enter a coupon code');
            return;
        }

        setValidating(true);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/coupons/validate', {
                code: couponCode,
                cartTotal
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setAppliedCoupon(response.data);
                onCouponApplied?.(response.data);
                toast.success(`Coupon applied! Saved ₹${response.data.discount}`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid coupon code');
        } finally {
            setValidating(false);
        }
    };

    const handleRemove = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        onCouponApplied?.(null);
        toast.success('Coupon removed');
    };

    if (appliedCoupon) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div>
                        < div className="flex items-center gap-2">
                            <span className="text-2xl">🎉</span>
                            <div>
                                <p className="font-semibold text-green-900">
                                    Coupon Applied: {appliedCoupon.coupon.code}
                                </p>
                                <p className="text-sm text-green-700">
                                    You saved ₹{appliedCoupon.discount}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleRemove}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                    >
                        Remove
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Have a coupon code?</h3>
            <div className="flex gap-3">
                <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                    onKeyPress={(e) => e.key === 'Enter' && handleApply()}
                />
                <button
                    onClick={handleApply}
                    disabled={validating || !couponCode.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                    {validating ? 'Checking...' : 'Apply'}
                </button>
            </div>
        </div>
    );
}
