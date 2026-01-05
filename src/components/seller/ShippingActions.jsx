// components/seller/ShippingActions.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ShippingActions({ order, onUpdate }) {
    const [loading, setLoading] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState('shiprocket');

    const isShipped = order.shipping?.trackingId || order.status === 'shipped';

    const handleShip = async (provider) => {
        if (!confirm(`Ship this order via ${provider === 'shiprocket' ? 'Shiprocket' : 'Ekart'}?`)) {
            return;
        }

        setLoading(true);
        const loadingToast = toast.loading(`Creating ${provider} shipment...`);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `/api/shipping/${provider}/create`,
                { orderId: order._id },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            toast.dismiss(loadingToast);

            if (response.data.success) {
                toast.success(`Shipment created via ${provider}!`);
                onUpdate?.();
            } else {
                toast.error(response.data.message || 'Failed to create shipment');
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error('Shipping error:', error);
            toast.error(error.response?.data?.message || 'Failed to create shipment');
        } finally {
            setLoading(false);
        }
    };

    if (isShipped) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📦</span>
                    <div>
                        <h4 className="font-semibold text-green-900">Order Shipped</h4>
                        <p className="text-sm text-green-700">
                            Tracking ID: {order.shipping.trackingId}
                        </p>
                        <p className="text-sm text-green-700">
                            Provider: {order.shipping.provider || order.shipping.carrier}
                        </p>
                    </div>
                </div>

                {order.shipping.labelUrl && (
                    <a
                        href={order.shipping.labelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        View Shipping Label
                    </a>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ship Order</h3>

            <div className="space-y-4">
                {/* Provider Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Shipping Provider
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <label
                            className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedProvider === 'shiprocket'
                                    ? 'border-blue-600 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <input
                                type="radio"
                                name="provider"
                                value="shiprocket"
                                checked={selectedProvider === 'shiprocket'}
                                onChange={(e) => setSelectedProvider(e.target.value)}
                                className="sr-only"
                            />
                            <div className="text-center">
                                <div className="text-2xl mb-1">🚀</div>
                                <div className="font-semibold text-gray-900">Shiprocket</div>
                                <div className="text-xs text-gray-600">Pan-India</div>
                            </div>
                        </label>

                        <label
                            className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedProvider === 'ekart'
                                    ? 'border-blue-600 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <input
                                type="radio"
                                name="provider"
                                value="ekart"
                                checked={selectedProvider === 'ekart'}
                                onChange={(e) => setSelectedProvider(e.target.value)}
                                className="sr-only"
                            />
                            <div className="text-center">
                                <div className="text-2xl mb-1">📮</div>
                                <div className="font-semibold text-gray-900">Ekart</div>
                                <div className="text-xs text-gray-600">Elite</div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Shipping Details */}
                <div className="bg-gray-50 rounded-lg p-4 text-sm">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Delivery Location:</span>
                            <span className="font-medium">{order.shippingAddress.city}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Pincode:</span>
                            <span className="font-medium">{order.shippingAddress.pincode}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Payment Mode:</span>
                            <span className="font-medium uppercase">{order.payment.method}</span>
                        </div>
                    </div>
                </div>

                {/* Ship Button */}
                <button
                    onClick={() => handleShip(selectedProvider)}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
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
                        `Ship with ${selectedProvider === 'shiprocket' ? 'Shiprocket' : 'Ekart'}`
                    )}
                </button>
            </div>
        </div>
    );
}
