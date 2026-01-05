// components/payment/PaymentCheckout.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import CouponApplier from '@/components/customer/CouponApplier';

export default function PaymentCheckout({ order, onSuccess, onCancel }) {
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('online');
    const [razorpayLoaded, setRazorpayLoaded] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => setRazorpayLoaded(true);
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleOnlinePayment = async () => {
        if (!razorpayLoaded) {
            toast.error('Payment system loading... Please wait');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            // Step 1: Create Razorpay order
            toast.loading('Initializing payment...');
            const { data } = await axios.post(
                '/api/payment/create-order',
                {
                    orderId: order._id,
                    amount: order.pricing.total,
                    currency: 'INR'
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            toast.dismiss();

            if (!data.success) {
                throw new Error(data.message);
            }

            // Step 2: Open Razorpay Checkout
            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency,
                name: 'Online Planet',
                description: `Order #${order.orderNumber}`,
                image: '/logo.png', // Add your logo
                order_id: data.razorpayOrderId,

                // Customer details prefill
                prefill: {
                    name: order.shippingAddress.name,
                    email: order.shippingAddress.email,
                    contact: order.shippingAddress.phone
                },

                // Payment success handler
                handler: async function (response) {
                    try {
                        toast.loading('Verifying payment...');

                        // Step 3: Verify payment
                        const verifyResponse = await axios.post(
                            '/api/payment/verify',
                            {
                                orderId: order._id,
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature
                            },
                            {
                                headers: { Authorization: `Bearer ${token}` }
                            }
                        );

                        toast.dismiss();

                        if (verifyResponse.data.success) {
                            toast.success('Payment successful!');
                            onSuccess?.(verifyResponse.data.order);
                        } else {
                            toast.error('Payment verification failed');
                        }
                    } catch (error) {
                        toast.dismiss();
                        toast.error(error.response?.data?.message || 'Payment verification failed');
                    }
                },

                // Theme customization
                theme: {
                    color: '#667eea',
                    backdrop_color: '#00000080'
                },

                // Modal settings
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                        console.log('Payment cancelled by user');
                    },
                    escape: true,
                    animation: true,
                    confirm_close: true
                },

                // Retry settings
                retry: {
                    enabled: true,
                    max_count: 3
                },

                // Additional options
                timeout: 900, // 15 minutes
                remember_customer: true
            };

            const rzp = new window.Razorpay(options);

            // Handle payment failures
            rzp.on('payment.failed', function (response) {
                console.error('Payment failed:', response.error);
                toast.error(`Payment failed: ${response.error.description}`);
                setLoading(false);
            });

            rzp.open();
        } catch (error) {
            toast.dismiss();
            console.error('Payment error:', error);
            toast.error(error.response?.data?.message || 'Failed to initialize payment');
            setLoading(false);
        }
    };

    const handleCODPayment = async () => {
        try {
            toast.success('Order placed with Cash on Delivery');
            onSuccess?.(order);
        } catch (error) {
            toast.error('Failed to place COD order');
        }
    };

    const handlePayment = () => {
        if (paymentMethod === 'online') {
            handleOnlinePayment();
        } else if (paymentMethod === 'cod') {
            handleCODPayment();
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-8"
            >
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Complete Payment</h2>
                    <p className="text-gray-600">Order #{order.orderNumber}</p>
                </div>

                {/* Coupon Applier */}
                <div className="mb-6">
                    <CouponApplier
                        cartTotal={order.pricing.total}
                        onCouponApplied={(coupon) => {
                            if (coupon) {
                                setAppliedCoupon(coupon);
                                setDiscountAmount(coupon.discount);
                            } else {
                                setAppliedCoupon(null);
                                setDiscountAmount(0);
                            }
                        }}
                    />
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">\n                    <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal ({order.items.length} items)</span>
                            <span className="font-medium">₹{order.pricing.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Shipping</span>
                            <span className="font-medium">
                                {(appliedCoupon?.freeShipping || order.pricing.shipping === 0) ? (
                                    <span className="text-green-600">FREE</span>
                                ) : (
                                    `₹${order.pricing.shipping.toFixed(2)}`
                                )}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Tax (GST)</span>
                            <span className="font-medium">₹{order.pricing.tax.toFixed(2)}</span>
                        </div>
                        {(order.pricing.discount > 0 || discountAmount > 0) && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount {appliedCoupon && `(${appliedCoupon.coupon.code})`}</span>
                                <span className="font-medium">-₹{(order.pricing.discount + discountAmount).toFixed(2)}</span>
                            </div>
                        )}
                        <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between text-lg font-semibold">
                                <span>Total Amount</span>
                                <span className="text-blue-600">₹{(order.pricing.total - discountAmount).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Method Selection */}
                <div className="mb-8">
                    <h3 className="font-semibold text-gray-900 mb-4">Select Payment Method</h3>

                    <div className="space-y-3">
                        {/* Online Payment */}
                        <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'online'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="online"
                                checked={paymentMethod === 'online'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-5 h-5 text-blue-600"
                            />
                            <div className="ml-4 flex-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-900">Online Payment</p>
                                        <p className="text-sm text-gray-600">Cards, UPI, Netbanking, Wallets</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Instant</span>
                                    </div>
                                </div>
                            </div>
                        </label>

                        {/* Cash on Delivery */}
                        <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'cod'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}>
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="cod"
                                checked={paymentMethod === 'cod'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-5 h-5 text-blue-600"
                            />
                            <div className="ml-4 flex-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-900">Cash on Delivery</p>
                                        <p className="text-sm text-gray-600">Pay when you receive</p>
                                    </div>
                                    {order.pricing.total < 1000 && (
                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Available</span>
                                    )}
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Payment Info */}
                {paymentMethod === 'online' && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Secure Payment</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>✓ 256-bit SSL encrypted</li>
                            <li>✓ PCI DSS compliant</li>
                            <li>✓ Powered by Razorpay</li>
                        </ul>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handlePayment}
                        disabled={loading || (paymentMethod === 'online' && !razorpayLoaded)}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            `Pay ₹${order.pricing.total.toFixed(2)}`
                        )}
                    </button>
                </div>

                {/* Security Badge */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Your payment information is secure and encrypted
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
