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
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 font-semibold">{error}</p>
      </div>
    )
  }

  const { overview, weeklyNewOrders, sellerDistribution, topSellers, topProducts, lowSellingProducts, categoryPerformance, regionalPerformance } = data

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
          value={`₹${parseFloat(overview.totalRevenue).toLocaleString('en-IN')}`}
          icon={<FiDollarSign size={24} />}
          color="bg-green-500"
          trend={`+${overview.orderGrowth}%`}
        />
        <MetricCard
          title="Total Orders"
          value={overview.orders}
          icon={<FiShoppingCart size={24} />}
          color="bg-blue-500"
          subtitle={`${overview.newOrders} this week`}
        />
        <MetricCard
          title="Active Sellers"
          value={overview.activeSellers}
          icon={<FiUsers size={24} />}
          color="bg-purple-500"
          subtitle={`${overview.newSellers} new`}
        />
        <MetricCard
          title="Products Listed"
          value={overview.products}
          icon={<FiBox size={24} />}
          color="bg-orange-500"
          subtitle={`${overview.activeProducts} active`}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <SmallMetricCard title="Avg Order Value" value={`₹${parseFloat(overview.avgOrderValue).toFixed(0)}`} icon={<FiDollarSign />} />
        <SmallMetricCard title="Fulfillment Rate" value={`${overview.fulfillmentRate}%`} icon={<FiCheckCircle />} />
        <SmallMetricCard title="Avg Rating" value={overview.avgRating} icon={<FiStar />} />
        <SmallMetricCard title="Pending Payouts" value={overview.pendingPayouts} icon={<FiAlertCircle />} />
        <SmallMetricCard title="New Customers" value={overview.newCustomers} icon={<FiUserPlus />} />
        <SmallMetricCard title="Repeat Rate" value={`${overview.repeatCustomerRate}%`} icon={<FiActivity />} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Orders Chart */}
        <ChartPanel title="Weekly Order Trends">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyNewOrders}>
              <XAxis dataKey="day" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                cursor={{ fill: 'rgba(40, 116, 240, 0.1)' }}
              />
              <Bar dataKey="orders" fill="#2874f0" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        {/* Seller Distribution */}
        <ChartPanel title="Seller Distribution by Tier">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={sellerDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {sellerDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartPanel>

        {/* Category Performance */}
        <ChartPanel title="Top Categories by Revenue (Last 30 Days)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryPerformance} layout="vertical">
              <XAxis type="number" stroke="#666" />
              <YAxis dataKey="category" type="category" stroke="#666" width={100} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }} />
              <Bar dataKey="revenue" fill="#ff9f00" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        {/* Regional Performance */}
        <ChartPanel title="Top States by Revenue">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={regionalPerformance}>
              <XAxis dataKey="state" stroke="#666" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }} />
              <Bar dataKey="revenue" fill="#388e3c" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Sellers */}
        <TablePanel title="Top Sellers (Last 30 Days)">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Seller</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Orders</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topSellers?.map((seller, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{seller.name}</td>
                  <td className="text-right py-3 px-4">{seller.orderCount}</td>
                  <td className="text-right py-3 px-4 font-semibold text-green-600">₹{seller.revenue.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TablePanel>

        {/* Top Products */}
        <TablePanel title="Top Selling Products (Last 30 Days)">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Qty Sold</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts?.map((product, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{product.name}</td>
                  <td className="text-right py-3 px-4">{product.totalQty}</td>
                  <td className="text-right py-3 px-4 font-semibold text-green-600">₹{product.revenue.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
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

      {/* Order Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard title="Pending Orders" value={overview.pendingOrders} icon={<FiPackage />} color="text-yellow-600" bgColor="bg-yellow-50" />
        <StatusCard title="Completed Orders" value={overview.completedOrders} icon={<FiCheckCircle />} color="text-green-600" bgColor="bg-green-50" />
        <StatusCard title="Cancelled Orders" value={overview.cancelledOrders} icon={<FiXCircle />} color="text-red-600" bgColor="bg-red-50" />
      </div>
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
