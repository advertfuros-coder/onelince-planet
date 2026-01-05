// components/payment/PaymentStatus.jsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PaymentStatus({ status, order, message }) {
    const statusConfig = {
        success: {
            icon: '✅',
            title: 'Payment Successful!',
            color: 'green',
            bgColor: 'bg-green-50',
            textColor: 'text-green-900',
            borderColor: 'border-green-200'
        },
        failed: {
            icon: '❌',
            title: 'Payment Failed',
            color: 'red',
            bgColor: 'bg-red-50',
            textColor: 'text-red-900',
            borderColor: 'border-red-200'
        },
        pending: {
            icon: '⏳',
            title: 'Payment Pending',
            color: 'yellow',
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-900',
            borderColor: 'border-yellow-200'
        }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-md w-full"
            >
                <div className={`bg-white rounded-xl shadow-lg p-8 border-2 ${config.borderColor}`}>
                    {/* Icon */}
                    <div className="text-center mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${config.bgColor} mb-4`}>
                            <span className="text-4xl">{config.icon}</span>
                        </div>
                        <h2 className={`text-2xl font-semibold ${config.textColor}`}>{config.title}</h2>
                    </div>

                    {/* Message */}
                    {message && (
                        <p className="text-gray-600 text-center mb-6">{message}</p>
                    )}

                    {/* Order Details */}
                    {order && (
                        <div className={`${config.bgColor} rounded-lg p-4 mb-6`}>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Order Number:</span>
                                    <span className="font-semibold">{order.orderNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Amount:</span>
                                    <span className="font-semibold">₹{order.pricing?.total?.toFixed(2)}</span>
                                </div>
                                {order.payment?.transactionId && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Transaction ID:</span>
                                        <span className="font-mono text-xs">{order.payment.transactionId}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-3">
                        {status === 'success' && order && (
                            <Link
                                href={`/orders/${order._id}`}
                                className="block w-full px-6 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                            >
                                View Order Details
                            </Link>
                        )}

                        {status === 'failed' && (
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                            >
                                Try Again
                            </button>
                        )}

                        <Link
                            href="/orders"
                            className="block w-full px-6 py-3 border border-gray-300 text-gray-700 text-center rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            View All Orders
                        </Link>
                    </div>

                    {/* Help Text */}
                    <p className="mt-6 text-xs text-gray-500 text-center">
                        {status === 'success' && 'You will receive order updates via WhatsApp, SMS & Email'}
                        {status === 'failed' && 'If amount was deducted, it will be refunded within 5-7 business days'}
                        {status === 'pending' && 'Please wait while we confirm your payment'}
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
