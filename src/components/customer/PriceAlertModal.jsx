// components/customer/PriceAlertModal.jsx
'use client'

import { useState } from 'react'
import { FiX, FiBell } from 'react-icons/fi'
import axios from 'axios'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from 'react-hot-toast'

export default function PriceAlertModal({ product, onClose }) {
  const { token } = useAuth()
  const [targetPrice, setTargetPrice] = useState('')
  const [loading, setLoading] = useState(false)

  const currentPrice = product.pricing?.salePrice || 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!targetPrice || parseFloat(targetPrice) <= 0) {
      toast.error('Please enter a valid price')
      return
    }

    if (parseFloat(targetPrice) >= currentPrice) {
      toast.error('Target price must be lower than current price')
      return
    }

    try {
      setLoading(true)
      const res = await axios.post(
        '/api/wishlist/price-alert',
        {
          productId: product._id,
          targetPrice: parseFloat(targetPrice)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.data.success) {
        toast.success('Price alert set! We\'ll notify you when the price drops.')
        onClose()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to set price alert')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <FiBell className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Set Price Alert</h2>
            <p className="text-sm text-gray-500">Get notified when price drops</p>
          </div>
        </div>

        {/* Product Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="font-medium text-gray-900 mb-2">{product.name}</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-sm text-gray-500">Current Price:</span>
            <span className="text-xl font-bold text-gray-900">
              ₹{currentPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notify me when price drops to:
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="Enter target price"
                className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            {targetPrice && parseFloat(targetPrice) < currentPrice && (
              <p className="mt-2 text-sm text-green-600">
                You'll save ₹{(currentPrice - parseFloat(targetPrice)).toFixed(2)} ({Math.round(((currentPrice - parseFloat(targetPrice)) / currentPrice) * 100)}% off)
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50"
            >
              {loading ? 'Setting...' : 'Set Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
