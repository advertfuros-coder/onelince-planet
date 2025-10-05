// app/(admin)/analytics/page.jsx - FIXED VERSION with Null Checks
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
  FiDollarSign,
  FiShoppingCart,
  FiUsers,
  FiPackage,
  FiTrendingUp,
  FiTrendingDown,
  FiStar,
  FiZap,
  FiAlertCircle,
  FiTarget,
  FiRefreshCw,
  FiMapPin,
  FiClock,
  FiPercent,
  FiBarChart2,
  FiActivity,
  FiAward,
  FiShoppingBag,
  FiTruck,
} from 'react-icons/fi'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Treemap,
  ScatterChart,
  Scatter,
} from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316']

export default function AdminAnalyticsPage() {
  const { token } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [predictions, setPredictions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingPredictions, setLoadingPredictions] = useState(false)
  const [period, setPeriod] = useState('30')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (token) fetchAnalytics()
  }, [token, period])

  async function fetchAnalytics(predict = false) {
    try {
      if (predict) setLoadingPredictions(true)
      else setLoading(true)

      const res = await axios.get(`/api/admin/analytics?period=${period}&predict=${predict}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.success) {
        setAnalytics(res.data.analytics)
        if (res.data.predictions) {
          setPredictions(res.data.predictions)
        }
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
      setLoadingPredictions(false)
    }
  }

  const formatCurrency = (value) => `₹${(value || 0).toLocaleString('en-IN')}`
  const formatPercent = (value) => `${(value || 0).toFixed(1)}%`

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-700 font-semibold">Loading Analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) return null

  const { overview, charts, regional, pricing, customers, products, conversion } = analytics

  // Safe array access helpers
  const safeSlice = (arr, start, end) => (Array.isArray(arr) ? arr.slice(start, end) : [])

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">📊 Advanced Analytics Dashboard</h1>
            <p className="mt-2 text-blue-100">Comprehensive business intelligence with AI-powered insights</p>
          </div>
          <div className="flex space-x-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg border border-white/30 focus:ring-2 focus:ring-white/50"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">Last Year</option>
            </select>
            <button
              onClick={() => fetchAnalytics(true)}
              disabled={loadingPredictions}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 font-semibold shadow-lg"
            >
              {loadingPredictions ? (
                <>
                  <FiRefreshCw className="animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <FiZap />
                  <span>AI Predictions</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
        <div className="flex space-x-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: FiBarChart2 },
            { id: 'regional', label: 'Regional', icon: FiMapPin },
            { id: 'pricing', label: 'Pricing', icon: FiDollarSign },
            { id: 'customers', label: 'Customers', icon: FiUsers },
            { id: 'products', label: 'Products', icon: FiPackage },
            { id: 'time', label: 'Time Analysis', icon: FiClock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Total Revenue"
          value={formatCurrency(overview.totalRevenue)}
          change={overview.revenueGrowth}
          icon={<FiDollarSign />}
          color="text-green-600"
          bgColor="bg-green-50"
          gradient="from-green-400 to-green-600"
        />
        <MetricCard
          label="Total Orders"
          value={overview.totalOrders}
          change={overview.orderGrowth}
          icon={<FiShoppingCart />}
          color="text-blue-600"
          bgColor="bg-blue-50"
          gradient="from-blue-400 to-blue-600"
        />
        <MetricCard
          label="Average Order Value"
          value={formatCurrency(overview.avgOrderValue)}
          icon={<FiTrendingUp />}
          color="text-purple-600"
          bgColor="bg-purple-50"
          gradient="from-purple-400 to-purple-600"
        />
        <MetricCard
          label="Conversion Rate"
          value={formatPercent(overview.conversionRate)}
          icon={<FiTarget />}
          color="text-orange-600"
          bgColor="bg-orange-50"
          gradient="from-orange-400 to-orange-600"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <MiniMetric label="Customers" value={overview.totalCustomers} icon={<FiUsers />} color="text-blue-600" />
        <MiniMetric label="Products" value={overview.activeProducts} icon={<FiPackage />} color="text-green-600" />
        <MiniMetric label="Retention" value={formatPercent(overview.customerRetentionRate)} icon={<FiAward />} color="text-purple-600" />
        <MiniMetric label="Avg Rating" value={`${overview.averageRating.toFixed(1)}/5`} icon={<FiStar />} color="text-yellow-600" />
        <MiniMetric label="Cart Size" value={`${overview.avgCartSize.toFixed(1)} items`} icon={<FiShoppingBag />} color="text-pink-600" />
        <MiniMetric label="Sellers" value={overview.totalSellers} icon={<FiTruck />} color="text-indigo-600" />
      </div>

      {/* AI Predictions */}
      {predictions && (
        <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-xl border-2 border-purple-200 p-8 shadow-xl">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg">
              <FiZap className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI-Powered Business Insights</h2>
              <p className="text-sm text-gray-600 mt-1">Generated by Google Gemini 2.5 Flash • Advanced Analytics</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PredictionCard
              title="Revenue Forecast"
              icon={<FiDollarSign />}
              color="text-green-600"
              bgColor="bg-green-50"
              content={predictions.revenueForecast}
            />
            
            {predictions.regionalInsights && (
              <PredictionCard
                title="Regional Strategy"
                icon={<FiMapPin />}
                color="text-blue-600"
                bgColor="bg-blue-50"
                content={predictions.regionalInsights}
                isList
              />
            )}

            {predictions.pricingStrategy && (
              <PredictionCard
                title="Pricing Optimization"
                icon={<FiPercent />}
                color="text-purple-600"
                bgColor="bg-purple-50"
                content={predictions.pricingStrategy}
                isList
              />
            )}

            <PredictionCard
              title="Risk Assessment"
              icon={<FiAlertCircle />}
              color="text-red-600"
              bgColor="bg-red-50"
              content={predictions.riskAssessment}
              isList
            />

            <PredictionCard
              title="Growth Opportunities"
              icon={<FiTrendingUp />}
              color="text-green-600"
              bgColor="bg-green-50"
              content={predictions.growthOpportunities}
              isList
            />

            <PredictionCard
              title="Customer Behavior"
              icon={<FiUsers />}
              color="text-indigo-600"
              bgColor="bg-indigo-50"
              content={predictions.customerInsights}
              isList
            />

            <PredictionCard
              title="Product Strategy"
              icon={<FiPackage />}
              color="text-orange-600"
              bgColor="bg-orange-50"
              content={predictions.productStrategy}
              isList
            />

            <PredictionCard
              title="Marketing Strategies"
              icon={<FiActivity />}
              color="text-pink-600"
              bgColor="bg-pink-50"
              content={predictions.marketingSuggestions}
              isList
            />
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="📈 Revenue Trend" subtitle="Daily revenue and order volume">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={safeSlice(charts.revenueByDate, 0, 100)}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="_id" stroke="#6b7280" />
                <YAxis yAxisId="left" stroke="#6b7280" />
                <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#3B82F6" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                <Bar yAxisId="right" dataKey="orders" fill="#10B981" name="Orders" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="📊 Orders by Status" subtitle="Order distribution analysis">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={safeSlice(charts.ordersByStatus, 0, 100)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, count }) => `${_id}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {safeSlice(charts.ordersByStatus, 0, 100).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="🏆 Top Selling Products" subtitle="Best performers by volume">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={safeSlice(charts.topProducts, 0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="productDetails.name" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="totalSold" fill="#10B981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="📦 Product Categories" subtitle="Category distribution">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={safeSlice(charts.topCategories, 0, 100)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* Regional Tab */}
      {activeTab === 'regional' && regional && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="🗺️ Revenue by State" subtitle="Top performing regions">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={safeSlice(regional.revenueByRegion, 0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="revenue" fill="#3B82F6" radius={[8, 8, 0, 0]}>
                    {safeSlice(regional.revenueByRegion, 0, 10).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="📍 Orders by Region" subtitle="Regional order distribution">
              <ResponsiveContainer width="100%" height={350}>
                <Treemap
                  data={safeSlice(regional.ordersByRegion, 0, 15).map(r => ({
                    name: `${r._id?.city || 'Unknown'}, ${r._id?.state || 'Unknown'}`,
                    size: r.orders,
                    revenue: r.revenue
                  }))}
                  dataKey="size"
                  stroke="#fff"
                  fill="#8B5CF6"
                >
                  {safeSlice(regional.ordersByRegion, 0, 15).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Treemap>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {regional.ordersByRegion && regional.ordersByRegion.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Regional Performance Table</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Region</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Orders</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Revenue</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">AOV</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {safeSlice(regional.ordersByRegion, 0, 15).map((region, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {region._id?.city || 'Unknown'}, {region._id?.state || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-gray-600">{region.orders}</td>
                        <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                          {formatCurrency(region.revenue)}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-gray-600">
                          {formatCurrency(region.avgOrderValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pricing Tab */}
      {activeTab === 'pricing' && pricing && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {products.profitMarginByProduct && products.profitMarginByProduct.length > 0 && (
              <ChartCard title="💰 Profit Margin by Product" subtitle="Top 15 products by profitability">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={safeSlice(products.profitMarginByProduct, 0, 15)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="_id" type="category" width={120} />
                    <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                    <Bar dataKey="avgMargin" fill="#10B981" radius={[0, 8, 8, 0]}>
                      {safeSlice(products.profitMarginByProduct, 0, 15).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.avgMargin > 40 ? '#10B981' : entry.avgMargin > 20 ? '#F59E0B' : '#EF4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            {pricing.priceRangeDistribution && pricing.priceRangeDistribution.length > 0 && (
              <ChartCard title="💵 Price Range Distribution" subtitle="Sales by price segments">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={safeSlice(pricing.priceRangeDistribution, 0, 100)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3B82F6" name="Orders" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="revenue" fill="#10B981" name="Revenue (₹)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            {pricing.discountEffectiveness && pricing.discountEffectiveness.length > 0 && (
              <ChartCard title="🎁 Discount Effectiveness" subtitle="Impact of discounts on sales">
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={safeSlice(pricing.discountEffectiveness, 0, 100)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" label={{ value: 'Discount %', position: 'insideBottom', offset: -5 }} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="orders" fill="#8B5CF6" name="Orders" />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="Revenue" />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            {pricing.productPricingAnalysis && pricing.productPricingAnalysis.length > 0 && (
              <ChartCard title="📊 Pricing Analysis" subtitle="Product pricing insights">
                <ResponsiveContainer width="100%" height={350}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="totalSold" name="Units Sold" />
                    <YAxis dataKey="avgSellingPrice" name="Price" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Products" data={safeSlice(pricing.productPricingAnalysis, 0, 30)} fill="#3B82F6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </ChartCard>
            )}
          </div>

          {pricing.productPricingAnalysis && pricing.productPricingAnalysis.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">💎 Product Pricing Strategy</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Product</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Avg Price</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Sold</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Revenue</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Margin %</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {safeSlice(pricing.productPricingAnalysis, 0, 20).map((product, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                        <td className="px-6 py-4 text-sm text-right text-gray-600">
                          {formatCurrency(product.avgSellingPrice)}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-gray-600">{product.totalSold}</td>
                        <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                          {formatCurrency(product.revenue)}
                        </td>
                        <td className="px-6 py-4 text-sm text-right">
                          <span className={`font-semibold ${
                            product.profitMargin > 40 ? 'text-green-600' :
                            product.profitMargin > 20 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {product.profitMargin?.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {product.profitMargin < 20 ? (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold">
                              Increase Price
                            </span>
                          ) : product.profitMargin > 40 ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                              Optimal
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">
                              Monitor
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && customers && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InsightBox
              title="New Customers"
              value={customers.newCustomers}
              subtitle="In selected period"
              color="text-blue-600"
              bgColor="bg-blue-50"
              icon={<FiUsers />}
            />
            <InsightBox
              title="Repeat Customers"
              value={customers.repeatCustomers}
              subtitle={`${formatPercent(customers.retentionRate)} retention`}
              color="text-green-600"
              bgColor="bg-green-50"
              icon={<FiAward />}
            />
            <InsightBox
              title="Avg CLV"
              value={formatCurrency(overview.avgOrderValue * 2.5)}
              subtitle="Estimated lifetime value"
              color="text-purple-600"
              bgColor="bg-purple-50"
              icon={<FiDollarSign />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {customers.customersByValue && customers.customersByValue.length > 0 && (
              <ChartCard title="💎 Customer Segmentation by Value" subtitle="Distribution by spending">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={safeSlice(customers.customersByValue, 0, 100)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="customers" fill="#8B5CF6" name="Customers" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            {customers.customersByFrequency && customers.customersByFrequency.length > 0 && (
              <ChartCard title="🔄 Purchase Frequency" subtitle="Customer order patterns">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={safeSlice(customers.customersByFrequency, 0, 100)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" label={{ value: 'Number of Orders', position: 'insideBottom', offset: -5 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="customers" fill="#10B981" name="Customers" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            )}
          </div>

          {customers.customerLifetimeValue && customers.customerLifetimeValue.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🏆 Top Customers by Lifetime Value</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Rank</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Total Spent</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Orders</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">AOV</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Est. CLV</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Segment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {safeSlice(customers.customerLifetimeValue, 0, 20).map((customer, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">#{idx + 1}</td>
                        <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                          {formatCurrency(customer.totalSpent)}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-gray-600">{customer.orderCount}</td>
                        <td className="px-6 py-4 text-sm text-right text-gray-600">
                          {formatCurrency(customer.avgOrderValue)}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-semibold text-purple-600">
                          {formatCurrency(customer.clv)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {customer.totalSpent > 25000 ? (
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                              VIP
                            </span>
                          ) : customer.totalSpent > 10000 ? (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                              Premium
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                              Regular
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && products && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InsightBox
              title="Fast Moving Products"
              value={products.fastMovingProducts?.length || 0}
              subtitle="High velocity items"
              color="text-green-600"
              bgColor="bg-green-50"
              icon={<FiTrendingUp />}
            />
            <InsightBox
              title="Slow Moving Products"
              value={products.slowMovingProducts?.length || 0}
              subtitle="Need attention"
              color="text-yellow-600"
              bgColor="bg-yellow-50"
              icon={<FiAlertCircle />}
            />
            <InsightBox
              title="Out of Stock"
              value={products.outOfStockProducts?.length || 0}
              subtitle="Restock required"
              color="text-red-600"
              bgColor="bg-red-50"
              icon={<FiPackage />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {products.fastMovingProducts && products.fastMovingProducts.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🔥 Fast Moving Products</h3>
                <div className="space-y-3">
                  {safeSlice(products.fastMovingProducts, 0, 10).map((product, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-green-600">#{idx + 1}</span>
                        <div>
                          <p className="font-semibold text-gray-900">{product.product?.name || 'Unknown Product'}</p>
                          <p className="text-sm text-gray-600">{product.quantitySold} units sold</p>
                        </div>
                      </div>
                      <span className="font-bold text-green-600">{formatCurrency(product.revenue)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {products.slowMovingProducts && products.slowMovingProducts.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">❄️ Slow Moving Products</h3>
                <div className="space-y-3">
                  {safeSlice(products.slowMovingProducts, 0, 10).map((product, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-yellow-600">⚠️</span>
                        <div>
                          <p className="font-semibold text-gray-900">{product.product?.name || 'Unknown Product'}</p>
                          <p className="text-sm text-gray-600">Only {product.quantitySold} sold</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                        Action Needed
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {products.profitMarginByProduct && products.profitMarginByProduct.length > 0 && (
            <ChartCard title="💰 Product Profitability Analysis" subtitle="Top 20 by profit margin">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={safeSlice(products.profitMarginByProduct, 0, 20)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" angle={-45} textAnchor="end" height={120} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalProfit" fill="#10B981" name="Total Profit (₹)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="avgMargin" fill="#8B5CF6" name="Margin %" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      )}

      {/* Time Analysis Tab */}
      {activeTab === 'time' && charts && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {charts.ordersByHour && charts.ordersByHour.length > 0 && (
              <ChartCard title="⏰ Orders by Hour of Day" subtitle="Peak ordering times">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={safeSlice(charts.ordersByHour, 0, 100)}>
                    <defs>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" label={{ value: 'Hour', position: 'insideBottom', offset: -5 }} />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="orders" stroke="#3B82F6" fillOpacity={1} fill="url(#colorOrders)" />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            {charts.ordersByDayOfWeek && charts.ordersByDayOfWeek.length > 0 && (
              <ChartCard title="📅 Orders by Day of Week" subtitle="Weekly patterns">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={safeSlice(charts.ordersByDayOfWeek, 0, 100).map(d => ({
                    ...d,
                    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d._id - 1] || d._id
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#10B981" radius={[8, 8, 0, 0]}>
                      {safeSlice(charts.ordersByDayOfWeek, 0, 100).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            {charts.peakSeasonAnalysis && charts.peakSeasonAnalysis.length > 0 && (
              <ChartCard title="📊 Monthly Trends" subtitle="Seasonal analysis">
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={safeSlice(charts.peakSeasonAnalysis, 0, 100)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id.month" label={{ value: 'Month', position: 'insideBottom', offset: -5 }} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="orders" fill="#3B82F6" name="Orders" />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="Revenue" />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            {conversion && conversion.conversionFunnelData && (
              <ChartCard title="🎯 Conversion Funnel" subtitle="Customer journey analytics">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { stage: 'Visitors', count: conversion.conversionFunnelData.visitors },
                    { stage: 'Added to Cart', count: conversion.conversionFunnelData.addedToCart },
                    { stage: 'Checkout', count: conversion.conversionFunnelData.initiatedCheckout },
                    { stage: 'Completed', count: conversion.conversionFunnelData.completed },
                  ]} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="stage" type="category" />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8B5CF6" radius={[0, 8, 8, 0]}>
                      {[0, 1, 2, 3].map((index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper Components (same as before)
function MetricCard({ label, value, change, icon, color, bgColor, gradient }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-4 rounded-xl bg-gradient-to-br ${gradient} shadow-md`}>
          <div className="text-white text-2xl">{icon}</div>
        </div>
        {change !== undefined && (
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full ${change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {change >= 0 ? <FiTrendingUp className="w-4 h-4" /> : <FiTrendingDown className="w-4 h-4" />}
            <span className="text-sm font-bold">{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function MiniMetric({ label, value, icon, color }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3">
        <div className={`${color} text-xl`}>{icon}</div>
        <div>
          <p className="text-xs text-gray-600">{label}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function PredictionCard({ title, icon, color, bgColor, content, isList }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 hover:shadow-xl transition-all hover:border-purple-300">
      <div className="flex items-center space-x-3 mb-4">
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <div className={`${color} text-xl`}>{icon}</div>
        </div>
        <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
      </div>
      {isList && Array.isArray(content) ? (
        <ul className="space-y-3">
          {content.map((item, idx) => (
            <li key={idx} className="text-sm text-gray-700 flex items-start space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="text-blue-600 font-bold mt-0.5">•</span>
              <span className="flex-1">{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">{content}</p>
      )}
    </div>
  )
}

function InsightBox({ title, value, subtitle, color, bgColor, icon }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center space-x-4 mb-3">
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <div className={`${color} text-xl`}>{icon}</div>
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
    </div>
  )
}
