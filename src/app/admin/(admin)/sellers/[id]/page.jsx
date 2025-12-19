'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import {
  FiArrowLeft, FiMail, FiPhone, FiGlobe, FiMapPin, FiCalendar,
  FiCheckCircle, FiXCircle, FiFileText, FiFacebook, FiInstagram,
  FiLinkedin, FiTwitter, FiYoutube, FiDollarSign, FiShoppingCart,
  FiPackage, FiUsers, FiTrendingUp, FiStar, FiClock, FiTruck,
  FiAward, FiEdit2, FiAlertCircle, FiSettings, FiDownload,
  FiUpload, FiTrash2, FiPause, FiPlay, FiZap, FiBox,
  FiMessageSquare, FiActivity, FiShield, FiDatabase
} from 'react-icons/fi'
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadialBarChart, RadialBar, AreaChart, Area
} from 'recharts'
import { useAuth } from '@/lib/context/AuthContext'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444']

export default function AdminSellerDetailPage({ params: paramsPromise }) {
  const { token, user } = useAuth()
  const router = useRouter()
  const [params, setParams] = useState(null)
  const [seller, setSeller] = useState(null)
  const [sellerOrders, setSellerOrders] = useState([])
  const [sellerProducts, setSellerProducts] = useState([])
  const [sellerReviews, setSellerReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showCommissionModal, setShowCommissionModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [processingAction, setProcessingAction] = useState(false)

  useEffect(() => {
    // Unwrap params
    const unwrapParams = async () => {
      const resolvedParams = await paramsPromise
      setParams(resolvedParams)
    }
    unwrapParams()
  }, [paramsPromise])

  useEffect(() => {
    if (params?.id && token) {
      fetchAllData()
    }
  }, [params, token])

  async function fetchAllData() {
    setLoading(true)
    try {
      await Promise.all([
        fetchSellerDetails(),
        fetchSellerOrders(),
        fetchSellerProducts(),
        fetchSellerReviews()
      ])
    } catch (error) {
      console.error('Error fetching ', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchSellerDetails() {
    try {
      const res = await axios.get(`/api/admin/sellers/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        setSeller(res.data.seller)
      }
    } catch (error) {
      console.error('Error fetching seller:', error)
      toast.error('Failed to fetch seller details')
    }
  }

  async function fetchSellerOrders() {
    try {
      const res = await axios.get(`/api/seller/orders?sellerId=${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log(res)
      if (res.data.success) {
        setSellerOrders(res.data.orders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  async function fetchSellerProducts() {
    try {
      const res = await axios.get(`/api/admin/sellers/${params.id}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log(res)
      if (res.data.success) {
        setSellerProducts(res.data.products)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  async function fetchSellerReviews() {
    try {
      const res = await axios.get(`/api/admin/sellers/${params.id}/reviews`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        setSellerReviews(res.data.reviews)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  // Action Handlers
  async function handleToggleStatus() {
    if (!confirm(`${seller.isActive ? 'Deactivate' : 'Activate'} this seller?`)) return

    setProcessingAction(true)
    try {
      const res = await axios.patch(
        `/api/admin/sellers/${params.id}/toggle-status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data.success) {
        toast.success(`Seller ${seller.isActive ? 'deactivated' : 'activated'} successfully`)
        fetchSellerDetails()
      }
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setProcessingAction(false)
    }
  }

  async function handleUpdateCommission(newCommission) {
    setProcessingAction(true)
    try {
      const res = await axios.patch(
        `/api/admin/sellers/${params.id}/commission`,
        { commission: parseFloat(newCommission) },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data.success) {
        toast.success('Commission updated successfully')
        setShowCommissionModal(false)
        fetchSellerDetails()
      }
    } catch (error) {
      toast.error('Failed to update commission')
    } finally {
      setProcessingAction(false)
    }
  }

  async function handleUpdatePlan(plan) {
    setProcessingAction(true)
    try {
      const res = await axios.patch(
        `/api/admin/sellers/${params.id}/plan`,
        { plan },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data.success) {
        toast.success('Plan updated successfully')
        setShowPlanModal(false)
        fetchSellerDetails()
      }
    } catch (error) {
      toast.error('Failed to update plan')
    } finally {
      setProcessingAction(false)
    }
  }

  async function handleToggleProductStatus(productId, currentStatus) {
    if (!confirm(`${currentStatus ? 'Disable' : 'Enable'} this product?`)) return

    try {
      const res = await axios.patch(
        `/api/admin/products/${productId}/toggle-status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data.success) {
        toast.success('Product status updated')
        fetchSellerProducts()
      }
    } catch (error) {
      toast.error('Failed to update product')
    }
  }

  async function handleVerifyDocument(docType) {
    try {
      const res = await axios.patch(
        `/api/admin/sellers/${params.id}/verify-document`,
        { documentType: docType },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data.success) {
        toast.success('Document verified')
        fetchSellerDetails()
      }
    } catch (error) {
      toast.error('Failed to verify document')
    }
  }

  async function handleDeleteReview(reviewId) {
    if (!confirm('Delete this review?')) return

    try {
      const res = await axios.delete(
        `/api/admin/reviews/${reviewId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data.success) {
        toast.success('Review deleted')

        fetchSellerReviews()
      }
    } catch (error) {
      toast.error('Failed to delete review')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  if (!seller) return null

  // Calculate stats
  const orderStats = {
    total: sellerOrders.length,
    confirmed: sellerOrders.filter(o => o.status === 'confirmed').length,
    processing: sellerOrders.filter(o => o.status === 'processing').length,
    shipped: sellerOrders.filter(o => o.status === 'shipped').length,
    delivered: sellerOrders.filter(o => o.status === 'delivered').length,
    cancelled: sellerOrders.filter(o => o.status === 'cancelled').length,
    returned: sellerOrders.filter(o => o.status === 'returned').length,
    totalRevenue: sellerOrders
      .filter(o => !['cancelled', 'returned'].includes(o.status))
      .reduce((sum, o) => sum + (o.pricing?.total || 0), 0)
  }

  const productStats = {
    total: sellerProducts.length,
    active: sellerProducts.filter(p => p.isActive).length,
    inactive: sellerProducts.filter(p => !p.isActive).length,
    outOfStock: sellerProducts.filter(p => (p.inventory?.stock || 0) === 0).length,
    lowStock: sellerProducts.filter(p => {
      const stock = p.inventory?.stock || 0
      const threshold = p.inventory?.lowStockThreshold || 10
      return stock > 0 && stock <= threshold
    }).length
  }

  // Chart data
  const ratingData = [
    { name: '5★', value: seller.ratings?.breakdown?.five || 0, fill: '#10B981' },
    { name: '4★', value: seller.ratings?.breakdown?.four || 0, fill: '#3B82F6' },
    { name: '3★', value: seller.ratings?.breakdown?.three || 0, fill: '#F59E0B' },
    { name: '2★', value: seller.ratings?.breakdown?.two || 0, fill: '#F97316' },
    { name: '1★', value: seller.ratings?.breakdown?.one || 0, fill: '#EF4444' }
  ]

  const orderStatusData = [
    { name: 'Confirmed', value: orderStats.confirmed, fill: '#10B981' },
    { name: 'Processing', value: orderStats.processing, fill: '#3B82F6' },
    { name: 'Shipped', value: orderStats.shipped, fill: '#8B5CF6' },
    { name: 'Delivered', value: orderStats.delivered, fill: '#F59E0B' },
    { name: 'Cancelled', value: orderStats.cancelled, fill: '#EF4444' }
  ]

  const productStatusData = [
    { name: 'Active', value: productStats.active, fill: '#10B981' },
    { name: 'Inactive', value: productStats.inactive, fill: '#6B7280' },
    { name: 'Out of Stock', value: productStats.outOfStock, fill: '#EF4444' },
    { name: 'Low Stock', value: productStats.lowStock, fill: '#F59E0B' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Banner */}
      <div className="relative">
        <img
          src={seller.storeInfo?.storeBanner || '/images/default-banner.jpg'}
          alt="Store Banner"
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-7xl mx-auto flex items-end space-x-6">
            <img
              src={seller.storeInfo?.storeLogo || '/images/default-logo.png'}
              alt={seller.businessName}
              className="w-24 h-24 rounded-xl border-4 border-white shadow-xl bg-white object-cover"
            />
            <div className="flex-1 pb-2">
              <h1 className="text-3xl font-bold text-white mb-1">{seller.businessName}</h1>
              <div className="flex items-center space-x-4 text-white/90">
                <span className="capitalize">{seller.businessCategory}</span>
                <span>•</span>
                <span className="capitalize">{seller.businessType?.replace(/_/g, ' ')}</span>
                <span>•</span>
                <span>Member since {new Date(seller.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <button
              onClick={() => router.push('/admin/sellers')}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <FiArrowLeft />
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                {seller.isActive ? (
                  <>
                    <FiCheckCircle className="text-green-600" />
                    <span className="text-green-700 font-semibold">Active</span>
                  </>
                ) : (
                  <>
                    <FiXCircle className="text-red-600" />
                    <span className="text-red-700 font-semibold">Inactive</span>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {seller.isVerified ? (
                  <>
                    <FiShield className="text-blue-600" />
                    <span className="text-blue-700 font-semibold">Verified</span>
                  </>
                ) : (
                  <>
                    <FiAlertCircle className="text-yellow-600" />
                    <span className="text-yellow-700 font-semibold capitalize">
                      {seller.verificationStatus}
                    </span>
                  </>
                )}
              </div>
              <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold capitalize">
                {seller.subscriptionPlan} Plan
              </div>
              <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                {seller.commissionRate}% Commission
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleToggleStatus}
                disabled={processingAction}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition font-medium disabled:opacity-50 ${seller.isActive
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
              >
                {seller.isActive ? <FiPause /> : <FiPlay />}
                <span>{seller.isActive ? 'Deactivate' : 'Activate'}</span>
              </button>

              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <FiEdit2 />
                <span>Edit Seller</span>
              </button>

              <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                <FiSettings className="text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { value: 'overview', label: 'Overview', icon: FiActivity },
              { value: 'products', label: 'Products', icon: FiBox },
              { value: 'orders', label: 'Orders', icon: FiShoppingCart },
              { value: 'reviews', label: 'Reviews', icon: FiMessageSquare },
              { value: 'analytics', label: 'Analytics', icon: FiTrendingUp },
              { value: 'settings', label: 'Settings', icon: FiSettings },
              { value: 'documents', label: 'Documents', icon: FiFileText },
              { value: 'payouts', label: 'Payouts', icon: FiDollarSign }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`py-4 border-b-2 transition-colors flex items-center space-x-2 whitespace-nowrap ${activeTab === tab.value
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <Icon />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <OverviewTab
            seller={seller}
            orderStats={orderStats}
            productStats={productStats}
            ratingData={ratingData}
            orderStatusData={orderStatusData}
            productStatusData={productStatusData}
            sellerOrders={sellerOrders}
            sellerProducts={sellerProducts}
          />
        )}

        {activeTab === 'products' && (
          <ProductsTab
            products={sellerProducts}
            onToggleStatus={handleToggleProductStatus}
            onRefresh={fetchSellerProducts}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTab
            orders={sellerOrders}
            stats={orderStats}
            onRefresh={fetchSellerOrders}
          />
        )}

        {activeTab === 'reviews' && (
          <ReviewsTab
            reviews={sellerReviews}
            onDelete={handleDeleteReview}
            onRefresh={fetchSellerReviews}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab
            seller={seller}
            orders={sellerOrders}
            products={sellerProducts}
            orderStats={orderStats}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            seller={seller}
            onUpdateCommission={() => setShowCommissionModal(true)}
            onUpdatePlan={() => setShowPlanModal(true)}
            onRefresh={fetchSellerDetails}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentsTab
            seller={seller}
            onVerify={handleVerifyDocument}
            onRefresh={fetchSellerDetails}
          />
        )}

        {activeTab === 'payouts' && (
          <PayoutsTab
            seller={seller}
            orders={sellerOrders}
            stats={orderStats}
          />
        )}
      </div>

      {/* Modals */}
      {showCommissionModal && (
        <CommissionModal
          currentCommission={seller.commissionRate}
          onSave={handleUpdateCommission}
          onClose={() => setShowCommissionModal(false)}
          processing={processingAction}
        />
      )}

      {showPlanModal && (
        <PlanModal
          currentPlan={seller.subscriptionPlan}
          onSave={handleUpdatePlan}
          onClose={() => setShowPlanModal(false)}
          processing={processingAction}
        />
      )}
    </div>
  )
}

// Component: Overview Tab
function OverviewTab({ seller, orderStats, productStats, ratingData, orderStatusData, productStatusData, sellerOrders, sellerProducts }) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={<FiDollarSign className="text-green-600" />}
          label="Total Revenue"
          value={`₹${orderStats.totalRevenue.toLocaleString()}`}
          bgColor="bg-green-50"
        />
        <MetricCard
          icon={<FiShoppingCart className="text-blue-600" />}
          label="Total Orders"
          value={orderStats.total.toLocaleString()}
          bgColor="bg-blue-50"
        />
        <MetricCard
          icon={<FiPackage className="text-purple-600" />}
          label="Active Products"
          value={productStats.active}
          subtitle={`of ${productStats.total} total`}
          bgColor="bg-purple-50"
        />
        <MetricCard
          icon={<FiStar className="text-yellow-600" />}
          label="Average Rating"
          value={`${seller.ratings?.average || 0}/5`}
          subtitle={`${seller.ratings?.totalReviews || 0} reviews`}
          bgColor="bg-yellow-50"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Customer Ratings">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={ratingData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {ratingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Order Status Distribution">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={orderStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Product Status">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={productStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {productStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoCard title="Recent Orders">
          <div className="space-y-3">
            {sellerOrders.slice(0, 5).map((order) => (
              <Link
                key={order._id}
                href={`/admin/orders/${order._id}`}
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">#{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">
                      ₹{order.pricing.total.toLocaleString()}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </InfoCard>

        <InfoCard title="Top Products">
          <div className="space-y-3">
            {sellerProducts.slice(0, 5).map((product) => (
              <Link
                key={product._id}
                href={`/admin/products/${product._id}`}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <img
                  src={product.images?.[0]?.url || '/placeholder.png'}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 line-clamp-1">{product.name}</p>
                  <p className="text-sm text-gray-600">
                    Stock: {product.inventory?.stock || 0}
                  </p>
                </div>
                <p className="font-bold text-blue-600">
                  ₹{product.pricing?.salePrice || product.pricing?.basePrice}
                </p>
              </Link>
            ))}
          </div>
        </InfoCard>
      </div>
    </div>
  )
}

// Component: Products Tab
function ProductsTab({ products, onToggleStatus, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && p.isActive) ||
      (statusFilter === 'inactive' && !p.isActive) ||
      (statusFilter === 'outOfStock' && (p.inventory?.stock || 0) === 0)

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Products</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="outOfStock">Out of Stock</option>
        </select>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Refresh
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <img
              src={product.images?.[0]?.url || '/placeholder.png'}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
              <div className="flex items-center justify-between mb-3">
                <p className="text-2xl font-bold text-blue-600">
                  ₹{product.pricing?.salePrice || product.pricing?.basePrice}
                </p>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-3">
                <p>Stock: <strong>{product.inventory?.stock || 0}</strong></p>
                <p>SKU: {product.sku || 'N/A'}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onToggleStatus(product._id, product.isActive)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${product.isActive
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                >
                  {product.isActive ? 'Disable' : 'Enable'}
                </button>
                <Link
                  href={`/admin/products/${product._id}`}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium text-center hover:bg-blue-700 transition"
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FiPackage className="mx-auto text-6xl text-gray-300 mb-4" />
          <p className="text-gray-600">No products found</p>
        </div>
      )}
    </div>
  )
}

// Component: Orders Tab
function OrdersTab({ orders, stats, onRefresh }) {
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredOrders = orders.filter(o =>
    statusFilter === 'all' || o.status === statusFilter
  )

  return (
    <div className="space-y-6">
      {/* Order Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={stats.total} color="text-blue-600" />
        <StatCard label="Delivered" value={stats.delivered} color="text-green-600" />
        <StatCard label="Cancelled" value={stats.cancelled} color="text-red-600" />
        <StatCard label="Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} color="text-purple-600" />
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Orders</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Link
            key={order._id}
            href={`/admin/orders/${order._id}`}
            className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">#{order.orderNumber}</h3>
                <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">₹{order.pricing.total.toLocaleString()}</p>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                  {order.status.toUpperCase()}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// Component: Reviews Tab
function ReviewsTab({ reviews, onDelete, onRefresh }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Customer Reviews ({reviews.length})</h2>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-gray-900">{review.rating}/5</span>
                </div>
                <p className="text-sm text-gray-600">By {review.customer?.name || 'Anonymous'}</p>
                <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => onDelete(review._id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <FiTrash2 />
              </button>
            </div>
            <p className="text-gray-700">{review.comment}</p>
            {review.product && (
              <Link
                href={`/admin/products/${review.product._id}`}
                className="mt-3 inline-block text-sm text-blue-600 hover:underline"
              >
                View Product: {review.product.name}
              </Link>
            )}
          </div>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FiMessageSquare className="mx-auto text-6xl text-gray-300 mb-4" />
          <p className="text-gray-600">No reviews yet</p>
        </div>
      )}
    </div>
  )
}

// Component: Analytics Tab
function AnalyticsTab({ seller, orders, products, orderStats }) {
  // Calculate monthly revenue
  const monthlyRevenue = orders.reduce((acc, order) => {
    if (['cancelled', 'returned'].includes(order.status)) return acc

    const month = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short' })
    const existing = acc.find(item => item.name === month)

    if (existing) {
      existing.revenue += order.pricing.total
      existing.orders += 1
    } else {
      acc.push({ name: month, revenue: order.pricing.total, orders: 1 })
    }

    return acc
  }, [])

  // Calculate category performance
  const categoryPerformance = products.reduce((acc, product) => {
    const category = product.category || 'Uncategorized'
    const existing = acc.find(item => item.name === category)

    if (existing) {
      existing.products += 1
      if (product.isActive) existing.active += 1
    } else {
      acc.push({ name: category, products: 1, active: product.isActive ? 1 : 0 })
    }

    return acc
  }, [])

  // Performance metrics
  const avgOrderValue = orderStats.total > 0 ? (orderStats.totalRevenue / orderStats.total) : 0
  const fulfillmentRate = orderStats.total > 0 ? ((orderStats.delivered / orderStats.total) * 100) : 0
  const cancellationRate = orderStats.total > 0 ? ((orderStats.cancelled / orderStats.total) * 100) : 0
  const returnRate = orderStats.total > 0 ? ((orderStats.returned / orderStats.total) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Performance KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          label="Avg Order Value"
          value={`₹${avgOrderValue.toFixed(2)}`}
          icon={<FiDollarSign />}
          color="bg-green-100 text-green-600"
        />
        <KPICard
          label="Fulfillment Rate"
          value={`${fulfillmentRate.toFixed(1)}%`}
          icon={<FiCheckCircle />}
          color="bg-blue-100 text-blue-600"
        />
        <KPICard
          label="Cancellation Rate"
          value={`${cancellationRate.toFixed(1)}%`}
          icon={<FiXCircle />}
          color="bg-red-100 text-red-600"
        />
        <KPICard
          label="Return Rate"
          value={`${returnRate.toFixed(1)}%`}
          icon={<FiAlertCircle />}
          color="bg-yellow-100 text-yellow-600"
        />
      </div>

      {/* Revenue & Orders Chart */}
      <ChartCard title="Monthly Revenue & Orders">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.6}
              name="Revenue (₹)"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="orders"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.6}
              name="Orders"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Category Performance */}
      <ChartCard title="Category Performance">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryPerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="products" fill="#3B82F6" name="Total Products" />
            <Bar dataKey="active" fill="#10B981" name="Active Products" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Performance Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoCard title="Performance Scorecard">
          <div className="space-y-4">
            <ScoreBar label="Order Fulfillment" value={fulfillmentRate} max={100} color="bg-green-500" />
            <ScoreBar label="Product Quality (Avg Rating)" value={seller.ratings?.average * 20 || 0} max={100} color="bg-blue-500" />
            <ScoreBar label="Customer Satisfaction" value={(seller.performance?.customerSatisfactionScore || 0) * 20} max={100} color="bg-purple-500" />
            <ScoreBar label="On-Time Delivery" value={seller.performance?.orderFulfillmentRate || 0} max={100} color="bg-orange-500" />
          </div>
        </InfoCard>

        <InfoCard title="Key Insights">
          <div className="space-y-3">
            <InsightCard
              icon={<FiTrendingUp className="text-green-600" />}
              title="Best Performance"
              description={`Fulfillment rate at ${fulfillmentRate.toFixed(1)}%`}
              type="success"
            />
            <InsightCard
              icon={<FiAlertCircle className="text-yellow-600" />}
              title="Needs Attention"
              description={`${products.filter(p => (p.inventory?.stock || 0) <= (p.inventory?.lowStockThreshold || 10)).length} products low on stock`}
              type="warning"
            />
            <InsightCard
              icon={<FiStar className="text-blue-600" />}
              title="Customer Feedback"
              description={`${seller.ratings?.average || 0}/5 from ${seller.ratings?.totalReviews || 0} reviews`}
              type="info"
            />
          </div>
        </InfoCard>
      </div>
    </div>
  )
}

// Component: Settings Tab
function SettingsTab({ seller, onUpdateCommission, onUpdatePlan, onRefresh }) {
  return (
    <div className="space-y-6">
      {/* Account Settings */}
      <InfoCard title="Account Settings">
        <div className="space-y-4">
          <SettingRow
            label="Business Name"
            value={seller.businessName}
            action={<button className="text-blue-600 hover:underline">Edit</button>}
          />
          <SettingRow
            label="Email"
            value={seller.userId?.email || 'N/A'}
            action={<button className="text-blue-600 hover:underline">Edit</button>}
          />
          <SettingRow
            label="Phone"
            value={seller.userId?.phone || 'N/A'}
            action={<button className="text-blue-600 hover:underline">Edit</button>}
          />
          <SettingRow
            label="Subscription Plan"
            value={<span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold capitalize">{seller.subscriptionPlan}</span>}
            action={
              <button
                onClick={onUpdatePlan}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Change Plan
              </button>
            }
          />
          <SettingRow
            label="Commission Rate"
            value={`${seller.commissionRate}%`}
            action={
              <button
                onClick={onUpdateCommission}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Update
              </button>
            }
          />
        </div>
      </InfoCard>

      {/* Subscription Details */}
      <InfoCard title="Subscription Details">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Plan Type</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">{seller.subscriptionPlan}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Start Date</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(seller.subscriptionStartDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Expiry Date</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(seller.subscriptionExpiry).toLocaleDateString()}
            </p>
          </div>
        </div>
      </InfoCard>

      {/* Store Settings */}
      <InfoCard title="Store Information">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Store Name</p>
            <p className="text-lg font-semibold text-gray-900">{seller.storeInfo?.storeName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Store Description</p>
            <p className="text-gray-700">{seller.storeInfo?.storeDescription}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-2">Categories</p>
            <div className="flex flex-wrap gap-2">
              {seller.storeInfo?.storeCategories?.map((cat, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
      </InfoCard>

      {/* Bank Details */}
      <InfoCard title="Bank Account">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow label="Account Holder" value={seller.bankDetails?.accountHolderName} />
          <InfoRow label="Account Number" value={seller.bankDetails?.accountNumber} />
          <InfoRow label="IFSC Code" value={seller.bankDetails?.ifscCode} />
          <InfoRow label="Bank Name" value={seller.bankDetails?.bankName} />
          <InfoRow label="Branch" value={seller.bankDetails?.branch} />
          <InfoRow label="Account Type" value={seller.bankDetails?.accountType?.toUpperCase()} />
        </div>
      </InfoCard>

      {/* Pickup Address */}
      <InfoCard title="Primary Pickup Address">
        <div className="space-y-2">
          <p className="font-medium text-gray-900">{seller.pickupAddress?.addressLine1}</p>
          {seller.pickupAddress?.addressLine2 && <p className="text-gray-700">{seller.pickupAddress.addressLine2}</p>}
          <p className="text-gray-700">
            {seller.pickupAddress?.city}, {seller.pickupAddress?.state} - {seller.pickupAddress?.pincode}
          </p>
          <p className="text-gray-700">{seller.pickupAddress?.country}</p>
        </div>
      </InfoCard>
    </div>
  )
}

// Component: Documents Tab
function DocumentsTab({ seller, onVerify, onRefresh }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Verification Documents</h2>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Verification Steps */}
      <InfoCard title="Verification Status">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(seller.verificationSteps || {}).map(([key, value]) => (
            <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
              {value ? (
                <FiCheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              ) : (
                <FiXCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              )}
              <p className="text-sm font-medium text-gray-900 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </p>
              <p className={`text-xs mt-1 ${value ? 'text-green-600' : 'text-gray-500'}`}>
                {value ? 'Verified' : 'Pending'}
              </p>
            </div>
          ))}
        </div>
      </InfoCard>

      {/* Documents List */}
      {Object.entries(seller.documents || {}).map(([key, doc]) => {
        if (typeof doc === 'object' && doc.url) {
          return (
            <DocumentCard
              key={key}
              title={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              url={doc.url}
              verified={doc.verified}
              uploadedAt={doc.uploadedAt}
              type={doc.type}
              onVerify={() => onVerify(key)}
            />
          )
        }
        return null
      })}

      {/* Agreement Status */}
      {seller.documents?.agreementSigned && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <FiCheckCircle className="text-green-600 text-xl" />
          <div>
            <p className="font-semibold text-green-900">Agreement Signed</p>
            <p className="text-sm text-green-700">
              Signed on {new Date(seller.documents.agreementSignedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Component: Payouts Tab
function PayoutsTab({ seller, orders, stats }) {
  const completedOrders = orders.filter(o => o.status === 'delivered')
  const pendingAmount = completedOrders
    .filter(o => !o.payment.sellerPaid)
    .reduce((sum, o) => {
      const commission = (o.pricing.total * seller.commissionRate) / 100
      return sum + (o.pricing.total - commission)
    }, 0)

  const paidAmount = completedOrders
    .filter(o => o.payment.sellerPaid)
    .reduce((sum, o) => {
      const commission = (o.pricing.total * seller.commissionRate) / 100
      return sum + (o.pricing.total - commission)
    }, 0)

  return (
    <div className="space-y-6">
      {/* Payout Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <FiDollarSign className="text-3xl mb-2 opacity-80" />
          <p className="text-sm opacity-90">Total Earnings</p>
          <p className="text-3xl font-bold">₹{(pendingAmount + paidAmount).toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
          <FiClock className="text-3xl mb-2 opacity-80" />
          <p className="text-sm opacity-90">Pending Payout</p>
          <p className="text-3xl font-bold">₹{pendingAmount.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <FiCheckCircle className="text-3xl mb-2 opacity-80" />
          <p className="text-sm opacity-90">Paid Out</p>
          <p className="text-3xl font-bold">₹{paidAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Commission Breakdown */}
      <InfoCard title="Commission Breakdown">
        <div className="space-y-3">
          <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Commission Rate</span>
            <span className="font-bold text-gray-900">{seller.commissionRate}%</span>
          </div>
          <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Total Order Value</span>
            <span className="font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Platform Commission</span>
            <span className="font-bold text-red-600">
              -₹{((stats.totalRevenue * seller.commissionRate) / 100).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
            <span className="text-blue-900 font-semibold">Seller Earnings</span>
            <span className="font-bold text-blue-600">
              ₹{(stats.totalRevenue - (stats.totalRevenue * seller.commissionRate) / 100).toLocaleString()}
            </span>
          </div>
        </div>
      </InfoCard>

      {/* Recent Payouts */}
      <InfoCard title="Payout History">
        <div className="space-y-3">
          {completedOrders.slice(0, 10).map((order) => {
            const commission = (order.pricing.total * seller.commissionRate) / 100
            const sellerAmount = order.pricing.total - commission

            return (
              <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">#{order.orderNumber}</p>
                  <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">₹{sellerAmount.toLocaleString()}</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${order.payment.sellerPaid
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {order.payment.sellerPaid ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </InfoCard>
    </div>
  )
}

// Helper Components
function MetricCard({ icon, label, value, subtitle, bgColor }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-lg ${bgColor}`}>{icon}</div>
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  )
}

function InfoCard({ title, children }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b last:border-b-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value || 'N/A'}</span>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

function KPICard({ label, value, icon, color }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className={`inline-flex p-3 rounded-lg ${color} mb-3`}>
        {icon}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function ScoreBar({ label, value, max, color }) {
  // Ensure value is a number and handle edge cases
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0
  const percentage = (numericValue / max) * 100

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{numericValue.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full ${color} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

function InsightCard({ icon, title, description, type }) {
  const colors = {
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  }

  return (
    <div className={`p-4 rounded-lg border ${colors[type]}`}>
      <div className="flex items-start space-x-3">
        <div className="mt-1">{icon}</div>
        <div>
          <p className="font-semibold text-gray-900">{title}</p>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  )
}

function SettingRow({ label, value, action }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <div className="mt-1">{typeof value === 'string' ? <p className="font-medium text-gray-900">{value}</p> : value}</div>
      </div>
      {action}
    </div>
  )
}

function DocumentCard({ title, url, verified, uploadedAt, type, onVerify }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <FiFileText className="text-blue-600 text-xl" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{title}</h4>
          {type && <p className="text-xs text-gray-500 capitalize">{type}</p>}
          <p className="text-xs text-gray-500">
            Uploaded: {new Date(uploadedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        {verified ? (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center space-x-1">
            <FiCheckCircle />
            <span>Verified</span>
          </span>
        ) : (
          <>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold flex items-center space-x-1">
              <FiAlertCircle />
              <span>Pending</span>
            </span>
            <button
              onClick={onVerify}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              Verify
            </button>
          </>
        )}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          View
        </a>
      </div>
    </div>
  )
}

// Modal Components
function CommissionModal({ currentCommission, onSave, onClose, processing }) {
  const [commission, setCommission] = useState(currentCommission)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Update Commission Rate</h2>
        <p className="text-gray-600 mb-6">
          Set the commission percentage for this seller. This will apply to all future orders.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Commission Rate (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={commission}
            onChange={(e) => setCommission(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={processing}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(commission)}
            disabled={processing}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {processing ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

function PlanModal({ currentPlan, onSave, onClose, processing }) {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan)

  const plans = [
    { value: 'free', label: 'Free', features: ['5 Products', 'Basic Support', '10% Commission'] },
    { value: 'basic', label: 'Basic', features: ['50 Products', 'Email Support', '8% Commission'] },
    { value: 'pro', label: 'Pro', features: ['200 Products', 'Priority Support', '5% Commission'] },
    { value: 'enterprise', label: 'Enterprise', features: ['Unlimited Products', '24/7 Support', '3% Commission'] }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Update Subscription Plan</h2>
        <p className="text-gray-600 mb-6">
          Choose a new plan for this seller. Changes will take effect immediately.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {plans.map((plan) => (
            <button
              key={plan.value}
              onClick={() => setSelectedPlan(plan.value)}
              className={`p-4 rounded-lg border-2 transition text-left ${selectedPlan === plan.value
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2 capitalize">{plan.label}</h3>
              <ul className="space-y-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-center">
                    <FiCheckCircle className="text-green-600 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={processing}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(selectedPlan)}
            disabled={processing}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {processing ? 'Updating...' : 'Update Plan'}
          </button>
        </div>
      </div>
    </div>
  )
}
