// components/customer/OrderTracking.jsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function OrderTracking({ order }) {
    const [tracking, setTracking] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (order?.shipping?.trackingId) {
            fetchTracking();
        }
    }, [order]);

    const fetchTracking = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `/api/shipping/track?trackingId=${order.shipping.trackingId}&provider=${order.shipping.provider}`
            );

            if (response.data.success) {
                setTracking(response.data.data);
            }
        } catch (error) {
            console.error('Tracking fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!order?.shipping?.trackingId) {
        return (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="text-4xl mb-2">📦</div>
                <h3 className="font-semibold text-gray-900 mb-1">Order Not Yet Shipped</h3>
                <p className="text-gray-600 text-sm">
                    Your order is being prepared for shipment
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Track Shipment</h3>
                <button
                    onClick={fetchTracking}
                    disabled={loading}
                    className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Refreshing...' : '🔄 Refresh'}
                </button>
            </div>

            {/* Tracking Info */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">Tracking ID:</span>
                        <p className="font-semibold text-gray-900">{order.shipping.trackingId}</p>
                    </div>
                    <div>
                        <span className="text-gray-600">Courier:</span>
                        <p className="font-semibold text-gray-900">{order.shipping.carrier || 'Processing'}</p>
                    </div>
                    <div>
                        <span className="text-gray-600">Provider:</span>
                        <p className="font-semibold text-gray-900 capitalize">{order.shipping.provider}</p>
                    </div>
                    <div>
                        <span className="text-gray-600">Status:</span>
                        <p className="font-semibold text-green-600">In Transit</p>
                    </div>
                </div>
            </div>

            {/* Shipping Timeline */}
            <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Shipment History</h4>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {order.timeline
                            .filter(event => ['packed', 'shipped', 'out_for_delivery', 'delivered'].includes(event.status))
                            .reverse()
                            .map((event, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="flex gap-4"
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                                        {idx !== order.timeline.length - 1 && (
                                            <div className="w-0.5 h-full bg-blue-200 my-1"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <p className="font-semibold text-gray-900 capitalize">
                                            {event.status.replace('_', ' ')}
                                        </p>
                                        <p className="text-sm text-gray-600">{event.description}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(event.timestamp).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                    </div>
                )}
            </div>

            {/* Label Download */}
            {order.shipping.labelUrl && (
                <div className="mt-6 pt-6 border-t">
                    <a
                        href={order.shipping.labelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                        </svg>
                        Download Shipping Label
                    </a>
                </div>
            )}
        </div>
    );
}
