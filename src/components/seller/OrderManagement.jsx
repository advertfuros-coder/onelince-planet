// components/seller/OrderManagement.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    Package,
    Search,
    Filter,
    ChevronRight,
    Clock,
    CheckCircle2,
    Truck,
    XCircle,
    ArrowUpRight,
    LayoutGrid,
    List,
    MoreVertical,
    Calendar,
    User,
    CreditCard,
    MapPin,
    Eye,
    Settings,
    RefreshCw,
    Download
} from 'lucide-react';

const statusConfig = {
    pending: { color: 'amber', icon: Clock, label: 'Pending Approval' },
    confirmed: { color: 'blue', icon: CheckCircle2, label: 'Store Confirmed' },
    processing: { color: 'indigo', icon: Settings, label: 'In Preparation' },
    packed: { color: 'violet', icon: Package, label: 'Packed & Ready' },
    shipped: { color: 'cyan', icon: Truck, label: 'In Transit' },
    out_for_delivery: { color: 'teal', icon: Truck, label: 'Out for Delivery' },
    delivered: { color: 'emerald', icon: CheckCircle2, label: 'Delivered' },
    cancelled: { color: 'rose', icon: XCircle, label: 'Cancelled' },
    returned: { color: 'orange', icon: RefreshCw, label: 'Returned' },
    refunded: { color: 'slate', icon: CreditCard, label: 'Refunded' },
};

