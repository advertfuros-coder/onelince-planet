'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
    FiArrowLeft, FiUser, FiBriefcase, FiShoppingBag, FiPackage, FiDollarSign,
    FiClock, FiFileText, FiShield, FiMapPin, FiMail, FiPhone, FiEye,
    FiStar, FiLayers, FiCheckCircle, FiXCircle, FiAlertCircle, FiPlus,
    FiMessageSquare, FiActivity, FiTrendingUp, FiCalendar, FiCreditCard,
    FiEdit, FiDownload, FiBarChart2, FiTrendingDown, FiPercent,
    FiShoppingCart, FiUsers, FiRefreshCw, FiHash, FiGlobe, FiHome,
    FiSearch
} from 'react-icons/fi'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function SellerDetailsPage({ params }) {
    const { id } = use(params)
    const router = useRouter()
    const { token } = useAuth()

    const [seller, setSeller] = useState(null)
    const [stats, setStats] = useState(null)
    const [products, setProducts] = useState([])
    const [orders, setOrders] = useState([])
    const [reviews, setReviews] = useState([])
    const [activityLogs, setActivityLogs] = useState([])
    const [notes, setNotes] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')
    const [showRequestModal, setShowRequestModal] = useState(false)
    const [requestData, setRequestData] = useState({ title: '', description: '' })
    const [showNoteModal, setShowNoteModal] = useState(false)
    const [noteText, setNoteText] = useState('')

    // Search and Filter states
    const [productSearch, setProductSearch] = useState('')
    const [productFilter, setProductFilter] = useState('all') // all, active, inactive
    const [orderSearch, setOrderSearch] = useState('')
    const [orderFilter, setOrderFilter] = useState('all') // all, pending, delivered, cancelled

    useEffect(() => {
        if (token && id) fetchAllData()
    }, [id, token])

    const fetchAllData = async () => {
        try {
            setLoading(true)
            const headers = { Authorization: `Bearer ${token}` }
            const [sellerRes, prodRes, orderRes, reviewRes, logsRes, notesRes] = await Promise.all([
                axios.get(`/api/admin/sellers/${id}`, { headers }),
                axios.get(`/api/admin/sellers/${id}/products`, { headers }),
                axios.get(`/api/admin/sellers/${id}/orders`, { headers }),
                axios.get(`/api/admin/sellers/${id}/reviews`, { headers }),
                axios.get(`/api/admin/sellers/${id}/activity-logs`, { headers }).catch(() => ({ data: { success: true, logs: [] } })),
                axios.get(`/api/admin/sellers/${id}/notes`, { headers }).catch(() => ({ data: { success: true, notes: [] } }))
            ])
            if (sellerRes.data.success) { setSeller(sellerRes.data.seller); setStats(sellerRes.data.stats) }
            if (prodRes.data.success) setProducts(prodRes.data.products)
            if (orderRes.data.success) setOrders(orderRes.data.orders)
            if (reviewRes.data.success) setReviews(reviewRes.data.reviews)
            if (logsRes.data.success) setActivityLogs(logsRes.data.logs || [])
            if (notesRes.data.success) setNotes(notesRes.data.notes || [])
        } finally { setLoading(false) }
    }

    const handleAction = async (type) => {
        let body = {}
        if (type === 'verify') body = { isVerified: true, verificationStatus: 'approved', isActive: true }
        else if (type === 'reject') {
            const reason = prompt("Rejection reason:")
            if (!reason) return
            body = { isVerified: false, verificationStatus: 'rejected', rejectionReason: reason }
        }
        else if (type === 'suspend') body = { isActive: false }
        else if (type === 'activate') body = { isActive: true }

        try {
            await axios.put(`/api/admin/sellers/${id}`, body, { headers: { Authorization: `Bearer ${token}` } })
            fetchAllData()
        } catch (err) { alert('Action failed') }
    }

    const handleRequestDocument = async (e) => {
        e.preventDefault()
        try {
            await axios.post(`/api/admin/sellers/${id}/request-document`, requestData, { headers: { Authorization: `Bearer ${token}` } })
            setShowRequestModal(false)
            setRequestData({ title: '', description: '' })
            fetchAllData()
        } catch { }
    }

    const handleAddNote = async (e) => {
        e.preventDefault()
        if (!noteText.trim()) return
        try {
            await axios.post(`/api/admin/sellers/${id}/notes`, { note: noteText }, { headers: { Authorization: `Bearer ${token}` } })
            setShowNoteModal(false)
            setNoteText('')
            fetchAllData()
        } catch { }
    }

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div></div>
    if (!seller) return <div className="text-center py-20"><p>Seller not found</p></div>

    const salesData = orders.slice(0, 7).reverse().map(o => ({ date: new Date(o.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }), amount: o.totalAmount }))
    const categoryData = products.reduce((acc, p) => { const cat = p.category?.name || 'Uncategorized'; acc[cat] = (acc[cat] || 0) + 1; return acc }, {})
    const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }))
    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

    // Calculate performance metrics
    const calculateHealthScore = () => {
        let score = 0
        // Verification status (30 points)
        if (seller.verificationStatus === 'approved' || seller.verificationStatus === 'verified') score += 30
        else if (seller.verificationStatus === 'pending') score += 15

        // Active status (10 points)
        if (seller.isActive) score += 10

        // Rating (20 points)
        const avgRating = seller.ratings?.average || 0
        score += (avgRating / 5) * 20

        // Order count (20 points)
        const orderCount = stats?.orderCount || 0
        if (orderCount > 100) score += 20
        else if (orderCount > 50) score += 15
        else if (orderCount > 10) score += 10
        else if (orderCount > 0) score += 5

        // Revenue (20 points)
        const revenue = stats?.totalRevenue || 0
        if (revenue > 100000) score += 20
        else if (revenue > 50000) score += 15
        else if (revenue > 10000) score += 10
        else if (revenue > 0) score += 5

        return Math.round(score)
    }

    const healthScore = calculateHealthScore()
    const fulfillmentRate = orders.length > 0 ? Math.round((orders.filter(o => o.status === 'delivered').length / orders.length) * 100) : 0
    const returnRate = orders.length > 0 ? Math.round((orders.filter(o => o.status === 'returned' || o.status === 'refunded').length / orders.length) * 100) : 0
    const responseTime = seller.avgResponseTime || '< 24h'

    const getHealthColor = (score) => {
        if (score >= 80) return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' }
        if (score >= 60) return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' }
        if (score >= 40) return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' }
        return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' }
    }

    const healthColor = getHealthColor(healthScore)

    // Smart Alerts Detection
    const detectAlerts = () => {
        const alerts = []

        // Low health score alert
        if (healthScore < 60) {
            alerts.push({
                type: 'critical',
                icon: FiAlertCircle,
                title: 'Low Health Score',
                message: `Seller health score is ${healthScore}/100. Immediate attention required.`,
                action: 'Review seller performance'
            })
        }

        // High return rate alert
        if (returnRate > 15) {
            alerts.push({
                type: 'warning',
                icon: FiRefreshCw,
                title: 'High Return Rate',
                message: `Return rate is ${returnRate}%. This is above the acceptable threshold.`,
                action: 'Investigate product quality'
            })
        }

        // Low rating alert
        if (seller.ratings?.average < 3.5 && seller.ratings?.count > 5) {
            alerts.push({
                type: 'warning',
                icon: FiStar,
                title: 'Low Customer Ratings',
                message: `Average rating is ${seller.ratings.average}/5. Customer satisfaction needs improvement.`,
                action: 'Review customer feedback'
            })
        }

        // Pending verification
        if (seller.verificationStatus === 'pending' || seller.verificationStatus === 'under_review') {
            alerts.push({
                type: 'info',
                icon: FiClock,
                title: 'Pending Verification',
                message: 'Seller account is awaiting verification.',
                action: 'Review documents'
            })
        }

        // Document requests pending
        const pendingDocs = seller.documents?.requestedDocuments?.filter(d => d.status === 'pending').length || 0
        if (pendingDocs > 0) {
            alerts.push({
                type: 'info',
                icon: FiFileText,
                title: 'Pending Document Requests',
                message: `${pendingDocs} document request(s) awaiting seller response.`,
                action: 'Follow up with seller'
            })
        }

        // Sudden sales drop (if last 7 days revenue is significantly lower)
        const recentRevenue = salesData.slice(-3).reduce((sum, d) => sum + d.amount, 0)
        const avgRevenue = (stats?.totalRevenue || 0) / Math.max(1, salesData.length)
        if (salesData.length >= 7 && recentRevenue < avgRevenue * 0.5) {
            alerts.push({
                type: 'warning',
                icon: FiTrendingDown,
                title: 'Sales Decline Detected',
                message: 'Recent sales are significantly lower than average.',
                action: 'Check seller activity'
            })
        }

        // No recent activity
        const daysSinceLastOrder = orders.length > 0
            ? Math.floor((new Date() - new Date(orders[0].createdAt)) / (1000 * 60 * 60 * 24))
            : 999
        if (daysSinceLastOrder > 30 && seller.isActive) {
            alerts.push({
                type: 'info',
                icon: FiActivity,
                title: 'No Recent Orders',
                message: `No orders in the last ${daysSinceLastOrder} days.`,
                action: 'Check seller engagement'
            })
        }

        // Opportunity: High performer
        if (healthScore >= 90 && stats?.orderCount >= 50) {
            alerts.push({
                type: 'success',
                icon: FiTrendingUp,
                title: 'Top Performer',
                message: 'This seller is performing exceptionally well!',
                action: 'Consider featured placement'
            })
        }

        return alerts
    }

    const smartAlerts = detectAlerts()

    // Comparative Analytics (Category Average Benchmarks)
    const categoryBenchmarks = {
        avgHealthScore: 75,
        avgFulfillmentRate: 85,
        avgReturnRate: 8,
        avgRating: 4.2,
        avgOrderValue: 1500,
        avgResponseTime: '18h'
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FiActivity },
        { id: 'business', label: 'Business Info', icon: FiBriefcase },
        { id: 'products', label: 'Products', icon: FiLayers },
        { id: 'orders', label: 'Orders', icon: FiPackage },
        { id: 'reviews', label: 'Reviews', icon: FiMessageSquare },
        { id: 'documents', label: 'Documents', icon: FiFileText },
        { id: 'financials', label: 'Financials', icon: FiDollarSign },
        { id: 'compliance', label: 'Compliance & Performance', icon: FiAlertCircle },
        { id: 'activity-log', label: 'Activity Log', icon: FiClock },
        { id: 'communications', label: 'Communications', icon: FiMail },
        { id: 'settings', label: 'Settings', icon: FiEdit },
    ]

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-slate-50 rounded-lg"><FiArrowLeft className="w-5 h-5" /></button>
                        <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                            {seller.storeInfo?.storeLogo ? <img src={seller.storeInfo.storeLogo} className="w-full h-full object-cover" /> : <FiShoppingBag className="w-8 h-8 text-slate-400" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-semibold text-slate-900">{seller.storeInfo?.storeName || seller.businessInfo?.businessName}</h1>
                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${(seller.verificationStatus === 'approved' || seller.verificationStatus === 'verified') ? 'bg-emerald-100 text-emerald-700' : (seller.verificationStatus === 'pending' || seller.verificationStatus === 'under_review') ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                    {seller.verificationStatus}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">ID: {seller._id} • Joined {new Date(seller.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {(seller.verificationStatus === 'pending' || seller.verificationStatus === 'under_review') ? (
                            <>
                                <button onClick={() => handleAction('verify')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold text-sm"><FiCheckCircle className="inline mr-1" /> Verify</button>
                                <button onClick={() => handleAction('reject')} className="px-4 py-2 bg-rose-100 text-rose-700 rounded-lg font-semibold text-sm">Reject</button>
                            </>
                        ) : (
                            <button onClick={() => handleAction(seller.isActive ? 'suspend' : 'activate')} className={`px-4 py-2 rounded-lg font-semibold text-sm ${seller.isActive ? 'bg-rose-100 text-rose-700' : 'bg-indigo-600 text-white'}`}>
                                {seller.isActive ? 'Suspend' : 'Activate'}
                            </button>
                        )}
                        <button onClick={() => setShowRequestModal(true)} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-semibold text-sm">Request Doc</button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-4">
                    {/* Health Score - Prominent */}
                    <div className={`${healthColor.bg} border-2 ${healthColor.border} p-6 rounded-2xl`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Seller Health Score</h3>
                                <div className="flex items-baseline gap-3">
                                    <span className={`text-5xl font-semibold ${healthColor.text}`}>{healthScore}</span>
                                    <span className="text-2xl text-slate-400 font-medium">/100</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    {healthScore >= 80 ? '🎉 Excellent Performance' : healthScore >= 60 ? '✅ Good Standing' : healthScore >= 40 ? '⚠️ Needs Attention' : '❌ Critical Issues'}
                                </p>
                            </div>
                            <div className="relative w-32 h-32">
                                <svg className="transform -rotate-90 w-32 h-32">
                                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200" />
                                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent"
                                        strokeDasharray={`${(healthScore / 100) * 351.86} 351.86`}
                                        className={healthColor.text}
                                        strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <FiShield className={`w-10 h-10 ${healthColor.text}`} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Other Metrics Grid */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <div className="flex items-center gap-2 text-indigo-600 mb-2"><FiDollarSign className="w-5 h-5" /></div>
                            <p className="text-2xl font-semibold text-slate-900">₹{(stats?.totalRevenue || 0).toLocaleString()}</p>
                            <p className="text-xs text-slate-500 font-medium">Total Revenue</p>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                            <div className="flex items-center gap-2 text-emerald-600 mb-2"><FiPackage className="w-5 h-5" /></div>
                            <p className="text-2xl font-semibold text-slate-900">{stats?.orderCount || 0}</p>
                            <p className="text-xs text-slate-500 font-medium">Total Orders</p>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                            <div className="flex items-center gap-2 text-amber-600 mb-2"><FiStar className="w-5 h-5" /></div>
                            <p className="text-2xl font-semibold text-slate-900">{seller.ratings?.average || 0}</p>
                            <p className="text-xs text-slate-500 font-medium">Avg Rating</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <div className="flex items-center gap-2 text-blue-600 mb-2"><FiLayers className="w-5 h-5" /></div>
                            <p className="text-2xl font-semibold text-slate-900">{stats?.productCount || 0}</p>
                            <p className="text-xs text-slate-500 font-medium">Products</p>
                        </div>
                    </div>

                    {/* Performance Metrics Grid */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-100">
                            <div className="flex items-center gap-2 text-cyan-600 mb-2"><FiCheckCircle className="w-5 h-5" /></div>
                            <p className="text-2xl font-semibold text-slate-900">{fulfillmentRate}%</p>
                            <p className="text-xs text-slate-500 font-medium">Fulfillment Rate</p>
                        </div>
                        <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                            <div className="flex items-center gap-2 text-rose-600 mb-2"><FiRefreshCw className="w-5 h-5" /></div>
                            <p className="text-2xl font-semibold text-slate-900">{returnRate}%</p>
                            <p className="text-xs text-slate-500 font-medium">Return Rate</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                            <div className="flex items-center gap-2 text-purple-600 mb-2"><FiClock className="w-5 h-5" /></div>
                            <p className="text-2xl font-semibold text-slate-900">{responseTime}</p>
                            <p className="text-xs text-slate-500 font-medium">Avg Response Time</p>
                        </div>
                        <div className="bg-violet-50 p-4 rounded-xl border border-violet-100">
                            <div className="flex items-center gap-2 text-violet-600 mb-2"><FiUsers className="w-5 h-5" /></div>
                            <p className="text-2xl font-semibold text-slate-900">{seller.ratings?.count || 0}</p>
                            <p className="text-xs text-slate-500 font-medium">Total Reviews</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Charts Row */}
                    <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-2 bg-white p-6 rounded-2xl border border-slate-200">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiTrendingUp className="text-indigo-600" /> Revenue Trend</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={salesData}>
                                    <defs><linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} fill="url(#colorAmt)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200">
                            <h3 className="text-lg font-semibold mb-4">Category Split</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart><Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{pieData.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Smart Alerts */}
                    {smartAlerts.length > 0 && (
                        <div className="bg-white p-6 rounded-2xl border border-slate-200">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <FiAlertCircle className="text-amber-600" /> Smart Alerts & Insights
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {smartAlerts.map((alert, idx) => (
                                    <div key={idx} className={`p-4 rounded-xl border-2 ${alert.type === 'critical' ? 'bg-rose-50 border-rose-200' :
                                            alert.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                                                alert.type === 'success' ? 'bg-emerald-50 border-emerald-200' :
                                                    'bg-blue-50 border-blue-200'
                                        }`}>
                                        <div className="flex items-start gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${alert.type === 'critical' ? 'bg-rose-100' :
                                                    alert.type === 'warning' ? 'bg-amber-100' :
                                                        alert.type === 'success' ? 'bg-emerald-100' :
                                                            'bg-blue-100'
                                                }`}>
                                                <alert.icon className={`w-5 h-5 ${alert.type === 'critical' ? 'text-rose-600' :
                                                        alert.type === 'warning' ? 'text-amber-600' :
                                                            alert.type === 'success' ? 'text-emerald-600' :
                                                                'text-blue-600'
                                                    }`} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-slate-900 mb-1">{alert.title}</h4>
                                                <p className="text-sm text-slate-600 mb-2">{alert.message}</p>
                                                <button className={`text-xs font-semibold ${alert.type === 'critical' ? 'text-rose-700' :
                                                        alert.type === 'warning' ? 'text-amber-700' :
                                                            alert.type === 'success' ? 'text-emerald-700' :
                                                                'text-blue-700'
                                                    } hover:underline`}>
                                                    {alert.action} →
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Comparative Analytics */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <FiBarChart2 className="text-indigo-600" /> Performance vs. Category Average
                        </h3>
                        <div className="grid grid-cols-3 gap-6">
                            {/* Health Score Comparison */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-700">Health Score</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-slate-500">{categoryBenchmarks.avgHealthScore}</span>
                                        <span className="text-lg font-semibold text-slate-900">{healthScore}</span>
                                        {healthScore > categoryBenchmarks.avgHealthScore ? (
                                            <FiTrendingUp className="w-4 h-4 text-emerald-600" />
                                        ) : (
                                            <FiTrendingDown className="w-4 h-4 text-rose-600" />
                                        )}
                                    </div>
                                </div>
                                <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="absolute h-full bg-slate-400 rounded-full" style={{ width: `${categoryBenchmarks.avgHealthScore}%` }}></div>
                                    <div className={`absolute h-full ${healthScore > categoryBenchmarks.avgHealthScore ? 'bg-emerald-500' : 'bg-rose-500'} rounded-full`} style={{ width: `${healthScore}%` }}></div>
                                </div>
                                <p className="text-xs text-slate-500">
                                    {healthScore > categoryBenchmarks.avgHealthScore
                                        ? `${healthScore - categoryBenchmarks.avgHealthScore} points above average`
                                        : `${categoryBenchmarks.avgHealthScore - healthScore} points below average`
                                    }
                                </p>
                            </div>

                            {/* Fulfillment Rate Comparison */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-700">Fulfillment Rate</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-slate-500">{categoryBenchmarks.avgFulfillmentRate}%</span>
                                        <span className="text-lg font-semibold text-slate-900">{fulfillmentRate}%</span>
                                        {fulfillmentRate > categoryBenchmarks.avgFulfillmentRate ? (
                                            <FiTrendingUp className="w-4 h-4 text-emerald-600" />
                                        ) : (
                                            <FiTrendingDown className="w-4 h-4 text-rose-600" />
                                        )}
                                    </div>
                                </div>
                                <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="absolute h-full bg-slate-400 rounded-full" style={{ width: `${categoryBenchmarks.avgFulfillmentRate}%` }}></div>
                                    <div className={`absolute h-full ${fulfillmentRate > categoryBenchmarks.avgFulfillmentRate ? 'bg-emerald-500' : 'bg-rose-500'} rounded-full`} style={{ width: `${fulfillmentRate}%` }}></div>
                                </div>
                                <p className="text-xs text-slate-500">
                                    {fulfillmentRate > categoryBenchmarks.avgFulfillmentRate
                                        ? `${fulfillmentRate - categoryBenchmarks.avgFulfillmentRate}% above average`
                                        : `${categoryBenchmarks.avgFulfillmentRate - fulfillmentRate}% below average`
                                    }
                                </p>
                            </div>

                            {/* Rating Comparison */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-700">Customer Rating</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-slate-500">{categoryBenchmarks.avgRating}</span>
                                        <span className="text-lg font-semibold text-slate-900">{seller.ratings?.average || 0}</span>
                                        {(seller.ratings?.average || 0) > categoryBenchmarks.avgRating ? (
                                            <FiTrendingUp className="w-4 h-4 text-emerald-600" />
                                        ) : (
                                            <FiTrendingDown className="w-4 h-4 text-rose-600" />
                                        )}
                                    </div>
                                </div>
                                <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="absolute h-full bg-slate-400 rounded-full" style={{ width: `${(categoryBenchmarks.avgRating / 5) * 100}%` }}></div>
                                    <div className={`absolute h-full ${(seller.ratings?.average || 0) > categoryBenchmarks.avgRating ? 'bg-emerald-500' : 'bg-rose-500'} rounded-full`} style={{ width: `${((seller.ratings?.average || 0) / 5) * 100}%` }}></div>
                                </div>
                                <p className="text-xs text-slate-500">
                                    {(seller.ratings?.average || 0) > categoryBenchmarks.avgRating
                                        ? `${((seller.ratings?.average || 0) - categoryBenchmarks.avgRating).toFixed(1)} stars above average`
                                        : `${(categoryBenchmarks.avgRating - (seller.ratings?.average || 0)).toFixed(1)} stars below average`
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Performance Summary */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <FiBarChart2 className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-indigo-900 mb-1">Performance Summary</h4>
                                    <p className="text-sm text-indigo-700">
                                        {healthScore > categoryBenchmarks.avgHealthScore && fulfillmentRate > categoryBenchmarks.avgFulfillmentRate
                                            ? '🎉 This seller is outperforming the category average across multiple metrics!'
                                            : healthScore < categoryBenchmarks.avgHealthScore - 10
                                                ? '⚠️ This seller needs support to improve performance metrics.'
                                                : '📊 This seller is performing at par with category standards.'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seller Journey Timeline */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2"><FiCalendar className="text-indigo-600" /> Seller Journey Timeline</h3>
                        <div className="relative">
                            {/* Timeline Line */}
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-emerald-500 to-slate-300"></div>

                            {/* Timeline Events */}
                            <div className="space-y-6 relative">
                                {/* Registration */}
                                <div className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 relative z-10 border-4 border-white">
                                        <FiUser className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="flex-1 bg-indigo-50 border border-indigo-200 p-4 rounded-xl">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-semibold text-slate-900">Account Created</h4>
                                            <span className="text-xs text-slate-500">{new Date(seller.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-slate-600">Seller registered on the platform</p>
                                    </div>
                                </div>

                                {/* Verification */}
                                {seller.approvedAt && (
                                    <div className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 relative z-10 border-4 border-white">
                                            <FiCheckCircle className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1 bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-semibold text-slate-900">Verified</h4>
                                                <span className="text-xs text-slate-500">{new Date(seller.approvedAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-slate-600">Account verification completed</p>
                                        </div>
                                    </div>
                                )}

                                {/* First Product */}
                                {products.length > 0 && (
                                    <div className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 relative z-10 border-4 border-white">
                                            <FiLayers className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1 bg-blue-50 border border-blue-200 p-4 rounded-xl">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-semibold text-slate-900">First Product Listed</h4>
                                                <span className="text-xs text-slate-500">{new Date(products[products.length - 1]?.createdAt || seller.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-slate-600">Started selling on the platform</p>
                                        </div>
                                    </div>
                                )}

                                {/* First Sale */}
                                {orders.length > 0 && (
                                    <div className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 relative z-10 border-4 border-white">
                                            <FiShoppingCart className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1 bg-amber-50 border border-amber-200 p-4 rounded-xl">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-semibold text-slate-900">First Sale</h4>
                                                <span className="text-xs text-slate-500">{new Date(orders[orders.length - 1]?.createdAt || seller.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-sm text-slate-600">Made their first sale</p>
                                        </div>
                                    </div>
                                )}

                                {/* Milestones */}
                                {stats?.orderCount >= 100 && (
                                    <div className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 relative z-10 border-4 border-white">
                                            <FiTrendingUp className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1 bg-purple-50 border border-purple-200 p-4 rounded-xl">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-semibold text-slate-900">🎉 100+ Orders Milestone</h4>
                                                <span className="text-xs text-slate-500">Achievement Unlocked</span>
                                            </div>
                                            <p className="text-sm text-slate-600">Reached 100 orders - Growing seller!</p>
                                        </div>
                                    </div>
                                )}

                                {stats?.totalRevenue >= 100000 && (
                                    <div className="flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0 relative z-10 border-4 border-white">
                                            <FiDollarSign className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1 bg-rose-50 border border-rose-200 p-4 rounded-xl">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-semibold text-slate-900">🏆 ₹1L+ Revenue Milestone</h4>
                                                <span className="text-xs text-slate-500">Achievement Unlocked</span>
                                            </div>
                                            <p className="text-sm text-slate-600">Crossed ₹1 Lakh in total revenue!</p>
                                        </div>
                                    </div>
                                )}

                                {/* Current Status */}
                                <div className="flex gap-4 items-start">
                                    <div className={`w-8 h-8 rounded-full ${seller.isActive ? 'bg-emerald-500' : 'bg-slate-400'} flex items-center justify-center flex-shrink-0 relative z-10 border-4 border-white`}>
                                        <FiActivity className="w-4 h-4 text-white" />
                                    </div>
                                    <div className={`flex-1 ${seller.isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'} border p-4 rounded-xl`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-semibold text-slate-900">Current Status</h4>
                                            <span className="text-xs text-slate-500">Now</span>
                                        </div>
                                        <p className="text-sm text-slate-600">
                                            {seller.isActive ? '✅ Active and selling' : '⏸️ Account suspended'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'business' && (
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2"><FiBriefcase className="text-indigo-600" /> Business Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <InfoItem label="Business Name" value={seller.businessInfo?.businessName} />
                            <InfoItem label="Business Type" value={seller.businessInfo?.businessType} />
                            <InfoItem label="GST/TRN" value={seller.businessInfo?.gstin || seller.trn} />
                            <InfoItem label="PAN" value={seller.businessInfo?.pan} />
                            <InfoItem label="Email" value={seller.personalDetails?.email} icon={FiMail} />
                            <InfoItem label="Phone" value={seller.personalDetails?.phone} icon={FiPhone} />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2"><FiMapPin className="text-emerald-600" /> Pickup Address</h3>
                        <div className="space-y-3">
                            <InfoItem label="Address" value={seller.pickupAddress?.addressLine1} />
                            <InfoItem label="City" value={seller.pickupAddress?.city} />
                            <InfoItem label="State" value={seller.pickupAddress?.state} />
                            <InfoItem label="Pincode" value={seller.pickupAddress?.pincode} />
                            <InfoItem label="Country" value={seller.pickupAddress?.country} />
                        </div>
                    </div>
                    <div className="col-span-2 bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2"><FiShoppingBag className="text-blue-600" /> Store Information</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <InfoItem label="Store Name" value={seller.storeInfo?.storeName} />
                            <InfoItem label="Store URL" value={seller.storeInfo?.website} icon={FiGlobe} />
                            <InfoItem label="Description" value={seller.storeInfo?.storeDescription} />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'products' && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    {/* Search and Filter Bar */}
                    <div className="p-4 border-b border-slate-200 bg-slate-50">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search products by name..."
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <select
                                value={productFilter}
                                onChange={(e) => setProductFilter(e.target.value)}
                                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                <option value="all">All Products</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>
                            <div className="text-sm text-slate-600 font-medium whitespace-nowrap">
                                {products.filter(p => {
                                    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase())
                                    const matchesFilter = productFilter === 'all' ||
                                        (productFilter === 'active' && p.isActive) ||
                                        (productFilter === 'inactive' && !p.isActive)
                                    return matchesSearch && matchesFilter
                                }).length} of {products.length} products
                            </div>
                        </div>
                    </div>

                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Rating</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {products.filter(p => {
                                const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase())
                                const matchesFilter = productFilter === 'all' ||
                                    (productFilter === 'active' && p.isActive) ||
                                    (productFilter === 'inactive' && !p.isActive)
                                return matchesSearch && matchesFilter
                            }).map(p => (
                                <tr key={p._id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={p.images?.[0]?.url || p.images?.[0]} className="w-10 h-10 rounded-lg object-cover" />
                                            <span className="font-medium text-slate-900">{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-semibold">₹{p.price}</td>
                                    <td className="px-6 py-4 text-slate-600">{p.stock}</td>
                                    <td className="px-6 py-4"><span className="flex items-center gap-1 text-amber-500"><FiStar className="fill-current" /> {p.ratings?.average || 0}</span></td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-lg text-[10px] font-semibold ${p.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{p.isActive ? 'ACTIVE' : 'INACTIVE'}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {products.filter(p => {
                        const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase())
                        const matchesFilter = productFilter === 'all' ||
                            (productFilter === 'active' && p.isActive) ||
                            (productFilter === 'inactive' && !p.isActive)
                        return matchesSearch && matchesFilter
                    }).length === 0 && (
                            <div className="text-center py-12">
                                <FiSearch className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500">No products found matching your criteria</p>
                            </div>
                        )}
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    {/* Search and Filter Bar */}
                    <div className="p-4 border-b border-slate-200 bg-slate-50">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by Order ID or Customer name..."
                                    value={orderSearch}
                                    onChange={(e) => setOrderSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <select
                                value={orderFilter}
                                onChange={(e) => setOrderFilter(e.target.value)}
                                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                <option value="all">All Orders</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="returned">Returned</option>
                            </select>
                            <div className="text-sm text-slate-600 font-medium whitespace-nowrap">
                                {orders.filter(o => {
                                    const matchesSearch = o._id.includes(orderSearch) ||
                                        (o.customer?.name || '').toLowerCase().includes(orderSearch.toLowerCase())
                                    const matchesFilter = orderFilter === 'all' || o.status === orderFilter
                                    return matchesSearch && matchesFilter
                                }).length} of {orders.length} orders
                            </div>
                        </div>
                    </div>

                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders.filter(o => {
                                const matchesSearch = o._id.includes(orderSearch) ||
                                    (o.customer?.name || '').toLowerCase().includes(orderSearch.toLowerCase())
                                const matchesFilter = orderFilter === 'all' || o.status === orderFilter
                                return matchesSearch && matchesFilter
                            }).map(o => (
                                <tr key={o._id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono text-sm font-semibold">#{o._id.slice(-6)}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{new Date(o.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-sm">{o.customer?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 font-semibold">₹{o.totalAmount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-semibold uppercase ${o.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' :
                                                o.status === 'cancelled' || o.status === 'returned' ? 'bg-rose-50 text-rose-600' :
                                                    o.status === 'shipped' ? 'bg-blue-50 text-blue-600' :
                                                        'bg-amber-50 text-amber-600'
                                            }`}>{o.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {orders.filter(o => {
                        const matchesSearch = o._id.includes(orderSearch) ||
                            (o.customer?.name || '').toLowerCase().includes(orderSearch.toLowerCase())
                        const matchesFilter = orderFilter === 'all' || o.status === orderFilter
                        return matchesSearch && matchesFilter
                    }).length === 0 && (
                            <div className="text-center py-12">
                                <FiSearch className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500">No orders found matching your criteria</p>
                            </div>
                        )}
                </div>
            )}

            {activeTab === 'reviews' && (
                <div className="grid grid-cols-2 gap-6">
                    {reviews.map(r => (
                        <div key={r._id} className="bg-white p-6 rounded-2xl border border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-semibold">{r.customer?.name?.[0]}</div>
                                    <div>
                                        <p className="font-semibold text-slate-900">{r.customer?.name}</p>
                                        <p className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-amber-500"><FiStar className="fill-current" /> {r.rating}</div>
                            </div>
                            <p className="text-slate-600 text-sm italic">"{r.comment}"</p>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'documents' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiShield className="text-indigo-600" /> Verification Documents</h3>
                        <div className="grid grid-cols-4 gap-4">
                            <DocCard label="PAN Card" url={seller.documents?.panCard} />
                            <DocCard label="GST Certificate" url={seller.documents?.gstCertificate} />
                            <DocCard label="ID Proof" url={seller.documents?.idProof} />
                            <DocCard label="Trade License" url={seller.documents?.tradeLicense} />
                        </div>
                    </div>
                    {seller.documents?.requestedDocuments?.length > 0 && (
                        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
                            <h3 className="text-lg font-semibold mb-4 text-amber-900">Requested Documents</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {seller.documents.requestedDocuments.map(req => (
                                    <div key={req._id} className="bg-white p-4 rounded-xl border border-amber-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold">{req.title}</h4>
                                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-semibold uppercase">{req.status}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-3">{req.description}</p>
                                        {req.url && <a href={req.url} target="_blank" className="text-xs text-indigo-600 font-semibold">View Document →</a>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'financials' && (
                <div className="space-y-6">
                    {/* Financial Overview Cards */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-2xl text-white">
                            <FiDollarSign className="w-8 h-8 mb-3 opacity-80" />
                            <p className="text-3xl font-semibold">₹{(stats?.totalRevenue || 0).toLocaleString()}</p>
                            <p className="text-sm opacity-90 mt-1">Total Revenue</p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl text-white">
                            <FiTrendingUp className="w-8 h-8 mb-3 opacity-80" />
                            <p className="text-3xl font-semibold">₹{stats?.orderCount ? Math.round(stats.totalRevenue / stats.orderCount) : 0}</p>
                            <p className="text-sm opacity-90 mt-1">Avg Order Value</p>
                        </div>
                        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-2xl text-white">
                            <FiPercent className="w-8 h-8 mb-3 opacity-80" />
                            <p className="text-3xl font-semibold">{seller.commissionRate || 5}%</p>
                            <p className="text-sm opacity-90 mt-1">Commission Rate</p>
                        </div>
                        <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-6 rounded-2xl text-white">
                            <FiCreditCard className="w-8 h-8 mb-3 opacity-80" />
                            <p className="text-3xl font-semibold">₹{Math.round((stats?.totalRevenue || 0) * ((seller.commissionRate || 5) / 100)).toLocaleString()}</p>
                            <p className="text-sm opacity-90 mt-1">Total Commission</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Bank Details */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiCreditCard className="text-indigo-600" /> Bank Details</h3>
                            <div className="space-y-4">
                                <InfoItem label="Bank Name" value={seller.bankDetails?.bankName} />
                                <InfoItem label="Account Number" value={seller.bankDetails?.accountNumber} />
                                <InfoItem label="IFSC Code" value={seller.bankDetails?.ifscCode} />
                                <InfoItem label="Account Holder" value={seller.bankDetails?.accountHolderName} />
                                <InfoItem label="Account Type" value={seller.bankDetails?.accountType?.toUpperCase()} />
                                {seller.bankDetails?.upiId && <InfoItem label="UPI ID" value={seller.bankDetails.upiId} />}
                            </div>
                        </div>

                        {/* Commission Breakdown */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiPercent className="text-emerald-600" /> Commission Breakdown</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-slate-600">Gross Revenue</span>
                                        <span className="font-semibold text-slate-900">₹{(stats?.totalRevenue || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-slate-600">Platform Commission ({seller.commissionRate || 5}%)</span>
                                        <span className="font-semibold text-rose-600">- ₹{Math.round((stats?.totalRevenue || 0) * ((seller.commissionRate || 5) / 100)).toLocaleString()}</span>
                                    </div>
                                    <div className="border-t border-slate-200 pt-2 mt-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-semibold text-slate-700">Net Earnings</span>
                                            <span className="font-semibold text-lg text-emerald-600">₹{Math.round((stats?.totalRevenue || 0) * (1 - (seller.commissionRate || 5) / 100)).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                                        <p className="text-xs text-blue-600 font-medium mb-1">Per Order Commission</p>
                                        <p className="text-lg font-semibold text-blue-700">₹{stats?.orderCount ? Math.round((stats.totalRevenue * ((seller.commissionRate || 5) / 100)) / stats.orderCount) : 0}</p>
                                    </div>
                                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-center">
                                        <p className="text-xs text-purple-600 font-medium mb-1">Per Order Net</p>
                                        <p className="text-lg font-semibold text-purple-700">₹{stats?.orderCount ? Math.round((stats.totalRevenue * (1 - (seller.commissionRate || 5) / 100)) / stats.orderCount) : 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pending Payouts & Transaction History */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiClock className="text-amber-600" /> Pending Payouts</h3>
                            <div className="space-y-3">
                                <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-amber-700">Current Cycle</span>
                                        <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full font-semibold">PENDING</span>
                                    </div>
                                    <p className="text-2xl font-semibold text-amber-900">₹0</p>
                                    <p className="text-xs text-amber-600 mt-1">Next payout: End of month</p>
                                </div>
                                <div className="text-center py-6 text-slate-400 text-sm">
                                    <FiAlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>No pending transactions</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiBarChart2 className="text-blue-600" /> Financial Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <span className="text-sm text-slate-600">Total Orders</span>
                                    <span className="font-semibold text-slate-900">{stats?.orderCount || 0}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <span className="text-sm text-slate-600">Completed Orders</span>
                                    <span className="font-semibold text-emerald-600">{orders.filter(o => o.status === 'delivered').length}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <span className="text-sm text-slate-600">Refunded Orders</span>
                                    <span className="font-semibold text-rose-600">{orders.filter(o => o.status === 'refunded' || o.status === 'returned').length}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                    <span className="text-sm font-semibold text-indigo-700">Success Rate</span>
                                    <span className="font-semibold text-indigo-700">{orders.length > 0 ? Math.round((orders.filter(o => o.status === 'delivered').length / orders.length) * 100) : 0}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subscription Info */}
                    {seller.subscriptionPlan && seller.subscriptionPlan !== 'free' && (
                        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-2xl text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                        <FiShield className="w-5 h-5" /> Subscription Plan
                                    </h3>
                                    <p className="text-3xl font-semibold capitalize mb-1">{seller.subscriptionPlan} Plan</p>
                                    {seller.subscriptionExpiry && (
                                        <p className="text-sm opacity-90">Expires: {new Date(seller.subscriptionExpiry).toLocaleDateString()}</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-sm opacity-90 mb-1">Reduced Commission</p>
                                    <p className="text-2xl font-semibold">{seller.commissionRate}%</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'compliance' && (
                <div className="space-y-6">
                    {/* Compliance Score Overview */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded-2xl border-2 border-emerald-200">
                            <div className="flex items-center justify-between mb-3">
                                <FiCheckCircle className="w-8 h-8 text-emerald-600" />
                                <span className="text-3xl font-semibold text-emerald-600">{Math.max(0, 100 - (orders.filter(o => o.status === 'cancelled' || o.status === 'returned').length * 5))}</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-700">Compliance Score</p>
                            <p className="text-xs text-slate-500 mt-1">Out of 100</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200">
                            <div className="flex items-center justify-between mb-3">
                                <FiXCircle className="w-8 h-8 text-rose-600" />
                                <span className="text-3xl font-semibold text-slate-900">0</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-700">Policy Violations</p>
                            <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200">
                            <div className="flex items-center justify-between mb-3">
                                <FiClock className="w-8 h-8 text-amber-600" />
                                <span className="text-3xl font-semibold text-slate-900">{orders.filter(o => o.status === 'pending' || o.status === 'processing').length}</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-700">Late Shipments</p>
                            <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200">
                            <div className="flex items-center justify-between mb-3">
                                <FiAlertCircle className="w-8 h-8 text-blue-600" />
                                <span className="text-3xl font-semibold text-slate-900">0</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-700">Customer Complaints</p>
                            <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
                        </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiTrendingUp className="text-indigo-600" /> Performance Metrics</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">Order Fulfillment Rate</span>
                                        <span className="text-sm font-semibold text-slate-900">{fulfillmentRate}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${fulfillmentRate}%` }}></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">On-Time Delivery Rate</span>
                                        <span className="text-sm font-semibold text-slate-900">{Math.max(0, 100 - returnRate)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.max(0, 100 - returnRate)}%` }}></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">Customer Satisfaction</span>
                                        <span className="text-sm font-semibold text-slate-900">{Math.round((seller.ratings?.average || 0) * 20)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${Math.round((seller.ratings?.average || 0) * 20)}%` }}></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">Return Rate (Lower is Better)</span>
                                        <span className="text-sm font-semibold text-rose-600">{returnRate}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${returnRate}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiShield className="text-emerald-600" /> Compliance Status</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <FiCheckCircle className="text-emerald-600" />
                                        <span className="text-sm font-medium text-slate-700">Documents Verified</span>
                                    </div>
                                    <span className="text-xs font-semibold text-emerald-700">COMPLIANT</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <FiCheckCircle className="text-emerald-600" />
                                        <span className="text-sm font-medium text-slate-700">Tax Compliance</span>
                                    </div>
                                    <span className="text-xs font-semibold text-emerald-700">COMPLIANT</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <FiCheckCircle className="text-emerald-600" />
                                        <span className="text-sm font-medium text-slate-700">Product Listings</span>
                                    </div>
                                    <span className="text-xs font-semibold text-emerald-700">COMPLIANT</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <FiCheckCircle className="text-emerald-600" />
                                        <span className="text-sm font-medium text-slate-700">Customer Service</span>
                                    </div>
                                    <span className="text-xs font-semibold text-emerald-700">COMPLIANT</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Policy Violations & Complaints */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiXCircle className="text-rose-600" /> Policy Violations</h3>
                            <div className="text-center py-12">
                                <FiCheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-3" />
                                <p className="text-lg font-semibold text-emerald-700">No Violations</p>
                                <p className="text-sm text-slate-500 mt-2">This seller has a clean record</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiAlertCircle className="text-amber-600" /> Customer Complaints</h3>
                            <div className="text-center py-12">
                                <FiCheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-3" />
                                <p className="text-lg font-semibold text-emerald-700">No Complaints</p>
                                <p className="text-sm text-slate-500 mt-2">Excellent customer service record</p>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-6 rounded-2xl">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-900">
                            <FiTrendingUp className="text-blue-600" /> Performance Recommendations
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-blue-200">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                        <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-slate-900 mb-1">Maintain Quality</p>
                                        <p className="text-xs text-slate-600">Continue providing excellent service to maintain high ratings</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-blue-200">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <FiTrendingUp className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-slate-900 mb-1">Improve Response Time</p>
                                        <p className="text-xs text-slate-600">Respond to customer queries within 12 hours for better satisfaction</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200">
                    <h3 className="text-lg font-semibold mb-6">Account Settings</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <div>
                                <p className="font-semibold text-slate-900">Account Status</p>
                                <p className="text-sm text-slate-500">Current status: {seller.isActive ? 'Active' : 'Suspended'}</p>
                            </div>
                            <button onClick={() => handleAction(seller.isActive ? 'suspend' : 'activate')} className={`px-4 py-2 rounded-lg font-semibold text-sm ${seller.isActive ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                {seller.isActive ? 'Suspend Account' : 'Activate Account'}
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <div>
                                <p className="font-semibold text-slate-900">Verification Status</p>
                                <p className="text-sm text-slate-500">Current: {seller.verificationStatus}</p>
                            </div>
                            {seller.verificationStatus === 'pending' && (
                                <div className="flex gap-2">
                                    <button onClick={() => handleAction('verify')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold text-sm">Verify</button>
                                    <button onClick={() => handleAction('reject')} className="px-4 py-2 bg-rose-100 text-rose-700 rounded-lg font-semibold text-sm">Reject</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'activity-log' && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-200">
                        <h3 className="text-lg font-semibold flex items-center gap-2"><FiClock className="text-indigo-600" /> Activity Log</h3>
                        <p className="text-sm text-slate-500 mt-1">Chronological record of all seller and admin actions</p>
                    </div>
                    <div className="p-6">
                        {activityLogs.length > 0 ? (
                            <div className="space-y-4">
                                {activityLogs.map((log, idx) => (
                                    <div key={idx} className="flex gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${log.type === 'admin' ? 'bg-indigo-100 text-indigo-600' :
                                                log.type === 'seller' ? 'bg-emerald-100 text-emerald-600' :
                                                    'bg-slate-200 text-slate-600'
                                            }`}>
                                            {log.type === 'admin' ? <FiShield className="w-5 h-5" /> :
                                                log.type === 'seller' ? <FiUser className="w-5 h-5" /> :
                                                    <FiActivity className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-semibold text-slate-900">{log.action}</p>
                                                    <p className="text-sm text-slate-600 mt-1">{log.description}</p>
                                                </div>
                                                <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            {log.details && (
                                                <div className="mt-2 text-xs text-slate-500 bg-white p-2 rounded border border-slate-200">
                                                    {log.details}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <FiClock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500">No activity logs available</p>
                                <p className="text-xs text-slate-400 mt-1">Activity will be tracked automatically</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'communications' && (
                <div className="grid grid-cols-2 gap-6">
                    {/* Internal Notes */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold flex items-center gap-2"><FiMessageSquare className="text-indigo-600" /> Internal Notes</h3>
                                <p className="text-sm text-slate-500 mt-1">Private admin notes about this seller</p>
                            </div>
                            <button onClick={() => setShowNoteModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm flex items-center gap-2">
                                <FiPlus className="w-4 h-4" /> Add Note
                            </button>
                        </div>
                        <div className="p-6 max-h-[600px] overflow-y-auto">
                            {notes.length > 0 ? (
                                <div className="space-y-4">
                                    {notes.map((note, idx) => (
                                        <div key={idx} className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                            <div className="flex items-start justify-between mb-2">
                                                <span className="text-xs font-semibold text-amber-700 uppercase">Admin Note</span>
                                                <span className="text-xs text-slate-400">
                                                    {new Date(note.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-700">{note.note}</p>
                                            {note.createdBy && (
                                                <p className="text-xs text-slate-500 mt-2">By: {note.createdBy.name || note.createdBy.email}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FiMessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500">No notes yet</p>
                                    <p className="text-xs text-slate-400 mt-1">Add internal notes to track important information</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Communication History */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-200">
                            <h3 className="text-lg font-semibold flex items-center gap-2"><FiMail className="text-emerald-600" /> Communication History</h3>
                            <p className="text-sm text-slate-500 mt-1">Email and message exchanges with seller</p>
                        </div>
                        <div className="p-6 max-h-[600px] overflow-y-auto">
                            <div className="space-y-4">
                                {/* Document Requests */}
                                {seller.documents?.requestedDocuments?.length > 0 && (
                                    <>
                                        <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Document Requests</h4>
                                        {seller.documents.requestedDocuments.map((req, idx) => (
                                            <div key={idx} className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                                <div className="flex items-start justify-between mb-2">
                                                    <span className="text-xs font-semibold text-blue-700 uppercase">{req.status}</span>
                                                    <span className="text-xs text-slate-400">
                                                        {new Date(req.requestedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="font-semibold text-slate-900">{req.title}</p>
                                                <p className="text-sm text-slate-600 mt-1">{req.description}</p>
                                                {req.url && (
                                                    <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600">
                                                        <FiCheckCircle /> Document submitted
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </>
                                )}

                                {/* Placeholder for future email/message integration */}
                                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                                    <FiMail className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                    <p className="text-sm text-slate-500">Email integration coming soon</p>
                                    <p className="text-xs text-slate-400 mt-1">Direct messaging with sellers will appear here</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowRequestModal(false)}></div>
                    <form onSubmit={handleRequestDocument} className="relative bg-white w-full max-w-md rounded-2xl p-8 space-y-6">
                        <h3 className="text-xl font-semibold">Request Document</h3>
                        <input placeholder="Title" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl" required value={requestData.title} onChange={e => setRequestData({ ...requestData, title: e.target.value })} />
                        <textarea placeholder="Description" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl h-32 resize-none" required value={requestData.description} onChange={e => setRequestData({ ...requestData, description: e.target.value })} />
                        <div className="flex gap-4">
                            <button type="button" onClick={() => setShowRequestModal(false)} className="flex-1 py-3 text-slate-500 font-semibold">Cancel</button>
                            <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold">Send Request</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Note Modal */}
            {showNoteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowNoteModal(false)}></div>
                    <form onSubmit={handleAddNote} className="relative bg-white w-full max-w-md rounded-2xl p-8 space-y-6">
                        <h3 className="text-xl font-semibold">Add Internal Note</h3>
                        <p className="text-sm text-slate-500">This note will only be visible to admin team members</p>
                        <textarea
                            placeholder="Enter your note here..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl h-32 resize-none"
                            required
                            value={noteText}
                            onChange={e => setNoteText(e.target.value)}
                        />
                        <div className="flex gap-4">
                            <button type="button" onClick={() => setShowNoteModal(false)} className="flex-1 py-3 text-slate-500 font-semibold">Cancel</button>
                            <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold">Add Note</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}

function InfoItem({ label, value, icon: Icon }) {
    return (
        <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">{Icon && <Icon className="w-3 h-3" />} {label}</p>
            <p className="text-sm font-medium text-slate-900">{value || 'N/A'}</p>
        </div>
    )
}

function DocCard({ label, url: urlProp }) {
    const url = typeof urlProp === 'object' ? urlProp?.url : urlProp
    if (!url) return <div className="bg-slate-50 p-4 rounded-xl text-center"><p className="text-xs text-slate-400">{label} - Not Uploaded</p></div>
    return (
        <a href={url} target="_blank" className="bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 p-4 rounded-xl text-center transition-all group">
            <FiFileText className="w-8 h-8 mx-auto text-slate-400 group-hover:text-indigo-600 mb-2" />
            <p className="text-xs font-semibold text-slate-700 group-hover:text-indigo-600">{label}</p>
        </a>
    )
}
