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
  FiStar,
  FiPackage,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiAward,
  FiTarget
} from 'react-icons/fi'

export default function SellerDashboard() {
  const { token, user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (token) {
      loadDashboardData()
    }
  }, [token])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Fetching dashboard data...')
      const response = await axios.get('/api/seller/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('📥 Response:', response.data)
      
      if (response.data.success) {
        setDashboardData(response.data.data)
        console.log('✅ Dashboard data loaded successfully')
      } else {
        setError(response.data.message || 'Failed to load dashboard')
      }
    } catch (error) {
      console.error('❌ Error loading dashboard:', error)
      setError(error.response?.data?.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-gray-200 h-40 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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
          onClick={loadDashboardData}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center">
        <FiAlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <p className="text-yellow-800 text-lg font-semibold">No dashboard data available</p>
      </div>
    )
  }

  const { sellerInfo } = dashboardData

  return (
    <div className="space-y-6">
      {/* Welcome Header with Gradient */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-8 rounded-2xl shadow-xl text-white overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute transform rotate-45 -right-20 -top-20 w-60 h-60 bg-white rounded-full"></div>
          <div className="absolute transform -rotate-12 -left-20 -bottom-20 w-40 h-40 bg-white rounded-full"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, {sellerInfo?.storeName || user?.name}! 👋
              </h1>
              <p className="text-blue-100 text-lg">
                Here's your store performance overview
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/20 backdrop-blur-lg rounded-xl px-6 py-4 border border-white/30">
                <p className="text-sm text-blue-100 mb-1">Status</p>
                <div className="flex items-center space-x-2">
                  <FiCheckCircle className="w-5 h-5" />
                  <span className="font-bold text-lg capitalize">
                    {sellerInfo?.verificationStatus || 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickStatCard
              icon={FiStar}
              label="Rating"
              value={`${sellerInfo?.rating?.toFixed(1) || '0.0'} ⭐`}
              subtitle={`${sellerInfo?.totalReviews || 0} reviews`}
            />
            <QuickStatCard
              icon={FiPackage}
              label="Active Products"
              value={dashboardData.activeProducts || 0}
              subtitle={`of ${dashboardData.totalProducts || 0} total`}
            />
            <QuickStatCard
              icon={FiAward}
              label="Plan"
              value={sellerInfo?.subscriptionPlan?.toUpperCase() || 'FREE'}
              subtitle={`${sellerInfo?.commissionRate || 5}% commission`}
            />
            <QuickStatCard
              icon={FiTarget}
              label="Fulfillment"
              value={`${sellerInfo?.performance?.orderFulfillmentRate?.toFixed(0) || 0}%`}
              subtitle="Success rate"
            />
          </div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={dashboardData.totalProducts || 0}
          icon={FiShoppingBag}
          iconColor="from-blue-500 to-blue-600"
          change="+12%"
          changeType="positive"
        />
        <StatCard
          title="Total Orders"
          value={(dashboardData.totalOrders || 0).toLocaleString()}
          icon={FiClipboard}
          iconColor="from-green-500 to-green-600"
          change="+8%"
          changeType="positive"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${(dashboardData.totalRevenue || 0).toLocaleString()}`}
          icon={FiDollarSign}
          iconColor="from-purple-500 to-purple-600"
          change="+15%"
          changeType="positive"
        />
        <StatCard
          title="Total Customers"
          value={(dashboardData.totalCustomers || 0).toLocaleString()}
          icon={FiUsers}
          iconColor="from-orange-500 to-orange-600"
          change="+5%"
          changeType="positive"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <FiTrendingUp className="w-6 h-6 mr-2 text-blue-600" />
              Sales Overview
            </h2>
            <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Last 6 months</option>
              <option>Last 3 months</option>
              <option>This year</option>
            </select>
          </div>
          <SalesChart data={dashboardData.salesData || []} />
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <FiAward className="w-6 h-6 mr-2 text-purple-600" />
            Top Selling Products
          </h2>
          <TopProducts products={dashboardData.topProducts || []} />
        </div>
      </div>

      {/* Performance Metrics */}
      {sellerInfo?.performance && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <FiTarget className="w-6 h-6 mr-2 text-green-600" />
            Performance Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PerformanceCard
              icon={FiCheckCircle}
              title="Order Fulfillment Rate"
              value={`${sellerInfo.performance.orderFulfillmentRate?.toFixed(1) || 0}%`}
              subtitle="Excellent performance"
              color="green"
            />
            <PerformanceCard
              icon={FiClock}
              title="Avg Shipping Time"
              value={`${sellerInfo.performance.avgShippingTime?.toFixed(1) || 0} days`}
              subtitle="Fast delivery"
              color="blue"
            />
            <PerformanceCard
              icon={FiStar}
              title="Customer Satisfaction"
              value={`${sellerInfo.performance.customerSatisfactionScore?.toFixed(1) || 0}/5.0`}
              subtitle="Great service"
              color="purple"
            />
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <FiClipboard className="w-6 h-6 mr-2 text-blue-600" />
              Recent Orders
            </h2>
            <a 
              href="/seller/orders" 
              className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center space-x-1 transition-colors"
            >
              <span>View All Orders</span>
              <FiTrendingUp className="w-4 h-4" />
            </a>
          </div>
        </div>
        <RecentOrders orders={dashboardData.recentOrders || []} />
      </div>
    </div>
  )
}

// Quick Stat Card Component (in header)
function QuickStatCard({ icon: Icon, label, value, subtitle }) {
  return (
    <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 border border-white/30">
      <div className="flex items-center space-x-2 mb-2">
        <Icon className="w-5 h-5" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-xs text-blue-100">{subtitle}</p>
    </div>
  )
}

// Main Stat Card Component
function StatCard({ title, value, icon: Icon, iconColor, change, changeType }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-14 h-14 bg-gradient-to-br ${iconColor} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        {change && (
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${
            changeType === 'positive' 
              ? 'text-green-700 bg-green-100' 
              : 'text-red-700 bg-red-100'
          }`}>
            {change}
          </span>
        )}
      </div>
      <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

