// app/seller/(seller)/integrations/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
  FiLink,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiSettings,
  FiShoppingBag,
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'

export default function IntegrationsPage() {
  const { token } = useAuth()
  const [integrations, setIntegrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState(null)

  const availablePlatforms = [
    { id: 'shopify', name: 'Shopify', icon: '🛍️', color: 'green' },
    { id: 'woocommerce', name: 'WooCommerce', icon: '🔌', color: 'purple' },
    { id: 'magento', name: 'Magento', icon: '🏪', color: 'orange' },
    { id: 'bigcommerce', name: 'BigCommerce', icon: '🛒', color: 'blue' },
  ]

  useEffect(() => {
    if (token) fetchIntegrations()
  }, [token])

  async function fetchIntegrations() {
    try {
      setLoading(true)
      const res = await axios.get('/api/seller/integrations', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success) {
        setIntegrations(res.data.integrations || [])
      }
    } catch (error) {
      console.error('Error fetching integrations:', error)
      toast.error('Failed to load integrations')
    } finally {
      setLoading(false)
    }
  }

  async function syncIntegration(id) {
    try {
      toast.loading('Syncing...')
      const res = await axios.post(`/api/seller/integrations/${id}/sync`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.dismiss()
      if (res.data.success) {
        toast.success('Sync completed')
        fetchIntegrations()
      }
    } catch (error) {
      toast.dismiss()
      toast.error('Sync failed')
    }
  }

  async function disconnectIntegration(id) {
    if (!confirm('Are you sure you want to disconnect this integration?')) return

    try {
      const res = await axios.delete(`/api/seller/integrations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success) {
        toast.success('Integration disconnected')
        fetchIntegrations()
      }
    } catch (error) {
      toast.error('Failed to disconnect')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold">🔌 External Integrations</h1>
        <p className="mt-2 text-green-100">Connect and sync with other platforms</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<FiLink />}
          label="Connected Platforms"
          value={integrations.filter(i => i.status === 'active').length}
          color="green"
        />
        <StatCard
          icon={<FiRefreshCw />}
          label="Last Synced"
          value={integrations[0]?.lastSyncAt ? new Date(integrations[0].lastSyncAt).toLocaleDateString() : 'Never'}
          color="blue"
        />
        <StatCard
          icon={<FiShoppingBag />}
          label="Products Synced"
          value={integrations.reduce((sum, i) => sum + (i.syncedProducts || 0), 0)}
          color="purple"
        />
      </div>

      {/* Available Platforms */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Platforms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {availablePlatforms.map((platform) => {
            const integration = integrations.find(i => i.platform === platform.id)
            return (
              <PlatformCard
                key={platform.id}
                platform={platform}
                integration={integration}
                onConnect={() => {
                  setSelectedPlatform(platform)
                  setShowModal(true)
                }}
                onSync={() => syncIntegration(integration._id)}
                onDisconnect={() => disconnectIntegration(integration._id)}
              />
            )
          })}
        </div>
      </div>

      {/* Connected Integrations */}
      {integrations.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connected Integrations</h2>
          <div className="space-y-4">
            {integrations.map((integration) => (
              <IntegrationCard
                key={integration._id}
                integration={integration}
                onSync={() => syncIntegration(integration._id)}
                onDisconnect={() => disconnectIntegration(integration._id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Connect Modal */}
      {showModal && selectedPlatform && (
        <ConnectModal
          platform={selectedPlatform}
          onClose={() => {
            setShowModal(false)
            setSelectedPlatform(null)
          }}
          onSuccess={() => {
            setShowModal(false)
            setSelectedPlatform(null)
            fetchIntegrations()
          }}
          token={token}
        />
      )}
    </div>
  )
}

function PlatformCard({ platform, integration, onConnect, onSync, onDisconnect }) {
  const isConnected = !!integration

  const colorClasses = {
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-violet-500',
    orange: 'from-orange-500 to-amber-500',
    blue: 'from-blue-500 to-cyan-500',
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 text-center hover:shadow-lg transition-all">
      <div className={`w-16 h-16 bg-gradient-to-br ${colorClasses[platform.color]} rounded-full flex items-center justify-center text-4xl mx-auto mb-3`}>
        {platform.icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{platform.name}</h3>
      
      {isConnected ? (
        <div className="space-y-2">
          <div className="flex items-center justify-center space-x-1 text-green-600 text-sm">
            <FiCheckCircle className="w-4 h-4" />
            <span>Connected</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onSync}
              className="flex-1 px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200"
            >
              Sync
            </button>
            <button
              onClick={onDisconnect}
              className="flex-1 px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200"
            >
              Disconnect
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onConnect}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
        >
          Connect
        </button>
      )}
    </div>
  )
}

function IntegrationCard({ integration, onSync, onDisconnect }) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 capitalize">{integration.platform}</h3>
          <p className="text-sm text-gray-600">{integration.storeName}</p>
        </div>
        <div className="flex items-center space-x-2">
          {integration.status === 'active' ? (
            <FiCheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <FiXCircle className="w-6 h-6 text-red-600" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center">
          <p className="text-xs text-gray-500">Sync Frequency</p>
          <p className="text-sm font-bold text-gray-900 capitalize">{integration.syncFrequency}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Products Synced</p>
          <p className="text-sm font-bold text-gray-900">{integration.syncedProducts || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Last Sync</p>
          <p className="text-sm font-bold text-gray-900">
            {integration.lastSyncAt ? new Date(integration.lastSyncAt).toLocaleDateString() : 'Never'}
          </p>
        </div>
      </div>

      <div className="flex space-x-3 mt-4">
        <button
          onClick={onSync}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FiRefreshCw className="w-4 h-4" />
          <span>Sync Now</span>
        </button>
        <button
          onClick={onDisconnect}
          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
        >
          Disconnect
        </button>
      </div>
    </div>
  )
}

function ConnectModal({ platform, onClose, onSuccess, token }) {
  const [formData, setFormData] = useState({
    platform: platform.id,
    storeName: '',
    apiKey: '',
    apiSecret: '',
    storeUrl: '',
    syncFrequency: 'hourly'
  })

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const res = await axios.post('/api/seller/integrations', formData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.data.success) {
        toast.success('Integration connected')
        onSuccess()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to connect')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 rounded-t-xl">
          <h2 className="text-2xl font-bold">Connect {platform.name}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input
            type="text"
            placeholder="Store Name *"
            value={formData.storeName}
            onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="url"
            placeholder="Store URL *"
            value={formData.storeUrl}
            onChange={(e) => setFormData({ ...formData, storeUrl: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="text"
            placeholder="API Key *"
            value={formData.apiKey}
            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            required
          />
          <input
            type="password"
            placeholder="API Secret *"
            value={formData.apiSecret}
            onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            required
          />
          <select
            value={formData.syncFrequency}
            onChange={(e) => setFormData({ ...formData, syncFrequency: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="realtime">Real-time</option>
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="manual">Manual</option>
          </select>

          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              Connect
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <div className="text-2xl">{icon}</div>
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}
