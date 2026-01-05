// app/seller/(seller)/integrations/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import {
  ShoppingBag,
  Zap,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Settings,
  ExternalLink,
  AlertCircle,
  Clock,
  Package,
  TrendingUp,
  Link as LinkIcon,
  Unlink
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

export default function IntegrationsPage() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [shopifyData, setShopifyData] = useState(null)
  const [wooCommerceData, setWooCommerceData] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [syncSettings, setSyncSettings] = useState({
    autoSyncProducts: true,
    autoSyncInventory: true,
    autoSyncOrders: false,
    syncInterval: 'daily'
  })
  const [wooSyncSettings, setWooSyncSettings] = useState({
    autoSyncProducts: true,
    autoSyncInventory: true,
    autoSyncOrders: false,
    syncInterval: 'daily'
  })
  const [amazonData, setAmazonData] = useState(null)
  const [amazonSyncSettings, setAmazonSyncSettings] = useState({
    autoSyncProducts: true,
    autoSyncInventory: true,
    autoSyncOrders: false,
    syncInterval: 'daily'
  })

  useEffect(() => {
    if (token) {
      fetchIntegrationStatus()
    }
  }, [token])

  async function fetchIntegrationStatus() {
    try {
      setLoading(true)

      // Fetch Shopify status
      const shopifyRes = await axios.get('/api/seller/integrations/shopify/status', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (shopifyRes.data.success) {
        setShopifyData(shopifyRes.data.integration)
        if (shopifyRes.data.integration?.syncSettings) {
          setSyncSettings(shopifyRes.data.integration.syncSettings)
        }
      }

      // Fetch WooCommerce status
      const wooRes = await axios.get('/api/seller/integrations/woocommerce/status', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (wooRes.data.success) {
        setWooCommerceData(wooRes.data.integration)
        if (wooRes.data.integration?.syncSettings) {
          setWooSyncSettings(wooRes.data.integration.syncSettings)
        }
      }

      // Fetch Amazon status
      const amazonRes = await axios.get('/api/seller/integrations/amazon/status', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (amazonRes.data.success) {
        setAmazonData(amazonRes.data.integration)
        if (amazonRes.data.integration?.syncSettings) {
          setAmazonSyncSettings(amazonRes.data.integration.syncSettings)
        }
      }
    } catch (error) {
      console.error('Failed to fetch integration status')
    } finally {
      setLoading(false)
    }
  }

  const [showConnectModal, setShowConnectModal] = useState(false)
  const [connectForm, setConnectForm] = useState({
    shopDomain: '',
    accessToken: ''
  })
  const [connecting, setConnecting] = useState(false)

  async function connectShopify() {
    setShowConnectModal(true)
  }

  async function handleConnect() {
    if (!connectForm.shopDomain || !connectForm.accessToken) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setConnecting(true)
      const res = await axios.post('/api/seller/integrations/shopify/connect', connectForm, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        toast.success('Shopify store connected successfully!')
        setShowConnectModal(false)
        setConnectForm({ shopDomain: '', accessToken: '' })
        fetchIntegrationStatus()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to connect Shopify')
    } finally {
      setConnecting(false)
    }
  }

  async function disconnectShopify() {
    if (!confirm('Are you sure you want to disconnect your Shopify store? This will stop all automatic syncing.')) return

    try {
      const res = await axios.delete('/api/seller/integrations/shopify/disconnect', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        toast.success('Shopify store disconnected')
        fetchIntegrationStatus()
      }
    } catch (error) {
      toast.error('Failed to disconnect Shopify')
    }
  }

  async function syncProducts() {
    try {
      setSyncing(true)
      const res = await axios.post('/api/seller/integrations/shopify/sync/products', {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        toast.success(`Successfully synced ${res.data.count} products`)
        fetchIntegrationStatus()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to sync products')
    } finally {
      setSyncing(false)
    }
  }

  async function syncInventory() {
    try {
      setSyncing(true)
      const res = await axios.post('/api/seller/integrations/shopify/sync/inventory', {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        toast.success('Inventory synced successfully')
        fetchIntegrationStatus()
      }
    } catch (error) {
      toast.error('Failed to sync inventory')
    } finally {
      setSyncing(false)
    }
  }

  async function updateSyncSettings() {
    try {
      const res = await axios.put('/api/seller/integrations/shopify/settings', syncSettings, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        toast.success('Sync settings updated')
      }
    } catch (error) {
      toast.error('Failed to update settings')
    }
  }

  // WooCommerce Functions
  const [showWooModal, setShowWooModal] = useState(false)
  const [wooConnectForm, setWooConnectForm] = useState({
    storeUrl: '',
    consumerKey: '',
    consumerSecret: ''
  })

  async function connectWooCommerce() {
    setShowWooModal(true)
  }

  async function handleWooConnect() {
    if (!wooConnectForm.storeUrl || !wooConnectForm.consumerKey || !wooConnectForm.consumerSecret) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setConnecting(true)
      const res = await axios.post('/api/seller/integrations/woocommerce/connect', wooConnectForm, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        toast.success('WooCommerce store connected successfully!')
        setShowWooModal(false)
        setWooConnectForm({ storeUrl: '', consumerKey: '', consumerSecret: '' })
        fetchIntegrationStatus()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to connect WooCommerce')
    } finally {
      setConnecting(false)
    }
  }

  async function disconnectWooCommerce() {
    if (!confirm('Are you sure you want to disconnect your WooCommerce store? This will stop all automatic syncing.')) return

    try {
      const res = await axios.delete('/api/seller/integrations/woocommerce/disconnect', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        toast.success('WooCommerce store disconnected')
        fetchIntegrationStatus()
      }
    } catch (error) {
      toast.error('Failed to disconnect WooCommerce')
    }
  }

  async function syncWooProducts() {
    try {
      setSyncing(true)
      const res = await axios.post('/api/seller/integrations/woocommerce/sync/products', {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        toast.success(`Successfully synced ${res.data.count} products`)
        fetchIntegrationStatus()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to sync products')
    } finally {
      setSyncing(false)
    }
  }

  async function updateWooSyncSettings() {
    try {
      const res = await axios.put('/api/seller/integrations/woocommerce/settings', wooSyncSettings, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        toast.success('Sync settings updated')
      }
    } catch (error) {
      toast.error('Failed to update settings')
    }
  }

  // Amazon Functions
  const [showAmazonModal, setShowAmazonModal] = useState(false)
  const [amazonConnectForm, setAmazonConnectForm] = useState({
    sellerId: '',
    awsAccessKey: '',
    awsSecretKey: '',
    refreshToken: '',
    region: 'us-east-1',
    marketplaceId: 'ATVPDKIKX0DER'
  })

  async function connectAmazon() {
    setShowAmazonModal(true)
  }

  async function handleAmazonConnect() {
    if (!amazonConnectForm.sellerId || !amazonConnectForm.awsAccessKey ||
      !amazonConnectForm.awsSecretKey || !amazonConnectForm.refreshToken) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setConnecting(true)
      const res = await axios.post('/api/seller/integrations/amazon/connect', amazonConnectForm, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        toast.success('Amazon Seller Central connected successfully!')
        setShowAmazonModal(false)
        setAmazonConnectForm({
          sellerId: '',
          awsAccessKey: '',
          awsSecretKey: '',
          refreshToken: '',
          region: 'us-east-1',
          marketplaceId: 'ATVPDKIKX0DER'
        })
        fetchIntegrationStatus()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to connect Amazon')
    } finally {
      setConnecting(false)
    }
  }

  async function disconnectAmazon() {
    if (!confirm('Are you sure you want to disconnect your Amazon Seller Central account? This will stop all automatic syncing.')) return

    try {
      const res = await axios.delete('/api/seller/integrations/amazon/disconnect', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        toast.success('Amazon Seller Central disconnected')
        fetchIntegrationStatus()
      }
    } catch (error) {
      toast.error('Failed to disconnect Amazon')
    }
  }

  async function updateAmazonSyncSettings() {
    try {
      const res = await axios.put('/api/seller/integrations/amazon/settings', amazonSyncSettings, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        toast.success('Sync settings updated')
      }
    } catch (error) {
      toast.error('Failed to update settings')
    }
  }


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-500 font-semibold">Loading Integrations...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8">
      <div className="max-w-[1200px] mx-auto space-y-8">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg">
              <Zap size={18} />
            </div>
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Connected Apps
            </span>
          </div>
          <h1 className="text-4xl font-semibold text-gray-900 tracking-tighter">
            Integrations <span className="text-blue-600">.</span>
          </h1>
          <p className="text-gray-500 font-medium mt-1 text-sm">
            Connect your store with popular platforms to sync products and orders
          </p>
        </div>

        {/* Shopify Integration Card */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100/50 overflow-hidden">
          <div className="p-10">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#96BF48] rounded-2xl flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Shopify</h2>
                  <p className="text-sm text-gray-500 font-medium">
                    Sync products, inventory, and orders from your Shopify store
                  </p>
                </div>
              </div>
              {shopifyData?.isConnected ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full">
                  <CheckCircle2 size={16} />
                  <span className="text-xs font-semibold uppercase">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-full">
                  <XCircle size={16} />
                  <span className="text-xs font-semibold uppercase">Not Connected</span>
                </div>
              )}
            </div>

            {shopifyData?.isConnected ? (
              <>
                {/* Connected State */}
                <div className="space-y-6">
                  {/* Store Info */}
                  <div className="p-6 bg-gray-50 rounded-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                          Store Domain
                        </p>
                        <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          {shopifyData.shopDomain}
                          <a href={`https://${shopifyData.shopDomain}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={14} className="text-blue-600" />
                          </a>
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                          Last Synced
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {shopifyData.lastSyncAt
                            ? new Date(shopifyData.lastSyncAt).toLocaleString()
                            : 'Never'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                          Sync Status
                        </p>
                        <p className="text-sm font-semibold text-emerald-600">Active</p>
                      </div>
                    </div>
                  </div>

                  {/* Sync Settings */}
                  <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Settings size={16} className="text-blue-600" />
                      Sync Settings
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Auto-sync Products</span>
                        <input
                          type="checkbox"
                          checked={syncSettings.autoSyncProducts}
                          onChange={(e) => setSyncSettings({ ...syncSettings, autoSyncProducts: e.target.checked })}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Auto-sync Inventory</span>
                        <input
                          type="checkbox"
                          checked={syncSettings.autoSyncInventory}
                          onChange={(e) => setSyncSettings({ ...syncSettings, autoSyncInventory: e.target.checked })}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Auto-sync Orders</span>
                        <input
                          type="checkbox"
                          checked={syncSettings.autoSyncOrders}
                          onChange={(e) => setSyncSettings({ ...syncSettings, autoSyncOrders: e.target.checked })}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                      <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-2">Sync Frequency</label>
                        <select
                          value={syncSettings.syncInterval}
                          onChange={(e) => setSyncSettings({ ...syncSettings, syncInterval: e.target.value })}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-100"
                        >
                          <option value="hourly">Every Hour</option>
                          <option value="daily">Once Daily</option>
                          <option value="manual">Manual Only</option>
                        </select>
                      </div>
                      <button
                        onClick={updateSyncSettings}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all"
                      >
                        Save Settings
                      </button>
                    </div>
                  </div>

                  {/* Manual Sync Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={syncProducts}
                      disabled={syncing}
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl font-semibold text-sm hover:border-blue-600 hover:bg-blue-50 transition-all disabled:opacity-50"
                    >
                      <Package size={20} className="text-blue-600" />
                      <span>{syncing ? 'Syncing...' : 'Sync Products Now'}</span>
                    </button>
                    <button
                      onClick={syncInventory}
                      disabled={syncing}
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl font-semibold text-sm hover:border-emerald-600 hover:bg-emerald-50 transition-all disabled:opacity-50"
                    >
                      <TrendingUp size={20} className="text-emerald-600" />
                      <span>{syncing ? 'Syncing...' : 'Sync Inventory Now'}</span>
                    </button>
                  </div>

                  {/* Disconnect Button */}
                  <button
                    onClick={disconnectShopify}
                    className="w-full px-6 py-4 bg-rose-50 text-rose-600 rounded-2xl font-semibold text-sm hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Unlink size={18} />
                    Disconnect Shopify Store
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Not Connected State */}
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <LinkIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Shopify Store</h3>
                  <p className="text-gray-500 font-medium mb-8 max-w-md mx-auto">
                    Import your products, sync inventory levels, and manage orders from your Shopify store all in one place.
                  </p>
                  <button
                    onClick={connectShopify}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-[#96BF48] text-white rounded-2xl font-semibold text-sm hover:bg-[#7da83a] transition-all shadow-lg"
                  >
                    <ShoppingBag size={20} />
                    Connect Shopify Store
                  </button>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-100">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">Product Sync</h4>
                    <p className="text-xs text-gray-500">Import all products with images and details</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">Inventory Sync</h4>
                    <p className="text-xs text-gray-500">Keep stock levels updated automatically</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">Save Time</h4>
                    <p className="text-xs text-gray-500">Automated syncing saves hours of manual work</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* WooCommerce Integration Card */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100/50 overflow-hidden">
          <div className="p-10">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#7F54B3] rounded-2xl flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">WooCommerce</h2>
                  <p className="text-sm text-gray-500 font-medium">
                    Sync products and inventory from your WooCommerce store
                  </p>
                </div>
              </div>
              {wooCommerceData?.isConnected ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full">
                  <CheckCircle2 size={16} />
                  <span className="text-xs font-semibold uppercase">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-full">
                  <XCircle size={16} />
                  <span className="text-xs font-semibold uppercase">Not Connected</span>
                </div>
              )}
            </div>

            {wooCommerceData?.isConnected ? (
              <>
                {/* Connected State */}
                <div className="space-y-6">
                  {/* Store Info */}
                  <div className="p-6 bg-gray-50 rounded-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                          Store URL
                        </p>
                        <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          {wooCommerceData.storeUrl}
                          <a href={wooCommerceData.storeUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={14} className="text-purple-600" />
                          </a>
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                          Last Synced
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {wooCommerceData.lastSyncAt
                            ? new Date(wooCommerceData.lastSyncAt).toLocaleString()
                            : 'Never'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                          Sync Status
                        </p>
                        <p className="text-sm font-semibold text-emerald-600">Active</p>
                      </div>
                    </div>
                  </div>

                  {/* Sync Settings */}
                  <div className="p-6 bg-purple-50/50 rounded-2xl border border-purple-100">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Settings size={16} className="text-purple-600" />
                      Sync Settings
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Auto-sync Products</span>
                        <input
                          type="checkbox"
                          checked={wooSyncSettings.autoSyncProducts}
                          onChange={(e) => setWooSyncSettings({ ...wooSyncSettings, autoSyncProducts: e.target.checked })}
                          className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Auto-sync Inventory</span>
                        <input
                          type="checkbox"
                          checked={wooSyncSettings.autoSyncInventory}
                          onChange={(e) => setWooSyncSettings({ ...wooSyncSettings, autoSyncInventory: e.target.checked })}
                          className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Auto-sync Orders</span>
                        <input
                          type="checkbox"
                          checked={wooSyncSettings.autoSyncOrders}
                          onChange={(e) => setWooSyncSettings({ ...wooSyncSettings, autoSyncOrders: e.target.checked })}
                          className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </label>
                      <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-2">Sync Frequency</label>
                        <select
                          value={wooSyncSettings.syncInterval}
                          onChange={(e) => setWooSyncSettings({ ...wooSyncSettings, syncInterval: e.target.value })}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-purple-100"
                        >
                          <option value="hourly">Every Hour</option>
                          <option value="daily">Once Daily</option>
                          <option value="manual">Manual Only</option>
                        </select>
                      </div>
                      <button
                        onClick={updateWooSyncSettings}
                        className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold text-xs uppercase tracking-widest hover:bg-purple-700 transition-all"
                      >
                        Save Settings
                      </button>
                    </div>
                  </div>

                  {/* Manual Sync Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={syncWooProducts}
                      disabled={syncing}
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl font-semibold text-sm hover:border-purple-600 hover:bg-purple-50 transition-all disabled:opacity-50"
                    >
                      <Package size={20} className="text-purple-600" />
                      <span>{syncing ? 'Syncing...' : 'Sync Products Now'}</span>
                    </button>
                    <button
                      disabled={syncing}
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl font-semibold text-sm hover:border-emerald-600 hover:bg-emerald-50 transition-all disabled:opacity-50"
                    >
                      <TrendingUp size={20} className="text-emerald-600" />
                      <span>{syncing ? 'Syncing...' : 'Sync Inventory Now'}</span>
                    </button>
                  </div>

                  {/* Disconnect Button */}
                  <button
                    onClick={disconnectWooCommerce}
                    className="w-full px-6 py-4 bg-rose-50 text-rose-600 rounded-2xl font-semibold text-sm hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Unlink size={18} />
                    Disconnect WooCommerce Store
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Not Connected State */}
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <LinkIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your WooCommerce Store</h3>
                  <p className="text-gray-500 font-medium mb-8 max-w-md mx-auto">
                    Import your products, sync inventory levels, and manage orders from your WooCommerce store.
                  </p>
                  <button
                    onClick={connectWooCommerce}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-[#7F54B3] text-white rounded-2xl font-semibold text-sm hover:bg-[#6a4699] transition-all shadow-lg"
                  >
                    <ShoppingBag size={20} />
                    Connect WooCommerce Store
                  </button>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-100">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Package className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">Product Sync</h4>
                    <p className="text-xs text-gray-500">Import all products with images and details</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">Inventory Sync</h4>
                    <p className="text-xs text-gray-500">Keep stock levels updated automatically</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">Save Time</h4>
                    <p className="text-xs text-gray-500">Automated syncing saves hours of manual work</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Amazon Integration Card */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100/50 overflow-hidden">
          <div className="p-10">
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#FF9900] rounded-2xl flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Amazon Seller Central</h2>
                  <p className="text-sm text-gray-500 font-medium">
                    Sync products and inventory from your Amazon store
                  </p>
                </div>
              </div>
              {amazonData?.isConnected ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full">
                  <CheckCircle2 size={16} />
                  <span className="text-xs font-semibold uppercase">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-full">
                  <XCircle size={16} />
                  <span className="text-xs font-semibold uppercase">Not Connected</span>
                </div>
              )}
            </div>

            {amazonData?.isConnected ? (
              <>
                {/* Connected State */}
                <div className="space-y-6">
                  {/* Store Info */}
                  <div className="p-6 bg-gray-50 rounded-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                          Seller ID
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {amazonData.sellerId}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                          Region
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {amazonData.region?.toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                          Last Synced
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {amazonData.lastSyncAt
                            ? new Date(amazonData.lastSyncAt).toLocaleString()
                            : 'Never'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sync Settings */}
                  <div className="p-6 bg-orange-50/50 rounded-2xl border border-orange-100">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Settings size={16} className="text-orange-600" />
                      Sync Settings
                    </h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Auto-sync Products</span>
                        <input
                          type="checkbox"
                          checked={amazonSyncSettings.autoSyncProducts}
                          onChange={(e) => setAmazonSyncSettings({ ...amazonSyncSettings, autoSyncProducts: e.target.checked })}
                          className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Auto-sync Inventory</span>
                        <input
                          type="checkbox"
                          checked={amazonSyncSettings.autoSyncInventory}
                          onChange={(e) => setAmazonSyncSettings({ ...amazonSyncSettings, autoSyncInventory: e.target.checked })}
                          className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Auto-sync Orders</span>
                        <input
                          type="checkbox"
                          checked={amazonSyncSettings.autoSyncOrders}
                          onChange={(e) => setAmazonSyncSettings({ ...amazonSyncSettings, autoSyncOrders: e.target.checked })}
                          className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                      </label>
                      <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-2">Sync Frequency</label>
                        <select
                          value={amazonSyncSettings.syncInterval}
                          onChange={(e) => setAmazonSyncSettings({ ...amazonSyncSettings, syncInterval: e.target.value })}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-100"
                        >
                          <option value="hourly">Every Hour</option>
                          <option value="daily">Once Daily</option>
                          <option value="manual">Manual Only</option>
                        </select>
                      </div>
                      <button
                        onClick={updateAmazonSyncSettings}
                        className="w-full px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold text-xs uppercase tracking-widest hover:bg-orange-700 transition-all"
                      >
                        Save Settings
                      </button>
                    </div>
                  </div>

                  {/* Disconnect Button */}
                  <button
                    onClick={disconnectAmazon}
                    className="w-full px-6 py-4 bg-rose-50 text-rose-600 rounded-2xl font-semibold text-sm hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Unlink size={18} />
                    Disconnect Amazon Account
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Not Connected State */}
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <LinkIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Amazon Seller Account</h3>
                  <p className="text-gray-500 font-medium mb-8 max-w-md mx-auto">
                    Sync products and inventory from Amazon Seller Central using SP-API credentials.
                  </p>
                  <button
                    onClick={connectAmazon}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-[#FF9900] text-white rounded-2xl font-semibold text-sm hover:bg-[#e68a00] transition-all shadow-lg"
                  >
                    <ShoppingBag size={20} />
                    Connect Amazon Account
                  </button>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-100">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Package className="w-6 h-6 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">Product Sync</h4>
                    <p className="text-xs text-gray-500">Import products with ASINs and details</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">FBA Inventory</h4>
                    <p className="text-xs text-gray-500">Track Fulfillment by Amazon stock</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-1">Multi-Marketplace</h4>
                    <p className="text-xs text-gray-500">Support for US, UK, EU, and more</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Coming Soon Integrations */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100/50 p-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">More Integrations Coming Soon</h2>
          <div className="grid grid-cols-1 gap-6">
            {['eBay'].map((platform) => (
              <div key={platform} className="p-6 bg-gray-50 rounded-2xl text-center opacity-50">
                <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="w-6 h-6 text-gray-400" />
                </div>
                <h4 className="font-semibold text-sm text-gray-900 mb-1">{platform}</h4>
                <p className="text-xs text-gray-500">Coming Soon</p>
              </div>
            ))}
          </div>
        </div>


        {/* Connection Modal */}
        {showConnectModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full overflow-hidden"
            >
              <div className="p-10 bg-gradient-to-br from-[#96BF48]/10 to-blue-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">Connect Shopify Store</h2>
                    <p className="text-sm text-gray-600 mt-2">Enter your Shopify store credentials to sync products and inventory</p>
                  </div>
                  <button
                    onClick={() => setShowConnectModal(false)}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors shadow-sm"
                  >
                    <XCircle size={24} />
                  </button>
                </div>
              </div>

              <div className="p-10 space-y-6">
                {/* Instructions */}
                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                  <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <AlertCircle size={16} />
                    How to Get Your Credentials
                  </h3>
                  <ol className="text-xs text-blue-800 space-y-2 ml-4 list-decimal">
                    <li>Go to your Shopify Admin → <strong>Settings</strong> → <strong>Apps and sales channels</strong></li>
                    <li>Click <strong>Develop apps</strong> → <strong>Create an app</strong></li>
                    <li>Name it: <strong>"Online Planet Integration"</strong></li>
                    <li>Configure Admin API scopes: <strong>read_products, write_products, read_inventory, write_inventory</strong></li>
                    <li>Click <strong>Install app</strong> → <strong>Reveal token once</strong> → Copy it</li>
                  </ol>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Shop Domain
                    </label>
                    <input
                      type="text"
                      placeholder="yourstore.myshopify.com"
                      value={connectForm.shopDomain}
                      onChange={(e) => setConnectForm({ ...connectForm, shopDomain: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-2">Enter your Shopify store URL (e.g., mystore.myshopify.com)</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Admin API Access Token
                    </label>
                    <input
                      type="password"
                      placeholder="shpat_••••••••••••••••••••••••"
                      value={connectForm.accessToken}
                      onChange={(e) => setConnectForm({ ...connectForm, accessToken: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-2">Paste the access token from your Shopify custom app</p>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-xs text-emerald-800 flex items-start gap-2">
                    <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                    <span>Your credentials are encrypted with military-grade AES-256-GCM encryption and stored securely. You can revoke access anytime from your Shopify admin.</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowConnectModal(false)}
                    className="flex-1 px-8 py-4 border-2 border-gray-200 text-gray-600 rounded-2xl font-semibold text-sm hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConnect}
                    disabled={connecting || !connectForm.shopDomain || !connectForm.accessToken}
                    className="flex-1 px-8 py-4 bg-[#96BF48] text-white rounded-2xl font-semibold text-sm hover:bg-[#7da83a] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {connecting ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={18} />
                        Connect Store
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* WooCommerce Connection Modal */}
        {showWooModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full overflow-hidden"
            >
              <div className="p-10 bg-gradient-to-br from-[#7F54B3]/10 to-purple-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">Connect WooCommerce Store</h2>
                    <p className="text-sm text-gray-600 mt-2">Enter your WooCommerce REST API credentials</p>
                  </div>
                  <button
                    onClick={() => setShowWooModal(false)}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors shadow-sm"
                  >
                    <XCircle size={24} />
                  </button>
                </div>
              </div>

              <div className="p-10 space-y-6">
                {/* Instructions */}
                <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100">
                  <h3 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <AlertCircle size={16} />
                    How to Get Your Credentials
                  </h3>
                  <ol className="text-xs text-purple-800 space-y-2 ml-4 list-decimal">
                    <li>Go to WordPress Admin → <strong>WooCommerce</strong> → <strong>Settings</strong></li>
                    <li>Click <strong>Advanced</strong> → <strong>REST API</strong></li>
                    <li>Click <strong>Add key</strong></li>
                    <li>Description: <strong>"Online Planet Integration"</strong></li>
                    <li>Permissions: <strong>Read/Write</strong></li>
                    <li>Click <strong>Generate API key</strong> → Copy both keys</li>
                  </ol>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Store URL</label>
                    <input
                      type="text"
                      placeholder="https://mystore.com"
                      value={wooConnectForm.storeUrl}
                      onChange={(e) => setWooConnectForm({ ...wooConnectForm, storeUrl: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-semibold focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-2">Enter your WooCommerce store URL</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Consumer Key</label>
                    <input
                      type="text"
                      placeholder="ck_xxxxxxxxxxxxx"
                      value={wooConnectForm.consumerKey}
                      onChange={(e) => setWooConnectForm({ ...wooConnectForm, consumerKey: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-mono focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-2">Paste the Consumer Key from WooCommerce</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Consumer Secret</label>
                    <input
                      type="password"
                      placeholder="cs_xxxxxxxxxxxxx"
                      value={wooConnectForm.consumerSecret}
                      onChange={(e) => setWooConnectForm({ ...wooConnectForm, consumerSecret: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-mono focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-2">Paste the Consumer Secret from WooCommerce</p>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-xs text-emerald-800 flex items-start gap-2">
                    <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                    <span>Your credentials are encrypted with AES-256-GCM and stored securely. You can regenerate keys anytime from WooCommerce settings.</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowWooModal(false)}
                    className="flex-1 px-8 py-4 border-2 border-gray-200 text-gray-600 rounded-2xl font-semibold text-sm hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleWooConnect}
                    disabled={connecting || !wooConnectForm.storeUrl || !wooConnectForm.consumerKey || !wooConnectForm.consumerSecret}
                    className="flex-1 px-8 py-4 bg-[#7F54B3] text-white rounded-2xl font-semibold text-sm hover:bg-[#6a4699] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {connecting ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={18} />
                        Connect Store
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Amazon Connection Modal */}
        {showAmazonModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[3rem] shadow-2xl max-w-3xl w-full overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-10 bg-gradient-to-br from-[#FF9900]/10 to-orange-50 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">Connect Amazon Seller Central</h2>
                    <p className="text-sm text-gray-600 mt-2">Enter your SP-API credentials</p>
                  </div>
                  <button
                    onClick={() => setShowAmazonModal(false)}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors shadow-sm"
                  >
                    <XCircle size={24} />
                  </button>
                </div>
              </div>

              <div className="p-10 space-y-6">
                {/* Instructions */}
                <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100">
                  <h3 className="text-sm font-semibold text-orange-900 mb-3 flex items-center gap-2">
                    <AlertCircle size={16} />
                    How to Get Your SP-API Credentials
                  </h3>
                  <ol className="text-xs text-orange-800 space-y-2 ml-4 list-decimal">
                    <li>Register as Amazon Developer at <strong>developer.amazonservices.com</strong></li>
                    <li>Create SP-API application in Developer Console</li>
                    <li>Create IAM user in AWS Console with SP-API permissions</li>
                    <li>Authorize your app to get Refresh Token</li>
                    <li>Copy all credentials below</li>
                  </ol>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Seller ID</label>
                    <input
                      type="text"
                      placeholder="A1BCDEFGHIJK2"
                      value={amazonConnectForm.sellerId}
                      onChange={(e) => setAmazonConnectForm({ ...amazonConnectForm, sellerId: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-2">Your Amazon Seller ID</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">AWS Access Key ID</label>
                    <input
                      type="text"
                      placeholder="AKIAIOSFODNN7EXAMPLE"
                      value={amazonConnectForm.awsAccessKey}
                      onChange={(e) => setAmazonConnectForm({ ...amazonConnectForm, awsAccessKey: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-mono focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-2">From AWS IAM user</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">AWS Secret Access Key</label>
                    <input
                      type="password"
                      placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                      value={amazonConnectForm.awsSecretKey}
                      onChange={(e) => setAmazonConnectForm({ ...amazonConnectForm, awsSecretKey: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-mono focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-2">From AWS IAM user</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">SP-API Refresh Token</label>
                    <input
                      type="password"
                      placeholder="Atzr|IwEBIA..."
                      value={amazonConnectForm.refreshToken}
                      onChange={(e) => setAmazonConnectForm({ ...amazonConnectForm, refreshToken: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-mono focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-2">From app authorization</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">AWS Region</label>
                      <select
                        value={amazonConnectForm.region}
                        onChange={(e) => setAmazonConnectForm({ ...amazonConnectForm, region: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                      >
                        <option value="us-east-1">US East (North America)</option>
                        <option value="eu-west-1">EU West (Europe)</option>
                        <option value="us-west-2">US West</option>
                        <option value="ap-northeast-1">Asia Pacific</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">Marketplace</label>
                      <select
                        value={amazonConnectForm.marketplaceId}
                        onChange={(e) => setAmazonConnectForm({ ...amazonConnectForm, marketplaceId: e.target.value })}
                        className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                      >
                        <option value="ATVPDKIKX0DER">United States</option>
                        <option value="A2EUQ1WTGCTBG2">Canada</option>
                        <option value="A1AM78C64UM0Y8">Mexico</option>
                        <option value="A1F83G8C2ARO7P">United Kingdom</option>
                        <option value="A13V1IB3VIYZZH">France</option>
                        <option value="A1PA6795UKMFR9">Germany</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-xs text-emerald-800 flex items-start gap-2">
                    <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                    <span>Your credentials are encrypted with triple AES-256-GCM encryption. Each credential uses a unique encryption key for maximum security.</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setShowAmazonModal(false)}
                    className="flex-1 px-8 py-4 border-2 border-gray-200 text-gray-600 rounded-2xl font-semibold text-sm hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAmazonConnect}
                    disabled={connecting || !amazonConnectForm.sellerId || !amazonConnectForm.awsAccessKey ||
                      !amazonConnectForm.awsSecretKey || !amazonConnectForm.refreshToken}
                    className="flex-1 px-8 py-4 bg-[#FF9900] text-white rounded-2xl font-semibold text-sm hover:bg-[#e68a00] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {connecting ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={18} />
                        Connect Account
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  )
}