// Sales Chart Component
function SalesChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 py-16">No sales data available</div>
  }

  const maxSales = Math.max(...data.map(d => d.sales))

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between space-x-3 h-72">
        {data.map((item, index) => {
          const height = (item.sales / maxSales) * 100
          return (
            <div key={index} className="flex flex-col items-center flex-1 group">
              <div className="relative w-full flex items-end justify-center h-64">
                <div
                  className="bg-gradient-to-t from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 rounded-t-xl transition-all duration-300 w-full cursor-pointer shadow-lg relative overflow-hidden"
                  style={{ height: `${height}%` }}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-lg whitespace-nowrap shadow-xl">
                    ₹{item.sales.toLocaleString()}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                      <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              </div>
              <span className="text-sm text-gray-700 mt-4 font-semibold">{item.month}</span>
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <span className="text-sm text-gray-600 font-medium">Monthly Revenue Trend</span>
        <span className="font-bold text-lg text-gray-900">
          Total: ₹{data.reduce((sum, d) => sum + d.sales, 0).toLocaleString()}
        </span>
      </div>
    </div>
  )
}

// Top Products Component
function TopProducts({ products }) {
  if (!products || products.length === 0) {
    return <div className="text-center text-gray-500 py-16">No product data available</div>
  }

  const colors = ['from-blue-500 to-blue-600', 'from-purple-500 to-purple-600', 'from-pink-500 to-pink-600', 'from-orange-500 to-orange-600', 'from-green-500 to-green-600']

  return (
    <div className="space-y-3">
      {products.map((product, index) => (
        <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center space-x-4 flex-1">
            <div className={`w-12 h-12 bg-gradient-to-br ${colors[index % colors.length]} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
              #{index + 1}
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">{product.name}</p>
              <p className="text-sm text-gray-600 font-medium">{product.sales} units sold</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-xl text-gray-900">₹{product.revenue.toLocaleString()}</p>
            <p className="text-xs text-gray-500 font-medium">Revenue</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// Performance Card Component
function PerformanceCard({ icon: Icon, title, value, subtitle, color }) {
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
    <div className={`text-center p-8 bg-gradient-to-br ${bgClasses[color]} rounded-2xl border-2 hover:shadow-xl transition-all duration-300 hover:scale-105`}>
      <div className={`w-20 h-20 bg-gradient-to-br ${colorClasses[color]} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
        <Icon className="w-10 h-10 text-white" />
      </div>
      <p className="text-sm text-gray-600 font-semibold mb-2">{title}</p>
      <p className="text-4xl font-bold text-gray-900 mb-2">{value}</p>
      <p className="text-xs text-gray-500 font-medium">{subtitle}</p>
    </div>
  )
}

// Recent Orders Component
function RecentOrders({ orders }) {
  if (!orders || orders.length === 0) {
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
    cancelled: 'bg-red-100 text-red-800 border-red-300'
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Order ID</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                #{order.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                {order.customer}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                ₹{order.amount.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1.5 inline-flex text-xs font-bold rounded-lg border ${statusColors[order.status]}`}>
                  {order.status.toUpperCase()}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                {new Date(order.date).toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
