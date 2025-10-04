// seller/(seller)/settings/page.jsx
'use client'
import { useState, useEffect } from 'react'
import { 
  FaUserCircle,
  FaStore,
  FaBell,
  FaLock,
  FaCreditCard,
  FaSave
} from 'react-icons/fa'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function SellerSettings() {
  const [activeTab, setActiveTab] = useState('profile')
  const [settings, setSettings] = useState({
    profile: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+91-9876543210',
      avatar: null
    },
    store: {
      storeName: 'John\'s Electronics',
      storeDescription: 'Quality electronics at affordable prices',
      storeAddress: '123 Business Street, Mumbai, Maharashtra 400001',
      gstin: '27XXXXX1234X1Z1',
      pan: 'ABCDE1234F'
    },
    notifications: {
      orderNotifications: true,
      paymentNotifications: true,
      reviewNotifications: true,
      promotionalEmails: false,
      smsNotifications: true
    },
    banking: {
      accountNumber: '****1234',
      ifscCode: 'HDFC0001234',
      bankName: 'HDFC Bank',
      accountHolderName: 'John Doe'
    }
  })
  const [loading, setLoading] = useState(false)

  const tabs = [
    { id: 'profile', name: 'Profile', icon: FaUserCircle },
    { id: 'store', name: 'Store Info', icon: FaStore },
    { id: 'notifications', name: 'Notifications', icon: FaBell },
    { id: 'security', name: 'Security', icon: FaLock },
    { id: 'banking', name: 'Banking', icon: FaCreditCard }
  ]

  const handleSave = async () => {
    setLoading(true)
    try {
      // Save settings API call here
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      alert('Settings saved successfully!')
    } catch (error) {
      alert('Error saving settings')
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and store preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-1/4">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:w-3/4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 text-2xl font-semibold">
                      {settings.profile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Change Photo</Button>
                    <p className="text-xs text-gray-500 mt-1">JPG, GIF or PNG. 1MB max.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={settings.profile.name}
                    onChange={(e) => updateSettings('profile', 'name', e.target.value)}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => updateSettings('profile', 'email', e.target.value)}
                  />
                  <Input
                    label="Phone"
                    value={settings.profile.phone}
                    onChange={(e) => updateSettings('profile', 'phone', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Store Tab */}
            {activeTab === 'store' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Store Information</h2>
                
                <div className="space-y-4">
                  <Input
                    label="Store Name"
                    value={settings.store.storeName}
                    onChange={(e) => updateSettings('store', 'storeName', e.target.value)}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Store Description
                    </label>
                    <textarea
                      value={settings.store.storeDescription}
                      onChange={(e) => updateSettings('store', 'storeDescription', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Store Address
                    </label>
                    <textarea
                      value={settings.store.storeAddress}
                      onChange={(e) => updateSettings('store', 'storeAddress', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="GSTIN"
                      value={settings.store.gstin}
                      onChange={(e) => updateSettings('store', 'gstin', e.target.value)}
                    />
                    <Input
                      label="PAN"
                      value={settings.store.pan}
                      onChange={(e) => updateSettings('store', 'pan', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
                
                <div className="space-y-4">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </h3>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => updateSettings('notifications', key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
                
                <div className="space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    placeholder="Enter current password"
                  />
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="Enter new password"
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    placeholder="Confirm new password"
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Add an extra layer of security to your account by enabling two-factor authentication.
                  </p>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
              </div>
            )}

            {/* Banking Tab */}
            {activeTab === 'banking' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Banking Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Account Holder Name"
                    value={settings.banking.accountHolderName}
                    onChange={(e) => updateSettings('banking', 'accountHolderName', e.target.value)}
                  />
                  <Input
                    label="Account Number"
                    value={settings.banking.accountNumber}
                    onChange={(e) => updateSettings('banking', 'accountNumber', e.target.value)}
                  />
                  <Input
                    label="IFSC Code"
                    value={settings.banking.ifscCode}
                    onChange={(e) => updateSettings('banking', 'ifscCode', e.target.value)}
                  />
                  <Input
                    label="Bank Name"
                    value={settings.banking.bankName}
                    onChange={(e) => updateSettings('banking', 'bankName', e.target.value)}
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Bank details are used for payment settlements. 
                    Please ensure all information is accurate to avoid payment delays.
                  </p>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t">
              <Button onClick={handleSave} loading={loading} className="flex items-center space-x-2">
                <FaSave className="w-4 h-4" />
                <span>Save Changes</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
