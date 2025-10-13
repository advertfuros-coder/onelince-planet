// app/seller/(seller)/dashboard/page.jsx
'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '@/lib/context/AuthContext'
import {
  FiShoppingBag,
  FiClipboard,
  FiDollarSign,
  FiUsers,
  FiTrendingUp,
  FiTrendingDown,
  FiStar,
  FiPackage,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiAward,
  FiTarget,
  FiAlertTriangle,
  FiRefreshCw,
  FiTruck,
  FiXCircle,
  FiPercent,
  FiCreditCard,
  FiEye
} from 'react-icons/fi'
import Link from 'next/link'

export default function SellerDashboard() {
  const { token, user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (token) {
      loadDashboardData()
    }
  }, [token])

  const loadDashboardData = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true)
      else setLoading(true)
      
      setError(null)
      
      const response = await axios.get('/api/seller/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      })

      console.log('📊 Dashboard Data:', response.data.responseData)
      
      if (response.data.success) {
        setDashboardData(response.data.responseData)
      } else {
        setError(response.data.message || 'Failed to load dashboard')
      }
    } catch (error) {
      console.error('❌ Error loading dashboard:', error)
      setError(error.response?.data?.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Safe data access with defaults
  const safeData = {
    totalProducts: dashboardData?.totalProducts || 0,
    activeProducts: dashboardData?.activeProducts || 0,
    totalOrders: dashboardData?.totalOrders || 0,
    grossRevenue: dashboardData?.grossRevenue || 0,
    commissionAmount: dashboardData?.commissionAmount || 0,
    netRevenue: dashboardData?.netRevenue || 0,
    totalCustomers: dashboardData?.totalCustomers || 0,
    avgOrderValue: dashboardData?.avgOrderValue || 0,
    pendingPayout: dashboardData?.pendingPayout || 0,
    revenueGrowth: dashboardData?.revenueGrowth || 0,
    cancellationRate: dashboardData?.cancellationRate || 0,
    salesData: dashboardData?.salesData || [],
    topProducts: dashboardData?.topProducts || [],
    recentOrders: dashboardData?.recentOrders || [],
    lowStockProducts: dashboardData?.lowStockProducts || [],
    orderStatusBreakdown: dashboardData?.orderStatusBreakdown || {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0
    },
    alerts: dashboardData?.alerts || {
      lowStock: 0,
      pendingOrders: 0,
      processingOrders: 0,
      shippedOrders: 0
    },
    sellerInfo: dashboardData?.sellerInfo || {
      businessName: '',
      storeName: '',
      rating: 0,
      totalReviews: 0,
      verificationStatus: 'pending',
      subscriptionPlan: 'free',
      commissionRate: 5,
      performance: {
        orderFulfillmentRate: 0,
        avgShippingTime: 0,
        customerSatisfactionScore: 0
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-gray-200 h-48 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-200 h-96 rounded-xl"></div>
          <div className="bg-gray-200 h-96 rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
        <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-red-800 mb-2">Error Loading Dashboard</h2>
        <p className="text-red-600 mb-6">{error}</p>
        <button 
          onClick={() => loadDashboardData()}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Real-time insights into your store performance</p>
        </div>
        <button
          onClick={() => loadDashboardData(true)}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Alerts Banner */}
      {(safeData.alerts.lowStock > 0 || safeData.alerts.pendingOrders > 0) && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <FiAlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2">Action Required</h3>
              <div className="flex flex-wrap gap-4">
                {safeData.alerts.lowStock > 0 && (
                  <Link href="/seller/products" className="text-sm text-orange-700 hover:text-orange-900 font-semibold underline">
                    {safeData.alerts.lowStock} product{safeData.alerts.lowStock > 1 ? 's' : ''} running low on stock
                  </Link>
                )}
                {safeData.alerts.pendingOrders > 0 && (
                  <Link href="/seller/orders" className="text-sm text-orange-700 hover:text-orange-900 font-semibold underline">
                    {safeData.alerts.pendingOrders} pending order{safeData.alerts.pendingOrders > 1 ? 's' : ''} need attention
                  </Link>
                )}
                {safeData.alerts.processingOrders > 0 && (
                  <Link href="/seller/orders?status=processing" className="text-sm text-blue-700 hover:text-blue-900 font-semibold underline">
                    {safeData.alerts.processingOrders} order{safeData.alerts.processingOrders > 1 ? 's' : ''} being processed
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Cards - PRIMARY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <RevenueCard
          title="Net Revenue"
          subtitle="After Commission"
          value={`₹${safeData.netRevenue.toLocaleString()}`}
          icon={FiDollarSign}
          iconColor="from-green-500 to-emerald-600"
          change={safeData.revenueGrowth}
          changeType={safeData.revenueGrowth >= 0 ? 'positive' : 'negative'}
          info={`Commission: ₹${safeData.commissionAmount.toLocaleString()} (${safeData.sellerInfo.commissionRate}%)`}
        />
        <RevenueCard
          title="Gross Revenue"
          subtitle="Before Commission"
          value={`₹${safeData.grossRevenue.toLocaleString()}`}
          icon={FiTrendingUp}
          iconColor="from-blue-500 to-blue-600"
          info="Total sales value"
        />
        <RevenueCard
          title="Pending Payout"
          subtitle="Delivered Orders"
          value={`₹${safeData.pendingPayout.toLocaleString()}`}
          icon={FiCreditCard}
          iconColor="from-purple-500 to-purple-600"
          info="Awaiting payment settlement"
        />
        <RevenueCard
          title="Avg Order Value"
          subtitle="Per Item"
          value={`₹${safeData.avgOrderValue.toLocaleString()}`}
          icon={FiTarget}
          iconColor="from-orange-500 to-orange-600"
          info="Average revenue per order"
        />
      </div>

      {/* Stats Cards - SECONDARY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={safeData.totalOrders.toLocaleString()}
          icon={FiClipboard}
          iconColor="from-blue-500 to-blue-600"
          badge={`${safeData.orderStatusBreakdown.delivered} delivered`}
        />
        <StatCard
          title="Total Products"
          value={safeData.totalProducts}
          icon={FiShoppingBag}
          iconColor="from-purple-500 to-purple-600"
          badge={`${safeData.activeProducts} active`}
        />
        <StatCard
          title="Total Customers"
          value={safeData.totalCustomers.toLocaleString()}
          icon={FiUsers}
          iconColor="from-green-500 to-green-600"
          badge="Unique buyers"
        />
        <StatCard
          title="Cancellation Rate"
          value={`${safeData.cancellationRate}%`}
          icon={FiXCircle}
          iconColor={safeData.cancellationRate > 10 ? 'from-red-500 to-red-600' : 'from-gray-500 to-gray-600'}
          badge={safeData.cancellationRate < 5 ? 'Excellent' : safeData.cancellationRate < 10 ? 'Good' : 'Needs attention'}
        />
      </div>

      {/* Order Status Breakdown */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <FiPackage className="w-6 h-6 mr-2 text-blue-600" />
          Order Status Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <OrderStatusCard
            status="Pending"
            count={safeData.orderStatusBreakdown.pending}
            icon={FiClock}
            color="yellow"
          />
          <OrderStatusCard
            status="Processing"
            count={safeData.orderStatusBreakdown.processing}
            icon={FiRefreshCw}
            color="blue"
          />
          <OrderStatusCard
            status="Shipped"
            count={safeData.orderStatusBreakdown.shipped}
            icon={FiTruck}
            color="purple"
          />
          <OrderStatusCard
            status="Delivered"
            count={safeData.orderStatusBreakdown.delivered}
            icon={FiCheckCircle}
            color="green"
          />
          <OrderStatusCard
            status="Cancelled"
            count={safeData.orderStatusBreakdown.cancelled}
            icon={FiXCircle}
            color="red"
          />
          <OrderStatusCard
            status="Returned"
            count={safeData.orderStatusBreakdown.returned}
            icon={FiAlertCircle}
            color="orange"
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <FiTrendingUp className="w-6 h-6 mr-2 text-blue-600" />
              Revenue Trend (After Commission)
            </h2>
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
              Last 6 months
            </div>
          </div>
          <SalesChart data={safeData.salesData} />
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <FiAward className="w-6 h-6 mr-2 text-purple-600" />
            Top Selling Products
          </h2>
          <TopProducts products={safeData.topProducts} />
        </div>
      </div>

      {/* Low Stock Alert */}
      {safeData.lowStockProducts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-orange-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <FiAlertTriangle className="w-6 h-6 mr-2 text-orange-600" />
              Low Stock Alert ({safeData.lowStockProducts.length})
            </h2>
            <Link 
              href="/seller/products" 
              className="text-orange-600 hover:text-orange-800 font-semibold text-sm"
            >
              Manage Inventory →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeData.lowStockProducts.slice(0, 6).map((product, index) => (
              <LowStockCard key={product?._id || index} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <FiClipboard className="w-6 h-6 mr-2 text-blue-600" />
              Recent Orders
            </h2>
            <Link 
              href="/seller/orders" 
              className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center space-x-1 transition-colors"
            >
              <span>View All Orders</span>
              <FiTrendingUp className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <RecentOrdersTable orders={safeData.recentOrders} />
      </div>

      {/* Performance Metrics */}
      {safeData.sellerInfo.performance && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <FiTarget className="w-6 h-6 mr-2 text-green-600" />
            Performance Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PerformanceCard
              icon={FiCheckCircle}
              title="Order Fulfillment Rate"
              value={`${(safeData.sellerInfo.performance.orderFulfillmentRate || 0).toFixed(1)}%`}
              subtitle="Excellent performance"
              color="green"
            />
            <PerformanceCard
              icon={FiClock}
              title="Avg Shipping Time"
              value={`${(safeData.sellerInfo.performance.avgShippingTime || 0).toFixed(1)} days`}
              subtitle="Fast delivery"
              color="blue"
            />
            <PerformanceCard
              icon={FiStar}
              title="Customer Satisfaction"
              value={`${(safeData.sellerInfo.performance.customerSatisfactionScore || 0).toFixed(1)}/5.0`}
              subtitle="Great service"
              color="purple"
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ========== COMPONENTS (All Error-Proof) ==========

// Revenue Card (Main Metric)
function RevenueCard({ title, subtitle, value, icon: Icon, iconColor, change, changeType, info }) {
  try {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 bg-gradient-to-br ${iconColor} rounded-xl flex items-center justify-center shadow-lg`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          {change !== undefined && change !== null && (
            <div className={`flex items-center space-x-1 ${
              changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {changeType === 'positive' ? (
                <FiTrendingUp className="w-4 h-4" />
              ) : (
                <FiTrendingDown className="w-4 h-4" />
              )}
              <span className="text-sm font-bold">{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{title || 'N/A'}</p>
          <p className="text-xs text-gray-500 mb-2">{subtitle || ''}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value || '₹0'}</p>
          {info && (
            <p className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">{info}</p>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error('RevenueCard error:', error)
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }
}

// Stat Card
function StatCard({ title, value, icon: Icon, iconColor, badge }) {
  try {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${iconColor} rounded-xl flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        <p className="text-gray-600 text-sm font-medium mb-1">{title || 'N/A'}</p>
        <p className="text-3xl font-bold text-gray-900 mb-2">{value || '0'}</p>
        {badge && (
          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">{badge}</span>
        )}
      </div>
    )
  } catch (error) {
    console.error('StatCard error:', error)
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }
}

// Order Status Card
function OrderStatusCard({ status, count, icon: Icon, color }) {
  try {
    const colors = {
      yellow: 'from-yellow-500 to-yellow-600',
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600',
      green: 'from-green-500 to-green-600',
      red: 'from-red-500 to-red-600',
      orange: 'from-orange-500 to-orange-600'
    }

    const bgColors = {
      yellow: 'bg-yellow-50 border-yellow-200',
      blue: 'bg-blue-50 border-blue-200',
      purple: 'bg-purple-50 border-purple-200',
      green: 'bg-green-50 border-green-200',
      red: 'bg-red-50 border-red-200',
      orange: 'bg-orange-50 border-orange-200'
    }

    return (
      <div className={`${bgColors[color] || 'bg-gray-50 border-gray-200'} border-2 rounded-xl p-4 text-center hover:scale-105 transition-transform`}>
        <div className={`w-12 h-12 bg-gradient-to-br ${colors[color] || 'from-gray-500 to-gray-600'} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <p className="text-sm text-gray-600 font-semibold mb-1">{status || 'N/A'}</p>
        <p className="text-2xl font-bold text-gray-900">{count || 0}</p>
      </div>
    )
  } catch (error) {
    console.error('OrderStatusCard error:', error)
    return (
      <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 text-center">
        <p className="text-gray-500">0</p>
      </div>
    )
  }
}

// Sales Chart
function SalesChart({ data }) {
  try {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return (
        <div className="text-center text-gray-500 py-16">
          <FiTrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No sales data available yet</p>
          <p className="text-sm text-gray-400 mt-2">Data will appear once you have delivered orders</p>
        </div>
      )
    }

    const maxSales = Math.max(...data.map(d => d?.sales || 0))

    return (
      <div className="space-y-6">
        <div className="flex items-end justify-between space-x-3 h-72">
          {data.map((item, index) => {
            const sales = item?.sales || 0
            const height = maxSales > 0 ? (sales / maxSales) * 100 : 0
            return (
              <div key={index} className="flex flex-col items-center flex-1 group">
                <div className="relative w-full flex items-end justify-center h-64">
                  <div
                    className="bg-gradient-to-t from-green-600 to-emerald-400 hover:from-green-700 hover:to-emerald-500 rounded-t-xl transition-all duration-300 w-full cursor-pointer shadow-lg relative overflow-hidden"
                    style={{ height: `${height}%`, minHeight: sales > 0 ? '20px' : '0' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-lg whitespace-nowrap shadow-xl z-10">
                      ₹{sales.toLocaleString()}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-700 mt-4 font-semibold">{item?.month || 'N/A'}</span>
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600 font-medium">Net Revenue Trend (After Commission)</span>
          <span className="font-bold text-lg text-gray-900">
            Total: ₹{data.reduce((sum, d) => sum + (d?.sales || 0), 0).toLocaleString()}
          </span>
        </div>
      </div>
    )
  } catch (error) {
    console.error('SalesChart error:', error)
    return (
      <div className="text-center text-gray-500 py-16">
        <p>Unable to display chart</p>
      </div>
    )
  }
}

// Top Products
function TopProducts({ products }) {
  try {
    if (!products || !Array.isArray(products) || products.length === 0) {
      return (
        <div className="text-center text-gray-500 py-16">
          <FiAward className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No product sales yet</p>
          <p className="text-sm text-gray-400 mt-2">Your top products will appear here</p>
        </div>
      )
    }

    const colors = ['from-blue-500 to-blue-600', 'from-purple-500 to-purple-600', 'from-pink-500 to-pink-600', 'from-orange-500 to-orange-600', 'from-green-500 to-green-600']

    return (
      <div className="space-y-3">
        {products.map((product, index) => {
          if (!product) return null
          return (
            <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300">
              <div className="flex items-center space-x-4 flex-1">
                <div className={`w-12 h-12 bg-gradient-to-br ${colors[index % colors.length]} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{product?.name || 'Unknown Product'}</p>
                  <p className="text-sm text-gray-600 font-medium">{product?.sales || 0} units sold</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl text-gray-900">₹{(product?.revenue || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-500 font-medium">Net Revenue</p>
              </div>
            </div>
          )
        })}
      </div>
    )
  } catch (error) {
    console.error('TopProducts error:', error)
    return (
      <div className="text-center text-gray-500 py-16">
        <p>Unable to display products</p>
      </div>
    )
  }
}

// Low Stock Card
function LowStockCard({ product }) {
  try {
    if (!product) return null
    
    return (
      <div className="flex items-center space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg hover:shadow-md transition-all">
        {product?.image ? (
          <img src={product.image} alt={product?.name || 'Product'} className="w-12 h-12 object-cover rounded-lg" />
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
            <FiPackage className="w-6 h-6 text-gray-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate text-sm">{product?.name || 'Unknown Product'}</p>
          <p className="text-xs text-orange-700 font-bold">
            {product?.stock || 0} left (threshold: {product?.threshold || 0})
          </p>
        </div>
      </div>
    )
  } catch (error) {
    console.error('LowStockCard error:', error)
    return null
  }
}

// Performance Card
function PerformanceCard({ icon: Icon, title, value, subtitle, color }) {
  try {
    const colorClasses = {
      green: 'from-green-500 to-emerald-600',
      blue: 'from-blue-500 to-cyan-600',
      purple: 'from-purple-500 to-pink-600'
    }

    const bgClasses = {
      green: 'from-green-50 to-emerald-50 border-green-200',
      blue: 'from-blue-50 to-cyan-50 border-blue-200',
      purple: 'from-purple-50 to-pink-50 border-purple-200'
    }

    return (
      <div className={`text-center p-8 bg-gradient-to-br ${bgClasses[color] || 'from-gray-50 to-gray-100 border-gray-200'} rounded-2xl border-2 hover:shadow-xl transition-all duration-300`}>
        <div className={`w-20 h-20 bg-gradient-to-br ${colorClasses[color] || 'from-gray-500 to-gray-600'} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
          <Icon className="w-10 h-10 text-white" />
        </div>
        <p className="text-sm text-gray-600 font-semibold mb-2">{title || 'N/A'}</p>
        <p className="text-4xl font-bold text-gray-900 mb-2">{value || '0'}</p>
        <p className="text-xs text-gray-500 font-medium">{subtitle || ''}</p>
      </div>
    )
  } catch (error) {
    console.error('PerformanceCard error:', error)
    return (
      <div className="text-center p-8 bg-gray-50 rounded-2xl border-2 border-gray-200">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }
}

// Recent Orders Table
function RecentOrdersTable({ orders }) {
  try {
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return (
        <div className="p-16 text-center text-gray-500">
          <FiClipboard className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-semibold">No recent orders</p>
          <p className="text-sm">Orders will appear here once customers start purchasing</p>
        </div>
      )
    }

    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      processing: 'bg-blue-100 text-blue-800 border-blue-300',
      shipped: 'bg-purple-100 text-purple-800 border-purple-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      returned: 'bg-orange-100 text-orange-800 border-orange-300'
    }

    const paymentColors = {
      pending: 'text-yellow-700',
      paid: 'text-green-700',
      failed: 'text-red-700',
      refunded: 'text-gray-700'
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Items</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Payment</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order, index) => {
              if (!order) return null
              return (
                <tr key={order?.orderId || index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    #{order?.orderId || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order?.customer || 'Guest'}</p>
                      <p className="text-xs text-gray-500">{order?.customerEmail || ''}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                    {order?.items || 0} item{order?.items > 1 ? 's' : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    ₹{(order?.amount || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-xs font-semibold ${paymentColors[order?.paymentStatus] || 'text-gray-700'}`}>
                      {(order?.paymentStatus || 'pending').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1.5 inline-flex text-xs font-bold rounded-lg border ${statusColors[order?.status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
                      {(order?.status || 'pending').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                    {order?.date ? new Date(order.date).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    }) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      href={`/seller/orders/${order?.id || ''}`}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center space-x-1"
                    >
                      <FiEye className="w-4 h-4" />
                      <span>View</span>
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  } catch (error) {
    console.error('RecentOrdersTable error:', error)
    return (
      <div className="p-16 text-center text-gray-500">
        <p>Unable to display orders</p>
      </div>
    )
  }
}
