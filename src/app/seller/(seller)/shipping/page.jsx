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
 
export default function SellerShipping() {
  const [shippingRules, setShippingRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    loadShippingRules()
  }, [])

  const loadShippingRules = async () => {
    try {
      // Mock shipping rules data
      const mockRules = [
        {
          id: '1',
          name: 'Standard Shipping',
          type: 'weight',
          conditions: {
            minWeight: 0,
            maxWeight: 5,
            locations: ['All India']
          },
          pricing: {
            baseRate: 50,
            additionalRate: 10
          },
          deliveryTime: '3-5 business days',
          isActive: true
        },
        {
          id: '2',
          name: 'Express Shipping',
          type: 'value',
          conditions: {
            minOrderValue: 1000,
            locations: ['Metro Cities']
          },
          pricing: {
            baseRate: 150,
            freeShippingThreshold: 2000
          },
          deliveryTime: '1-2 business days',
          isActive: true
        }
      ]
      setShippingRules(mockRules)
    } catch (error) {
      console.error('Error loading shipping rules:', error)
    } finally {
      setLoading(false)
    }
  }

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
          {shippingRules.map((rule) => (
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
          ))}
        </div>
      </div>

      {/* Pickup Address */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pickup Address</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900">Your Store</p>
            <p>123 Business Street</p>
            <p>Mumbai, Maharashtra 400001</p>
            <p>Phone: +91-9876543210</p>
          </div>
          <Button variant="outline" size="sm" className="mt-3">
            <FiEdit className="w-4 h-4 mr-1" />
            Edit Address
          </Button>
        </div>
      </div>
    </div>
  )
}
