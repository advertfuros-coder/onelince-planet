// seller/(seller)/analytics/page.jsx
'use client'
import { useState, useEffect } from 'react'
import {
  FiTrendingUp,
  FiUsers,
  FiShoppingCart,
  FiDollarSign,
  FiCalendar,
  FiDownload
} from 'react-icons/fi'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import DashboardCard from '@/components/seller/DashboardCard'
import AISellerPredictions from '@/components/seller/AISellerPredictions'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import { toast } from 'react-hot-toast'

export default function SellerAnalytics() {
  const { token } = useAuth()
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      conversionRate: 0
    },
    growth: {
      revenue: 0,
      orders: 0,
      avgOrderValue: 0,
      conversionRate: 0
    },
    salesTrend: [],
    topCategories: [],
    customerInsights: {
      newCustomers: 0,
      returningCustomers: 0,
      customerRetentionRate: 0,
      totalCustomers: 0
    }
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30days')

  useEffect(() => {
    if (token) {
      loadAnalytics()
    }
  }, [dateRange, token])

  const loadAnalytics = async () => {
    if (!token) return

    setLoading(true)
    try {
      const response = await axios.get(`/api/seller/analytics?range=${dateRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.data.success) {
        setAnalyticsData(response.data.data)
      } else {
        toast.error('Failed to load analytics')
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const overviewCards = [
    {
      title: 'Total Revenue',
      value: `₹${analyticsData.overview.totalRevenue.toLocaleString()}`,
      icon: FiDollarSign,
      change: `${analyticsData.growth.revenue > 0 ? '+' : ''}${analyticsData.growth.revenue}%`,
      changeType: analyticsData.growth.revenue >= 0 ? 'increase' : 'decrease',
      color: 'green'
    },
    {
      title: 'Total Orders',
      value: analyticsData.overview.totalOrders.toLocaleString(),
      icon: FiShoppingCart,
      change: `${analyticsData.growth.orders > 0 ? '+' : ''}${analyticsData.growth.orders}%`,
      changeType: analyticsData.growth.orders >= 0 ? 'increase' : 'decrease',
      color: 'blue'
    },
    {
      title: 'Avg Order Value',
      value: `₹${analyticsData.overview.avgOrderValue.toLocaleString()}`,
      icon: FiTrendingUp,
      change: `${analyticsData.growth.avgOrderValue > 0 ? '+' : ''}${analyticsData.growth.avgOrderValue}%`,
      changeType: analyticsData.growth.avgOrderValue >= 0 ? 'increase' : 'decrease',
      color: 'purple'
    },
    {
      title: 'Conversion Rate',
      value: `${analyticsData.overview.conversionRate}%`,
      icon: FiUsers,
      change: `${analyticsData.growth.conversionRate > 0 ? '+' : ''}${analyticsData.growth.conversionRate}%`,
      changeType: analyticsData.growth.conversionRate >= 0 ? 'increase' : 'decrease',
      color: 'orange'
    }
  ]

  if (loading) {
    return <div className="p-6">Loading analytics...</div>
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your store performance and insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
          <Button variant="outline" className="flex items-center space-x-2">
            <FiDownload className="w-4 h-4" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((card, index) => (
          <DashboardCard key={index} {...card} />
        ))}
      </div>

      {/* AI Predictions Section */}
      <AISellerPredictions />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">Sales trend chart will be here</p>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h2>
          <div className="space-y-4">
            {analyticsData.topCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{formatPrice(category.revenue)}</span>
                  <span className="text-xs text-gray-500">({category.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Insights */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{analyticsData.customerInsights.newCustomers}</div>
            <div className="text-sm text-gray-600">New Customers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{analyticsData.customerInsights.returningCustomers}</div>
            <div className="text-sm text-gray-600">Returning Customers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{analyticsData.customerInsights.customerRetentionRate}%</div>
            <div className="text-sm text-gray-600">Retention Rate</div>
          </div>
        </div>
      </div>
    </div>
  )
}
