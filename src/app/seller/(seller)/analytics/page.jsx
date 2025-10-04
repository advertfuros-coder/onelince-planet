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
 
export default function SellerAnalytics() {
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalRevenue: 125680,
      totalOrders: 1247,
      avgOrderValue: 1876,
      conversionRate: 3.2
    },
    salesTrend: [],
    topCategories: [],
    customerInsights: {}
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30days')

  useEffect(() => {
    loadAnalytics()
  }, [dateRange])

  const loadAnalytics = async () => {
    try {
      // Mock analytics data
      setAnalyticsData({
        overview: {
          totalRevenue: 125680,
          totalOrders: 1247,
          avgOrderValue: 1876,
          conversionRate: 3.2
        },
        salesTrend: [
          { date: '2025-09-01', revenue: 4500, orders: 12 },
          { date: '2025-09-02', revenue: 3200, orders: 8 },
          { date: '2025-09-03', revenue: 5600, orders: 15 },
          { date: '2025-09-04', revenue: 2800, orders: 6 }
        ],
        topCategories: [
          { name: 'Electronics', revenue: 45000, percentage: 36 },
          { name: 'Fashion', revenue: 32000, percentage: 25 },
          { name: 'Home & Decor', revenue: 28000, percentage: 22 },
          { name: 'Books', revenue: 20680, percentage: 17 }
        ],
        customerInsights: {
          newCustomers: 156,
          returningCustomers: 89,
          customerRetentionRate: 67
        }
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const overviewCards = [
    {
      title: 'Total Revenue',
      value: `₹${analyticsData.overview.totalRevenue.toLocaleString()}`,
      icon: FiDollarSign,
      change: '+15.3%',
      changeType: 'increase',
      color: 'green'
    },
    {
      title: 'Total Orders',
      value: analyticsData.overview.totalOrders.toLocaleString(),
      icon: FiShoppingCart,
      change: '+8.2%',
      changeType: 'increase',
      color: 'blue'
    },
    {
      title: 'Avg Order Value',
      value: `₹${analyticsData.overview.avgOrderValue.toLocaleString()}`,
      icon: FiTrendingUp,
      change: '+12.1%',
      changeType: 'increase',
      color: 'purple'
    },
    {
      title: 'Conversion Rate',
      value: `${analyticsData.overview.conversionRate}%`,
      icon: FiUsers,
      change: '+0.5%',
      changeType: 'increase',
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
