'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    TrendingUp,
    Plus,
    ArrowUpRight,
    TrendingDown,
    Clock,
    CheckCircle2,
    MoreVertical,
    ChevronRight,
    Package,
    ArrowDownCircle,
    Play,
    Pause,
    Square,
    DollarSign,
    ShoppingBag,
    Users,
    AlertTriangle,
    Eye,
    RefreshCw,
    Edit2
} from 'lucide-react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    AreaChart,
    Area
} from 'recharts'
import Link from 'next/link'

export default function ModernDashboard({ dashboardData, loading, onRefresh }) {
    if (!dashboardData) return null;

    // Safe data mapping
    const safeData = {
        netRevenue: dashboardData?.netRevenue || 0,
        grossRevenue: dashboardData?.grossRevenue || 0,
        totalOrders: dashboardData?.totalOrders || 0,
        activeProducts: dashboardData?.activeProducts || 0,
        totalCustomers: dashboardData?.totalCustomers || 0,
        revenueGrowth: dashboardData?.revenueGrowth || 0,
        salesData: dashboardData?.salesData || [],
        topProducts: dashboardData?.topProducts || [],
        recentOrders: dashboardData?.recentOrders || [],
        lowStockProducts: dashboardData?.lowStockProducts || [],
        orderStatus: dashboardData?.orderStatusBreakdown || {},
        performance: dashboardData?.sellerInfo?.performance || { orderFulfillmentRate: 0 },
        alerts: dashboardData?.alerts || { lowStock: 0, pendingOrders: 0, lowQualityListings: 0 },
        catalogQuality: dashboardData?.catalogQuality || { average: 0, lowQualityCount: 0, atRiskListings: [] }
    }

    return (
        <div className="p-6 bg-[#F8FAFC]">
            <div className="max-w-[1400px] mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Dashboard Overview</h1>
                        <p className="text-gray-500 mt-1 font-medium">Real-time insights into your store performance</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onRefresh?.(true)}
                            className="px-5 py-2.5 bg-white border border-gray-200 rounded-full font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2"
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                            <span>Refresh Data</span>
                        </button>
                        <Link
                            href="/seller/products/new"
                            className="flex items-center gap-2 px-6 py-2.5 bg-[#1E3A8A] text-white rounded-full font-semibold hover:bg-black transition-all shadow-lg shadow-blue-900/10"
                        >
                            <Plus size={18} />
                            <span>Add Product</span>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* Main Content Area (3 Cols) */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Real Metric Cards mapping the Donezo UI */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <StatCard
                                title="Net Revenue"
                                value={`₹${safeData.netRevenue.toLocaleString()}`}
                                trend={`${safeData.revenueGrowth}% from last month`}
                                icon={TrendingUp}
                                primary
                            />
                            <StatCard
                                title="Active Assets"
                                value={safeData.activeProducts.toLocaleString()}
                                trend={`${safeData.lowStockProducts.length} low stock`}
                                icon={Package}
                            />
                            <StatCard
                                title="Catalog Quality"
                                value={`${safeData.catalogQuality.average}%`}
                                trend={`${safeData.catalogQuality.lowQualityCount} needing attention`}
                                icon={TrendingUp}
                                color="emerald"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <StatCard
                                title="Total Orders"
                                value={safeData.totalOrders.toLocaleString()}
                                trend={`${safeData.orderStatus.delivered || 0} Delivered`}
                                icon={ShoppingBag}
                            />
                            <StatCard
                                title="Total Customers"
                                value={safeData.totalCustomers.toLocaleString()}
                                trend="Unique buyers"
                                icon={Users}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Revenue Analytics - New Curved Area UI matching reference */}
                            <div className="md:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100/50">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-xl">Revenue Analytics</h3>
                                        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Store performance analytics</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full px-4 py-1.5 text-xs font-semibold text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors">
                                        <span>Range: Last 6 months</span>
                                        <ChevronRight size={14} className="rotate-90" />
                                    </div>
                                </div>

                                <div className="flex flex-col lg:flex-row h-[320px] mt-4 relative">
                                    {/* Left Side Vertical Tabs */}
                                    <div className="hidden lg:flex flex-col justify-center gap-6 pr-8 border-r border-gray-50">
                                        <button className="text-[11px] font-semibold text-gray-300 hover:text-gray-500 transition-colors uppercase vertical-text">Aug</button>
                                        <button className="text-[11px] font-semibold text-white bg-blue-600 px-2 py-3 rounded-full uppercase vertical-text shadow-lg shadow-blue-500/30">Sep</button>
                                        <button className="text-[11px] font-semibold text-gray-300 hover:text-gray-500 transition-colors uppercase vertical-text">Oct</button>
                                        <button className="text-[11px] font-semibold text-gray-300 hover:text-gray-500 transition-colors uppercase vertical-text">Nov</button>
                                    </div>

                                    {/* The Chart */}
                                    <div className="flex-1 pl-4 h-full relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={safeData.salesData} margin={{ top: 40, right: 0, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                                    </linearGradient>
                                                    <pattern id="dotPattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                                                        <circle cx="2" cy="2" r="1" fill="#3B82F6" fillOpacity="0.1" />
                                                    </pattern>
                                                </defs>
                                                <XAxis
                                                    dataKey="month"
                                                    hide={true}
                                                />
                                                <YAxis hide={true} />
                                                <Tooltip
                                                    content={({ active, payload, label }) => {
                                                        if (active && payload && payload.length) {
                                                            return (
                                                                <div className="bg-white p-4 rounded-2xl shadow-2xl border border-gray-50 flex flex-col items-center animate-in zoom-in duration-200">
                                                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                                                                    <p className="text-sm font-semibold text-gray-900">₹{payload[0].value.toLocaleString()}</p>
                                                                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shadow-lg shadow-blue-500/50" />
                                                                </div>
                                                            )
                                                        }
                                                        return null
                                                    }}
                                                />
                                                {/* Red Comparison Line */}
                                                <Area
                                                    type="monotone"
                                                    dataKey="grossSales"
                                                    stroke="#EF4444"
                                                    strokeWidth={3}
                                                    fill="transparent"
                                                    dot={false}
                                                    activeDot={{ r: 6, stroke: '#FFFFFF', strokeWidth: 3, fill: '#EF4444' }}
                                                />
                                                {/* Blue Main Line */}
                                                <Area
                                                    type="monotone"
                                                    dataKey="sales"
                                                    stroke="#2563EB"
                                                    strokeWidth={4}
                                                    fill="url(#colorSales)"
                                                    dot={false}
                                                    activeDot={{ r: 8, stroke: '#FFFFFF', strokeWidth: 4, fill: '#2563EB' }}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Chart Legend & Metric Footer */}
                                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-50">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded bg-red-500" />
                                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Gross Revenue</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded bg-blue-600" />
                                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Net Revenue</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <p className="text-2xl font-semibold text-gray-900 tracking-tighter">{safeData.revenueGrowth}%</p>
                                            <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Growth rate</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Alerts/Status Card mapping Reminders UI */}
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100/50 flex flex-col">
                                <div className="flex justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900 text-lg">Quick Info</h3>
                                    <AlertTriangle size={18} className="text-orange-500" />
                                </div>
                                <div className="flex-1 space-y-2 py-4">
                                    {safeData.alerts.pendingOrders > 0 ? (
                                        <>
                                            <h4 className="text-2xl font-semibold leading-tight text-[#1E3A8A]">
                                                {safeData.alerts.pendingOrders} Pending Orders
                                            </h4>
                                            <p className="text-gray-400 text-sm font-medium">Needs your immediate attention</p>
                                        </>
                                    ) : (
                                        <>
                                            <h4 className="text-2xl font-semibold leading-tight text-[#1E3A8A]">
                                                All caught up!
                                            </h4>
                                            <p className="text-gray-400 text-sm font-medium">No urgent pending actions</p>
                                        </>
                                    )}
                                </div>
                                <Link
                                    href="/seller/orders"
                                    className="w-full h-14 bg-[#1E3A8A] text-white rounded-2xl flex items-center justify-center gap-2 font-semibold hover:bg-black transition-all shadow-lg shadow-blue-900/20"
                                >
                                    <ShoppingBag size={20} />
                                    <span>Handle Orders</span>
                                </Link>

                                {safeData.catalogQuality.lowQualityCount > 0 && (
                                    <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle size={16} className="text-orange-500 mt-0.5" />
                                            <div>
                                                <p className="text-[10px] font-semibold text-orange-600 uppercase">Optimization Alert</p>
                                                <p className="text-xs font-semibold text-gray-700 mt-1">{safeData.catalogQuality.lowQualityCount} listings have poor health scores. Optimize them to improve visibility.</p>

                                                <div className="mt-3 space-y-2">
                                                    {safeData.catalogQuality.atRiskListings.map(listing => (
                                                        <div key={listing._id} className="flex items-center justify-between p-2 bg-white/50 rounded-xl border border-orange-100/50">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden">
                                                                    <img src={listing.images?.[0]?.url} alt="" className="w-full h-full object-cover" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-[10px] font-semibold text-gray-900 truncate w-32">{listing.name}</p>
                                                                    <p className="text-[9px] font-medium text-gray-500">₹{listing.pricing?.basePrice}</p>
                                                                </div>
                                                            </div>
                                                            <Link
                                                                href={`/seller/products/edit/${listing._id || listing.id}`}
                                                                className="p-1.5 hover:bg-orange-100 rounded-lg text-orange-600 transition-colors"
                                                            >
                                                                <Edit2 size={12} />
                                                            </Link>
                                                        </div>
                                                    ))}
                                                </div>

                                                <Link href="/seller/products?status=low-health" className="text-[10px] font-semibold text-orange-600 underline mt-3 inline-block uppercase">View All Fixes</Link>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Top Products mapping Team Collaboration UI */}
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100/50 text-gray-900">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="font-semibold text-lg">Top Selling Products</h3>
                                    <Link href="/seller/products" className="text-xs px-4 py-1.5 border border-gray-100 rounded-full font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
                                        View All
                                    </Link>
                                </div>
                                <div className="space-y-5">
                                    {safeData.topProducts.slice(0, 4).map((product, i) => (
                                        <div key={i} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-sm border border-blue-100/50 transition-transform group-hover:scale-105">
                                                    {product.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold truncate max-w-[150px]">{product.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{product.sales} Sales Generated</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-gray-900">₹{product.revenue.toLocaleString()}</p>
                                                <span className="text-[10px] font-semibold text-blue-600 px-2 py-0.5 bg-blue-50 rounded-lg">Revenue</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Fulfillment Gauge mapping Project Progress UI */}
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100/50">
                                <h3 className="font-semibold text-gray-900 text-lg mb-2">Order Fulfillment</h3>
                                <div className="relative h-48 flex items-center justify-center">
                                    <div className="text-center absolute z-10 bottom-4 left-1/2 -translate-x-1/2">
                                        <p className="text-4xl font-semibold text-gray-900 tracking-tighter">{safeData.performance.orderFulfillmentRate.toFixed(1)}%</p>
                                        <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mt-1">SLA Compliance</p>
                                    </div>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Completed', value: safeData.performance.orderFulfillmentRate, fill: '#1E3A8A' },
                                                    { name: 'Remaining', value: 100 - safeData.performance.orderFulfillmentRate, fill: '#F1F5F9' },
                                                ]}
                                                cx="50%"
                                                cy="80%"
                                                startAngle={180}
                                                endAngle={0}
                                                innerRadius={65}
                                                outerRadius={85}
                                                paddingAngle={0}
                                                dataKey="value"
                                                stroke="none"
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex justify-center gap-8 mt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-[#1E3A8A]" />
                                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Fulfilled</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-slate-200" />
                                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">In Pipeline</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar Area (1 Col) mapping Recent Orders/Tasks UI */}
                    <div className="space-y-6">

                        {/* Recent Orders mapping Project List UI */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100/50">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-semibold text-gray-900">Recent Orders</h3>
                                <Link href="/seller/orders" className="p-1 px-2 border border-gray-100 text-gray-400 rounded-full hover:bg-gray-50 transition-colors">
                                    <ChevronRight size={14} />
                                </Link>
                            </div>
                            <div className="space-y-6">
                                {safeData.recentOrders.slice(0, 5).map((order) => (
                                    <div key={order.orderId} className="flex items-start gap-4 group cursor-pointer">
                                        <div className={`w-9 h-9 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white`}>
                                            <ShoppingBag size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">#{order.orderId}</h4>
                                            <p className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">{order.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Support Widget mapping Dark UI Tracker */}
                        <div className="bg-[#0A1128] rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 opacity-20 rounded-full blur-[70px] group-hover:scale-150 transition-transform duration-700" />
                            <h3 className="text-white font-semibold text-lg mb-6 relative z-10">Seller Support</h3>
                            <div className="relative z-10 py-2">
                                <p className="text-blue-400 text-[10px] font-semibold uppercase tracking-[0.2em] mb-4">Dedicated Helpdesk</p>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-white/80">
                                        <CheckCircle2 size={16} className="text-blue-500" />
                                        <span className="text-xs font-semibold">24/7 Priority Tickets</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-white/80">
                                        <CheckCircle2 size={16} className="text-blue-500" />
                                        <span className="text-xs font-semibold">Logistics Assistance</span>
                                    </div>
                                </div>
                                <button className="w-full mt-10 py-4 bg-white text-gray-900 rounded-2xl text-xs font-semibold hover:bg-blue-50 transition-all active:scale-95 shadow-lg">
                                    GET HELP NOW
                                </button>
                            </div>
                        </div>

                        {/* Low Stock mapping Promo Widget UI */}
                        <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                            <div className="relative z-10">
                                <h4 className="font-semibold text-xl leading-tight mb-2">Inventory Alerts</h4>
                                <p className="text-white/70 text-[11px] font-medium mb-6">You have {safeData.lowStockProducts.length} items that need restocking soon.</p>
                                <Link
                                    href="/seller/products"
                                    className="flex items-center justify-center w-full h-12 bg-black/20 backdrop-blur-md text-white rounded-2xl text-[11px] font-semibold hover:bg-black/30 transition-all border border-white/10"
                                >
                                    MANAGE STOCK
                                </Link>
                            </div>
                            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, trend, icon: Icon, primary }) {
    return (
        <div className={`p-6 rounded-[2.2rem] shadow-sm border transition-all hover:translate-y-[-4px] ${primary ? 'bg-[#1E3A8A] border-blue-800 text-white' : 'bg-white border-gray-100 text-gray-900'
            }`}>
            <div className="flex justify-between items-start mb-5">
                <h4 className={`text-xs font-semibold uppercase tracking-wider ${primary ? 'text-white/60' : 'text-gray-400'}`}>{title}</h4>
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12 ${primary ? 'bg-white/10' : 'bg-gray-50'}`}>
                    <Icon size={18} className={primary ? 'text-white' : 'text-blue-600'} />
                </div>
            </div>
            <div className="space-y-1">
                <p className="text-3xl font-semibold tracking-tight">{value}</p>
                <p className={`text-[10px] font-semibold mt-2 ${primary ? 'text-white/60' : 'text-gray-400'}`}>
                    <span className={`inline-flex items-center gap-1.5 ${primary ? 'text-white' : 'text-blue-600'}`}>
                        {trend}
                    </span>
                </p>
            </div>
        </div>
    )
}
