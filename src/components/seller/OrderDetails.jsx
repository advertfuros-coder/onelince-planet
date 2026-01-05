// components/seller/OrderDetails.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import ShippingActions from './ShippingActions';

const ORDER_STATUSES = [
    { value: 'pending', label: 'Pending', icon: '⏳', color: 'yellow' },
    { value: 'confirmed', label: 'Confirmed', icon: '✅', color: 'blue' },
    { value: 'processing', label: 'Processing', icon: '⚙️', color: 'purple' },
    { value: 'packed', label: 'Packed', icon: '📦', color: 'indigo' },
    { value: 'shipped', label: 'Shipped', icon: '🚚', color: 'cyan' },
    { value: 'out_for_delivery', label: 'Out for Delivery', icon: '🏃', color: 'teal' },
    { value: 'delivered', label: 'Delivered', icon: '🎉', color: 'green' },
];

export default function OrderDetails({ orderId, onClose, onUpdate }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details');
    const [showStatusUpdate, setShowStatusUpdate] = useState(false);
    const [showShippingForm, setShowShippingForm] = useState(false);

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrder(response.data.order);
        } catch (error) {
            toast.error('Failed to load order details');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!order) {
        return <div className="text-center p-8">Order not found</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
                                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                    ←
                                </button>
                                Order #{order.orderNumber}
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                    dateStyle: 'full'
                                })}
                            </p>
                        </div>

                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <button
                                onClick={() => setShowStatusUpdate(true)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Update Status
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-8">
                        {['details', 'timeline', 'notes', 'documents'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 px-2 border-b-2 transition-colors ${activeTab === tab
                                    ? 'border-blue-600 text-blue-600 font-semibold'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                {activeTab === 'details' && (
                    <OrderDetailsTab order={order} onUpdate={fetchOrderDetails} />
                )}
                {activeTab === 'timeline' && (
                    <TimelineTab timeline={order.timeline} />
                )}
                {activeTab === 'notes' && (
                    <NotesTab orderId={order._id} notes={order.notes} />
                )}
                {activeTab === 'documents' && (
                    <DocumentsTab orderId={order._id} order={order} />
                )}
            </div>

            {/* Status Update Modal */}
            {showStatusUpdate && (
                <StatusUpdateModal
                    order={order}
                    onClose={() => setShowStatusUpdate(false)}
                    onUpdate={() => {
                        fetchOrderDetails();
                        onUpdate?.();
                        setShowStatusUpdate(false);
                    }}
                />
            )}
        </div>
    );
}

function OrderDetailsTab({ order, onUpdate }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
                {/* Items */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                    <div className="space-y-4">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex gap-4 pb-4 border-b last:border-b-0">
                                <img
                                    src={item.images?.[0] || '/placeholder-product.png'}
                                    alt={item.name}
                                    className="w-20 h-20 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                    <p className="text-sm text-gray-600">SKU: {item.sku || 'N/A'}</p>
                                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">₹{item.price.toFixed(2)}</p>
                                    <p className="text-sm text-gray-600">
                                        Total: ₹{(item.price * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pricing Summary */}
                    <div className="mt-6 pt-4 border-t space-y-2">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>₹{order.pricing.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Shipping</span>
                            <span>₹{order.pricing.shipping.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Tax (GST)</span>
                            <span>₹{order.pricing.tax.toFixed(2)}</span>
                        </div>
                        {order.pricing.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                                <span>Discount</span>
                                <span>-₹{order.pricing.discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t">
                            <span>Total</span>
                            <span>₹{order.pricing.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
                    <div className="text-gray-700">
                        <p className="font-semibold">{order.shippingAddress.name}</p>
                        <p>{order.shippingAddress.phone}</p>
                        {order.shippingAddress.email && <p>{order.shippingAddress.email}</p>}
                        <p className="mt-2">{order.shippingAddress.addressLine1}</p>
                        {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                        <p>
                            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
                {/* Status Card */}
                <StatusCard order={order} />

                {/* Payment Info */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Method:</span>
                            <span className="font-semibold">{order.payment.method.toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={`font-semibold ${order.payment.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                                }`}>
                                {order.payment.status.toUpperCase()}
                            </span>
                        </div>
                        {order.payment.transactionId && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Transaction ID:</span>
                                <span className="font-mono text-xs">{order.payment.transactionId}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Shipping Info */}
                {order.status !== 'pending' && order.status !== 'confirmed' && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
                        {order.shipping?.trackingId ? (
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tracking ID:</span>
                                    <span className="font-mono text-xs">{order.shipping.trackingId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Carrier:</span>
                                    <span className="font-semibold">{order.shipping.carrier}</span>
                                </div>
                                {order.shipping.estimatedDelivery && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Est. Delivery:</span>
                                        <span>{new Date(order.shipping.estimatedDelivery).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-600 text-sm">Shipping details will appear once the order is shipped.</p>
                        )}
                    </div>
                )}

                {/* Shipping Actions */}
                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <ShippingActions order={order} onUpdate={onUpdate} />
                )}
            </div>
        </div>
    );
}

function StatusCard({ order }) {
    const currentStatus = ORDER_STATUSES.find(s => s.value === order.status);
    const currentIndex = ORDER_STATUSES.findIndex(s => s.value === order.status);

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
            <div className="space-y-4">
                {ORDER_STATUSES.map((status, idx) => {
                    const isActive = idx === currentIndex;
                    const isCompleted = idx < currentIndex;

                    return (
                        <div key={status.value} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${isActive
                                ? 'bg-blue-600 text-white'
                                : isCompleted
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-200 text-gray-500'
                                }`}>
                                {isCompleted ? '✓' : status.icon}
                            </div>
                            <div className="flex-1">
                                <p className={`font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                                    }`}>
                                    {status.label}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function TimelineTab({ timeline }) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Timeline</h3>
            <div className="space-y-6">
                {timeline.map((event, idx) => (
                    <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                            {idx !== timeline.length - 1 && (
                                <div className="w-0.5 h-full bg-blue-200 my-1"></div>
                            )}
                        </div>
                        <div className="flex-1 pb-6">
                            <p className="font-semibold text-gray-900">{event.status.replace('_', ' ').toUpperCase()}</p>
                            <p className="text-gray-600 text-sm">{event.description}</p>
                            <p className="text-gray-400 text-xs mt-1">
                                {new Date(event.timestamp).toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function NotesTab({ orderId, notes }) {
    const [newNote, setNewNote] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [adding, setAdding] = useState(false);
    const [allNotes, setAllNotes] = useState(notes || []);

    const addNote = async () => {
        if (!newNote.trim()) return;

        setAdding(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `/api/orders/${orderId}/notes`,
                { text: newNote, isInternal },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAllNotes(response.data.order.notes);
            setNewNote('');
            toast.success('Note added');
        } catch (error) {
            toast.error('Failed to add note');
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Add Note Form */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Note</h3>
                <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note about this order..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                />
                <div className="mt-4 flex items-center justify-between">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={isInternal}
                            onChange={(e) => setIsInternal(e.target.checked)}
                            className="rounded"
                        />
                        <span className="text-sm text-gray-700">Internal note (not visible to customer)</span>
                    </label>
                    <button
                        onClick={addNote}
                        disabled={adding || !newNote.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {adding ? 'Adding...' : 'Add Note'}
                    </button>
                </div>
            </div>

            {/* Notes List */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">All Notes</h3>
                {allNotes.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">No notes yet</p>
                ) : (
                    <div className="space-y-4">
                        {allNotes.map((note, idx) => (
                            <div key={idx} className="border-l-4 border-blue-600 pl-4 py-2">
                                <p className="text-gray-900">{note.text}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                    <span>By: {note.addedBy}</span>
                                    <span>{new Date(note.timestamp).toLocaleString('en-IN')}</span>
                                    {note.isInternal && (
                                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded">Internal</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function DocumentsTab({ orderId, order }) {
    const downloadPackingSlip = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/orders/${orderId}/packing-slip`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Packing Slip:', response.data.packingSlip);
            toast.success('Packing slip generated');
            // TODO: Generate PDF
        } catch (error) {
            toast.error('Failed to generate packing slip');
        }
    };

    const downloadInvoice = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/orders/${orderId}/invoice`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Invoice:', response.data.invoice);
            toast.success('Invoice generated');
            // TODO: Generate PDF
        } catch (error) {
            toast.error('Failed to generate invoice');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DocumentCard
                    title="Packing Slip"
                    icon="📄"
                    description="Print packing slip for this order"
                    onClick={downloadPackingSlip}
                />
                <DocumentCard
                    title="GST Invoice"
                    icon="📋"
                    description="Download GST-compliant invoice"
                    onClick={downloadInvoice}
                />
                <DocumentCard
                    title="Shipping Label"
                    icon="🏷️"
                    description="Print shipping label"
                    onClick={() => toast('Coming soon')}
                />
            </div>
        </div>
    );
}

function DocumentCard({ title, icon, description, onClick }) {
    return (
        <button
            onClick={onClick}
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50transition-all text-left"
        >
            <div className="text-4xl mb-2">{icon}</div>
            <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
            <p className="text-sm text-gray-600">{description}</p>
        </button>
    );
}

function StatusUpdateModal({ order, onClose, onUpdate }) {
    const [newStatus, setNewStatus] = useState(order.status);
    const [trackingId, setTrackingId] = useState('');
    const [carrier, setCarrier] = useState('');
    const [updating, setUpdating] = useState(false);

    const handleUpdate = async () => {
        setUpdating(true);
        try {
            const token = localStorage.getItem('token');
            const payload = { status: newStatus };

            if (newStatus === 'shipped') {
                if (!trackingId || !carrier) {
                    toast.error('Tracking ID and carrier are required for shipped status');
                    setUpdating(false);
                    return;
                }
                payload.trackingId = trackingId;
                payload.carrier = carrier;
            }

            await axios.put(
                `/api/orders/${order._id}/status`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success('Order status updated successfully');
            onUpdate();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Update Order Status</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Status
                        </label>
                        <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            {ORDER_STATUSES.map(status => (
                                <option key={status.value} value={status.value}>
                                    {status.icon} {status.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {newStatus === 'shipped' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tracking ID
                                </label>
                                <input
                                    type="text"
                                    value={trackingId}
                                    onChange={(e) => setTrackingId(e.target.value)}
                                    placeholder="Enter tracking number"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Carrier
                                </label>
                                <input
                                    type="text"
                                    value={carrier}
                                    onChange={(e) => setCarrier(e.target.value)}
                                    placeholder="e.g., Delhivery, Blue Dart"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={updating}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {updating ? 'Updating...' : 'Update Status'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
