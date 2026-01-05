// app/seller/(seller)/dashboard/page.jsx
'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '@/lib/context/AuthContext'
import { AlertCircle } from 'lucide-react'
import ModernDashboard from '@/components/seller/ModernDashboard'
import AIBusinessCoachWidget from '@/components/seller/AIBusinessCoachWidget'
import AIQuickActions from '@/components/seller/AIQuickActions'
import UsageOverview from '@/components/seller/UsageOverview'

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

  const loadDashboardData = async (showRefresh = false) => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get('/api/seller/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      })

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
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-red-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => loadDashboardData()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1500px] mx-auto">
        <ModernDashboard
          dashboardData={dashboardData}
          loading={loading}
          onRefresh={loadDashboardData}
        />

        <UsageOverview token={token} />


        {/* Optional AI Widgets at bottom or as part of dashboard grid */}
        <div className="px-6 pb-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIBusinessCoachWidget />
          <AIQuickActions />
        </div>
      </div>
    </div>
  )
}
