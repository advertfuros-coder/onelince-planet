'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/AuthContext'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import {
  FiSave, FiSettings, FiGlobe, FiPhone, FiPercent,
  FiToggleLeft, FiShare2, FiMail, FiCreditCard
} from 'react-icons/fi'

export default function AdminSettingsPage() {
  const { token, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    siteIdentity: { siteName: '', logoUrl: '', description: '' },
    contact: { supportEmail: '', supportPhone: '', address: '' },
    commission: { defaultRate: 0, taxRate: 0 },
    features: { enableSellerRegistration: true, enableReviews: true, maintenanceMode: false },
    socials: { facebook: '', twitter: '', instagram: '', linkedin: '' },
    emailSettings: { smtpHost: '', smtpPort: '', smtpUser: '', smtpPass: '', fromEmail: '', fromName: '' },
    paymentSettings: { razorpayId: '', razorpaySecret: '', stripeKey: '', stripeSecret: '', currency: 'INR' }
  })

  useEffect(() => {
    if (token) fetchSettings()
  }, [token])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await axios.get('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        setFormData(res.data.settings)
      }
    } catch (error) {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await axios.put('/api/admin/settings', formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.success) {
        toast.success('Settings updated successfully')
      }
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading settings...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-600 mt-1">Configure your marketplace global settings</p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : <>
            <FiSave />
            <span>Save Changes</span>
          </>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Site Identity */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <FiGlobe className="text-blue-600 text-xl" />
            <h2 className="text-lg font-bold text-gray-900">Site Identity</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <input
                type="text"
                value={formData.siteIdentity?.siteName || ''}
                onChange={(e) => handleChange('siteIdentity', 'siteName', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.siteIdentity?.description || ''}
                onChange={(e) => handleChange('siteIdentity', 'description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
              <input
                type="text"
                value={formData.siteIdentity?.logoUrl || ''}
                onChange={(e) => handleChange('siteIdentity', 'logoUrl', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Commission & Finance */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <FiPercent className="text-green-600 text-xl" />
            <h2 className="text-lg font-bold text-gray-900">Commission & Tax</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Seller Commission (%)</label>
              <input
                type="number"
                value={formData.commission?.defaultRate || 0}
                onChange={(e) => handleChange('commission', 'defaultRate', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (GST %) </label>
              <input
                type="number"
                value={formData.commission?.taxRate || 0}
                onChange={(e) => handleChange('commission', 'taxRate', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <FiPhone className="text-purple-600 text-xl" />
            <h2 className="text-lg font-bold text-gray-900">Contact Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
              <input
                type="email"
                value={formData.contact?.supportEmail || ''}
                onChange={(e) => handleChange('contact', 'supportEmail', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label>
              <input
                type="text"
                value={formData.contact?.supportPhone || ''}
                onChange={(e) => handleChange('contact', 'supportPhone', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Office Address</label>
              <textarea
                value={formData.contact?.address || ''}
                onChange={(e) => handleChange('contact', 'address', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <FiToggleLeft className="text-orange-600 text-xl" />
            <h2 className="text-lg font-bold text-gray-900">Platform Features</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Allow Seller Registration</span>
              <button
                onClick={() => handleChange('features', 'enableSellerRegistration', !formData.features?.enableSellerRegistration)}
                className={`w-12 h-6 rounded-full transition-colors relative ${formData.features?.enableSellerRegistration ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.features?.enableSellerRegistration ? 'translate-x-6' : ''
                  }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Enable Product Reviews</span>
              <button
                onClick={() => handleChange('features', 'enableReviews', !formData.features?.enableReviews)}
                className={`w-12 h-6 rounded-full transition-colors relative ${formData.features?.enableReviews ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.features?.enableReviews ? 'translate-x-6' : ''
                  }`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Maintenance Mode</span>
              <button
                onClick={() => handleChange('features', 'maintenanceMode', !formData.features?.maintenanceMode)}
                className={`w-12 h-6 rounded-full transition-colors relative ${formData.features?.maintenanceMode ? 'bg-red-600' : 'bg-gray-300'
                  }`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.features?.maintenanceMode ? 'translate-x-6' : ''
                  }`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Email Settings (SMTP) */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <FiMail className="text-red-600 text-xl" />
          <h2 className="text-lg font-bold text-gray-900">Email Configuration</h2>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
              <input
                type="text"
                value={formData.emailSettings?.smtpHost || ''}
                onChange={(e) => handleChange('emailSettings', 'smtpHost', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
              <input
                type="text"
                value={formData.emailSettings?.smtpPort || ''}
                onChange={(e) => handleChange('emailSettings', 'smtpPort', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="587"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={formData.emailSettings?.smtpUser || ''}
                onChange={(e) => handleChange('emailSettings', 'smtpUser', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={formData.emailSettings?.smtpPass || ''}
                onChange={(e) => handleChange('emailSettings', 'smtpPass', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Settings */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <FiCreditCard className="text-indigo-600 text-xl" />
          <h2 className="text-lg font-bold text-gray-900">Payment Gateways</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={formData.paymentSettings?.currency || 'INR'}
              onChange={(e) => handleChange('paymentSettings', 'currency', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="AED">AED</option>
            </select>
          </div>
          <div className="border-t pt-4 mt-2">
            <h3 className="font-semibold mb-2 text-sm text-gray-600">Razorpay</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Key ID</label>
                <input
                  type="text"
                  value={formData.paymentSettings?.razorpayId || ''}
                  onChange={(e) => handleChange('paymentSettings', 'razorpayId', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Key Secret</label>
                <input
                  type="password"
                  value={formData.paymentSettings?.razorpaySecret || ''}
                  onChange={(e) => handleChange('paymentSettings', 'razorpaySecret', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}