// app/(admin)/dashboard/page.jsx
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
  FiUsers,
  FiBox,
  FiShoppingCart,
  FiDollarSign,
  FiTrendingUp,
  FiUserPlus,
  FiPackage,
  FiStar,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiActivity,
} from 'react-icons/fi'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts'
import ResponsiveChart from '@/components/admin/ResponsiveChart'
import ResponsiveTable from '@/components/admin/ResponsiveTable'

const COLORS = ['#2874f0', '#ff9f00', '#388e3c', '#f44336', '#9c27b0', '#00bcd4']

export default function AdminDashboard() {
  const { token, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!token) return

    async function fetchDashboard() {
      try {
        setLoading(true)
        const res = await axios.get('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.data.success) {
          setData(res.data)
          setError('')
        } else {
          setError('Failed to load dashboard')
        }
      } catch (err) {
        setError('Error loading dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [token])

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="bg-gray-200 animate-pulse rounded-lg h-24"></div>
        
        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
          ))}
        </div>
        
        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
              <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <FiAlertCircle className="text-red-600" size={24} />
          <p className="text-red-700 font-semibold">Error Loading Dashboard</p>
        </div>
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    )
  }

  // Safe destructuring with defaults
  const overview = data?.dashboard || {}
  const weeklyNewOrders = data?.weeklyNewOrders || []
  const sellerDistribution = data?.sellerDistribution || []
  const topSellers = data?.topSellers || []
  const topProducts = data?.topProducts || []
  const lowSellingProducts = data?.lowSellingProducts || []
  const categoryPerformance = data?.categoryPerformance || []
  const regionalPerformance = data?.regionalPerformance || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'Admin'}!</h1>
        <p className="text-blue-100 mt-1">Here's what's happening with your marketplace today</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`₹${(parseFloat(overview?.totalRevenue) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          icon={<FiDollarSign size={24} />}
          color="bg-green-500"
          trend={overview?.revenueGrowth ? `${overview.revenueGrowth > 0 ? '+' : ''}${parseFloat(overview.revenueGrowth).toFixed(1)}%` : '0%'}
        />
        <MetricCard
          title="Total Orders"
          value={overview?.totalOrders || 0}
          icon={<FiShoppingCart size={24} />}
          color="bg-blue-500"
          subtitle={`${overview?.orderGrowth ? `${overview.orderGrowth > 0 ? '+' : ''}${parseFloat(overview.orderGrowth).toFixed(1)}%` : 'No change'}`}
        />
        <MetricCard
          title="Active Sellers"
          value={overview?.totalSellers || 0}
          icon={<FiUsers size={24} />}
          color="bg-purple-500"
          subtitle={`${overview?.activeProducts || 0} products`}
        />
        <MetricCard
          title="Total Customers"
          value={overview?.totalCustomers || 0}
          icon={<FiUserPlus size={24} />}
          color="bg-orange-500"
          subtitle={overview?.customerGrowth ? `${overview.customerGrowth > 0 ? '+' : ''}${parseFloat(overview.customerGrowth).toFixed(1)}%` : 'No change'}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <SmallMetricCard title="Avg Order Value" value={`₹${(parseFloat(overview?.avgOrderValue) || 0).toFixed(0)}`} icon={<FiDollarSign />} />
        <SmallMetricCard title="Conversion Rate" value={`${(parseFloat(overview?.conversionRate) || 0).toFixed(1)}%`} icon={<FiTrendingUp />} />
        <SmallMetricCard title="Avg Rating" value={(parseFloat(overview?.averageRating) || 0).toFixed(1)} icon={<FiStar />} />
        <SmallMetricCard title="Pending Orders" value={overview?.pendingOrders ||0} icon={<FiPackage />} />
        <SmallMetricCard title="Completed" value={overview?.completedOrders || 0} icon={<FiCheckCircle />} />
        <SmallMetricCard title="Cancelled" value={overview?.cancelledOrders || 0} icon={<FiXCircle />} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Orders Chart */}
        <ChartPanel title="Weekly Order Trends">
          {weeklyNewOrders && weeklyNewOrders.length > 0 ? (
            <ResponsiveChart mobileHeight={240} desktopHeight={280}>
              <BarChart data={weeklyNewOrders}>
                <XAxis dataKey="day" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                  cursor={{ fill: 'rgba(40, 116, 240, 0.1)' }}
                />
                <Bar dataKey="orders" fill="#2874f0" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveChart>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No data available
            </div>
          )}
        </ChartPanel>

        {/* Seller Distribution */}
        <ChartPanel title="Seller Distribution by Tier">
          {sellerDistribution && sellerDistribution.length > 0 ? (
            <ResponsiveChart mobileHeight={240} desktopHeight={280}>
              <PieChart>
                <Pie
                  data={sellerDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {sellerDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveChart>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No seller data available
            </div>
          )}
        </ChartPanel>

        {/* Category Performance */}
        <ChartPanel title="Top Categories by Revenue (Last 30 Days)">
          {categoryPerformance && categoryPerformance.length > 0 ? (
            <ResponsiveChart mobileHeight={240} desktopHeight={280}>
              <BarChart data={categoryPerformance} layout="vertical">
                <XAxis type="number" stroke="#666" fontSize={12} />
                <YAxis dataKey="category" type="category" stroke="#666" width={80} fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }} />
                <Bar dataKey="revenue" fill="#ff9f00" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveChart>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No category data available
            </div>
          )}
        </ChartPanel>

        {/* Regional Performance */}
        <ChartPanel title="Top States by Revenue">
          {regionalPerformance && regionalPerformance.length > 0 ? (
            <ResponsiveChart mobileHeight={260} desktopHeight={280}>
              <BarChart data={regionalPerformance}>
                <XAxis dataKey="state" stroke="#666" angle={-45} textAnchor="end" height={80} fontSize={11} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }} />
                <Bar dataKey="revenue" fill="#388e3c" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveChart>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No regional data available
            </div>
          )}
        </ChartPanel>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Sellers */}
        <TablePanel title="Top Sellers (Last 30 Days)">
          {topSellers && topSellers.length > 0 ? (
            <ResponsiveTable>
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Seller</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Orders</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topSellers.map((seller, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{seller.name}</td>
                      <td className="text-right py-3 px-4">{seller.orderCount}</td>
                      <td className="text-right py-3 px-4 font-semibold text-green-600">₹{seller.revenue.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ResponsiveTable>
          ) : (
            <div className="p-8 text-center text-gray-400">
              No seller data available
            </div>
          )}
        </TablePanel>

        {/* Top Products */}
        <TablePanel title="Top Selling Products (Last 30 Days)">
          {topProducts && topProducts.length > 0 ? (
            <ResponsiveTable>
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Qty Sold</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{product.name}</td>
                      <td className="text-right py-3 px-4">{product.totalQty}</td>
                      <td className="text-right py-3 px-4 font-semibold text-green-600">₹{product.revenue.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ResponsiveTable>
          ) : (
            <div className="p-8 text-center text-gray-400">
              No product data available
            </div>
          )}
        </TablePanel>
      </div>

      {/* Low Selling Products Alert */}
      {lowSellingProducts && lowSellingProducts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FiAlertCircle className="text-yellow-600" size={24} />
            <h3 className="text-lg font-bold text-yellow-800">Low Selling Products Alert</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowSellingProducts.map((product, idx) => (
              <div key={idx} className="bg-white p-4 rounded border">
                <p className="font-medium text-gray-800">{product.name}</p>
                <p className="text-sm text-gray-600 mt-1">Only {product.totalQty} sold in 30 days</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Status Overview - Only show if we have data */}
      {(overview?.pendingOrders || overview?.completedOrders || overview?.cancelledOrders) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatusCard title="Pending Orders" value={overview?.pendingOrders || 0} icon={<FiPackage />} color="text-yellow-600" bgColor="bg-yellow-50" />
          <StatusCard title="Completed Orders" value={overview?.completedOrders || 0} icon={<FiCheckCircle />} color="text-green-600" bgColor="bg-green-50" />
          <StatusCard title="Cancelled Orders" value={overview?.cancelledOrders || 0} icon={<FiXCircle />} color="text-red-600" bgColor="bg-red-50" />
        </div>
      )}
    </div>
  )
}

// === COMPONENT HELPERS ===

function MetricCard({ title, value, icon, color, subtitle, trend }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend && <p className="text-xs text-green-600 font-semibold mt-1">{trend}</p>}
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>{icon}</div>
      </div>
    </div>
  )
}

function SmallMetricCard({ title, value, icon }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
      <div className="flex items-center space-x-3">
        <div className="text-blue-600">{icon}</div>
        <div>
          <p className="text-xs text-gray-600">{title}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

function ChartPanel({ title, children }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
      {children}
    </div>
  )
}

function TablePanel({ title, children }) {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}

function StatusCard({ title, value, icon, color, bgColor }) {
  return (
    <div className={`${bgColor} rounded-lg p-6 border`}>
      <div className="flex items-center space-x-3">
        <div className={`${color} text-2xl`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-700">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
      </div>
    </div>
  )
}
