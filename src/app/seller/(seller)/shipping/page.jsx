// seller/(seller)/shipping/page.jsx
'use client'
import { useState, useEffect } from 'react'
import {
  FiTruck,
  FiPackage,
  FiMapPin,
  FiPlus,
  FiEdit,
  FiTrash2
} from 'react-icons/fi'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import { useAuth } from '@/lib/context/AuthContext'

export default function SellerShipping() {
  const { user } = useAuth()
  const [shippingRules, setShippingRules] = useState([])
  const [pickupAddress, setPickupAddress] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    // In production, this would load from seller profile
    // For now, showing empty state
    setShippingRules([])
    setPickupAddress(null)
  }, [])

  if (loading) {
    return <div className="p-6">Loading shipping settings...</div>
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipping Settings</h1>
          <p className="text-gray-600">Manage your shipping rules and delivery options</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center space-x-2">
          <FiPlus className="w-4 h-4" />
          <span>Add Shipping Rule</span>
        </Button>
      </div>

      {/* Shipping Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Rules</p>
              <p className="text-2xl font-bold text-gray-900">{shippingRules.filter(r => r.isActive).length}</p>
            </div>
            <FiTruck className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Coverage Areas</p>
              <p className="text-2xl font-bold text-gray-900">All India</p>
            </div>
            <FiMapPin className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Delivery</p>
              <p className="text-2xl font-bold text-gray-900">3-4 Days</p>
            </div>
            <FiPackage className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Shipping Rules */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Shipping Rules</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {shippingRules.length === 0 ? (
            <div className="p-12 text-center">
              <FiTruck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No shipping rules configured</h3>
              <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
                Set up shipping rules to define delivery options, pricing, and zones for your products.
              </p>
              <Button onClick={() => setShowAddForm(true)} className="flex items-center space-x-2 mx-auto">
                <FiPlus className="w-4 h-4" />
                <span>Add Your First Rule</span>
              </Button>
            </div>
          ) : (
            shippingRules.map((rule) => (
              <div key={rule.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{rule.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Conditions:</span>
                        {rule.type === 'weight' ? (
                          <p>Weight: {rule.conditions.minWeight}kg - {rule.conditions.maxWeight}kg</p>
                        ) : (
                          <p>Min Order: {formatPrice(rule.conditions.minOrderValue)}</p>
                        )}
                      </div>

                      <div>
                        <span className="font-medium">Pricing:</span>
                        <p>Base Rate: {formatPrice(rule.pricing.baseRate)}</p>
                        {rule.pricing.freeShippingThreshold && (
                          <p>Free above: {formatPrice(rule.pricing.freeShippingThreshold)}</p>
                        )}
                      </div>

                      <div>
                        <span className="font-medium">Delivery:</span>
                        <p>{rule.deliveryTime}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      <FiEdit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <FiTrash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pickup Address */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pickup Address</h2>
        {pickupAddress ? (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900">{pickupAddress.name}</p>
              <p>{pickupAddress.street}</p>
              <p>{pickupAddress.city}, {pickupAddress.state} {pickupAddress.pincode}</p>
              <p>Phone: {pickupAddress.phone}</p>
            </div>
            <Button variant="outline" size="sm" className="mt-3">
              <FiEdit className="w-4 h-4 mr-1" />
              Edit Address
            </Button>
          </div>
        ) : (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <FiMapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-2">No pickup address set</h3>
            <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
              Add your store or warehouse address where orders will be picked up for delivery.
            </p>
            <Button variant="outline" className="flex items-center space-x-2 mx-auto">
              <FiPlus className="w-4 h-4" />
              <span>Add Pickup Address</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