export default function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedOrderIds, setSelectedOrderIds] = useState([]);
    const [viewMode, setViewMode] = useState('list');

    useEffect(() => {
        fetchOrders();
    }, []);

    const toggleSelectOrder = (id) => {
        setSelectedOrderIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedOrderIds.length === filteredOrders.length) {
            setSelectedOrderIds([]);
        } else {
            setSelectedOrderIds(filteredOrders.map(o => o._id));
        }
    };

    const handleBulkStatusUpdate = async (newStatus) => {
        if (selectedOrderIds.length === 0) return;

        const loadingToast = toast.loading(`Synchronizing ${selectedOrderIds.length} units to ${newStatus}...`);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/seller/orders/bulk-status', {
                orderIds: selectedOrderIds,
                status: newStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                toast.success('Matrix synchronization complete', { id: loadingToast });
                setSelectedOrderIds([]);
                fetchOrders();
            }
        } catch (error) {
            toast.error('Matrix synchronization interrupted', { id: loadingToast });
        }
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            console.log('=== FRONTEND: Fetching seller orders ===');
            console.log('Token exists:', !!token);

            const response = await axios.get('/api/seller/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('API Response:', response.data);
            console.log('Orders received:', response.data.orders?.length || 0);

            if (response.data.orders && response.data.orders.length > 0) {
                console.log('Sample order:', response.data.orders[0]);
            }

            setOrders(response.data.orders || []);
        } catch (error) {
            console.error('Fetch orders error:', error);
            console.error('Error response:', error.response?.data);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesFilter = filter === 'all' || order.status === filter;
        const matchesSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.shippingAddress?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const orderStats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8">
            <div className="max-w-[1500px] mx-auto space-y-8">

                {/* Modern Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                                <Package size={18} />
                            </div>
                            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Order Hub</span>
                        </div>
                        <h1 className="text-4xl font-semibold text-gray-900 tracking-tighter">Fulfillment Pipeline</h1>
                        <p className="text-gray-500 font-medium mt-1">Real-time logistics monitoring and order lifecycle management</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-100 rounded-2xl font-semibold text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all active:scale-95">
                            <Download size={18} />
                            <span>Export Manifest</span>
                        </button>
                        <button
                            onClick={fetchOrders}
                            className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 shadow-sm transition-all"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                {/* Logistics Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                    <OrderMetricCard label="Total Vol" value={orderStats.total} icon={Package} color="blue" delay={0.1} />
                    <OrderMetricCard label="Pending" value={orderStats.pending} icon={Clock} color="amber" delay={0.2} alert={orderStats.pending > 0} />
                    <OrderMetricCard label="Preparation" value={orderStats.processing} icon={Settings} color="indigo" delay={0.3} />
                    <OrderMetricCard label="Transit" value={orderStats.shipped} icon={Truck} color="cyan" delay={0.4} />
                    <OrderMetricCard label="Delivered" value={orderStats.delivered} icon={CheckCircle2} color="emerald" delay={0.5} />
                </div>

                {/* Filter Bar */}
                <div className="bg-white rounded-[2rem] p-4 lg:p-6 shadow-sm border border-gray-100/50 flex flex-col lg:flex-row gap-6 items-center">
                    <div className="relative group w-full lg:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Find ID, customer or SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto invisible-scrollbar">
                        {['all', 'pending', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-tight transition-all shrink-0 ${filter === status
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                    }`}
                            >
                                {status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>

                    <div className="hidden lg:flex items-center gap-2 ml-auto">
                        <div className="bg-gray-50 p-1 rounded-xl flex items-center">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
                            >
                                <List size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
                            >
                                <LayoutGrid size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bulk Action Bar */}
                <AnimatePresence>
                    {selectedOrderIds.length > 0 && (
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[80] bg-gray-900 text-white px-8 py-4 rounded-[2.5rem] shadow-2xl flex items-center gap-8 border border-white/10 backdrop-blur-md bg-gray-900/90"
                        >
                            <div className="flex items-center gap-4 pr-8 border-r border-white/10">
                                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center font-semibold">
                                    {selectedOrderIds.length}
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-400">Units Selected</p>
                                    <p className="text-xs font-semibold text-white/60">Ready for batch processing</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mr-2">Transition To:</span>
                                {['confirmed', 'processing', 'packed', 'shipped'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => handleBulkStatusUpdate(status)}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all active:scale-95"
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setSelectedOrderIds([])}
                                className="ml-4 p-2 text-white/40 hover:text-white transition-colors"
                            >
                                <XCircle size={20} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results Section */}
                <div className="space-y-4">
                    {!loading && filteredOrders.length > 0 && (
                        <div className="flex items-center justify-between px-6 py-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div
                                    onClick={toggleSelectAll}
                                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedOrderIds.length === filteredOrders.length
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'border-gray-200 group-hover:border-blue-400'
                                        }`}
                                >
                                    {selectedOrderIds.length === filteredOrders.length && <CheckCircle2 size={14} />}
                                    {selectedOrderIds.length > 0 && selectedOrderIds.length < filteredOrders.length && <div className="w-2 h-0.5 bg-blue-600" />}
                                </div>
                                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Select All {filteredOrders.length} Units</span>
                            </label>
                        </div>
                    )}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 space-y-4">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <p className="text-gray-400 font-semibold uppercase tracking-widest text-[10px]">Syncing Logistics Console...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white rounded-[2.5rem] p-32 text-center border border-gray-100/50"
                        >
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Package className="w-10 h-10 text-blue-300" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 tracking-tighter">No Units in Pipeline</h3>
                            <p className="text-gray-500 font-medium mt-2 max-w-sm mx-auto">
                                {searchTerm || filter !== 'all'
                                    ? 'Adjust your search parameters to find matching orders.'
                                    : 'Incoming orders will appear here automatically as they are placed.'}
                            </p>
                        </motion.div>
                    ) : (
                        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
                            {filteredOrders.map((order, idx) => (
                                <OrderListItem
                                    key={order._id}
                                    order={order}
                                    onSelect={setSelectedOrder}
                                    onUpdate={fetchOrders}
                                    delay={idx * 0.05}
                                    viewMode={viewMode}
                                    isSelected={selectedOrderIds.includes(order._id)}
                                    onToggleSelect={() => toggleSelectOrder(order._id)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Details Overlay */}
                <AnimatePresence>
                    {selectedOrder && (
                        <OrderDetailsModal
                            order={selectedOrder}
                            onClose={() => setSelectedOrder(null)}
                            onUpdate={fetchOrders}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function OrderMetricCard({ label, value, icon: Icon, color, delay, alert }) {
    const colors = {
        blue: 'text-blue-600 bg-blue-50',
        amber: 'text-amber-600 bg-amber-50',
        indigo: 'text-indigo-600 bg-indigo-50',
        cyan: 'text-cyan-600 bg-cyan-50',
        emerald: 'text-emerald-600 bg-emerald-50',
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-white p-6 rounded-[2.2rem] shadow-sm border border-gray-100/50 group overflow-hidden relative"
        >
            {alert && <div className="absolute top-0 right-0 w-8 h-8 bg-amber-500/10 rounded-bl-[2rem] flex items-center justify-center"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" /></div>}
            <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform`}>
                    <Icon size={22} />
                </div>
                <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-3xl font-semibold text-gray-900 tracking-tight">{value || 0}</p>
                </div>
            </div>
        </motion.div>
    )
}

function OrderListItem({ order, onSelect, onUpdate, delay, viewMode, isSelected, onToggleSelect }) {
    const [updating, setUpdating] = useState(false);
    const totalItems = order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
    const config = statusConfig[order.status] || statusConfig.pending;
    const StatusIcon = config.icon;

    const quickStatusUpdate = async (newStatus) => {
        if (!confirm(`Confirm status transition to ${newStatus}?`)) return;

        setUpdating(true);
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `/api/orders/${order._id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Success: Dispatch state is now ${newStatus}`);
            onUpdate();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Transition Failed');
        } finally {
            setUpdating(false);
        }
    };

    if (viewMode === 'grid') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay }}
                className={`bg-white p-6 rounded-[2.2rem] border shadow-sm hover:shadow-xl transition-all group relative ${isSelected ? 'border-blue-600 ring-4 ring-blue-500/5' : 'border-gray-100/50'}`}
            >
                <div
                    onClick={onToggleSelect}
                    className={`absolute top-4 left-4 w-6 h-6 rounded-lg border-2 z-10 flex items-center justify-center transition-all cursor-pointer ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 group-hover:border-blue-300'
                        }`}
                >
                    {isSelected && <CheckCircle2 size={14} />}
                </div>

                <div className="flex justify-between items-start mb-6 pl-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h4 className="text-lg font-semibold text-gray-900 tracking-tight" onClick={() => onSelect(order)}>{order.orderNumber}</h4>
                            <ArrowUpRight size={14} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                        </div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        order.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                        <StatusIcon size={12} />
                        <span className="text-[10px] font-semibold uppercase tracking-tight">{config.label}</span>
                    </div>
                </div>

                <div className="space-y-4 mb-8 pl-8">
                    <div className="flex items-center gap-3 text-xs font-semibold text-gray-600">
                        <User size={14} className="text-gray-400" />
                        <span className="truncate">{order.shippingAddress?.name || order.customer?.name || 'Portal User'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-semibold text-gray-600">
                        <CreditCard size={14} className="text-gray-400" />
                        <span>₹{(order.pricing?.total || 0).toLocaleString()} <span className="text-[10px] text-gray-400 font-semibold uppercase ml-1">Paid • {order.paymentMethod || 'Razorpay'}</span></span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-semibold text-gray-600">
                        <Package size={14} className="text-gray-400" />
                        <span>{totalItems} Line Items</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pl-8">
                    <button
                        onClick={() => onSelect(order)}
                        className="py-3 bg-gray-50 text-gray-900 rounded-xl text-[10px] font-semibold uppercase hover:bg-gray-100 transition-all"
                    >
                        Detailed Log
                    </button>
                    {order.status === 'pending' && (
                        <button
                            onClick={() => quickStatusUpdate('confirmed')}
                            disabled={updating}
                            className="py-3 bg-blue-600 text-white rounded-xl text-[10px] font-semibold uppercase hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 active:scale-95 disabled:opacity-50"
                        >
                            Confirm Unit
                        </button>
                    )}
                    {order.status === 'confirmed' && (
                        <button
                            onClick={() => quickStatusUpdate('processing')}
                            disabled={updating}
                            className="py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-semibold uppercase hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            Start Prep
                        </button>
                    )}
                    {order.status === 'processing' && (
                        <button
                            onClick={() => quickStatusUpdate('packed')}
                            disabled={updating}
                            className="py-3 bg-violet-600 text-white rounded-xl text-[10px] font-semibold uppercase hover:bg-violet-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            Seal Pack
                        </button>
                    )}
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            className={`bg-white p-6 rounded-[2rem] border shadow-sm hover:shadow-lg transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 group ${isSelected ? 'border-blue-600 bg-blue-50/10' : 'border-gray-100/50'}`}
        >
            <div className="flex items-center gap-6">
                <div
                    onClick={onToggleSelect}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 group-hover:border-blue-300'
                        }`}
                >
                    {isSelected && <CheckCircle2 size={14} />}
                </div>

                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' :
                    order.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                        'bg-blue-50 text-blue-600'
                    }`}>
                    <Package size={22} />
                </div>

                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h4 className="text-base font-semibold text-gray-900 tracking-tight" onClick={() => onSelect(order)}>{order.orderNumber}</h4>
                        <div className={`px-2 py-0.5 rounded-lg border text-[9px] font-semibold uppercase tracking-tighter shrink-0 ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            order.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                'bg-blue-50 text-blue-600 border-blue-100'
                            }`}>
                            {config.label}
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] font-semibold text-gray-400">
                        <span className="flex items-center gap-1.5"><User size={12} /> {order.shippingAddress?.name || order.customer?.name || 'User'}</span>
                        <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={12} /> {order.shippingAddress?.city || 'Local'}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between lg:justify-end gap-8 border-t lg:border-none pt-4 lg:pt-0">
                <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 tracking-tight">₹{(order.pricing?.total || 0).toLocaleString()}</p>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{totalItems} Units</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onSelect(order)}
                        className="p-3 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    >
                        <Eye size={18} />
                    </button>

                    {order.status === 'pending' && (
                        <button
                            onClick={() => quickStatusUpdate('confirmed')}
                            disabled={updating}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-semibold uppercase hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 active:scale-95 disabled:opacity-50"
                        >
                            Confirm Dispatch
                        </button>
                    )}
                    {order.status === 'confirmed' && (
                        <button
                            onClick={() => quickStatusUpdate('processing')}
                            disabled={updating}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-semibold uppercase hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            Move to Prep
                        </button>
                    )}
                    {order.status === 'processing' && (
                        <button
                            onClick={() => quickStatusUpdate('packed')}
                            disabled={updating}
                            className="px-6 py-3 bg-violet-600 text-white rounded-xl text-[10px] font-semibold uppercase hover:bg-violet-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            Seal Manifest
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

function OrderDetailsModal({ order, onClose, onUpdate }) {
    const handleGenerateInvoice = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/seller/orders/${order._id}/invoice`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const blob = new Blob([response.data], { type: 'text/html' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${order.orderNumber}.html`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Invoice generated successfully');
        } catch (error) {
            console.error('Invoice error:', error);
            toast.error('Failed to generate invoice');
        }
    };

    const handleGenerateManifest = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/seller/orders/${order._id}/manifest`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success && response.data.manifest_url) {
                window.open(response.data.manifest_url, '_blank');
                toast.success('Manifest retrieved');
            } else {
                toast.error(response.data.message || 'Manifest not available');
            }
        } catch (error) {
            console.error('Manifest error:', error);
            toast.error('Failed to retrieve manifest');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed  inset-0 bg-gray-900/60 backdrop-blur-sm z-100 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                className="bg-white rounded-[3rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded tracking-widest uppercase">Unit Dossier</span>
                            <h2 className="text-2xl font-semibold text-gray-900 tracking-tighter">{order.orderNumber}</h2>
                        </div>
                        <p className="text-gray-400 font-semibold text-xs uppercase tracking-tight">Initialized on {new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center bg-white border border-gray-100 text-gray-400 hover:text-rose-600 rounded-2xl transition-all shadow-sm"
                    >
                        <XCircle size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Customer Information */}
                        <div className="space-y-8">
                            <section>
                                <h5 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Consignee Intelligence</h5>
                                <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                                    <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-200/50">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 mb-0.5">{order.shippingAddress?.name || order.customer?.name}</p>
                                            <p className="text-xs font-semibold text-gray-400 tracking-tight">{order.customer?.email || 'Authenticated Portal User'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                                            <MapPin size={20} />
                                        </div>
                                        <div className="text-xs font-semibold text-gray-600 leading-relaxed">
                                            {order.shippingAddress?.addressLine1} <br />
                                            {order.shippingAddress?.addressLine2 && <>{order.shippingAddress.addressLine2} <br /></>}
                                            {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h5 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Unit Manifest ({order.items?.length || 0})</h5>
                                <div className="space-y-3">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4 bg-white border border-gray-100 p-3 rounded-2xl">
                                            <div className="w-10 h-10 bg-gray-50 rounded-xl overflow-hidden shadow-inner">
                                                {item.productId?.images?.[0]?.url ? (
                                                    <img src={item.productId.images[0].url} className="w-full h-full object-cover" />
                                                ) : <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={16} /></div>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-semibold text-gray-900 truncate tracking-tight">{item.name || item.productId?.name}</p>
                                                <p className="text-[10px] font-semibold text-gray-400 uppercase">QTY: {item.quantity} • ₹{item.price?.toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[11px] font-semibold text-blue-600">₹{(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Financials & Logic */}
                        <div className="space-y-8">
                            <section>
                                <h5 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Financial Breakdown</h5>
                                <div className="bg-[#0A1128] rounded-3xl p-8 text-white relative overflow-hidden">
                                    <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
                                    <div className="relative z-10 space-y-4">
                                        <div className="flex justify-between text-white/50 text-[11px] font-semibold uppercase tracking-widest">
                                            <span>Subtotal</span>
                                            <span>₹{(order.pricing?.subtotal || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-white/50 text-[11px] font-semibold uppercase tracking-widest pb-6 border-b border-white/10">
                                            <span>Logistics</span>
                                            <span>{order.pricing?.shippingFee > 0 ? `₹${order.pricing.shippingFee}` : 'FREE'}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                                            <span className="text-xs font-semibold uppercase tracking-widest">Net Revenue</span>
                                            <span className="text-xl font-semibold text-blue-400">₹{(order.pricing?.total || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 pt-2">
                                            <CreditCard size={14} className="text-blue-400" />
                                            <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">Authenticated via {order.paymentMethod || 'SECURE PORTAL'}</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h5 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Shipping Control</h5>
                                <div className="bg-white border-2 border-dashed border-gray-100 rounded-3xl p-6">
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase mb-4">Carrier Documentation</p>
                                    <button
                                        onClick={handleGenerateManifest}
                                        disabled={!order.shipping?.shipmentId}
                                        className="w-full py-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center gap-3 font-semibold text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-50"
                                    >
                                        <Truck size={18} />
                                        <span>Download Manifest</span>
                                    </button>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Dispatch Status: <span className="text-blue-600">{order.status.replace('_', ' ')}</span></p>
                    <div className="flex gap-3">
                        <button
                            onClick={handleGenerateInvoice}
                            className="px-6 py-3 bg-white border border-gray-200 text-gray-900 rounded-2xl text-[10px] font-semibold uppercase transition-all hover:bg-white hover:shadow-lg active:scale-95"
                        >
                            Generate Invoice
                        </button>
                        <button
                            onClick={onClose}
                            className="px-8 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-semibold uppercase transition-all hover:bg-black shadow-xl active:scale-95"
                        >
                            ACKNOWLEDGE
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
