// app/(admin)/marketing/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiPlay,
  FiPause,
  FiDollarSign,
  FiTrendingUp,
  FiTarget,
  FiUsers,
  FiMail,
  FiMessageSquare,
  FiShoppingBag,
  FiX,
  FiCalendar,
  FiBarChart2,
  FiActivity,
  FiAward,
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

const CAMPAIGN_TYPES = [
  { value: 'email', label: 'Email Marketing', icon: FiMail, color: 'blue' },
  { value: 'sms', label: 'SMS Campaign', icon: FiMessageSquare, color: 'green' },
  { value: 'social', label: 'Social Media', icon: FiUsers, color: 'purple' },
  { value: 'google_ads', label: 'Google Ads', icon: FiTarget, color: 'red' },
  { value: 'facebook_ads', label: 'Facebook Ads', icon: FiShoppingBag, color: 'indigo' },
  { value: 'influencer', label: 'Influencer Marketing', icon: FiAward, color: 'pink' },
  { value: 'affiliate', label: 'Affiliate Marketing', icon: FiDollarSign, color: 'orange' },
]

export default function AdminMarketingPage() {
  const { token } = useAuth()
  const [campaigns, setCampaigns] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'email',
    description: '',
    startDate: '',
    endDate: '',
    budget: 0,
    couponCode: '',
    discountPercent: 0,
    targetAudience: {
      location: [],
      interests: [],
    },
    goals: {
      impressions: 0,
      clicks: 0,
      conversions: 0,
    },
  })

  useEffect(() => {
    if (token) fetchCampaigns()
  }, [token])

  async function fetchCampaigns() {
    try {
      setLoading(true)
      const res = await axios.get('/api/admin/marketing', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.success) {
        setCampaigns(res.data.campaigns)
        setStats(res.data.stats)
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  function openCreateModal() {
    setEditingCampaign(null)
    setFormData({
      name: '',
      type: 'email',
      description: '',
      startDate: '',
      endDate: '',
      budget: 0,
      couponCode: '',
      discountPercent: 0,
      targetAudience: { location: [], interests: [] },
      goals: { impressions: 0, clicks: 0, conversions: 0 },
    })
    setShowModal(true)
  }

  function openEditModal(campaign) {
    setEditingCampaign(campaign)
    setFormData({
      name: campaign.name,
      type: campaign.type,
      description: campaign.description || '',
      startDate: campaign.startDate?.substring(0, 10) || '',
      endDate: campaign.endDate?.substring(0, 10) || '',
      budget: campaign.budget || 0,
      couponCode: campaign.couponCode || '',
      discountPercent: campaign.discountPercent || 0,
      targetAudience: campaign.targetAudience || { location: [], interests: [] },
      goals: campaign.goals || { impressions: 0, clicks: 0, conversions: 0 },
    })
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      if (editingCampaign) {
        const res = await axios.put(`/api/admin/marketing/${editingCampaign._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.data.success) {
          toast.success('Campaign updated successfully')
          setShowModal(false)
          fetchCampaigns()
        }
      } else {
        const res = await axios.post('/api/admin/marketing', formData, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.data.success) {
          toast.success('Campaign created successfully')
          setShowModal(false)
          fetchCampaigns()
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save campaign')
    }
  }

  async function handleDelete(campaignId) {
    if (!confirm('Are you sure you want to delete this campaign?')) return

    try {
      const res = await axios.delete(`/api/admin/marketing/${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.data.success) {
        toast.success('Campaign deleted successfully')
        fetchCampaigns()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete campaign')
    }
  }

  async function toggleCampaignStatus(campaignId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'

    try {
      const res = await axios.put(
        `/api/admin/marketing/${campaignId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.data.success) {
        toast.success(`Campaign ${newStatus === 'active' ? 'activated' : 'paused'}`)
        fetchCampaigns()
      }
    } catch (error) {
      toast.error('Failed to update campaign status')
    }
  }

  const formatCurrency = (value) => `₹${(value || 0).toLocaleString('en-IN')}`
  const formatPercent = (value) => `${(value || 0).toFixed(1)}%`

  const campaignsByType = campaigns.reduce((acc, campaign) => {
    acc[campaign.type] = (acc[campaign.type] || 0) + 1
    return acc
  }, {})

  const pieData = Object.entries(campaignsByType).map(([type, count]) => ({
    name: CAMPAIGN_TYPES.find((t) => t.value === type)?.label || type,
    value: count,
  }))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">📢 Marketing Campaigns</h1>
              <p className="mt-2 text-purple-100">Create and manage marketing campaigns across channels</p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center space-x-2 px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 font-semibold shadow-lg"
            >
              <FiPlus />
              <span>New Campaign</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Total Budget"
            value={formatCurrency(stats.totalBudget)}
            icon={<FiDollarSign />}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            label="Total Spent"
            value={formatCurrency(stats.totalSpent)}
            icon={<FiTrendingUp />}
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <StatCard
            label="Return Requests"
            value={stats.returnedOrders || 0}
            icon={<FiAlertCircle />}
            color="text-red-600"
            bgColor="bg-red-50"
            small
          />
          <StatCard
            label="Active Campaigns"
            value={stats.activeCampaigns}
            icon={<FiActivity />}
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
          <StatCard
            label="Overall ROI"
            value={formatPercent(stats.overallROI)}
            icon={<FiBarChart2 />}
            color="text-orange-600"
            bgColor="bg-orange-50"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Campaigns by Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Campaign Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={campaigns.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="performance.revenue" fill="#10B981" name="Revenue" />
                <Bar dataKey="budget" fill="#3B82F6" name="Budget" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {campaigns.length === 0 ? (
            <div className="text-center py-20">
              <FiTarget className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No campaigns yet</p>
              <button
                onClick={openCreateModal}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Create First Campaign
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 p-6">
              {campaigns.map((campaign) => {
                const typeInfo = CAMPAIGN_TYPES.find((t) => t.value === campaign.type)
                const Icon = typeInfo?.icon || FiTarget

                return (
                  <div
                    key={campaign._id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`p-3 bg-${typeInfo?.color || 'blue'}-100 rounded-lg`}>
                          <Icon className={`w-6 h-6 text-${typeInfo?.color || 'blue'}-600`} />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{campaign.name}</h3>
                            <StatusBadge status={campaign.status} />
                          </div>

                          <p className="text-sm text-gray-600 mb-3">{campaign.description}</p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-500">Budget</p>
                              <p className="font-semibold text-gray-900">{formatCurrency(campaign.budget)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Spent</p>
                              <p className="font-semibold text-gray-900">{formatCurrency(campaign.spent)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Revenue</p>
                              <p className="font-semibold text-green-600">
                                {formatCurrency(campaign.performance?.revenue)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">ROI</p>
                              <p className={`font-semibold ${campaign.performance?.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatPercent(campaign.performance?.roi)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <FiCalendar className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-600">
                                {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                              </span>
                            </div>
                            {campaign.couponCode && (
                              <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                                Code: {campaign.couponCode}
                              </div>
                            )}
                          </div>

                          {/* Performance Stats */}
                          {campaign.stats && (
                            <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
                              <div>
                                <p className="text-xs text-gray-500">Impressions</p>
                                <p className="font-semibold text-gray-900">{campaign.stats.impressions?.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Clicks</p>
                                <p className="font-semibold text-gray-900">{campaign.stats.clicks?.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Conversions</p>
                                <p className="font-semibold text-gray-900">{campaign.performance?.orders}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">CVR</p>
                                <p className="font-semibold text-gray-900">{formatPercent(campaign.performance?.conversionRate)}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        {(campaign.status === 'active' || campaign.status === 'paused') && (
                          <button
                            onClick={() => toggleCampaignStatus(campaign._id, campaign.status)}
                            className={`p-2 rounded transition-colors ${campaign.status === 'active'
                                ? 'text-yellow-600 hover:bg-yellow-50'
                                : 'text-green-600 hover:bg-green-50'
                              }`}
                          >
                            {campaign.status === 'active' ? <FiPause /> : <FiPlay />}
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(campaign)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDelete(campaign._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {CAMPAIGN_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget (₹)</label>
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code</label>
                    <input
                      type="text"
                      value={formData.couponCode}
                      onChange={(e) => setFormData({ ...formData, couponCode: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="SUMMER2025"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount %</label>
                    <input
                      type="number"
                      value={formData.discountPercent}
                      onChange={(e) => setFormData({ ...formData, discountPercent: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="col-span-2 border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Campaign Goals</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Target Impressions</label>
                        <input
                          type="number"
                          value={formData.goals.impressions}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              goals: { ...formData.goals, impressions: parseInt(e.target.value) || 0 },
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Target Clicks</label>
                        <input
                          type="number"
                          value={formData.goals.clicks}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              goals: { ...formData.goals, clicks: parseInt(e.target.value) || 0 },
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Target Conversions</label>
                        <input
                          type="number"
                          value={formData.goals.conversions}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              goals: { ...formData.goals, conversions: parseInt(e.target.value) || 0 },
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    {editingCampaign ? 'Update' : 'Create'} Campaign
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function StatCard({ label, value, icon, color, bgColor }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <div className={`${color} text-xl`}>{icon}</div>
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const statusConfig = {
    draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
    active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
    paused: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Paused' },
    completed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
  }

  const config = statusConfig[status] || statusConfig.draft

  return (
    <span className={`px-3 py-1 ${config.bg} ${config.text} rounded-full text-xs font-semibold`}>
      {config.label}
    </span>
  )
}
